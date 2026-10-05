# 🩸 RAKTSETU — Smart Blood Donor Matching Platform

> **"Connecting Blood. Connecting Lives."**

RAKTSETU is a web-based blood donor–patient matching platform that intelligently connects urgent blood requirements with registered donors based on blood group compatibility, location, availability, and emergency priority.

---

## 🚀 Features

- **Smart Matching Engine** — Blood-group compatibility logic + location proximity scoring
- **Emergency Mode** 🚨 — Urgent requests flagged and prioritized for matching
- **Real-time Status Flow** — Requester sends request → Donor accepts/declines → Status updates
- **Role-based Access** — Separate dashboards for Donors, Requesters, and Admins
- **Availability Toggle** — Donors can turn availability on/off instantly
- **Admin Dashboard** — Platform-wide stats, blood group inventory, user/request management
- **15+ Seeded Demo Donors** — Platform looks populated immediately
- **JWT Authentication** — Secure login with role-based routing

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React |
| Backend   | Python 3, Flask, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-CORS |
| Database  | SQLite (via SQLAlchemy)             |
| Auth      | JWT tokens (24-hour expiry)         |

---

## 📁 Project Structure

```
RAKTSETU/
│
├── backend/
│   ├── app.py              # Flask application factory
│   ├── config.py           # Configuration (JWT, DB, CORS)
│   ├── models.py           # SQLAlchemy models (User, DonorProfile, BloodRequest, DonationMatch)
│   ├── seed.py             # Demo data seeder
│   ├── requirements.txt    # Python dependencies
│   ├── routes/
│   │   ├── auth.py         # Register, Login, /me
│   │   ├── donors.py       # Donor profile CRUD + availability
│   │   ├── requests.py     # Blood request creation + matching trigger
│   │   ├── matches.py      # Accept/decline + send request to donor
│   │   └── admin.py        # Admin stats, user/donor/request management
│   └── services/
│       └── matching.py     # Blood compatibility + Haversine + scoring engine
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Routes + role-based protection
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Global auth state + JWT storage
│   │   │   └── ToastContext.jsx       # Toast notification system
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + all API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Public navigation bar
│   │   │   └── DashboardLayout.jsx    # Sidebar + mobile layout
│   │   └── pages/
│   │       ├── LandingPage.jsx        # Home page with hero, features, CTA
│   │       ├── LoginPage.jsx          # Login with demo credential buttons
│   │       ├── RegisterPage.jsx       # Register with role selector
│   │       ├── DonorDashboard.jsx     # Donor home + match request cards
│   │       ├── DonorProfile.jsx       # Donor profile editor
│   │       ├── RequesterDashboard.jsx # Requester home + request list
│   │       ├── CreateRequest.jsx      # Blood request form + urgency picker
│   │       ├── MatchResults.jsx       # Matching results + Send Request
│   │       ├── AdminDashboard.jsx     # Admin stats + tables
│   │       └── NotFound.jsx           # 404 page
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── setup.ps1          # One-time setup script (installs everything)
├── start_backend.ps1  # Start Flask backend
├── start_frontend.ps1 # Start React frontend
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.10+** — [python.org/downloads](https://www.python.org/downloads/) *(check "Add to PATH")*
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)

### Quick Setup (Windows PowerShell)

```powershell
# 1. Run setup (installs deps + seeds database)
.\setup.ps1

# 2. Start backend (in one terminal)
.\start_backend.ps1

# 3. Start frontend (in another terminal)
.\start_frontend.ps1

# 4. Open browser
# http://localhost:5173
```

### Manual Setup

```powershell
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python seed.py       # seeds demo data
python app.py        # starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role      | Email                      | Password       |
|-----------|----------------------------|----------------|
| Admin     | admin@raktsetu.com         | Admin@123      |
| Donor     | donor@raktsetu.com         | Donor@123      |
| Requester | requester@raktsetu.com     | Requester@123  |

