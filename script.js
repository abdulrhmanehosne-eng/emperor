// ====== FIREBASE CONFIGURATION ======
const firebaseConfig = {
    apiKey: "AIzaSyBoBLbyO4KQopjjiEmA-XijPSBZemDfz6o",
    authDomain: "emperorofthevoid-29d9b.firebaseapp.com",
    projectId: "emperorofthevoid-29d9b",
    storageBucket: "emperorofthevoid-29d9b.firebasestorage.app",
    messagingSenderId: "456023373540",
    appId: "1:456023373540:web:250566bcd8e3cb6e229ef1",
    measurementId: "G-WX52FHMWCD"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ====== STATE MANAGEMENT ======
let currentLanguage = 'ar';
let currentTheme = 'dark';
let activeTab = 'about';
let gameState = null;
let ratings = [];
let isTyping = false;
let aiConversationHistory = [];
let userId = null;

// ====== TOAST SYSTEM ======
class Toast {
    static show(message, type = 'info', duration = 4000) {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        });
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                     type === 'error' ? 'fa-exclamation-circle' :
                     type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();
    
    // Initialize all systems
    initTabs();
    initLanguageToggle();
    initDarkModeToggle();
    initGames();
    initRatingSystem();
    initAIChat();
    
    // Load data
    loadData();
    
    // Load ratings from Firebase
    loadRatingsFromFirebase();
    
    // Generate user ID for anonymous user
    userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    
    // Load conversation history from Firebase
    loadConversationHistoryFromFirebase();
    
    // Show welcome message
    setTimeout(() => {
        const welcomeMsg = currentLanguage === 'ar' 
            ? 'مرحباً بك في مملكة الفراغ!' 
            : 'Welcome to Void Kingdom!';
        Toast.show(welcomeMsg, 'info', 5000);
    }, 1000);
});

