var User = require('../models/user')

// Lista de utilizadores
module.exports.list = () => {
    return User
        .find()
        .sort('name')
        .exec()
}

module.exports.getUser = (id) => {
    return User
        .findById(id)
        .exec()
}

module.exports.addUser = (user) => {
    var userDb = new User(user)
    return userDb.save()
}

module.exports.updateUser = (id, data) => {
    return User
        .findByIdAndUpdate(id, data, {new: true})
        .exec()
}

module.exports.updateUserStatus = (id, status) => {
    return User
        .findByIdAndUpdate(id, {active: status}, {new: true})
        .exec()
}

module.exports.updateUserPassword = (id, passport) => {
    return User
        .findByIdAndUpdate(id, {password: password}, {new: true})
        .exec()
}

module.exports.deleteUser = (id) => {
    return User
        .findByIdAndDelete(id, {new: true})
        .exec()
}

module.exports.initAdmin = async () => {
    const adminExists = await User.findOne({ level: 1 });
    if (!adminExists) {
        var date = new Date().toISOString().substring(0, 19)
        await User.register(new User({
            username: "admin",
            name: "admin",
            level: 1,
            active: true,
            dateCreated: date
        }), "admin");
    }
}
