var express = require('express');
var router = express.Router();
var Upload = require('../controllers/upload')
var File = require('../controllers/file')
var multer = require('multer')
var fs = require('fs')
var jszip = require('jszip')
var xml2js = require('xml2js')

var upload = multer({dest: 'upload/'})

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

router.get('/', function(req, res, next) {
  Upload.findAll()
    .then(data => res.status(200).jsonp(data))
    .catch(err => res.status(500).jsonp(err))
});

router.get('/:id', function(req, res, next) {
  Upload.findById(req.params.id)
    .then(data => res.status(200).jsonp(data))
    .catch(err => res.status(500).jsonp(err))
});

router.post('/', upload.single('file'), async function(req, res, next) {
  try {
    const { zip, manifestData } = await readManifest(req.file.path);
    await checkManifestFolder(zip, manifestData, "SIP");
    const file_ids = await saveMetadata(zip, manifestData, __dirname + '/../public/fileStore/');
    var upload = {
      path : __dirname + '/../public/fileStore/' + manifestData.folder_name + '/',
      upload_date : new Date(),
      uploaded_by : manifestData.user,
      public : manifestData.public,
      description : manifestData.description,
      files : file_ids
    }
    const data  = await Upload.save(upload);
    const baseZipPath = 'SIP'; 
    const baseOutputPath = __dirname + '/../public/fileStore/';
    await saveZipFiles(zip, manifestData, baseZipPath, baseOutputPath);
    return res.status(201).jsonp(data)
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', function(req, res, next) {
  Upload.update(req.params.id, req.body)
    .then(data => res.status(200).jsonp(data))
    .catch(err => res.status(500).jsonp(err))
});

router.delete('/:id', function(req, res, next) {
  Upload.delete(req.params.id, req.body.justificacao)
    .then(data => res.status(200).jsonp(data))
    .catch(err => res.status(500).jsonp(err)) 
});

module.exports = router;
