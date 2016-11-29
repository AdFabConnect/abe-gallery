
var Gallery = function () {
	this.initialized = false;
	this.galleryPopup = document.querySelector('.gallery');
	this.galleryPopupContent = document.querySelector('.gallery .content');
	this.galleryPopupFooter = document.querySelector('.gallery .footer .content-footer');
	return this;
}

Gallery.prototype.init = function () {
	this.abeForm = document.querySelector('.abeform-wrapper');
	if(!(this.abeForm != null)) return;
	this.btnsOpenGallery = this.abeForm.querySelectorAll('.open-gallery');
	if(!(this.btnsOpenGallery != null) || this.btnsOpenGallery.length === 0) return;
	this.thumbEls = [];
	this.btnsCloseGallery = document.querySelectorAll('.close-gallery');
	this.btnChooseImg = document.querySelector('.btn-choose-img');
	this.initListener();
};

Gallery.prototype.selectThumb = function (thumb = false) {
	this.galleryPopupFooter.innerHTML = '<div class="desc"></div><div class="image"></div>';
	Array.prototype.forEach.call(this.thumbEls, function(thumbEl) {
		thumbEl.classList.remove('selected');
	});
	if(thumb) thumb.classList.add('selected');
	else return;
	this.ajax('/abe/image/?name=' + thumb.querySelector('img').getAttribute('data-thumb'), function (resp) {
		var resp = JSON.parse(resp);
		this.selectedThumb = resp;
		var desc = '<div class="name">File name: <br />' + resp.originalFile + '</div>';
		this.galleryPopupFooter.querySelector('.image').innerHTML = '<div><img src="' + resp.originalFile + '" /></div>';
		if(resp.thumbs.length > 0){
			desc += '<br /><div class="thumbs-size"><div>Sizes avaliables : </div>';
			Array.prototype.forEach.call(resp.thumbs, function(thumb) {
				desc += '<div> - ' + thumb.match(/_(\d+x\d+)\./)[1] + '<div>';
			});
			desc += '</div>';
		}
		this.galleryPopupFooter.querySelector('.desc').innerHTML = desc;
	}.bind(this));
};

Gallery.prototype.initThumbs = function () {
	Array.prototype.forEach.call(this.thumbs, function(thumb) {
		var thumbEl = document.createElement('div');
		thumbEl.classList.add('thumb');
		thumbEl.innerHTML = '<img src="' + thumb.thumbFile + '" data-thumb="' + thumb.thumbFile + '"  data-original="' + thumb.originalFile + '" />'
		this.galleryPopupContent.appendChild(thumbEl);
		this.thumbEls.push(thumbEl);
		thumbEl.addEventListener('click', function (e) {
			if(thumbEl.classList.contains('selected')) this.selectThumb();
			else this.selectThumb(thumbEl);
		}.bind(this));
	}.bind(this));
	this.initialized = true;
};

Gallery.prototype.initListener = function () {
	Array.prototype.forEach.call(this.btnsOpenGallery, function(btnOpenGallery) {
		if(parseInt(btnOpenGallery.getAttribute('data-init')) === 0){
			btnOpenGallery.setAttribute('data-init', 1);
			btnOpenGallery.addEventListener('click', function (e) {
				this.inputSelected = btnOpenGallery.parentNode.querySelector('[type="text"]')
				this.changeDisplayState('show');
				if(!this.initialized) {
					if(this.thumbs) this.initThumbs();
					else{
						this.thumbs = this.ajax('/abe/thumbs/', function (resp) {
							resp = JSON.parse(resp);
	  					if(resp.thumbs) this.thumbs = resp.thumbs;
							this.initThumbs();
						}.bind(this));
					}
				}
			}.bind(this));
		}
	}.bind(this));

	Array.prototype.forEach.call(this.btnsCloseGallery, function(btnCloseGallery) {
		if(parseInt(btnCloseGallery.getAttribute('data-init')) === 0){
			btnCloseGallery.setAttribute('data-init', 1);
			btnCloseGallery.addEventListener('click', function (e) {
				this.changeDisplayState('hide');
			}.bind(this));
		}
	}.bind(this));

	this.btnChooseImg.addEventListener('click', function () {
		this.inputSelected.value = this.selectedThumb.originalFile;
		var parent = this.inputSelected.parentNode
    var id = this.inputSelected.id
    Array.prototype.forEach.call(this.selectedThumb.thumbs, (thumb) => {
      var thumdID = `${id}_${thumb.match(/_(\d+x\d+)\./)[1]}`
      var inputThumbs = parent.querySelector(`[data-id="${thumdID}"]`)
      if(inputThumbs != null) inputThumbs.value = thumb
      else {
        var inputThumbs = document.createElement('input')
        inputThumbs.classList.add('form-control')
        inputThumbs.classList.add('form-abe')
        inputThumbs.classList.add('image-input')
        inputThumbs.id = thumdID
        inputThumbs.setAttribute('data-id', thumdID)
        inputThumbs.value = thumb
        inputThumbs.type = 'hidden'
      }
      parent.appendChild(inputThumbs)
    })
    this.inputSelected.focus()
    this.inputSelected.blur()
    this.changeDisplayState('hide')
	}.bind(this));
};

Gallery.prototype.changeDisplayState = function (state) {
	if(state === 'show') document.body.classList.add('gallery-open');
	else {
		document.body.classList.remove('gallery-open');
		this.selectedThumb = false;
		Array.prototype.forEach.call(this.thumbEls, function(thumbEl) {
			thumbEl.classList.remove('selected');
		});
	}
};

Gallery.prototype.ajax = function (req, callBack) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function (request) {
	  if(httpRequest.readyState === 4 && httpRequest.status === 200) {
	  	callBack(httpRequest.responseText);
	  }
	}.bind(this);
	httpRequest.open('GET', req);
	httpRequest.send();
};

new Gallery().init();

