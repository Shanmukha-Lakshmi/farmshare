const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. GET /api/equipment - Fetch all equipment
app.get('/api/equipment', (req, res) => {
    const { category, type } = req.query;
    let query = "SELECT * FROM equipment WHERE available = 1";
    let params = [];

    const selectedType = category || type;
    if (selectedType && selectedType !== 'all') {
        query += " AND type = ?";
        params.push(selectedType);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Convert integer boolean available to boolean
        const formatted = rows.map(r => ({ ...r, available: Boolean(r.available) }));
        res.json(formatted);
    });
});

// 2. POST /api/equipment - Add new machinery listing (Lender)
app.post('/api/equipment', (req, res) => {
    const { name, type, owner, location, rate, dist, img, lat, lng } = req.body;

    if (!name || !type || !rate || !location) {
        return res.status(400).json({ error: "Missing required equipment fields (name, type, rate, location)" });
    }

    const defaultImg = "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=600&q=80";
    const newLat = lat || 16.1885;
    const newLng = lng || 81.1350;
    const newDist = dist || "1.0 km away";

    const query = `
        INSERT INTO equipment (name, type, owner, location, rate, dist, img, lat, lng, available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(query, [name, type, owner || "Ramesh Kumar", location, rate, newDist, img || defaultImg, newLat, newLng], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id: this.lastID,
            name, type, owner: owner || "Ramesh Kumar", location, rate, dist: newDist, img: img || defaultImg, lat: newLat, lng: newLng, available: true
        });
    });
});

// 3. GET /api/bookings - Fetch booking requests (Lender Queue)
app.get('/api/bookings', (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 4. POST /api/bookings - Create new booking request (Renter)
app.post('/api/bookings', (req, res) => {
    const { renterName, village, distance, machineName, machineOwner, hours, payout, pin, bookingDate, startTime, endTime, bufferMinutes } = req.body;

    if (!machineName || !hours || !payout) {
        return res.status(400).json({ error: "Missing booking parameters" });
    }

    const generatedPin = pin || String(Math.floor(100000 + Math.random() * 900000));
    const name = renterName || "Ramesh Kumar";
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
    const renterVillage = village || "English Palem";
    const dist = distance || "1.5 km away";
    const owner = machineOwner || "Self";
    const timestamp = new Date().toISOString();
    const bDate = bookingDate || new Date().toISOString().split('T')[0];
    const sTime = startTime || "06:00 AM";
    const eTime = endTime || "10:00 AM";
    const bBuffer = parseInt(bufferMinutes) || 30;

    const query = `
        INSERT INTO bookings (renterName, initials, village, distance, machineName, machineOwner, hours, payout, pin, status, timestamp, bookingDate, startTime, endTime, bufferMinutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
    `;

    db.run(query, [name, initials, renterVillage, dist, machineName, owner, hours, payout, generatedPin, timestamp, bDate, sTime, eTime, bBuffer], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id: this.lastID,
            renterName: name,
            initials,
            village: renterVillage,
            distance: dist,
            machineName,
            machineOwner: owner,
            hours,
            payout,
            pin: generatedPin,
            status: "PENDING",
            timestamp,
            bookingDate: bDate,
            startTime: sTime,
            endTime: eTime,
            bufferMinutes: bBuffer
        });
    });
});

// 5. PATCH /api/bookings/:id - Accept / Decline / Complete booking
app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Status field is required (ACCEPTED, REJECTED, COMPLETED)" });
    }

    db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Booking request not found" });
        }
        res.json({ success: true, id, status });
    });
});

// 6. POST /api/auth/login - User Login
app.post('/api/auth/login', (req, res) => {
    const { phone, pin } = req.body;
    const cleanPhone = String(phone).replace(/\D/g, '');

    db.get("SELECT * FROM users WHERE phone = ?", [cleanPhone], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (user) {
            const expectedPin = String(user.pin || "1234").trim();
            const enteredPin = String(pin || "").trim();

            if (enteredPin !== expectedPin) {
                return res.status(401).json({
                    success: false,
                    error: "Incorrect 4-Digit Security PIN / Password. Access denied."
                });
            }
            return res.json({ success: true, user });
        }
        return res.status(404).json({
            success: false,
            error: "No account found with this phone number. Please register your account using the E-KYC Register form."
        });
    });
});

// 7. POST /api/auth/signup - User Registration with Aadhaar verification
app.post('/api/auth/signup', (req, res) => {
    const { name, phone, aadhaar, village, pin } = req.body;

    if (!name || !phone || !aadhaar) {
        return res.status(400).json({ error: "Name, phone number, and Aadhaar card details are required" });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const fullVillage = (village || "English Palem") + ", Machilipatnam";
    const userPin = pin || "1234";

    db.run(
        "INSERT INTO users (name, phone, aadhaar, village, language, pin, created_at) VALUES (?, ?, ?, ?, 'EN', ?, ?)",
        [name, cleanPhone, aadhaar, fullVillage, userPin, new Date().toISOString()],
        function(err) {
            if (err) {
                // If phone already exists, update user profile & PIN
                db.run(
                    "UPDATE users SET name = ?, aadhaar = ?, village = ?, pin = ? WHERE phone = ?",
                    [name, aadhaar, fullVillage, userPin, cleanPhone],
                    function(err2) {
                        if (err2) return res.status(500).json({ error: err2.message });
                        res.json({ success: true, user: { name, phone: cleanPhone, aadhaar, village: fullVillage, language: "EN", pin: userPin } });
                    }
                );
            } else {
                res.status(201).json({ success: true, user: { id: this.lastID, name, phone: cleanPhone, aadhaar, village: fullVillage, language: "EN", pin: userPin } });
            }
        }
    );
});

// Fallback index.html route for SPA navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌾 FARMSHARE REST API Backend Server Running!`);
    console.log(`📍 Web App URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
