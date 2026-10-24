// Lender Dashboard & Inventory Management Functions

/**
 * Handle Equipment Type dropdown change to toggle custom type input
 */
function handleEquipmentTypeChange() {
    const typeSelect = document.getElementById("new-type");
    const customContainer = document.getElementById("custom-type-container");
    const customInput = document.getElementById("new-type-custom");

    if (typeSelect && customContainer && customInput) {
        if (typeSelect.value === "Other") {
            customContainer.classList.remove("hidden");
            customInput.required = true;
            customInput.focus();
        } else {
            customContainer.classList.add("hidden");
            customInput.required = false;
            customInput.value = "";
        }
    }
}

/**
 * Main render function for Lender View
 */
function renderLenderDashboard() {
    renderLenderListings();
    renderIncomingRequests();
    updateLenderKPIs();
}

/**
 * Helper to check if the item is owned by the logged-in user
 */
function isUserEquipmentOwner(ownerName, currentUser) {
    if (!currentUser || !currentUser.name) return false;
    const userName = currentUser.name.trim();
    const itemOwner = (ownerName || "").trim();

    if (itemOwner === userName || itemOwner === "Self") return true;
    if ((userName === "Ramesh Kumar" || userName === "Ramesh") && (itemOwner === "Ramesh Kumar" || itemOwner === "Ramesh" || itemOwner === "Self")) {
        return true;
    }
    return false;
}

/**
 * Dynamically calculate & render Lender KPIs
 */
function updateLenderKPIs() {
    const data = getEquipmentData();
    const requests = getBookingRequests();
    const currentUser = getUserProfile();

    const myEquipment = data.filter(d => isUserEquipmentOwner(d.owner, currentUser));
    const myMachineNames = myEquipment.map(m => m.name);

    const myRequests = requests.filter(r => {
        if (r.machineOwner && isUserEquipmentOwner(r.machineOwner, currentUser)) return true;
        if (myMachineNames.includes(r.machineName)) return true;
        return false;
    });

    const acceptedRequests = myRequests.filter(r => r.status === "ACCEPTED");
    const pendingRequests = myRequests.filter(r => r.status === "PENDING");

    // Dynamic Earnings calculation: payout of accepted requests for user's fleet
    const acceptedPayouts = acceptedRequests.reduce((sum, r) => sum + (r.payout || 0), 0);
    const totalEarnings = acceptedPayouts;

    // Active machinery count
    const activeFleetCount = myEquipment.filter(d => d.available).length;

    // Fleet utilization calculation
    const totalFleetCount = myEquipment.length;
    const utilizationRate = totalFleetCount === 0 ? 0 : Math.min(100, Math.round((activeFleetCount / totalFleetCount) * 100));

    // Update DOM Elements
    const earningsEl = document.getElementById("kpi-total-earnings");
    if (earningsEl) earningsEl.textContent = `₹${totalEarnings.toLocaleString()}`;

    const activeEl = document.getElementById("kpi-active-count");
    if (activeEl) activeEl.textContent = myEquipment.length;

    const pendingEl = document.getElementById("kpi-pending-count");
    if (pendingEl) pendingEl.textContent = pendingRequests.length;

    const pendingSubtext = document.getElementById("kpi-pending-subtext");
    if (pendingSubtext) {
        pendingSubtext.textContent = pendingRequests.length > 0 ? "Requires confirmation" : "All requests handled";
        pendingSubtext.className = pendingRequests.length > 0 ? "text-[11px] text-error mt-1 font-semibold" : "text-[11px] text-primary mt-1 font-semibold";
    }

    const utilEl = document.getElementById("kpi-utilization-rate");
    if (utilEl) utilEl.textContent = `${utilizationRate}%`;

    const utilBar = document.getElementById("kpi-utilization-bar");
    if (utilBar) utilBar.style.width = `${utilizationRate}%`;

    const incomingBadge = document.getElementById("incoming-badge-count");
    if (incomingBadge) incomingBadge.textContent = `${pendingRequests.length} Pending`;
}

/**
 * Render Fleet Inventory List with Toggle & Delete Controls
 */
