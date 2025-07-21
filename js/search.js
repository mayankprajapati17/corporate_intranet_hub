/**
 * Corporate Hub - Search Module
 * Handles global search functionality across all content
 */

CorporateHub.modules.search = {
    searchIndex: null,
    searchResults: [],
    currentQuery: '',
    
    init() {
        this.buildSearchIndex();
        this.setupSearchHandlers();
        this.setupKeyboardShortcuts();
    },
    
    buildSearchIndex() {
        // Build search index from page content
        this.searchIndex = {
            news: this.indexNews(),
            events: this.indexEvents(),
            people: this.indexPeople(),
            pages: this.indexPages(),
            documents: this.indexDocuments()
        };
        
        console.log('Search index built:', this.searchIndex);
    },
    
    indexNews() {
        const newsItems = [];
        
        // Sample news data - in real app, this would come from API
        const sampleNews = [
            {
                id: 1,
                title: 'Q1 All-Hands Meeting Scheduled',
                content: 'Join us for our quarterly review and upcoming initiatives presentation',
                category: 'Announcement',
                date: new Date('2025-01-14'),
                url: '/pages/company_news_management.html'
            },
            {
                id: 2,
                title: 'New Employee Benefits Package',
                content: 'Enhanced healthcare coverage and flexible work arrangements announced',
                category: 'HR Update',
                date: new Date('2025-01-13'),
                url: '/pages/company_news_management.html'
            },
            {
                id: 3,
                title: 'Office Renovation Update',
                content: 'The 3rd floor renovation is on schedule. New collaborative spaces will be ready by month-end',
                category: 'Facilities',
                date: new Date('2025-01-12'),
                url: '/pages/company_news_management.html'
            }
        ];
        
        return sampleNews.map(item => ({
            ...item,
            type: 'news',
            searchText: (item.title + ' ' + item.content + ' ' + item.category).toLowerCase()
        }));
    },
    
    indexEvents() {
        const events = [];
        
        // Sample events data
        const sampleEvents = [
            {
                id: 1,
                title: 'Team Standup',
                description: 'Daily sync with development team',
                date: new Date('2025-01-15T11:00:00'),
                location: 'Conference Room A',
                url: '/pages/events_calendar_management.html'
            },
            {
                id: 2,
                title: 'Product Demo',
                description: 'Q1 feature showcase for stakeholders',
                date: new Date('2025-01-16T14:00:00'),
                location: 'Main Auditorium',
                url: '/pages/events_calendar_management.html'
            },
            {
                id: 3,
                title: 'All-Hands Meeting',
                description: 'Quarterly review and planning session',
                date: new Date('2025-01-20T14:00:00'),
                location: 'Main Conference Room',
                url: '/pages/events_calendar_management.html'
            }
        ];
        
        return sampleEvents.map(item => ({
            ...item,
            type: 'event',
            searchText: (item.title + ' ' + item.description + ' ' + item.location).toLowerCase()
        }));
    },
    
    indexPeople() {
        const people = [];
        
        // Sample people data
        const samplePeople = [
            {
                id: 1,
                name: 'John Smith',
                title: 'Senior Developer',
                department: 'Engineering',
                email: 'john.smith@company.com',
                phone: '+1 (555) 123-4567',
                url: '/pages/employee_directory.html'
            },
            {
                id: 2,
                name: 'Sarah Chen',
                title: 'UX Designer',
                department: 'Design',
                email: 'sarah.chen@company.com',
                phone: '+1 (555) 234-5678',
                url: '/pages/employee_directory.html'
            },
            {
                id: 3,
                name: 'Michael Johnson',
                title: 'Project Manager',
                department: 'Engineering',
                email: 'michael.johnson@company.com',
                phone: '+1 (555) 345-6789',
                url: '/pages/employee_directory.html'
            }
        ];
        
        return samplePeople.map(item => ({
            ...item,
            type: 'person',
            searchText: (item.name + ' ' + item.title + ' ' + item.department + ' ' + item.email).toLowerCase()
        }));
    },
    
    indexPages() {
        const pages = [];
        
        // Index current page content
        const pageTitle = document.title;
        const pageContent = document.body.textContent;
        const currentUrl = window.location.pathname;
        
        pages.push({
            id: 'current',
            title: pageTitle,
            content: pageContent,
            url: currentUrl,
            type: 'page',
            searchText: (pageTitle + ' ' + pageContent).toLowerCase()
        });
        
        return pages;
    },
    
    indexDocuments() {
        const documents = [];
        
        // Sample documents data
        const sampleDocs = [
            {
                id: 1,
                title: 'Employee Handbook',
                description: 'Company policies and procedures',
                type: 'PDF',
                url: '/documents/employee_handbook.pdf'
            },
            {
                id: 2,
                title: 'IT Security Guidelines',
                description: 'Security best practices and requirements',
                type: 'PDF',
                url: '/documents/security_guidelines.pdf'
            },
            {
                id: 3,
                title: 'Project Templates',
                description: 'Standard project documentation templates',
                type: 'ZIP',
                url: '/documents/project_templates.zip'
            }
        ];
        
        return sampleDocs.map(item => ({
            ...item,
            type: 'document',
            searchText: (item.title + ' ' + item.description).toLowerCase()
        }));
    },
    
    setupSearchHandlers() {
        // Setup search input handlers
        const searchInputs = document.querySelectorAll('[data-search-input], [data-global-search], #globalSearch');
        
        searchInputs.forEach(input => {
            const debouncedSearch = CorporateHub.utils.debounce(
                (query) => this.performSearch(query),
                CorporateHub.config.search.debounceDelay
            );
            
            input.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= CorporateHub.config.search.minQueryLength) {
                    debouncedSearch(query);
                    this.showSearchSuggestions(query, input);
                } else {
                    this.clearResults();
                    this.hideSearchSuggestions();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value.trim());
                }
                
                if (e.key === 'Escape') {
                    this.clearResults();
                    this.hideSearchSuggestions();
                    e.target.blur();
                }
                
                // Handle arrow keys for suggestion navigation
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    this.handleSuggestionNavigation(e);
                }
            });
            
            input.addEventListener('focus', () => {
                if (input.value.trim().length >= CorporateHub.config.search.minQueryLength) {
                    this.showSearchSuggestions(input.value.trim(), input);
                }
            });
        });
    },
    
    showSearchSuggestions(query, input) {
        const existingSuggestions = document.querySelector('[data-search-suggestions]');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        
        const suggestions = this.getSuggestions(query);
        if (suggestions.length === 0) return;
        
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50';
        suggestionsContainer.setAttribute('data-search-suggestions', '');
        
        const suggestionsList = suggestions.map((suggestion, index) => `
            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === 0 ? 'bg-gray-50' : ''}" 
                 data-suggestion-index="${index}"
                 data-suggestion-query="${suggestion.query}">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        ${this.getSuggestionIcon(suggestion.type)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900">${this.highlightSearchTerm(suggestion.title, query)}</div>
                        <div class="text-sm text-gray-500 truncate">${suggestion.description}</div>
                    </div>
                    <div class="flex-shrink-0 text-xs text-gray-400">
                        ${suggestion.type}
                    </div>
                </div>
            </div>
        `).join('');
        
        suggestionsContainer.innerHTML = suggestionsList;
        
        // Position suggestions
        const inputRect = input.getBoundingClientRect();
        const container = input.offsetParent || document.body;
        
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.top = (input.offsetTop + input.offsetHeight + 4) + 'px';
        suggestionsContainer.style.left = input.offsetLeft + 'px';
        suggestionsContainer.style.width = input.offsetWidth + 'px';
        
        container.appendChild(suggestionsContainer);
        
        // Add click handlers
        suggestionsContainer.querySelectorAll('[data-suggestion-index]').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.getAttribute('data-suggestion-query');
                input.value = query;
                this.performSearch(query);
                this.hideSearchSuggestions();
            });
        });
        
        // Store reference for navigation
        this.currentSuggestions = suggestionsContainer;
        this.selectedSuggestionIndex = 0;
    },
    
    getSuggestions(query) {
        const searchTerm = query.toLowerCase();
        const suggestions = [];
        
        // Get top matching items from each category
        Object.values(this.searchIndex).forEach(category => {
            category.forEach(item => {
                if (item.searchText && item.searchText.includes(searchTerm)) {
                    suggestions.push({
                        title: item.title || item.name,
                        description: item.description || item.content || item.email || '',
                        type: item.type,
                        query: item.title || item.name,
                        url: item.url,
                        relevance: this.calculateRelevance(item, searchTerm)
                    });
                }
            });
        });
        
        // Sort by relevance and return top 5
        return suggestions
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5);
    },
    
    getSuggestionIcon(type) {
        const icons = {
            news: '📰',
            event: '📅',
            person: '👤',
            page: '📄',
            document: '📎'
        };
        
        return `<span class="text-lg">${icons[type] || '📄'}</span>`;
    },
    
    handleSuggestionNavigation(e) {
        e.preventDefault();
        
        if (!this.currentSuggestions) return;
        
        const suggestions = this.currentSuggestions.querySelectorAll('[data-suggestion-index]');
        if (suggestions.length === 0) return;
        
        // Remove current selection
        suggestions[this.selectedSuggestionIndex].classList.remove('bg-gray-50');
        
        // Update index
        if (e.key === 'ArrowDown') {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % suggestions.length;
        } else if (e.key === 'ArrowUp') {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        }
        
        // Apply new selection
        suggestions[this.selectedSuggestionIndex].classList.add('bg-gray-50');
        
        // Handle Enter key
        if (e.key === 'Enter') {
            const selectedQuery = suggestions[this.selectedSuggestionIndex].getAttribute('data-suggestion-query');
            e.target.value = selectedQuery;
            this.performSearch(selectedQuery);
            this.hideSearchSuggestions();
        }
    },
    
    hideSearchSuggestions() {
        const suggestions = document.querySelector('[data-search-suggestions]');
        if (suggestions) {
            suggestions.remove();
        }
        
        this.currentSuggestions = null;
        this.selectedSuggestionIndex = 0;
    },
    
    setupKeyboardShortcuts() {
        CorporateHub.events.on('shortcut:search', () => {
            this.focusSearchInput();
        });
    },
    
    focusSearchInput() {
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    },
    
    performSearch(query) {
        if (!query || query.length < CorporateHub.config.search.minQueryLength) {
            this.clearResults();
            return;
        }
        
        // Hide suggestions when performing full search
        this.hideSearchSuggestions();
        
        this.currentQuery = query;
        const results = this.searchInIndex(query);
        
        this.searchResults = results;
        this.displayResults(results);
        
        // Store search in history
        this.addToSearchHistory(query);
        
        // Track search
        CorporateHub.events.emit('search:performed', {
            query: query,
            results: results.length,
            timestamp: new Date()
        });
    },
    
    addToSearchHistory(query) {
        const history = CorporateHub.storage.get('search_history', []);
        
        // Remove existing entry
        const existingIndex = history.indexOf(query);
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }
        
        // Add to beginning
        history.unshift(query);
        
        // Keep only last 10 searches
        if (history.length > 10) {
            history.pop();
        }
        
        CorporateHub.storage.set('search_history', history);
    },
    
    getSearchHistory() {
        return CorporateHub.storage.get('search_history', []);
    },
    
    showSearchHistory(input) {
        const history = this.getSearchHistory();
        if (history.length === 0) return;
        
        const historyContainer = document.createElement('div');
        historyContainer.className = 'absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50';
        historyContainer.setAttribute('data-search-history', '');
        
        const historyHeader = `
            <div class="p-3 border-b border-gray-200 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Recent Searches</span>
                <button class="text-xs text-gray-500 hover:text-gray-700" data-clear-history>Clear</button>
            </div>
        `;
        
        const historyList = history.map(query => `
            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 data-history-query="${query}">
                <div class="flex items-center space-x-3">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-sm text-gray-700">${query}</span>
                </div>
            </div>
        `).join('');
        
        historyContainer.innerHTML = historyHeader + historyList;
        
        // Position history
        const inputRect = input.getBoundingClientRect();
        const container = input.offsetParent || document.body;
        
        historyContainer.style.position = 'absolute';
        historyContainer.style.top = (input.offsetTop + input.offsetHeight + 4) + 'px';
        historyContainer.style.left = input.offsetLeft + 'px';
        historyContainer.style.width = input.offsetWidth + 'px';
        
        container.appendChild(historyContainer);
        
        // Add event listeners
        historyContainer.querySelector('[data-clear-history]').addEventListener('click', () => {
            CorporateHub.storage.remove('search_history');
            historyContainer.remove();
        });
        
        historyContainer.querySelectorAll('[data-history-query]').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.getAttribute('data-history-query');
                input.value = query;
                this.performSearch(query);
                historyContainer.remove();
            });
        });
    },
    
    searchInIndex(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        // Search across all indexed content
        Object.values(this.searchIndex).forEach(category => {
            category.forEach(item => {
                if (item.searchText && item.searchText.includes(searchTerm)) {
                    const relevanceScore = this.calculateRelevance(item, searchTerm);
                    results.push({
                        ...item,
                        relevance: relevanceScore,
                        query: query
                    });
                }
            });
        });
        
        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        
        return results.slice(0, 10); // Limit to top 10 results
    },
    
    calculateRelevance(item, searchTerm) {
        let score = 0;
        
        // Title matches get higher score
        if (item.title && item.title.toLowerCase().includes(searchTerm)) {
            score += 10;
        }
        
        // Exact matches get higher score
        if (item.searchText === searchTerm) {
            score += 20;
        }
        
        // Word boundary matches get higher score
        const wordBoundaryRegex = new RegExp(`\\b${searchTerm}\\b`, 'i');
        if (wordBoundaryRegex.test(item.searchText)) {
            score += 5;
        }
        
        // Multiple occurrences increase score
        const occurrences = (item.searchText.match(new RegExp(searchTerm, 'gi')) || []).length;
        score += occurrences * 2;
        
        return score;
    },
    
    displayResults(results) {
        const resultsContainer = document.querySelector('[data-search-results]');
        if (!resultsContainer) {
            this.showSearchModal(results);
            return;
        }
        
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <p>No results found for "${this.currentQuery}"</p>
                </div>
            `;
            return;
        }
        
        const resultsHtml = results.map(result => this.createResultHtml(result)).join('');
        resultsContainer.innerHTML = resultsHtml;
        
        // Add click handlers
        resultsContainer.querySelectorAll('[data-result-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleResultClick(results.find(r => r.id === link.dataset.resultId));
            });
        });
    },
    
    createResultHtml(result) {
        const iconMap = {
            news: '📰',
            event: '📅',
            person: '👤',
            page: '📄',
            document: '📎'
        };
        
        const icon = iconMap[result.type] || '📄';
        const date = result.date ? CorporateHub.utils.formatDate(result.date) : '';
        
        return `
            <div class="border-b border-gray-200 last:border-b-0">
                <a href="${result.url}" 
                   class="block p-4 hover:bg-gray-50 transition-colors"
                   data-result-link
                   data-result-id="${result.id}">
                    <div class="flex items-start space-x-3">
                        <span class="text-lg">${icon}</span>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-medium text-gray-900 truncate">
                                ${this.highlightSearchTerm(result.title || result.name, this.currentQuery)}
                            </h3>
                            <p class="text-sm text-gray-500 mt-1">
                                ${this.highlightSearchTerm(
                                    result.description || result.content || result.title || '', 
                                    this.currentQuery
                                )}
                            </p>
                            <div class="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                                <span class="capitalize">${result.type}</span>
                                ${date ? `<span>•</span><span>${date}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    },
    
    highlightSearchTerm(text, term) {
        if (!text || !term) return text;
        
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    },
    
    showSearchModal(results) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('search-modal');
        if (!modal) {
            modal = this.createSearchModal();
            document.body.appendChild(modal);
        }
        
        // Update modal content
        const modalResults = modal.querySelector('[data-search-results]');
        if (results.length === 0) {
            modalResults.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <p class="text-lg">No results found for "${this.currentQuery}"</p>
                    <p class="text-sm mt-2">Try adjusting your search terms</p>
                </div>
            `;
        } else {
            modalResults.innerHTML = results.map(result => this.createResultHtml(result)).join('');
        }
        
        // Show modal
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.remove('opacity-0', 'scale-95');
        }, 10);
    },
    
    createSearchModal() {
        const modal = document.createElement('div');
        modal.id = 'search-modal';
        modal.className = 'fixed inset-0 z-50 overflow-y-auto hidden';
        modal.innerHTML = `
            <div class="flex min-h-screen items-center justify-center p-4">
                <div class="fixed inset-0 bg-black bg-opacity-50" data-modal-backdrop></div>
                <div class="modal-content relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 opacity-0 scale-95 transition-all duration-200">
                    <div class="p-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Search Results</h3>
                            <button class="text-gray-400 hover:text-gray-600" data-modal-close>
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="overflow-y-auto max-h-80" data-search-results></div>
                </div>
            </div>
        `;
        
        // Add event handlers
        modal.querySelector('[data-modal-close]').addEventListener('click', () => {
            this.hideSearchModal();
        });
        
        modal.querySelector('[data-modal-backdrop]').addEventListener('click', () => {
            this.hideSearchModal();
        });
        
        return modal;
    },
    
    hideSearchModal() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.querySelector('.modal-content').classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        }
    },
    
    handleResultClick(result) {
        // Track click
        CorporateHub.events.emit('search:result_click', {
            result: result,
            query: this.currentQuery,
            timestamp: new Date()
        });
        
        // Navigate to result
        if (result.url) {
            window.location.href = result.url;
        }
        
        // Hide modal
        this.hideSearchModal();
    },
    
    clearResults() {
        this.searchResults = [];
        this.currentQuery = '';
        
        const resultsContainer = document.querySelector('[data-search-results]');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        this.hideSearchModal();
    }
};