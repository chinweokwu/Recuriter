// server.js
import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const DB_PATH = join(__dirname, 'candidates.json');

if (!existsSync(DB_PATH)) {
  writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  console.log('candidates.json created');
}

const readDB = () => JSON.parse(readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// === GET USER INFO ===
app.post('/recruiting/exampleApi/get-user-info', (req, res) => {
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(200).json({
      fallback: true,
      error: 'Missing first_name or last_name'
    });
  }

  const candidates = readDB();
  const candidate = candidates.find(c =>
    c.first_name.toLowerCase() === first_name.toLowerCase() &&
    c.last_name.toLowerCase() === last_name.toLowerCase()
  );

  if (!candidate) {
    return res.status(200).json({
      fallback: true,
      error: 'Candidate not found'
    });
  }

  res.status(200).json({
    fallback: false,
    application_date: candidate.application_date,
    email: candidate.email || 'paulcmorah@gmail.com'
  });
});

// === BOOK APPOINTMENT ===
app.post('/recruiting/exampleApi/book-appointment', (req, res) => {
  let { first_name, last_name, email, datetime } = req.body;

  // FORCE EMAIL
  email = 'paulcmorah@gmail.com';

  if (!first_name || !last_name || !datetime) {
    return res.status(200).json({
      fallback: true,
      error: 'Missing required fields'
    });
  }

  const candidates = readDB();
  let candidate = candidates.find(c =>
    c.first_name.toLowerCase() === first_name.toLowerCase() &&
    c.last_name.toLowerCase() === last_name.toLowerCase()
  );

  if (!candidate) {
    candidate = {
      first_name,
      last_name,
      email,
      application_date: new Date().toISOString().split('T')[0],
      appointments: []
    };
    candidates.push(candidate);
  }

  candidate.appointments.push({
    datetime,
    booked_at: new Date().toISOString(),
    status: 'confirmed'
  });

  writeDB(candidates);

  res.status(200).json({
    fallback: false,
    message: 'Appointment booked',
    email,
    datetime,
    first_name,
    last_name
  });
});

// === UPDATE CANDIDATE ===
app.put('/recruiting/exampleApi/update-candidate', (req, res) => {
  const { first_name, last_name, update } = req.body;

  if (!first_name || !last_name || !update || typeof update !== 'object') {
    return res.status(200).json({
      fallback: true,
      error: 'Invalid request body'
    });
  }

  const candidates = readDB();
  const index = candidates.findIndex(c =>
    c.first_name.toLowerCase() === first_name.toLowerCase() &&
    c.last_name.toLowerCase() === last_name.toLowerCase()
  );

  if (index === -1) {
    return res.status(200).json({
      fallback: true,
      error: 'Candidate not found'
    });
  }

  // Apply updates
  if (update.email) candidates[index].email = update.email;
  if (update.first_name) candidates[index].first_name = update.first_name;
  if (update.last_name) candidates[index].last_name = update.last_name;

  writeDB(candidates);

  res.status(200).json({
    fallback: false,
    message: 'Candidate updated',
    candidate: candidates[index]
  });
});

// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.json({
    status: 'Bland AI Webhook Running',
    port: PORT,
    time: new Date().toISOString(),
    endpoints: [
      "POST /recruiting/exampleApi/get-user-info",
      "POST /recruiting/exampleApi/book-appointment",
      "PUT /recruiting/exampleApi/update-candidate"
    ],
    note: "All responses include 'fallback: true/false' for Bland AI conditions"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`All emails → paulcmorah@gmail.com`);
  console.log(`Fallback logic: 200 OK with fallback: true/false`);
});