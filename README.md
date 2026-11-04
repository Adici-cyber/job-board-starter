# Job Board Starter

A small job board application built for the InsiderOne Software Development Intern work sample.

The application uses sample jobs and companies. They are not real.

## Requirements

- Node.js version 20 or newer.
- No external packages required.

## How to Run

Start the application:

```bash
npm start
```

Open the application in your browser:

http://localhost:3000

Run automated tests:

```bash
npm test
```

## Features Implemented

### 1. Job Listings
- Display all available jobs.
- Search jobs by title, company, and location.

### 2. Save Jobs
- Save jobs using the Save button.
- Prevent duplicate saved jobs.
- Store saved job IDs in a JSON file.

### 3. List Saved Jobs
- Display saved jobs in a separate section.
- Show complete job details.
- Load saved jobs automatically when the page opens.

### 4. Remove Saved Jobs
- Remove jobs using the Remove button.
- Update the saved jobs list automatically.

### 5. Backend API

The following API endpoints are implemented:

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/jobs | Retrieve and search jobs |
| GET | /api/saved | Retrieve saved jobs |
| POST | /api/saved | Save a job |
| DELETE | /api/saved/:jobId | Remove a saved job |

### 6. Data Persistence
- Saved job IDs are stored in `saved-jobs.json`.
- Saved jobs remain available after refreshing the browser.

## Project Structure

```text
job-board-starter/
├── server.js
├── jobs.json
├── saved-jobs.json
├── package.json
├── README.md
├── lib/
│   ├── jobs.js
│   └── saved.js
├── public/
│   ├── index.html
│   └── app.js
└── test/
    └── jobs.test.js
```

## Testing

The project uses Node.js built-in test runner.

Run tests using:

```bash
npm test
```

The original three tests pass successfully.

The saved jobs functionality was also manually verified, including saving, duplicate prevention, retrieving, removing, and persistence after browser refresh.

## Technologies Used

- JavaScript
- Node.js
- HTML
- CSS
- JSON
- Git and GitHub