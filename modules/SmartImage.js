var exec = require('child_process');
var sizeOf = require('image-size');
var path = require('path');

function SmartImage (abe) {
	this.abe = abe;
	var node_modules = __dirname.split(path.sep)
	node_modules.pop()
	node_modules.pop()
	node_modules = node_modules.join(path.sep)
	this.smartCropPath = path.join(node_modules, 'smartcrop-cli', 'smartcrop-cli.js');
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
    var pathList = '/' + imageObj[key].replace(/^\//, '');
    this.create(path.join(from, pathList), path.join(to, pathList), width, height, function (res) {
      if(res.error) console.log("smartImage ERROR : ", res.error);
    });
  }.bind(this));
};

module.exports = SmartImage;
