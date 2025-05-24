var express = require('express');
var router = express.Router();
var Upload = require('../controllers/upload')
var File = require('../controllers/file')
var multer = require('multer')
var fs = require('fs')
var jszip = require('jszip')
var xml2js = require('xml2js')
var path = require('path');
const Auth = require('../auth/auth')

var upload = multer({dest: 'upload/'})

var logStream = fs.createWriteStream(path.join(__dirname, '/../', 'logs.txt'), { flags: 'a' })

async function readManifest(zipPath){
  try{
      const zipData = fs.readFileSync(zipPath);
      const zip = await jszip.loadAsync(zipData);
      const xmlContent = await zip.file('SIP/manifesto-SIP.xml').async('string');
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlContent);
      return { zip, manifestData: result.manifesto };
  }
  catch (err) {
    throw new Error("Erro ao ler o manifesto: " + err.message);
  }
}

async function checkManifestFolder(zip, manifest, path){
  let files = manifest.files?.file || [];
  if (!Array.isArray(files)) files = [files];
  for (const element of files) {
    const filename = element.filename;
    try {
      await zip.file(path + "/" + filename).async('string');
    } catch (err) {
      throw new Error("Manifesto não está de acordo com os ficheiros existentes");
    }
  }
  if (manifest.directories?.directory) {
    let subfolders = manifest.directories.directory;
    if (!Array.isArray(subfolders)) subfolders = [subfolders];
    for (const subfolder of subfolders) {
      await checkManifestFolder(zip, subfolder, path + "/" + subfolder.folder_name);
    }
  }
}

async function saveMetadata(zip, manifest, path){
  const fullPath = path + manifest.folder_name + '/';
  let files = manifest.files?.file || [];
  if (!Array.isArray(files)) files = [files];
  const file_ids_res = []
  for (const element of files) {
    const filename = element.filename;
    const file = {
      path: fullPath + filename,
      title: element.title,
      type: element.type,
      classification: element.classification
    };
    const f = await File.save(file);
    file_ids_res.push(f._id);
  }
  if (manifest.directories?.directory) {
    let subfolders = manifest.directories.directory;
    if (!Array.isArray(subfolders)) subfolders = [subfolders];
    for (const subfolder of subfolders) {
      const files = await saveMetadata(zip, subfolder, path + subfolder.folder_name + '/');
      file_ids_res.push(...files);
    }
  }
  return file_ids_res;
}

async function saveZipFiles(zip, manifest, zipFolderPath, outputFolderPath) {
  const fullOutputPath = outputFolderPath + manifest.folder_name + '/';
  const fullZipPath = zipFolderPath;
  await fs.promises.mkdir(fullOutputPath, { recursive: true });
  let files = manifest.files?.file || [];
  if (!Array.isArray(files)) files = [files];
  for (const element of files) {
    const filename = element.filename;
    const zipFilePath = fullZipPath + '/' + filename;
    const outputPath = fullOutputPath + filename;  
    try {
      const content = await zip.file(zipFilePath).async('string');
      await fs.promises.writeFile(outputPath, content);
      console.log(`Ficheiro ${filename} guardado em ${outputPath}`);
    } catch (err) {
      throw new Error("Erro ao criar ficheiro " + filename);
    }
  }
  if (manifest.directories?.directory) {
    let subfolders = manifest.directories.directory;
    if (!Array.isArray(subfolders)) subfolders = [subfolders];
    for (const subfolder of subfolders) {
      await saveZipFiles(zip, subfolder, zipFolderPath + '/' + subfolder.folder_name, fullOutputPath);
    }
  }
}

router.get('/:id/diary', Auth.validateGetUserDiary, async function(req, res, next) {
  if(req.level=="USER"){
    if(req.user==req.params.id){
      const diary = await Upload.allUserUploads(req.params.id);
      logStream.write(`${new Date.toISOString()}:\n Diário do utilizador ${req.params.id} acedido pelo mesmo.\n`);
      return res.status(200).jsonp(diary);
    }
    else{
      const diary = await Upload.publicUserUploads(req.params.id);
      logStream.write(`${new Date.toISOString()}:\n Diário do utilizador ${req.params.id} acedido pelo utilizador ${req.user}.\n`);
      return res.status(200).jsonp(diary);
    }
  }
  else if (req.level=="ADMIN"){
      const diary = await Upload.allUserUploads(req.params.id);
      logStream.write(`${new Date.toISOString()}:\n Diário do utilizador ${req.params.id} acedido pelo administrador ${req.user}.\n`);
      return res.status(200).jsonp(diary);
  }
  else{
    const diary = await Upload.publicUserUploads(req.params.id);
    logStream.write(`${new Date.toISOString()}:\n Diário do utilizador ${req.params.id} acedido por utilizador público.\n`);
    return res.status(200).jsonp(diary);
  }
});

router.post('/', upload.single('file'), Auth.validate, async function(req, res, next) {
  try {
    const { zip, manifestData } = await readManifest(req.file.path);
    await checkManifestFolder(zip, manifestData, "SIP");
    const file_ids = await saveMetadata(zip, manifestData, __dirname + '/../public/fileStore/');
    var upload = {
      path : __dirname + '/../public/fileStore/' + manifestData.folder_name + '/',
      upload_date : new Date().toISOString(),
      uploaded_by : req.user,
      public : manifestData.public,
      description : manifestData.description,
      files : file_ids
    }
    const data  = await Upload.save(upload);
    const baseZipPath = 'SIP'; 
    const baseOutputPath = __dirname + '/../public/fileStore/';
    await saveZipFiles(zip, manifestData, baseZipPath, baseOutputPath);
    logStream.write(`${data.upload_date.toISOString()}:\n Upload ${data._id} realizado pelo utilizador ${data.uploaded_by}, ficheiros guardados em ${data.path}\n`)
    return res.status(201).jsonp(data)
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', Auth.validateChangeUpload, async function(req, res, next) {
  try {
    const upload = await Upload.delete(req.params.id);
    await fs.promises.rm(upload.path, { recursive: true , force : true})
    logStream.write(`${upload.upload_date.toISOString()}:\n Upload ${upload._id} apagado pelo utilizador ${req.user}\n`)
    return res.status(200).jsonp(upload)
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
