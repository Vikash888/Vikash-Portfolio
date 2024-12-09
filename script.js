$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

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
// Typed.js effect starts
var typed = new Typed(".typing-text", {
    strings: ["Full Stack Developer", "Android App Developer", "", "Cyber Security Analyst", "Penetration Tester"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});
// Typed.js effect ends

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');

// Initial theme setup
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
} else {
    document.body.classList.remove('dark-mode');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
}

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    // Toggle dark mode on body
    document.body.classList.toggle('dark-mode');

    // Check if dark mode is active
    if (document.body.classList.contains('dark-mode')) {
        // Switch to sun icon and save dark theme
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to moon icon and save light theme
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});
// Mobile menu toggle
const menu = document.getElementById('menu');
const navbar = document.querySelector('.nav-links');

menu.addEventListener('click', () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('nav-toggle');
});

// Hide mobile menu on scroll/load
window.addEventListener('scroll', () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('nav-toggle');

    // Scroll to top button visibility
    if (window.scrollY > 60) {
        document.querySelector('#scroll-top').classList.add('active');
    } else {
        document.querySelector('#scroll-top').classList.remove('active');
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
// Scroll to top functionality
document.getElementById('scroll-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    let currentSection = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop - sectionHeight / 3) {
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
document.addEventListener('DOMContentLoaded', () => {
    // // Prevent default 404 redirection
    // window.addEventListener('error', (e) => {
    //     e.preventDefault();
    //     showCustomErrorModal('Resource Not Found', 'The requested page or resource could not be loaded.');
    //     return false;
    // }, true);

    // Network and DevTools Error Handling
    function showCustomErrorModal(title, message) {
        // Check if modal already exists
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

        // Close modal functionality
        document.getElementById('close-error').addEventListener('click', () => {
            document.getElementById('custom-error-modal').remove();
        });
    }

    // Network Connection Detection
    function checkNetworkConnection() {
        if (!navigator.onLine) {
            showCustomErrorModal('Network Disconnected', 'Please check your internet connection and try again.');
        }
    }

    // DevTools Detection
    function detectDevTools() {
        const threshold = 160;
        const devToolsOpen = window.outerWidth - window.innerWidth > threshold || 
                             window.outerHeight - window.innerHeight > threshold;
        
        if (devToolsOpen) {
            showCustomErrorModal('DevTools Detected', 'DevTools are not allowed to be opened.');
        }
    }

    // Network Event Listeners
    window.addEventListener('online', () => {
        const errorModal = document.getElementById('custom-error-modal');
        if (errorModal) {
            errorModal.remove();
        }
    });

    window.addEventListener('offline', checkNetworkConnection);

    // DevTools Detection Listeners
    document.addEventListener('keydown', (e) => {
        // F12 or Ctrl+Shift+I
        if ((e.key === 'F12') || 
            (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            detectDevTools();
            e.preventDefault();
            showCustomErrorModal('DevTools Detected', 'DevTools are not allowed to be opened.');
        }
    });

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showCustomErrorModal('Action Blocked', 'Right-click is disabled on this page.');
    });

    // Fetch Error Handling
    window.addEventListener('fetch', (event) => {
        event.respondWith(
            fetch(event.request).catch(() => {
                showCustomErrorModal('Fetch Error', 'Unable to load resource.');
                return new Response(null, { status: 404 });
            })
        );
    });

    // Initial network check
    window.addEventListener('load', checkNetworkConnection);
});
document.oncontextmenu = () => {
    //alert("Don't try right click")
    return false
}
document.onkeydown = e => {
    //prevent f12 key
    if(e.key == "F12"){
      //  alert("Don't try to inspect code")
      showCustomErrorModal('DevTools Detected', 'DevTools are not allowed to be opened.');  
        return false
    }
    //prevent ctrl+u key
    if(e.ctrlKey && e.key == "u") {
        alert("Don't try to view page source")
        return false
    }
    // //prevent copy key
    // if(e.ctrlKey && e.key == "c") {
    //     alert("Don't try to copy page")  
    //     return false
    // }
            //prevent paste key
    if(e.ctrlKey && e.key == "v") {
        alert("Don't try to paste anything to the page")  
        return false
    }
    //prevent paste key
    if(e.ctrlKey && e.key == "a") {
        alert("Don't try to select anything to the page")  
        return false
    }
}
// Discord webhook URL placeholder
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1262504162751680582/6BqMbWkomK8CpKQl2HaHVDWS-cAFEJtmGDbjsiBvBSNk14boIbZbXGm-Px7sDzUdU0I2';
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(function () {
                document.getElementById('loadingScreen').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
            }, 1000);
        });

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
        document.getElementById('visitorCount').textContent = visitorCount;

        getClientip().then(ip => {
            document.getElementById('Clientip').textContent = ip;

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

        function detectDevTools() {
            let startTime = performance.now();
            debugger;
            let endTime = performance.now();

            if (endTime - startTime > 1) {
                alert('Developer tools detected! Please close them to continue.');
                window.location.href = 'about:blank';
            }
        }

        detectDevTools();

        // New Dev Tools
        // Function to detect if DevTools is open
        (function() {
            const threshold = 200; // Time threshold for detection
            const start = Date.now();
            let devToolsOpen = false;
        
            // Function to check if DevTools are open
            function checkDevTools() {
                const end = Date.now();
                const isDevToolsOpen = (end - start > threshold) && (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160);
        
                if (isDevToolsOpen && !devToolsOpen) {
                    devToolsOpen = true; // Set state to prevent multiple alerts
                    handleDevToolsDetected();
                } else if (!isDevToolsOpen && devToolsOpen) {
                    devToolsOpen = false; // Reset state when DevTools are closed
                }
        
                requestAnimationFrame(checkDevTools); // Continue checking
            }
        
            // Function to handle what happens when DevTools is detected
            // function handleDevToolsDetected() {
            //     alert('Developer Tools detected! Please close them to continue.');
            //     // Optionally redirect or perform other actions
            //     window.location.href = 'error.html'; // Uncomment this line if you want to redirect
            // }
        
            // Initial check on page load
            window.addEventListener('load', () => {
                checkDevTools(); // Start checking for DevTools
        
                // Check for resize events as an additional measure
                window.addEventListener('resize', () => {
                    const widthThreshold = window.outerWidth - window.innerWidth > 160;
                    const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
                    if (widthThreshold || heightThreshold) {
                        if (!devToolsOpen) {
                            devToolsOpen = true; // Set state to prevent multiple alerts
                            handleDevToolsDetected();
                        }
                    } else if (devToolsOpen) {
                        devToolsOpen = false; // Reset state when DevTools are closed
                    }
                });
            });
        })();