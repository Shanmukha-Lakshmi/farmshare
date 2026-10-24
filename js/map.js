// Interactive Map Module (Leaflet.js centered on Machilipatnam)

let map = null;
let mapMarkers = [];

/**
 * Get Material Symbol icon name for vehicle equipment category
 */
function getCategoryIcon(type) {
    switch (type) {
        case 'Tractor': return 'agriculture';
        case 'Rotavator': return 'settings';
        case 'Power Weeder': return 'eco';
        case 'Harvester': return 'grass';
        default: return 'agriculture';
    }
}

/**
 * Create custom circular vehicle photo pin marker
 */
function createCustomMarkerIcon(item) {
    const iconName = getCategoryIcon(item.type);
    const html = `
        <div class="custom-map-pin scale-tap">
            <div class="pin-circle">
                <img src="${item.img}" class="pin-photo" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=150&q=80'">
            </div>
            <div class="pin-category-badge" title="${item.type}">
                <span class="material-symbols-outlined text-[11px]">${iconName}</span>
            </div>
        </div>
    `;

    return L.divIcon({
        html: html,
        className: 'custom-leaflet-marker-wrapper',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44]
    });
}

function initMap() {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl) return;

    // Clean up existing map instance to prevent "Map container is already initialized" error
    if (map) {
        map.remove();
        map = null;
    }

    try {
        map = L.map('leaflet-map').setView([16.188515, 81.146509], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        if (typeof renderListings === 'function') {
            renderListings();
        } else {
            updateMapMarkers();
        }

        // Refresh Leaflet dimensions after DOM container visibility transition
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 300);
    } catch (err) {
        console.error("Leaflet Map Initialization Error:", err);
    }
}

function updateMapMarkers() {
    const data = getEquipmentData();
    updateMapMarkersFiltered(data.filter(item => item.available));
}

function updateMapMarkersFiltered(items = []) {
    if (!map) return;
    mapMarkers.forEach(marker => map.removeLayer(marker));
    mapMarkers = [];

    const currentUser = getUserProfile();

    items.forEach(item => {
        const isOwner = (item.owner === currentUser.name || item.owner === "Self" || item.owner === "Ramesh" || item.owner === "Ramesh Kumar");
        const customIcon = createCustomMarkerIcon(item);

        const actionButtonHtml = isOwner
            ? `<div class="w-full text-xs font-bold text-amber-800 bg-amber-100 py-1.5 rounded-lg border border-amber-300">Your Vehicle (Owner)</div>`
            : `<button onclick="openBookingModal(${item.id})" class="w-full text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm transition-all">Book Now</button>`;

        const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map)
            .bindPopup(`
                <div class="p-1 space-y-2 text-center max-w-[200px]">
                    <img src="${item.img}" class="w-full h-24 object-cover rounded-lg" alt="${item.name}">
                    <div>
                        <h5 class="font-bold text-sm text-gray-900 leading-tight">${item.name}</h5>
                        <p class="text-xs text-gray-600 mt-0.5">${item.location} • ${item.dist}</p>
                        <p class="text-sm font-extrabold text-green-700 mt-1">₹${item.rate}/hr</p>
                    </div>
                    ${actionButtonHtml}
                </div>
            `);
        mapMarkers.push(marker);
    });
}
