//Routes for handling CSV imports

const express = require('express');
const multer = require('multer');
const path = require('path');
const importController = require('../controllers/import.controller');
const router = express.Router();

// // Multer setup for handling file uploads, specifically CSV files. It defines where to store the uploaded files and how to name them, as well as a filter to ensure only CSV files are accepted.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Directory where uploaded files will be stored.

  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) // Naming convention for uploaded files to avoid conflicts (timestamp + original filename).
});

// Multer instance with storage configuration and file filter to allow only CSV files
const upload = multer({ 
  storage,

  // File filter to ensure only CSV files are accepted. If a file with a different extension is uploaded, an error will be returned.
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
});

router.post('/', upload.single('file'), importController.createImport); // Route for uploading a CSV file. It uses the multer middleware to handle the file upload and then calls the createImport controller function to process the uploaded file.

router.get('/:id', importController.getImportStatus); // Route for checking the status of an import by its ID. It calls the getImportStatus controller function to retrieve the current status of the import process.

module.exports = router; // Export the router to be used in the main application file (app.js) where it will be mounted on a specific path (e.g., /api/imports).