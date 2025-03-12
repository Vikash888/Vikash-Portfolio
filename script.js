document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu');
    const navbar = document.querySelector('.navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const scrollTopButton = document.getElementById('scroll-top');
    const visitorCountElement = document.getElementById('visitorCount');
    const clientIpElement = document.getElementById('Clientip');
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1262504162751680582/6BqMbWkomK8CpKQl2HaHVDWS-cAFEJtmGDbjsiBvBSNk14boIbZbXGm-Px7sDzUdU0I2';

    // Menu toggle
    menu.addEventListener('click', () => {
        menu.classList.toggle('fa-times');
        navbar.classList.toggle('nav-toggle');
    });

    // Scroll and load event
    window.addEventListener('scroll', () => {
        menu.classList.remove('fa-times');
        navbar.classList.remove('nav-toggle');

        // Scroll to top button visibility
        if (window.scrollY > 60) {
            scrollTopButton.classList.add('active');
        } else {
            scrollTopButton.classList.remove('active');
        }
    });

    // Scroll to top functionality
    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Typed.js effect
    var typed = new Typed(".typing-text", {
        strings: ["Full Stack Developer", "Android App Developer", "Cyber Security Analyst", "Penetration Tester"],
        loop: true,
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 500,
    });

    // Theme toggle functionality
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

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

    // Tab title change on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === "visible") {
            document.title = "Vikash's Portfolio";
        } else {
            document.title = "Please Come Back!🥺";
        }
    });

    // Update active nav link on scroll
    document.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.navbar a');
        let currentSection = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop - sectionHeight / 3) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scrolling on nav link click
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            targetSection.scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                const navLinks = document.querySelectorAll('.navbar a');
                navLinks.forEach((link) => link.classList.remove('active'));
                link.classList.add('active');
            }, 500);
        });
    });

    // Error handling and network detection
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

    function detectDevTools() {
        const threshold = 160;
        const devToolsOpen = window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold;

        if (devToolsOpen) {
            window.location.href = 'error.html';
        }
    }

    window.addEventListener('online', () => {
        const errorModal = document.getElementById('custom-error-modal');
        if (errorModal) {
            errorModal.remove();
        }
    });

    window.addEventListener('offline', checkNetworkConnection);
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'F12') || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            detectDevTools();
            e.preventDefault();
        }
    });

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showCustomErrorModal('Action Blocked', 'Right-click is disabled on this page.');
    });

    window.addEventListener('fetch', (event) => {
        event.respondWith(
            fetch(event.request).catch(() => {
                showCustomErrorModal('Fetch Error', 'Unable to load resource.');
                return new Response(null, { status: 404 });
            })
        );
    });

    window.addEventListener('load', checkNetworkConnection);

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
            console.log('Location data:', data);
            return {
                country: data.country,
                city: data.city,
                latitude: data.loc.split(',')[0],
                longitude: data.loc.split(',')[1]
            };
        } catch (error) {
            console.error('Error fetching location data:', error);
            return { country: 'Unable to fetch location', city: '', latitude: '', longitude: '' };
        }
    }

    function getVisitorOS() {
        let os = 'Unknown OS';
        if (navigator.appVersion.indexOf("Win") != -1) os = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) os = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux";
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
        } else if (userAgent.match(/trident/i)) {
            browser = 'Internet Explorer';
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
        const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        const message = {
            content: `
New visitor detected!
IP Address: 
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
    }

    function isVisitorCounted() {
        let visited = document.cookie.includes('visited=true');
        if (!visited) {
            document.cookie = 'visited=true; max-age=86400';
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

        getVisitorLocation(ip).then(location => {
            sendToDiscord(ip, location, getVisitorOS(), getVisitorBrowser());
        });
    });

    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'F12') {
            e.preventDefault();
        }
    });

    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.keyCode === 85) {
          event.preventDefault();
          console.log('Ctrl+U blocked');
          return false;
        }
        
        // Check for Ctrl+Shift+U (uppercase U) - also keyCode 85 but with shift
        if (event.ctrlKey && event.shiftKey && event.keyCode === 85) {
          event.preventDefault();
          console.log('Ctrl+Shift+U blocked');
          return false;
        }
      });
    function detectDevTools() {
        let startTime = performance.now();
        debugger;
        let endTime = performance.now();

        if (endTime - startTime > 1) {
            window.location.href = 'error.html';
        }
    }

    detectDevTools();

    (function () {
        const threshold = 200;
        const start = Date.now();
        let devToolsOpen = false;

        function checkDevTools() {
            const end = Date.now();
            const isDevToolsOpen = (end - start > threshold) && (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160);

            if (isDevToolsOpen && !devToolsOpen) {
                devToolsOpen = true;
                handleDevToolsDetected();
            } else if (!isDevToolsOpen && devToolsOpen) {
                devToolsOpen = false;
            }

            requestAnimationFrame(checkDevTools);
        }

        function handleDevToolsDetected() {
            window.location.href = 'error.html';
        }

        window.addEventListener('load', () => {
            checkDevTools();

            window.addEventListener('resize', () => {
                const widthThreshold = window.outerWidth - window.innerWidth > 160;
                const heightThreshold = window.outerHeight - window.innerHeight > 160;

                if (widthThreshold || heightThreshold) {
                    if (!devToolsOpen) {
                        devToolsOpen = true;
                        handleDevToolsDetected();
                    }
                } else if (devToolsOpen) {
                    devToolsOpen = false;
                }
            });
        });
    })();
});
