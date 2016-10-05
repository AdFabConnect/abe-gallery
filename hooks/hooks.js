'use strict';

var fs = require('fs');
var sizeOf = require('image-size');
var SmartImage = require('../modules/SmartImage');
var ImageJson = require('../modules/ImageJson');
var imageList = [];
var images;
var abe;
var keys = [];
var path = require('path');

var hooks = {
  afterVariables: function(EditorVariables, abe){
    if(abe.config.gallery){
      var imageJson = new ImageJson(abe);
      var smartImage = new SmartImage(abe);
      var exist = imageJson.exist();
      var imageList = imageJson.get();
      EditorVariables.imageList = imageList;
      if(!exist) smartImage.createList(
        imageList,
        'path',
        path.join(abe.config.root, abe.config.publish.url),
        path.join(abe.config.root, abe.config.publish.url, 'thumbs'),
        200,
        null
      );
    }

    return EditorVariables;
  },
  afterAbeAttributes: function afterAbeAttributes(obj, str, json, abe) {
    if(abe.cmsData.regex.getAttr(str, 'thumbs') !== '') {
      var link = json.abe_meta.link;
      if(typeof keys[link] === 'undefined' || keys[link] === null) keys[link] = [];
      keys[link][obj.key] = abe.cmsData.regex.getAttr(str, 'thumbs').split(',');
      obj.thumbs = abe.cmsData.regex.getAttr(str, 'thumbs');
    }
    return obj;
  },
  beforeSave: function(obj, abe) {
    var link = obj.json.content.abe_meta.link;
    if(typeof keys[link] !== 'undefined' && keys[link] !== null){
      for(var prop in keys[link]){
        try{
          var k = keys[link];
          if(prop.indexOf('.') > -1){
            var p0 = prop.split('.')[0]
            var p1 = prop.split('.')[1]
            k = keys[link][p0];
            var index = 0;
            if(p0 in obj.json.content){
              obj.json.content[p0].forEach(function (item) {
                if(typeof item[p1] !== 'undefined' && item[p1] !== null && item[p1] !== ''){
                  keys[link][prop].forEach(function (key) {
                    var pathSave = item[p1].replace(/(\.(gif|jpg|jpeg|png))/, '_' + key + '$1');
                    try{
                      var sfStat = fs.statSync(path.join(abe.config.root, abe.config.publish.url, pathSave));
                      obj.json.content[p0][index++][p1 + '_' + key] = pathSave;
                    }
                    catch(e){
                      delete obj.json.content[p0][index++][p1 + '_' + key];
                    }
                  });
                }
              });
            }
          }
          else if((prop in obj.json.content) && obj.json.content[prop].indexOf('http://') < 0){
            var img = obj.json.content[prop].split('.');
            keys[link][prop].forEach(function (key) {
              var pathSave = obj.json.content[prop].replace(/(\.(gif|jpg|jpeg|png))/, '_' + key + '$1');
              try{
                var sfStat = fs.statSync(path.join(abe.config.root, abe.config.publish.url, pathSave));
                obj.json.content[prop + '_' + key] = pathSave;
              }
              catch(e){
                delete obj.json.content[prop + '_' + key];
              }
            });
          }
        } catch(e) {
          console.log('error on Gallery plugin : hooks.js beforeSave, prop:'+prop)
          //console.log(obj.json.content)
          console.log(keys[link])
        }
      }
    }
    return obj
  },
  afterEditorInput: function(htmlString, params, abe) {
    if(htmlString.indexOf('img-upload') > -1){
      var inputThumbs = '';
      var sizeThumbs = '';
      if(typeof params.thumbs !== 'undefined' && params.thumbs !== null){
        var arrayThumbs = params.thumbs.replace(/[\"\']\[(.*?)\][\"\']/, '$1').split(',');
        sizeThumbs = ' data-size="';
        var nb = 0;
        arrayThumbs.forEach(function (arrayThumb) {
          arrayThumb = arrayThumb.trim();
          var id = params.key + '_' + arrayThumb;
          inputThumbs += '<input type="text" id="' + id + '" data-id="' + id + '" value="" class="form-control form-abe hidden image-input-thumb">';
          sizeThumbs += (nb++ > 0) ? ',' + arrayThumb : arrayThumb;
        });
        sizeThumbs += '" ';
      }
      htmlString = htmlString.replace(/(type=[\"|\'']file[\"|\''])/g, '$1' + sizeThumbs);
    }

    return htmlString
  },
  beforeExpress: function (port, abe) {
    // this is too time consuming. to be refactored
    if(abe.config.gallery){
      var imageJson = new ImageJson(abe);
      var smartImage = new SmartImage(abe);
      if(!imageJson.exist()) {
        smartImage.createList(
          imageJson.create(),
          'path',
          path.join(abe.config.root, abe.config.publish.url),
          path.join(abe.config.root, abe.config.publish.url, 'thumbs'),
          200,
          null
        );
      }
    }
    return port;
  },
  afterSaveImage: (resp, req, abe) => {
    var imageJson = new ImageJson(abe);
    var smartImage = new SmartImage(abe);
    var realPath = path.join(abe.config.root, abe.config.publish.url, resp.filePath);
    var thumbsPath = path.join(abe.config.root, abe.config.publish.url, 'thumbs', resp.filePath);
    var error = [];
    if(/data-size=[\"|\''](.*?)[\"|\'']/.test(req.query.input)){
      var arraySize = req.query.input.match(/data-size=[\"|\''](.*?)[\"|\'']/)[1].split(',');
      arraySize.forEach(function (size) {
        var dimensions = size.split('x');
        var resizedImage = realPath.split('.');
        var ext = resizedImage.pop();
        resizedImage[resizedImage.length - 1] = resizedImage[resizedImage.length - 1] + "_" + size;
        resizedImage.push(ext)
        resizedImage = resizedImage.join('.');
        smartImage.create(realPath, resizedImage, dimensions[0], dimensions[1], function (res) {
          if(res.error) console.log("smartImage ERROR : ", res.error)
          if(res.error) error.push(res);
        });
      });
    }

    if(error.length > 0) resp.error = error;
    imageJson.addImage(resp.filePath);
    resp.thumbsPath = thumbsPath;
    return resp
  }
};

exports.default = hooks;
