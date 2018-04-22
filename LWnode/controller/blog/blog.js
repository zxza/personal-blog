var express = require("express");
var app = express();
var formidable = require('formidable');
var essayModel = require('../.././model/essay.js');
var categoryModel = require('../.././model/category.js');
var moment = require('moment');

exports.showIndex = function (req, res, next) {
      res.redirect('/essay');
};

//展示文章
exports.showEssays = function (req, res, next) {
    essayModel.find({published: true}).sort('created').populate('author').populate('category').exec(function (err, essays) {
      if(err) return next(err);
      var pageNum = Math.abs(parseInt(req.query.page || 1, 10)) ;
      var pageSize = 4;

      var totalCount = essays.length;
      var pageCount = Math.ceil(totalCount / pageSize);

       if (pageNum > pageCount) {
         pageNum = pageCount;
       }
      // return res.jsonp(essays);
      res.render("blog/index-blog", {
          'title' : '首页',
          'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
          'totalCount': totalCount,
          'pageNum' : pageNum,
          'pageCount': pageCount,
          'moment': moment
      });
    })
};

exports.showSearch = function(req, res, next){
  var inputVal = req.query.input;
  var findContent = {};
  // findContent.content = new RegExp(input,'g');

  essayModel.find({content: new RegExp(inputVal,'g')}).populate('author').populate('category').exec(function (err, essays) {
    if(err) return next(err);
    var pageNum = Math.abs(parseInt(req.query.page || 1, 10)) ;
    var pageSize = 4;

    var totalCount = essays.length;
    var pageCount = Math.ceil(totalCount / pageSize);

     if (pageNum > pageCount) {
       pageNum = pageCount;
     }

    res.render("blog/showSearch", {
      'title' : '首页',
      'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
      'totalCount': totalCount,
      'pageNum' : pageNum,
      'pageCount': pageCount,
      'moment': moment
    });
  })
}
//展示首页联系
exports.showConnect = function (req, res, next) {
    essayModel.find({published: true}).sort('created').populate('author').populate('category').exec(function (err, essays) {
      if(err) return next(err);
      var pageNum = Math.abs(parseInt(req.query.page || 1, 10)) ;
      var pageSize = 4;

      var totalCount = essays.length;
      var pageCount = Math.ceil(totalCount / pageSize);

       if (pageNum > pageCount) {
         pageNum = pageCount;
       }
      // return res.jsonp(essays);
      res.render("blog/index-blog", {
          'title' : '首页',
          'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
          'totalCount': totalCount,
          'pageNum' : pageNum,
          'pageCount': pageCount,
          'moment': moment
      });
    })
};
//展示首页相关
exports.showAbout = function (req, res, next) {
    essayModel.find({published: true}).sort('created').populate('author').populate('category').exec(function (err, essays) {
      if(err) return next(err);
      var pageNum = Math.abs(parseInt(req.query.page || 1, 10)) ;
      var pageSize = 4;

      var totalCount = essays.length;
      var pageCount = Math.ceil(totalCount / pageSize);

       if (pageNum > pageCount) {
         pageNum = pageCount;
       }
      // return res.jsonp(essays);
      res.render("blog/index-blog", {
          'title' : '首页',
          'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
          'totalCount': totalCount,
          'pageNum' : pageNum,
          'pageCount': pageCount,
          'moment': moment
      });
    })
};
// 展示文章列表
exports.showcategory = function (req, res, next) {
    categoryModel.findOne({slug : req.params.slug}).exec(function(err, categories) {
      if(err) return next(err);
      console.log(req.query.page)
      essayModel.find({ category: categories, published: true})
          .sort('created').populate('author').populate('category')
          .exec(function(err, essays) {
            if(err) return next(err);
            var pageNum = Math.abs(parseInt(req.query.page || 1, 10)) ;

            var pageSize = 4;

            var totalCount = essays.length;
            var pageCount = Math.ceil(totalCount / pageSize);

             if (pageNum > pageCount) {
               pageNum = pageCount;
             }
            res.render("blog/category", {
                'title' : '首页',
                'essays' : essays.slice((pageNum - 1 ) * pageSize, pageNum * pageSize),
                'totalCount': totalCount,
                'pageNum' : pageNum,
                'pageCount': pageCount,
                'moment': moment
            });
          })
    })
};
// 展示每篇文章
exports.showView = function (req, res, next) {
  essayModel.findOne({_id: req.params._id}).populate('author').populate('category').exec(function (err, essays) {
    // var totalCount = essays.length;
    if(!req.params._id) return next(new Error('no post id provided'));
    // return res.jsonp(essays);
    res.render("blog/view", {
        'essays' : essays,
        // 'totalCount': totalCount,
        'moment': moment
    });
  })
}
// 点赞功能
exports.showFavorite = function (req, res, next) {
  essayModel.findOne({_id: req.params._id}).populate('author').populate('category').exec(function (err, essays) {
    var totalCount = essays.length;
    if(!req.params._id) return next(new Error('no post id provided'));
    // return res.jsonp(essays);
    essays.meta.favorite = essays.meta.favorite ? essays.meta.favorite + 1 : 1;
    essays.markModified('meta');
    essays.save(function (err) {
      res.redirect('/essay/view/' + essays._id)
      res.render('blog/view', {
        'essays' : essays,
        'moment': moment
      })
    });
  })
}
// 评论功能
exports.showComments = function (req, res, next) {
  essayModel.findOne({_id: req.params._id}).populate('author').populate('category').exec(function (err, essays) {
    if (err) {
      return next(err)
    }
    if (req.query.email == '') {
      res.send('-1')  //没输入邮箱
      return;
    }
    if (req.query.content == '') {
      res.send('-2')  //没输入评论内容
      return ;
    }
    // return res.jsonp(essays);
    var comment = {
      email : req.query.email,
      content: req.query.content
    }

    essays.comments.push(comment);
    // essays.markModified('comments');
    essays.save(function(err, essays) {
      res.send('1');
    })

  })
}


