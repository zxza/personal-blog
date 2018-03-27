//数据MD5加密算法
var crypto = require("crypto");
module.exports = function(Password){
    var md5 = crypto.createHash('md5');
    var password = md5.update(Password).digest('base64');
    return password;
}
