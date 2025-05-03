// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const journeyForm = document.getElementById('journeyForm');
const journeyType = document.getElementById('journeyType');
const pnrGroup = document.getElementById('pnrGroup');
const pnrNumber = document.getElementById('pnrNumber');
const fromLocation = document.getElementById('fromLocation');
const toLocation = document.getElementById('toLocation');
const departureDate = document.getElementById('departureDate');
const departureTime = document.getElementById('departureTime');
const shareAuto = document.getElementById('shareAuto');
const womenOnly = document.getElementById('womenOnly');
const luggageHelp = document.getElementById('luggageHelp');
const additionalNotes = document.getElementById('additionalNotes');
const addFirstJourneyBtn = document.getElementById('addFirstJourneyBtn');
const logoutBtn = document.getElementById('logoutBtn');
const journeyList = document.getElementById('journeyList');
const matchesList = document.getElementById('matchesList');
const contactsList = document.getElementById('contactsList');
const userNameDisplay = document.getElementById('userNameDisplay');
const userAvatar = document.getElementById('userAvatar');
const welcomeName = document.getElementById('welcomeName');
const matchFilterType = document.getElementById('matchFilterType');
const matchSortBy = document.getElementById('matchSortBy');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// User data and mock storage
let currentUser = null;
let mockJourneys = [];
let mockMatches = [];
let mockContacts = [];
let mockMessages = {};
let activeContactId = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Setup tab navigation
    setupTabs();
    
    // Check if user is logged in
    checkAuth();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Setup filter handlers
    setupFilterHandlers();
    
    // Setup mock data if needed (for development)
    setupMockData();
});

// Setup tab navigation
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Check if user is logged in (in a real app, this would check authentication token)
function checkAuth() {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        // Redirect to login page if not authenticated
        // In a real app, we would redirect to login page
        // For demo purposes, we'll create a mock user
        createMockUser();
    } else {
        // Load user data
        currentUser = JSON.parse(storedUser);
        displayUserInfo(currentUser);
        loadUserData(currentUser);
    }
}

// Create a mock user for demo purposes
function createMockUser() {
    currentUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: null,
        initials: 'JD'
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    displayUserInfo(currentUser);
}

// Display user information
function displayUserInfo(user) {
    userNameDisplay.textContent = user.name;
    userAvatar.textContent = user.initials || getInitials(user.name);
    welcomeName.textContent = user.name.split(' ')[0];
}

// Get initials from name
function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('');
}

// Load user journeys and matches
function loadUserData(user) {
    // Load journeys from localStorage
    mockJourneys = JSON.parse(localStorage.getItem('journeys')) || [];
    mockMatches = JSON.parse(localStorage.getItem('matches')) || [];
    mockContacts = JSON.parse(localStorage.getItem('contacts')) || [];
    mockMessages = JSON.parse(localStorage.getItem('messages')) || {};

    // Display data
    displayJourneys();
    displayMatches();
    displayContacts();
}

