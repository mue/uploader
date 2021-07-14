const csv = require('convert-csv-to-json');
const fetch = require('node-fetch');
const fs = require('fs');

const downloadFile = (async (url, path) => {
    const res = await fetch(url);
    const stream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(stream);
        res.body.on('error', reject);
        stream.on('finish', resolve);
    });
});

downloadFile('https://storage.googleapis.com/play_public/supported_devices.csv', './devices.csv').then(() => {
    csv.fieldDelimiter(',').ucs2Encoding().generateJsonFileFromCsv('devices.csv', 'devices.json');
});
