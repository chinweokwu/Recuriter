// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// === IN-MEMORY DATABASE (OBJECT) ===
let candidates = [
  {
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah@example.com",
    application_date: "2025-04-15",
    appointments: []
  }
];

// === GET USER INFO ===
app.post('/recruiting/exampleApi/get-user-info', (req, res) => {
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.json({ fallback: true, error: 'Missing name' });
  }

  const candidate = candidates.find(c =>
    c.first_name.toLowerCase() === first_name.toLowerCase() &&
    c.last_name.toLowerCase() === last_name.toLowerCase()
  );

  if (!candidate) {
    return res.json({ fallback: true, error: 'Candidate not found' });
  }

  res.json({
    fallback: false,
    application_date: candidate.application_date,
    email: candidate.email || 'paulcmorah@gmail.com'
  });
});

// === BOOK APPOINTMENT ===
app.post('/recruiting/exampleApi/book-appointment', (req, res) => {
  const { first_name, last_name, datetime } = req.body;
  const email = 'paulcmorah@gmail.com';

  if (!first_name || !last_name || !datetime) {
    return res.json({ fallback: true, error: 'Missing fields' });
  }

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

  res.json({
    fallback: false,
    message: 'Booked',
    email,
    datetime
  });
});

// === UPDATE CANDIDATE ===
app.put('/recruiting/exampleApi/update-candidate', (req, res) => {
  const { first_name, last_name, update } = req.body;

  if (!first_name || !last_name || !update || typeof update !== 'object') {
    return res.json({ fallback: true, error: 'Invalid body' });
  }

  const index = candidates.findIndex(c =>
    c.first_name.toLowerCase() === first_name.toLowerCase() &&
    c.last_name.toLowerCase() === last_name.toLowerCase()
  );

  if (index === -1) {
    return res.json({ fallback: true, error: 'Not found' });
  }

  if (update.email) candidates[index].email = update.email;
  if (update.first_name) candidates[index].first_name = update.first_name;
  if (update.last_name) candidates[index].last_name = update.last_name;

  res.json({
    fallback: false,
    message: 'Updated',
    candidate: candidates[index]
  });
});

// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.json({
    status: 'Bland AI Webhook Running (In-Memory DB)',
    candidates_count: candidates.length,
    time: new Date().toISOString(),
    endpoints: [
      "POST /recruiting/exampleApi/get-user-info",
      "POST /recruiting/exampleApi/book-appointment",
      "PUT /recruiting/exampleApi/update-candidate"
    ],
    note: "Data stored in memory. Resets on redeploy."
  });
});

app.listen(PORT, () => {
  console.log(`LIVE: https://recuriter.onrender.com`);
  console.log(`In-memory DB active — no file storage`);
  console.log(`Email forced: paulcmorah@gmail.com`);
});