const init = () => {
    document.getElementById('min-button').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'minimize');
    });

    document.getElementById('max-button').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'maximise');
    });

    document.getElementById('close-button').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'close');
    });
};

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        init();
    }
};
