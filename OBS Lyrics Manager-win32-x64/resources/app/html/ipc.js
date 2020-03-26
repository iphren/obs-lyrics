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
    let comment = 'comment';
    var output = document.getElementById('output');
    if (output) output.remove();
    var lines = input.value
        .replace(/^[\s\n]+|[\s\n]+$/g,'')
        .replace(/^\n+/gm,'\n')
        .split('\n');
    let html = '<select id="output" multiple>';
    html += `<option class="${comment}" value="-1"></option>`;
    for (let l = 0; l < lines.length; l++) {
        html += '<option ';
        if (lines[l][0] == '#') html += `class="${comment}" `;
        html += 'value="' + l + '">' + lines[l].replace(/^#/,'');
        html += '</option>';
    };
    html += `<option class="${comment}" value="`;
    html += lines.length.toString() + '">. . .</option>';
    html += '</select>'
    foroutput.insertAdjacentHTML('afterend',html)
    var output = document.getElementById('output');
    output.addEventListener('click', function() {
        let opts = output.selectedOptions;
        let text = '';
        for (let o of opts) {
            console.log();
            if (o.className == comment) continue;
            if (/^\s*$/.test(o.innerHTML)) continue; 
            text += o.innerHTML + '\n';
        };
        fs.writeFileSync(app.line, text);
    });
};