// ====== SETTINGS ======
function loadSettings() {
    // Load language
    const savedLang = localStorage.getItem('voidEmperorLanguage');
    if (savedLang) {
        currentLanguage = savedLang;
    }
    
    // Load theme
    const savedTheme = localStorage.getItem('voidEmperorTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    
    // Load active tab
    const savedTab = localStorage.getItem('voidEmperorActiveTab');
    if (savedTab) {
        activeTab = savedTab;
    }
    
    // Apply loaded settings
    applyLanguage();
    applyTheme();
}

function saveSettings() {
    localStorage.setItem('voidEmperorLanguage', currentLanguage);
    localStorage.setItem('voidEmperorTheme', currentTheme);
    localStorage.setItem('voidEmperorActiveTab', activeTab);
}

// ====== LANGUAGE SYSTEM ======
function initLanguageToggle() {
    const toggleBtn = document.getElementById('languageToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleLanguage);
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    applyLanguage();
    saveSettings();
    
    const message = currentLanguage === 'ar' 
        ? 'تم تغيير اللغة إلى العربية' 
        : 'Language changed to English';
    Toast.show(message, 'info');
}

function applyLanguage() {
    // Set HTML attributes
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Update all text elements
    document.querySelectorAll('[lang]').forEach(el => {
        if (el.getAttribute('lang') === currentLanguage) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    
    // Update language toggle button text
    const toggleBtn = document.getElementById('languageToggle');
    if (toggleBtn) {
        const arText = toggleBtn.querySelector('[lang="ar"]');
        const enText = toggleBtn.querySelector('[lang="en"]');
        
        if (currentLanguage === 'ar') {
            arText.textContent = 'English';
            enText.textContent = 'English';
        } else {
            arText.textContent = 'العربية';
            enText.textContent = 'العربية';
        }
    }
    
    // Reload data
    loadData();
    
    // Update placeholders
    updatePlaceholders();
    
    // Update game if active
    if (gameState) {
        updateGameLanguage();
    }
    
    // Update AI chat if needed
    updateAIChatLanguage();
}

function updatePlaceholders() {
    const ratingComment = document.getElementById('ratingComment');
    if (ratingComment) {
        ratingComment.placeholder = currentLanguage === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...';
    }
    
    const messageInput = document.getElementById('messageInput');
    const messageInputEn = document.getElementById('messageInputEn');
    
    if (currentLanguage === 'ar') {
        if (messageInput) {
            messageInput.placeholder = 'اكتب سؤالك هنا...';
            messageInput.classList.remove('hidden');
        }
        if (messageInputEn) {
            messageInputEn.classList.add('hidden');
        }
    } else {
        if (messageInputEn) {
            messageInputEn.placeholder = 'Type your question here...';
            messageInputEn.classList.remove('hidden');
        }
        if (messageInput) {
            messageInput.classList.add('hidden');
        }
    }
}

// ====== THEME SYSTEM ======
function initDarkModeToggle() {
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveSettings();
    
    const message = currentTheme === 'dark' 
        ? 'تم تفعيل الوضع الداكن' 
        : 'Light mode activated';
    Toast.show(message, 'info');
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update toggle button icons
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
        const moonIcon = toggleBtn.querySelector('.fa-moon');
        const sunIcon = toggleBtn.querySelector('.fa-sun');
        
        if (currentTheme === 'dark') {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        } else {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        }
    }
}

// ====== TABS SYSTEM ======
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Switch to saved tab
    switchTab(activeTab);
}

function switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Update active states
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    if (targetBtn && targetContent) {
        targetBtn.classList.add('active');
        targetContent.classList.add('active');
        activeTab = tabId;
        saveSettings();
        
        // Handle special tab actions
        if (tabId === 'ai') {
            loadConversationHistory();
        } else if (tabId === 'games') {
            hideGameContainer();
        }
    }
}

// ====== DATA ======
const DATA = {
    achievements: [
        {
            id: 1,
            title: { ar: 'تأسيس إمبراطورية الفراغ', en: 'Establishment of Void Empire' },
            description: { 
                ar: 'إنشاء وتأسيس مملكة الفراغ الافتراضية وإعلان نفسي إمبراطوراً عليها في ديسمبر 2025', 
                en: 'Creation and establishment of virtual Void Kingdom and declaring myself as Emperor in December 2025' 
            },
            date: '2025-12-17',
            category: { ar: 'تأسيسية', en: 'Foundational' }
        },
        {
            id: 2,
            title: { ar: 'إطلاق الموقع الرسمي', en: 'Official Website Launch' },
            description: { 
                ar: 'تصميم وتطوير الموقع الرسمي لإمبراطورية الفراغ باستخدام أحدث التقنيات', 
                en: 'Design and development of official Void Empire website using latest technologies' 
            },
            date: '2025-12-21',
            category: { ar: 'تكنولوجية', en: 'Technological' }
        },
        {
            id: 3,
            title: { ar: 'أضافه العاب ترفيهيه', en: 'Fun games added' },
            description: { 
                ar: 'تم اضافه لعبتين لتسليه شعب الامبراطورية', 
                en: 'Two games have been added to entertain the people of the empire.' 
            },
            date: '2025-12-17',
            category: { ar: 'توسعية', en: 'Expansive' }
        },
        {
            id: 4,
            title: { ar: 'نظام الذكاء الاصطناعي', en: 'AI System Development' },
            description: { 
                ar: 'تطوير نظام ذكاء اصطناعي متقدم لتحليل البيانات والتنبؤ بالمستقبل', 
                en: 'Development of advanced AI system for data analysis and future prediction' 
            },
            date: '2025-12-19',
            category: { ar: 'تكنولوجية', en: 'Technological' }
        }
    ],
    
    portfolio: [
        {
            id: 1,
            title: { ar: 'موقع المملكة الرسمي', en: 'Official Kingdom Website' },
            description: { 
                ar: 'تصميم وتطوير الموقع الرسمي بالكامل مع دعم اللغتين العربية والإنجليزية', 
                en: 'Complete design and development of official website with Arabic and English support' 
            },
            image: 'https://i.ibb.co/3YNCzWZ7/image.png',
            tags: [{ ar: 'ويب', en: 'Web' }, { ar: 'تصميم', en: 'Design' }, { ar: 'تطوير', en: 'Development' }, { ar: 'متجاوب', en: 'Responsive' }]
        },
        {
            id: 2,
            title: { ar: 'نظام الذكاء الاصطناعي', en: 'AI System' },
            description: { 
                ar: 'نظام ذكاء اصطناعي للتنبؤ وتحليل البيانات مع واجهة مستخدم متقدمة', 
                en: 'AI system for prediction and data analysis with advanced user interface' 
            },
            image: 'https://i.ibb.co/sph7DJJM/image.png',
            tags: [{ ar: 'ذكاء اصطناعي', en: 'AI' }, { ar: 'بيانات', en: 'Data' }, { ar: 'تحليل', en: 'Analysis' }]
        },
        {
            id: 3,
            title: { ar: 'منصة الألعاب', en: 'Gaming Platform' },
            description: { 
                ar: 'منصة ألعاب تفاعلية مع ألعاب تعليمية وترفيهية للمستخدمين', 
                en: 'Interactive gaming platform with educational and entertainment games for users' 
            },
            image: 'https://i.ibb.co/HTXwdcsv/image.png',
            tags: [{ ar: 'ألعاب', en: 'Games' }, { ar: 'تفاعلية', en: 'Interactive' }, { ar: 'ترفيه', en: 'Entertainment' }]
        }
    ],
    
    contact: [
        {
            platform: { ar: 'البريد الإلكتروني', en: 'Email' },
            info: 'abdulrhmanehosne@gmail.com',
            icon: 'fas fa-envelope',
            link: 'mailto:abdulrhmanehosne@gmail.com'
        },
        {
            platform: { ar: 'تويتر', en: 'Twitter' },
            info: '@Abd_AL_Rhmane_',
            icon: 'fab fa-twitter',
            link: 'https://twitter.com/Abd_Al_Rhmane_'
        },
        {
            platform: { ar: 'تليجرام', en: 'Telegram' },
            info: '@AbdAlRhmaneHosne',
            icon: 'fab fa-telegram',
            link: 'https://t.me/@AbdAlRhmaneHosne'
        }
    ],
    
    quizQuestions: [
        {
            question: { ar: 'في أي عام تأسست مملكة الفراغ؟', en: 'In which year was Void Kingdom established?' },
            answers: [
                { ar: '2024', en: '2024' },
                { ar: '2025', en: '2025' },
                { ar: '2026', en: '2026' },
                { ar: '2023', en: '2023' }
            ],
            correct: 1,
            explanation: { 
                ar: 'تأسست مملكة الفراغ في ديسمبر 2025', 
                en: 'Void Kingdom was established in December 2025' 
            }
        },
        {
            question: { ar: 'ما هو اللون الرسمي لإمبراطورية الفراغ؟', en: 'What is the official color of Void Empire?' },
            answers: [
                { ar: 'الأزرق الداكن', en: 'Dark Blue' },
                { ar: 'الأرجواني', en: 'Purple' },
                { ar: 'الأحمر القاني', en: 'Crimson Red' },
                { ar: 'الأخضر الزمردي', en: 'Emerald Green' }
            ],
            correct: 1,
            explanation: { 
                ar: 'اللون الأرجواني هو اللون الرسمي للإمبراطورية', 
                en: 'Purple is the official color of the Empire' 
            }
        },
        {
            question: { ar: 'ما هو اسم إمبراطور الفراغ الحقيقي؟', en: 'What is Void Emperor\'s real name?' },
            answers: [
                { ar: 'أحمد محمد', en: 'Ahmed Mohamed' },
                { ar: 'عبدالرحمن حسني', en: 'Abdul Rahman Hosni' },
                { ar: 'محمد علي', en: 'Mohamed Ali' },
                { ar: 'خالد سعيد', en: 'Khaled Saeed' }
            ],
            correct: 1,
            explanation: { 
                ar: 'اسم الإمبراطور الحقيقي هو عبدالرحمن حسني عبدالمنعم', 
                en: 'The Emperor\'s real name is Abdul Rahman Hosni Abdul Moneim' 
            }
        }
    ],
    
    memoryIcons: [
        'fas fa-crown', 'fas fa-star', 'fas fa-moon', 'fas fa-sun',
        'fas fa-gem', 'fas fa-ring', 'fas fa-shield', 'fas fa-dragon'
    ]
};

// ====== DATA LOADING ======
function loadData() {
    loadAchievements();
    loadPortfolio();
    loadContact();
}

function loadAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    grid.innerHTML = DATA.achievements.map(achievement => `
        <div class="achievement-card">
            <div class="achievement-header">
                <div>
                    <h3 class="achievement-title">${achievement.title[currentLanguage]}</h3>
                    <div class="achievement-category">${achievement.category[currentLanguage]}</div>
                </div>
                <span class="achievement-date">${formatDate(achievement.date)}</span>
            </div>
            <p class="achievement-description">${achievement.description[currentLanguage]}</p>
            <div class="achievement-id">#${achievement.id.toString().padStart(3, '0')}</div>
        </div>
    `).join('');
}

function loadPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    
    grid.innerHTML = DATA.portfolio.map(item => `
        <div class="portfolio-item">
            <img src="${item.image}" alt="${item.title[currentLanguage]}" class="portfolio-image" 
                 loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
            <div class="portfolio-info">
                <h3 class="portfolio-title">${item.title[currentLanguage]}</h3>
                <p class="portfolio-description">${item.description[currentLanguage]}</p>
                <div class="portfolio-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag[currentLanguage]}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function loadContact() {
    const grid = document.getElementById('contactGrid');
    if (!grid) return;
    
    grid.innerHTML = DATA.contact.map(contact => `
        <a href="${contact.link}" class="contact-card" target="_blank" rel="noopener noreferrer">
            <div class="contact-icon">
                <i class="${contact.icon}"></i>
            </div>
            <div class="contact-details">
                <div class="contact-platform">${contact.platform[currentLanguage]}</div>
                <div class="contact-info">${contact.info}</div>
            </div>
        </a>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (currentLanguage === 'ar') {
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ====== FIREBASE FUNCTIONS ======
async function loadRatingsFromFirebase() {
    try {
        const snapshot = await db.collection('ratings').orderBy('timestamp', 'desc').get();
        ratings = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            ratings.push({
                id: doc.id,
                ...data,
                date: data.timestamp ? data.timestamp.toDate() : new Date()
            });
        });
        updateRatingDisplay();
    } catch (error) {
        console.error('Error loading ratings:', error);
        Toast.show(currentLanguage === 'ar' ? 'خطأ في تحميل التقييمات' : 'Error loading ratings', 'error');
    }
}

async function submitRatingToFirebase(ratingData) {
    try {
        await db.collection('ratings').add({
            ...ratingData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId
        });
        return true;
    } catch (error) {
        console.error('Error submitting rating:', error);
        return false;
    }
}

async function loadConversationHistoryFromFirebase() {
    try {
        const snapshot = await db.collection('conversations')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'asc')
            .get();
        
        aiConversationHistory = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            aiConversationHistory.push({
                id: doc.id,
                ...data
            });
        });
        
        // Load the conversation in UI
        loadConversationHistory();
    } catch (error) {
        console.error('Error loading conversation history:', error);
    }
}

