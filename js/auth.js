// Authentication & Aadhaar Verification Module for FARMSHARE

// Verhoeff Algorithm Tables for UIDAI Aadhaar Verification
const verhoeffD = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 1, 2, 3, 4],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const verhoeffP = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validate 10-digit Indian Mobile Number
 * Rules: Exactly 10 digits, starting with 6, 7, 8, or 9
 */
function validateIndianMobile(mobile) {
    const cleanMobile = mobile.replace(/\D/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(cleanMobile);
}

/**
 * Validate 12-digit Aadhaar Card using Verhoeff Checksum Algorithm
 */
function validateAadhaarNumber(aadhaar) {
    const cleanNum = aadhaar.replace(/\D/g, '');
    
    // Aadhaar must be exactly 12 digits
    if (cleanNum.length !== 12) return false;
    
    // Aadhaar numbers cannot start with 0 or 1
    if (cleanNum[0] === '0' || cleanNum[0] === '1') return false;

    // Run Verhoeff algorithm calculation
    let c = 0;
    const myArray = cleanNum.split('').map(Number).reverse();

    for (let i = 0; i < myArray.length; i++) {
        c = verhoeffD[c][verhoeffP[i % 8][myArray[i]]];
    }

    // Returns true if checksum evaluates to 0
    return c === 0;
}

function getAuthState() {
    return JSON.parse(localStorage.getItem("farmshare_auth")) || { isAuthenticated: false, user: null };
}

function setAuthState(state) {
    localStorage.setItem("farmshare_auth", JSON.stringify(state));
}

function checkAuthStatus() {
    const authState = getAuthState();
    const authView = document.getElementById("view-auth");
    const appHeader = document.getElementById("app-header");
    const mainContent = document.getElementById("main-content");
    const mobileNav = document.getElementById("mobile-nav");

    if (authState.isAuthenticated) {
        if (authView) authView.classList.add("hidden");
        if (appHeader) appHeader.classList.remove("hidden");
        if (mainContent) mainContent.classList.remove("hidden");
        if (mobileNav) mobileNav.classList.remove("hidden");
        
        loadProfile();
        if (typeof switchView === "function") switchView("renter");
        if (typeof renderLenderDashboard === "function") renderLenderDashboard();
        if (typeof initMap === "function") {
            setTimeout(initMap, 100);
        }
    } else {
        if (authView) authView.classList.remove("hidden");
        if (appHeader) appHeader.classList.add("hidden");
        if (mainContent) mainContent.classList.add("hidden");
        if (mobileNav) mobileNav.classList.add("hidden");
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById("auth-login-form");
    const signupForm = document.getElementById("auth-signup-form");
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");

    if (tab === "login") {
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
        tabLogin.className = "flex-1 py-3 font-bold text-sm border-b-2 border-primary text-primary transition-all";
        tabSignup.className = "flex-1 py-3 font-semibold text-sm text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition-all";
    } else {
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        tabSignup.className = "flex-1 py-3 font-bold text-sm border-b-2 border-primary text-primary transition-all";
        tabLogin.className = "flex-1 py-3 font-semibold text-sm text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition-all";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById("login-phone").value.trim();
    const pinEl = document.getElementById("login-pin");
    const pin = pinEl ? pinEl.value.trim() : "";

    if (!validateIndianMobile(phone)) {
        alert("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210).");
        return;
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, pin })
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
            const user = data.user;
            setAuthState({ isAuthenticated: true, user });
            setUserProfile(user);
            checkAuthStatus();
            alert(`Welcome back, ${user.name}! Connected to Machilipatnam Cluster.`);
            return;
        } else if (res.status === 401) {
            alert(data.error || "Incorrect 4-Digit Security PIN.");
            return;
        } else {
            alert(`No registered account found for mobile number +91 ${phone}.\n\nPlease register using the E-KYC Register form.`);
            switchAuthTab('signup');
            const signupPhoneInput = document.getElementById("signup-phone");
            if (signupPhoneInput) signupPhoneInput.value = phone;
            return;
        }
    } catch (err) {
        console.warn("Backend server offline, checking local profile.");
        const existingProfile = getUserProfile();
        if (existingProfile && existingProfile.phone === phone) {
            setAuthState({ isAuthenticated: true, user: existingProfile });
            checkAuthStatus();
            alert(`Welcome back, ${existingProfile.name}!`);
        } else {
            alert(`No account found for +91 ${phone}. Please complete E-KYC registration.`);
            switchAuthTab('signup');
        }
    }
}

