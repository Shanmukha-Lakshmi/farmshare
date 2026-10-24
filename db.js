const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'farmshare.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite Database at:', dbPath);
    }
});

// Initial Seed Data
const initialEquipment = [
    { 
        id: 1, 
        name: "Mahindra 575 DI (45 HP)", 
        type: "Tractor", 
        owner: "Ramesh Kumar", 
        location: "English Palem", 
        rate: 1200, 
        dist: "1.2 km away", 
        img: "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=600&q=80", 
        lat: 16.1885, 
        lng: 81.1350, 
        available: 1 
    },
    { 
        id: 2, 
        name: "Maschio Rotavator 6ft", 
        type: "Rotavator", 
        owner: "Kumar Raja", 
        location: "Tallapalem", 
        rate: 800, 
        dist: "0.8 km away", 
        img: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80", 
        lat: 16.1780, 
        lng: 81.1400, 
        available: 1 
    },
    { 
        id: 3, 
        name: "VST Shakti Power Weeder 7HP", 
        type: "Power Weeder", 
        owner: "Satya Narayana", 
        location: "English Palem", 
        rate: 450, 
        dist: "1.5 km away", 
        img: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80", 
        lat: 16.1850, 
        lng: 81.1480, 
        available: 1 
    },
    { 
        id: 4, 
        name: "Sonalika DI 745 III (50 HP)", 
        type: "Tractor", 
        owner: "Venkateswara Rao", 
        location: "Ramanaidupet", 
        rate: 1150, 
        dist: "2.1 km away", 
        img: "images/sonalika_di_745.png", 
        lat: 16.1950, 
        lng: 81.1500, 
        available: 1 
    },
    { 
        id: 5, 
        name: "Shrachi Power Tiller 15HP", 
        type: "Power Weeder", 
        owner: "Suresh Babu", 
        location: "Ramanaidupet", 
        rate: 600, 
        dist: "2.8 km away", 
        img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80", 
        lat: 16.1980, 
        lng: 81.1550, 
        available: 1 
    },
    {
        id: 6,
        name: "Kubota DC-68G Combine Harvester",
        type: "Harvester",
        owner: "Chandra Sekhar",
        location: "Chilakalapudi Cluster",
        rate: 2400,
        dist: "4.2 km away",
        img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80",
        lat: 16.2100,
        lng: 81.1650,
        available: 1
    },
    {
        id: 7,
        name: "John Deere 5050D (50 HP)",
        type: "Tractor",
        owner: "Koteswara Rao",
        location: "Pedana Road",
        rate: 1400,
        dist: "5.8 km away",
        img: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80",
        lat: 16.2550,
        lng: 81.1420,
        available: 1
    },
    {
        id: 8,
        name: "Shaktiman Paddy Straw Baler",
        type: "Harvester",
        owner: "Nageswara Rao",
        location: "Gudur Mandalam",
        rate: 1800,
        dist: "7.5 km away",
        img: "https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=600&q=80",
        lat: 16.3300,
        lng: 81.1150,
        available: 1
    },
    {
        id: 9,
        name: "New Holland 3630 TX Plus",
        type: "Tractor",
        owner: "Rama Krishna",
        location: "Bantumilli Junction",
        rate: 1500,
        dist: "9.2 km away",
        img: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80",
        lat: 16.2400,
        lng: 81.2200,
        available: 1
    },
    {
        id: 10,
        name: "Fieldking Heavy Duty Disc Harrow",
        type: "Rotavator",
        owner: "Srinivasa Rao",
        location: "Avanigadda Highway",
        rate: 950,
        dist: "12.5 km away",
        img: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80",
        lat: 16.1200,
        lng: 81.0800,
        available: 1
    }
];

const initialBookingRequests = [
    {
        id: 101,
        renterName: "Suresh K.",
        initials: "SK",
        village: "Ramanaidupet",
        distance: "2.1 km away",
        machineName: "Mahindra 575 DI (45 HP)",
        machineOwner: "Ramesh Kumar",
        hours: 4,
        payout: 4920,
        pin: "485129",
        status: "PENDING",
        timestamp: new Date().toISOString()
    },
    {
        id: 102,
        renterName: "Anil V.",
        initials: "AV",
        village: "Tallapalem",
        distance: "1.8 km away",
        machineName: "Maschio Rotavator 6ft",
        machineOwner: "Kumar Raja",
        hours: 5,
        payout: 4120,
        pin: "839201",
        status: "PENDING",
        timestamp: new Date().toISOString()
    }
];

