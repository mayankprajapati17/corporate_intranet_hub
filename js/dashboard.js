/**
 * Corporate Hub - Dashboard Module
 * Handles dashboard functionality, widgets, and real-time updates
 */

CorporateHub.modules.dashboard = {
    widgets: new Map(),
    refreshIntervals: new Map(),
    
    init() {
        this.setupWidgets();
        this.setupRealTimeUpdates();
        this.setupInteractivity();
        this.loadUserPreferences();
    },
    
    setupWidgets() {
        // Initialize all dashboard widgets
        this.initializeTimeWidget();
        this.initializeNewsWidget();
        this.initializeEventsWidget();
        this.initializeTeamSpotlightWidget();
        this.initializeWeatherWidget();
        this.initializeQuickLinksWidget();
        this.initializeNotificationWidget();
    },
    
    initializeTimeWidget() {
        const timeElement = document.getElementById('currentTime');
        if (!timeElement) return;
        
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            timeElement.textContent = timeString;
        };
        
        // Update immediately and then every minute
        updateTime();
        const interval = setInterval(updateTime, 60000);
        this.refreshIntervals.set('time', interval);
        
        this.widgets.set('time', {
            element: timeElement,
            update: updateTime,
            interval: interval
        });
    },
    
    initializeNewsWidget() {
        const newsContainer = document.querySelector('[data-widget="news"]');
        if (!newsContainer) return;
        
        const newsWidget = {
            element: newsContainer,
            data: [],
            
            async loadNews() {
                // Simulate API call
                return new Promise(resolve => {
                    setTimeout(() => {
                        const sampleNews = [
                            {
                                id: 1,
                                title: 'Q1 All-Hands Meeting Scheduled',
                                content: 'Join us for our quarterly review and upcoming initiatives presentation...',
                                category: 'Announcement',
                                time: '2 hours ago',
                                priority: 'high',
                                read: false
                            },
                            {
                                id: 2,
                                title: 'New Employee Benefits Package',
                                content: 'We\'re excited to announce enhanced healthcare coverage and flexible work arrangements...',
                                category: 'HR Update',
                                time: '5 hours ago',
                                priority: 'medium',
                                read: false
                            },
                            {
                                id: 3,
                                title: 'Office Renovation Update',
                                content: 'The 3rd floor renovation is on schedule. New collaborative spaces will be ready by month-end...',
                                category: 'Facilities',
                                time: '1 day ago',
                                priority: 'low',
                                read: true
                            }
                        ];
                        resolve(sampleNews);
                    }, 500);
                });
            },
            
            async update() {
                const news = await this.loadNews();
                this.data = news;
                this.render();
            },
            
            render() {
                const newsContainer = this.element.querySelector('[data-news-list]');
                if (!newsContainer) return;
                
                const newsHtml = this.data.map(item => `
                    <div class="news-item border-l-4 ${this.getBorderColor(item.priority)} pl-4 py-2 ${item.read ? 'opacity-75' : ''}">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h4 class="font-medium text-text-primary mb-1">${item.title}</h4>
                                <p class="text-sm text-text-secondary mb-2">${item.content}</p>
                                <div class="flex items-center space-x-4 text-xs text-text-secondary">
                                    <span>${item.time}</span>
                                    <span class="px-2 py-1 ${this.getCategoryColor(item.category)} rounded-full">${item.category}</span>
                                </div>
                            </div>
                            <button class="bookmark-btn p-1 text-secondary-400 hover:text-primary transition-smooth" 
                                    data-news-id="${item.id}">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('');
                
                newsContainer.innerHTML = newsHtml;
                
                // Add event handlers
                newsContainer.querySelectorAll('.bookmark-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.toggleBookmark(btn.dataset.newsId);
                    });
                });
            },
            
            getBorderColor(priority) {
                const colors = {
                    high: 'border-error',
                    medium: 'border-primary',
                    low: 'border-accent'
                };
                return colors[priority] || 'border-secondary';
            },
            
            getCategoryColor(category) {
                const colors = {
                    'Announcement': 'bg-primary-50 text-primary',
                    'HR Update': 'bg-success-50 text-success',
                    'Facilities': 'bg-accent-50 text-accent',
                    'Tech News': 'bg-secondary-50 text-secondary'
                };
                return colors[category] || 'bg-secondary-50 text-secondary';
            },
            
            toggleBookmark(newsId) {
                const item = this.data.find(news => news.id == newsId);
                if (item) {
                    item.bookmarked = !item.bookmarked;
                    CorporateHub.toast.show(
                        `News ${item.bookmarked ? 'bookmarked' : 'unbookmarked'}`,
                        'success'
                    );
                }
            }
        };
        
        this.widgets.set('news', newsWidget);
        newsWidget.update();
    },
    
    initializeEventsWidget() {
        const eventsContainer = document.querySelector('[data-widget="events"]');
        if (!eventsContainer) return;
        
        const eventsWidget = {
            element: eventsContainer,
            data: [],
            
            async loadEvents() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const sampleEvents = [
                            {
                                id: 1,
                                title: 'Team Standup',
                                description: 'Daily sync with development team',
                                time: 'Today, 11:00 AM - 11:30 AM',
                                location: 'Conference Room A',
                                color: 'primary',
                                urgent: true
                            },
                            {
                                id: 2,
                                title: 'Product Demo',
                                description: 'Q1 feature showcase for stakeholders',
                                time: 'Tomorrow, 2:00 PM - 3:00 PM',
                                location: 'Main Auditorium',
                                color: 'accent',
                                urgent: false
                            },
                            {
                                id: 3,
                                title: 'Team Lunch',
                                description: 'Monthly team building lunch',
                                time: 'Friday, 12:00 PM - 1:00 PM',
                                location: 'Cafeteria',
                                color: 'success',
                                urgent: false
                            }
                        ];
                        resolve(sampleEvents);
                    }, 300);
                });
            },
            
            async update() {
                const events = await this.loadEvents();
                this.data = events;
                this.render();
            },
            
            render() {
                const eventsContainer = this.element.querySelector('[data-events-list]');
                if (!eventsContainer) return;
                
                const eventsHtml = this.data.map(event => `
                    <div class="event-item flex items-center space-x-3 p-3 ${this.getEventBackground(event.color)} rounded-lg border ${this.getEventBorder(event.color)}">
                        <div class="w-2 h-2 ${this.getEventDot(event.color)} rounded-full"></div>
                        <div class="flex-1">
                            <h4 class="font-medium text-text-primary">${event.title}</h4>
                            <p class="text-sm text-text-secondary">${event.description}</p>
                            <p class="text-xs ${this.getEventTextColor(event.color)} font-medium">${event.time}</p>
                        </div>
                        <button class="event-action-btn p-1 ${this.getEventTextColor(event.color)} hover:${this.getEventHoverColor(event.color)} rounded transition-smooth" 
                                data-event-id="${event.id}">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </button>
                    </div>
                `).join('');
                
                eventsContainer.innerHTML = eventsHtml;
                
                // Add event handlers
                eventsContainer.querySelectorAll('.event-action-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleEventAction(btn.dataset.eventId);
                    });
                });
            },
            
            getEventBackground(color) {
                const colors = {
                    primary: 'bg-primary-50',
                    accent: 'bg-accent-50',
                    success: 'bg-success-50',
                    warning: 'bg-warning-50'
                };
                return colors[color] || 'bg-secondary-50';
            },
            
            getEventBorder(color) {
                const colors = {
                    primary: 'border-primary-100',
                    accent: 'border-accent-100',
                    success: 'border-success-100',
                    warning: 'border-warning-100'
                };
                return colors[color] || 'border-secondary-100';
            },
            
            getEventDot(color) {
                const colors = {
                    primary: 'bg-primary',
                    accent: 'bg-accent',
                    success: 'bg-success',
                    warning: 'bg-warning'
                };
                return colors[color] || 'bg-secondary';
            },
            
            getEventTextColor(color) {
                const colors = {
                    primary: 'text-primary',
                    accent: 'text-accent',
                    success: 'text-success',
                    warning: 'text-warning'
                };
                return colors[color] || 'text-secondary';
            },
            
            getEventHoverColor(color) {
                const colors = {
                    primary: 'bg-primary-100',
                    accent: 'bg-accent-100',
                    success: 'bg-success-100',
                    warning: 'bg-warning-100'
                };
                return colors[color] || 'bg-secondary-100';
            },
            
            handleEventAction(eventId) {
                const event = this.data.find(e => e.id == eventId);
                if (event) {
                    CorporateHub.toast.show(`Added "${event.title}" to calendar`, 'success');
                }
            }
        };
        
        this.widgets.set('events', eventsWidget);
        eventsWidget.update();
    },
    
    initializeTeamSpotlightWidget() {
        const spotlightContainer = document.querySelector('[data-widget="spotlight"]');
        if (!spotlightContainer) return;
        
        const spotlightWidget = {
            element: spotlightContainer,
            data: null,
            
            async loadSpotlight() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const spotlightData = {
                            name: 'Sarah Chen',
                            title: 'UX Designer',
                            achievement: 'Led the redesign of our mobile app, resulting in 40% increase in user engagement',
                            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
                            badge: 'Employee of the Month'
                        };
                        resolve(spotlightData);
                    }, 200);
                });
            },
            
            async update() {
                const spotlight = await this.loadSpotlight();
                this.data = spotlight;
                this.render();
            },
            
            render() {
                if (!this.data) return;
                
                const spotlightContent = this.element.querySelector('[data-spotlight-content]');
                if (!spotlightContent) return;
                
                spotlightContent.innerHTML = `
                    <div class="text-center">
                        <img class="w-16 h-16 rounded-full mx-auto mb-3 object-cover" 
                             src="${this.data.image}" 
                             alt="${this.data.name}"
                             onerror="this.src='https://images.unsplash.com/photo-1584824486509-112e4181ff6b'" />
                        <h4 class="font-medium text-text-primary">${this.data.name}</h4>
                        <p class="text-sm text-text-secondary mb-2">${this.data.title}</p>
                        <p class="text-xs text-text-secondary">${this.data.achievement}</p>
                        <div class="flex justify-center mt-3">
                            <span class="px-2 py-1 bg-success-50 text-success text-xs rounded-full">${this.data.badge}</span>
                        </div>
                    </div>
                `;
            }
        };
        
        this.widgets.set('spotlight', spotlightWidget);
        spotlightWidget.update();
    },
    
    initializeWeatherWidget() {
        const weatherContainer = document.querySelector('[data-widget="weather"]');
        if (!weatherContainer) return;
        
        const weatherWidget = {
            element: weatherContainer,
            data: null,
            
            async loadWeather() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const weatherData = {
                            temperature: 72,
                            condition: 'Partly Cloudy',
                            location: 'San Francisco, CA',
                            high: 75,
                            low: 65,
                            icon: '⛅'
                        };
                        resolve(weatherData);
                    }, 400);
                });
            },
            
            async update() {
                const weather = await this.loadWeather();
                this.data = weather;
                this.render();
            },
            
            render() {
                if (!this.data) return;
                
                const weatherContent = this.element.querySelector('[data-weather-content]');
                if (!weatherContent) return;
                
                weatherContent.innerHTML = `
                    <div class="text-center">
                        <div class="text-3xl font-data text-text-primary mb-2">${this.data.temperature}°F</div>
                        <p class="text-sm text-text-secondary mb-2">${this.data.condition}</p>
                        <p class="text-xs text-text-secondary">${this.data.location}</p>
                        <div class="flex justify-between mt-4 text-xs text-text-secondary">
                            <span>High: ${this.data.high}°</span>
                            <span>Low: ${this.data.low}°</span>
                        </div>
                    </div>
                `;
            }
        };
        
        this.widgets.set('weather', weatherWidget);
        weatherWidget.update();
        
        // Refresh weather every 30 minutes
        const interval = setInterval(() => weatherWidget.update(), 30 * 60 * 1000);
        this.refreshIntervals.set('weather', interval);
    },
    
    initializeQuickLinksWidget() {
        const quickLinksContainer = document.querySelector('[data-widget="quick-links"]');
        if (!quickLinksContainer) return;
        
        const quickLinksWidget = {
            element: quickLinksContainer,
            
            init() {
                this.setupClickHandlers();
            },
            
            setupClickHandlers() {
                const quickLinks = this.element.querySelectorAll('[data-quick-link]');
                quickLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        // Add loading state
                        const icon = link.querySelector('svg');
                        if (icon) {
                            icon.classList.add('animate-spin');
                            setTimeout(() => {
                                icon.classList.remove('animate-spin');
                            }, 500);
                        }
                        
                        // Track click
                        CorporateHub.events.emit('quick_link:click', {
                            link: link.dataset.quickLink,
                            timestamp: new Date()
                        });
                    });
                });
            }
        };
        
        this.widgets.set('quick-links', quickLinksWidget);
        quickLinksWidget.init();
    },
    
    initializeNotificationWidget() {
        const notificationBell = document.querySelector('[data-notification-bell]');
        if (!notificationBell) return;
        
        const notificationWidget = {
            element: notificationBell,
            count: 0,
            
            init() {
                this.setupClickHandler();
                this.loadNotificationCount();
            },
            
            setupClickHandler() {
                this.element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showNotificationPreview();
                });
            },
            
            async loadNotificationCount() {
                // Simulate loading notification count
                this.count = 3;
                this.updateBadge();
            },
            
            updateBadge() {
                const badge = this.element.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = this.count;
                    badge.style.display = this.count > 0 ? 'flex' : 'none';
                }
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
                
                preview.innerHTML = `
                    <div class="p-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="font-medium text-gray-900">Notifications</h3>
                            <a href="/pages/notification_center.html" class="text-sm text-blue-600 hover:text-blue-800">View all</a>
                        </div>
                    </div>
                    <div class="max-h-64 overflow-y-auto">
                        <div class="p-3 border-b border-gray-100 hover:bg-gray-50">
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900">Q1 All-Hands Meeting</p>
                                    <p class="text-xs text-gray-500 mt-1">Scheduled for next week</p>
                                    <p class="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-3 border-b border-gray-100 hover:bg-gray-50">
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900">New Benefits Package</p>
                                    <p class="text-xs text-gray-500 mt-1">Enhanced coverage available</p>
                                    <p class="text-xs text-gray-400 mt-1">5 hours ago</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-3 hover:bg-gray-50">
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900">Office Renovation</p>
                                    <p class="text-xs text-gray-500 mt-1">3rd floor updates</p>
                                    <p class="text-xs text-gray-400 mt-1">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                this.element.parentElement.appendChild(preview);
                
                // Close on outside click
                setTimeout(() => {
                    document.addEventListener('click', (e) => {
                        if (!preview.contains(e.target) && !this.element.contains(e.target)) {
                            preview.remove();
                        }
                    }, { once: true });
                }, 100);
            }
        };
        
        this.widgets.set('notifications', notificationWidget);
        notificationWidget.init();
    },
    
    setupRealTimeUpdates() {
        CorporateHub.events.on('realtime:update', (data) => {
            this.handleRealTimeUpdate(data);
        });
    },
    
    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'notification':
                this.updateNotificationCount();
                break;
            case 'news':
                this.refreshWidget('news');
                break;
            case 'event':
                this.refreshWidget('events');
                break;
            case 'user_status':
                this.refreshWidget('spotlight');
                break;
        }
    },
    
    updateNotificationCount() {
        const notificationWidget = this.widgets.get('notifications');
        if (notificationWidget) {
            notificationWidget.count += 1;
            notificationWidget.updateBadge();
            
            // Show toast for new notification
            CorporateHub.toast.show('New notification received', 'info');
        }
    },
    
    refreshWidget(widgetName) {
        const widget = this.widgets.get(widgetName);
        if (widget && typeof widget.update === 'function') {
            widget.update();
        }
    },
    
    setupInteractivity() {
        // Mini calendar interactions
        this.setupMiniCalendar();
        
        // Widget refresh buttons
        this.setupRefreshButtons();
        
        // Widget toggle functionality
        this.setupWidgetToggles();
        
        // Profile dropdown
        this.setupProfileDropdown();
        
        // Notification interactions
        this.setupNotificationInteractions();
        
        // Quick actions
        this.setupQuickActions();
        
        // Widget customization
        this.setupWidgetCustomization();
    },
    
    setupProfileDropdown() {
        const profileBtn = document.querySelector('[data-profile-dropdown]');
        if (!profileBtn) return;
        
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfileDropdown();
        });
    },
    
    showProfileDropdown() {
        const existingDropdown = document.querySelector('[data-profile-menu]');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }
        
        const dropdown = document.createElement('div');
        dropdown.className = 'absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50';
        dropdown.setAttribute('data-profile-menu', '');
        
        dropdown.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center space-x-3">
                    <img class="w-12 h-12 rounded-full object-cover" 
                         src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" 
                         alt="Profile" />
                    <div>
                        <h3 class="font-medium text-gray-900">John Smith</h3>
                        <p class="text-sm text-gray-500">Senior Developer</p>
                    </div>
                </div>
            </div>
            
            <div class="py-2">
                <a href="/pages/user_preferences_settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <svg class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    My Profile
                </a>
                <a href="/pages/user_preferences_settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <svg class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Settings
                </a>
                <a href="/pages/notification_center.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <svg class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.07 2.82l3.93 3.93-3.93 3.93-3.93-3.93 3.93-3.93z"/>
                    </svg>
                    Notifications
                </a>
                <div class="border-t border-gray-200 my-2"></div>
                <button class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <svg class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Sign Out
                </button>
            </div>
        `;
        
        const profileBtn = document.querySelector('[data-profile-dropdown]');
        profileBtn.parentElement.appendChild(dropdown);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 100);
    },
    
    setupNotificationInteractions() {
        const notificationBtn = document.querySelector('[data-notification-button]');
        if (!notificationBtn) return;
        
        notificationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showNotificationDropdown();
        });
    },
    
    showNotificationDropdown() {
        const existingDropdown = document.querySelector('[data-notification-dropdown]');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }
        
        const dropdown = document.createElement('div');
        dropdown.className = 'absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto';
        dropdown.setAttribute('data-notification-dropdown', '');
        
        dropdown.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h3 class="font-medium text-gray-900">Notifications</h3>
                    <div class="flex items-center space-x-2">
                        <button class="text-sm text-blue-600 hover:text-blue-800" data-mark-all-read>Mark all read</button>
                        <a href="/pages/notification_center.html" class="text-sm text-blue-600 hover:text-blue-800">View all</a>
                    </div>
                </div>
            </div>
            
            <div class="max-h-80 overflow-y-auto">
                <div class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" data-notification-item>
                    <div class="flex items-start space-x-3">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">Q1 All-Hands Meeting</p>
                            <p class="text-xs text-gray-500 mt-1">Scheduled for next week in the main conference room</p>
                            <p class="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                    </div>
                </div>
                
                <div class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" data-notification-item>
                    <div class="flex items-start space-x-3">
                        <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">New Benefits Package</p>
                            <p class="text-xs text-gray-500 mt-1">Enhanced coverage and flexible work arrangements</p>
                            <p class="text-xs text-gray-400 mt-1">5 hours ago</p>
                        </div>
                    </div>
                </div>
                
                <div class="p-3 hover:bg-gray-50 cursor-pointer" data-notification-item>
                    <div class="flex items-start space-x-3">
                        <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">Office Renovation</p>
                            <p class="text-xs text-gray-500 mt-1">3rd floor updates completing next month</p>
                            <p class="text-xs text-gray-400 mt-1">1 day ago</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const notificationBtn = document.querySelector('[data-notification-button]');
        notificationBtn.parentElement.appendChild(dropdown);
        
        // Setup event listeners
        dropdown.querySelector('[data-mark-all-read]').addEventListener('click', () => {
            this.markAllNotificationsRead();
        });
        
        dropdown.querySelectorAll('[data-notification-item]').forEach(item => {
            item.addEventListener('click', () => {
                this.handleNotificationClick(item);
            });
        });
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 100);
    },
    
    markAllNotificationsRead() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
        
        const dropdown = document.querySelector('[data-notification-dropdown]');
        if (dropdown) {
            dropdown.querySelectorAll('.bg-blue-500, .bg-green-500, .bg-yellow-500').forEach(dot => {
                dot.classList.remove('bg-blue-500', 'bg-green-500', 'bg-yellow-500');
                dot.classList.add('bg-gray-300');
            });
        }
        
        CorporateHub.toast.show('All notifications marked as read', 'success');
    },
    
    handleNotificationClick(item) {
        const notificationTitle = item.querySelector('p').textContent;
        
        // Mark as read
        const dot = item.querySelector('.bg-blue-500, .bg-green-500, .bg-yellow-500');
        if (dot) {
            dot.classList.remove('bg-blue-500', 'bg-green-500', 'bg-yellow-500');
            dot.classList.add('bg-gray-300');
        }
        
        // Navigate to relevant page
        if (notificationTitle.includes('Meeting')) {
            window.location.href = '/pages/events_calendar_management.html';
        } else if (notificationTitle.includes('Benefits')) {
            window.location.href = '/pages/company_news_management.html';
        } else {
            window.location.href = '/pages/notification_center.html';
        }
    },
    
    setupQuickActions() {
        // Quick search
        const searchInput = document.querySelector('[data-global-search]');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performQuickSearch(query);
                    }
                }
            });
        }
        
        // Quick add buttons
        document.querySelectorAll('[data-quick-add]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const type = btn.getAttribute('data-quick-add');
                this.handleQuickAdd(type);
            });
        });
    },
    
    performQuickSearch(query) {
        // Show loading state
        const searchInput = document.querySelector('[data-global-search]');
        if (searchInput) {
            searchInput.classList.add('animate-pulse');
            setTimeout(() => {
                searchInput.classList.remove('animate-pulse');
            }, 1000);
        }
        
        // Simulate search
        setTimeout(() => {
            CorporateHub.toast.show(`Found ${Math.floor(Math.random() * 10) + 1} results for "${query}"`, 'info');
        }, 500);
    },
    
    handleQuickAdd(type) {
        const actions = {
            'event': () => {
                CorporateHub.toast.show('Opening event creation form...', 'info');
                setTimeout(() => {
                    window.location.href = '/pages/events_calendar_management.html';
                }, 1000);
            },
            'news': () => {
                CorporateHub.toast.show('Opening news editor...', 'info');
                setTimeout(() => {
                    window.location.href = '/pages/company_news_management.html';
                }, 1000);
            },
            'spotlight': () => {
                CorporateHub.toast.show('Opening spotlight form...', 'info');
                setTimeout(() => {
                    window.location.href = '/pages/team_spotlight_management.html';
                }, 1000);
            }
        };
        
        if (actions[type]) {
            actions[type]();
        }
    },
    
    setupWidgetCustomization() {
        document.querySelectorAll('[data-widget-customize]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const widgetId = btn.getAttribute('data-widget-customize');
                this.showWidgetCustomization(widgetId);
            });
        });
    },
    
    showWidgetCustomization(widgetId) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="flex min-h-screen items-center justify-center p-4">
                <div class="fixed inset-0 bg-black bg-opacity-50" data-modal-backdrop></div>
                <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Customize Widget</h3>
                        <button class="text-gray-400 hover:text-gray-600" data-modal-close>
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" class="rounded" checked>
                                <span class="text-sm font-medium">Show widget title</span>
                            </label>
                        </div>
                        <div>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" class="rounded" checked>
                                <span class="text-sm font-medium">Auto-refresh content</span>
                            </label>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Refresh interval</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="60">1 minute</option>
                                <option value="300" selected>5 minutes</option>
                                <option value="900">15 minutes</option>
                                <option value="3600">1 hour</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Widget size</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="small">Small</option>
                                <option value="medium" selected>Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" data-modal-close>
                            Cancel
                        </button>
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-save-settings>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners
        const closeModal = () => document.body.removeChild(modal);
        
        modal.querySelector('[data-modal-close]').addEventListener('click', closeModal);
        modal.querySelector('[data-modal-backdrop]').addEventListener('click', closeModal);
        
        modal.querySelector('[data-save-settings]').addEventListener('click', () => {
            CorporateHub.toast.show('Widget settings saved', 'success');
            closeModal();
        });
    },
    
    setupMiniCalendar() {
        const calendarDays = document.querySelectorAll('[data-calendar-day]');
        calendarDays.forEach(day => {
            day.addEventListener('click', (e) => {
                // Remove active class from all days
                calendarDays.forEach(d => d.classList.remove('bg-primary', 'text-white'));
                
                // Add active class to clicked day
                e.target.classList.add('bg-primary', 'text-white', 'rounded-full');
                
                // Emit event for date selection
                CorporateHub.events.emit('calendar:date_selected', {
                    date: e.target.textContent,
                    timestamp: new Date()
                });
            });
        });
    },
    
    setupRefreshButtons() {
        const refreshButtons = document.querySelectorAll('[data-widget-refresh]');
        refreshButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const widgetName = button.dataset.widgetRefresh;
                
                // Add loading state
                const icon = button.querySelector('svg');
                if (icon) {
                    icon.classList.add('animate-spin');
                }
                
                // Refresh widget
                this.refreshWidget(widgetName);
                
                // Remove loading state
                setTimeout(() => {
                    if (icon) {
                        icon.classList.remove('animate-spin');
                    }
                }, 1000);
            });
        });
    },
    
    setupWidgetToggles() {
        const widgetToggles = document.querySelectorAll('[data-widget-toggle]');
        widgetToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const widgetName = toggle.dataset.widgetToggle;
                this.toggleWidget(widgetName);
            });
        });
    },
    
    toggleWidget(widgetName) {
        const widget = this.widgets.get(widgetName);
        if (widget && widget.element) {
            const isHidden = widget.element.style.display === 'none';
            widget.element.style.display = isHidden ? 'block' : 'none';
            
            // Save preference
            const preferences = CorporateHub.storage.get('widget_preferences', {});
            preferences[widgetName] = !isHidden;
            CorporateHub.storage.set('widget_preferences', preferences);
            
            CorporateHub.toast.show(
                `Widget ${isHidden ? 'shown' : 'hidden'}`,
                'success'
            );
        }
    },
    
    loadUserPreferences() {
        const preferences = CorporateHub.storage.get('widget_preferences', {});
        
        Object.entries(preferences).forEach(([widgetName, visible]) => {
            const widget = this.widgets.get(widgetName);
            if (widget && widget.element) {
                widget.element.style.display = visible ? 'block' : 'none';
            }
        });
    },
    
    destroy() {
        // Clear all intervals
        this.refreshIntervals.forEach(interval => clearInterval(interval));
        this.refreshIntervals.clear();
        
        // Clear widgets
        this.widgets.clear();
    }
};