Additional seeded donors: `simran@demo.com`, `aman@demo.com`, etc. — all with password `Donor@123`

---

## 🔌 API Overview

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| POST   | /api/auth/register              | Register new user                  |
| POST   | /api/auth/login                 | Login, returns JWT                 |
| GET    | /api/auth/me                    | Get current user                   |
| GET    | /api/donors                     | List available donors              |
| GET    | /api/donors/me                  | Get my donor profile               |
| POST   | /api/donors/me                  | Create/update donor profile        |
| PATCH  | /api/donors/me/availability     | Toggle availability                |
| POST   | /api/requests                   | Create blood request (triggers match) |
| GET    | /api/requests                   | Get requests (role-filtered)       |
| GET    | /api/requests/:id/matches       | Get match results for a request    |
| POST   | /api/matches/:id/respond        | Donor accepts/declines             |
| GET    | /api/matches/donor/me           | Get all matches for current donor  |
| POST   | /api/matches/send/:reqId/:donId | Requester sends request to donor   |
| GET    | /api/admin/stats                | Admin platform statistics          |
| GET    | /api/admin/users                | Admin user list                    |
| GET    | /api/admin/requests             | Admin all requests                 |
| GET    | /api/admin/donors               | Admin donor list                   |
| DELETE | /api/admin/users/:id            | Admin delete user                  |

---

## 🧠 Matching Algorithm

When a blood request is created, RAKTSETU automatically scores all registered donors:

```
Score breakdown (max 100):
  +50  Blood group compatible
  +30  Donor is currently available
  +15  Within 5 km  (if coordinates available)
  +10  Within 10 km
  +5   Within 20 km / same city
  +5   Urgent request bonus

  Mandatory: Blood compatibility + availability (score = 0 if either fails)
  Eligibility: Donors flagged if last donation < 56 days ago
```

**Blood compatibility chart (donor → recipient):**
```
O-  → Everyone (universal donor)
O+  → O+, A+, B+, AB+
A-  → A-, A+, AB-, AB+
A+  → A+, AB+
B-  → B-, B+, AB-, AB+
B+  → B+, AB+
AB- → AB-, AB+
AB+ → AB+ only
```

Location distance uses the **Haversine formula** with pre-seeded city coordinates. Demo donors in Ludhiana have realistic lat/lon coordinates.

---

## 🗄️ Database Models

- **User** — id, name, email, password_hash, role, phone, created_at
- **DonorProfile** — user_id, blood_group, city, area, availability, last_donation_date, latitude, longitude
- **BloodRequest** — requester_id, blood_group, units_required, hospital_name, hospital_location, city, urgency, status
- **DonationMatch** — blood_request_id, donor_id, match_score, distance, status

---

## 📺 Demo Flow

1. **Login as Requester** → `requester@raktsetu.com / Requester@123`
2. Click **Create Blood Request**
3. Select **O+**, **2 units**, **DMC Hospital**, **Ludhiana**, **🚨 URGENT**
4. Click **Find Potential Donors** → matching engine runs instantly
5. Match results appear with scores and reasons
6. Click **Send Request** on a donor card
7. **Login as Donor** → `donor@raktsetu.com / Donor@123`
8. See the incoming request in dashboard
9. Click **Accept** — requester status updates

---

## 🔮 Future Enhancements

- Real-time GPS tracking and live map view (Google Maps API)
- SMS/WhatsApp notifications via Twilio
- Push notifications (Firebase)
- OTP-based phone verification
- Hospital & blood bank API integration
- AI-based demand and inventory prediction
- Verified donor badges
- Multi-city/multi-language support
- Blood inventory management for hospitals

---

## ⚠️ Disclaimer

RAKTSETU is a coordination platform and **does not replace** professional medical advice, blood banks, hospitals, or compatibility testing. Blood compatibility must be confirmed by a qualified medical professional before any transfusion.

---

*Built with ❤️ for RAKTSETU — Smart Blood Donor Matching Platform*
