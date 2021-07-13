const config = require('./config.json');

const { app, BrowserWindow, dialog, ipcMain } = require('electron');

// image
const sharp = require('sharp');
const exif = require('exifr');
const fs = require('fs');
const crypto = require('crypto');

// api
const cloudinary = require('cloudinary');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(config.tokens.supabase.url, config.tokens.supabase.key);

cloudinary.config({
    cloud_name: 'mue',
    api_key: config.tokens.cloudinary.key,
    api_secret: config.tokens.cloudinary.secret
});

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        title: 'Mue Uploader',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('public/index.html');
});

// ipc
let file;
ipcMain.on('addFile', async (event) => { 
    const filePath = dialog.showOpenDialogSync({ properties: ['openFile'] });
    const metadata = await exif.parse(filePath[0]);
    file = filePath[0];
    event.sender.send('addedFile', metadata, filePath[0]);
});

ipcMain.on('upload', (event, arg) => {
    const filename = crypto.randomBytes(8).toString('hex');
    // compress
    sharp(fs.readFileSync(file), { quality: 85, reductionEffort: 6 })
    .toFile(`./${filename}.webp`, (err) => { 
        if (err) {
            return event.sender.send('message', 'Failed to compress image');
        }

        // upload
        cloudinary.v2.uploader.upload(`./${filename}.webp`, {
            folder: 'photos/' + arg.category.toLowerCase()
        }, async (err) => {
            fs.unlinkSync(`./${filename}.webp`);
            if (err) {
                return event.sender.send('message', 'Failed to upload image');
            }

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
                event.sender.send('message', 'Success');
            }
        });
    });
});