function renderLenderListings() {
    const list = document.getElementById("lender-inventory-list");
    if (!list) return;

    const data = getEquipmentData();
    const currentUser = getUserProfile();

    const myEquipment = data.filter(item => isUserEquipmentOwner(item.owner, currentUser));
    list.innerHTML = "";

    if (myEquipment.length === 0) {
        list.innerHTML = `
            <div class="p-6 bg-surface border border-outline-variant/30 rounded-2xl text-center space-y-2">
                <span class="material-symbols-outlined text-3xl text-on-surface-variant">inventory_2</span>
                <p class="font-bold text-on-surface text-sm">No Equipment Listed</p>
                <p class="text-xs text-on-surface-variant">Click "+ Add New Equipment" above to list your machinery.</p>
            </div>
        `;
        return;
    }

    myEquipment.forEach(item => {
        list.innerHTML += `
            <div class="flex items-center justify-between p-4 bg-surface border border-outline-variant/30 rounded-2xl gap-3">
                <div class="flex items-center gap-3">
                    <img src="${item.img}" class="w-16 h-16 rounded-xl object-cover" alt="${item.name}">
                    <div>
                        <h4 class="font-bold text-on-surface text-sm">${item.name}</h4>
                        <p class="text-xs text-on-surface-variant">Type: ${item.type} • Rate: ₹${item.rate}/hr • ${item.location}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="toggleAvailability(${item.id})" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all scale-tap ${item.available ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-error/10 text-error hover:bg-error/20'}">
                        ${item.available ? 'Active' : 'Paused'}
                    </button>
                    <button onclick="deleteEquipment(${item.id})" class="p-2 rounded-xl text-error hover:bg-error/10 transition-all scale-tap" title="Delete Equipment">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
        `;
    });
}

/**
 * Delete equipment item from inventory and update storage/views
 */
function deleteEquipment(id) {
    const data = getEquipmentData();
    const item = data.find(d => d.id === id);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}" from your equipment listings?`)) {
        const updatedData = data.filter(d => d.id !== id);
        setEquipmentData(updatedData);
        
        // Synchronize all views
        renderLenderDashboard();
        renderListings();
        if (typeof updateMapMarkers === "function") updateMapMarkers();
        alert(`"${item.name}" has been deleted successfully.`);
    }
}

/**
 * Render Incoming Booking Requests Queue Dynamically
 */
function renderIncomingRequests() {
    const queue = document.getElementById("lender-requests-queue");
    if (!queue) return;

    const requests = getBookingRequests();
    const data = getEquipmentData();
    const currentUser = getUserProfile();

    const myEquipment = data.filter(item => isUserEquipmentOwner(item.owner, currentUser));
    const myMachineNames = myEquipment.map(m => m.name);

    const activeQueue = requests.filter(r => {
        if (r.status !== "PENDING" && r.status !== "ACCEPTED") return false;
        
        if (r.machineOwner && isUserEquipmentOwner(r.machineOwner, currentUser)) {
            return true;
        }
        if (myMachineNames.includes(r.machineName)) {
            return true;
        }
        return false;
    });

    if (activeQueue.length === 0) {
        queue.innerHTML = `
            <div class="p-6 bg-surface border border-outline-variant/30 rounded-2xl text-center space-y-2">
                <span class="material-symbols-outlined text-3xl text-on-surface-variant">inbox</span>
                <p class="font-bold text-on-surface text-sm">No Pending Requests</p>
                <p class="text-xs text-on-surface-variant">New booking requests created by local farmers for your fleet will appear here live.</p>
            </div>
        `;
        return;
    }

    queue.innerHTML = "";
    activeQueue.forEach(req => {
        const isAccepted = req.status === "ACCEPTED";
        const reqDateStr = req.bookingDate ? formatDisplayDate(req.bookingDate) : "Today";
        const timeSlotStr = (req.startTime && req.endTime) ? `${req.startTime} - ${req.endTime}` : `${req.hours} Hours`;
        const bufferStr = req.endTime ? `Buffer: +30m post-use` : `30m Buffer`;

        queue.innerHTML += `
            <div class="p-5 bg-surface border-2 ${isAccepted ? 'border-primary/40' : 'border-secondary-container/40'} rounded-2xl shadow-sm space-y-3">
                <div class="flex justify-between items-start">
                    <div class="flex gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">${req.initials || 'FK'}</div>
                        <div>
                            <h4 class="font-bold text-on-surface text-sm">${req.renterName}</h4>
                            <p class="text-xs text-on-surface-variant">${req.village} (${req.distance})</p>
                        </div>
                    </div>
                    <span class="${isAccepted ? 'bg-primary/20 text-primary' : 'bg-secondary-container text-on-secondary-container'} text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        ${req.status}
                    </span>
                </div>

                <div class="bg-surface-container-low p-3 rounded-xl space-y-1 text-xs">
                    <div class="flex justify-between items-center font-semibold text-on-surface">
                        <span>🚜 <strong>${req.machineName}</strong></span>
                        <span class="text-primary font-bold">Payout: ₹${(req.payout || 0).toLocaleString()}</span>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/30">
                        <span>📅 <strong>${reqDateStr}</strong> | ⏱ ${timeSlotStr} (${req.hours}h)</span>
                        <span class="text-secondary font-semibold">🚚 ${bufferStr}</span>
                    </div>
                </div>

                ${!isAccepted ? `
                    <div class="flex gap-2">
                        <button onclick="declineBookingRequest(${req.id})" class="flex-1 py-2 rounded-xl border border-outline text-xs font-bold hover:bg-surface-container-high scale-tap transition-all">
                            Decline
                        </button>
                        <button onclick="acceptBookingRequest(${req.id})" class="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container scale-tap transition-all">
                            Accept & Lock Schedule
                        </button>
                    </div>
                ` : `
                    <div class="pt-2 border-t border-outline-variant/30 space-y-2">
                        <p class="text-xs font-semibold text-primary flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">local_shipping</span> Schedule Locked • Delivery Dispatched
                        </p>
                        <div class="flex gap-2">
                            <input id="pin-input-${req.id}" type="text" maxlength="6" placeholder="Enter Renter 6-Digit PIN" class="flex-1 h-9 px-3 rounded-lg border border-outline text-xs font-mono tracking-widest outline-none">
                            <button onclick="verifyHandoffPin(${req.id}, '${req.pin}')" class="px-3 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container scale-tap">
                                Verify & Start
                            </button>
                        </div>
                    </div>
                `}
            </div>
        `;
    });
}

