document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu');
    const navbar = document.querySelector('.navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const scrollTopButton = document.getElementById('scroll-top');
    const visitorCountElement = document.getElementById('visitorCount');
    const clientIpElement = document.getElementById('Clientip');
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1262504162751680582/6BqMbWkomK8CpKQl2HaHVDWS-cAFEJtmGDbjsiBvBSNk14boIbZbXGm-Px7sDzUdU0I2';

    // Menu toggle for mobile drawer
    if (menu && navbar) {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('fa-times');
            navbar.classList.toggle('nav-toggle');
        });

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (navbar.classList.contains('nav-toggle') && !navbar.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('fa-times');
                navbar.classList.remove('nav-toggle');
            }
        });
    }

    // Scroll and load event
    window.addEventListener('scroll', () => {
        if (menu && navbar) {
            menu.classList.remove('fa-times');
            navbar.classList.remove('nav-toggle');
        }

        // Scroll to top button visibility
        if (scrollTopButton) {
            if (window.scrollY > 150) {
                scrollTopButton.classList.add('active');
            } else {
                scrollTopButton.classList.remove('active');
            }
        }
    });

    // Scroll to top functionality
    if (scrollTopButton) {
        scrollTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Typed.js effect
    if (typeof Typed !== 'undefined' && document.querySelector('.typing-text')) {
        new Typed(".typing-text", {
            strings: ["Full Stack Developer", "Android App Developer", "Cyber Security Analyst", "Penetration Tester"],
            loop: true,
            typeSpeed: 50,
            backSpeed: 25,
            backDelay: 600,
        });
    }

    // Theme toggle functionality
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
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

    // Tab title change on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === "visible") {
            document.title = "VIKASH Portfolio";
        } else {
            document.title = "Please Come Back! 🥺";
        }
    });

    // Update active nav link on scroll
    document.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar a');
        let currentSection = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        if (currentSection) {
            navLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // Smooth scrolling on nav link click + auto close mobile menu
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const headerOffset = 65;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }

                // Close mobile drawer if open
                if (menu && navbar) {
                    menu.classList.remove('fa-times');
                    navbar.classList.remove('nav-toggle');
                }

                document.querySelectorAll('.navbar a').forEach((l) => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Error handling modal helper
    function showCustomErrorModal(title, message) {
        if (document.getElementById('custom-error-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'custom-error-modal';
        modal.innerHTML = `
            <div id="error-content">
                <img src="./assets/images/404 Error.gif" alt="Error">
                <h2>${title}</h2>
                <p>${message}</p>
                <button id="close-error">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-error').addEventListener('click', () => {
            document.getElementById('custom-error-modal').remove();
        });
    }

    function checkNetworkConnection() {
        if (!navigator.onLine) {
            showCustomErrorModal('Network Disconnected', 'Please check your internet connection and try again.');
        }
    }

    window.addEventListener('online', () => {
        const errorModal = document.getElementById('custom-error-modal');
        if (errorModal) {
            errorModal.remove();
        }
    });

    window.addEventListener('offline', checkNetworkConnection);

    // Visitor tracking and Discord notification
    async function getClientip() {
        try {
            let response = await fetch('https://api.ipify.org?format=json');
            let data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
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
            console.error('Error fetching location data:', error);
            return { country: 'Unable to fetch location', city: '', latitude: '', longitude: '' };
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
        let userAgent = navigator.userAgent;
        let browser = 'Unknown Browser';

        if (userAgent.match(/firefox|fxios/i)) {
            browser = 'Firefox';
        } else if (userAgent.match(/samsungbrowser/i)) {
            browser = 'Samsung Internet';
        } else if (userAgent.match(/opr\//i) || userAgent.match(/opera|opr/i)) {
            browser = 'Opera';
        } else if (userAgent.match(/edg/i)) {
            browser = 'Microsoft Edge';
        } else if (userAgent.match(/chrome|crios/i)) {
            browser = 'Chrome';
        } else if (userAgent.match(/safari/i)) {
            browser = 'Safari';
        }

        return browser;
    }

    async function sendToDiscord(ip, location, os, browser) {
        try {
            const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
            const message = {
                content: `
New visitor detected!
IP Address: ${ip}
Location: ${location.country}, ${location.city} (${location.latitude}, ${location.longitude})
Google Maps: ${googleMapsUrl}
Operating System: ${os}
Browser: ${browser}
                `
            };

            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
        } catch (e) {
            // Ignore reporting errors
        }
    }

    function isVisitorCounted() {
        let visited = document.cookie.includes('visited=true');
        if (!visited) {
            document.cookie = 'visited=true; max-age=86400; path=/; SameSite=Lax';
        }
        return visited;
    }

    function getVisitorCount() {
        let count = localStorage.getItem('visitorCount') || 0;
        return parseInt(count);
    }

    function updateVisitorCount() {
        if (!isVisitorCounted()) {
            let count = getVisitorCount();
            count++;
            localStorage.setItem('visitorCount', count);
            return count;
        } else {
            return getVisitorCount();
        }
    }

    let visitorCount = updateVisitorCount();
    if (visitorCountElement) {
        visitorCountElement.textContent = visitorCount;
    }

    getClientip().then(ip => {
        if (clientIpElement) {
            clientIpElement.textContent = ip;
        }

        if (ip && ip !== 'Unable to fetch IP') {
            getVisitorLocation(ip).then(location => {
                sendToDiscord(ip, location, getVisitorOS(), getVisitorBrowser());
            });
        }
    });

    // Optional ScrollReveal animations if library is loaded
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
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } catch (e) {
        console.log('Fullscreen request not supported', e);
    }
}
window.openFullscreen = openFullscreen;