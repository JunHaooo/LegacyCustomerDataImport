//Routes for handling CSV imports

const express = require('express');
const multer = require('multer');
const path = require('path');
const importController = require('../controllers/import.controller');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
});

router.post('/', upload.single('file'), importController.createImport);
router.get('/:id', importController.getImportStatus);

module.exports = router;