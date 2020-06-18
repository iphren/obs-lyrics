function post(url, data) {
    let xhr = new XMLHttpRequest();
    let method = 'POST';
    xhr.open(method, url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject();
                }
            }
        }
        xhr.send(JSON.stringify(data));
    });
}

function sendPlaylist() {
    if (!app.configs.plURL || !plURL.value) {
        plURL.style.display = 'block';
        plURL.focus();
        return;
    }
    let pl = [];
    for (let o of playlist.childNodes) {
        let v = o.getAttribute('value');
        if (v) {
            v = JSON.parse(v);
            if (v.title && !(pl.includes(v.title))) pl.push(v.title);
        }
    }
    post(`https://${plURL.value}`,{playlist: pl, token: password.value})
    .then(() => {
        app.save('plURL',plURL.value);
        plURL.style.display = 'none';
        sendBtn.classList.add('success');
        setTimeout(function(){
            sendBtn.classList.remove('success');
        },1000);
    }).catch(() => {
        plURL.style.display = 'block';
    });
}