var token;

fs.readFile(app.token, {encoding: 'utf-8'}, (err, data) => {
    if (!err) {
        token = data;
    } else {
        login.style.display = 'flex';
        password.focus();
    }
});

password.oninput = function(e) {
    token = e.target.value;
    reload();
}