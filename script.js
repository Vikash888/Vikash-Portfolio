// Document Ready Function
$(document).ready(function () {
    // Mobile Menu Toggle
    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    // Scroll and Load Events
    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }
    });
});

// Typed.js Effect
const typed = new Typed(".typing-text", {
    strings: ["Full Stack Developer", "Android App Developer", "Cyber Security Analyst", "Penetration Tester"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
} else {
    document.body.classList.remove('dark-mode');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Page Visibility Title Change
document.addEventListener('visibilitychange', () => {
    document.title = document.visibilityState === "visible" ? "Vikash's Portfolio" : "Please Come Back!🥺";
});

// Section Navigation Highlighting
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.navbar ul li a');
    const sections = document.querySelectorAll('#home, #about, #skills, #projects, #education, #contact');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.navbar ul li a[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
});

// Network Connection Handling
function checkNetworkConnection() {
    if (!navigator.onLine) {
        showCustomErrorModal('Network Disconnected', 'Please check your internet connection and try again.');
    }
}
window.addEventListener('online', () => document.getElementById('custom-error-modal')?.remove());
window.addEventListener('offline', checkNetworkConnection);

// Custom Error Modal
function showCustomErrorModal(title, message) {
    if (document.getElementById('custom-error-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'custom-error-modal';
    modal.innerHTML = `
        <div id="error-content">
            <h2>${title}</h2>
            <p>${message}</p>
            <button id="close-error">Close</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-error').addEventListener('click', () => {
        modal.remove();
    });
}

// DevTools Detection
(function detectDevTools() {
    const threshold = 200;

    function checkDevTools() {
        const devToolsOpen = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
        if (devToolsOpen) {
            showCustomErrorModal('DevTools Detected', 'DevTools are not allowed to be opened.');
        }
    }

    window.addEventListener('resize', checkDevTools);
    requestAnimationFrame(checkDevTools);
})();

// Visitor Analytics
(async function trackVisitor() {
    async function getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'Unknown IP';
        }
    }

    async function getLocation(ip) {
        try {
            const response = await fetch(`https://ipinfo.io/${ip}/json`);
            const data = await response.json();
            return { country: data.country, city: data.city, loc: data.loc || '' };
        } catch {
            return { country: 'Unknown', city: 'Unknown', loc: '' };
        }
    }

    const ip = await getClientIP();
    const location = await getLocation(ip);

    console.log(`Visitor IP: ${ip}`);
    console.log(`Location: ${location.city}, ${location.country}`);
})();

// Prevent Context Menu and Restricted Key Combinations
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    const forbiddenKeys = ['F12', 'u', 'I', 'C', 'A'];
    if (forbiddenKeys.includes(e.key) && (e.ctrlKey || e.key === 'F12')) {
        e.preventDefault();
        alert('This action is disabled.');
    }
});

// Update Copyright Year
document.addEventListener('DOMContentLoaded', () => {
    const copyrightElement = document.querySelector('h2.credit');
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Vikash J. All Rights Reserved.`;
    }
});
