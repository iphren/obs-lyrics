path.onfocus = () => path.setSelectionRange(0, path.value.length);

search.onfocus = function() {
    changeFocus(search);
}

search.onblur = () => search.classList.remove('focused');