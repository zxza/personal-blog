var mongoose = require('mongoose');
var db = require('./db.js');

var userSchema = new mongoose.Schema({
 name:  {type: String, require: true},
 email: {type: String, require: true},
 password:  {type: String, require: true},
 created: {type: Date}
});

var userModel = db.model('user', userSchema)

module.exports = userModel;
