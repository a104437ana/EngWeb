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
      await zip.file(path + "/" + filename).async('nodebuffer');
    } catch (err) {
      throw new Error("Manifesto não está de acordo com os ficheiros existentes");
    }
  }
}

async function saveMetadata(zip, manifest, path, user, public){
  let files = manifest.files?.file || [];
  if (!Array.isArray(files)) files = [files];
  const file_ids_res = []
  for (const element of files) {
    const filename = element.filename;
    let tags = element.tags?.tag || [];
    const file = {
      path: path + filename,
      title: element.title,
      type: element.type,
      tags: tags,
      uploaded_by : user,
      public : public
    };
    const f = await File.save(file);
    file_ids_res.push(f._id);
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
      const content = await zip.file(zipFilePath).async('nodebuffer');
      await fs.promises.writeFile(outputPath, content);
      console.log(`Ficheiro ${filename} guardado em ${outputPath}`);
    } catch (err) {
      throw new Error("Erro ao criar ficheiro " + filename);
    }
  }
}

async function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}

router.get('/diary/:id', Auth.validateGetUserDiary, async function(req, res, next) {
  date = new Date().toISOString();
  if(req.level=="USER"){
    if(req.user==req.params.id){
      const diary = await Upload.allUserUploads(req.params.id);
      logStream.write(`${date}:\n Diário do utilizador ${req.params.id} acedido pelo mesmo.\n`);
      return res.status(200).jsonp(diary);
    }
    else{
      const diary = await Upload.publicUserUploads(req.params.id);
      logStream.write(`${date}:\n Diário do utilizador ${req.params.id} acedido pelo utilizador ${req.user}.\n`);
      return res.status(200).jsonp(diary);
    }
  }
  else if (req.level=="ADMIN"){
      const diary = await Upload.allUserUploads(req.params.id);
      logStream.write(`${date}:\n Diário do utilizador ${req.params.id} acedido pelo administrador ${req.user}.\n`);
      return res.status(200).jsonp(diary);
  }
  else{
    const diary = await Upload.publicUserUploads(req.params.id);
    logStream.write(`${date}:\n Diário do utilizador ${req.params.id} acedido por utilizador público.\n`);
    return res.status(200).jsonp(diary);
  }
});

router.get('/:id', Auth.validateGetUpload, async function(req, res, next) {
  date = new Date().toISOString();
  if(req.level=="USER"){
      const upload = await Upload.findById(req.params.id);
      const upload_info = {
        upload_date : upload.upload_date,
        public : upload.public,
        description : upload.description,
        files : []
      };
      for (const f_id of upload.files) {
        const file = await File.findById(f_id);
        upload_info.files.push({
          id: f_id,
          title: file.title,
          type: file.type,
          tags: file.tags,
          uploaded_by : file.uploaded_by,
          public : file.public
        });
      }
      logStream.write(`${date}:\n Upload ${req.params.id} acedido pelo utilizador ${req.user}.\n`);
      return res.status(200).json(upload_info);

  }
  else if (req.level=="ADMIN"){
      const upload = await Upload.findById(req.params.id);
      const upload_info = {
        upload_date : upload.upload_date,
        public : upload.public,
        description : upload.description,
        files : []
      }
      for (const f_id of upload.files) {
        const file = await File.findById(f_id);
        upload_info.files.push({
          id: f_id,
          title: file.title,
          type: file.type,
          tags: file.tags,
          uploaded_by : file.uploaded_by,
          public : file.public
        });
      }
      logStream.write(`${date}:\n Upload ${req.params.id} acedido pelo administrador ${req.user}.\n`);
      return res.status(200).jsonp(upload_info);
  }
  else{
      const upload = await Upload.findById(req.params.id);
      const upload_info = {
        upload_date : upload.upload_date,
        public : upload.public,
        description : upload.description,
        files : []
      }
      for (const f_id of upload.files) {
        const file = await File.findById(f_id);
        upload_info.files.push({
          id: f_id,
          title: file.title,
          type: file.type,
          tags: file.tags,
          uploaded_by : file.uploaded_by,
          public : file.public
        });
      }
      logStream.write(`${date}:\n Upload ${req.params.id} acedido por utilizador público.\n`);
      return res.status(200).jsonp(upload_info);
  }
});



router.post('/', upload.single('file'), Auth.validate, async function(req, res, next) {
  try {
    const { zip, manifestData } = await readManifest(req.body.file);
    await checkManifestFolder(zip, manifestData, "SIP");
    const file_ids = await saveMetadata(zip, manifestData, __dirname + '/../public/fileStore/' + manifestData.folder_name + '/', req.body.user, manifestData.public);
    var upload = {
      path : __dirname + '/../public/fileStore/' + manifestData.folder_name + '/',
      upload_date : new Date().toISOString(),
      uploaded_by : req.body.user,
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
    res.status(500).json({ error: error });
  }
});

async function insertFile(filePath, fileBuffer, name) {
  const ext = path.extname(name).toLowerCase();
  if (['.apng', '.gif', '.ico', '.cur', '.png', '.jpeg', '.jpg', '.jfif', '.pjpeg', '.pjp', '.svg'].includes(ext)) {
    type = 'image';
  } else if (ext === '.pdf') {
    type = 'pdf';
  } else if (ext === '.txt') {
    type = 'text';
  } else {
    type = 'other';
  }
  const newFilePath = `${filePath}/${name}${ext}`;
  await fs.promises.writeFile(newFilePath, fileBuffer);
  return {
    'path': newFilePath,
    'type': type
  };
}

router.put('/addFile/:id', Auth.validateChangeUpload, multer().single('file'),async function(req, res, next) {
  try {
    const upload = await Upload.findById(req.params.id);
    var file = req.file;
    const f_id = await File.insert({
          title: req.body.title,
          tags : req.body.tags,
          uploaded_by : upload.uploaded_by,
          public : upload.public
    })
    const new_info = await insertFile(upload.path, file.buffer, file.originalname);
    await File.updateInfo(f_id, new_info);
    const u = await Upload.addFile(req.params.id, f_id);
    return res.status(200).json(u);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.put('/:id', Auth.validateChangeUpload, async function(req, res, next) {
  try {
    const date = new Date().toISOString();
    const file_ids = []
    if (req.body.files) {
      const files = Array.isArray(req.body.files) ? req.body.files : Object.values(req.body.files);
      for (const file of files) {
        if (file.id) {
          if (file.delete == 'false'){
            file_ids.push(file.id);
            await File.update(file.id, {
              title: file.title,
              tags: file.tags
            });
          }
          else{
            path = await File.delete(file.id);
            await removeFile(path);
          }
        }
      }
    }
    const upload = await Upload.update(req.params.id, {
      description: req.body.description,
      public: req.body.public === 'true',
      files : file_ids
    });
    logStream.write(`${date}:\n Upload ${upload._id} alterado pelo utilizador ${req.user}\n`);
    return res.status(200).json(upload);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', Auth.validateChangeUpload, async function(req, res, next) {
  try {
    date = new Date().toISOString();
    const upload = await Upload.delete(req.params.id);
    await fs.promises.rm(upload.path, { recursive: true , force : true})
    logStream.write(`${date}:\n Upload ${upload._id} apagado pelo utilizador ${req.user}\n`)
    return res.status(200).jsonp(upload)
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
