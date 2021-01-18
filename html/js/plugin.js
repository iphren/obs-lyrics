runCustomJs();

function runCustomJs() {
    if (!fs.existsSync(app.customjs)) return;
    fs.readdir(app.appData, (err, files) => {
        for (let f of files) {
            if (/custom\.txt\.[0-9]+\.js/.test(f)) {
                fs.unlink(join(app.appData,f), e => { if (e) console.error(e); });
            }
        }
        if (!fs.existsSync(app.customjs + '.tmp')) fs.copyFileSync(app.customjs, app.customjs + '.tmp');
        let tmp = fs.readFileSync(app.customjs + '.tmp','utf-8');
        fs.unlinkSync(app.customjs + '.tmp');
        let script =  tmp + '\n\n' + fs.readFileSync(app.basejs,'utf-8');
        let file = `${app.customjs}.${Date.now()}.js`;
        fs.writeFileSync(file, script);
        try {
            require(file);
        } catch(e) {
            console.error(e);
        } finally {
            fs.writeFileSync(app.customjs, tmp);
        }
    })
}

function addCustomButton(icon, id, action) {
    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }
    let btn = document.createElement('span');
    btn.id = id;
    btn.onmousedown = action;
    btn.className = "button";
    let img = document.createElement('img');
    img.src = icon;
    btn.appendChild(img);
    document.getElementById('menu').appendChild(btn);
}

function createModal(id, html) {
    let modalId = 'modalForBtn' + id;
    if (document.getElementById(modalId)) document.getElementById(modalId).remove();
    let btn = document.getElementById(id);
    if (!btn) {
        search.value = `create modal error: button "${id}" not found`;
        return;
    }
    let modal = document.createElement('div');
    modal.id = modalId;
    modal.className = "customjs modal hidden";
    modal.innerHTML = html;
    let closeBtn = document.createElement('div');
    closeBtn.className = "close icon";
    closeBtn.onmousedown = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.target.parentNode.id === 'modalForBtncustomjs') runCustomJs();
        evt.target.parentNode.classList.add('hidden');
    }
    modal.appendChild(closeBtn);
    webApp.appendChild(modal);
    btn.onmousedown = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        let btn = evt.target;
        if (btn.tagName === "IMG") btn = btn.parentNode;
        document.getElementById('modalForBtn' + btn.id).classList.remove('hidden');
    }
}