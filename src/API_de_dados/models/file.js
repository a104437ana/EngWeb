var mongoose = require('mongoose')

var fileSchema = new mongoose.Schema({
    path : String,
    title : String,
    type : String,
    classification : String,
    uploaded_by : String,
    public : Boolean
}, {versionKey : false})

module.exports = mongoose.model('file', fileSchema)