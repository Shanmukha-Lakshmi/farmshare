// Seed Data and Data Storage Utilities for FARMSHARE

const initialEquipment = [
    // NEARBY DISTANCES (Within 0.5 km - 3.0 km)
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
        available: true 
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
        available: true 
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
        available: true 
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
        available: true 
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
        available: true 
    },

    // FAR DISTANCES (3.5 km - 12.5 km)
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
        available: true
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
        available: true
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
        available: true
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
        available: true
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
        available: true
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
        hours: 5,
        payout: 4120,
        pin: "839201",
        status: "PENDING",
        timestamp: new Date().toISOString()
    }
];

const defaultProfile = {
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    aadhaar: "XXXX-XXXX-4829",
    village: "English Palem, Machilipatnam",
    language: "EN"
};

function initStorage() {
    if (!localStorage.getItem("farmshare_data")) {
        localStorage.setItem("farmshare_data", JSON.stringify(initialEquipment));
    }
    if (!localStorage.getItem("farmshare_booking_requests")) {
        localStorage.setItem("farmshare_booking_requests", JSON.stringify(initialBookingRequests));
    }
    if (!localStorage.getItem("farmshare_user_profile")) {
        localStorage.setItem("farmshare_user_profile", JSON.stringify(defaultProfile));
    }

    // Async sync with Backend REST API if available
    fetchEquipmentDataAsync();
    fetchBookingRequestsAsync();
}

async function fetchEquipmentDataAsync() {
    try {
        const res = await fetch('/api/equipment');
        if (res.ok) {
            const data = await res.json();
            setEquipmentData(data);
            if (typeof renderListings === "function") renderListings();
            return data;
        }
    } catch (e) {
        console.warn("Backend API offline. Utilizing local storage cache for equipment.");
    }
    return getEquipmentData();
}

async function saveEquipmentAsync(newItem) {
    try {
        const res = await fetch('/api/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        if (res.ok) {
            const saved = await res.json();
            const current = getEquipmentData();
            current.unshift(saved);
            setEquipmentData(current);
            return saved;
        }
    } catch (e) {
        console.warn("Backend API offline. Saving equipment locally.");
    }
    const current = getEquipmentData();
    const localItem = { id: Date.now(), ...newItem, available: true };
    current.unshift(localItem);
    setEquipmentData(current);
    return localItem;
}

async function fetchBookingRequestsAsync() {
    try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
            const requests = await res.json();
            setBookingRequests(requests);
            if (typeof renderLenderDashboard === "function") renderLenderDashboard();
            return requests;
        }
    } catch (e) {
        console.warn("Backend API offline. Utilizing local storage cache for bookings.");
    }
    return getBookingRequests();
}

async function saveBookingRequestAsync(bookingReq) {
    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingReq)
        });
        if (res.ok) {
            const saved = await res.json();
            const requests = getBookingRequests();
            requests.unshift(saved);
            setBookingRequests(requests);
            return saved;
        }
    } catch (e) {
        console.warn("Backend API offline. Saving booking request locally.");
    }
    const requests = getBookingRequests();
    requests.unshift(bookingReq);
    setBookingRequests(requests);
    return bookingReq;
}

async function updateBookingStatusAsync(id, status) {
    try {
        const res = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            const requests = getBookingRequests();
            const idx = requests.findIndex(r => r.id === id);
            if (idx !== -1) {
                requests[idx].status = status;
                setBookingRequests(requests);
            }
            return true;
        }
    } catch (e) {
        console.warn("Backend API offline. Updating booking status locally.");
    }
    const requests = getBookingRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx !== -1) {
        requests[idx].status = status;
        setBookingRequests(requests);
    }
    return true;
}

function getEquipmentData() {
    return JSON.parse(localStorage.getItem("farmshare_data")) || initialEquipment;
}

function setEquipmentData(data) {
    localStorage.setItem("farmshare_data", JSON.stringify(data));
}

function getBookingRequests() {
    return JSON.parse(localStorage.getItem("farmshare_booking_requests")) || initialBookingRequests;
}

function setBookingRequests(requests) {
    localStorage.setItem("farmshare_booking_requests", JSON.stringify(requests));
}

function getUserProfile() {
    return JSON.parse(localStorage.getItem("farmshare_user_profile")) || defaultProfile;
}

function setUserProfile(profile) {
    localStorage.setItem("farmshare_user_profile", JSON.stringify(profile));
}

