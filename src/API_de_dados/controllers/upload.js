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
    var uploads = await Upload.find({_id : upload._id}).exec()

    if(upload.length < 1){
        var uploadDb = new Upload(upload)
        return uploadDb.save()
    }
}

module.exports.update = (id, data) => {
    return Upload
        .findByIdAndUpdate(id, data, {new : true})
        .exec()
}

module.exports.delete = async (id) => {
    var upload = await Upload
        .findByIdAndDelete(id, {new : true})
        .exec()
}