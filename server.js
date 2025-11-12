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
    email: candidate.email || 'paulcmorah@gmail.com'  // fallback only if DB missing
  });
});

// === BOOK APPOINTMENT ===
app.post('/recruiting/exampleApi/book-appointment', (req, res) => {
  const { first_name, last_name, email: inputEmail, datetime } = req.body;

  // Use input email if provided, else fallback
  const email = inputEmail && inputEmail.includes('@') 
    ? inputEmail 
    : 'paulcmorah@gmail.com';

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
  } else {
    // Update email if better one provided
    if (inputEmail && inputEmail.includes('@')) {
      candidate.email = inputEmail;
    }
  }

  candidate.appointments.push({
    datetime,
    booked_at: new Date().toISOString(),
    status: 'confirmed'
  });

  res.json({
    fallback: false,
    message: 'Booked',
    email: candidate.email,
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

  const candidate = candidates[index];

  if (update.email && update.email.includes('@')) {
    candidate.email = update.email;
  }
  if (update.first_name) candidate.first_name = update.first_name;
  if (update.last_name) candidate.last_name = update.last_name;

  res.json({
    fallback: false,
    message: 'Updated',
    candidate
  });
});

// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.json({
    status: 'Bland AI Webhook Running (Dynamic Email)',
    candidates_count: candidates.length,
    time: new Date().toISOString(),
    endpoints: [
      "POST /recruiting/exampleApi/get-user-info",
      "POST /recruiting/exampleApi/book-appointment",
      "PUT /recruiting/exampleApi/update-candidate"
    ],
    note: "Email is dynamic. Fallback to paulcmorah@gmail.com only if missing/invalid."
  });
});

app.listen(PORT, () => {
  console.log(`LIVE: https://recuriter.onrender.com`);
  console.log(`Email is dynamic — no hard code`);
  console.log(`Fallback: paulcmorah@gmail.com only if needed`);
});