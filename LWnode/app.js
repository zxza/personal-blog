var express = require("express");
var app = express();
var formidable = require('formidable');
var db = require("./model/db.js");
var path=require('path');
var bodyParser = require('body-parser');

//控制器
var blog = require("./controller/blog/blog.js");
var admin = require("./controller/admin/admin.js");

var categoryModel = require('./model/category.js');

var session = require('express-session');

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


app.set('view engine','ejs');
//处理post请求全局插件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//静态路由站点
app.use(express.static(path.join(__dirname, '/public')));
app.use(function (req, res, next) {
  categoryModel.find(function(err, categories) {
    if (err) {
      return next(err);
    }
    app.locals.categories = categories;
    next();
  });
})


//路由跳转
app.get("/",blog.showIndex);
app.get("/essay",blog.showEssays);
app.get("/category/:slug",blog.showcategory);
app.get("/essay/view/:_id",blog.showView);
app.get("/essay/favorite/:_id",blog.showFavorite);
app.get("/essay/comments/:_id",blog.showComments);
app.get('/checkregister', blog.checkregister);
app.get('/checklogin', blog.checklogin);
app.get('/connect', blog.showConnect);
app.get('/about', blog.showAbout);
app.get("/",admin.showAdmin);
app.get("/admin", admin.showAdmin);
app.get("/admin/essay/add", admin.showAdminAdd);
app.post("/admin/essay/show", admin.PostAdminAdd);
app.get("/admin/delete/:id", admin.showDelete);
app.get("/category/delete/:id", admin.CategoryDelete);
app.get("/admin/category",admin.showCategory)
app.get("/admin/category/add",admin.showCategoryAdd)
app.post("/admin/category/show", admin.PostCategoryAdd);
app.get("/category/edit/:id",admin.CategoryEdit)
app.post("/category/edit/:id",admin.PostCategoryEdit)
app.get("/admin/edit/:id",admin.showEdit);
app.post("/admin/save/:id",admin.saveEdit);
app.get('/register',admin.showRegister);
app.post('/register',admin.PostRegister);
app.get('/login',admin.showLogin);
app.post('/login',admin.PostLogin);
app.get('/loginout',admin.LoginOut);
// app.get("/edit/:id", admin.showEdit);
// app.get("/admin", admin.showAdmin);
// app.get("/admin", admin.showAdmin);


// app.get("/:albumName", blog.showAlbum);
// app.get("/dashboard", blog.showDashboard);
// app.post("/up", blog.doPost);

//404
// app.use(function (req, res) {
//     res.render("err");
// });


app.listen(3000);
