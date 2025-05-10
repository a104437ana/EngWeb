var express = require('express');
var router = express.Router();
var Upload = require('../controllers/upload')
var multer = require('multer')
var fs = require('fs')
var jszip = require('jszip')
var xml2js = require('xml2js')

var upload = multer({dest: 'upload/'})

function readManifestFolder(zip, folder, path) {
  const fullPath = path + folder.folder_name + '/';

  fs.mkdir(fullPath, { recursive: true }, (error) => {
    if (error) throw error;
  });

  let files = folder.files?.file || [];
  if (!Array.isArray(files)) files = [files];

  files.forEach(element => {
    const filename = element.filename;
    const checksum = element.checksum;
    const outputPath = fullPath + filename;
    const zipPath = "SIP/" + folder.folder_name + '/' + filename;

    zip.file(zipPath).async('string')
      .then(content => {
        fs.writeFile(outputPath, content, err => {
          if (err) throw err;
          console.log(`Ficheiro ${filename} guardado em ${outputPath}`);
        });
      })
      .catch(err => console.error(`Erro ao ler ${zipPath}:`, err));
  });

  if (folder.directories?.directory) {
    let subfolders = folder.directories.directory;
    if (!Array.isArray(subfolders)) subfolders = [subfolders];

    subfolders.forEach(subfolder => {
      readManifestFolder(zip, subfolder, fullPath);
    });
  }
}

router.get('/:id', function(req, res, next) {
  Upload.findById(req.params.id)
    .then(data => res.status(200).jsonp(data))
    .catch(err => res.status(500).jsonp(err))
});

router.post('/', upload.single('file'), function(req, res, next) {
  const uploadPath = __dirname + '/../' + req.file.path;
  const zipData = fs.readFileSync(req.file.path);

  jszip.loadAsync(zipData)
    .then(zip => {
      console.log('Arquivos no ZIP:', Object.keys(zip.files));

      zip.file('SIP/manifesto-SIP.xml').async('string')
        .then(xmlContent => {
          const parser = new xml2js.Parser({ explicitArray: false });

          parser.parseString(xmlContent, (err, result) => {
            if (err) return res.status(500).jsonp(err);

            const folderName = result.manifesto.folder_name;
            const newPath = __dirname + '/../public/fileStore/' + folderName + '/';

            fs.mkdir(newPath, { recursive: true }, (error) => {
              if (error) return res.status(500).jsonp(error);

              let files = result.manifesto.files?.file || [];
              if (!Array.isArray(files)) files = [files];

              files.forEach(element => {
                const filename = element.filename;
                const checksum = element.checksum;
                const outputPath = newPath + filename;

                zip.file("SIP/" + filename).async('string')
                  .then(content => {
                    fs.writeFile(outputPath, content, err => {
                      if (err) throw err;
                      console.log(`Ficheiro ${filename} gravado em ${outputPath}`);
                    });
                  })
                  .catch(err => res.status(500).jsonp(err));
              });

              let directories = result.manifesto.directories?.directory;
              if (!directories) return;

              if (!Array.isArray(directories)) directories = [directories];

              directories.forEach(dir => {
                readManifestFolder(zip, dir, newPath);
              });

              res.status(201).json('Ficheiros guardados com sucesso');
            });
          });
        })
        .catch(err => res.status(500).jsonp(err));
    })
    .catch(err => res.status(500).jsonp(err));
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
