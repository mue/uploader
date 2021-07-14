const addFile = () => {
    message.innerText = '';
    ipcRenderer.send('addFile');
}

const upload = async () => {
    if (!photo.src) {
        return message.innerText = 'No image provided';
    }
    message.innerText = '';

    // these 2 if statements are for seeing if the user used the new options
    let photographer_name = photographer.value;
    if (newphotographerdiv.style.display !== 'none') {
        photographer_name = newphotographer.value;
    }

    let category_name = category.value;
    if (newcategorydiv.style.display !== 'none') {
        category_name = newcategory.value;
    }

    if (category_name === '' || photographer_name === '' || photolocation === '' || model === '') {
        return message.innerText = 'All fields must be provided, if you don\'t know the exact location just put the country.';
    }

    uploadbutton.disabled = true;

    ipcRenderer.send('upload', {
        photographer: photographer_name,
        category: category_name,
        location: location.value,
        camera_model: model.value
    });
}

const undo = async () => {
    message.innerText = '';
    undobutton.disabled = true;
    ipcRenderer.send('undo');
}
