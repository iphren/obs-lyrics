const remote = require('electron').remote;
const fs = require('fs');
const app = remote.app;
const input = document.getElementById('input');
const foroutput = document.getElementById('foroutput');
const path = document.getElementById('path');

fs.writeFileSync(app.line, '');
path.value = app.line;
path.addEventListener('focus', function() {
    path.setSelectionRange(0, path.value.length);
});

try {
    var lyrics = fs.readFileSync(app.lyrics, { encoding: 'utf-8' });
} catch (e) {
    var lyrics = '';
};

input.value = lyrics;
update();
input.addEventListener('input', updated);

function updated(e) {
    fs.writeFileSync(app.lyrics, input.value);
    update();
};

function update() {
    var output = document.getElementById('output');
    if (output) output.remove();
    var lines = input.value
        .replace(/^\s*\n*\s*/,'')
        .replace(/\s*\n*\s*$/,'')
        .replace(/^\s*\n/gm,'\n')
        .split('\n');
    let html = '<select id="output" multiple>';
    html += '<option value="-1"></option>';
    for (let l = 0; l < lines.length; l++) {
        html += '<option value="' + l.toString() + '">'
        html += lines[l];
        html += '</option>';
    };
    html += '<option value="' + lines.length.toString() + '">...</option>';
    html += '</select>'
    foroutput.insertAdjacentHTML('afterend',html)
    var output = document.getElementById('output');
    output.addEventListener('click', function() {
        let opts = output.selectedOptions;
        let text = '';
        for (let o of opts) {
            if (o.value == '-1' || o.value == lines.length.toString()) continue;
            if (/^\s*$/.test(o.innerHTML)) continue; 
            text += o.innerHTML + '\n';
        };
        fs.writeFileSync(app.line, text);
    });
};