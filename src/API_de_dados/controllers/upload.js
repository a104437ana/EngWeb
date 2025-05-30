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

module.exports.hasUploads = async (id) =>{
    var nUploads = await Upload.countDocuments({uploaded_by : id}).exec();
    return (nUploads>0);
}

module.exports.publicUserUploads = (id) =>{
    return Upload.find({uploaded_by : id, public : true}, '_id upload_date public description').exec();
}

module.exports.allUserUploads = (id) =>{
    return Upload.find({uploaded_by : id}, '_id upload_date public description').exec();
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


module.exports.update = async (id, data) => {
    var old = Upload.findById(id).exec();
    var upload = {
        path : old.path,
        upload_date : old.upload_date,
        uploaded_by : old.uploaded_by,
        public : data.public,
        description : data.description,
        files : old.files
    }
    return Upload
        .findByIdAndUpdate(id, upload, {new : true})
        .exec()
}
