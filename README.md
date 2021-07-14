# uploader
Image uploading utility for Mue

## About
The process of uploading images to Mue was long and tedious - you had to generate a file name, add it to the database with the information, compress the image and then upload it and hope it works. This utility was made to make creating the new photo database in 5.2 a much easier process. The utility allows you to simply select a file, choose the category + photographer and click upload.

## Features
* Supports converting jpg, png, cr3, cr2, dng, raf, fff, rwl, nef, rw2, x3f and arw files to webp
* Get formatted Mue location (e.g Manchester, United Kingdom) from EXIF data
* Get camera or phone model name (e.g Canon 1300D, Samsung Galaxy S8)
* Automatic listing of photographers and categories with an option to add new ones
* Undo button in case you made a mistake

## Installation
### Requirements
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org)
* [A free Cloudinary account](https://cloudinary.com/)
* [Mue API Instance](https://github.com/mue/api)
* [A free OpenCage API key](https://opencagedata.com/) (optional, used for getting location from exif coordinates)
### Starting
1. Clone the repository using ``git clone https://github.com/mue/uploader.git``
2. Run  ``npm i`` (or ``yarn``) to install all needed dependencies
3. Move ``config-example.json`` to ``config.json`` and add your keys etc
4. Run ``node getdevicelist.js`` to get the phone device list
5. ``npm start`` or ``yarn``
6. Code your heart out!
### Building
1. ``npm run build`` 

Please note that currently it only returns a Windows build, and the uploader utility has not been tested on any other operating system. Due to the fact this program is useless without the correct setup, no prebuilt binaries are provided.

## License
[MIT](LICENSE)