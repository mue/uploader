const init = () => {
    document.getElementById('min-btn').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'minimize');
    });

    document.getElementById('max-btn').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'maximise');
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'close');
    });
};

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        init();
    }
};