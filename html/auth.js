var url, token;

fs.readFile(app.token, {encoding: 'utf-8'}, (err, data) => {
    if (!err) {
        let json = JSON.parse(data);
        url = json.url;
        token = json.token;
        address.value = url;
        password.value = token;
        reload();
    } else {
        login.style.display = 'flex';
    }
});

address.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Enter')
        password.focus();
}

password.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Enter') {
        url = address.value;
        token = password.value;
        reload();
        password.focus();
    }
}