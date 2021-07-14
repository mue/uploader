const init = () => {
    document.getElementById('minbutton').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'minimize');
    });

    document.getElementById('maxbutton').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'maximise');
    });

    document.getElementById('closebutton').addEventListener('click', () => {
        ipcRenderer.send('titlebar', 'close');
    });
};

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        init();
    }
};