async function saveMessageToFirebase(role, content) {
    try {
        await db.collection('conversations').add({
            userId: userId,
            role: role,
            content: content,
            language: currentLanguage,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error saving message:', error);
        return false;
    }
}

async function clearChatHistoryFromFirebase() {
    try {
        const snapshot = await db.collection('conversations')
            .where('userId', '==', userId)
            .get();
        
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error('Error clearing chat history:', error);
        return false;
    }
}

// ====== RATING SYSTEM ======
function initRatingSystem() {
    // Star rating input
    const stars = document.querySelectorAll('.rating-stars-input i');
    const selectedRatingSpan = document.getElementById('selectedRating');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('mouseover', (e) => {
            const rating = parseInt(e.target.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('click', (e) => {
            selectedRating = parseInt(e.target.getAttribute('data-rating'));
            selectedRatingSpan.textContent = selectedRating;
            highlightStars(selectedRating);
        });
    });
    
    document.querySelector('.rating-stars-input').addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
    });
    
    document.getElementById('submitRating').addEventListener('click', submitRating);
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-stars-input i');
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

async function submitRating() {
    const selectedRating = parseInt(document.getElementById('selectedRating').textContent);
    const comment = document.getElementById('ratingComment').value.trim();
    
    if (selectedRating === 0) {
        Toast.show(
            currentLanguage === 'ar' 
                ? 'يرجى اختيار تقييم من 1 إلى 5 نجوم' 
                : 'Please select a rating from 1 to 5 stars',
            'error'
        );
        return;
    }
    
    const newRating = {
        rating: selectedRating,
        comment: comment || (currentLanguage === 'ar' ? 'لا يوجد تعليق' : 'No comment'),
        user: currentLanguage === 'ar' ? 'زائر' : 'Visitor',
        language: currentLanguage
    };
    
    const success = await submitRatingToFirebase(newRating);
    
    if (success) {
        // Reset form
        document.getElementById('ratingComment').value = '';
        document.getElementById('selectedRating').textContent = '0';
        highlightStars(0);
        
        // Reload ratings
        await loadRatingsFromFirebase();
        
        Toast.show(
            currentLanguage === 'ar' 
                ? 'شكراً لتقييمك!' 
                : 'Thank you for your rating!',
            'success'
        );
    } else {
        Toast.show(
            currentLanguage === 'ar' 
                ? 'حدث خطأ في إرسال التقييم' 
                : 'Error submitting rating',
            'error'
        );
    }
}

function updateRatingDisplay() {
    const languageRatings = ratings.filter(r => r.language === currentLanguage);
    
    if (languageRatings.length > 0) {
        const total = languageRatings.reduce((sum, r) => sum + r.rating, 0);
        const average = (total / languageRatings.length).toFixed(1);
        document.getElementById('averageRating').textContent = average;
        
        const starsContainer = document.getElementById('starsContainer');
        const fullStars = Math.floor(average);
        const hasHalfStar = average % 1 >= 0.5;
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        starsContainer.innerHTML = starsHTML;
    } else {
        document.getElementById('averageRating').textContent = '0.0';
        document.getElementById('starsContainer').innerHTML = `
            <i class="far fa-star"></i>
            <i class="far fa-star"></i>
            <i class="far fa-star"></i>
            <i class="far fa-star"></i>
            <i class="far fa-star"></i>
        `;
    }
    
    const totalRatings = document.getElementById('totalRatings');
    if (currentLanguage === 'ar') {
        totalRatings.textContent = `(${languageRatings.length} تقييم${languageRatings.length > 1 ? 'ات' : ''})`;
    } else {
        totalRatings.textContent = `(${languageRatings.length} rating${languageRatings.length > 1 ? 's' : ''})`;
    }
    
    displayRecentRatings(languageRatings);
}

function displayRecentRatings(ratingsList) {
    const container = document.getElementById('ratingsList');
    if (!container) return;
    
    if (!ratingsList || ratingsList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <i class="fas fa-star" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>${currentLanguage === 'ar' ? 'لا توجد تقييمات بعد' : 'No ratings yet'}</p>
            </div>
        `;
        return;
    }
    
    const recentRatings = ratingsList.slice(0, 5);
    
    container.innerHTML = recentRatings.map(rating => `
        <div class="rating-item">
            <div class="rating-header">
                <span class="rating-user">${rating.user || (currentLanguage === 'ar' ? 'زائر' : 'Visitor')}</span>
                <span class="rating-date">${formatDate(rating.date)}</span>
            </div>
            <div style="color: var(--gold); margin-bottom: 10px;">
                ${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}
            </div>
            <p class="rating-comment">${rating.comment}</p>
        </div>
    `).join('');
}

// ====== AI RESPONSE SYSTEM ======
const AI_RESPONSES = {
    ar: {
        greeting: "مرحباً! أنا مساعد إمبراطور الفراغ الذكي. يمكنني الإجابة على أسئلتك حول المملكة، التقنية، البرمجة، المستقبل، وأي موضوع آخر. كيف يمكنني مساعدتك اليوم؟",
        
        personal: "أنا إمبراطور الفراغ، حاكم مملكة الفراغ الافتراضية. اسمي الحقيقي عبدالرحمن حسني عبدالمنعم، عمري 21 سنة. مؤسس هذه المملكة الرقمية المتميزة التي تدمج بين التقنية المتقدمة والإبداع البشري. بدأت رحلتي في ديسمبر 2025 بهدف إنشاء عالم رقمي متميز.",
        
        skills: "أمتلك مهارات متقدمة في: تطوير الويب الكامل (94%)، تطبيقات الهاتف (85%)، تصميم واجهات المستخدم (88%)، إدارة المشاريع التقنية (96%). أتقن لغات برمجة متعددة وأستخدم أحدث التقنيات.",
        
        projects: "أعمل على مشاريع متعددة: موقع المملكة الرسمي، نظام ذكاء اصطناعي متقدم، تطبيق جوال متكامل، منصة ألعاب تعليمية. كل مشروع يمثل تحدياً جديداً وفرصة للابتكار.",
        
        future: "خططي المستقبلية تشمل: توسعة المملكة رقمياً، تطوير أنظمة ذكاء اصطناعي أكثر تطوراً، إنشاء مجتمع افتراضي متكامل، إطلاق منصات تعليمية وتقنية جديدة، والمساهمة في تطور المجتمع التقني العالمي.",
        
        advice: {
            programming: "ابدأ بالأساسيات، تعلم جيداً قبل الانتقال للمواضيع المتقدمة، مارس يومياً، ابني مشاريع صغيرة ثم كبري حجمها، تعلم من الأخطاء، اقرأ الكود الجيد، وشارك في مجتمعات البرمجة.",
            success: "كن فضولياً، تعلم باستمرار، كن منضبطاً، طور مهارات التواصل، تعلم العمل الجماعي، حافظ على التوازن بين العمل والحياة، وكن مبدعاً في حل المشكلات.",
            general: "التقنية وسيلة لتحسين الحياة وليست غاية في حد ذاتها. النجاح الحقيقي يأتي من الإبداع والابتكار المستمر، مع الحفاظ على القيم الإنسانية الأساسية."
        },
        
        unknown: "هذا سؤال مثير للاهتمام! يمكنني مساعدتك في مواضيع أخرى مثل البرمجة، الذكاء الاصطناعي، نصائح تقنية، أو معلومات عن إمبراطور الفراغ ومشاريعه.",
        
        help: "يمكنني المساعدة في: 1) معلومات عن إمبراطور الفراغ 2) نصائح برمجية وتقنية 3) شرح مفاهيم الذكاء الاصطناعي 4) مشاريعي وإنجازاتي 5) نصائح للنجاح والقيادة 6) مناقشة أي موضوع تقني"
    },
    
    en: {
        greeting: "Hello! I am the Void Emperor AI Assistant. I can answer your questions about the Kingdom, technology, programming, future, and any other topic. How can I help you today?",
        
        personal: "I am the Void Emperor, ruler of the virtual Void Kingdom. My real name is Abdul Rahman Hosni Abdul Moneim, I am 21 years old. Founder of this distinguished digital kingdom that integrates advanced technology with human creativity. I started my journey in December 2025 with the goal of creating a distinguished digital world.",
        
        skills: "I have advanced skills in: Full Stack web development (94%), Mobile applications (85%), UI/UX Design (88%), Technical Project Management (96%). I master multiple programming languages and use the latest technologies.",
        
        projects: "I work on multiple projects: Official Kingdom website, advanced AI system, integrated mobile app, educational gaming platform. Each project represents a new challenge and opportunity for innovation.",
        
        future: "My future plans include: Digital expansion of the Kingdom, development of more advanced AI systems, creation of an integrated virtual community, launch of new educational and technological platforms, and contribution to the development of the global technical community.",
        
        advice: {
            programming: "Start with basics, learn well before moving to advanced topics, practice daily, build small projects then scale up, learn from mistakes, read good code, and participate in programming communities.",
            success: "Be curious, learn continuously, be disciplined, develop communication skills, learn teamwork, maintain work-life balance, and be creative in problem-solving.",
            general: "Technology is a means to improve life, not an end in itself. True success comes from continuous creativity and innovation, while maintaining basic human values."
        },
        
        unknown: "This is an interesting question! I can help you with other topics like programming, artificial intelligence, technical advice, or information about Void Emperor and his projects.",
        
        help: "I can help with: 1) Information about Void Emperor 2) Programming and technical tips 3) Explanation of AI concepts 4) My projects and achievements 5) Success and leadership tips 6) Discussion of any technical topic"
    }
};

// ====== AI CHAT SYSTEM ======
function initAIChat() {
    const sendBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('messageInput');
    const messageInputEn = document.getElementById('messageInputEn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    if (messageInputEn) {
        messageInputEn.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChatHistory);
    }
    
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.currentTarget.getAttribute('data-text');
            sendQuickMessage(text);
        });
    });
    
    // Initialize conversation with greeting if empty
    if (aiConversationHistory.length === 0) {
        addMessageToChat(AI_RESPONSES[currentLanguage].greeting, false);
    } else {
        loadConversationHistory();
    }
}

async function sendMessage() {
    if (isTyping) return;
    
    const messageInput = currentLanguage === 'ar' 
        ? document.getElementById('messageInput')
        : document.getElementById('messageInputEn');
    
    const sendBtn = document.getElementById('sendMessageBtn');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    isTyping = true;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${currentLanguage === 'ar' ? 'جاري الإرسال...' : 'Sending...'}`;
    
    try {
        // Add user message to chat
        addMessageToChat(message, true);
        
        // Save to Firebase
        await saveMessageToFirebase('user', message);
        
        // Clear input
        messageInput.value = '';
        
        // Show typing indicator
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) typingIndicator.classList.remove('hidden');
        
        // Get AI response
        const response = await getAIResponse(message);
        
        // Hide typing indicator
        if (typingIndicator) typingIndicator.classList.add('hidden');
        
        if (response) {
            // Add AI response to chat with typing effect
            await typeMessage(response);
            
            // Save AI response to Firebase
            await saveMessageToFirebase('assistant', response);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = currentLanguage === 'ar' 
            ? 'عذراً، حدث خطأ في الإرسال. حاول مرة أخرى.' 
            : 'Sorry, an error occurred. Please try again.';
        addMessageToChat(errorMessage, false);
    } finally {
        isTyping = false;
        messageInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<i class="fas fa-paper-plane"></i> <span lang="ar">إرسال</span><span class="hidden" lang="en">Send</span>`;
        messageInput.focus();
    }
}

async function getAIResponse(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const lang = currentLanguage;
    const lowerQuery = query.toLowerCase().trim();
    
    // Check for specific questions
    if (lowerQuery.includes('أخبرني عن إمبراطور الفراغ') || lowerQuery.includes('who are you')) {
        return AI_RESPONSES[lang].personal;
    }
     if (lowerQuery.includes('من أنت') || lowerQuery.includes('who are you')) {
        return AI_RESPONSES[lang].personal;
    }
         if (lowerQuery.includes('من انت') || lowerQuery.includes('who are you')) {
        return AI_RESPONSES[lang].personal;
    }
    if (lowerQuery.includes('مهارات') || lowerQuery.includes('skills')) {
        return AI_RESPONSES[lang].skills;
    }
    
    if (lowerQuery.includes('مشاريع') || lowerQuery.includes('projects')) {
        return AI_RESPONSES[lang].projects;
    }
    
    if (lowerQuery.includes('مستقبل') || lowerQuery.includes('future')) {
        return AI_RESPONSES[lang].future;
    }
    
    if (lowerQuery.includes('مساعدة') || lowerQuery.includes('help')) {
        return AI_RESPONSES[lang].help;
    }
    
    // Check for programming advice
    if (lowerQuery.includes('برمجة') || lowerQuery.includes('programming') || 
        lowerQuery.includes('كود') || lowerQuery.includes('code')) {
        return AI_RESPONSES[lang].advice.programming;
    }
    
    // Check for success advice
    if (lowerQuery.includes('نجاح') || lowerQuery.includes('success') ||
        lowerQuery.includes('نصيحة') || lowerQuery.includes('advice')) {
        return AI_RESPONSES[lang].advice.success;
    }
    
    // Check for greetings
    if (lowerQuery.includes('مرحبا') || lowerQuery.includes('hello') ||
        lowerQuery.includes('اهلا') || lowerQuery.includes('hi')) {
        return AI_RESPONSES[lang].greeting;
    }
    
    // Default response
    return AI_RESPONSES[lang].unknown;
}

async function typeMessage(text) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';
    senderDiv.innerHTML = `<i class="fas fa-robot"></i> <span>${currentLanguage === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}</span>`;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageContent.appendChild(senderDiv);
    messageContent.appendChild(textDiv);
    messageContent.appendChild(timeDiv);
    messageDiv.appendChild(messageContent);
    container.appendChild(messageDiv);
    
    // Type effect
    let i = 0;
    const speed = 20; // milliseconds per character
    
    function typeWriter() {
        if (i < text.length) {
            textDiv.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
            container.scrollTop = container.scrollHeight;
        }
    }
    
    await new Promise(resolve => {
        typeWriter();
        setTimeout(resolve, text.length * speed + 100);
    });
}

function addMessageToChat(text, isUser) {
    const container = document.getElementById('messagesContainer');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const senderText = isUser 
        ? (currentLanguage === 'ar' ? 'أنت' : 'You')
        : (currentLanguage === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant');
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-sender">
                ${isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}
                <span>${senderText}</span>
            </div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function sendQuickMessage(text) {
    const messageInput = currentLanguage === 'ar' 
        ? document.getElementById('messageInput')
        : document.getElementById('messageInputEn');
    
    messageInput.value = text;
    sendMessage();
}

function loadConversationHistory() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    // Clear existing messages
    container.innerHTML = '';
    
    // Filter conversations by current language
    const languageConversations = aiConversationHistory.filter(conv => conv.language === currentLanguage);
    
    // If no conversations, show greeting
    if (languageConversations.length === 0) {
        addMessageToChat(AI_RESPONSES[currentLanguage].greeting, false);
        return;
    }
    
    // Display conversations
    languageConversations.forEach(conv => {
        addMessageToChat(conv.content, conv.role === 'user');
    });
}

async function clearChatHistory() {
    const confirmMsg = currentLanguage === 'ar' 
        ? 'هل أنت متأكد من حذف سجل المحادثة؟ هذا الإجراء لا يمكن التراجع عنه.'
        : 'Are you sure you want to clear chat history? This action cannot be undone.';
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const success = await clearChatHistoryFromFirebase();
        
        if (success) {
            // Clear local history
            aiConversationHistory = [];
            
            // Clear UI
            const container = document.getElementById('messagesContainer');
            container.innerHTML = '';
            
            // Add greeting message
            addMessageToChat(AI_RESPONSES[currentLanguage].greeting, false);
            
            Toast.show(
                currentLanguage === 'ar' 
                    ? 'تم مسح سجل المحادثة بنجاح' 
                    : 'Chat history cleared successfully',
                'success'
            );
        } else {
            throw new Error('Failed to clear chat history');
        }
    } catch (error) {
        console.error('Error clearing chat history:', error);
        Toast.show(
            currentLanguage === 'ar' 
                ? 'حدث خطأ في مسح المحادثة' 
                : 'Error clearing chat',
            'error'
        );
    }
}

function updateAIChatLanguage() {
    // Reload conversation history for new language
    loadConversationHistory();
}

// ====== GAMES SYSTEM ======
function initGames() {
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gameType = e.currentTarget.getAttribute('data-game');
            startGame(gameType);
        });
    });
}

function startGame(type) {
    const gameContainer = document.getElementById('gameContainer');
    const gamesGrid = document.querySelector('.games-grid');
    
    gamesGrid.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    gameState = { type };
    
    switch(type) {
        case 'quiz':
            startQuizGame();
            break;
        case 'memory':
            startMemoryGame();
            break;
    }
}

function startQuizGame() {
    gameState = {
        type: 'quiz',
        currentQuestion: 0,
        score: 0,
        totalQuestions: DATA.quizQuestions.length,
        answers: []
    };
    
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div class="game-area">
            <div class="game-header">
                <div class="game-stats">
                    <span id="quizScore">${currentLanguage === 'ar' ? 'النقاط:' : 'Score:'} 0</span>
                    <span id="quizProgress">${currentLanguage === 'ar' ? 'السؤال:' : 'Question:'} 1/${gameState.totalQuestions}</span>
                </div>
                <button class="back-btn" id="exitGameBtn">
                    <i class="fas fa-times"></i>
                    ${currentLanguage === 'ar' ? 'خروج' : 'Exit'}
                </button>
            </div>
            
            <div class="quiz-container">
                <div class="question-container" id="questionContainer"></div>
                <div class="answers-grid" id="answersGrid"></div>
            </div>
        </div>
    `;
    
    document.getElementById('exitGameBtn').addEventListener('click', exitGame);
    showQuizQuestion();
}

function showQuizQuestion() {
    const question = DATA.quizQuestions[gameState.currentQuestion];
    const container = document.getElementById('questionContainer');
    const answersGrid = document.getElementById('answersGrid');
    
    if (!container || !answersGrid) return;
    
    container.innerHTML = `
        <h3 class="question-text">${question.question[currentLanguage]}</h3>
    `;
    
    answersGrid.innerHTML = question.answers.map((answer, index) => `
        <button class="answer-btn" data-answer="${index}">${answer[currentLanguage]}</button>
    `).join('');
    
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedAnswer = parseInt(e.currentTarget.getAttribute('data-answer'));
            checkQuizAnswer(selectedAnswer, question.correct, question.explanation);
        });
    });
    
    updateQuizProgress();
}

