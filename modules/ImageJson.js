var SmartImage = require('./SmartImage');
var sizeOf = require('image-size');
var fs = require('fs');
var jsonFile = '../images.json';
var jsonCache = [];

function ImageJson (abe) {
	this.abe = abe;
  jsonFile = abe.fileUtils.concatPath(abe.config.root, abe.config.plugins.url, '/abe-gallery/images.json');
};

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  }
  catch (err) {
    return false;
  }
}

ImageJson.prototype.create = function () {
  var config = this.abe.config;
  var imageUrl = this.abe.fileUtils.concatPath(config.root, config.publish.url, config.upload.image);
  var images = this.abe.FileParser.getFiles(imageUrl, true, 10);
  var imageList = [];
  images.forEach(function (image) {
    try{
      var dimensions = sizeOf(this.abe.fileUtils.concatPath(config.root, config.publish.url, image.cleanFilePath));
      imageList.push({
        height: dimensions.height,
        width: dimensions.width,
        path: '/' + image.cleanFilePath.replace(/^\//, '')
      });
    }
    catch(e){
      console.log(e)
    }
  }.bind(this));

  this.save(imageList);

  return imageList;
};

ImageJson.prototype.addImage = function (path) {
  var imageList = this.get();
  var path = this.abe.fileUtils.concatPath(this.abe.config.root, this.abe.config.publish.url, path);

  if(!fileExists(path)) {
    setTimeout(function () {
      this.addImage(path);
    }.bind(this), 200);
    return;
  }
  var dimensions;
  try{
    dimensions = sizeOf(path);
  }
  catch(e){
    dimensions = {
      height: 0,
      width: 0
    }
  }
  imageList.unshift({
    height: dimensions.height,
    width: dimensions.width,
    path: '/' + path.replace(/^\//, '')
  });
  jsonCache = imageList;
  this.save(imageList);
};

ImageJson.prototype.save = function (imageList) {
  this.abe.folderUtils.createFile(jsonFile, imageList);
};

ImageJson.prototype.flush = function (imageList) {
  var config = this.abe.config;
  var images = this.abe.FileParser.getFiles(this.abe.fileUtils.concatPath(config.root, config.publish.url, config.upload.image), true, 10);
  var imageList = jsonCache;
  var smartImage = new SmartImage(this.abe);
  images.forEach(function (image) {
    var imgUrl = '/' + image.cleanFilePath.replace(/^\//, '');
    var found = false;
    for (var i = 0; i < imageList.length; i++) {
      if(imageList[i].path === imgUrl) {
        found = true;
        break;
      }
    }
    if(!found){
      var dimensions = sizeOf(this.abe.fileUtils.concatPath(config.root, config.publish.url, image.cleanFilePath));
      imageList.unshift({
        height: dimensions.height,
        width: dimensions.width,
        path: imgUrl
      });
      smartImage.create(
        this.abe.fileUtils.concatPath(this.abe.config.root, this.abe.config.publish.url, imgUrl),
        this.abe.fileUtils.concatPath(this.abe.config.root, this.abe.config.publish.url, 'thumbs', imgUrl),
        200,
        null
      );
    }
  }.bind(this));

  this.save(imageList);
  jsonCache = imageList;

  return imageList;
};

ImageJson.prototype.get = function () {
  var imageList = this.abe.FileParser.getJson(jsonFile, true);
  if(typeof imageList !== 'undefined' && imageList !== null && JSON.stringify(imageList) !== '{}') {
    jsonCache = imageList;
    return imageList;
  }
  jsonCache = this.create();
  this.save(jsonCache);
  return jsonCache;
};

ImageJson.prototype.fromCache = function () {
  return jsonCache;
};

ImageJson.prototype.exist = function () {
  var imageList = this.abe.FileParser.getJson(jsonFile, true);
  return typeof imageList !== 'undefined' && imageList !== null && JSON.stringify(imageList) !== '{}';
};

module.exports = ImageJson;
