// DOM Elements
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Variables for organization domain verification
const allowedDomains = ['nitj.ac.in', 'company.com', 'organization.in']; // Add your organization domains

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
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for header height
                behavior: 'smooth'
            });
        }
    });
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
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = '#fff';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '1001';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    if (isSuccess) {
        notification.style.backgroundColor = '#2ecc71';
    } else {
        notification.style.backgroundColor = '#e74c3c';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Mock database for users and journeys (in a real application, this would be a server-side database)
const users = [];
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
            password // In a real app, this would be hashed
        });
        
        showNotification('Account created successfully! Please login.');
        
        // Reset form
        signupForm.reset();
        
        // Redirect to login section
        setTimeout(() => {
            document.querySelector('a[href="#login-section"]').click();
        }, 1500);
    });
}