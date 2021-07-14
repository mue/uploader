const config = require('./config.json');

const { app, BrowserWindow, dialog, ipcMain } = require('electron');

const sharp = require('sharp');
const exif = require('exifr');
const extractd = require('extractd');
const fs = require('fs');
const crypto = require('crypto');

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(config.tokens.supabase.url, config.tokens.supabase.key);

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'mue',
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
    let filePath = dialog.showOpenDialogSync({ properties: ['openFile'], filters: [{ name: 'Photos', extensions: ['jpg', 'png', 'cr3', 'cr2', 'dng', 'raf', 'fff', 'rwl', 'nef', 'rw2', 'x3f', 'arw'] }] });
    if (filePath === undefined) {
        return;
    }
    file = filePath[0];

    const extension = filePath[0].substring(filePath[0].lastIndexOf('.') + 1);
    const rawTypes = ['cr3', 'cr2', 'dng', 'raf', 'fff', 'rwl', 'nef', 'rw2', 'x3f', 'arw'];
    if (rawTypes.includes(extension.toLowerCase())) {
        const jpg = await extractd.generate(filePath[0], {
            destination: './'
        });
        file = jpg.preview;
        raw = true;
    }

    let metadata;
    try {
        metadata = await exif.parse(file);
    } catch (e) {
        return event.sender.send('message', 'Failed to get image data');
    }
    event.sender.send('addedFile', metadata, file);
});

let filename, category;
ipcMain.on('upload', (event, arg) => {
    filename = crypto.randomBytes(8).toString('hex');
    // compress
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
            const { error } = await supabase
            .from('newimages')
            .insert([{ 
                filename: filename,
                photographer: arg.photographer,
                category: arg.category,
                location: arg.location, 
                camera: arg.camera_model
            }]);

            if (error) { 
                event.sender.send('message', 'Failed to add image to database');
            } else {
                event.sender.send('message', 'Uploaded successfully');
            }
        });
    });
});

ipcMain.on('undo', (event) => { 
    cloudinary.v2.uploader.destroy('photos/' + category.toLowerCase() + '/' + filename, {
        invalidate: true
    }, async (err) => {
        if (err) {
            return event.sender.send('Failed to delete image');
        }

        const { error } = await supabase
        .from('newimages')
        .delete()
        .match({ filename: filename });

        if (error) { 
            event.sender.send('message', 'Failed to delete image from database');
        } else {
            event.sender.send('message', 'Removed successfully');
        }
    });
});

ipcMain.on('titlebar', (_event, arg) => { 
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
            win.close();
            break;
        default:
            break;
    }
});
