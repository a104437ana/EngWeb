var mongoose = require('mongoose')

var uploadSchema = new mongoose.Schema({
    _id : String
}, {versionKey : false})

module.exports = mongoose.model('upload', uploadSchema)