// Setup form handlers
function setupFormHandlers() {
    // Add journey form submission
    journeyForm.addEventListener('submit', handleJourneyFormSubmit);
    
    // Add first journey button click
    addFirstJourneyBtn.addEventListener('click', () => {
        // Switch to add journey tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate add journey tab
        const addJourneyBtn = document.querySelector('[data-tab="add-journey"]');
        addJourneyBtn.classList.add('active');
        document.getElementById('add-journey').classList.add('active');
    });
    
    // Logout button click
    logoutBtn.addEventListener('click', handleLogout);
    
    // Journey type change
    journeyType.addEventListener('change', () => {
        // Show/hide PNR field based on journey type
        if (journeyType.value === 'train') {
            pnrGroup.style.display = 'block';
        } else {
            pnrGroup.style.display = 'none';
        }
    });
    
    // Send message button click
    sendMessageBtn.addEventListener('click', handleSendMessage);
    
    // Message input enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}

// Handle journey form submission
function handleJourneyFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const journeyData = {
        id: generateId(),
        userId: currentUser.id,
        type: journeyType.value,
        pnr: pnrNumber.value || null,
        from: fromLocation.value,
        to: toLocation.value,
        departureDate: departureDate.value,
        departureTime: departureTime.value,
        preferences: {
            shareAuto: shareAuto.checked,
            womenOnly: womenOnly.checked,
            luggageHelp: luggageHelp.checked
        },
        notes: additionalNotes.value,
        createdAt: new Date().toISOString()
    };
    
    // Add journey to storage
    mockJourneys.push(journeyData);
    localStorage.setItem('journeys', JSON.stringify(mockJourneys));
    
    // Display journeys
    displayJourneys();
    
    // Find matches
    findMatches(journeyData);
    
    // Reset form
    journeyForm.reset();
    
    // Show success message
    alert('Journey added successfully!');
    
    // Switch to my journeys tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activate my journeys tab
    const myJourneysBtn = document.querySelector('[data-tab="my-journeys"]');
    myJourneysBtn.classList.add('active');
    document.getElementById('my-journeys').classList.add('active');
}

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Display journeys
function displayJourneys() {
    // Filter journeys for current user
    const userJourneys = mockJourneys.filter(journey => journey.userId === currentUser.id);
    
    // Clear journey list
    journeyList.innerHTML = '';
    
    // Check if user has any journeys
    if (userJourneys.length === 0) {
        journeyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <h3>No journeys added yet</h3>
                <p>Add your first journey to find travel companions</p>
                <button class="primary-btn" id="addFirstJourneyBtn">Add Journey</button>
            </div>
        `;
        // Re-attach event listener to the new button
        document.getElementById('addFirstJourneyBtn').addEventListener('click', () => {
            // Switch to add journey tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate add journey tab
            const addJourneyBtn = document.querySelector('[data-tab="add-journey"]');
            addJourneyBtn.classList.add('active');
            document.getElementById('add-journey').classList.add('active');
        });
        return;
    }
    
    // Display journeys
    userJourneys.forEach(journey => {
        const journeyCard = document.createElement('div');
        journeyCard.className = 'journey-card';
        journeyCard.innerHTML = `
            <div class="journey-header">
                <span class="journey-type">${capitalizeFirstLetter(journey.type)}</span>
                <span class="journey-date">${formatDate(journey.departureDate)}</span>
            </div>
            <div class="journey-route">
                <span>${journey.from}</span>
                <i class="fas fa-arrow-right"></i>
                <span>${journey.to}</span>
            </div>
            <div class="journey-details">
                <p><i class="far fa-clock"></i> ${formatTime(journey.departureTime)}</p>
                ${journey.pnr ? `<p><i class="fas fa-ticket-alt"></i> PNR: ${journey.pnr}</p>` : ''}
                <p><i class="fas fa-info-circle"></i> ${getPreferencesText(journey.preferences)}</p>
            </div>
            <div class="journey-actions">
                <button class="secondary-btn" data-id="${journey.id}" data-action="edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="danger-btn" data-id="${journey.id}" data-action="delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        journeyList.appendChild(journeyCard);
        
        // Add event listeners for edit and delete buttons
        const editBtn = journeyCard.querySelector('[data-action="edit"]');
        const deleteBtn = journeyCard.querySelector('[data-action="delete"]');
        
        editBtn.addEventListener('click', () => handleEditJourney(journey.id));
        deleteBtn.addEventListener('click', () => handleDeleteJourney(journey.id));
    });
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time
function formatTime(timeString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', options);
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get preferences text
function getPreferencesText(preferences) {
    const prefs = [];
    if (preferences.shareAuto) prefs.push('Willing to share auto/cab');
    if (preferences.womenOnly) prefs.push('Prefer women-only companion');
    if (preferences.luggageHelp) prefs.push('Need help with luggage');
    return prefs.length > 0 ? prefs.join(', ') : 'No specific preferences';
}

// Handle edit journey
function handleEditJourney(journeyId) {
    // Find journey
    const journey = mockJourneys.find(j => j.id === journeyId);
    if (!journey) return;
    
    // Switch to add journey tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activate add journey tab
    const addJourneyBtn = document.querySelector('[data-tab="add-journey"]');
    addJourneyBtn.classList.add('active');
    document.getElementById('add-journey').classList.add('active');
    
    // Populate form with journey data
    journeyType.value = journey.type;
    pnrNumber.value = journey.pnr || '';
    fromLocation.value = journey.from;
    toLocation.value = journey.to;
    departureDate.value = journey.departureDate;
    departureTime.value = journey.departureTime;
    shareAuto.checked = journey.preferences.shareAuto;
    womenOnly.checked = journey.preferences.womenOnly;
    luggageHelp.checked = journey.preferences.luggageHelp;
    additionalNotes.value = journey.notes;
    
    // Show/hide PNR field based on journey type
    if (journey.type === 'train') {
        pnrGroup.style.display = 'block';
    } else {
        pnrGroup.style.display = 'none';
    }
    
    // Change form to update mode
    journeyForm.setAttribute('data-mode', 'update');
    journeyForm.setAttribute('data-journey-id', journeyId);
    
    // Change button text
    const submitBtn = journeyForm.querySelector('[type="submit"]');
    submitBtn.textContent = 'Update Journey';
    
    // Add event listener to handle form submission
    journeyForm.removeEventListener('submit', handleJourneyFormSubmit);
    journeyForm.addEventListener('submit', function updateHandler(e) {
        e.preventDefault();
        
        // Update journey
        const updatedJourney = {
            ...journey,
            type: journeyType.value,
            pnr: pnrNumber.value || null,
            from: fromLocation.value,
            to: toLocation.value,
            departureDate: departureDate.value,
            departureTime: departureTime.value,
            preferences: {
                shareAuto: shareAuto.checked,
                womenOnly: womenOnly.checked,
                luggageHelp: luggageHelp.checked
            },
            notes: additionalNotes.value,
            updatedAt: new Date().toISOString()
        };
        
        // Update in storage
        const index = mockJourneys.findIndex(j => j.id === journeyId);
        mockJourneys[index] = updatedJourney;
        localStorage.setItem('journeys', JSON.stringify(mockJourneys));
        
        // Display journeys
        displayJourneys();
        
        // Find matches
        findMatches(updatedJourney);
        
        // Reset form
        journeyForm.reset();
        
        // Reset form to add mode
        journeyForm.removeAttribute('data-mode');
        journeyForm.removeAttribute('data-journey-id');
        submitBtn.textContent = 'Add Journey';
        
        // Reset event listener
        journeyForm.removeEventListener('submit', updateHandler);
        journeyForm.addEventListener('submit', handleJourneyFormSubmit);
        
        // Show success message
        alert('Journey updated successfully!');
        
        // Switch to my journeys tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate my journeys tab
        const myJourneysBtn = document.querySelector('[data-tab="my-journeys"]');
        myJourneysBtn.classList.add('active');
        document.getElementById('my-journeys').classList.add('active');
    });
}

// Handle delete journey
function handleDeleteJourney(journeyId) {
    // Confirm delete
    if (!confirm('Are you sure you want to delete this journey?')) return;
    
    // Remove journey from storage
    mockJourneys = mockJourneys.filter(j => j.id !== journeyId);
    localStorage.setItem('journeys', JSON.stringify(mockJourneys));
    
    // Display journeys
    displayJourneys();
    
    // Update matches
    findAllMatches();
    
    // Show success message
    alert('Journey deleted successfully!');
}

// Find matches based on journeys
function findMatches(newJourney) {
    // In a real app, this would be a complex algorithm
    // For demo, we'll just match journeys with same from, to, and date
    const potentialMatches = mockJourneys.filter(journey => 
        journey.userId !== currentUser.id && 
        journey.from === newJourney.from && 
        journey.to === newJourney.to && 
        journey.departureDate === newJourney.departureDate
    );
    
    // Calculate match percentage
    potentialMatches.forEach(journey => {
        // Check if match already exists
        const existingMatch = mockMatches.find(m => 
            m.journeyId === journey.id && 
            m.userJourneyId === newJourney.id
        );
        
        if (!existingMatch) {
            // Calculate match percentage
            const matchPercentage = calculateMatchPercentage(newJourney, journey);
            
            // Create match object
            const match = {
                id: generateId(),
                journeyId: journey.id,
                userJourneyId: newJourney.id,
                userId: journey.userId,
                percentage: matchPercentage,
                createdAt: new Date().toISOString()
            };
            
            // Add to matches
            mockMatches.push(match);
        }
    });
    
    // Save matches to storage
    localStorage.setItem('matches', JSON.stringify(mockMatches));
    
    // Display matches
    displayMatches();
}

// Find all matches
function findAllMatches() {
    // Clear current matches
    mockMatches = [];
    
    // Find matches for each journey
    const userJourneys = mockJourneys.filter(journey => journey.userId === currentUser.id);
    userJourneys.forEach(journey => {
        findMatches(journey);
    });
}

// Calculate match percentage
function calculateMatchPercentage(journey1, journey2) {
    let matchScore = 0;
    
    // Same route and date
    if (journey1.from === journey2.from && journey1.to === journey2.to && journey1.departureDate === journey2.departureDate) {
        matchScore += 50;
    }
    
    // Same journey type
    if (journey1.type === journey2.type) {
        matchScore += 10;
    }
    
    // Same PNR
    if (journey1.pnr && journey2.pnr && journey1.pnr === journey2.pnr) {
        matchScore += 20;
    }
    
    // Similar departure time (within 1 hour)
    const time1 = new Date(`2000-01-01T${journey1.departureTime}`).getTime();
    const time2 = new Date(`2000-01-01T${journey2.departureTime}`).getTime();
    const timeDiff = Math.abs(time1 - time2) / (1000 * 60 * 60); // difference in hours
    if (timeDiff <= 1) {
        matchScore += 10;
    }
    
    // Similar preferences
    if (journey1.preferences.shareAuto === journey2.preferences.shareAuto) {
        matchScore += 3;
    }
    if (journey1.preferences.womenOnly === journey2.preferences.womenOnly) {
        matchScore += 3;
    }
    if (journey1.preferences.luggageHelp === journey2.preferences.luggageHelp) {
        matchScore += 4;
    }
    
    return Math.min(matchScore, 100);
}

// Display matches
function displayMatches() {
    // Get matches for current user
    const userMatches = mockMatches.filter(match => {
        const journey = mockJourneys.find(j => j.id === match.userJourneyId);
        return journey && journey.userId === currentUser.id;
    });
    
    // Clear matches list
    matchesList.innerHTML = '';
    
    // Check if user has any matches
    if (userMatches.length === 0) {
        matchesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>No matches found</h3>
                <p>Add a journey first to find potential matches</p>
            </div>
        `;
        return;
    }
    
    // Sort matches based on filter
    let sortedMatches = [...userMatches];
    
    // Apply filtering
    if (matchFilterType.value !== 'all') {
        sortedMatches = sortedMatches.filter(match => {
            const journey = mockJourneys.find(j => j.id === match.journeyId);
            return journey && journey.type === matchFilterType.value;
        });
    }
    
    // Apply sorting
    if (matchSortBy.value === 'date') {
        sortedMatches.sort((a, b) => {
            const journeyA = mockJourneys.find(j => j.id === a.journeyId);
            const journeyB = mockJourneys.find(j => j.id === b.journeyId);
            
            if (!journeyA || !journeyB) return 0;
            
            const dateA = new Date(`${journeyA.departureDate}T${journeyA.departureTime}`);
            const dateB = new Date(`${journeyB.departureDate}T${journeyB.departureTime}`);
            
            return dateA - dateB;
        });
    } else if (matchSortBy.value === 'match') {
        sortedMatches.sort((a, b) => b.percentage - a.percentage);
    }
    
    // Display matches
    sortedMatches.forEach(match => {
        // Find journey and user
        const journey = mockJourneys.find(j => j.id === match.journeyId);
        const userJourney = mockJourneys.find(j => j.id === match.userJourneyId);
        
        if (!journey || !userJourney) return;
        
        // Create match element
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <div class="match-header">
                <span class="match-type">${capitalizeFirstLetter(journey.type)}</span>
                <span class="match-percentage">${match.percentage}% Match</span>
            </div>
            <div class="match-user">
                <div class="match-user-avatar">
                    ${getInitials(journey.userId)}
                </div>
                <div class="match-user-info">
                    <span class="match-user-name">Fellow Traveler</span>
                    <span class="match-user-journey">${journey.from} to ${journey.to}</span>
                </div>
            </div>
            <div class="match-journey">
                <p class="match-journey-title">Journey Details</p>
                <p class="match-journey-details">
                    <i class="far fa-calendar"></i> ${formatDate(journey.departureDate)} | 
                    <i class="far fa-clock"></i> ${formatTime(journey.departureTime)}
                </p>
                ${journey.pnr ? `<p class="match-journey-details"><i class="fas fa-ticket-alt"></i> PNR: ${journey.pnr}</p>` : ''}
            </div>
            <div class="match-info">
                <p class="match-info-title">Preferences</p>
                <p class="match-info-details">${getPreferencesText(journey.preferences)}</p>
            </div>
            <div class="match-actions">
                <button class="primary-btn" data-id="${match.id}" data-action="connect">
                    <i class="fas fa-user-plus"></i> Connect
                </button>
                <button class="secondary-btn" data-id="${match.id}" data-action="view">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        `;
        matchesList.appendChild(matchCard);
        
        // Add event listeners for connect and view buttons
        const connectBtn = matchCard.querySelector('[data-action="connect"]');
        const viewBtn = matchCard.querySelector('[data-action="view"]');
        
        connectBtn.addEventListener('click', () => handleConnectMatch(match.id));
        viewBtn.addEventListener('click', () => handleViewMatch(match.id));
    });
}

