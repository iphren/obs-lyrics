var url, token;

fs.readFile(app.token, {encoding: 'utf-8'}, (err, data) => {
    if (!err) {
        let json = JSON.parse(data);
        url = json.url;
        token = json.token;
        reload();
    } else {
        login.style.display = 'flex';
    }
});

address.oninput = function(e) {
    url = e.target.value;
}

password.oninput = function(e) {
    token = e.target.value;
    reload();
}