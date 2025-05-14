var mongoose = require('mongoose')

var fileSchema = new mongoose.Schema({
    path : String,
    title : String,
    type : String,
    classification : String
}, {versionKey : false})

module.exports = mongoose.model('file', fileSchema)