path.onfocus = () => path.setSelectionRange(0, path.value.length);

search.onfocus = function() {
    changeFocus(search);
    hideUp.classList.contains('active') && toggleHide();
}

search.onblur = () => search.classList.remove('focused');