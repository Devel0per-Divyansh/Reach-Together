// DOM Elements
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const themeToggle = document.getElementById('themeToggle');

// Dark Mode Toggle
if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Swap images that have data-light/data-dark attributes
    function swapThemeImages() {
        document.querySelectorAll('img[data-light][data-dark]').forEach(img => {
            const light = img.getAttribute('data-light');
            const dark = img.getAttribute('data-dark');
            if (document.body.classList.contains('dark-mode')) {
                if (dark) img.src = dark;
            } else {
                if (light) img.src = light;
            }
        });
    }

    // Initial swap based on loaded theme
    swapThemeImages();

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Swap images when theme changes
        swapThemeImages();
        
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

// Variables for organization domain verification
const allowedDomains = ['nitj.ac.in'];

// Mobile Navigation Toggle
if (burger) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animation for burger menu
        burger.classList.toggle('toggle');
        
        // Toggle burger animation classes
        const lines = burger.querySelectorAll('div');
        if (navLinks.classList.contains('active')) {
            lines[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            
            // Reset burger menu
            const lines = burger.querySelectorAll('div');
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Update active state for top navigation links so the underline moves
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        if (this.closest('.nav-links')) {
            this.classList.add('active');
        }
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Scrollspy using IntersectionObserver for reliable active link updates
(() => {
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const observedSections = navAnchors
        .map(a => a.getAttribute('href'))
        .filter(h => h && h.startsWith('#'))
        .map(id => document.querySelector(id))
        .filter(Boolean);

    if (observedSections.length === 0) return;

    const ioOptions = {
        root: null,
        rootMargin: '-40% 0px -50% 0px', // trigger when section is near middle of viewport
        threshold: 0
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = `#${entry.target.id}`;
                navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
            }
        });
    }, ioOptions);

    observedSections.forEach(sec => io.observe(sec));
})();

// Header scroll effect
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Function to check if email domain is allowed
function isOrganizationEmail(email) {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
}

// Function to show notification
function showNotification(message, isSuccess = true) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = '15px';
    notification.style.color = '#fff';
    notification.style.fontWeight = '600';
    notification.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '10000';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.3s ease';
    notification.style.fontFamily = 'Poppins, sans-serif';
    
    if (isSuccess) {
        notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Mock database for users and journeys
const users = JSON.parse(localStorage.getItem('users')) || [];
const journeys = [];

// Signup Form Handling
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        // Validate email is from organization
        if (!isOrganizationEmail(email)) {
            showNotification('Please use your organization email address', false);
            return;
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', false);
            return;
        }
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            showNotification('Account already exists with this email', false);
            return;
        }
        
        // Add user to mock database
        users.push({
            id: Date.now().toString(),
            name,
            email,
            password
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Account created successfully! Please login.');
        
        // Reset form
        signupForm.reset();
        
        // Redirect to login section
        setTimeout(() => {
            document.querySelector('a[href="#login-section"]').click();
        }, 1500);
    });
}

// Login Form Handling
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validate email is from organization
        if (!isOrganizationEmail(email)) {
            showNotification('Please use your organization email address', false);
            return;
        }
        
        // Mock authentication
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
            // Store user info in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.name.split(' ').map(n => n[0]).join('')
            }));
            
            // Show success notification
            showNotification('Login successful! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification('Invalid email or password', false);
        }
    });
}
