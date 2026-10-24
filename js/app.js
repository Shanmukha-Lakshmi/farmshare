// Main App Orchestration & View Switching Logic

function switchView(mode) {
    const renterView = document.getElementById("view-renter");
    const lenderView = document.getElementById("view-lender");
    const btnRenter = document.getElementById("nav-btn-renter");
    const btnLender = document.getElementById("nav-btn-lender");

    if (!renterView || !lenderView) return;

    if (mode === "renter") {
        renterView.classList.remove("hidden");
        lenderView.classList.add("hidden");
        if (btnRenter) btnRenter.className = "px-5 py-1.5 rounded-full bg-primary text-on-primary font-semibold text-sm transition-all shadow-sm";
        if (btnLender) btnLender.className = "px-5 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high font-semibold text-sm transition-all";
        if (typeof map !== 'undefined' && map) {
            setTimeout(() => map.invalidateSize(), 200);
        }
    } else {
        lenderView.classList.remove("hidden");
        renterView.classList.add("hidden");
        if (btnLender) btnLender.className = "px-5 py-1.5 rounded-full bg-primary text-on-primary font-semibold text-sm transition-all shadow-sm";
        if (btnRenter) btnRenter.className = "px-5 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high font-semibold text-sm transition-all";
        if (typeof renderLenderDashboard === "function") {
            renderLenderDashboard();
        }
    }
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('.material-symbols-outlined');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        if (icon) icon.textContent = 'visibility';
    }
}

// Global Initialization
document.addEventListener("DOMContentLoaded", () => {
    initStorage();
    checkAuthStatus();
});
