var exec = require('child_process');
var sizeOf = require('image-size');

function SmartImage (abe) {
	this.abe = abe;
	this.smatCropPath = abe.fileUtils.concatPath(abe.config.root, '/plugins/abe-gallery/node_modules/smartcrop-cli/smartcrop-cli.js');
};

SmartImage.prototype.create = function (src, dist, width, height, callBack) {
	var bufferSize = (this.abe.config && this.abe.config.galleryBufferSize) ? this.abe.config.galleryBufferSize : 1024 * 1000;
	var thumbsFolderPath = dist;
  thumbsFolderPath = thumbsFolderPath.split('/');
  thumbsFolderPath.pop();
  thumbsFolderPath = thumbsFolderPath.join('/');
  try{
  	var cmd = exec.execSync('node ' + this.smatCropPath + ' --width ' + width + ' --height ' + height + ' ' + src + ' ' + dist);
  	callBack(cmd)
	} catch(e){
		console.log(e)
	}
};

SmartImage.prototype.createList = function (list, key, from, to, width, height) {
	list.forEach(function (imageObj) {
    var path = '/' + imageObj[key].replace(/^\//, '');
    this.create(this.abe.fileUtils.concatPath(from, path), this.abe.fileUtils.concatPath(to, path), width, height);
  }.bind(this));
};

module.exports = SmartImage;
