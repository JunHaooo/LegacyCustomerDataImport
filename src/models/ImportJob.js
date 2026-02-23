// Tracks the status and results of CSV import jobs, including counts of total, successful, and failed records, as well as details of rejected records for debugging purposes.

const mongoose = require('mongoose');

const importJobSchema = new mongoose.Schema({
status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'], // Allowed statuses for the import job
    default: 'pending'
  },
  totalRecords: { type: Number, default: 0 }, // Total number of records in the uploaded CSV file
  successCount: { type: Number, default: 0 }, // Number of records successfully imported into the database
  failedCount: { type: Number, default: 0 },  // Number of records that failed validation and were not imported
  rejectedRecords: [{
    row: Number,
    data: Object,
    validationErrors: [String] // List of validation errors for this record
  }],
  startedAt: { type: Date },
  completedAt: { type: Date }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('ImportJob', importJobSchema);