// Handle connect match
function handleConnectMatch(matchId) {
    // Find match
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) return;
    
    // Check if already connected
    const isAlreadyConnected = mockContacts.some(c => c.matchId === matchId);
    if (isAlreadyConnected) {
        alert('You are already connected with this traveler!');
        return;
    }
    
    // Create contact
    const contact = {
        id: generateId(),
        matchId: matchId,
        userId: match.userId,
        journeyId: match.journeyId,
        userJourneyId: match.userJourneyId,
        lastMessage: null,
        createdAt: new Date().toISOString()
    };
    
    // Add to contacts
    mockContacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(mockContacts));
    
    // Initialize messages
    if (!mockMessages[contact.id]) {
        mockMessages[contact.id] = [];
        localStorage.setItem('messages', JSON.stringify(mockMessages));
    }
    
    // Display contacts
    displayContacts();
    
    // Show success message
    alert('Connected successfully! You can now message this traveler.');
    
    // Switch to messages tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activate messages tab
    const messagesBtn = document.querySelector('[data-tab="messages"]');
    messagesBtn.classList.add('active');
    document.getElementById('messages').classList.add('active');
}

// Handle view match
function handleViewMatch(matchId) {
    // Find match
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) return;
    
    // Find journey
    const journey = mockJourneys.find(j => j.id === match.journeyId);
    if (!journey) return;
    
    // Show journey details
    alert(`Journey Details:
    Type: ${capitalizeFirstLetter(journey.type)}
    From: ${journey.from}
    To: ${journey.to}
    Date: ${formatDate(journey.departureDate)}
    Time: ${formatTime(journey.departureTime)}
    ${journey.pnr ? `PNR: ${journey.pnr}` : ''}
    Preferences: ${getPreferencesText(journey.preferences)}
    Notes: ${journey.notes || 'No additional notes'}
    `);
}

