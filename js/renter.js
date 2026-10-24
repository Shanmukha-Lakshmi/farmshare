// Renter Dashboard & Booking Functions

let selectedMachine = null;

/**
 * Helper to extract numeric distance in kilometers from distance string (e.g. "1.2 km away" -> 1.2)
 */
function parseDistanceNum(distStr) {
    if (typeof distStr === 'number') return distStr;
    const match = String(distStr).match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Render Equipment Grid for Renters with Category & Max Distance Radius Filtering
 */
function renderListings(filterCategory = null, maxRadius = null) {
    const grid = document.getElementById("equipment-grid");
    if (!grid) return;
    
    // Read input values if not explicitly provided
    const categorySelect = document.getElementById("search-type");
    const radiusSelect = document.getElementById("search-radius");

    const category = filterCategory || (categorySelect ? categorySelect.value : "all");
    const radiusVal = maxRadius || (radiusSelect ? radiusSelect.value : "3");

    const data = getEquipmentData();
    const currentUser = getUserProfile();
    grid.innerHTML = "";

    // Filter by availability, category, and max distance radius
    const filtered = data.filter(item => {
        if (!item.available) return false;

        // Category Filter
        const matchesCategory = (category === "all" || item.type === category);

        // Distance Filter (Default 3 km max radius)
        const itemDist = parseDistanceNum(item.dist);
        let matchesDistance = true;

        if (radiusVal !== "all") {
            const limit = parseFloat(radiusVal) || 3;
            matchesDistance = itemDist <= limit;
        }

        return matchesCategory && matchesDistance;
    });

    const infoBadge = document.getElementById("radius-badge-info");
    if (infoBadge) {
        infoBadge.textContent = radiusVal === "all" 
            ? `Showing all ${filtered.length} listings (Near & Far)`
            : `Filtered within ${radiusVal} km radius (${filtered.length} available)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2">near_me_disabled</span>
                <h4 class="font-bold text-on-surface text-base">No Machinery Available Within Selected Radius</h4>
                <p class="text-xs text-on-surface-variant mt-1">Try expanding your search radius to 5 km or selecting "Any Distance".</p>
            </div>
        `;
        if (typeof updateMapMarkersFiltered === "function") {
            updateMapMarkersFiltered([]);
        }
        return;
    }

    filtered.forEach(item => {
        // Check if the current user is the owner of this vehicle
        const isOwner = (item.owner === currentUser.name || item.owner === "Self" || item.owner === "Ramesh" || item.owner === "Ramesh Kumar");

        grid.innerHTML += `
            <div class="bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                <div>
                    <div class="h-44 relative">
                        <img src="${item.img}" class="w-full h-full object-cover" alt="${item.name}">
                        <span class="absolute top-3 left-3 bg-primary/90 text-on-primary text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">near_me</span> ${item.dist}
                        </span>
                        ${isOwner ? `<span class="absolute top-3 right-3 bg-secondary text-on-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Your Vehicle</span>` : ''}
                    </div>
                    <div class="p-4 space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-on-surface text-base">${item.name}</h4>
                                <p class="text-xs text-on-surface-variant">Owner: ${isOwner ? '<strong class="text-secondary">You (Owner)</strong>' : item.owner} • ${item.location}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-secondary font-extrabold text-lg">₹${item.rate}</p>
                                <p class="text-[10px] text-on-surface-variant">per hour</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-4 pt-0">
                    ${isOwner ? `
                        <button onclick="alert('You are the owner of this machinery. You cannot book your own equipment! Please manage availability and rates in Lender Mode.')" class="w-full h-10 bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1" title="Owner cannot book their own equipment">
                            <span class="material-symbols-outlined text-sm">block</span> Your Vehicle
                        </button>
                    ` : `
                        <button onclick="openBookingModal(${item.id})" class="w-full h-10 bg-secondary-container text-on-secondary-container font-bold text-xs rounded-xl hover:brightness-95 scale-tap transition-all">
                            Book Now
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    // Sync Leaflet Map markers with filtered results
    if (typeof updateMapMarkersFiltered === "function") {
        updateMapMarkersFiltered(filtered);
    }
}

function filterListings() {
    renderListings();
}

let currentSelectedDateStr = new Date().toISOString().split('T')[0];

function formatDisplayDate(dateStr) {
    if (!dateStr) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];
    
    if (dateStr === today) return "Today (" + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ")";
    if (dateStr === tomorrow) return "Tomorrow (" + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ")";
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDateStringOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function selectQuickDate(type) {
    let dateStr = new Date().toISOString().split('T')[0];
    if (type === 'today') dateStr = getDateStringOffset(0);
    else if (type === 'tomorrow') dateStr = getDateStringOffset(1);
    else if (type === 'dayafter') dateStr = getDateStringOffset(2);
    
    currentSelectedDateStr = dateStr;
    const dateInput = document.getElementById("modal-date-input");
    if (dateInput) dateInput.value = dateStr;

    updateDateButtonStyles(type);
    calculateFare();
}

function updateDateButtonStyles(activeType) {
    const todayBtn = document.getElementById("date-btn-today");
    const tomorrowBtn = document.getElementById("date-btn-tomorrow");
    const dayafterBtn = document.getElementById("date-btn-dayafter");

    const activeClass = "py-2.5 px-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-xs shadow-xs text-center transition-all";
    const inactiveClass = "py-2.5 px-3 rounded-xl border border-outline/40 bg-surface text-on-surface-variant font-semibold text-xs text-center hover:bg-surface-container transition-all";

    if (todayBtn) todayBtn.className = (activeType === 'today') ? activeClass : inactiveClass;
    if (tomorrowBtn) tomorrowBtn.className = (activeType === 'tomorrow') ? activeClass : inactiveClass;
    if (dayafterBtn) dayafterBtn.className = (activeType === 'dayafter') ? activeClass : inactiveClass;
}

function onCustomDateChange(val) {
    if (!val) return;
    currentSelectedDateStr = val;
    
    const todayStr = getDateStringOffset(0);
    const tomorrowStr = getDateStringOffset(1);
    const dayAfterStr = getDateStringOffset(2);

    if (val === todayStr) updateDateButtonStyles('today');
    else if (val === tomorrowStr) updateDateButtonStyles('tomorrow');
    else if (val === dayAfterStr) updateDateButtonStyles('dayafter');
    else updateDateButtonStyles('none');

    calculateFare();
}

function selectPresetShift(shift) {
    const startSelect = document.getElementById("modal-starttime-select");
    const durationInput = document.getElementById("modal-duration-input");

    if (shift === 'morning') {
        if (startSelect) startSelect.value = "06:00 AM";
        if (durationInput) durationInput.value = 6;
    } else if (shift === 'afternoon') {
        if (startSelect) startSelect.value = "12:00 PM";
        if (durationInput) durationInput.value = 6;
    } else if (shift === 'fullday') {
        if (startSelect) startSelect.value = "06:00 AM";
        if (durationInput) durationInput.value = 12;
    }
    calculateFare();
}

function parseHourFromTimeString(timeStr) {
    if (!timeStr) return 8;
    const parts = timeStr.trim().split(" ");
    const timeParts = parts[0].split(":");
    let hour = parseInt(timeParts[0]);
    const ampm = parts[1] ? parts[1].toUpperCase() : "AM";
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return hour;
}

function formatTimeStringFromHour(hourNum, minuteNum = 0) {
    let period = "AM";
    let displayHour = hourNum;
    if (displayHour >= 12) {
        period = "PM";
        if (displayHour > 12) displayHour -= 12;
    }
    if (displayHour === 0) displayHour = 12;
    const hourStr = String(displayHour).padStart(2, '0');
    const minStr = String(minuteNum).padStart(2, '0');
    return `${hourStr}:${minStr} ${period}`;
}

function adjustDuration(delta) {
    const durationInput = document.getElementById("modal-duration-input");
    const startSelect = document.getElementById("modal-starttime-select");
    if (!durationInput || !startSelect) return;

    let currentVal = parseInt(durationInput.value) || 1;
    let newVal = currentVal + delta;

    // Operation hours restriction: 6 AM (6) to 7 PM (19)
    const startHour = parseHourFromTimeString(startSelect.value);
    const maxAllowedHours = Math.max(1, 19 - startHour);

    if (newVal < 1) newVal = 1;
    if (newVal > maxAllowedHours) newVal = maxAllowedHours;

    durationInput.value = newVal;
    calculateFare();
}

function openBookingModal(id) {
    const data = getEquipmentData();
    selectedMachine = data.find(m => m.id === id);
    if (!selectedMachine) return;
    
    const currentUser = getUserProfile();
    const isOwner = (selectedMachine.owner === currentUser.name || selectedMachine.owner === "Self" || selectedMachine.owner === "Ramesh" || selectedMachine.owner === "Ramesh Kumar");

    if (isOwner) {
        alert("You are the owner of this vehicle. You cannot book your own equipment!\nPlease manage your machinery fleet in Lender Mode.");
        return;
    }

    document.getElementById("modal-machine-name").textContent = `${selectedMachine.name} (${selectedMachine.location})`;
    
    // Set default date to today
    currentSelectedDateStr = getDateStringOffset(0);
    const dateInput = document.getElementById("modal-date-input");
    if (dateInput) dateInput.value = currentSelectedDateStr;
    updateDateButtonStyles('today');

    document.getElementById("booking-modal").classList.remove("hidden");
    calculateFare();
}

function closeBookingModal() {
    document.getElementById("booking-modal").classList.add("hidden");
}

function calculateFare() {
    if (!selectedMachine) return;

    const durationInput = document.getElementById("modal-duration-input");
    const startSelect = document.getElementById("modal-starttime-select");
    const dateInput = document.getElementById("modal-date-input");

    if (!durationInput || !startSelect) return;

    const hours = parseInt(durationInput.value) || 1;
    const startTimeStr = startSelect.value || "08:00 AM";
    const bookingDate = (dateInput && dateInput.value) ? dateInput.value : currentSelectedDateStr;

    // Calculate Till Time & Buffer Time
    const startHour = parseHourFromTimeString(startTimeStr);
    const endHour = startHour + hours;
    const endTimeStr = formatTimeStringFromHour(endHour);
    
    // 30 min post-booking buffer
    const bufferEndHour = Math.floor(endHour + 0.5);
    const bufferEndMin = (endHour % 1 === 0) ? 30 : 0;
    const bufferEndTimeStr = formatTimeStringFromHour(bufferEndHour, bufferEndMin);

    // Update UI Labels
    const scheduleDateEl = document.getElementById("calc-schedule-date");
    if (scheduleDateEl) scheduleDateEl.textContent = formatDisplayDate(bookingDate);

    const workTimeEl = document.getElementById("calc-work-time");
    if (workTimeEl) workTimeEl.textContent = `${startTimeStr} - ${endTimeStr}`;

    const bufferTimeEl = document.getElementById("calc-buffer-time");
    if (bufferTimeEl) bufferTimeEl.textContent = `${endTimeStr} - ${bufferEndTimeStr} (+30m)`;

    const baseTotal = selectedMachine.rate * hours;
    const grandTotal = baseTotal + 120;

    document.getElementById("calc-rate-label").textContent = `₹${selectedMachine.rate}`;
    document.getElementById("calc-hours-label").textContent = hours;
    document.getElementById("calc-base-total").textContent = `₹${baseTotal.toLocaleString()}`;
    document.getElementById("calc-grand-total").textContent = `₹${grandTotal.toLocaleString()}`;

    // Check if machine is fully booked on this date (only ACCEPTED bookings lock schedule)
    const allRequests = getBookingRequests();
    const acceptedForMachine = allRequests.filter(r => 
        r.machineName === selectedMachine.name && 
        r.status === 'ACCEPTED' && 
        (r.bookingDate === bookingDate || (!r.bookingDate && bookingDate === getDateStringOffset(0)))
    );

    const totalBookedHours = acceptedForMachine.reduce((sum, r) => sum + (r.hours || 0), 0);
    const fullyBookedNotice = document.getElementById("fully-booked-notice");

    if (totalBookedHours >= 12 && fullyBookedNotice) {
        fullyBookedNotice.classList.remove("hidden");
        fullyBookedNotice.textContent = "Fully Booked for Selected Date! Open for Next Day";
    } else if (fullyBookedNotice) {
        fullyBookedNotice.classList.add("hidden");
    }
}

async function confirmBooking() {
    if (!selectedMachine) return;

    const currentUser = getUserProfile();
    const isOwner = (selectedMachine.owner === currentUser.name || selectedMachine.owner === "Self" || selectedMachine.owner === "Ramesh" || selectedMachine.owner === "Ramesh Kumar");

    if (isOwner) {
        alert("You cannot book your own vehicle.");
        return;
    }

    const durationInput = document.getElementById("modal-duration-input");
    const startSelect = document.getElementById("modal-starttime-select");
    const dateInput = document.getElementById("modal-date-input");

    const hours = parseInt(durationInput.value) || 1;
    const startTimeStr = startSelect ? startSelect.value : "08:00 AM";
    const bookingDate = (dateInput && dateInput.value) ? dateInput.value : currentSelectedDateStr;

    const startHour = parseHourFromTimeString(startTimeStr);
    const endHour = startHour + hours;
    const endTimeStr = formatTimeStringFromHour(endHour);

    const pin = Math.floor(100000 + Math.random() * 900000);
    const payout = (selectedMachine.rate * hours) + 120;

    const booking = {
        id: Date.now(),
        machine: selectedMachine.name,
        pin: pin,
        hours: hours,
        payout: payout,
        bookingDate: bookingDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        bufferMinutes: 30,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem("farmshare_active_booking", JSON.stringify(booking));

    const newRequest = {
        id: booking.id,
        renterName: currentUser.name || "Ramesh Kumar",
        initials: (currentUser.name || "Ramesh").split(" ").map(n => n[0]).join("").toUpperCase(),
        village: currentUser.village || "English Palem",
        distance: selectedMachine.dist,
        machineName: selectedMachine.name,
        machineOwner: selectedMachine.owner || "Self",
        hours: hours,
        payout: payout,
        pin: String(pin),
        bookingDate: bookingDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        bufferMinutes: 30,
        status: "PENDING",
        timestamp: new Date().toISOString()
    };

    if (typeof saveBookingRequestAsync === "function") {
        await saveBookingRequestAsync(newRequest);
    } else {
        const requests = getBookingRequests();
        requests.unshift(newRequest);
        setBookingRequests(requests);
    }

    closeBookingModal();
    checkActiveBooking();
    
    if (typeof renderLenderDashboard === "function") {
        renderLenderDashboard();
    }

    alert(`Booking Request Submitted!\n\nDate: ${formatDisplayDate(bookingDate)}\nTime: ${startTimeStr} - ${endTimeStr} (${hours} hrs)\nHandshake PIN: ${pin}\n\nYour request has been sent to the owner. The schedule slot will be locked upon owner confirmation.`);
}

function checkActiveBooking() {
    const booking = JSON.parse(localStorage.getItem("farmshare_active_booking"));
    const banner = document.getElementById("active-rental-banner");
    if (booking && banner) {
        banner.classList.remove("hidden");
        document.getElementById("active-machine-title").textContent = booking.machine;
        document.getElementById("active-pin-display").textContent = booking.pin;
    }
}