async function acceptBookingRequest(id) {
    if (typeof updateBookingStatusAsync === "function") {
        await updateBookingStatusAsync(id, "ACCEPTED");
    } else {
        let requests = getBookingRequests();
        requests = requests.map(r => r.id === id ? { ...r, status: "ACCEPTED" } : r);
        setBookingRequests(requests);
    }
    renderLenderDashboard();
    alert("Booking Request Accepted! Delivery dispatched to farmer.");
}

async function declineBookingRequest(id) {
    if (typeof updateBookingStatusAsync === "function") {
        await updateBookingStatusAsync(id, "DECLINED");
    } else {
        let requests = getBookingRequests();
        requests = requests.map(r => r.id === id ? { ...r, status: "DECLINED" } : r);
        setBookingRequests(requests);
    }
    renderLenderDashboard();
    alert("Booking request declined.");
}

async function verifyHandoffPin(id, expectedPin) {
    const inputEl = document.getElementById(`pin-input-${id}`);
    if (!inputEl) return;
    const enteredPin = inputEl.value.trim();

    if (enteredPin === expectedPin) {
        if (typeof updateBookingStatusAsync === "function") {
            await updateBookingStatusAsync(id, "COMPLETED");
        }
        let requests = getBookingRequests();
        requests = requests.filter(r => r.id !== id);
        setBookingRequests(requests);
        renderLenderDashboard();
        alert("✓ 6-Digit Handshake PIN Verified!\nEquipment handoff complete and rental session started.");
    } else {
        alert("❌ Invalid Handshake PIN. Please check the 6-digit PIN provided by the renter.");
    }
}

function toggleAvailability(id) {
    let data = getEquipmentData();
    data = data.map(item => item.id === id ? { ...item, available: !item.available } : item);
    setEquipmentData(data);
    renderLenderDashboard();
    renderListings();
    updateMapMarkers();
}

function openAddModal() {
    document.getElementById("add-modal").classList.remove("hidden");
}

function closeAddModal() {
    document.getElementById("add-modal").classList.add("hidden");
}

async function saveNewEquipment(e) {
    e.preventDefault();

    const selectedType = document.getElementById("new-type").value;
    const customType = document.getElementById("new-type-custom").value.trim();

    const finalType = (selectedType === "Other" && customType) ? customType : (selectedType === "Other" ? "Custom Equipment" : selectedType);
    
    const currentUser = getUserProfile();
    const newItem = {
        name: document.getElementById("new-name").value,
        type: finalType,
        owner: currentUser.name || "Ramesh Kumar",
        location: document.getElementById("new-location").value,
        rate: parseInt(document.getElementById("new-rate").value),
        dist: "0.5 km away",
        img: "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=600&q=80",
        lat: 16.1885 + (Math.random() - 0.5) * 0.02,
        lng: 81.1465 + (Math.random() - 0.5) * 0.02,
        available: true
    };

    if (typeof saveEquipmentAsync === "function") {
        await saveEquipmentAsync(newItem);
    } else {
        const data = getEquipmentData();
        data.unshift({ id: Date.now(), ...newItem });
        setEquipmentData(data);
    }

    // Reset form & hide custom type input
    document.getElementById("add-equipment-form").reset();
    handleEquipmentTypeChange();

    closeAddModal();
    renderLenderDashboard();
    renderListings();
    if (typeof updateMapMarkers === "function") updateMapMarkers();
    alert(`New machinery "${newItem.name}" (${finalType}) successfully added to FARMSHARE!`);
}
