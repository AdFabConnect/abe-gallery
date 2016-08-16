'use strict';

var sizeOf = require('image-size');
var exec = require('child_process').exec;
var SmartImage = require('../../modules/SmartImage');
var ImageJson = require('../../modules/ImageJson');

var route = function route(req, res, next, abe) {
	var jsonFile = abe.fileUtils.concatPath(abe.config.root, abe.config.plugins.url, '/abe-gallery/images.json');
  var imageList = [];
  var images = [];
  var result = [];

	switch(req.query.action){
		case 'flush':
			var imageJson = new ImageJson(abe);
	    var smartImage = new SmartImage(abe);
	    var imageList = imageJson.flush();
	    result = imageList;
		break;
		case 'read':
			
		break;
		case 'write':
	    var imageJson = new ImageJson(abe);
	    var smartImage = new SmartImage(abe);
	    var exist = imageJson.exist();
	    var imageList = imageJson.get();
	    if(!exist) smartImage.createList(
	      imageList,
	      'path',
	      abe.fileUtils.concatPath(abe.config.root, abe.config.publish.url),
	      abe.fileUtils.concatPath(abe.config.root, abe.config.publish.url, 'thumbs'),
	      200,
	      null
	    );

    	var thumbsPath = abe.fileUtils.concatPath(abe.config.root, abe.config.publish.url, 'thumbs', req.query.fileName);
    	var realPath = abe.fileUtils.concatPath(abe.config.root, abe.config.publish.url, req.query.fileName);
		  var thumbsFolderPath = thumbsPath.split('/');
		  thumbsFolderPath.pop();
		  thumbsFolderPath = thumbsFolderPath.join('/');
    	smartImage.create(realPath, thumbsPath, 200, null);
		break;
	}

	res.set('Content-Type', 'application/json')
	res.send(JSON.stringify({
		route: 'gallery',
		success: 1,
		result: JSON.stringify(result)
	}))
}

exports.default = route;