function checkQuizAnswer(selected, correct, explanation) {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    gameState.answers.push({
        question: gameState.currentQuestion,
        selected,
        correct,
        isCorrect: selected === correct
    });
    
    buttons.forEach((btn, index) => {
        if (index === correct) {
            btn.classList.add('correct');
        } else if (index === selected) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        gameState.score += 100;
    }
    
    const container = document.getElementById('questionContainer');
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(76, 175, 80, 0.3);
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.5;
    `;
    explanationDiv.textContent = explanation[currentLanguage];
    container.appendChild(explanationDiv);
    
    setTimeout(() => {
        gameState.currentQuestion++;
        
        if (gameState.currentQuestion < gameState.totalQuestions) {
            showQuizQuestion();
        } else {
            endQuizGame();
        }
    }, 2500);
}

function updateQuizProgress() {
    const progressElement = document.getElementById('quizProgress');
    const scoreElement = document.getElementById('quizScore');
    
    if (progressElement) {
        progressElement.textContent = `${currentLanguage === 'ar' ? 'السؤال:' : 'Question:'} ${gameState.currentQuestion + 1}/${gameState.totalQuestions}`;
    }
    
    if (scoreElement) {
        scoreElement.textContent = `${currentLanguage === 'ar' ? 'النقاط:' : 'Score:'} ${gameState.score}`;
    }
}

function endQuizGame() {
    const correctAnswers = gameState.answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctAnswers / gameState.totalQuestions) * 100);
    
    const container = document.getElementById('gameContainer');
    let message = '';
    let rating = '';
    
    if (accuracy >= 80) {
        message = currentLanguage === 'ar' ? 'ممتاز! أنت خبير في مملكة الفراغ.' : 'Excellent! You are an expert in Void Kingdom.';
        rating = '★★★★★';
    } else if (accuracy >= 60) {
        message = currentLanguage === 'ar' ? 'جيد جداً! لديك معرفة جيدة.' : 'Very good! You have good knowledge.';
        rating = '★★★★☆';
    } else if (accuracy >= 40) {
        message = currentLanguage === 'ar' ? 'ليس سيئاً! يمكنك تحسين معلوماتك.' : 'Not bad! You can improve your knowledge.';
        rating = '★★★☆☆';
    } else {
        message = currentLanguage === 'ar' ? 'حاول مرة أخرى لتحسين نتيجتك.' : 'Try again to improve your score.';
        rating = '★★☆☆☆';
    }
    
    container.innerHTML = `
        <div class="game-area">
            <div class="quiz-result">
                <h3 style="color: var(--accent-light); margin-bottom: 30px; text-align: center;">
                    ${currentLanguage === 'ar' ? 'انتهى الاختبار!' : 'Quiz Completed!'}
                </h3>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div class="result-score">${gameState.score}</div>
                    <div style="color: var(--gold); font-size: 1.5rem; margin-bottom: 15px;">${rating}</div>
                    <p style="color: var(--text-secondary); margin-bottom: 10px;">
                        ${currentLanguage === 'ar' ? 'الدقة:' : 'Accuracy:'} ${accuracy}%
                    </p>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                </div>
                
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button class="btn" id="playAgainBtn" style="flex: 1; min-width: 150px;">
                        <i class="fas fa-redo"></i>
                        ${currentLanguage === 'ar' ? 'لعبة أخرى' : 'Play Again'}
                    </button>
                    <button class="btn" id="exitGameBtn" style="flex: 1; min-width: 150px;">
                        <i class="fas fa-home"></i>
                        ${currentLanguage === 'ar' ? 'الرئيسية' : 'Home'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('playAgainBtn').addEventListener('click', () => startGame('quiz'));
    document.getElementById('exitGameBtn').addEventListener('click', exitGame);
}

function startMemoryGame() {
    gameState = {
        type: 'memory',
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        totalPairs: 8
    };
    
    // Create cards (use 8 pairs)
    let cards = [];
    const selectedIcons = DATA.memoryIcons.slice(0, gameState.totalPairs);
    selectedIcons.forEach(icon => {
        cards.push({ icon, id: Math.random(), matched: false });
        cards.push({ icon, id: Math.random(), matched: false });
    });
    
    // Shuffle
    cards = cards.sort(() => Math.random() - 0.5);
    gameState.cards = cards;
    
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <div class="game-area">
            <div class="game-header">
                <div class="game-stats">
                    <span id="memoryMoves">${currentLanguage === 'ar' ? 'الحركات:' : 'Moves:'} 0</span>
                    <span id="memoryPairs">${currentLanguage === 'ar' ? 'الأزواج:' : 'Pairs:'} 0/${gameState.totalPairs}</span>
                </div>
                <button class="back-btn" id="exitGameBtn">
                    <i class="fas fa-times"></i>
                    ${currentLanguage === 'ar' ? 'خروج' : 'Exit'}
                </button>
            </div>
            
            <div class="memory-container">
                <div class="memory-grid" id="memoryGrid"></div>
            </div>
        </div>
    `;
    
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = cards.map((card, index) => `
        <div class="memory-card" data-index="${index}">
            <div class="card-front">
                <i class="${card.icon}"></i>
            </div>
            <div class="card-back">
                <i class="fas fa-question"></i>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', handleCardClick);
    });
    
    document.getElementById('exitGameBtn').addEventListener('click', exitGame);
}

