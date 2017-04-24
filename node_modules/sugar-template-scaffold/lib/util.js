var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var _ = require('lodash');
var AdmZip = require('adm-zip');
var request = require('superagent');

exports.getTempDir = function() {
	var list = ['SSUGARHOME', 'HOME'],
		temp;
	_.forEach(list, function(n) {
		if (temp = process.env[n]) {
			return false;
		}
	});
	return temp;
};

exports.del = function(p) {
	var stat = fs.lstatSync(p);
	if (stat.isFile() || stat.isSymbolicLink()) {
		fs.unlinkSync(p);
	} else if (stat.isDirectory()) {
		fs.readdirSync(p).forEach(function(name) {
			exports.del(path.join(p, name));
		});
		fs.rmdirSync(p);
	}
	return true;
};

exports.download = function(url, cb, progress) {
	url = require('url').parse(url);

	request
		.get(url)
		.timeout(20 * 1000)
		.end(function(err, res) {
			if (err) {
				cb(err);
				return false;
			}

			var status = res.statusCode;
			var total = 0,
				loaded = 0;
			total = res.headers['content-length'] >> 0;
			progress && progress(0, 0, total);

			var filename = res.headers['filename'] || md5(url.path);
			var tmp_file_path = path.join(exports.getTempDir(), '.file_' + md5(url.path));
			if (fs.existsSync(tmp_file_path)) {
				exports.del(tmp_file_path);
			}
			var tmp_path = path.join(exports.getTempDir(), '.' + filename);
			if (fs.existsSync(tmp_path)) {
				exports.del(tmp_path);
			}

			var stream = fs.createWriteStream(tmp_file_path);
			var isZip = (res.headers['content-type'] || res.headers['content-type']) ===
				'application/zip';

			res.on('data', function(chunk) {
				stream.write(chunk);
				loaded += chunk.length;
				progress && progress(total ? _.round(loaded / total, 4) : 0, loaded,
					total);
			});

			res.on('end', function() {
				if (status >= 200 && status < 300 || status === 304) {
					stream.on('finish', function() {
						if (isZip) {
							var zipFile = new AdmZip(tmp_file_path);
							zipFile.extractAllTo(tmp_path, true);
							exports.del(tmp_file_path);
							cb(null, tmp_path);
						}
					});
					stream.end();
				} else {
					cb(new Error('Request ' + url.href + ': server relay status code ' +
						status + '.'));
				}
			});

			res.on('error', function(err) {
				cb(err);
			});


		});
};
