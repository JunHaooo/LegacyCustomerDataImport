//Controller for handling CSV import requests

const { importQueue } = require('../config/queue');
const ImportJob = require('../models/ImportJob');
const logger = require('../utils/logger');

// Create a new import job and add it to the queue
exports.createImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    const jobRecord = await ImportJob.create({
      status: 'pending',
      totalRecords: 0
    });

    await importQueue.add('process-csv', {
      filePath: req.file.path,
      jobId: jobRecord._id
    });

    logger.info(`Import job created: ${jobRecord._id}`);

    res.status(202).json({
      message: 'File uploaded and processing started',
      jobId: jobRecord._id
    });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({ error: 'Failed to initiate import' });
  }
};

// Get the status of an import job
exports.getImportStatus = async (req, res) => {
  try {
    const job = await ImportJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching job' });
  }
};