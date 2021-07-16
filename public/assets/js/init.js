const { ipcRenderer } = require('electron');
const { query } = require('what-country');
const config = require('../config.json');
const devices = require('../devices.json');

// define things here so we don't keep running document.getElementById()
// photo
const photodiv = document.getElementById('photodiv');
const photo = document.getElementById('photo');

// upload
const uploadbutton = document.getElementById('upload');
const undobutton = document.getElementById('undo');
const message = document.getElementById('message');

// information
const model = document.getElementById('model');
const photolocation = document.getElementById('location');

// dropdowns
const photographer = document.getElementById('photographer');
const category = document.getElementById('category');
const newcategorydiv = document.getElementById('newcategorydiv');
const newphotographerdiv = document.getElementById('newphotographerdiv');

// make sure the image doesn't show and you can't click the buttons before everything is ready
photodiv.style.display = 'none';
uploadbutton.disabled = true;
undobutton.disabled = true;

// dark theme
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
} 
