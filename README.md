# Legacy Customer Data Import System
A production-grade, resilient backend system designed to handle large-scale CSV customer data migrations. Built with Node.js, Express, and MongoDB, utilizing BullMQ (Redis) for robust asynchronous background processing.

## Table of Contents
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [API Usage Examples](#-api-usage-examples)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Design Decisions](#-design-decisions)
- [Assumptions & Limitations](#-assumptions--limitations)
- [Future Improvements](#-future-improvements)

## Quick Start
The entire stack is containerized for a seamless setup.

Clone the repository:

```bash
git clone https://github.com/JunHaooo/LegacyCustomerDataImport.git
cd LegacyCustomerDataImport
```

Set up environment variables:

```bash
cp .env.example .env
```

Launch the application:

```bash
docker-compose up --build
```

The API will be available at http://localhost:3000.

## Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

## API Usage Examples
### 1. Upload CSV Import
`POST /api/imports`

Uploads the CSV file and initiates an asynchronous background job.

```bash
curl.exe -X POST -F "file=@./<YOUR_FILE>.csv" http://localhost:3000/api/imports
```

Response (202 Accepted):

```json
{
  "message": "File uploaded and processing started",
  "jobId": "<GENERATED_JOB_ID>"
}
```

### 2. Check Import Status & Results
`GET /api/imports/:id`

Retrieves job metadata, including success/failure counts and specific error messages for rejected rows.

```bash
curl.exe http://localhost:3000/api/imports/<JOB_ID>
```


### 3. Customer Management (CRUD)
- List Customers (Paginated): `curl.exe "http://localhost:3000/api/customers?page=1&limit=10"`
- Get Customer by ID: `curl.exe "http://localhost:3000/api/customers/<CUSTOMER_ID>`
- Update Customer: `curl.exe -X PUT -H "Content-Type: application/json" -d "{\`"full_name\`":\`"<NEW_NAME>\`", \`"email\`":\`"<EMAIL>\`", \`"date_of_birth\`":\`"<YYYY-MM-DD>\`", \`"timezone\`":\`"<IANA_TIMEZONE>\`"}" http://localhost:3000/api/customers/<CUSTOMER_ID>` 
- Delete Customer: `curl.exe -X DELETE http://localhost:3000/api/customers/<CUSTOMER_ID>`

## Testing
The project includes unit tests for business logic and integration tests for API endpoints using Jest and Supertest.

Run tests with a single command:

```bash
npm test
```

Note: Tests utilize Jest mocks for BullMQ/Redis to ensure isolated, stable execution without environment dependencies.

## Project Structure
```plaintext
├── src/
│   ├── config/         # Database and Queue configurations
│   ├── controllers/    # Business logic (Modular handlers)
│   ├── models/         # Mongoose schemas & indexing
│   ├── routes/         # Express API route definitions
│   ├── services/       # Validation (Joi) and utility services
│   ├── workers/        # BullMQ background worker logic
│   └── app.js          # Express application entry point
├── tests/              # Unit and Integration test suites
├── docker-compose.yml  # Container orchestration
└── .env.example        # Environment template
```

## Design Decisions
- **Asynchronous Processing (BullMQ/Redis):** To ensure high availability and scalability, CSV parsing is handled out-of-process. This prevents long-running file operations from blocking the API's main thread.
- **Modular MVC Pattern:** Logic is strictly separated into Controllers, Services, and Routes. This enhances maintainability and allows for cleaner unit testing of individual components.
- **Database Integrity:** Implemented Mongoose Unique Indexes on the email field. This provides a second layer of protection against duplicate records beyond application-level checks.
- **Streaming CSV Parser:** Large files are processed using Node.js streams rather than being loaded entirely into memory, allowing the system to handle multi-gigabyte uploads efficiently.
- **Structured Logging:** Utilizes a custom logger to track import job lifecycles, validation failures, and system errors in a consistent JSON-like format.

## 🔍 Assumptions & Limitations
- **CSV Format:** Assumes the first row contains headers: `full_name,email,date_of_birth,timezone`.
- **Duplicate Policy:** If an email already exists in the database, the row is rejected and logged in the `rejectedRecords` array with a detailed error message.
- **Timezone Validation:** Enforces strict IANA timezone validation. Records with non-compliant identifiers will be rejected to ensure downstream data consistency

## 🚀 Future Improvements
- **Multi-file Batch Uploads:** Expand the /api/imports endpoint to support upload.array('files'), allowing users to submit multiple CSVs in a single request for parallel background processing.
- **Batch Database Writes:** Replace individual `.save()` calls with `insertMany()` batches (e.g., every 100 rows) to further optimize database I/O.
- **Real-time Updates:** Integrate WebSockets (Socket.io) to push import progress updates to a frontend dashboard in real-time.
- **Authentication:** Implement JWT-based authentication for the CRUD and Import endpoints for production-level security.