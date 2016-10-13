'use strict';

var SmartImage = require('../../modules/SmartImage');
var path = require('path');

var route = function route(req, res, next, abe) {
  var result = [];

	switch(req.query.action){
		case 'read':
			
		break;
		case 'write':
	    var smartImage = new SmartImage(abe);

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


