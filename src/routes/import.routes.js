//Handles file uploads and initiates background processing jobs for CSV imports.

const express = require('express');
const multer = require('multer');
const path = require('path');
const { importQueue } = require('../config/queue');
const ImportJob = require('../models/ImportJob');
const logger = require('../utils/logger');

const router = express.Router();

// Configure storage for uploaded files
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

/**
 * POST /api/imports
 * Handles CSV upload and initiates background job
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    // 1. Create a metadata record in MongoDB to track the job status 
    const jobRecord = await ImportJob.create({
      status: 'pending',
      totalRecords: 0
    });

    // 2. Add the job to the BullMQ queue for the Worker to process 
    await importQueue.add('process-csv', {
      filePath: req.file.path,
      jobId: jobRecord._id
    });

    logger.info(`Import job created: ${jobRecord._id}`);

    // 3. Respond immediately with the Job ID (Async fulfillment) 
    res.status(202).json({
      message: 'File uploaded and processing started',
      jobId: jobRecord._id
    });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({ error: 'Failed to initiate import' });
  }
});

// GET /api/imports/:id - Fetch job status and results
router.get('/:id', async (req, res) => {
  try {
    const ImportJob = require('../models/ImportJob'); // Ensure model is imported
    const job = await ImportJob.findById(req.params.id); // Fetch job status from MongoDB

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching job' });
  }
});

module.exports = router;