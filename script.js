/**
 * ============================================================================
 * VIKASH PORTFOLIO - CORE SCRIPT & DPDP ACT 2023 SECURITY MODULE
 * ============================================================================
 * - Statutory DPDP Act 2023 / IT Act 2000 Consent Management Framework
 * - Zero-tracking without prior affirmative consent
 * - Form sanitization, Anti-XSS, Anti-bot honeypot, & Rate limiting
 * - Cookie security hardening (SameSite=Strict, Secure)
 * - Consent logging for audit trail (Local & Supabase ready)
 * ============================================================================
 */

// Safe backend / proxy endpoint for telemetry (DO NOT hardcode credentials directly in frontend)
// To route notifications securely, use a cloudflare worker / serverless proxy:
const ANALYTICS_DISCORD_PROXY_URL = null; // Set via environment proxy if desired

// Consent Preference Keys
const DPDP_STORAGE_KEY = 'dpdp_consent_preferences';
const DPDP_POLICY_VERSION = 'v1.0';

/**
 * ----------------------------------------------------------------------------
 * 1. Consent State & Management Helpers
 * ----------------------------------------------------------------------------
 */
function getConsentPreferences() {
    try {
        const stored = localStorage.getItem(DPDP_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}

function hasConsent(category) {
    const prefs = getConsentPreferences();
    if (!prefs) return false;
    return Boolean(prefs[category]);
}

function saveConsentPreferences(analyticsConsent) {
    const prefs = {
        essential: true,
        analytics: Boolean(analyticsConsent),
        policyVersion: DPDP_POLICY_VERSION,
        timestamp: new Date().toISOString()
    };
    try {
        localStorage.setItem(DPDP_STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
        console.error('Unable to save consent preferences:', e);
    }

    // Log consent record for audit trail (DPDP Section 6)
    logConsentAudit('cookies_' + (analyticsConsent ? 'all' : 'essential'), analyticsConsent);

    // Remove banner and modal if present
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) banner.remove();
    const modal = document.getElementById('cookiePreferencesModal');
    if (modal) modal.remove();

    // Trigger or disable tracking based on choice
    if (analyticsConsent) {
        initializeAnalytics();
    } else {
        const clientIpElement = document.getElementById('Clientip');
        if (clientIpElement) {
            clientIpElement.textContent = 'Protected (Consent Not Granted)';
        }
    }
}

function logConsentAudit(type, given) {
    try {
        const logs = JSON.parse(localStorage.getItem('dpdp_consent_logs') || '[]');
        logs.push({
            type: type,
            given: given,
            version: DPDP_POLICY_VERSION,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        localStorage.setItem('dpdp_consent_logs', JSON.stringify(logs));
    } catch (e) {
        // Storage full or unavailable
    }
}

/**
 * ----------------------------------------------------------------------------
 * 2. Cookie Consent Banner & Preferences Modal UI
 * ----------------------------------------------------------------------------
 */
function renderCookieBanner() {
    if (getConsentPreferences()) return; // Already answered
    if (document.getElementById('cookieConsentBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookieConsentBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie and Privacy Notice');
    banner.innerHTML = `
        <div class="cookie-banner-content">
            <div class="cookie-banner-title">
                <i class="fas fa-cookie-bite"></i> Your Privacy & Data Protection (DPDP Act 2023)
            </div>
            <p class="cookie-banner-text">
                We value your privacy. In accordance with India's <strong>Digital Personal Data Protection Act, 2023</strong>, 
                we do not run any non-essential analytics, IP lookups, or telemetry trackers without your explicit prior consent. 
                Essential local storage is strictly used for site navigation and theme preferences. 
                Learn more in our <a href="privacy-policy.html">Privacy Notice</a> and <a href="cookie-policy.html">Cookie Policy</a>.
            </p>
        </div>
        <div class="cookie-banner-actions">
            <button type="button" class="cookie-btn cookie-btn-primary" id="btnAcceptAllCookies">
                <i class="fas fa-check"></i> Accept All
            </button>
            <button type="button" class="cookie-btn cookie-btn-secondary" id="btnRejectCookies">
                <i class="fas fa-times"></i> Reject Non-Essential
            </button>
            <button type="button" class="cookie-btn cookie-btn-outline" id="btnCustomizeCookies">
                <i class="fas fa-sliders-h"></i> Customize
            </button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('btnAcceptAllCookies').addEventListener('click', () => saveConsentPreferences(true));
    document.getElementById('btnRejectCookies').addEventListener('click', () => saveConsentPreferences(false));
    document.getElementById('btnCustomizeCookies').addEventListener('click', openCookiePreferencesModal);
}

function openCookiePreferencesModal() {
    if (document.getElementById('cookiePreferencesModal')) return;

    const currentPrefs = getConsentPreferences();
    const analyticsChecked = currentPrefs ? currentPrefs.analytics : false;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'cookiePreferencesModal';
    modalOverlay.className = 'cookie-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div class="cookie-modal-header">
                <h3 id="modalTitle"><i class="fas fa-sliders-h"></i> Privacy & Cookie Preferences</h3>
                <button type="button" class="cookie-modal-close" id="btnCloseModal" aria-label="Close">&times;</button>
            </div>
            
            <p style="font-size:1.35rem; color:var(--text-muted); line-height:1.6;">
                Manage how your data is handled on this site under India's DPDP Act 2023. You can revisit and change these settings at any time.
            </p>

            <!-- Essential Cookies -->
            <div class="cookie-category">
                <div class="cookie-category-header">
                    <span class="cookie-category-title">
                        <i class="fas fa-shield-alt" style="color:var(--primary-color);"></i> Strictly Necessary Storage
                    </span>
                    <span class="cookie-badge cookie-badge-required">Always Active</span>
                </div>
                <p>Required for basic security, theme preferences (light/dark mode), and remembering your privacy choices.</p>
            </div>

            <!-- Analytics & Telemetry -->
            <div class="cookie-category">
                <div class="cookie-category-header">
                    <span class="cookie-category-title">
                        <i class="fas fa-chart-line" style="color:var(--accent-color);"></i> Analytics & Geolocation Telemetry
                    </span>
                    <label class="cookie-switch">
                        <input type="checkbox" id="toggleAnalytics" ${analyticsChecked ? 'checked' : ''}>
                        <span class="cookie-slider"></span>
                    </label>
                </div>
                <p>Permits querying your approximate location/IP and device OS/browser to power visitor analytics and performance logs.</p>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:1rem;">
                <button type="button" class="cookie-btn cookie-btn-secondary" id="btnSaveReject">Reject All Non-Essential</button>
                <button type="button" class="cookie-btn cookie-btn-primary" id="btnSavePreferences">Save My Preferences</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    document.getElementById('btnCloseModal').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.remove();
    });

    document.getElementById('btnSaveReject').addEventListener('click', () => saveConsentPreferences(false));
    document.getElementById('btnSavePreferences').addEventListener('click', () => {
        const isAnalyticsOn = document.getElementById('toggleAnalytics').checked;
        saveConsentPreferences(isAnalyticsOn);
    });
}
window.openCookiePreferencesModal = openCookiePreferencesModal;

/**
 * ----------------------------------------------------------------------------
 * 3. Security Hardening: Input Sanitization & Anti-XSS
 * ----------------------------------------------------------------------------
 */
function sanitizeInput(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/eval\(/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/onload=/gi, '')
        .replace(/onerror=/gi, '');
}

/**
 * ----------------------------------------------------------------------------
 * 4. Analytics & Telemetry (Strictly Opt-In)
 * ----------------------------------------------------------------------------
 */
async function getClientip() {
    try {
        let response = await fetch('https://api.ipify.org?format=json');
        let data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unable to fetch IP';
    }
}

async function getVisitorLocation(ip) {
    try {
        let response = await fetch(`https://ipinfo.io/${ip}/json`);
        let data = await response.json();
        return {
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            latitude: data.loc ? data.loc.split(',')[0] : '0',
            longitude: data.loc ? data.loc.split(',')[1] : '0'
        };
    } catch (error) {
        return { country: 'Unknown', city: '', latitude: '', longitude: '' };
    }
}

function getVisitorOS() {
    let os = 'Unknown OS';
    if (navigator.userAgent.indexOf("Win") !== -1) os = "Windows";
    else if (navigator.userAgent.indexOf("Mac") !== -1) os = "MacOS";
    else if (navigator.userAgent.indexOf("Linux") !== -1) os = "Linux";
    else if (navigator.userAgent.indexOf("Android") !== -1) os = "Android";
    else if (navigator.userAgent.indexOf("iPhone") !== -1 || navigator.userAgent.indexOf("iPad") !== -1) os = "iOS";
    return os;
}

function getVisitorBrowser() {
    let ua = navigator.userAgent;
    if (ua.match(/firefox|fxios/i)) return 'Firefox';
    if (ua.match(/samsungbrowser/i)) return 'Samsung Internet';
    if (ua.match(/opr\//i) || ua.match(/opera|opr/i)) return 'Opera';
    if (ua.match(/edg/i)) return 'Microsoft Edge';
    if (ua.match(/chrome|crios/i)) return 'Chrome';
    if (ua.match(/safari/i)) return 'Safari';
    return 'Unknown Browser';
}

function isVisitorCounted() {
    let visited = document.cookie.includes('visited=true');
    if (!visited) {
        // Enforce SameSite=Strict and Secure for cookie hardening
        const secureFlag = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `visited=true; max-age=86400; path=/; SameSite=Strict${secureFlag}`;
    }
    return visited;
}

function updateVisitorCount() {
    let count = parseInt(localStorage.getItem('visitorCount') || '0', 10);
    if (!isVisitorCounted()) {
        count++;
        localStorage.setItem('visitorCount', count.toString());
    }
    return count;
}

function initializeAnalytics() {
    // Only proceed if explicit analytics consent was granted
    if (!hasConsent('analytics')) return;

    const visitorCountElement = document.getElementById('visitorCount');
    const clientIpElement = document.getElementById('Clientip');

    let count = updateVisitorCount();
    if (visitorCountElement) {
        visitorCountElement.textContent = count;
    }

    getClientip().then(ip => {
        if (clientIpElement) {
            clientIpElement.textContent = ip;
        }

        if (ip && ip !== 'Unable to fetch IP' && ANALYTICS_DISCORD_PROXY_URL) {
            getVisitorLocation(ip).then(location => {
                fetch(ANALYTICS_DISCORD_PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ip: ip,
                        country: location.country,
                        city: location.city,
                        os: getVisitorOS(),
                        browser: getVisitorBrowser()
                    })
                }).catch(() => {});
            });
        }
    });
}

/**
 * ----------------------------------------------------------------------------
 * 5. Main DOM Ready Logic
 * ----------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu');
    const navbar = document.querySelector('.navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const scrollTopButton = document.getElementById('scroll-top');
    const clientIpElement = document.getElementById('Clientip');

    // Display appropriate IP placeholder before consent
    if (clientIpElement) {
        clientIpElement.textContent = hasConsent('analytics') ? 'Fetching...' : 'Requires Consent';
    }

    // 1. Initialize Cookie Banner
    renderCookieBanner();

    // 2. Initialize Analytics if already consented
    if (hasConsent('analytics')) {
        initializeAnalytics();
    }

    // 3. Mobile Navigation Drawer
    if (menu && navbar) {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('fa-times');
            navbar.classList.toggle('nav-toggle');
        });

        document.addEventListener('click', (e) => {
            if (navbar.classList.contains('nav-toggle') && !navbar.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('fa-times');
                navbar.classList.remove('nav-toggle');
            }
        });
    }

    // 4. Scroll events
    window.addEventListener('scroll', () => {
        if (menu && navbar) {
            menu.classList.remove('fa-times');
            navbar.classList.remove('nav-toggle');
        }

        if (scrollTopButton) {
            if (window.scrollY > 150) {
                scrollTopButton.classList.add('active');
            } else {
                scrollTopButton.classList.remove('active');
            }
        }
    });

    if (scrollTopButton) {
        scrollTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Typed.js effect
    if (typeof Typed !== 'undefined' && document.querySelector('.typing-text')) {
        new Typed(".typing-text", {
            strings: ["Full Stack Developer", "Android App Developer", "Cyber Security Analyst", "Penetration Tester"],
            loop: true,
            typeSpeed: 50,
            backSpeed: 25,
            backDelay: 600,
        });
    }

    // 6. Theme toggle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        // Default to dark mode for cyber / portfolio aesthetic
        document.body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggle && themeIcon) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // 7. Tab title change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === "visible") {
            document.title = "VIKASH Portfolio";
        } else {
            document.title = "Please Come Back! 🥺";
        }
    });

    // 8. Contact Form Hardening: Anti-Bot, Anti-XSS, Rate Limiting & DPDP Consent Enforcement
    const contactForm = document.getElementById('contact-form');
    const alertBox = document.getElementById('contactFormAlert');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            // A. Honeypot Verification
            const honeypot = contactForm.querySelector('input[name="_gotcha"]');
            if (honeypot && honeypot.value.trim() !== '') {
                e.preventDefault();
                console.warn('Spam bot detected via honeypot.');
                if (alertBox) {
                    alertBox.className = 'form-alert form-alert-success';
                    alertBox.textContent = 'Message transmitted successfully!';
                    alertBox.style.display = 'block';
                }
                contactForm.reset();
                return false;
            }

            // B. DPDP Mandatory Consent & Age Verification Check
            const dpdpConsent = document.getElementById('dpdp_consent');
            const dpdpAge = document.getElementById('dpdp_age_declaration');

            if (!dpdpConsent || !dpdpConsent.checked) {
                e.preventDefault();
                showAlert(alertBox, 'error', 'Statutory requirement: You must provide consent to process your contact inquiry under India\'s DPDP Act 2023.');
                dpdpConsent && dpdpConsent.focus();
                return false;
            }

            if (!dpdpAge || !dpdpAge.checked) {
                e.preventDefault();
                showAlert(alertBox, 'error', 'Statutory requirement: You must confirm you are 18 years of age or older (Section 9 DPDP Act 2023).');
                dpdpAge && dpdpAge.focus();
                return false;
            }

            // C. Rate Limiting (Throttle to 1 submission per 60 seconds)
            const lastSubmitted = sessionStorage.getItem('last_contact_timestamp');
            const now = Date.now();
            if (lastSubmitted && (now - parseInt(lastSubmitted, 10)) < 60000) {
                e.preventDefault();
                const remainingSecs = Math.ceil((60000 - (now - parseInt(lastSubmitted, 10))) / 1000);
                showAlert(alertBox, 'error', `Rate limited: Please wait ${remainingSecs} seconds before sending another message.`);
                return false;
            }

            // D. Anti-XSS Input Sanitization
            const nameField = document.getElementById('contact_name');
            const emailField = document.getElementById('contact_email');
            const phoneField = document.getElementById('contact_phone');
            const messageField = document.getElementById('contact_message');

            if (nameField) nameField.value = sanitizeInput(nameField.value);
            if (phoneField) phoneField.value = sanitizeInput(phoneField.value);
            if (messageField) messageField.value = sanitizeInput(messageField.value);

            // Basic email format check
            if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
                e.preventDefault();
                showAlert(alertBox, 'error', 'Please enter a valid email address.');
                emailField.focus();
                return false;
            }

            // E. Stamp ISO Timestamp & Log Consent
            const timestampInput = document.getElementById('consent_timestamp');
            const isoTime = new Date().toISOString();
            if (timestampInput) timestampInput.value = isoTime;

            logConsentAudit('contact_form', true);
            sessionStorage.setItem('last_contact_timestamp', now.toString());

            // Disable submit button to prevent double-submissions
            const submitBtn = document.getElementById('contact_submit_btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Transmitting... <i class="fas fa-spinner fa-spin"></i>';
            }
        });
    }

    function showAlert(box, type, text) {
        if (!box) return;
        box.className = type === 'error' ? 'form-alert form-alert-error' : 'form-alert form-alert-success';
        box.textContent = text;
        box.style.display = 'block';
    }

    // 9. ScrollReveal animations
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'top',
            distance: '60px',
            duration: 1000,
            reset: false
        });

        sr.reveal('.home .content, .heading', {});
        sr.reveal('.home .image', { delay: 200 });
        sr.reveal('.about-container', { delay: 100 });
        sr.reveal('.skills-section', { interval: 150 });
        sr.reveal('.project-card', { interval: 150 });
        sr.reveal('.education-item', { interval: 150 });
        sr.reveal('.contact .content', { delay: 100 });
    }
});

// Fullscreen image helper
function openFullscreen(elem) {
    if (!elem) return;
    try {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } catch (e) {
        console.log('Fullscreen request not supported', e);
    }
}
window.openFullscreen = openFullscreen;