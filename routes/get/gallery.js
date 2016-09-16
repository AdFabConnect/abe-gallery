'use strict';

var sizeOf = require('image-size');
var exec = require('child_process').exec;
var SmartImage = require('../../modules/SmartImage');
var ImageJson = require('../../modules/ImageJson');
var path = require('path');

var route = function route(req, res, next, abe) {
	var jsonFile = path.join(abe.config.root, abe.config.plugins.url, '/abe-gallerygallery/images.json');
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
	      path.join(abe.config.root, abe.config.publish.url),
	      path.join(abe.config.root, abe.config.publish.url, 'thumbs'),
	      200,
	      null
	    );

    	var thumbsPath = path.join(abe.config.root, abe.config.publish.url, 'thumbs', req.query.fileName);
    	var realPath = path.join(abe.config.root, abe.config.publish.url, req.query.fileName);
		  var thumbsFolderPath = thumbsPath.split('/');
		  thumbsFolderPath.pop();
		  thumbsFolderPath = thumbsFolderPath.join('/');
    	setTimeout(function () {
    		smartImage.create(realPath, thumbsPath, 200, null, function (res) {
          if(res.error) console.log("smartImage ERROR : ", res.error)
          if(res.error) error.push(res);
        });
    	}, 2000)
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


