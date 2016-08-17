
var ThumbnailGrid = function (selector, selectorImage, popup) {
	var grid = document.querySelector(selector);
	var images = document.querySelectorAll(selectorImage);
	var popupWrapper = document.querySelector(popup);
	var btnChoose = popupWrapper.querySelector('.modal-footer .choose');
	var btnFlush = popupWrapper.querySelector('.modal-footer .flush');
	var btnsDisplayGallery = document.querySelectorAll('.display-gallery');
	var modalUpload = document.getElementById('modal-upload');
	var currentImage = '';
	var currentInput = null;

	var selectImage = function (target) {
		if(target.classList.contains('selected')){
			target.classList.remove('selected');
			Array.prototype.forEach.call(images, function(image) {
				image.classList.remove('not-selected');
			});
			btnChoose.classList.add('active');
			currentImage = '';
		}
		else{
			Array.prototype.forEach.call(images, function(image) {
				image.classList.remove('selected');
				image.classList.add('not-selected');
			});
			target.classList.add('selected');
			target.classList.remove('not-selected');
			btnChoose.classList.remove('active');
			currentImage = target.querySelector('img').getAttribute('src').replace(/\/thumbs/, '');
		}
	}

	if(images){
		popupWrapper.addEventListener('click', function (e) {
			if(e.target.classList.contains('image-item')) selectImage(e.target);
		});
	}

	var _inputChange = function (e) {
		currentInput = e.target.parentNode.querySelector('input[type="text"]');
	}

	if(btnsDisplayGallery){
		Array.prototype.forEach.call(btnsDisplayGallery, function(btnDisplayGallery) {
			btnDisplayGallery.addEventListener('click', _inputChange, false);
		});
	}

	window.abe.blocks.onNewBlock(function() {
		btnsDisplayGallery = document.querySelectorAll('.display-gallery');
		if(btnsDisplayGallery){
			Array.prototype.forEach.call(btnsDisplayGallery, function(btnDisplayGallery) {
				btnDisplayGallery.removeEventListener('click', _inputChange, false);
				btnDisplayGallery.addEventListener('click', _inputChange, false);
			});
		}
  }.bind(this))

	btnFlush.addEventListener('click', function (e) {
		var url = 'http://' + window.location.host + '/abe/plugin/gallery/gallery?action=flush';
		var oReq = new XMLHttpRequest();
		oReq.onreadystatechange = function () {
			if (oReq.readyState != 4 || oReq.status != 200) return;
			var result = JSON.parse(JSON.parse(oReq.response).result)
			for (var i = 0; i < result.length; i++) {
				var imgEl = grid.querySelector('[src="/thumbs' + result[i].path + '"]');
				var imgThumbEl = grid.querySelector('[src="' + result[i].path + '"]');
				if(!imgEl && !imgThumbEl){
					var child = document.createElement('div');
					child.setAttribute('class', 'image-item');
					child.innerHTML = '<img src="' + result[i].path + '">';
					grid.insertBefore(child, grid.querySelectorAll('.image-item')[0]);
				}
			}
			images = document.querySelectorAll(selectorImage);
		};
		oReq.open('GET', url, true);
		oReq.send();
	});

	btnChoose.addEventListener('click', function (e) {
		if(btnChoose.classList.contains('active') || currentImage === '') return;
		currentInput.value = currentImage;
		currentInput.focus()
		var event = document.createEvent('HTMLEvents');
		event.initEvent('blur', true, true);
		currentInput.dispatchEvent(event);

		Array.prototype.forEach.call(images, function(image) {
			image.classList.remove('selected');
			image.classList.remove('not-selected');
		});

		if(jQuery !== 'undefined' && jQuery !== null) jQuery(popupWrapper).modal('hide');
	}, false);

	modalUpload.addEventListener('change', function (e) {
		var target = e.target;
		var formData = new FormData();
		var currentInputFile = currentInput.parentNode.querySelector('.upload-wrapper .form-control');
    if (target.value == '') {
      console.log("Please choose file!");
      return false;
    }

    var file = target.files[0];

    formData.append('uploadfile', file);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/upload/?baseUrl=' + CONFIG.FILEPATH + '&input=' + currentInputFile.outerHTML, true);
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
      }
    }
    xhr.onerror = function(e) { console.log('An error occurred while submitting the form. Maybe your file is too big'); }
    xhr.onload = function() {
      var resp = JSON.parse(xhr.responseText);
      if(resp.error){
        alert(resp.response);
        return;
      }
      var img = document.createElement('div');
      img.classList.add('image-item');
      img.innerHTML = '<img src="' + resp.filePath + '">';
      if(images){
				grid.insertBefore(img, images[0]);
			}
      images = document.querySelectorAll(selectorImage);

			var url = 'http://' + window.location.host + '/abe/plugin/gallery/gallery?action=write&fileName=' + resp.filePath;
			var oReq = new XMLHttpRequest();
			oReq.onreadystatechange = function () {
				if (oReq.readyState != 4 || oReq.status != 200) return;
			};
			oReq.open('GET', url, true);
			oReq.send();
    }
    xhr.send(formData);
    addThumbsUrl(currentInputFile, currentInputFile.parentNode.parentNode)
	});

	var addThumbsUrl = function (target, parent) {
	  var thumbs = parent.querySelectorAll('.image-input-thumb');
	  var html = target.outerHTML;
	  var id = target.id;
	  if(thumbs){
	  	Array.prototype.forEach.call(thumbs, function(thumb) {
	  		var imageWithoutExt = parent.querySelector('.image-input').value.split('.');
	  		var ext = imageWithoutExt.pop();
	  		var size = thumb.id.replace(new RegExp(id), '');
	  		thumb.value = imageWithoutExt + size + '.' + ext;
			});
	  }
	};

	abe.files.onUpload(function (target) {
	  addThumbsUrl(target, target.parentNode.parentNode)
	});

	var imgUploadInputs = document.querySelectorAll('.img-upload .image-input');
	Array.prototype.forEach.call(imgUploadInputs, function(imgUploadInput) {
		var val = imgUploadInput.value;
		if(typeof val !== 'undefined' && val !== null && val.trim() !== '' ) addThumbsUrl(imgUploadInput, imgUploadInput.parentNode.parentNode);
	});

};

new ThumbnailGrid('.image-list', '.image-item', '#thumbnail-modal');