// Display contacts
function displayContacts() {
    // Clear contacts list
    contactsList.innerHTML = '';
    
    // Check if user has any contacts
    if (mockContacts.length === 0) {
        contactsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>No contacts yet</h3>
                <p>Your matched contacts will appear here</p>
            </div>
        `;
        return;
    }
    
    // Display contacts
    mockContacts.forEach(contact => {
        // Find journey
        const journey = mockJourneys.find(j => j.id === contact.journeyId);
        if (!journey) return;
        
        // Get last message
        const messages = mockMessages[contact.id] || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        // Create contact element
        const contactCard = document.createElement('div');
        contactCard.className = 'contact-card';
        contactCard.setAttribute('data-contact-id', contact.id);
        
        // Add active class if this is the active contact
        if (activeContactId === contact.id) {
            contactCard.classList.add('active');
        }
        
        contactCard.innerHTML = `
            <div class="contact-avatar">
                ${getInitials(contact.userId)}
            </div>
            <div class="contact-info">
                <div class="contact-name">Fellow Traveler</div>
                <div class="contact-preview">${journey.from} to ${journey.to}</div>
            </div>
            <div class="contact-time">
                ${lastMessage ? formatDate(lastMessage.timestamp) : 'New'}
            </div>
        `;
        contactsList.appendChild(contactCard);
        
        // Add event listener for contact click
        contactCard.addEventListener('click', () => {
            // Set active contact
            activeContactId = contact.id;
            
            // Update active class
            document.querySelectorAll('.contact-card').forEach(card => {
                card.classList.remove('active');
            });
            contactCard.classList.add('active');
            
            // Display messages
            displayMessages(contact.id);
            
            // Update chat header
            updateChatHeader(contact);
        });
    });
}

// Update chat header
function updateChatHeader(contact) {
    // Find journey
    const journey = mockJourneys.find(j => j.id === contact.journeyId);
    if (!journey) return;
    
    // Update chat header
    const chatHeader = document.querySelector('.chat-header');
    chatHeader.innerHTML = `
        <div class="chat-user">
            <div class="chat-avatar">
                ${getInitials(contact.userId)}
            </div>
            <div class="chat-user-info">
                <h3>Fellow Traveler</h3>
                <p>${journey.from} to ${journey.to} | ${formatDate(journey.departureDate)}</p>
            </div>
        </div>
    `;
}

// Display messages
function displayMessages(contactId) {
    // Clear messages
    chatMessages.innerHTML = '';
    
    // Get messages
    const messages = mockMessages[contactId] || [];
    
    // Check if there are any messages
    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No messages yet</h3>
                <p>Start a conversation with this traveler</p>
            </div>
        `;
        return;
        // Enable message input
        document.querySelector('.chat-input').style.display = 'flex';
        return;
    }
    
    // Display messages
    messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.senderId === currentUser.id ? 'sent' : 'received'}`;
        messageEl.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        chatMessages.appendChild(messageEl);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Enable message input
    document.querySelector('.chat-input').style.display = 'flex';
}

// Handle send message
function handleSendMessage() {
    // Check if message is empty
    if (!messageInput.value.trim()) return;
    
    // Check if there is an active contact
    if (!activeContactId) {
        alert('Please select a contact to message');
        return;
    }
    
    // Create message
    const message = {
        id: generateId(),
        contactId: activeContactId,
        senderId: currentUser.id,
        content: messageInput.value.trim(),
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Add to messages
    if (!mockMessages[activeContactId]) {
        mockMessages[activeContactId] = [];
    }
    mockMessages[activeContactId].push(message);
    localStorage.setItem('messages', JSON.stringify(mockMessages));
    
    // Display messages
    displayMessages(activeContactId);
    
    // Clear input
    messageInput.value = '';
    
    // Update last message
    const contactIndex = mockContacts.findIndex(c => c.id === activeContactId);
    if (contactIndex !== -1) {
        mockContacts[contactIndex].lastMessage = message;
        localStorage.setItem('contacts', JSON.stringify(mockContacts));
    }
}

// Setup filter handlers
function setupFilterHandlers() {
    // Match filter type change
    matchFilterType.addEventListener('change', () => {
        displayMatches();
    });
    
    // Match sort by change
    matchSortBy.addEventListener('change', () => {
        displayMatches();
    });
}

// Handle logout
function handleLogout() {
    // Clear local storage
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    window.location.href = 'login.html';
    
    // For demo purposes, just reload the page
    window.location.reload();
}

// Setup mock data for development
function setupMockData() {
    // Check if there are any journeys
    if (mockJourneys.length === 0) {
        // Add some mock journeys
        const mockJourneyData = [
            {
                id: 'journey1',
                userId: 'user2',
                type: 'train',
                pnr: '1234567890',
                from: 'Mumbai',
                to: 'Delhi',
                departureDate: '2023-10-15',
                departureTime: '08:30',
                preferences: {
                    shareAuto: true,
                    womenOnly: false,
                    luggageHelp: true
                },
                notes: 'Looking for someone to share a cab to the city center',
                createdAt: new Date().toISOString()
            },
            {
                id: 'journey2',
                userId: 'user3',
                type: 'flight',
                pnr: null,
                from: 'Delhi',
                to: 'Bangalore',
                departureDate: '2023-10-20',
                departureTime: '14:00',
                preferences: {
                    shareAuto: true,
                    womenOnly: true,
                    luggageHelp: false
                },
                notes: 'First time traveling to Bangalore, looking for guidance',
                createdAt: new Date().toISOString()
            },
            {
                id: 'journey3',
                userId: 'user4',
                type: 'bus',
                pnr: null,
                from: 'Mumbai',
                to: 'Pune',
                departureDate: '2023-10-18',
                departureTime: '10:15',
                preferences: {
                    shareAuto: false,
                    womenOnly: false,
                    luggageHelp: false
                },
                notes: '',
                createdAt: new Date().toISOString()
            }
        ];
        
        // Add mock journeys
        mockJourneys.push(...mockJourneyData);
        localStorage.setItem('journeys', JSON.stringify(mockJourneys));
    }
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
        return 'just now';
    }
}

// Add automatic location suggestion
fromLocation.addEventListener('input', function() {
    suggestLocations(this);
});

toLocation.addEventListener('input', function() {
    suggestLocations(this);
});

// Suggest locations
function suggestLocations(input) {
    // Create suggestion div if it doesn't exist
    let suggestionDiv = input.nextElementSibling;
    if (!suggestionDiv || !suggestionDiv.classList.contains('suggestion-list')) {
        suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion-list';
        input.parentNode.insertBefore(suggestionDiv, input.nextSibling);
    }
    
    // Clear existing suggestions
    suggestionDiv.innerHTML = '';
    
    // Get input value
    const value = input.value.trim().toLowerCase();
    if (value.length < 2) {
        suggestionDiv.style.display = 'none';
        return;
    }
    
    // Mock location data
    const locations = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
        'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
        'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
        'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad'
    ];
    
    // Filter locations
    const filteredLocations = locations.filter(location => 
        location.toLowerCase().includes(value)
    );
    
    // Display suggestions
    if (filteredLocations.length > 0) {
        filteredLocations.forEach(location => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.textContent = location;
            suggestion.addEventListener('click', () => {
                input.value = location;
                suggestionDiv.style.display = 'none';
            });
            suggestionDiv.appendChild(suggestion);
        });
        suggestionDiv.style.display = 'block';
    } else {
        suggestionDiv.style.display = 'none';
    }
}

// Close suggestion list when clicking outside
document.addEventListener('click', function(e) {
    const suggestionLists = document.querySelectorAll('.suggestion-list');
    suggestionLists.forEach(list => {
        if (e.target !== list && !e.target.classList.contains('location-input')) {
            list.style.display = 'none';
        }
    });
});

// Set minimum date for departure date
const today = new Date().toISOString().split('T')[0];
departureDate.setAttribute('min', today);

// Add responsive navigation
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sideMenu = document.querySelector('.side-menu');

mobileMenuBtn.addEventListener('click', () => {
    sideMenu.classList.toggle('active');
});

// Close side menu when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !e.target.closest('.side-menu') && 
        !e.target.closest('#mobileMenuBtn') &&
        sideMenu.classList.contains('active')) {
        sideMenu.classList.remove('active');
    }
});

// Add notification functionality
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Add event listener for close button
    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Initialize application
function initApp() {
    // Check authentication
    checkAuth();
    
    // Display data
    displayJourneys();
    displayMatches();
    displayContacts();
    
    // Show welcome notification
    showNotification(`Welcome back, ${currentUser.name.split(' ')[0]}!`, 'success');
}

// Call init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);