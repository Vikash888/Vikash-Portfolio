document.addEventListener('DOMContentLoaded', () => {
    // Ensure elements exist before manipulation
    const menuToggle = document.getElementById('menu');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar ul li a');
    const scrollTopElement = document.querySelector('#scroll-top');
    const themeToggle = document.getElementById('theme-toggle');

    // Safely check and apply theme toggle functionality
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');
        const savedTheme = localStorage.getItem('theme');

        // Initial theme setup
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }

        // Theme toggle event listener
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');

            themeIcon.classList.toggle('fa-moon', !isDarkMode);
            themeIcon.classList.toggle('fa-sun', isDarkMode);

            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }

    // Mobile menu toggle
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('fa-times');
            navbar.classList.toggle('nav-toggle');
        });
    }

    // Scroll and menu handling
    window.addEventListener('scroll', () => {
        if (menuToggle) menuToggle.classList.remove('fa-times');
        if (navbar) navbar.classList.remove('nav-toggle');

        // Scroll to top button visibility
        if (scrollTopElement) {
            window.scrollY > 60 
                ? scrollTopElement.classList.add('active')
                : scrollTopElement.classList.remove('active');
        }
    });

    // Tab title change on visibility
    document.addEventListener('visibilitychange', () => {
        document.title = document.visibilityState === "visible" 
            ? "Vikash's Portfolio" 
            : "Please Come Back!🥺";
    });

    // Navigation Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.navbar ul li a[href="#${id}"]`);
                
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, { threshold: 0.3 });

    // Observe sections
    const sections = document.querySelectorAll('#home, #about, #skills, #projects, #education, #contact');
    sections.forEach(section => observer.observe(section));

    // Initial page load handling
    const currentHash = window.location.hash || '#home';
    const initialActiveLink = document.querySelector(`.navbar ul li a[href="${currentHash}"]`);
    
    if (initialActiveLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        initialActiveLink.classList.add('active');
    }

    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Safe IP and location tracking
    async function trackVisitor() {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            
            // Optional: You might want to use a more reliable geolocation service
            const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const locationData = await locationResponse.json();

            // Log or send data as needed
            console.log('Visitor IP:', ipData.ip);
            console.log('Location:', locationData);
        } catch (error) {
            console.error('Visitor tracking failed:', error);
        }
    }

    // Uncomment to enable tracking
    // trackVisitor();
});

// DevTools Detection with Fallback
(function() {
    const threshold = 200;
    let devToolsOpen = false;

    function checkDevTools() {
        const start = Date.now();
        const end = Date.now();
        const isDevToolsOpen = 
            (end - start > threshold) && 
            (window.outerWidth - window.innerWidth > 160 || 
             window.outerHeight - window.innerHeight > 160);

        if (isDevToolsOpen && !devToolsOpen) {
            devToolsOpen = true;
            alert('Developer Tools detected. Please close them.');
            // Optional: Redirect or take action
            // window.location.href = 'error.html';
        }
    }

    // Multiple detection methods
    window.addEventListener('load', () => {
        setInterval(checkDevTools, 1000);

        window.addEventListener('resize', () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;

            if (widthThreshold || heightThreshold) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    alert('Developer Tools detected. Please close them.');
                }
            } else if (devToolsOpen) {
                devToolsOpen = false;
            }
        });
    });

    // Prevent common DevTools shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            alert('DevTools shortcuts are disabled.');
        }
    });
})();