const defaultUser = {
    name: "Ramesh Kumar",
    phone: "9876543210",
    aadhaar: "5839-2014-4829",
    village: "English Palem, Machilipatnam",
    language: "EN",
    pin: "1234"
};

// Initialize Tables & Seed Data
db.serialize(() => {
    // Create Equipment Table
    db.run(`
        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            owner TEXT NOT NULL,
            location TEXT NOT NULL,
            rate REAL NOT NULL,
            dist TEXT NOT NULL,
            img TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            available INTEGER DEFAULT 1
        )
    `);

    // Create Bookings Table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            renterName TEXT NOT NULL,
            initials TEXT NOT NULL,
            village TEXT NOT NULL,
            distance TEXT NOT NULL,
            machineName TEXT NOT NULL,
            machineOwner TEXT DEFAULT '',
            hours INTEGER NOT NULL,
            payout REAL NOT NULL,
            pin TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            timestamp TEXT NOT NULL,
            bookingDate TEXT DEFAULT '',
            startTime TEXT DEFAULT '06:00 AM',
            endTime TEXT DEFAULT '10:00 AM',
            bufferMinutes INTEGER DEFAULT 30
        )
    `);

    // Ensure columns exist if table was created earlier
    const alterColumns = [
        "ALTER TABLE bookings ADD COLUMN bookingDate TEXT DEFAULT ''",
        "ALTER TABLE bookings ADD COLUMN startTime TEXT DEFAULT '06:00 AM'",
        "ALTER TABLE bookings ADD COLUMN endTime TEXT DEFAULT '10:00 AM'",
        "ALTER TABLE bookings ADD COLUMN bufferMinutes INTEGER DEFAULT 30"
    ];
    alterColumns.forEach(sql => {
        db.run(sql, () => {}); // Ignore error if column already exists
    });

    // Create Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            aadhaar TEXT NOT NULL,
            village TEXT NOT NULL,
            language TEXT DEFAULT 'EN',
            pin TEXT DEFAULT '1234',
            created_at TEXT NOT NULL
        )
    `);

    // Seed equipment if empty
    db.get("SELECT COUNT(*) AS count FROM equipment", (err, row) => {
        if (err) return console.error("Database query error:", err.message);
        if (row.count === 0) {
            console.log("Seeding equipment table...");
            const stmt = db.prepare(`
                INSERT INTO equipment (id, name, type, owner, location, rate, dist, img, lat, lng, available)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            initialEquipment.forEach(item => {
                stmt.run(item.id, item.name, item.type, item.owner, item.location, item.rate, item.dist, item.img, item.lat, item.lng, item.available);
            });
            stmt.finalize();
        }
    });

    // Seed bookings if empty
    db.get("SELECT COUNT(*) AS count FROM bookings", (err, row) => {
        if (err) return console.error("Database query error:", err.message);
        if (row.count === 0) {
            console.log("Seeding bookings table...");
            const stmt = db.prepare(`
                INSERT INTO bookings (id, renterName, initials, village, distance, machineName, machineOwner, hours, payout, pin, status, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            initialBookingRequests.forEach(b => {
                stmt.run(b.id, b.renterName, b.initials, b.village, b.distance, b.machineName, b.machineOwner, b.hours, b.payout, b.pin, b.status, b.timestamp);
            });
            stmt.finalize();
        }
    });

    // Seed default user if empty
    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
        if (err) return console.error("Database query error:", err.message);
        if (row.count === 0) {
            console.log("Seeding default user...");
            db.run(
                `INSERT INTO users (name, phone, aadhaar, village, language, pin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [defaultUser.name, defaultUser.phone, defaultUser.aadhaar, defaultUser.village, defaultUser.language, defaultUser.pin, new Date().toISOString()]
            );
        }
    });
});

module.exports = db;
