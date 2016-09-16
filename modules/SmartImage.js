var exec = require('child_process');
var sizeOf = require('image-size');
var path = require('path');

function SmartImage (abe) {
	this.abe = abe;
	this.smartCropPath = abe.fileUtils.concatPath(abe.config.root, abe.config.plugins.url, 'abe-gallery/node_modules/smartcrop-cli/smartcrop-cli.js');
};

SmartImage.prototype.create = function (src, dist, width, height, callBack) {
	var bufferSize = (this.abe.config && this.abe.config.galleryBufferSize) ? this.abe.config.galleryBufferSize : 1024 * 1000;
	var thumbsFolderPath = dist.split("/").slice(0, -1).join("/");

  try{
  	var cmd = exec.execSync('node ' + this.smartCropPath + ' --width ' + width + ' --height ' + height + ' ' + src + ' ' + dist);
  	callBack(cmd)
	} catch(e){
		console.log(e)
	}
};

SmartImage.prototype.createList = function (list, key, from, to, width, height) {
	list.forEach(function (imageObj) {
    var path = '/' + imageObj[key].replace(/^\//, '');
    this.create(this.abe.fileUtils.concatPath(from, path), this.abe.fileUtils.concatPath(to, path), width, height, function (res) {
      if(res.error) console.log("smartImage ERROR : ", res.error);
    });
  }.bind(this));
};

module.exports = SmartImage;
