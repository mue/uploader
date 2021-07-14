const { ipcRenderer } = require('electron');
const config = require('../config.json');
const devices = require('../devices.json');

// dark theme
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
} 

const addFile = () => {
    document.getElementById('message').innerText = '';
    ipcRenderer.send('addFile');
}

const photodiv = document.getElementById('photodiv');
photodiv.style.display = 'none';

ipcRenderer.on('addedFile', async (_event, arg, arg2) => { 
    photodiv.style.display = 'block';
    document.getElementById('upload').disabled = false;
    document.getElementById('undo').disabled = true;
    document.getElementById('photo').src = arg2;

    // make sure it doesn't say something like Canon Canon EOS 1300D 
    const phoneInfo = devices.find(device => device.model === arg.Model);
    const model = document.getElementById('model');
    if (phoneInfo) {
        if (phoneInfo['MarketingName'].split(' ')[0] === phoneInfo['RetailBranding']) {
            model.value = phoneInfo['MarketingName'];
        } else {
            model.value = phoneInfo['RetailBranding'] + ' ' + phoneInfo['MarketingName'];
        }
    } else {
        if (!arg.Make && !arg.Model) { 
            model.value = '';
        } else {
            if (arg.Make === arg.Model.split(' ')[0]) {
                model.value = arg.Model;
            } else {
                model.value = arg.Make + ' ' + arg.Model;
            }
        }
    }

    // find location from gps data
    if (config.tokens.opencage !== '' && arg.latitude && arg.longitude) {
        try {
            const location = await (await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${arg.latitude},${arg.longitude}&key=${config.tokens.opencage}`)).json();
            document.getElementById('location').value = location.results[0].components.town ? location.results[0].components.town + ', ' + location.results[0].components.country : location.results[0].components.country;
        } catch (e) {
            document.getElementById('location').value = '';
        }
    } else {
        document.getElementById('location').value = '';
    }
});

// list of photographers
const getPhotographers = async () => {
    const photographers = await (await fetch(config.api_url + '/images/photographers')).json();
    const dropdown = document.getElementById('photographer');
    // in the future, we probably want to make the api sort alphabetically instead of doing it here
    photographers.sort().forEach((element) => {
        const option = document.createElement('option');
        option.text = element;
        dropdown.add(option);
    });
}

getPhotographers();

// has the user selected this option
const newphotographer = document.getElementById('newphotographerdiv');

document.getElementById('photographer').onchange = (e) => {
    if (e.target.value === 'Other') {
        newphotographer.style.display = 'block';
    } else {
        newphotographer.style.display = 'none'; 
    }
}

/// copy and pasted from above
const getCategories = async () => {
    const categories = await (await fetch(config.api_url + '/images/categories')).json();
    const dropdown = document.getElementById('category');
    categories.forEach((element) => {
        const option = document.createElement('option');
        option.text = element.charAt(0).toUpperCase() + element.slice(1);
        dropdown.add(option);
    });
}

getCategories();

const newcategory = document.getElementById('newcategorydiv');

document.getElementById('category').onchange = (e) => {
    if (e.target.value === 'Other') {
        newcategory.style.display = 'block';
    } else {
        newcategory.style.display = 'none'; 
    }
}

const upload = async () => {
    if (!document.getElementById('photo').src) {
        return document.getElementById('message').innerText = 'No image provided';
    }
    document.getElementById('message').innerText = '';

    // these 2 if statements are for seeing if the user used the new options
    let photographer = document.getElementById('photographer').value;
    if (document.getElementById('newphotographerdiv').style.display !== 'none') {
        photographer = document.getElementById('newphotographer').value;
    }

    let category = document.getElementById('category').value;
    if (document.getElementById('newcategorydiv').style.display !== 'none') {
        category = document.getElementById('newcategory').value;
    }

    const location = document.getElementById('location').value;

    if (category === '' || photographer === '' || location === '') {
        return document.getElementById('message').innerText = 'All fields must be provided, if you don\'t know the exact location just put the country.';
    }

    document.getElementById('upload').disabled = true;

    ipcRenderer.send('upload', {
        photographer: photographer,
        category: category,
        location: location,
        camera_model: document.getElementById('model').value
    });
}

ipcRenderer.on('message', (_event, arg) => {
    if (arg === 'Uploaded successfully') {
        document.getElementById('undo').disabled = false;
    } else if (arg === 'Removed successfully') {
        document.getElementById('upload').disabled = false;
    }
    document.getElementById('message').innerText = arg;
});

const undo = async () => {
    document.getElementById('undo').disabled = true;
    document.getElementById('message').innerText = '';
    ipcRenderer.send('undo');
}

document.getElementById('upload').disabled = true;
document.getElementById('undo').disabled = true;