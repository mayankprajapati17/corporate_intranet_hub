/**
 * Corporate Intranet Hub - Main Application JavaScript
 * Handles global functionality, initialization, and coordination between modules
 */

// Global App Configuration
window.CorporateHub = {
    config: {
        appName: 'Corporate Intranet Hub',
        version: '1.0.0',
        apiBaseUrl: '/api',
        notifications: {
            position: 'top-right',
            timeout: 5000,
            maxVisible: 5
        },
        realTime: {
            enabled: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10
        },
        localStorage: {
            prefix: 'corporate_hub_',
            enabled: true
        },
        search: {
            minQueryLength: 2,
            debounceDelay: 300
        }
    },
    
    modules: {},
    state: {
        user: null,
        isOnline: navigator.onLine,
        notifications: [],
        preferences: {}
    },
    
    // Event system for inter-module communication
    events: {
        listeners: {},
        
        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },
        
        off(event, callback) {
            if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
            }
        },
        
        emit(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event listener for ${event}:`, error);
                    }
                });
            }
        }
    },
    
    // Utility functions
    utils: {
        // Debounce function for search and other inputs
        debounce(func, delay) {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        },
        
        // Throttle function for scroll events
        throttle(func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Format date for display
        formatDate(date, format = 'relative') {
            const now = new Date();
            const diff = now - date;
            
            if (format === 'relative') {
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                
                if (seconds < 60) return 'just now';
                if (minutes < 60) return `${minutes}m ago`;
                if (hours < 24) return `${hours}h ago`;
                if (days < 7) return `${days}d ago`;
                return date.toLocaleDateString();
            }
            
            return date.toLocaleString();
        },
        
        // Validate email address
        validateEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        
        // Sanitize HTML to prevent XSS
        sanitizeHtml(html) {
            const div = document.createElement('div');
            div.textContent = html;
            return div.innerHTML;
        },
        
        // Generate unique ID
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        // Deep merge objects
        deepMerge(target, source) {
            const result = { ...target };
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
            return result;
        }
    },
    
    // Storage management
    storage: {
        set(key, value) {
            if (!CorporateHub.config.localStorage.enabled) return false;
            
            try {
                const prefixedKey = CorporateHub.config.localStorage.prefix + key;
                localStorage.setItem(prefixedKey, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            if (!CorporateHub.config.localStorage.enabled) return defaultValue;
            
            try {
                const prefixedKey = CorporateHub.config.localStorage.prefix + key;
                const value = localStorage.getItem(prefixedKey);
                return value ? JSON.parse(value) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },
        
        remove(key) {
            if (!CorporateHub.config.localStorage.enabled) return false;
            
            try {
                const prefixedKey = CorporateHub.config.localStorage.prefix + key;
                localStorage.removeItem(prefixedKey);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },
        
        clear() {
            if (!CorporateHub.config.localStorage.enabled) return false;
            
            try {
                const prefix = CorporateHub.config.localStorage.prefix;
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                });
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },
    
    // Toast notification system
    toast: {
        container: null,
        notifications: [],
        
        init() {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.container);
        },
        
        show(message, type = 'info', options = {}) {
            const config = {
                timeout: CorporateHub.config.notifications.timeout,
                closable: true,
                ...options
            };
            
            const toast = this.createToast(message, type, config);
            this.container.appendChild(toast);
            this.notifications.push(toast);
            
            // Animate in
            setTimeout(() => {
                toast.classList.remove('translate-x-full', 'opacity-0');
            }, 100);
            
            // Auto remove
            if (config.timeout > 0) {
                setTimeout(() => {
                    this.remove(toast);
                }, config.timeout);
            }
            
            // Limit visible notifications
            if (this.notifications.length > CorporateHub.config.notifications.maxVisible) {
                this.remove(this.notifications[0]);
            }
            
            return toast;
        },
        
        createToast(message, type, config) {
            const toast = document.createElement('div');
            toast.className = `transform transition-all duration-300 translate-x-full opacity-0 p-4 rounded-lg shadow-lg max-w-sm`;
            
            const colors = {
                success: 'bg-green-500 text-white',
                error: 'bg-red-500 text-white',
                warning: 'bg-yellow-500 text-white',
                info: 'bg-blue-500 text-white'
            };
            
            toast.className += ` ${colors[type] || colors.info}`;
            
            const content = document.createElement('div');
            content.className = 'flex items-center justify-between';
            
            const messageEl = document.createElement('span');
            messageEl.textContent = message;
            content.appendChild(messageEl);
            
            if (config.closable) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'ml-4 text-white hover:text-gray-200 focus:outline-none';
                closeBtn.innerHTML = '×';
                closeBtn.onclick = () => this.remove(toast);
                content.appendChild(closeBtn);
            }
            
            toast.appendChild(content);
            return toast;
        },
        
        remove(toast) {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.notifications = this.notifications.filter(n => n !== toast);
            }, 300);
        },
        
        clear() {
            this.notifications.forEach(toast => this.remove(toast));
        }
    },
    
    // Initialize the application
    init() {
        console.log(`Initializing ${this.config.appName} v${this.config.version}`);
        
        // Initialize toast system
        this.toast.init();
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        // Initialize modules
        this.initializeModules();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        // Setup offline detection
        this.setupOfflineDetection();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup responsive behavior
        this.setupResponsiveBehavior();
        
        // Setup form handling
        this.setupFormHandling();
        
        // Setup interactive elements
        this.setupInteractiveElements();
        
        console.log('Corporate Hub initialized successfully');
    },
    
    loadUserPreferences() {
        const preferences = this.storage.get('user_preferences', {
            theme: 'light',
            notifications: {
                email: true,
                push: true,
                sound: false
            },
            dashboard: {
                widgets: ['news', 'events', 'spotlight', 'weather']
            },
            accessibility: {
                fontSize: 16,
                highContrast: false,
                reduceMotion: false
            }
        });
        
        this.state.preferences = preferences;
        this.events.emit('preferences:loaded', preferences);
    },
    
    setupGlobalEventListeners() {
        // Handle clicks on navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav-link]')) {
                this.handleNavigation(e);
            }
            
            // Handle dropdown toggles
            if (e.target.matches('[data-dropdown-toggle]')) {
                this.handleDropdownToggle(e);
            }
            
            // Handle modal triggers
            if (e.target.matches('[data-modal-trigger]')) {
                this.handleModalTrigger(e);
            }
            
            // Handle tab switches
            if (e.target.matches('[data-tab-trigger]')) {
                this.handleTabSwitch(e);
            }
        });
        
        // Handle form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('[data-form]')) {
                this.handleFormSubmission(e);
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', this.utils.throttle(() => {
            this.events.emit('window:resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, 250));
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.events.emit('visibility:change', !document.hidden);
        });
        
        // Handle clicks outside dropdowns/modals
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });
    },
    
    initializeModules() {
        // Initialize modules in order
        const moduleOrder = [
            'search',
            'dashboard',
            'notifications',
            'preferences',
            'admin'
        ];
        
        moduleOrder.forEach(moduleName => {
            if (this.modules[moduleName] && typeof this.modules[moduleName].init === 'function') {
                try {
                    this.modules[moduleName].init();
                    console.log(`Module ${moduleName} initialized`);
                } catch (error) {
                    console.error(`Error initializing module ${moduleName}:`, error);
                }
            }
        });
    },
    
    setupRealTimeUpdates() {
        if (!this.config.realTime.enabled) return;
        
        // Simulate WebSocket connection for real-time updates
        this.realTimeConnection = {
            connected: false,
            reconnectAttempts: 0,
            
            connect() {
                // Simulate connection
                setTimeout(() => {
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    console.log('Real-time connection established');
                    CorporateHub.events.emit('realtime:connected');
                    
                    // Start heartbeat
                    this.startHeartbeat();
                }, 1000);
            },
            
            disconnect() {
                this.connected = false;
                console.log('Real-time connection lost');
                CorporateHub.events.emit('realtime:disconnected');
                
                // Attempt reconnection
                if (this.reconnectAttempts < CorporateHub.config.realTime.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), CorporateHub.config.realTime.reconnectInterval);
                }
            },
            
            startHeartbeat() {
                setInterval(() => {
                    if (this.connected) {
                        // Simulate periodic updates
                        this.simulateUpdates();
                    }
                }, 30000); // Every 30 seconds
            },
            
            simulateUpdates() {
                // Simulate random updates
                const updateTypes = ['notification', 'news', 'event', 'user_status'];
                const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
                
                CorporateHub.events.emit('realtime:update', {
                    type: randomType,
                    timestamp: new Date(),
                    data: { message: `Simulated ${randomType} update` }
                });
            }
        };
        
        this.realTimeConnection.connect();
    },
    
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.events.emit('connectivity:online');
            this.toast.show('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.events.emit('connectivity:offline');
            this.toast.show('Connection lost - working offline', 'warning');
        });
    },
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.events.emit('shortcut:search');
                        break;
                    case '/':
                        e.preventDefault();
                        this.events.emit('shortcut:help');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.events.emit('shortcut:notifications');
                        break;
                }
            }
            
            // Escape key
            if (e.key === 'Escape') {
                this.events.emit('shortcut:escape');
            }
        });
    },
    
    handleNavigation(e) {
        const link = e.target.closest('[data-nav-link]');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !href.startsWith('//')) {
                e.preventDefault();
                this.navigateTo(href);
            }
        }
    },
    
    navigateTo(url) {
        // Add loading state
        this.events.emit('navigation:start', url);
        
        // Simulate navigation delay
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    },
    
    handleFormSubmission(e) {
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        this.events.emit('form:submit', {
            form: form,
            data: data,
            preventDefault: () => e.preventDefault()
        });
    },
    
    setupResponsiveBehavior() {
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('[data-mobile-menu-toggle]');
        const mobileMenu = document.querySelector('[data-mobile-menu]');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 
                    mobileMenu.classList.contains('hidden') ? 'false' : 'true');
            });
        }
        
        // Responsive table scroll
        document.querySelectorAll('.table-responsive').forEach(table => {
            table.addEventListener('scroll', () => {
                const scrollLeft = table.scrollLeft;
                const scrollWidth = table.scrollWidth;
                const clientWidth = table.clientWidth;
                
                if (scrollLeft > 0) {
                    table.classList.add('scrolled-left');
                } else {
                    table.classList.remove('scrolled-left');
                }
                
                if (scrollLeft + clientWidth < scrollWidth) {
                    table.classList.add('scrolled-right');
                } else {
                    table.classList.remove('scrolled-right');
                }
            });
        });
    },
    
    setupFormHandling() {
        // Auto-save form data
        document.querySelectorAll('[data-auto-save]').forEach(form => {
            const formId = form.getAttribute('data-auto-save');
            const inputs = form.querySelectorAll('input, select, textarea');
            
            // Load saved data
            const savedData = this.storage.get(`form_${formId}`, {});
            inputs.forEach(input => {
                if (savedData[input.name]) {
                    input.value = savedData[input.name];
                }
            });
            
            // Save on change
            const saveFormData = this.utils.debounce(() => {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                this.storage.set(`form_${formId}`, data);
            }, 1000);
            
            inputs.forEach(input => {
                input.addEventListener('change', saveFormData);
                input.addEventListener('input', saveFormData);
            });
        });
        
        // Form validation
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    return false;
                }
            });
        });
    },
    
    setupInteractiveElements() {
        // Tooltips
        this.setupTooltips();
        
        // Accordions
        this.setupAccordions();
        
        // Copy to clipboard
        this.setupCopyToClipboard();
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Infinite scroll
        this.setupInfiniteScroll();
        
        // Image lazy loading
        this.setupLazyLoading();
        
        // Progress bars
        this.setupProgressBars();
        
        // Sortable lists
        this.setupSortableLists();
    },
    
    setupTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 px-2 py-1 text-sm bg-gray-800 text-white rounded shadow-lg opacity-0 pointer-events-none transition-opacity duration-200';
            tooltip.textContent = element.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            element.addEventListener('mouseenter', () => {
                const rect = element.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                tooltip.classList.remove('opacity-0');
                tooltip.classList.add('opacity-100');
            });
            
            element.addEventListener('mouseleave', () => {
                tooltip.classList.remove('opacity-100');
                tooltip.classList.add('opacity-0');
            });
        });
    },
    
    setupAccordions() {
        document.querySelectorAll('[data-accordion]').forEach(accordion => {
            const headers = accordion.querySelectorAll('[data-accordion-header]');
            
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    const content = header.nextElementSibling;
                    const isOpen = !content.classList.contains('hidden');
                    
                    // Close all other panels
                    headers.forEach(h => {
                        h.nextElementSibling.classList.add('hidden');
                        h.setAttribute('aria-expanded', 'false');
                    });
                    
                    // Toggle current panel
                    if (!isOpen) {
                        content.classList.remove('hidden');
                        header.setAttribute('aria-expanded', 'true');
                    }
                });
            });
        });
    },
    
    setupCopyToClipboard() {
        document.querySelectorAll('[data-copy]').forEach(button => {
            button.addEventListener('click', async () => {
                const textToCopy = button.getAttribute('data-copy');
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    this.toast.show('Copied to clipboard', 'success');
                } catch (err) {
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    this.toast.show('Copied to clipboard', 'success');
                }
            });
        });
    },
    
    setupDragAndDrop() {
        document.querySelectorAll('[data-draggable]').forEach(element => {
            element.draggable = true;
            
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', element.getAttribute('data-draggable'));
                element.classList.add('opacity-50');
            });
            
            element.addEventListener('dragend', () => {
                element.classList.remove('opacity-50');
            });
        });
        
        document.querySelectorAll('[data-drop-zone]').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('border-blue-500', 'bg-blue-50');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('border-blue-500', 'bg-blue-50');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('border-blue-500', 'bg-blue-50');
                
                const data = e.dataTransfer.getData('text/plain');
                this.events.emit('drop:complete', {
                    data: data,
                    zone: zone.getAttribute('data-drop-zone')
                });
            });
        });
    },
    
    setupInfiniteScroll() {
        document.querySelectorAll('[data-infinite-scroll]').forEach(container => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const loadMoreCallback = container.getAttribute('data-infinite-scroll');
                        this.events.emit('infinite:scroll', { container, callback: loadMoreCallback });
                    }
                });
            }, { threshold: 0.1 });
            
            const sentinel = document.createElement('div');
            sentinel.className = 'h-4';
            container.appendChild(sentinel);
            observer.observe(sentinel);
        });
    },
    
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            imageObserver.observe(img);
        });
    },
    
    setupProgressBars() {
        document.querySelectorAll('[data-progress]').forEach(progressBar => {
            const targetValue = parseInt(progressBar.getAttribute('data-progress'));
            const progressFill = progressBar.querySelector('.progress-fill');
            
            if (progressFill) {
                // Animate progress bar
                let currentValue = 0;
                const increment = targetValue / 50;
                
                const animate = () => {
                    currentValue += increment;
                    if (currentValue >= targetValue) {
                        currentValue = targetValue;
                        progressFill.style.width = currentValue + '%';
                        return;
                    }
                    
                    progressFill.style.width = currentValue + '%';
                    requestAnimationFrame(animate);
                };
                
                animate();
            }
        });
    },
    
    setupSortableLists() {
        document.querySelectorAll('[data-sortable]').forEach(list => {
            let draggedElement = null;
            
            list.addEventListener('dragstart', (e) => {
                draggedElement = e.target;
                e.target.classList.add('opacity-50');
            });
            
            list.addEventListener('dragend', (e) => {
                e.target.classList.remove('opacity-50');
                draggedElement = null;
            });
            
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(list, e.clientY);
                
                if (afterElement == null) {
                    list.appendChild(draggedElement);
                } else {
                    list.insertBefore(draggedElement, afterElement);
                }
            });
        });
    },
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('[data-draggable]:not(.opacity-50)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
    
    handleDropdownToggle(e) {
        e.preventDefault();
        const dropdown = document.querySelector(e.target.getAttribute('data-dropdown-toggle'));
        
        if (dropdown) {
            const isHidden = dropdown.classList.contains('hidden');
            
            // Close all other dropdowns
            document.querySelectorAll('[data-dropdown]').forEach(d => {
                if (d !== dropdown) {
                    d.classList.add('hidden');
                }
            });
            
            // Toggle current dropdown
            if (isHidden) {
                dropdown.classList.remove('hidden');
                e.target.setAttribute('aria-expanded', 'true');
            } else {
                dropdown.classList.add('hidden');
                e.target.setAttribute('aria-expanded', 'false');
            }
        }
    },
    
    handleModalTrigger(e) {
        e.preventDefault();
        const modalId = e.target.getAttribute('data-modal-trigger');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            this.showModal(modal);
        }
    },
    
    showModal(modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        
        // Focus first focusable element
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    },
    
    hideModal(modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    },
    
    handleTabSwitch(e) {
        e.preventDefault();
        const tabId = e.target.getAttribute('data-tab-trigger');
        const tabGroup = e.target.closest('[data-tab-group]');
        
        if (tabGroup) {
            // Update tab buttons
            tabGroup.querySelectorAll('[data-tab-trigger]').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            e.target.classList.add('active');
            e.target.setAttribute('aria-selected', 'true');
            
            // Update tab content
            const tabContent = tabGroup.querySelector('[data-tab-content]');
            if (tabContent) {
                tabContent.querySelectorAll('[data-tab-panel]').forEach(panel => {
                    panel.classList.add('hidden');
                });
                
                const activePanel = tabContent.querySelector(`[data-tab-panel="${tabId}"]`);
                if (activePanel) {
                    activePanel.classList.remove('hidden');
                }
            }
        }
    },
    
    handleOutsideClick(e) {
        // Close dropdowns
        document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
            const toggle = document.querySelector(`[data-dropdown-toggle="#${dropdown.id}"]`);
            if (toggle && !toggle.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close modals
        if (e.target.classList.contains('modal-backdrop')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                this.hideModal(modal);
            }
        }
    },
    
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
                
                // Remove error styling on input
                field.addEventListener('input', () => {
                    field.classList.remove('border-red-500');
                }, { once: true });
            }
        });
        
        return isValid;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CorporateHub.init());
} else {
    CorporateHub.init();
}