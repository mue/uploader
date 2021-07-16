require('v8-compile-cache');

const config = require('./config.json');

const { app, BrowserWindow, dialog, ipcMain } = require('electron');

const fs = require('fs');
const fetch = require('node-fetch');

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: config.tokens.cloudinary.name,
    api_key: config.tokens.cloudinary.key,
    api_secret: config.tokens.cloudinary.secret
});

let win;
app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        title: 'Mue Uploader',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false
    });

    win.loadFile('public/index.html');
});

// ipc
let file;
let raw = false;
ipcMain.on('addFile', async (event) => { 
    let filePath = dialog.showOpenDialogSync({ properties: ['openFile'], filters: [{ name: 'Photos', extensions: ['jpg', 'jpeg', 'png', 'cr3', 'cr2', 'dng', 'raf', 'fff', 'rwl', 'nef', 'rw2', 'x3f', 'arw'] }] });
    if (filePath === undefined) {
        return;
    }
    file = filePath[0];

    const extension = filePath[0].substring(filePath[0].lastIndexOf('.') + 1);
    const rawTypes = ['cr3', 'cr2', 'dng', 'raf', 'fff', 'rwl', 'nef', 'rw2', 'x3f', 'arw'];
    if (rawTypes.includes(extension.toLowerCase())) {
        // only require modules when we need to
        const extractd = require('extractd');

        const jpg = await extractd.generate(filePath[0], {
            destination: './'
        });
        file = jpg.preview;
        raw = true;
    }

    let metadata;
    try {
        const exif = require('exifr');
        metadata = await exif.parse(file);
    } catch (e) {
        return event.sender.send('message', 'Failed to get image data');
    }
    event.sender.send('addedFile', metadata, file);
});

let filename, category, id;
let busy = false;
ipcMain.on('upload', (event, arg) => {
    busy = true;

    const crypto = require('crypto');
    filename = crypto.randomBytes(8).toString('hex');

    // compress
    const sharp = require('sharp');
    sharp(fs.readFileSync(file), { quality: 85, reductionEffort: 6 })
    .toFile(`./${filename}.webp`, (err) => { 
        if (err) {
            return event.sender.send('message', 'Failed to compress image');
        }

        if (raw) {
            fs.unlinkSync(file);
        }

        // upload
        cloudinary.v2.uploader.upload(`./${filename}.webp`, {
            folder: 'photos/' + arg.category.toLowerCase(),
            use_filename: true
        }, async (err, res) => {
            fs.unlinkSync(`./${filename}.webp`);
            if (err) {
                return event.sender.send('message', 'Failed to upload image');
            }

            cloudinary_id = res.asset_id;
            category = arg.category;

            // add to db
            const location = arg.location.charAt(0).toUpperCase() + arg.location.slice(1)

            let data = await fetch(`${config.api_url}/images/add?filename=${filename}&photographer=${arg.photographer}&category=${arg.category}&location=${location}&camera=${arg.camera_model}`, {
                headers: {
                    'Authorization': config.tokens.api
                }
            });
            data = await data.json();
 
            if (data.status === 500) { 
                event.sender.send('message', 'Failed to add image to database');
            } else {
                id = data.id;
                event.sender.send('message', 'Uploaded successfully');
            }
            busy = false;
        });
    });
});

ipcMain.on('undo', (event) => {
    busy = true;
    cloudinary.v2.uploader.destroy('photos/' + category.toLowerCase() + '/' + filename, {
        invalidate: true
    }, async (err) => {
        if (err) {
            return event.sender.send('Failed to delete image');
        }

        let data = await fetch(`${config.api_url}/images/delete?id=${id}`, {
            headers: {
                'Authorization': config.tokens.api
            }
        });
        data = await data.json();

        if (data.status === 500) { 
            event.sender.send('message', 'Failed to delete image from database');
        } else {
            event.sender.send('message', 'Removed successfully');
        }
        busy = false;
    });
});

ipcMain.on('titlebar', (_event, arg) => { 
    if (busy === true) {
        return dialog.showErrorBox('Error', 'Cannot close while busy! Please wait until all actions have finished before closing.');
    }

    switch (arg) {  
        case 'minimize':
            win.minimize();
            break;
        case 'maximise':
            if (!win.isMaximized()) {
                win.maximize();
            } else {
                win.unmaximize();
            }
            break;
        case 'close':
            // remove raw files if not uploaded
            fs.readdirSync('./').forEach((file) => {
                if (file.endsWith('.jpg')) {
                    fs.unlinkSync(file);
                }
            });
            win.close();
            break;
        default:
            break;
    }
});
