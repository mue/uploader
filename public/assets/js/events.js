ipcRenderer.on('addedFile', async (_event, arg, arg2) => { 
    uploadbutton.disabled = false;
    undobutton.disabled = true;

    photodiv.style.display = 'block';
    photo.src = arg2;

    // make sure it doesn't say something like Canon Canon EOS 1300D 
    const phoneInfo = devices.find(device => device.model === arg.Model);
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
            const data = await (await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${arg.latitude},${arg.longitude}&key=${config.tokens.opencage}`)).json();
            // if no town, just do country
            photolocation.value = data.results[0].components.town ? data.results[0].components.town + ', ' + data.results[0].components.country : data.results[0].components.country;
        } catch (e) {
            photolocation.value = '';
        }
    } else {
        photolocation.value = '';
    }
});

ipcRenderer.on('message', (_event, arg) => {
    message.innerText = arg;

    if (arg === 'Uploaded successfully') {
        undobutton.disabled = false;

        // in case the user added a new category or photographer
        // this is so they don't need to reload the program again
        getDropdown();
    } else if (arg === 'Removed successfully') {
        uploadbutton.disabled = false;
    }
});
