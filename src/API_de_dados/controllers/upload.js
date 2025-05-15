var Upload = require('../models/upload')

module.exports.findAll = () => {
    return Upload
        .find()
        .exec()
}

module.exports.findById = (id) => {
    return Upload
        .findById(id)
        .exec()
}

module.exports.save = async (upload) => {
    var uploadDb = new Upload(upload)
    return uploadDb.save()
}

module.exports.delete = async (id) => {
    var upload = await Upload
        .findByIdAndDelete(id, {new : true})
        .exec()
    return upload;
}