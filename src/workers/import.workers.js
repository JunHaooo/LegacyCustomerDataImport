// This worker processes CSV import jobs from the 'importQueue'. It reads the uploaded CSV file, validates each record, stores valid records in the database, and updates the ImportJob document with the results. It also handles errors gracefully and logs the outcomes for monitoring and debugging purposes.

const { Worker } = require('bullmq');
const fs = require('fs');
const { parse } = require('csv-parse');
const { connection } = require('../config/queue');
const Customer = require('../models/Customer');
const ImportJob = require('../models/ImportJob');
const { validateCustomer } = require('../services/validation.service');
const logger = require('../utils/logger');

const worker = new Worker('importQueue', async (job) => {
  const { filePath, jobId } = job.data;
  const importJob = await ImportJob.findById(jobId);

  try {
    importJob.status = 'processing';
    importJob.startedAt = new Date();
    await importJob.save();

    const parser = fs.createReadStream(filePath).pipe(parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    }));

    let rowCount = 0;
    for await (const record of parser) {
      rowCount++;
      const { error, value } = validateCustomer(record);

      if (error) {
        importJob.failedCount++;
        importJob.rejectedRecords.push({
          row: rowCount,
          data: record,
          validationErrors: error.details.map(d => d.message)
        });
      } else {
        try {
          await Customer.create(value); // Fulfills "Store all valid records" [cite: 28]
          importJob.successCount++;
        } catch (dbError) {
          importJob.failedCount++;
          importJob.rejectedRecords.push({
            row: rowCount,
            data: record,
            validationErrors: [dbError.code === 11000 ? 'Email already exists' : dbError.message]
          });
        }
      }
    }

    importJob.status = 'completed';
    importJob.totalRecords = rowCount;
    importJob.completedAt = new Date();
    await importJob.save();

    logger.info(`Import Job ${jobId} completed. Success: ${importJob.successCount}, Failed: ${importJob.failedCount}`);
    
    // Cleanup: Remove temporary file
    fs.unlinkSync(filePath);

  } catch (err) {
    importJob.status = 'failed';
    await importJob.save();
    logger.error(`Import Job ${jobId} failed: ${err.message}`);
  }
}, { connection });

module.exports = worker;