exports.default = {
  afterEditorInput: (htmlString, params, abe) => {
    if(params.type === 'image') {
      htmlString = htmlString.replace(
        /<span class="image-icon"><\/span>/,
        '<div class="open-gallery" data-init="0"><span class="glyphicon glyphicon-picture" data-id="' + params.key + '"></span></div>'
      );
      htmlString = htmlString.replace(/(<div class=\"form-group\")/g, '$1' + 'input-image-gallery');
    }

    return htmlString
  }
}
