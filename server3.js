const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const helmet=require('helmet');

const connectdb = require('./db');
connectdb();

// MongoDB Schema
const { Schema, model } = mongoose;
const fileSchema = new Schema({
  url: { type: String, required: true },
  password: { type: String, required: true },
  filename: { type: String, required: true },
  public_id: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, 
});
const FileModel = model('FILES', fileSchema);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    resource_type: 'raw',
    public_id: (req, file) =>file.originalname
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const expiryMinutes = parseInt(req.body.expiry) || 60;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    

    const password = crypto.randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(password, 10);

    await FileModel.create({
      url: file.path,
      password: hash,
      filename: file.originalname,
      public_id: file.filename,
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000)
    });

   
    res.status(200).json({
      message: 'File uploaded and emails sent!',
      password: password,
      filename: file.originalname
    });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});


app.post('/fetch', async (req, res) => {
  try {
    const { password } = req.body;

   
    const allFiles = await FileModel.find({});

    
    for (let file of allFiles) {
      const match = await bcrypt.compare(password, file.password);
      if (match) {
        return res.status(200).json({
          message: 'Password matched',
          url: file.url,
          filename: file.filename
        });
      }
    }

    res.status(404).json({ error: 'Invalid password' });

  } catch (err) {
    console.error('Error during password check:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/uploads/:fileName', async (req, res) => {
    let fileName = req.params.fileName;
    let publicId = `uploads/${fileName}`; // removes file extension
  
    try {
      const file = await FileModel.findOne({ public_id: publicId });
      if (!file) return res.status(404).send('File not found');
  
      // Send the file for download
      res.redirect(file.url); 
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});

setInterval(async () => {
  try {
    const now = new Date();
    const expiredFiles = await FileModel.find({ expiresAt: { $lt: now } });

    for (let file of expiredFiles) {
      await cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' });
      await file.deleteOne();
      console.log(`Deleted expired file: ${file.filename}`);
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}, 10 * 60 * 1000);
