var jwt = require('jsonwebtoken')
var Upload = require('../controllers/upload')

module.exports.validate = (req, res, next) => {
    var token = req.query.token || req.body.token || req.get('Authorization')
    if(token){
        jwt.verify(token, "EngWeb2025", (err, payload) => {
            if(err) res.status(401).jsonp(err)
            else{
                req.user = payload.user
                next()
            }
        })
    }
    else{
        res.status(401).jsonp({error : "Token inexistente"})
    }
}

module.exports.validateChangeUpload = (req, res, next) => {
    var token = req.query.token || req.body.token || req.get('Authorization')
    if(token){
        jwt.verify(token, "EngWeb2025", (err, payload) => {
            if(err) res.status(401).jsonp(err)
            else{
                const upload = Upload.findById(req.params.id);
                if(upload){
                    if(payload.level == "ADMIN"){
                        req.user = payload.user
                        next()
                    }
                    else if(upload.uploaded_by == payload.user){
                        req.user = payload.user
                        next()
                    }
                    else{
                        res.status(401).jsonp({error : "Utilizador não tem permissão para alterar o upload"})
                    }
                }
                else{
                    res.status(404).jsonp({error : "Upload não existe"})
                }
            }
        })
    }
    else{
        res.status(401).jsonp({error : "Token inexistente"})
    }
}

module.exports.validateGetUserDiary = (req, res, next) => {
    var token = req.query.token || req.body.token || req.get('Authorization')
    if(token){
        jwt.verify(token, "EngWeb2025", (err, payload) => {
            if(err) res.status(401).jsonp(err)
            else{
                const diary = Upload.hasUploads(req.params.id);
                if(diary==true){
                    if(payload.level == "ADMIN"){
                        req.level = "ADMIN"
                        req.user = payload.user
                        next()
                    }
                    else{
                        req.level = "USER"
                        req.user = payload.user
                        next()
                    }
                }
                else{
                    res.status(404).jsonp({error : "Diário não existe"})
                }
            }
        })
    }
    else{
        req.level = "PUBLIC"
        next()
    }
}