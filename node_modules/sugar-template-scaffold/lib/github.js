/**
 * @file github下载
 * @author fengshangshi
 */
var util = require('./util');

var Git = module.exports = function(opts) {
	exports.repos = opts.repos || 'https://codeload.github.com/';
};

Git.prototype.download = function(id, cb, progress) {
	id += '/zip/master';
	var url = exports.repos + id;
	util.download(url, cb, progress);
};
