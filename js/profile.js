// User Profile Management & Dynamic i18n Translation Module

const translations = {
    EN: {
        navRenter: "🚜 Renter Mode",
        navLender: "💼 Lender Mode",
        heroTitle: 'Rent Agricultural <br/><span class="text-primary">Equipment Locally</span>',
        heroSub: "Find nearby machinery in Machilipatnam (English Palem, Ramanaidupet, Tallapalem).",
        catLabel: "Equipment Category",
        radiusLabel: "Max Radius",
        hoursLabel: "Duration (Hrs)",
        searchBtn: "Search Machinery",
        nearTitle: "Available Near You",
        kpiEarnings: "Total Earnings",
        kpiListings: "Active Listings",
        kpiPending: "Pending Requests",
        kpiUtil: "Utilization Rate",
        addEqBtn: "Add New Equipment"
    },
    TE: {
        navRenter: "🚜 రెంటర్ మోడ్",
        navLender: "💼 లెండర్ మోడ్",
        heroTitle: 'వ్యవసాయ పరికరాలను <br/><span class="text-primary">అద్దెకు తీసుకోండి</span>',
        heroSub: "మచిలీపట్నం పరిసర ప్రాంతాలలో అందుబాటులో ఉన్న వ్యవసాయ యంత్రాలను వెతకండి.",
        catLabel: "పరికర రకం",
        radiusLabel: "గరిష్ట దూరం",
        hoursLabel: "సమయం (గంటలు)",
        searchBtn: "యంత్రాలను వెతకండి",
        nearTitle: "మీకు దగ్గరలో ఉన్న పరికరాలు",
        kpiEarnings: "మొత్తం సంపాదన",
        kpiListings: "యాక్టివ్ యంత్రాలు",
        kpiPending: "పెండింగ్ అభ్యర్థనలు",
        kpiUtil: "వినియోగ రేటు",
        addEqBtn: "కొత్త యంత్రాన్ని జోడించు"
    }
};

function applyLanguage(lang) {
    const dict = translations[lang] || translations.EN;

    const btnRenter = document.getElementById("nav-btn-renter");
    if (btnRenter) btnRenter.textContent = dict.navRenter;

    const btnLender = document.getElementById("nav-btn-lender");
    if (btnLender) btnLender.textContent = dict.navLender;

    const heroTitle = document.getElementById("hero-title");
    if (heroTitle) heroTitle.innerHTML = dict.heroTitle;

    const heroSub = document.getElementById("hero-sub");
    if (heroSub) heroSub.textContent = dict.heroSub;

    const catLabel = document.getElementById("label-cat");
    if (catLabel) catLabel.textContent = dict.catLabel;

    const radiusLabel = document.getElementById("label-radius");
    if (radiusLabel) radiusLabel.textContent = dict.radiusLabel;

    const hoursLabel = document.getElementById("label-hours");
    if (hoursLabel) hoursLabel.textContent = dict.hoursLabel;

    const searchBtn = document.getElementById("search-btn-text");
    if (searchBtn) searchBtn.textContent = dict.searchBtn;

    const nearTitle = document.getElementById("near-title");
    if (nearTitle) nearTitle.textContent = dict.nearTitle;

    const addEqBtn = document.getElementById("add-eq-btn-text");
    if (addEqBtn) addEqBtn.textContent = dict.addEqBtn;

    updateLangBadge(lang);
}

function loadProfile() {
    const profile = getUserProfile();
    const nameHeader = document.getElementById("header-user-name");
    if (nameHeader) nameHeader.textContent = profile.name;
    
    const nameInput = document.getElementById("profile-name-input");
    if (nameInput) nameInput.value = profile.name;
    
    const phoneInput = document.getElementById("profile-phone-input");
    if (phoneInput) phoneInput.value = profile.phone;
    
    const villageInput = document.getElementById("profile-village-input");
    if (villageInput) villageInput.value = profile.village;
    
    const langInput = document.getElementById("profile-lang-input");
    if (langInput) langInput.value = profile.language || "EN";

    const currentPinInput = document.getElementById("profile-current-pin");
    if (currentPinInput) currentPinInput.value = "";

    const newPinInput = document.getElementById("profile-new-pin");
    if (newPinInput) newPinInput.value = "";
    
    const aadhaarNum = document.getElementById("profile-aadhaar-num");
    if (aadhaarNum) aadhaarNum.textContent = `UID: ${profile.aadhaar || "XXXX-XXXX-4829"}`;
    
    applyLanguage(profile.language || "EN");
}

function openProfileModal() {
    loadProfile();
    document.getElementById("profile-modal").classList.remove("hidden");
}

function closeProfileModal() {
    document.getElementById("profile-modal").classList.add("hidden");
}

async function saveProfile(e) {
    e.preventDefault();
    const existing = getUserProfile();
    const currentPinEntered = document.getElementById("profile-current-pin") ? document.getElementById("profile-current-pin").value.trim() : "";
    const newPinEntered = document.getElementById("profile-new-pin") ? document.getElementById("profile-new-pin").value.trim() : "";

    const expectedCurrentPin = String(existing.pin || "1234").trim();

    // Verify Current PIN
    if (currentPinEntered !== expectedCurrentPin) {
        alert("❌ Incorrect Current Security PIN!\n\nYou must enter your valid Current 4-Digit Security PIN to save profile changes.");
        return;
    }

    // Determine final PIN: Use new pin if provided (4 digits), otherwise keep existing PIN
    let finalPin = expectedCurrentPin;
    if (newPinEntered) {
        if (newPinEntered.length !== 4) {
            alert("New Security PIN must be exactly 4 digits.");
            return;
        }
        finalPin = newPinEntered;
    }

    const updatedProfile = {
        ...existing,
        name: document.getElementById("profile-name-input").value.trim(),
        phone: document.getElementById("profile-phone-input").value.trim(),
        village: document.getElementById("profile-village-input").value.trim(),
        language: document.getElementById("profile-lang-input").value,
        pin: finalPin
    };

    // Save locally
    setUserProfile(updatedProfile);

    // Save to SQLite DB backend
    try {
        await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProfile)
        });
    } catch (err) {
        console.warn("Backend offline, updated profile locally.");
    }

    loadProfile();
    if (typeof renderListings === "function") renderListings();
    if (typeof renderLenderDashboard === "function") renderLenderDashboard();
    closeProfileModal();

    if (newPinEntered) {
        alert(updatedProfile.language === "TE" ? "ప్రొఫైల్ & పిన్ విజయవంతంగా మార్చబడ్డాయి!" : "✓ Profile Details & New Security PIN Updated Successfully!");
    } else {
        alert(updatedProfile.language === "TE" ? "ప్రొఫైల్ వివరాలు విజయవంతంగా అప్‌డేట్ అయ్యాయి!" : "✓ Profile Details Updated Successfully!");
    }
}

function toggleLanguage() {
    const profile = getUserProfile();
    profile.language = profile.language === "TE" ? "EN" : "TE";
    setUserProfile(profile);
    applyLanguage(profile.language);
}

function updateLangBadge(lang) {
    const en = document.getElementById("lang-en");
    const te = document.getElementById("lang-te");
    if (en && te) {
        if (lang === "TE") {
            en.className = "opacity-60 font-semibold";
            te.className = "text-primary font-bold";
        } else {
            en.className = "text-primary font-bold";
            te.className = "opacity-60 font-semibold";
        }
    }
}
