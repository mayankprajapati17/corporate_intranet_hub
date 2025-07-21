/**
 * Corporate Hub - Notifications Module
 * Handles notification management, real-time updates, and user interactions
 */

CorporateHub.modules.notifications = {
    notifications: [],
    selectedNotifications: new Set(),
    filters: {
        status: 'all',
        type: 'all',
        priority: 'all'
    },
    
    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        this.setupKeyboardShortcuts();
    },
    
    loadNotifications() {
        // Sample notifications data
        this.notifications = [
            {
                id: '1',
                type: 'system',
                priority: 'high',
                title: 'Server Maintenance Scheduled',
                content: 'Critical system maintenance will be performed tonight from 11 PM to 3 AM EST. All services will be temporarily unavailable during this window.',
                timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                read: false,
                author: 'System',
                avatar: null,
                category: 'System Alert'
            },
            {
                id: '2',
                type: 'news',
                priority: 'medium',
                title: 'Q1 Financial Results Announced',
                content: 'We\'re excited to share our strongest Q1 performance in company history. Revenue increased by 35% compared to last year, driven by our innovative product launches and exceptional team performance.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: false,
                author: 'Sarah Chen',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
                category: 'Company News'
            },
            {
                id: '3',
                type: 'events',
                priority: 'medium',
                title: 'All-Hands Meeting Tomorrow',
                content: 'Don\'t forget about the quarterly all-hands meeting tomorrow at 2:00 PM in the main conference room. We\'ll be discussing Q2 goals and celebrating recent achievements.',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                read: true,
                author: 'Event System',
                avatar: null,
                category: 'Event Reminder'
            },
            {
                id: '4',
                type: 'team',
                priority: 'low',
                title: 'Project Milestone Achieved',
                content: 'Great news! The development team has successfully completed the user authentication module ahead of schedule. This puts us on track for early delivery of the project.',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                read: false,
                author: 'Michael Johnson',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
                category: 'Team Update'
            },
            {
                id: '5',
                type: 'personal',
                priority: 'low',
                title: 'Coffee Chat Invitation',
                content: 'Hi John! I\'d love to catch up over coffee and discuss the new project ideas we talked about last week. Are you free this Friday afternoon?',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                read: false,
                author: 'David Wilson',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                category: 'Personal Message'
            }
        ];
        
        this.updateUI();
    },
    
    setupEventListeners() {
        // Filter controls
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        [statusFilter, typeFilter, priorityFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
        
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveCategory(btn);
                this.filterByCategory(btn.dataset.category);
            });
        });
        
        // Bulk actions
        const markAllReadBtn = document.getElementById('markAllRead');
        const selectAllBtn = document.getElementById('selectAll');
        const bulkMarkReadBtn = document.getElementById('bulkMarkRead');
        const bulkArchiveBtn = document.getElementById('bulkArchive');
        
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }
        
        if (bulkMarkReadBtn) {
            bulkMarkReadBtn.addEventListener('click', () => this.bulkMarkAsRead());
        }
        
        if (bulkArchiveBtn) {
            bulkArchiveBtn.addEventListener('click', () => this.bulkArchive());
        }
        
        // Search functionality
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            const debouncedSearch = CorporateHub.utils.debounce(
                (query) => this.searchNotifications(query),
                300
            );
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreNotifications());
        }
        
        // Notification actions
        this.setupNotificationActions();
        
        // Real-time notification handling
        this.setupRealTimeNotifications();
    },
    
    setupNotificationActions() {
        // Handle notification bell in header
        const notificationBell = document.querySelector('[data-notification-bell]');
        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotificationPreview();
            });
        }
        
        // Handle notification sounds
        this.setupNotificationSounds();
        
        // Handle notification permissions
        this.setupNotificationPermissions();
    },
    
    setupNotificationSounds() {
        // Request audio context for notification sounds
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            this.audioContext = new (AudioContext || webkitAudioContext)();
            this.setupNotificationSoundEffects();
        }
    },
    
    setupNotificationSoundEffects() {
        // Create notification sound
        this.createNotificationSound = (type = 'default') => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const frequencies = {
                'default': [800, 600],
                'success': [800, 1000],
                'error': [400, 300],
                'warning': [600, 500]
            };
            
            const freq = frequencies[type] || frequencies['default'];
            oscillator.frequency.setValueAtTime(freq[0], this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(freq[1], this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    },
    
    setupNotificationPermissions() {
        // Request notification permissions
        if ('Notification' in window && Notification.permission === 'default') {
            const requestBtn = document.querySelector('[data-request-notifications]');
            if (requestBtn) {
                requestBtn.addEventListener('click', () => {
                    this.requestNotificationPermission();
                });
            }
        }
    },
    
    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    CorporateHub.toast.show('Notification permissions granted', 'success');
                    this.showBrowserNotification('Welcome!', 'You will now receive desktop notifications');
                } else {
                    CorporateHub.toast.show('Notification permissions denied', 'warning');
                }
            });
        }
    },
    
    showBrowserNotification(title, body, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: '/public/favicon.ico',
                badge: '/public/favicon.ico',
                tag: 'corporate-hub',
                requireInteraction: false,
                ...options
            });
            
            notification.addEventListener('click', () => {
                window.focus();
                notification.close();
            });
            
            // Auto close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    },
    
    setupRealTimeNotifications() {
        // Listen for real-time notification updates
        CorporateHub.events.on('realtime:notification', (data) => {
            this.handleRealTimeNotification(data);
        });
        
        // Simulate periodic notifications for demo
        if (window.location.pathname.includes('notification_center')) {
            this.startNotificationSimulation();
        }
    },
    
    startNotificationSimulation() {
        // Simulate new notifications every 30 seconds
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                this.simulateNewNotification();
            }
        }, 30000);
    },
    
    simulateNewNotification() {
        const notificationTypes = ['system', 'news', 'events', 'team', 'personal'];
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        const sampleNotifications = {
            system: {
                title: 'System Maintenance Complete',
                content: 'All systems are now fully operational. Thank you for your patience.',
                priority: 'medium'
            },
            news: {
                title: 'New Company Blog Post',
                content: 'Check out our latest blog post about workplace innovation.',
                priority: 'low'
            },
            events: {
                title: 'Upcoming Team Meeting',
                content: 'Don\'t forget about tomorrow\'s team meeting at 2 PM.',
                priority: 'high'
            },
            team: {
                title: 'Project Update',
                content: 'The development team has completed the latest sprint.',
                priority: 'medium'
            },
            personal: {
                title: 'Birthday Reminder',
                content: 'It\'s Sarah\'s birthday today! Don\'t forget to wish her well.',
                priority: 'low'
            }
        };
        
        const notification = sampleNotifications[randomType];
        this.addNewNotification({
            type: randomType,
            title: notification.title,
            content: notification.content,
            priority: notification.priority,
            author: 'System',
            category: 'Auto-generated'
        });
    },
    
    handleRealTimeNotification(data) {
        // Add to notifications list
        this.addNewNotification(data);
        
        // Play sound if enabled
        const soundEnabled = CorporateHub.storage.get('notification_sound', true);
        if (soundEnabled && this.createNotificationSound) {
            this.createNotificationSound(data.type);
        }
        
        // Show browser notification
        this.showBrowserNotification(data.title, data.content, {
            tag: data.type,
            icon: data.icon || '/public/favicon.ico'
        });
        
        // Update badge in header
        this.updateNotificationBadge();
    },
    
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    },
    
    updateUI() {
        this.updateUnreadCount();
        this.updateCategoryCounts();
        this.renderNotifications();
    },
    
    updateUnreadCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const countElement = document.getElementById('unreadCount');
        if (countElement) {
            countElement.textContent = unreadCount;
        }
    },
    
    updateCategoryCounts() {
        const counts = {
            all: this.notifications.length,
            system: this.notifications.filter(n => n.type === 'system').length,
            news: this.notifications.filter(n => n.type === 'news').length,
            events: this.notifications.filter(n => n.type === 'events').length,
            team: this.notifications.filter(n => n.type === 'team').length,
            personal: this.notifications.filter(n => n.type === 'personal').length
        };
        
        Object.entries(counts).forEach(([category, count]) => {
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                const badge = categoryBtn.querySelector('.category-count');
                if (badge) {
                    badge.textContent = count;
                }
            }
        });
    },
    
    renderNotifications() {
        const notificationFeed = document.getElementById('notificationFeed');
        if (!notificationFeed) return;
        
        const visibleNotifications = this.getVisibleNotifications();
        
        const notificationsHtml = visibleNotifications.map(notification => 
            this.createNotificationHtml(notification)
        ).join('');
        
        notificationFeed.innerHTML = notificationsHtml;
        
        // Setup notification event listeners
        this.setupNotificationEventListeners();
    },
    
    getVisibleNotifications() {
        return this.notifications.filter(notification => {
            // Apply filters
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'read' && !notification.read) return false;
                if (this.filters.status === 'unread' && notification.read) return false;
            }
            
            if (this.filters.type !== 'all' && notification.type !== this.filters.type) {
                return false;
            }
            
            if (this.filters.priority !== 'all' && notification.priority !== this.filters.priority) {
                return false;
            }
            
            return true;
        });
    },
    
    createNotificationHtml(notification) {
        const isRead = notification.read;
        const timeAgo = CorporateHub.utils.formatDate(notification.timestamp);
        
        return `
            <div class="notification-card card-base border-l-4 ${this.getBorderColor(notification.priority)} ${isRead ? 'opacity-75' : ''}" 
                 data-id="${notification.id}" 
                 data-type="${notification.type}" 
                 data-priority="${notification.priority}" 
                 data-read="${isRead}">
                <div class="p-6">
                    <div class="flex items-start space-x-4">
                        <input type="checkbox" class="notification-checkbox mt-1" />
                        <div class="flex-shrink-0">
                            ${this.getNotificationIcon(notification)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center space-x-2">
                                    <span class="px-2 py-1 ${this.getCategoryColor(notification.type)} text-xs rounded-full">${notification.category}</span>
                                    <span class="px-2 py-1 ${this.getPriorityColor(notification.priority)} text-white text-xs rounded-full">${notification.priority.toUpperCase()}</span>
                                    ${!isRead ? '<span class="w-2 h-2 bg-primary rounded-full" title="Unread"></span>' : ''}
                                </div>
                                <span class="text-xs text-text-secondary">${timeAgo}</span>
                            </div>
                            <h4 class="font-medium text-text-primary mb-2">${notification.title}</h4>
                            <p class="text-sm text-text-secondary mb-3">${notification.content}</p>
                            <div class="flex items-center space-x-4">
                                ${!isRead ? 
                                    '<button class="mark-read-btn text-sm text-primary hover:text-primary-700 font-medium">Mark as Read</button>' : 
                                    '<button class="text-sm text-secondary">Already Read</button>'
                                }
                                <button class="archive-btn text-sm text-secondary hover:text-text-primary">Archive</button>
                                <button class="reply-btn text-sm text-secondary hover:text-text-primary">${this.getActionText(notification.type)}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    getNotificationIcon(notification) {
        if (notification.avatar) {
            return `<img class="w-10 h-10 rounded-full object-cover" src="${notification.avatar}" alt="${notification.author}" />`;
        }
        
        const icons = {
            system: `<div class="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                        <svg class="h-5 w-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5C3.312 18.167 4.274 19 5.814 19z"/>
                        </svg>
                    </div>`,
            news: `<div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                        </svg>
                    </div>`,
            events: `<div class="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                        <svg class="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>`,
            team: `<div class="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                        <svg class="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </div>`,
            personal: `<div class="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                        <svg class="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>`
        };
        
        return icons[notification.type] || icons.system;
    },
    
    getBorderColor(priority) {
        const colors = {
            high: 'border-error',
            medium: 'border-primary',
            low: 'border-success'
        };
        return colors[priority] || 'border-secondary';
    },
    
    getCategoryColor(type) {
        const colors = {
            system: 'bg-error-50 text-error',
            news: 'bg-primary-50 text-primary',
            events: 'bg-accent-50 text-accent',
            team: 'bg-success-50 text-success',
            personal: 'bg-secondary-100 text-secondary'
        };
        return colors[type] || 'bg-secondary-100 text-secondary';
    },
    
    getPriorityColor(priority) {
        const colors = {
            high: 'bg-error',
            medium: 'bg-primary',
            low: 'bg-success'
        };
        return colors[priority] || 'bg-secondary';
    },
    
    getActionText(type) {
        const actions = {
            system: 'Details',
            news: 'View Details',
            events: 'Add to Calendar',
            team: 'Congratulate Team',
            personal: 'Reply'
        };
        return actions[type] || 'View';
    },
    
    setupNotificationEventListeners() {
        // Mark as read buttons
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const notificationCard = btn.closest('.notification-card');
                this.markAsRead(notificationCard.dataset.id);
            });
        });
        
        // Archive buttons
        document.querySelectorAll('.archive-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const notificationCard = btn.closest('.notification-card');
                this.archiveNotification(notificationCard.dataset.id);
            });
        });
        
        // Reply/action buttons
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const notificationCard = btn.closest('.notification-card');
                this.handleNotificationAction(notificationCard.dataset.id);
            });
        });
        
        // Checkboxes
        document.querySelectorAll('.notification-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const notificationId = e.target.closest('.notification-card').dataset.id;
                if (e.target.checked) {
                    this.selectedNotifications.add(notificationId);
                } else {
                    this.selectedNotifications.delete(notificationId);
                }
                this.updateBulkActionButtons();
            });
        });
        
        // Swipe gestures for mobile
        this.setupSwipeGestures();
    },
    
    setupSwipeGestures() {
        let startX = 0;
        let currentX = 0;
        let cardBeingDragged = null;
        
        document.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.notification-card');
            if (card) {
                startX = e.touches[0].clientX;
                cardBeingDragged = card;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!cardBeingDragged) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            if (Math.abs(diffX) > 10) {
                e.preventDefault();
                cardBeingDragged.style.transform = `translateX(${diffX}px)`;
                
                // Show action hints
                if (diffX > 50) {
                    cardBeingDragged.style.backgroundColor = '#dcfce7'; // Green for mark as read
                } else if (diffX < -50) {
                    cardBeingDragged.style.backgroundColor = '#fef2f2'; // Red for archive
                } else {
                    cardBeingDragged.style.backgroundColor = '';
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!cardBeingDragged) return;
            
            const diffX = currentX - startX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe right - mark as read
                    this.markAsRead(cardBeingDragged.dataset.id);
                } else {
                    // Swipe left - archive
                    this.archiveNotification(cardBeingDragged.dataset.id);
                }
            }
            
            // Reset card position
            cardBeingDragged.style.transform = '';
            cardBeingDragged.style.backgroundColor = '';
            cardBeingDragged = null;
            startX = 0;
            currentX = 0;
        });
    },
    
    showNotificationPreview() {
        // Create dropdown preview
        const existingPreview = document.querySelector('[data-notification-preview]');
        if (existingPreview) {
            existingPreview.remove();
            return;
        }
        
        const preview = document.createElement('div');
        preview.className = 'absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50';
        preview.setAttribute('data-notification-preview', '');
        
        const recentNotifications = this.notifications.slice(0, 3);
        
        preview.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h3 class="font-medium text-gray-900">Notifications</h3>
                    <div class="flex items-center space-x-2">
                        <button class="text-sm text-blue-600 hover:text-blue-800" data-mark-all-read>Mark all read</button>
                        <a href="/pages/notification_center.html" class="text-sm text-blue-600 hover:text-blue-800">View all</a>
                    </div>
                </div>
            </div>
            <div class="max-h-64 overflow-y-auto">
                ${recentNotifications.map(notification => `
                    <div class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" 
                         data-notification-id="${notification.id}">
                        <div class="flex items-start space-x-3">
                            <div class="w-2 h-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'} rounded-full mt-2"></div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                                <p class="text-xs text-gray-500 mt-1">${notification.content.substring(0, 100)}...</p>
                                <p class="text-xs text-gray-400 mt-1">${CorporateHub.utils.formatDate(notification.timestamp)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${recentNotifications.length === 0 ? `
                <div class="p-8 text-center text-gray-500">
                    <p>No notifications</p>
                </div>
            ` : ''}
        `;
        
        const notificationBtn = document.querySelector('[data-notification-bell]');
        if (notificationBtn) {
            notificationBtn.parentElement.appendChild(preview);
        }
        
        // Setup event listeners
        preview.querySelector('[data-mark-all-read]').addEventListener('click', () => {
            this.markAllAsRead();
            preview.remove();
        });
        
        preview.querySelectorAll('[data-notification-id]').forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.getAttribute('data-notification-id');
                this.markAsRead(notificationId);
                window.location.href = '/pages/notification_center.html';
            });
        });
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!preview.contains(e.target) && !notificationBtn.contains(e.target)) {
                    preview.remove();
                }
            }, { once: true });
        }, 100);
    },
    
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateUI();
            CorporateHub.toast.show('Notification marked as read', 'success');
        }
    },
    
    archiveNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.updateUI();
            CorporateHub.toast.show('Notification archived', 'success');
        }
    },
    
    handleNotificationAction(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            switch (notification.type) {
                case 'events':
                    CorporateHub.toast.show('Event added to calendar', 'success');
                    break;
                case 'personal':
                    CorporateHub.toast.show('Reply feature coming soon', 'info');
                    break;
                case 'team':
                    CorporateHub.toast.show('Congratulations sent to team', 'success');
                    break;
                default:
                    CorporateHub.toast.show('Action completed', 'success');
            }
        }
    },
    
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateUI();
        CorporateHub.toast.show('All notifications marked as read', 'success');
    },
    
    toggleSelectAll() {
        const visibleNotifications = this.getVisibleNotifications();
        const allSelected = visibleNotifications.every(n => this.selectedNotifications.has(n.id));
        
        if (allSelected) {
            visibleNotifications.forEach(n => this.selectedNotifications.delete(n.id));
        } else {
            visibleNotifications.forEach(n => this.selectedNotifications.add(n.id));
        }
        
        // Update checkboxes
        document.querySelectorAll('.notification-checkbox').forEach(checkbox => {
            const notificationId = checkbox.closest('.notification-card').dataset.id;
            checkbox.checked = this.selectedNotifications.has(notificationId);
        });
        
        this.updateBulkActionButtons();
        
        const selectAllBtn = document.getElementById('selectAll');
        if (selectAllBtn) {
            selectAllBtn.textContent = allSelected ? 'Select All' : 'Deselect All';
        }
    },
    
    bulkMarkAsRead() {
        this.selectedNotifications.forEach(id => {
            const notification = this.notifications.find(n => n.id === id);
            if (notification) {
                notification.read = true;
            }
        });
        
        const count = this.selectedNotifications.size;
        this.clearSelection();
        this.updateUI();
        CorporateHub.toast.show(`${count} notifications marked as read`, 'success');
    },
    
    bulkArchive() {
        const count = this.selectedNotifications.size;
        
        this.selectedNotifications.forEach(id => {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                this.notifications.splice(index, 1);
            }
        });
        
        this.clearSelection();
        this.updateUI();
        CorporateHub.toast.show(`${count} notifications archived`, 'success');
    },
    
    clearSelection() {
        this.selectedNotifications.clear();
        document.querySelectorAll('.notification-checkbox').forEach(cb => cb.checked = false);
        this.updateBulkActionButtons();
        
        const selectAllBtn = document.getElementById('selectAll');
        if (selectAllBtn) {
            selectAllBtn.textContent = 'Select All';
        }
    },
    
    updateBulkActionButtons() {
        const hasSelection = this.selectedNotifications.size > 0;
        const bulkMarkReadBtn = document.getElementById('bulkMarkRead');
        const bulkArchiveBtn = document.getElementById('bulkArchive');
        
        if (bulkMarkReadBtn) {
            bulkMarkReadBtn.disabled = !hasSelection;
        }
        
        if (bulkArchiveBtn) {
            bulkArchiveBtn.disabled = !hasSelection;
        }
    },
    
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        this.filters.status = statusFilter ? statusFilter.value : 'all';
        this.filters.type = typeFilter ? typeFilter.value : 'all';
        this.filters.priority = priorityFilter ? priorityFilter.value : 'all';
        
        this.renderNotifications();
    },
    
    setActiveCategory(activeBtn) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('bg-primary-50', 'text-primary', 'border-primary-100');
            btn.classList.add('hover:bg-secondary-100');
        });
        
        activeBtn.classList.add('bg-primary-50', 'text-primary', 'border-primary-100');
        activeBtn.classList.remove('hover:bg-secondary-100');
    },
    
    filterByCategory(category) {
        this.filters.type = category === 'all' ? 'all' : category;
        this.renderNotifications();
    },
    
    searchNotifications(query) {
        if (!query.trim()) {
            this.renderNotifications();
            return;
        }
        
        const searchTerm = query.toLowerCase();
        const filteredNotifications = this.notifications.filter(notification => {
            return notification.title.toLowerCase().includes(searchTerm) ||
                   notification.content.toLowerCase().includes(searchTerm) ||
                   notification.category.toLowerCase().includes(searchTerm);
        });
        
        this.renderFilteredNotifications(filteredNotifications);
    },
    
    renderFilteredNotifications(notifications) {
        const notificationFeed = document.getElementById('notificationFeed');
        if (!notificationFeed) return;
        
        const notificationsHtml = notifications.map(notification => 
            this.createNotificationHtml(notification)
        ).join('');
        
        notificationFeed.innerHTML = notificationsHtml;
        
        if (notifications.length === 0) {
            notificationFeed.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <p class="text-lg">No notifications found</p>
                    <p class="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
            `;
        }
        
        this.setupNotificationEventListeners();
    },
    
    addNewNotification(data) {
        const newNotification = {
            id: CorporateHub.utils.generateId(),
            type: data.type || 'system',
            priority: data.priority || 'medium',
            title: data.title || 'New Notification',
            content: data.content || 'You have a new notification',
            timestamp: new Date(),
            read: false,
            author: data.author || 'System',
            avatar: data.avatar || null,
            category: data.category || 'System Alert'
        };
        
        this.notifications.unshift(newNotification);
        this.updateUI();
        
        // Show toast
        CorporateHub.toast.show('New notification received', 'info');
    },
    
    loadMoreNotifications() {
        // Simulate loading more notifications
        CorporateHub.toast.show('Loading more notifications...', 'info');
        
        setTimeout(() => {
            const additionalNotifications = [
                {
                    id: CorporateHub.utils.generateId(),
                    type: 'news',
                    priority: 'low',
                    title: 'Company Newsletter Published',
                    content: 'The monthly company newsletter is now available with updates from all departments.',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    read: false,
                    author: 'Communications Team',
                    avatar: null,
                    category: 'Company News'
                }
            ];
            
            this.notifications.push(...additionalNotifications);
            this.updateUI();
            CorporateHub.toast.show('More notifications loaded', 'success');
        }, 1000);
    },
    
    navigateNotifications(direction) {
        const cards = document.querySelectorAll('.notification-card');
        const currentIndex = Array.from(cards).findIndex(card => card.classList.contains('focused'));
        
        let newIndex;
        if (direction === 'next') {
            newIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        }
        
        // Remove focus from current card
        cards.forEach(card => card.classList.remove('focused'));
        
        // Add focus to new card
        if (cards[newIndex]) {
            cards[newIndex].classList.add('focused');
            cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },
    
    markSelectedAsRead() {
        const focusedCard = document.querySelector('.notification-card.focused');
        if (focusedCard) {
            this.markAsRead(focusedCard.dataset.id);
        }
    },
    
    archiveSelected() {
        const focusedCard = document.querySelector('.notification-card.focused');
        if (focusedCard) {
            this.archiveNotification(focusedCard.dataset.id);
        }
    }
};