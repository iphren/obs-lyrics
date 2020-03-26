const remote = require('electron').remote;
const fs = require('fs');
const app = remote.app;
const input = document.getElementById('input');
const path = document.getElementById('path');
const comment = 'comment';

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
    let output = document.getElementById('output');
    if (output) output.remove();
    let lines = input.value
        .replace(/^[\s\n]+|[\s\n]+$/g,'')
        .replace(/^\n+/gm,'\n')
        .split('\n');
    let html = '<select id="output" onchange="change()" multiple>';
    html += `<option class="${comment}" value="-1"></option>`;
    for (let l = 0; l < lines.length; l++) {
        html += '<option ';
        if (lines[l][0] == '#') html += `class="${comment}" `;
        html += 'value="' + l + '">' + lines[l].replace(/^#/,'');
        html += '</option>';
    };
    html += `<option class="${comment}" value="`;
    html += lines.length.toString() + '">. . .</option>';
    html += '</select>';
    document.getElementById('foroutput')
        .insertAdjacentHTML('afterend',html);
};

function change() {
    let opts = document.getElementById('output').selectedOptions;
    let text = '';
    for (let o of opts) {
        if (o.className == comment) continue;
        if (/^\s*$/.test(o.innerHTML)) continue; 
        text += o.innerHTML + '\n';
    };
    fs.writeFileSync(app.line, text);
};