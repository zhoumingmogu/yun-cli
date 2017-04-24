/**
 * @file 加载模板
 * @author fengshangshi
 */
var _ = require('lodash');

var Scaffold = module.exports = function(opts) {
	this.options = _.merge({}, opts);
};

Scaffold.prototype.download = function(id, cb, progress) {
	var supports = ['gitlab', 'github'];
	var type = this.options['type'];
	if (!~supports.indexOf(type)) {
		type = 'github';
	}
	var request = new (require('./lib/' + type))(this.options);
	request.download(id, cb, progress);
};
