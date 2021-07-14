# uploader
Internal uploading utility for Mue

## Installation
### Requirements
* Cloudinary
* Supabase
* OpenCage (optional, used for getting location from exif coordinates)
### Instructions
1. ``git clone https://github.com/mue/uploader``
2. ``cd uploader`` and ``npm i`` (or ``yarn``)
3. Move ``config-example.json`` to ``config.json`` and fill out your Cloudinary keys, Supabase API information and OpenCage API key.
4. ``npm start`` or ``yarn``
5. Start developing!
