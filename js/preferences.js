/**
 * Corporate Hub - User Preferences Module
 * Handles user settings, preferences, and personalization
 */

CorporateHub.modules.preferences = {
    currentTab: 'profile',
    hasUnsavedChanges: false,
    originalSettings: {},
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupRealTimePreview();
    },
    
    loadSettings() {
        // Load settings from localStorage
        const savedSettings = CorporateHub.storage.get('user_settings', {});
        
        // Default settings
        const defaultSettings = {
            profile: {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@company.com',
                phone: '+1 (555) 123-4567',
                jobTitle: 'Senior Developer',
                department: 'engineering',
                bio: 'Experienced software developer with 8 years in full-stack development.',
                avatar: null
            },
            dashboard: {
                theme: 'light',
                widgets: {
                    news: true,
                    events: true,
                    spotlight: false,
                    weather: true
                },
                quickLinks: []
            },
            notifications: {
                email: {
                    system: true,
                    news: true,
                    events: false,
                    team: true
                },
                push: {
                    browser: true,
                    sound: false
                },
                frequency: 'daily',
                quietHours: {
                    start: '22:00',
                    end: '08:00'
                }
            },
            privacy: {
                profileVisibility: 'everyone',
                showOnlineStatus: true,
                showContactInfo: true,
                usageAnalytics: true,
                activityTracking: false
            },
            accessibility: {
                fontSize: 16,
                contrast: 'normal',
                reduceMotion: false,
                enhancedFocus: true,
                skipLinks: true,
                screenReader: {
                    descriptions: false,
                    announcements: false
                }
            }
        };
        
        // Merge with saved settings
        this.settings = CorporateHub.utils.deepMerge(defaultSettings, savedSettings);
        
        // Apply settings to form
        this.populateForm();
        
        // Store original settings for comparison
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
    },
    
    populateForm() {
        // Profile tab
        this.setInputValue('firstName', this.settings.profile.firstName);
        this.setInputValue('lastName', this.settings.profile.lastName);
        this.setInputValue('email', this.settings.profile.email);
        this.setInputValue('phone', this.settings.profile.phone);
        this.setInputValue('jobTitle', this.settings.profile.jobTitle);
        this.setInputValue('department', this.settings.profile.department);
        this.setInputValue('bio', this.settings.profile.bio);
        
        // Dashboard tab
        this.setRadioValue('theme', this.settings.dashboard.theme);
        this.setCheckboxValue('news-widget', this.settings.dashboard.widgets.news);
        this.setCheckboxValue('events-widget', this.settings.dashboard.widgets.events);
        this.setCheckboxValue('spotlight-widget', this.settings.dashboard.widgets.spotlight);
        this.setCheckboxValue('weather-widget', this.settings.dashboard.widgets.weather);
        
        // Notifications tab
        this.setCheckboxValue('email-system', this.settings.notifications.email.system);
        this.setCheckboxValue('email-news', this.settings.notifications.email.news);
        this.setCheckboxValue('email-events', this.settings.notifications.email.events);
        this.setCheckboxValue('email-team', this.settings.notifications.email.team);
        this.setCheckboxValue('push-browser', this.settings.notifications.push.browser);
        this.setCheckboxValue('push-sound', this.settings.notifications.push.sound);
        this.setInputValue('emailFrequency', this.settings.notifications.frequency);
        this.setInputValue('quietStart', this.settings.notifications.quietHours.start);
        this.setInputValue('quietEnd', this.settings.notifications.quietHours.end);
        
        // Privacy tab
        this.setInputValue('profileVisibility', this.settings.privacy.profileVisibility);
        this.setCheckboxValue('show-online-status', this.settings.privacy.showOnlineStatus);
        this.setCheckboxValue('show-contact-info', this.settings.privacy.showContactInfo);
        this.setCheckboxValue('usage-analytics', this.settings.privacy.usageAnalytics);
        this.setCheckboxValue('activity-tracking', this.settings.privacy.activityTracking);
        
        // Accessibility tab
        this.setInputValue('fontSize', this.settings.accessibility.fontSize);
        this.setInputValue('contrast', this.settings.accessibility.contrast);
        this.setCheckboxValue('reduce-motion', this.settings.accessibility.reduceMotion);
        this.setCheckboxValue('enhanced-focus', this.settings.accessibility.enhancedFocus);
        this.setCheckboxValue('skip-links', this.settings.accessibility.skipLinks);
        this.setCheckboxValue('screen-reader-descriptions', this.settings.accessibility.screenReader.descriptions);
        this.setCheckboxValue('screen-reader-announcements', this.settings.accessibility.screenReader.announcements);
    },
    
    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    },
    
    setRadioValue(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
        }
    },
    
    setCheckboxValue(id, checked) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = checked;
        }
    },
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveTab(btn.dataset.tab);
            });
        });
        
        // Save button
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Reset button
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
        
        // Avatar upload
        const uploadBtn = document.getElementById('uploadAvatarBtn');
        const avatarInput = document.getElementById('avatarUpload');
        
        if (uploadBtn && avatarInput) {
            uploadBtn.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }
        
        // Form change detection
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => this.markAsChanged());
            input.addEventListener('input', () => this.markAsChanged());
        });
        
        // Theme selection
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.applyTheme(radio.value);
                this.markAsChanged();
            });
        });
        
        // Font size slider
        const fontSizeSlider = document.getElementById('fontSize');
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', () => {
                this.applyFontSize(fontSizeSlider.value);
                this.markAsChanged();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
        });
        
        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    },
    
    setActiveTab(tabName) {
        this.currentTab = tabName;
        
        // Update navigation
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.classList.remove('bg-primary-50', 'text-primary', 'border-primary-100');
            btn.classList.add('hover:bg-secondary-100');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('bg-primary-50', 'text-primary', 'border-primary-100');
            activeBtn.classList.remove('hover:bg-secondary-100');
        }
        
        // Show/hide tab content
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.classList.remove('hidden');
        }
    },
    
    markAsChanged() {
        this.hasUnsavedChanges = true;
        this.updateSaveStatus('You have unsaved changes');
        
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.classList.remove('opacity-50');
        }
    },
    
    updateSaveStatus(message) {
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) {
            statusEl.textContent = message;
        }
    },
    
    collectFormData() {
        const formData = {
            profile: {
                firstName: this.getInputValue('firstName'),
                lastName: this.getInputValue('lastName'),
                email: this.getInputValue('email'),
                phone: this.getInputValue('phone'),
                jobTitle: this.getInputValue('jobTitle'),
                department: this.getInputValue('department'),
                bio: this.getInputValue('bio'),
                avatar: this.settings.profile.avatar // Keep existing avatar
            },
            dashboard: {
                theme: this.getRadioValue('theme'),
                widgets: {
                    news: this.getCheckboxValue('news-widget'),
                    events: this.getCheckboxValue('events-widget'),
                    spotlight: this.getCheckboxValue('spotlight-widget'),
                    weather: this.getCheckboxValue('weather-widget')
                },
                quickLinks: this.settings.dashboard.quickLinks // Keep existing quick links
            },
            notifications: {
                email: {
                    system: this.getCheckboxValue('email-system'),
                    news: this.getCheckboxValue('email-news'),
                    events: this.getCheckboxValue('email-events'),
                    team: this.getCheckboxValue('email-team')
                },
                push: {
                    browser: this.getCheckboxValue('push-browser'),
                    sound: this.getCheckboxValue('push-sound')
                },
                frequency: this.getInputValue('emailFrequency'),
                quietHours: {
                    start: this.getInputValue('quietStart'),
                    end: this.getInputValue('quietEnd')
                }
            },
            privacy: {
                profileVisibility: this.getInputValue('profileVisibility'),
                showOnlineStatus: this.getCheckboxValue('show-online-status'),
                showContactInfo: this.getCheckboxValue('show-contact-info'),
                usageAnalytics: this.getCheckboxValue('usage-analytics'),
                activityTracking: this.getCheckboxValue('activity-tracking')
            },
            accessibility: {
                fontSize: parseInt(this.getInputValue('fontSize')),
                contrast: this.getInputValue('contrast'),
                reduceMotion: this.getCheckboxValue('reduce-motion'),
                enhancedFocus: this.getCheckboxValue('enhanced-focus'),
                skipLinks: this.getCheckboxValue('skip-links'),
                screenReader: {
                    descriptions: this.getCheckboxValue('screen-reader-descriptions'),
                    announcements: this.getCheckboxValue('screen-reader-announcements')
                }
            }
        };
        
        return formData;
    },
    
    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },
    
    getRadioValue(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? radio.value : '';
    },
    
    getCheckboxValue(id) {
        const checkbox = document.getElementById(id);
        return checkbox ? checkbox.checked : false;
    },
    
    saveSettings() {
        if (!this.validateForm()) {
            return;
        }
        
        this.updateSaveStatus('Saving...');
        
        // Collect form data
        const newSettings = this.collectFormData();
        
        // Simulate API call
        setTimeout(() => {
            // Save to localStorage
            CorporateHub.storage.set('user_settings', newSettings);
            
            // Update current settings
            this.settings = newSettings;
            this.originalSettings = JSON.parse(JSON.stringify(newSettings));
            
            // Apply settings
            this.applySettings();
            
            // Update state
            this.hasUnsavedChanges = false;
            this.updateSaveStatus('All changes saved');
            
            // Show success message
            CorporateHub.toast.show('Settings saved successfully!', 'success');
            
            // Emit event
            CorporateHub.events.emit('settings:saved', newSettings);
        }, 1000);
    },
    
    resetSettings() {
        const confirmed = confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.');
        
        if (confirmed) {
            // Clear localStorage
            CorporateHub.storage.remove('user_settings');
            
            // Reload default settings
            this.loadSettings();
            
            // Apply settings
            this.applySettings();
            
            // Update state
            this.hasUnsavedChanges = true;
            this.updateSaveStatus('Settings reset - click Save to apply changes');
            
            // Show warning message
            CorporateHub.toast.show('Settings reset to defaults', 'warning');
        }
    },
    
    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.dashboard.theme);
        
        // Apply font size
        this.applyFontSize(this.settings.accessibility.fontSize);
        
        // Apply other accessibility settings
        this.applyAccessibilitySettings();
        
        // Update global state
        CorporateHub.state.preferences = this.settings;
    },
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme preview
        document.querySelectorAll('.theme-option').forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const container = option.querySelector('div');
            
            if (radio && radio.value === theme) {
                container.classList.add('border-primary');
                container.classList.remove('border-transparent');
            } else if (container) {
                container.classList.remove('border-primary');
                container.classList.add('border-transparent');
            }
        });
    },
    
    applyFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', size + 'px');
        
        // Update font size display
        const fontSizeSlider = document.getElementById('fontSize');
        if (fontSizeSlider) {
            fontSizeSlider.value = size;
        }
    },
    
    applyAccessibilitySettings() {
        const { accessibility } = this.settings;
        
        // Reduce motion
        if (accessibility.reduceMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
        }
        
        // High contrast
        if (accessibility.contrast === 'high') {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        
        // Enhanced focus
        if (accessibility.enhancedFocus) {
            document.documentElement.classList.add('enhanced-focus');
        } else {
            document.documentElement.classList.remove('enhanced-focus');
        }
    },
    
    setupFormValidation() {
        // Real-time validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput.value);
            });
        }
        
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.validatePhone(phoneInput.value);
            });
        }
    },
    
    validateForm() {
        const email = this.getInputValue('email');
        const phone = this.getInputValue('phone');
        
        if (!this.validateEmail(email)) {
            CorporateHub.toast.show('Please enter a valid email address', 'error');
            return false;
        }
        
        if (phone && !this.validatePhone(phone)) {
            CorporateHub.toast.show('Please enter a valid phone number', 'error');
            return false;
        }
        
        return true;
    },
    
    validateEmail(email) {
        return CorporateHub.utils.validateEmail(email);
    },
    
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
        return !phone || phoneRegex.test(phone);
    },
    
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            CorporateHub.toast.show('File size must be less than 5MB', 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            CorporateHub.toast.show('Please select a valid image file', 'error');
            return;
        }
        
        // Read file and update avatar
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarImg = document.getElementById('profileAvatar');
            if (avatarImg) {
                avatarImg.src = e.target.result;
                this.settings.profile.avatar = e.target.result;
                this.markAsChanged();
                CorporateHub.toast.show('Avatar updated - don\'t forget to save!', 'info');
            }
        };
        reader.readAsDataURL(file);
    },
    
    setupRealTimePreview() {
        // Font size preview
        const fontSizeSlider = document.getElementById('fontSize');
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', () => {
                this.applyFontSize(fontSizeSlider.value);
            });
        }
        
        // Theme preview
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.applyTheme(radio.value);
            });
        });
        
        // Accessibility preview
        const reduceMotionCheckbox = document.getElementById('reduce-motion');
        if (reduceMotionCheckbox) {
            reduceMotionCheckbox.addEventListener('change', () => {
                this.applyAccessibilitySettings();
            });
        }
    },
    
    // Export settings for backup
    exportSettings() {
        const settings = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'corporate-hub-settings.json';
        a.click();
        
        URL.revokeObjectURL(url);
        CorporateHub.toast.show('Settings exported successfully', 'success');
    },
    
    // Import settings from backup
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                
                // Validate settings structure
                if (this.validateImportedSettings(importedSettings)) {
                    this.settings = importedSettings;
                    this.populateForm();
                    this.applySettings();
                    this.markAsChanged();
                    CorporateHub.toast.show('Settings imported successfully', 'success');
                } else {
                    CorporateHub.toast.show('Invalid settings file format', 'error');
                }
            } catch (error) {
                CorporateHub.toast.show('Error importing settings', 'error');
            }
        };
        reader.readAsText(file);
    },
    
    validateImportedSettings(settings) {
        // Basic validation of settings structure
        return settings &&
               typeof settings === 'object' &&
               settings.profile &&
               settings.dashboard &&
               settings.notifications &&
               settings.privacy &&
               settings.accessibility;
    }
};