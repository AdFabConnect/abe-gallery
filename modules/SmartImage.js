var execPromise = require('child-process-promise');
var sizeOf = require('image-size');
var path = require('path');

function SmartImage (abe) {
	this.abe = abe;
	this.smatCropPath = path.join(abe.config.root, '/plugins/abe-gallery/node_modules/smartcrop-cli/smartcrop-cli.js');
};

SmartImage.prototype.create = function (src, dist, width, height) {
	var height = (typeof height !== 'undefined' && height !== null) ? height : (function () {
		var dimensions = sizeOf(src);
  	return parseInt(dimensions.height * width / dimensions.width);
	})();
	var thumbsFolderPath = dist;
  thumbsFolderPath = thumbsFolderPath.split('/');
  thumbsFolderPath.pop();
  thumbsFolderPath = thumbsFolderPath.join('/');

  if(!this.abe.fileUtils.isFile(dist)){
  	console.log('create : ' + dist)
	  this.abe.folderUtils.createFolder(thumbsFolderPath);
	  execPromise.exec('node ' + this.smatCropPath + ' --width ' + width + ' --height ' + height + ' ' + src + ' ' + dist)
	    .then(function (result) {
	      var stdout = result.stdout;
	      var stderr = result.stderr;
	      // if(stdout) console.log('stdout: ', stdout);
	      // if(stderr) console.log('stderr: ', stderr);
	    })
	    .fail(function (err) {
	      console.error('ERROR: ', err);
	    })
	    .progress(function (childProcess) {
	      // console.log('childProcess.pid: ', childProcess.pid);
	    });
  }
};

SmartImage.prototype.createList = function (list, key, from, to, width, height) {
	list.forEach(function (imageObj) {
    var pathList = '/' + imageObj[key].replace(/^\//, '');
    this.create(path.join(from, pathList), path.join(to, pathList), width, height);
  }.bind(this));
};

module.exports = SmartImage;