//注册功能
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
}
//登陆功能
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
}


// var express = require("express");
// var app = express();
//     router = express.Router();
// var formidable = require('formidable');
// var db = require(".././model/db.js");
//
// app.set('view engine','ejs');
//
// app.use(express.static('./public'));
//
//
// app.get('/',function(req, res){
//   db.getAllCount("username",function(count){
//       res.render("blog/index-blog",{
//       });
//   });
// });
//
// app.get('/dashboard',function(req, res){
//   db.getAllCount("username",function(count){
//       res.render("./index-dashboard",{
//           "username" : Math.ceil(count / 20)
//       });
//   });
// });
//
//
// app.get("/login",function(req, res){
//   res.render('denglu');
// });
//
// app.get("/register",function(req, res){
//   res.render('register');
// });
//
// app.get("/checkregister",function(req, res){
//   var tianxiedeusername = req.query.username;
//   var tianxiedepassword = req.query.password;
//   db.insertOne("tests",{"username":tianxiedeusername,"password":tianxiedepassword},function(err,result){
//       if(err){
//           console.log("注册失败");
//           return;
//       }
//       res.send("注册成功");
//   });
// });
//
// app.get("/checklogin",function(req, res){
//   var tianxiedeusername = req.query.username;
//   var tianxiedepassword = req.query.password;
//   db.find("tests",{"username":tianxiedeusername},function(err,result){
//       if(result.length == 0){
//           res.send("你的登录名写错了，没有这个注册用户");
//           return;
//       }
//       var shujukuzhongdepassword = result[0].password;
//       if(shujukuzhongdepassword == tianxiedepassword){
//           // req.session.login = "1";
//           // req.session.username = result[0].username;
//           res.send("成功登陆！你是" + result[0].username);
//       }else{
//           res.send("密码错误！");
//       }
//   })
// });
//
//
//
//
// app.listen(3000);
