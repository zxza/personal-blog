var express = require("express");
var app = express();
var formidable = require('formidable');
var db = require("../.././model/db.js");
var md5 = require("../.././model/md5.js");
var essayModel = require('../.././model/essay.js');
var userModel = require('../.././model/user.js');
var categoryModel = require('../.././model/category.js');
var moment = require('moment');

exports.showAdmin = function (req, res, next) {
  if (req.session.login == "1") {
      //登陆了
      var username = req.session.username;
      var login = true;
  } else {
    //没有登陆
    res.redirect('/register');
    return ;
    var username = "";  //制定一个空用户名
    var login = false;
  }

  userModel.findOne({name : username}, function(err, result) {
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
          'username' : username,
          'login': login,
          'sortEassy' : sortEassy,
          'sortpar' : sortpar,
          'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
          'totalCount': totalCount,
          'pageNum' : pageNum,
          'pageCount': pageCount,
          'moment': moment
      });
    })
  })

}

exports.LoginOut = function(req, res, next) {
  req.session.login = 0;
  res.redirect('/admin');
}

exports.showDelete = function (req, res, next) {
  essayModel.remove({_id: req.params.id}).exec(function (err, essays) {
    if(err) return next(err);
    // return res.jsonp(essays);
    console.log('文章删除成功');
    res.redirect('/admin');
    // res.redirect('/admin');
    return;
  });
}

exports.CategoryDelete = function(req, res, next) {
  categoryModel.remove({_id: req.params.id}).exec(function (err, category) {
    if(err) return next(err);
    // return res.jsonp(essays);
    console.log('类别删除成功');
    res.redirect('/admin/category');
    return;
  })
}


exports.showCategory = function (req, res, next) {
  if (req.session.login == "1") {
      //登陆了
      var username = req.session.username;
      var login = true;
  } else {
    //没有登陆
    res.redirect('/register');
    return ;
    var username = "";  //制定一个空用户名
    var login = false;
  }
  userModel.findOne({name : username}, function(err, result) {
    res.render("admin/category/index", {
      'moment': moment,
      'username': username,
      'login': login
    });
  })
};


exports.showCategoryAdd = function (req, res, next) {
  if (req.session.login == "1") {
      //登陆了
      var username = req.session.username;
      var login = true;
  } else {
    //没有登陆
    res.redirect('/register');
    return ;
    var username = "";  //制定一个空用户名
    var login = false;
  }
  userModel.findOne({name : username}, function(err, result) {
    res.render("admin/category/add", {
      'username': username,
      'login': login
    });
  })

};

exports.PostCategoryAdd = function (req, res, next) {
    var list = req.body.category;
    if (list == '') {
      //填写为空
      res.send('-1');
      return ;
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
  if (req.session.login == "1") {
      //登陆了
      var username = req.session.username;
      var login = true;
  } else {
    //没有登陆
    res.redirect('/register');
    return ;
    var username = "";  //制定一个空用户名
    var login = false;
  }
  userModel.findOne({name : username}, function(err, result) {
    var editId = req.params.id
    console.log(editId)
    categoryModel.findOne({_id: req.params.id}).exec(function (err, category) {
      // if(!req.params.id) return next(new Error('no post id provided'));
      res.render("admin/category/edit", {
        'category' : category,
        'username' : username,
        'login' : login
      });
    })
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
//注册动作
exports.PostRegister = function(req, res, next) {
  var Username = req.body.Username;
  var Password = req.body.Password;
  userModel.findOne({name : Username}, function(err, result) {
    if (err) {
      res.send('-2'); //服务器错误
      return;
    }
    if (result) {
      res.send("-1");  //被占用
      return;
    }
    if (!result) {
      var user = new userModel({
        name: Username,
        password: Password,
        email: '',
        created: new Date(),
      })
      user.save(function(err, user) {
        if(err) {
          return next(err);
        }
        req.session.login = "1";
        req.session.username = Username;
        console.log(req.session)
        res.send("1"); //注册成功，写入session
      })
    }
  })
}
//登陆状态
exports.PostLogin = function(req, res, next) {
  var Username = req.body.Username;
  var Password = req.body.Password;
  userModel.findOne({name : Username}, function(err, result) {
    console.log(result.password);
    var Mpassword = result.password;
    if (err) {
      res.send('-2'); //服务器错误
      return;
    }
    if(Mpassword == Password){
      req.session.login = "1";
      req.session.username = result.name;
      res.send('1'); //登陆成功
    }else{
      res.send('-1');//密码错误
    }
  })
}

//展示文章添加
exports.showAdminAdd = function (req, res, next) {
  if (req.session.login == "1") {
      //登陆了
      var username = req.session.username;
      var login = true;
  } else {
    //没有登陆
    res.redirect('/register');
    return ;
    var username = "";  //制定一个空用户名
    var login = false;
  }
  userModel.findOne({name : username}, function(err, result) {
    res.render("admin/essays/add",{
      'login': login,
      'username': username
    });
  })


};
//文章添加数据库保存
exports.PostAdminAdd = function (req, res, next) {
  var title = req.body.title;
  var content = req.body.content;
  var category = req.body.categorty;

  if (!title) {
    res.send('-1');  //没有标题
    return;
  }
  if (!content) {
    res.send('-2');  //没有文章内容
    return;
  }

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
        res.send('1') //文章保存成功
      })
    })

  })
};

exports.saveEdit = function(req, res, next) {
  var title = req.body.title;
  var content = req.body.content;
  var category = req.body.categorty;
  console.log(req.body)
  if (!title) {
    res.send('-1');  //没有标题
    return;
  }
  if (!content) {
    res.send('-2');  //没有文章内容
    return;
  }



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
        res.send('1') //文章保存成功
      })
    })
  })
}

exports.showEdit = function (req, res, next) {
  if (req.session.login == "1") {
      //登陆了
      var username = req.session.username;
      var login = true;
  } else {
    //没有登陆
    res.redirect('/register');
    return ;
    var username = "";  //制定一个空用户名
    var login = false;
  }
  userModel.findOne({name : username}, function(err, result) {
    essayModel.findOne({_id: req.params.id}).populate('author').populate('category').exec(function (err, essays) {
      if(!req.params.id) return next(new Error('no post id provided'));
      res.render("admin/essays/edit", {
          'essays': essays,
          'login' : login,
          'username': username
      });
    })
  })

}


exports.showRegister = function(req, res, next) {
  res.render('admin/register')
}


exports.showLogin = function(req, res, next) {
  res.render('admin/login')
}