function handleCardClick(e) {
    const card = e.currentTarget;
    const index = parseInt(card.getAttribute('data-index'));
    
    if (card.classList.contains('flipped') || 
        card.classList.contains('matched') || 
        gameState.flippedCards.length >= 2) {
        return;
    }
    
    card.classList.add('flipped');
    gameState.flippedCards.push({ index, card });
    
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateMemoryStats();
        
        const card1 = gameState.flippedCards[0];
        const card2 = gameState.flippedCards[1];
        
        if (gameState.cards[card1.index].icon === gameState.cards[card2.index].icon) {
            // Match
            setTimeout(() => {
                card1.card.classList.add('matched');
                card2.card.classList.add('matched');
                gameState.matchedPairs++;
                gameState.flippedCards = [];
                updateMemoryStats();
                
                if (gameState.matchedPairs === gameState.totalPairs) {
                    setTimeout(() => endMemoryGame(), 500);
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                card1.card.classList.remove('flipped');
                card2.card.classList.remove('flipped');
                gameState.flippedCards = [];
            }, 1000);
        }
    }
}

function updateMemoryStats() {
    const movesElement = document.getElementById('memoryMoves');
    const pairsElement = document.getElementById('memoryPairs');
    
    if (movesElement) {
        movesElement.textContent = `${currentLanguage === 'ar' ? 'الحركات:' : 'Moves:'} ${gameState.moves}`;
    }
    
    if (pairsElement) {
        pairsElement.textContent = `${currentLanguage === 'ar' ? 'الأزواج:' : 'Pairs:'} ${gameState.matchedPairs}/${gameState.totalPairs}`;
    }
}

