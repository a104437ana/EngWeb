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

module.exports.update = async (id, data, public) => {
    var old = File.findById(id).exec();
    var file = {
        path : old.path,
        title : data.title,
        type : old.type,
        classification : data.classification,
        uploaded_by : old.uploaded_by,
        public : public
    }
    return File
        .findByIdAndUpdate(id, file, {new : true})
        .exec()
}

module.exports.updateInfo = async (id, info) => {
    var old = File.findById(id).exec();
    var file = {
        path : info.path,
        title : old.title,
        type : info.type,
        classification : old.classification,
        uploaded_by : old.uploaded_by,
        public : old.public
    }
    return File
        .findByIdAndUpdate(id, file, {new : true})
        .exec()
}
