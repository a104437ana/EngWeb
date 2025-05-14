var File = require('../models/file')

module.exports.findAll = () => {
    return File
        .find()
        .exec()
}

module.exports.findById = (id) => {
    return File
        .findById(id)
        .exec()
}

module.exports.save = async (file) => {
    var fileDB = new File(file)
    return fileDB.save()
}

module.exports.delete = async (id) => {
    var file = await File
        .findByIdAndDelete(id, {new : true})
        .exec()
}