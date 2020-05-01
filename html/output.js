const remote = require('electron').remote;
const fs = require('fs');
const app = remote.app;
const input = document.getElementById('input');
const path = document.getElementById('path');
const comment = 'comment';
const sequence = ['QWERTYUIO','ASDFGHJKL'];

var group = {};
var pause = [];
var xhr;

path.value = 'file:///' + app.html.replace(/\\/g,'/');
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
        .replace(/^\n+|\n+$/g,'')
        .replace(/^\n+/gm,'\n')
        .split('\n');
    let html = '<select id="output" onchange="change()" onkeydown="response(event)" multiple>';
    html += `<option class="${comment}" value="-1"></option>`;
    for (let l = 0; l < lines.length; l++) {
        html += '<option ';
        if (lines[l][0] == '#') html += `class="${comment}" `;
        html += 'value="' + l + '">' + lines[l].replace(/^#/,'');
        html += '</option>';
    };
    html += `<option class="${comment}" value="`;
    html += lines.length.toString() + '">. . .</option>';
    html += '</select><div id="west"></div><div id="east"></div>';
    document.getElementById('right').innerHTML = html;
};

function change() {
    let otpt = document.getElementById('output');
    let opts = otpt.options;
    let indx = otpt.selectedIndex;
    let sels = otpt.selectedOptions;
    let text = [];
    let line = 0;
    let last = indx;
    for (let o of sels) {
        if (o.className == comment) continue;
        if (/^\s*$/.test(o.innerHTML)) continue; 
        line++;
        text.push(o.innerHTML.replace(/^\s+|\s+$/,''));
        o.className = '';
        last = o.index;
    };
    upload({"line":text});
    if (line == 0) line = sels.length;
    if (line == 0) return;
    group = {};
    let count = 0;
    for (let i = indx - 1; i >= 0; i--) {
        if (opts[i].className == comment) continue;
        if (/^\s*$/.test(opts[i].innerHTML)) continue;
        if (Math.floor(count/line) >= sequence[0].length) {
            opts[i].className = '';
            continue;
        };
        let key = sequence[0][Math.floor(count/line)];
        if (!(key in group)) group[key] = [];
        group[key].push(opts[i]);
        if (count % line != line - 1) {
            opts[i].className = '';
        } else {
            opts[i].className = key;
        };
        count++;
    };
    count = 0;
    for (let i = last + 1; i < opts.length; i++) {
        if (opts[i].className == comment) continue;
        if (/^\s*$/.test(opts[i].innerHTML)) continue;
        if (Math.floor(count/line) >= sequence[1].length) {
            opts[i].className = '';
            continue;
        }
        let key = sequence[1][Math.floor(count/line)];
        if (!(key in group)) group[key] = [];
        group[key].push(opts[i]);
        if (count % line != 0) {
            opts[i].className = '';
        } else {
            opts[i].className = key;
        };
        count++;
    };
};

function response(e) {
    e.preventDefault();
    e.stopPropagation();
    let otpt = document.getElementById('output');
    let key = e.key;
    switch (key) {
        case 'ArrowUp':
            key = 'Q';
            break;
        case 'ArrowDown':
            key = 'A';
            break;
        case ' ':
            if (pause.length == 0) {
                for (let o of otpt.selectedOptions) {
                    if (o.className == comment) continue;
                    if (/^\s*$/.test(o.innerHTML)) continue; 
                    pause.push(o);
                    o.className = 'SPACE';
                };
                otpt.selectedIndex = -1;
                upload({"line":[]});
            } else {
                pause.forEach(o => {o.className = '';o.selected = true});
                pause = [];
                change();
            };
            return;
        default:
            key = key.toUpperCase();
    };
    if (key in group) {
        pause.forEach(o => o.className = '');
        pause = [];
        let top = sequence[0].indexOf(key) > -1;
        otpt.selectedIndex = -1;
        for (let o of group[key]) {
            o.selected = true;
        };
        change();
    }
};

function upload(data) {
    xhr = new XMLHttpRequest();
    let url = 'https://elimfgcc.org/lyrics/line';
    let method = 'POST';
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({"client": app.line, "data": data}));
};