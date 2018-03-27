var express = require("express");
var app = express();
var formidable = require('formidable');
var db = require("../.././model/db.js");
var essayModel = require('../.././model/essay.js');
var userModel = require('../.././model/user.js');
var categoryModel = require('../.././model/category.js');
var moment = require('moment');


exports.showAdmin = function (req, res, next) {
  var sortpar = req.query.sortpar ? req.query.sortpar : 'title';
  var sortdir = req.query.sortdir ? req.query.sortdir : 'desc';

  if (['title', 'category', 'author', 'created', 'published'].indexOf(sortpar) === -1) {
    sortpar = 'title';
  }
  if (['desc', 'asc'].indexOf(sortdir) === -1) {
    sortdir = 'desc'
  }

  var sortEassy = {};
  sortEassy[sortpar] = sortdir;

  essayModel.find({}).sort(sortEassy).populate('author').populate('category').exec(function (err, essays) {
    if(err) return next(err);
    var pageNum = Math.abs(parseInt(req.query.page || 1, 10)) ;
    var pageSize = 4;

    var totalCount = essays.length;
    var pageCount = Math.ceil(totalCount / pageSize);

     if (pageNum > pageCount) {
       pageNum = pageCount;
     }
    // return res.jsonp(essays);
    res.render("admin/essays/index-admin", {
        'sortEassy' : sortEassy,
        'sortpar' : sortpar,
        'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
        'totalCount': totalCount,
        'pageNum' : pageNum,
        'pageCount': pageCount,
        'moment': moment
    });
  })

}

exports.showDelete = function (req, res, next) {
  console.log(req.params)
  essayModel.remove({_id: req.params.id}).exec(function (err, essays) {
    if(err) return next(err);
    // return res.jsonp(essays);
    console.log('文章删除成功');
    // res.redirect('/admin');
    return;
  });

  categoryModel.remove({_id: req.params.id}).exec(function (err, category) {
    if(err) return next(err);
    // return res.jsonp(essays);
    console.log('类别删除成功');
    console.log(req.params);
    res.redirect('/admin/category');
    return;
  })
}



exports.showCategory = function (req, res, next) {
  res.render("admin/category/index", {
    'moment': moment
  });
};


exports.showCategoryAdd = function (req, res, next) {
  res.render("admin/category/add", {
  });
};

exports.PostCategoryAdd = function (req, res, next) {
  var list = req.query.category;
  console.log(list)
  if (list == '') {
    //填写为空
    res.send('-1');
  }
    categoryModel.findOne({},function(err, category) {
      if(err) {
        return next(err);
      }

      var category = new categoryModel({
        name: list,
        created: new Date(),
        slug: list
      })

      category.save(function(err, category) {
        if(err) {
          return next(err);
        }
        res.send('1');
      })
    })
};

exports.CategoryEdit = function(req, res, next) {

  var editId = req.params.id
  console.log(editId)
  categoryModel.findOne({_id: req.params.id}).exec(function (err, category) {
    // if(!req.params.id) return next(new Error('no post id provided'));
    res.render("admin/category/edit", {
      'category' : category
    });
  })
}


exports.PostCategoryEdit = function(req, res, next) {
  var list = req.body.category;
  categoryModel.findOne({_id: req.params.id},function(err, category) {
    if(err) {
      return next(err);
    }
    category.name = list;
    category.save(function(err, category) {
      if(err) {
        return next(err);
      }
      res.send('1');
    })
  })
}


//展示文章添加
exports.showAdminAdd = function (req, res, next) {
    res.render("admin/essays/add",{
    });
};
//文章添加数据库保存
exports.PostAdminAdd = function (req, res, next) {
  var title = req.query.title;
  var content = req.query.content;
  var category = req.query.categorty;

  userModel.findOne({}, function(err, author) {
    categoryModel.findOne({name: category},function(err, category) {
      if(err) {
        return next(err);
      }

      var essay = new essayModel({
        title: title,
        category: category,
        content: content,
        author: author,
        meta: {favorite: 0},
        comments: [],
        created: new Date(),
        slug: title
      })

      essay.save(function(err, essay) {
        if(err) {
          return next(err);
        }
        console.log('文章保存成功');
        res.redirect('/admin');
      })
    })

  })
};

exports.showcategory = function (req, res, next) {

};

exports.saveEdit = function(req, res, next) {
  var title = req.query.title;
  var content = req.query.content;
  var category = req.query.categorty;
  console.log(req.params)

  essayModel.findOne({_id : req.params.id }, function(err, essay) {
    categoryModel.findOne({name: category},function(err, category) {
      if(err) {
        return next(err);
      }
      essay.title = title;
      essay.content = content;
      essay.category = category;
      essay.save(function(err, essay) {
        if(err) {
          return next(err);
        }
        console.log('文章保存成功');
      })
    })
  })
}

exports.showEdit = function (req, res, next) {
  essayModel.findOne({_id: req.params.id}).populate('author').populate('category').exec(function (err, essays) {
    if(!req.params.id) return next(new Error('no post id provided'));
    res.render("admin/essays/edit", {
        'essays': essays
    });
  })
}


exports.showFavorite = function (req, res, next) {

}

exports.showComments = function (req, res, next) {

}

exports.showRegister = function(req, res, next) {
  res.render('admin/register')
}

exports.showLogin = function(req, res, next) {
  res.render('admin/login')
}

exports.checkregister = function (req, res, next) {
  var filedUsername = req.query.username;
  var filedPassword = req.query.password;
  db.find("tests",{"username":filedUsername,"password":filedPassword},function(err,result){
      if(err){
          res.send("-3");  //服务器错误
          return;
      }

      if (result.length != 0) {
          res.send("-1"); //被占用
          return;
      }
      res.send("1");
  });
  next();
}

exports.checklogin = function (req, res, next) {
  var tianxiedeusername = req.query.username;
  var tianxiedepassword = req.query.password;
  db.find("tests",{"username":tianxiedeusername},function(err,result){
      if(result.length == 0){
          res.send("你的登录名写错了，没有这个注册用户");
          return;
      }
      var shujukuzhongdepassword = result[0].password;
      if(shujukuzhongdepassword == tianxiedepassword){
          // req.session.login = "1";
          // req.session.username = result[0].username;
          res.send("成功登陆！你是" + result[0].username);
      }else{
          res.send("密码错误！");
      }
  })
  next();
}
