var mongoose = require('mongoose');
var db = require('./db.js');
var categoryModel = require('./category.js');
var userModel = require('./user.js');

//文章表
var essaySchema = new mongoose.Schema({
   title:  {type: String, require: true},
   content: {type: String, require: true},
   slug:  {type: String, require: true},
   category: {type: mongoose.Schema.Types.ObjectId, ref: 'categories'},
   author: {type:mongoose.Schema.Types.ObjectId, ref:"user"},
   comments: [mongoose.Schema.Types.Mixed],
   published: {type: Boolean, default: false},
   created: {type: Date},
   meta: { type: mongoose.Schema.Types.Mixed }
});

var essayModel = db.model('essay', essaySchema);
module.exports = essayModel;