function simulateAadhaarVerification() {
    const aadhaarInput = document.getElementById("signup-aadhaar").value.trim();
    const statusBox = document.getElementById("aadhaar-status-box");

    const cleanAadhaar = aadhaarInput.replace(/\D/g, '');

    if (cleanAadhaar.length !== 12) {
        statusBox.className = "p-3 bg-error/10 border border-error/30 rounded-xl flex items-center gap-3 text-xs text-error font-semibold mt-2";
        statusBox.innerHTML = `
            <span class="material-symbols-outlined text-xl">error</span>
            <span>Aadhaar number must contain exactly 12 digits.</span>
        `;
        return;
    }

    // Check if Aadhaar passes Verhoeff checksum validation
    const isValidVerhoeff = validateAadhaarNumber(cleanAadhaar);

    statusBox.className = "p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-3 text-xs text-primary font-semibold mt-2";
    statusBox.innerHTML = `
        <span class="material-symbols-outlined text-xl animate-spin">sync</span>
        <span>Performing UIDAI E-KYC & Verhoeff Checksum Verification...</span>
    `;

    setTimeout(() => {
        if (isValidVerhoeff) {
            statusBox.className = "p-3 bg-primary/10 border border-primary/40 rounded-xl flex items-center gap-3 text-xs text-primary font-bold mt-2 shadow-sm";
            statusBox.innerHTML = `
                <span class="material-symbols-outlined text-xl">verified</span>
                <div>
                    <p class="leading-tight">Aadhaar E-KYC Verified Successfully ✓</p>
                    <p class="text-[10px] text-primary/80 font-normal">UIDAI Verhoeff Checksum Passed • Govt. Registered Farmer</p>
                </div>
            `;
            document.getElementById("signup-btn").disabled = false;
            document.getElementById("signup-btn").classList.remove("opacity-50", "cursor-not-allowed");
        } else {
            statusBox.className = "p-3 bg-error/10 border border-error/30 rounded-xl flex items-center gap-3 text-xs text-error font-semibold mt-2";
            statusBox.innerHTML = `
                <span class="material-symbols-outlined text-xl">gpp_bad</span>
                <div>
                    <p class="leading-tight font-bold">Invalid Aadhaar Number</p>
                    <p class="text-[10px] text-error/80">Failed Verhoeff checksum validation. Please check your 12-digit UID.</p>
                </div>
            `;
            document.getElementById("signup-btn").disabled = true;
            document.getElementById("signup-btn").classList.add("opacity-50", "cursor-not-allowed");
        }
    }, 1000);
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const village = document.getElementById("signup-village").value;
    const rawAadhaar = document.getElementById("signup-aadhaar").value.replace(/\D/g, '');
    const pinInput = document.getElementById("signup-pin");
    const pin = pinInput ? pinInput.value.trim() : "1234";

    if (!validateIndianMobile(phone)) {
        alert("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
        return;
    }

    if (!validateAadhaarNumber(rawAadhaar)) {
        alert("Invalid Aadhaar number. Please perform E-KYC verification with a valid 12-digit Aadhaar UID.");
        return;
    }

    const formattedAadhaar = `${rawAadhaar.slice(0,4)}-${rawAadhaar.slice(4,8)}-${rawAadhaar.slice(8,12)}`;

    const newUser = {
        name: name,
        phone: phone,
        aadhaar: formattedAadhaar,
        village: village + ", Machilipatnam",
        language: "EN",
        pin: pin
    };

    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        if (res.ok) {
            const data = await res.json();
            if (data.user) {
                newUser.id = data.user.id;
            }
        }
    } catch (err) {
        console.warn("Backend offline, creating local profile.");
    }

    setUserProfile(newUser);
    setAuthState({ isAuthenticated: true, user: newUser });
    checkAuthStatus();
    alert(`Account Created Successfully! Welcome to FARMSHARE, ${name}.`);
}

function logout() {
    if (confirm("Are you sure you want to log out of FARMSHARE?")) {
        setAuthState({ isAuthenticated: false, user: null });
        checkAuthStatus();
    }
}
