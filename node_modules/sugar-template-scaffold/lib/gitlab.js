/**
 * @file gitlab下载
 * @author fengshangshi
 */
var util = require('./util');

var Git = module.exports = function(opts) {
	exports.repos = opts.repos || 'http://gitlab.corp.qunar.com/';
};

Git.prototype.download = function(id, cb, progress) {
	id += '/repository/archive.zip';
	var url = exports.repos + id;
	util.download(url, cb, progress);
};