function endMemoryGame() {
    const efficiency = Math.round((gameState.totalPairs / gameState.moves) * 100) || 0;
    
    const container = document.getElementById('gameContainer');
    let rating = '';
    let message = '';
    
    if (gameState.moves <= 20) {
        rating = currentLanguage === 'ar' ? 'أداء رائع!' : 'Brilliant performance!';
        message = currentLanguage === 'ar' ? 'ذاكرة استثنائية!' : 'Exceptional memory!';
    } else if (gameState.moves <= 30) {
        rating = currentLanguage === 'ar' ? 'جيد جداً!' : 'Very good!';
        message = currentLanguage === 'ar' ? 'ذاكرة قوية!' : 'Strong memory!';
    } else if (gameState.moves <= 40) {
        rating = currentLanguage === 'ar' ? 'جيد!' : 'Good!';
        message = currentLanguage === 'ar' ? 'يمكنك التحسن بالممارسة.' : 'You can improve with practice.';
    } else {
        rating = currentLanguage === 'ar' ? 'حاول مرة أخرى!' : 'Try again!';
        message = currentLanguage === 'ar' ? 'استمر في التدريب.' : 'Keep practicing.';
    }
    
    container.innerHTML = `
        <div class="game-area">
            <h3 style="color: var(--accent-light); margin-bottom: 30px; text-align: center;">
                ${currentLanguage === 'ar' ? 'تهانينا!' : 'Congratulations!'}
            </h3>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <div class="result-score">${gameState.matchedPairs * 100}</div>
                <p style="color: var(--text-secondary); margin-bottom: 10px;">
                    ${currentLanguage === 'ar' ? 'أكملت اللعبة بـ' : 'You completed with'} ${gameState.moves} ${currentLanguage === 'ar' ? 'حركة' : 'moves'}
                </p>
                <p style="color: var(--text-secondary); margin-bottom: 10px;">
                    ${currentLanguage === 'ar' ? 'الكفاءة:' : 'Efficiency:'} ${efficiency}%
                </p>
                <p style="color: var(--text-secondary); margin-bottom: 10px; font-weight: bold;">${rating}</p>
                <p style="color: var(--text-secondary);">${message}</p>
            </div>
            
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <button class="btn" id="playAgainBtn" style="flex: 1; min-width: 150px;">
                    <i class="fas fa-redo"></i>
                    ${currentLanguage === 'ar' ? 'لعبة أخرى' : 'Play Again'}
                </button>
                <button class="btn" id="exitGameBtn" style="flex: 1; min-width: 150px;">
                    <i class="fas fa-home"></i>
                    ${currentLanguage === 'ar' ? 'الرئيسية' : 'Home'}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('playAgainBtn').addEventListener('click', () => startGame('memory'));
    document.getElementById('exitGameBtn').addEventListener('click', exitGame);
}

function exitGame() {
    const gameContainer = document.getElementById('gameContainer');
    const gamesGrid = document.querySelector('.games-grid');
    
    if (gameContainer && gamesGrid) {
        gameContainer.classList.add('hidden');
        gamesGrid.classList.remove('hidden');
        gameState = null;
    }
}

function hideGameContainer() {
    const gameContainer = document.getElementById('gameContainer');
    const gamesGrid = document.querySelector('.games-grid');
    
    if (gameContainer && gamesGrid) {
        gameContainer.classList.add('hidden');
        gamesGrid.classList.remove('hidden');
    }
}

function updateGameLanguage() {
    if (!gameState) return;
    
    switch(gameState.type) {
        case 'quiz':
            if (gameState.currentQuestion < gameState.totalQuestions) {
                showQuizQuestion();
            }
            updateQuizProgress();
            break;
        case 'memory':
            updateMemoryStats();
            break;
    }
}

// ====== GLOBAL EXPORTS ======
window.VoidEmperor = {
    toggleLanguage,
    toggleTheme,
    switchTab,
    startGame,
    exitGame,
    sendMessage,
    clearChatHistory,
    submitRating,
    updateRatingDisplay,
    getCurrentLanguage: () => currentLanguage,
    getCurrentTheme: () => currentTheme,
    getGameState: () => gameState,
    showToast: Toast.show
};