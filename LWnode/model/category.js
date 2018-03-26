var mongoose = require('mongoose');
var db = require('./db.js');

var CategorySchema = new mongoose.Schema({
 name:  {type: String, require: true},
 slug:  {type: String, require: true},
 created: {type: Date},
});

var categoryModel = db.model('categories', CategorySchema)

module.exports = categoryModel;
