var SmartImage = require('./SmartImage');
var sizeOf = require('image-size');
var fs = require('fs');
var jsonFile = '../images.json';
var jsonCache = [];
var path = require('path');

function ImageJson (abe) {
  this.abe = abe;
  jsonFile = path.join(abe.config.root, abe.config.plugins.url, '/abe-gallery/images.json');
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
  var imageUrl = path.join(config.root, config.publish.url, config.upload.image);
  var images = this.abe.cmsData.file.getFiles(imageUrl, true, 10);
  var imageList = [];
  images.forEach(function (image) {
    try{
      var pathCreate = path.join(config.root, config.publish.url, image.cleanFilePath)
      var dimensions = sizeOf(path);
      imageList.push({
        height: dimensions.height,
        width: dimensions.width,
        path: '/' + image.cleanFilePath.replace(/^\//, '')
      });
    }
    catch(e){
      try{
        var stats = fs.statSync(pathCreate);
        //image-size doesn't like images with 0ko
        // If I find one such image, I delete it
        if(stats["size"] === 0) {
          fs.unlinkSync(pathCreate);
        } else {
          console.log(e)
          console.log(pathCreate)
        }
      }
      catch(err) {
        console.log(pathCreate)
        console.log(e)
        console.log(err)
      }
    }
  }.bind(this));

  this.save(imageList);

  return imageList;
};

ImageJson.prototype.addImage = function (pathImg) {
  var imageList = this.get();
  var pathAdd = path.join(this.abe.config.root, this.abe.config.publish.url, pathImg);

  if(!fileExists(pathAdd)) {
    setTimeout(function () {
      this.addImage(pathAdd);
    }.bind(this), 200);
    return;
  }
  var dimensions;
  try{
    dimensions = sizeOf(pathAdd);
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
    path: '/' + pathImg.replace(/^\//, '')
  });
  jsonCache = imageList;
  this.save(imageList);
};

ImageJson.prototype.save = function (imageList) {
  this.abe.fse.writeJsonSync(jsonFile, imageList, { space: 2, encoding: 'utf-8' })
};

ImageJson.prototype.flush = function (imageList) {
  var config = this.abe.config;
  var images = this.abe.cmsData.file.getFiles(path.join(config.root, config.publish.url, config.upload.image), true, 10);
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
      var dimensions = sizeOf(path.join(config.root, config.publish.url, image.cleanFilePath));
      imageList.unshift({
        height: dimensions.height,
        width: dimensions.width,
        path: imgUrl
      });
      smartImage.create(
        path.join(this.abe.config.root, this.abe.config.publish.url, imgUrl),
        path.join(this.abe.config.root, this.abe.config.publish.url, 'thumbs', imgUrl),
        200,
        null, 
        function (res) {
          if(res.error) console.log("smartImage ERROR : ", res.error)
          if(res.error) error.push(res);
        }
      );
    }
  }.bind(this));

  this.save(imageList);
  jsonCache = imageList;

  return imageList;
};

ImageJson.prototype.get = function () {
  var imageList = this.abe.cmsData.file.get(jsonFile, true);
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
  var imageList = this.abe.cmsData.file.get(jsonFile, true);
  return typeof imageList !== 'undefined' && imageList !== null && JSON.stringify(imageList) !== '{}';
};

module.exports = ImageJson;
