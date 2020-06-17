const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const pinyin = require('pinyin');

const app = remote.app;