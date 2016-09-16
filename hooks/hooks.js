'use strict';

var path = require('path');
var sizeOf = require('image-size');
var execPromise = require('child-process-promise');
var SmartImage = require('../modules/SmartImage');
var ImageJson = require('../modules/ImageJson');
var imageList = [];
var images;
var abe;

var hooks = {
  afterVariables: function(EditorVariables, abe){
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
    return EditorVariables;
  },
  afterAbeAttributes: function afterAbeAttributes(obj, str, json, abe) {
    if(abe.getAttr(str, 'thumbs') !== '') obj.thumbs = abe.getAttr(str, 'thumbs');
    return obj;
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
      htmlString = htmlString.replace(
        /(glyphicon-upload(\r|\t|\n|.)*?<\/span>(\r|\t|\n|.)*?<\/span>(\r|\t|\n|.)*?<\/div>)/g,
        '$1<span class="glyphicon glyphicon-picture display-gallery" aria-hidden="true" data-toggle="modal" data-target="#thumbnail-modal"></span>' +
        inputThumbs
      );
    }
    
    return htmlString
  },
  beforeExpress: function (port, abe) {
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
    return port;
  },
  afterSaveImage: (resp, req, abe) => {
    var imageJson = new ImageJson(abe);
    var smartImage = new SmartImage(abe);
    var realPath = path.join(abe.config.root, abe.config.publish.url, resp.filePath);
    var thumbsPath = path.join(abe.config.root, abe.config.publish.url, 'thumbs', resp.filePath);
    if(/data-size=[\"|\''](.*?)[\"|\'']/.test(req.query.input)){
      var arraySize = req.query.input.match(/data-size=[\"|\''](.*?)[\"|\'']/)[1].split(',');
      arraySize.forEach(function (size) {
        var dimensions = size.split('x');
        var resizedImage = realPath.split('.');
        var ext = resizedImage.pop();
        resizedImage[resizedImage.length - 1] = resizedImage[resizedImage.length - 1] + "_" + size;
        resizedImage.push(ext)
        resizedImage = resizedImage.join('.');
        smartImage.create(realPath, resizedImage, dimensions[0], dimensions[1]);
      });
    }
    smartImage.create(realPath, thumbsPath, 200, null);
    imageJson.addImage(resp.filePath);
    resp.thumbsPath = thumbsPath;
    return resp
  }
};

exports.default = hooks;
