var execPromise = require('child-process-promise');
var exec = require('child_process').exec;
var sizeOf = require('image-size');
var fs = require('fs');

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  }
  catch (err) {
    return false;
  }
}

function SmartImage (abe) {
	this.abe = abe;
	this.smatCropPath = abe.fileUtils.concatPath(abe.config.root, '/plugins/gallery/node_modules/smartcrop-cli/smartcrop-cli.js');
};

SmartImage.prototype.create = function (src, dist, width, height, callBack) {
	if(!fileExists(src)) {
		setTimeout(function () {
			this.create(src, dist, width, height);
		}.bind(this), 200);
		return;
	}

	var bufferSize = (this.abe.config && this.abe.config.galleryBufferSize) ? this.abe.config.galleryBufferSize : 1024 * 1000;

	var makeThumbs = function () {
		var thumbsFolderPath = dist;
	  thumbsFolderPath = thumbsFolderPath.split('/');
	  thumbsFolderPath.pop();
	  thumbsFolderPath = thumbsFolderPath.join('/');

	  if(!this.abe.fileUtils.isFile(dist)){
		  this.abe.folderUtils.createFolder(thumbsFolderPath);
		  execPromise.exec('node ' + this.smatCropPath + ' --width ' + width + ' --height ' + height + ' ' + src + ' ' + dist, {maxBuffer: bufferSize})
		    .then(function (result) {
		      var stdout = result.stdout;
		      var stderr = result.stderr;
		      // if(stdout) console.log('stdout: ', stdout);
		      // if(stderr) console.log('stderr: ', stderr);
		      if(callBack) callBack({})
		    })
		    .fail(function (err) {
		      if(callBack) callBack({error: err['cmd']})
		    })
		    .progress(function (childProcess) {
		      // console.log('childProcess.pid: ', childProcess.pid);
		    });
	  }
	  else if(callBack) callBack({})
	}.bind(this);

	if (typeof height !== 'undefined' && height !== null) {
		makeThumbs();
	}
	else {
		var dimensions = sizeOf(src, function (err, dimensions) {
			try{
			  height = parseInt(dimensions.height * width / dimensions.width);
			  makeThumbs();
		  }
		  catch(e){
		  	if(callBack) callBack({error: e})
		  }
		});
	}	
};

SmartImage.prototype.createList = function (list, key, from, to, width, height) {
	list.forEach(function (imageObj) {
    var path = '/' + imageObj[key].replace(/^\//, '');
    this.create(this.abe.fileUtils.concatPath(from, path), this.abe.fileUtils.concatPath(to, path), width, height);
  }.bind(this));
};

module.exports = SmartImage;
