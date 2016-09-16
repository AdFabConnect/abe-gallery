abe.files.onUpload(function (target) {
  if(target.getAttribute('data-size')){
  	var sizes = target.getAttribute('data-size').split(',');
  	var value = target.parentNode.parentNode.querySelector('.image-input').value;
  	var id = target.id;
  	sizes.forEach(function (size) {
  		if(id.indexOf('[') > -1){
  			var obj = id.split('[')[0];
  			var key = id.split(']-')[1];
  			var index = id.match(/\[(.)*?\]/)[1];
  			abe.json.data[obj][index][key + '_' + size] = value.replace(/(\.(gif|jpg|jpeg|png))/, '_' + size + '$1');
  		}
  		else abe.json.data[id + '_' + size] = value.replace(/(\.(gif|jpg|jpeg|png))/, '_' + size + '$1');
  	});
  	setTimeout(function () {
      abe.editorReload.instance.reload();
    }, 1000);
  }
});