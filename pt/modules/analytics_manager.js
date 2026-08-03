// pt/modules/analytics_manager.js
// Google Analytics 4 Integration Module with GDPR Consent Management
// Follows the Initialization Manager Pattern
// Version: 1.1.0 - Added tracking prevention handling
//
// PORTFOLIO VARIANT
// -----------------
// This is the Portfolio Cost Management counterpart to cet/modules/analytics_manager.js.
// Consent handling, storage fallbacks and the core tracking API are kept identical
// so the two stay comparable; only the event-tracking hooks differ, because the
// Portfolio tool has a different UI (project loading, timeline, comparison) to the
// Cost Estimator (resources, vendors, rate cards).
//
// Deliberately shared with the Cost Estimator:
//   - Measurement ID     -> both tools report into the same GA4 property
//   - Consent storage key -> both live on www.zyantik.com, so localStorage is shared
//                            and a visitor who has already answered the banner on one
//                            tool is not asked again on the other
//
// Registered in portfolio_init.js, loaded from index.html before it.
// ============================================================================

class AnalyticsManager {
    constructor() {
        // =============================================
        // CONFIGURATION - UPDATE THIS VALUE
        // =============================================
        // Same GA4 property as the Cost Estimator - keep these in sync
        this.measurementId = 'G-2KD38HBZB2';
        
        // Module state
        this.initialized = false;
        this.debugMode = false;
        this.storageAvailable = true;  // Track if localStorage is accessible
        this._memoryStorage = {};  // Fallback storage
        
        // Consent settings - shared with the Cost Estimator on the same origin,
        // so consent given on either tool is honoured by both
        this.consentKey = 'zyantik_analytics_consent';
        this.consentTimestampKey = 'zyantik_analytics_consent_timestamp';
        
        // Check storage availability on construction
        this.checkStorageAvailability();
        
        console.log('📊 Analytics Manager loaded');
    }

    // ========================================
    // STORAGE AVAILABILITY CHECK
    // ========================================
    
    /**
     * Check if localStorage is available (may be blocked by tracking prevention)
     */
    checkStorageAvailability() {
        try {
            const testKey = '__analytics_storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this.storageAvailable = true;
            console.log('📊 localStorage is available');
        } catch (e) {
            this.storageAvailable = false;
            console.warn('📊 localStorage blocked (tracking prevention) - using session/memory storage');
        }
    }

    /**
     * Safe localStorage getter with fallbacks
     * @param {string} key - The key to retrieve
     * @returns {string|null} The value or null
     */
    safeGetItem(key) {
        // Try localStorage first
        if (this.storageAvailable) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('📊 localStorage read failed:', e.message);
            }
        }
        
        // Fallback to sessionStorage
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            // Final fallback to memory
            return this._memoryStorage[key] || null;
        }
    }

    /**
     * Safe localStorage setter with fallbacks
     * @param {string} key - The key to set
     * @param {string} value - The value to store
     */
    safeSetItem(key, value) {
        // Try localStorage first
        if (this.storageAvailable) {
            try {
                localStorage.setItem(key, value);
                return;
            } catch (e) {
                console.warn('📊 localStorage write failed:', e.message);
            }
        }
        
        // Fallback to sessionStorage
        try {
            sessionStorage.setItem(key, value);
            return;
        } catch (e) {
            // Final fallback to memory
            this._memoryStorage[key] = value;
        }
    }

    /**
     * Safe localStorage remover with fallbacks
     * @param {string} key - The key to remove
     */
    safeRemoveItem(key) {
        // Try all storage types
        try { localStorage.removeItem(key); } catch (e) {}
        try { sessionStorage.removeItem(key); } catch (e) {}
        delete this._memoryStorage[key];
    }

    // ========================================
    // MAIN INITIALIZATION
    // ========================================
    
    /**
     * Main entry point - called by init_manager.js
     * Checks consent status and initializes accordingly
     */
    initialize() {
        console.log('📊 Analytics Manager initializing...');
        console.log('📊 Storage available:', this.storageAvailable);
        
        // Inject consent banner styles
        this.injectStyles();
        
        // Check consent status
        const consentStatus = this.getConsentStatus();
        console.log('📊 Current consent status:', consentStatus);
        
        if (consentStatus === null) {
            // No consent recorded - show banner
            console.log('📊 No consent recorded - showing banner');
            this.showConsentBanner();
        } else if (consentStatus === 'accepted') {
            // User has consented - initialize GA4
            console.log('📊 Consent previously accepted - initializing GA4');
            this.initializeGA4();
        } else {
            // User declined - don't initialize
            console.log('📊 Consent previously declined - analytics disabled');
        }
    }

    /**
     * Initialize Google Analytics 4
     */
    initializeGA4() {
        if (this.initialized) {
            console.log('📊 GA4 already initialized');
            return;
        }

        try {
            // Load GA4 script dynamically
            this.loadGA4Script();
            
            // Initialize dataLayer
            window.dataLayer = window.dataLayer || [];
            
            // Define gtag function
            window.gtag = function() {
                window.dataLayer.push(arguments);
            };
            
            // Initialize GA4 with privacy settings
            window.gtag('js', new Date());
            window.gtag('config', this.measurementId, {
                'debug_mode': this.debugMode,
                'send_page_view': true,
                'anonymize_ip': true,
                'cookie_flags': 'SameSite=None;Secure'
            });

            // Set up automatic event tracking
            this.setupEventTracking();
            
            this.initialized = true;
            console.log('✓ GA4 initialized with Measurement ID:', this.measurementId);
            
        } catch (error) {
            console.error('❌ GA4 initialization failed:', error);
        }
    }

    /**
     * Dynamically load the GA4 script
     */
    loadGA4Script() {
        // Check if already loaded
        if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${this.measurementId}"]`)) {
            console.log('📊 GA4 script already loaded');
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);
    }

    // ========================================
    // CONSENT MANAGEMENT
    // ========================================
    
    /**
     * Get current consent status
     * @returns {string|null} 'accepted', 'declined', or null
     */
    getConsentStatus() {
        return this.safeGetItem(this.consentKey);
    }

    /**
     * Set consent status
     * @param {string} status - 'accepted' or 'declined'
     */
    setConsentStatus(status) {
        this.safeSetItem(this.consentKey, status);
        this.safeSetItem(this.consentTimestampKey, new Date().toISOString());
    }

    /**
     * Check if user has given consent
     * @returns {boolean}
     */
    hasConsent() {
        return this.getConsentStatus() === 'accepted';
    }

    /**
     * Handle consent acceptance
     */
    acceptConsent() {
        this.setConsentStatus('accepted');
        this.hideConsentBanner();
        this.initializeGA4();
        
        // Track that consent was given (first event)
        setTimeout(() => {
            this.trackEvent('consent', 'granted', 'analytics');
        }, 500);
        
        console.log('📊 Consent accepted - analytics enabled');
    }

    /**
     * Handle consent decline
     */
    declineConsent() {
        this.setConsentStatus('declined');
        this.hideConsentBanner();
        console.log('📊 Consent declined - analytics disabled');
    }

    /**
     * Reset consent (for testing or settings page)
     */
    resetConsent() {
        this.safeRemoveItem(this.consentKey);
        this.safeRemoveItem(this.consentTimestampKey);
        this.initialized = false;
        console.log('📊 Consent reset - will show banner on next page load');
    }

    /**
     * Show consent banner
     */
    showConsentBanner() {
        // Remove existing banner if present
        const existingBanner = document.getElementById('analyticsConsentBanner');
        if (existingBanner) {
            existingBanner.remove();
        }

        // Create banner element
        const banner = document.createElement('div');
        banner.id = 'analyticsConsentBanner';
        banner.className = 'analytics-consent-banner';
        banner.innerHTML = `
            <div class="consent-container">
                <div class="consent-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                </div>
                <div class="consent-content">
                    <div class="consent-title">Analytics & Cookies</div>
                    <div class="consent-text">
                        We use Google Analytics to understand how you use this tool and improve your experience. 
                        This includes anonymous usage data like pages visited and features used. 
                        No personal information is collected.
                    </div>
                </div>
                <div class="consent-actions">
                    <button id="consentDeclineBtn" class="consent-btn consent-btn-secondary">
                        Decline
                    </button>
                    <button id="consentAcceptBtn" class="consent-btn consent-btn-primary">
                        Accept
                    </button>
                </div>
                <button id="consentCloseBtn" class="consent-close" aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(banner);
        console.log('📊 Consent banner added to DOM');

        // Set up event listeners
        this.setupConsentListeners();

        // Animate in after a brief delay to ensure DOM is ready
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                banner.classList.add('visible');
                console.log('📊 Consent banner now visible');
            });
        });
    }

    /**
     * Hide consent banner
     */
    hideConsentBanner() {
        const banner = document.getElementById('analyticsConsentBanner');
        if (banner) {
            banner.classList.remove('visible');
            banner.classList.add('hiding');
            
            // Remove after animation
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.remove();
                }
            }, 300);
        }
    }

    /**
     * Set up consent banner event listeners
     */
    setupConsentListeners() {
        const acceptBtn = document.getElementById('consentAcceptBtn');
        const declineBtn = document.getElementById('consentDeclineBtn');
        const closeBtn = document.getElementById('consentCloseBtn');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptConsent());
            console.log('📊 Accept button listener attached');
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.declineConsent());
            console.log('📊 Decline button listener attached');
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.declineConsent());
            console.log('📊 Close button listener attached');
        }

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                const banner = document.getElementById('analyticsConsentBanner');
                if (banner && banner.classList.contains('visible')) {
                    this.declineConsent();
                    document.removeEventListener('keydown', escapeHandler);
                }
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Inject consent banner and tracking styles
     */
    injectStyles() {
        if (document.getElementById('analyticsManagerStyles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'analyticsManagerStyles';
        styles.textContent = `
            /* ================================================
               ANALYTICS CONSENT BANNER STYLES
               Driven by the shared design tokens in style.css
               ================================================ */
            
            .analytics-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 99999;
                transform: translateY(100%);
                transition: transform 0.3s ease-out;
                pointer-events: none;
            }

            .analytics-consent-banner.visible {
                transform: translateY(0);
                pointer-events: auto;
            }

            .analytics-consent-banner.hiding {
                transform: translateY(100%);
                pointer-events: none;
            }

            .consent-container {
                background: var(--bg-surface);
                color: var(--text-primary);
                padding: var(--space-5) var(--space-6);
                display: flex;
                align-items: center;
                gap: var(--space-4);
                max-width: 100%;
                box-shadow: var(--shadow-lg);
                border-top: 1px solid var(--border-strong);
                position: relative;
            }

            .consent-icon {
                flex-shrink: 0;
                width: 40px;
                height: 40px;
                background: var(--brand-light);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--brand);
            }

            .consent-content {
                flex: 1;
                min-width: 0;
            }

            .consent-title {
                font-weight: 600;
                font-size: var(--text-lg);
                margin-bottom: var(--space-1);
                color: var(--text-primary);
            }

            .consent-text {
                font-size: var(--text-md);
                color: var(--text-secondary);
                line-height: 1.4;
            }

            .consent-actions {
                display: flex;
                gap: var(--space-3);
                flex-shrink: 0;
            }

            .consent-btn {
                padding: 0.625rem var(--space-5);
                border-radius: var(--radius-md);
                font-size: var(--text-md);
                font-weight: 500;
                cursor: pointer;
                transition: background var(--transition), border-color var(--transition), color var(--transition);
                border: 1px solid transparent;
                white-space: nowrap;
                font-family: var(--font-base);
            }

            .consent-btn:focus {
                outline: 2px solid var(--brand);
                outline-offset: 2px;
            }

            .consent-btn-primary {
                background: var(--brand);
                color: var(--text-on-brand);
                border-color: var(--brand);
            }

            .consent-btn-primary:hover {
                background: var(--brand-dark);
                border-color: var(--brand-dark);
            }

            .consent-btn-secondary {
                background: var(--bg-surface);
                color: var(--zinc-600);
                border: 1px solid var(--border);
            }

            .consent-btn-secondary:hover {
                background: var(--bg-subtle);
                border-color: var(--border-strong);
                color: var(--text-primary);
            }

            .consent-close {
                position: absolute;
                top: 0.75rem;
                right: 0.75rem;
                width: 28px;
                height: 28px;
                background: var(--bg-subtle);
                border: none;
                border-radius: 50%;
                color: var(--text-muted);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background var(--transition), color var(--transition);
                padding: 0;
            }

            .consent-close:hover {
                background: var(--border);
                color: var(--text-primary);
            }

            .consent-close:focus {
                outline: 2px solid var(--brand);
                outline-offset: 2px;
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .consent-container {
                    flex-direction: column;
                    text-align: center;
                    padding: 1.5rem 1rem 1rem;
                    gap: 0.75rem;
                }

                .consent-icon {
                    display: none;
                }

                .consent-content {
                    padding-right: 1.5rem;
                }

                .consent-actions {
                    width: 100%;
                    justify-content: center;
                }

                .consent-btn {
                    flex: 1;
                    max-width: 150px;
                }

                .consent-close {
                    top: 0.5rem;
                    right: 0.5rem;
                }
            }

            @media (max-width: 400px) {
                .consent-actions {
                    flex-direction: column;
                }

                .consent-btn {
                    max-width: 100%;
                }
            }
        `;

        document.head.appendChild(styles);
        console.log('📊 Consent banner styles injected');
    }

    // ========================================
    // EVENT TRACKING SETUP
    // ========================================
    
    /**
     * Set up all automatic event tracking
     */
    setupEventTracking() {
        this.setupTabTracking();
        this.setupButtonTracking();
        this.setupProjectTracking();
        this.setupFilterTracking();
        this.setupEngagementTracking();
        this.setupModalTracking();

        console.log('📊 Event tracking configured');
    }

    /**
     * Track tab navigation
     */
    setupTabTracking() {
        document.addEventListener('click', (e) => {
            const tabButton = e.target.closest('.tab-btn');
            if (tabButton) {
                const tabName = tabButton.getAttribute('data-tab') || 
                               tabButton.textContent.trim().toLowerCase().replace(/\s+/g, '_');
                this.trackEvent('navigation', 'tab_change', tabName);
            }
        });
    }

    /**
     * Track the Portfolio tool's primary buttons
     */
    setupButtonTracking() {
        // Buttons present in the markup at load
        const trackedButtons = [
            { id: 'loadProjectsBtn', category: 'portfolio', action: 'load_projects', label: 'initial' },
            { id: 'addMoreProjectsBtn', category: 'portfolio', action: 'load_projects', label: 'add_more' },
            { id: 'exportPortfolioBtn', category: 'export', action: 'portfolio_export', label: 'portfolio' }
        ];

        trackedButtons.forEach(({ id, category, action, label }) => {
            const button = document.getElementById(id);
            if (button && !button.hasAttribute('data-ga-tracked')) {
                button.setAttribute('data-ga-tracked', 'true');
                button.addEventListener('click', () => {
                    this.trackEvent(category, action, label);
                });
            }
        });

        // Delegation for anything rendered after init (project cards, row actions)
        document.addEventListener('click', (e) => {
            const closestButton = e.target.closest('button, .btn');
            if (!closestButton) return;

            // Already handled above - don't double-count
            if (closestButton.hasAttribute('data-ga-tracked')) return;

            const buttonId = closestButton.id;
            const buttonText = closestButton.textContent.trim().toLowerCase();

            if (buttonText.includes('export')) {
                this.trackEvent('export', 'portfolio_export', buttonId || 'unlabelled');
            } else if (buttonText.includes('remove') || buttonText.includes('delete')) {
                this.trackEvent('portfolio', 'remove_project', buttonId || 'unlabelled');
            } else if (buttonText.includes('print')) {
                this.trackEvent('export', 'print', 'portfolio_summary');
            }
        });
    }

    /**
     * Track project loading - the Portfolio tool's core action.
     * How many projects a visitor loads at once is the metric that matters here.
     */
    setupProjectTracking() {
        const fileInput = document.getElementById('portfolioFileInput');

        if (fileInput && !fileInput.hasAttribute('data-ga-tracked')) {
            fileInput.setAttribute('data-ga-tracked', 'true');
            fileInput.addEventListener('change', (e) => {
                const count = e.target.files ? e.target.files.length : 0;
                if (count > 0) {
                    this.trackEvent('portfolio', 'projects_loaded', 'file_count', count);
                }
            });
        }
    }

    /**
     * Track the Project Comparison sort control.
     *
     * Note: #timelineRange is NOT tracked here - despite the name it is a
     * read-only summary tile showing the portfolio's date span, not a filter.
     */
    setupFilterTracking() {
        const selects = [
            { id: 'comparisonSortBy', action: 'comparison_sort_change' }
        ];

        selects.forEach(({ id, action }) => {
            const select = document.getElementById(id);
            if (select && !select.hasAttribute('data-ga-tracked')) {
                select.setAttribute('data-ga-tracked', 'true');
                select.addEventListener('change', (e) => {
                    this.trackEvent('filter', action, e.target.value);
                });
            }
        });
    }

    /**
     * Track user engagement metrics
     */
    setupEngagementTracking() {
        const startTime = Date.now();
        let maxScrollDepth = 0;
        const scrollMilestones = new Set();

        // Track session duration on page unload
        const trackSessionEnd = () => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('engagement', 'session_duration', 'seconds', duration);
        };

        window.addEventListener('beforeunload', trackSessionEnd);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                trackSessionEnd();
            }
        });

        // Track scroll depth
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (docHeight <= 0) return;
                
                const scrollPercent = Math.round((window.scrollY / docHeight) * 100);
                
                if (scrollPercent > maxScrollDepth) {
                    maxScrollDepth = scrollPercent;
                    
                    // Track milestones
                    [25, 50, 75, 90, 100].forEach(milestone => {
                        if (maxScrollDepth >= milestone && !scrollMilestones.has(milestone)) {
                            scrollMilestones.add(milestone);
                            this.trackEvent('engagement', 'scroll_depth', `${milestone}%`);
                        }
                    });
                }
            }, 100);
        });

        // Track first interaction
        let hasInteracted = false;
        const interactionEvents = ['click', 'keydown', 'touchstart'];
        
        const trackFirstInteraction = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                this.trackEvent('engagement', 'first_interaction');
                
                // Remove listeners after first interaction
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, trackFirstInteraction);
                });
            }
        };

        interactionEvents.forEach(event => {
            document.addEventListener(event, trackFirstInteraction, { once: false });
        });
    }

    /**
     * Track modal opens
     */
    setupModalTracking() {
        // Use MutationObserver to detect modal opens
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Check if it's a modal
                        if (node.classList?.contains('modal') || 
                            node.classList?.contains('modal-overlay') ||
                            node.id?.includes('Modal')) {
                            
                            const modalName = node.id || 'unknown_modal';
                            this.trackEvent('ui', 'modal_open', modalName);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ========================================
    // CORE TRACKING METHODS
    // ========================================
    
    /**
     * Track a custom event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string|null} label - Event label (optional)
     * @param {number|null} value - Event value (optional)
     */
    trackEvent(category, action, label = null, value = null) {
        if (!this.initialized || typeof window.gtag !== 'function') {
            if (this.debugMode) {
                console.log('📊 [Debug] Event queued (GA not ready):', { category, action, label, value });
            }
            return;
        }

        const eventParams = {
            'event_category': category
        };

        if (label !== null) {
            eventParams['event_label'] = String(label);
        }

        if (value !== null && !isNaN(value)) {
            eventParams['value'] = Number(value);
        }

        try {
            window.gtag('event', action, eventParams);

            if (this.debugMode) {
                console.log('📊 Event tracked:', { action, ...eventParams });
            }
        } catch (error) {
            console.error('📊 Error tracking event:', error);
        }
    }

    /**
     * Track a virtual page view (for SPA navigation)
     * @param {string} pagePath - The page path (e.g., '/tab/summary')
     * @param {string} pageTitle - The page title
     */
    trackPageView(pagePath, pageTitle) {
        if (!this.initialized || typeof window.gtag !== 'function') {
            return;
        }

        try {
            window.gtag('config', this.measurementId, {
                'page_path': pagePath,
                'page_title': pageTitle
            });

            if (this.debugMode) {
                console.log('📊 Page view tracked:', { pagePath, pageTitle });
            }
        } catch (error) {
            console.error('📊 Error tracking page view:', error);
        }
    }

    /**
     * Set user properties for segmentation
     * @param {object} properties - Key-value pairs of user properties
     */
    setUserProperties(properties) {
        if (!this.initialized || typeof window.gtag !== 'function') {
            return;
        }

        try {
            window.gtag('set', 'user_properties', properties);

            if (this.debugMode) {
                console.log('📊 User properties set:', properties);
            }
        } catch (error) {
            console.error('📊 Error setting user properties:', error);
        }
    }

    /**
     * Track feature usage with context
     * @param {string} featureName - Name of the feature
     * @param {object} details - Additional context
     */
    trackFeatureUsage(featureName, details = {}) {
        const detailsStr = Object.keys(details).length > 0 
            ? JSON.stringify(details) 
            : null;
        this.trackEvent('feature', featureName, detailsStr);
    }

    /**
     * Track errors
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     */
    trackError(errorType, errorMessage) {
        this.trackEvent('error', errorType, errorMessage);
    }

    // ========================================
    // UTILITY METHODS
    // ========================================
    
    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('📊 Debug mode enabled - events will be logged to console');
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
        console.log('📊 Debug mode disabled');
    }

    /**
     * Check if analytics is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Check if storage is available
     * @returns {boolean}
     */
    isStorageAvailable() {
        return this.storageAvailable;
    }

    /**
     * Get consent timestamp
     * @returns {string|null}
     */
    getConsentTimestamp() {
        return this.safeGetItem(this.consentTimestampKey);
    }

    /**
     * Show privacy settings (can be called from settings page)
     * @returns {object} Current privacy settings
     */
    showPrivacySettings() {
        const status = this.getConsentStatus();
        const timestamp = this.getConsentTimestamp();
        
        console.log('📊 Privacy Settings:');
        console.log('   Storage Available:', this.storageAvailable);
        console.log('   Consent Status:', status || 'Not set');
        console.log('   Consent Date:', timestamp ? new Date(timestamp).toLocaleString() : 'N/A');
        console.log('   Analytics Active:', this.initialized);
        
        return {
            storageAvailable: this.storageAvailable,
            status: status,
            timestamp: timestamp,
            active: this.initialized
        };
    }

    /**
     * Withdraw consent (for privacy settings page)
     */
    withdrawConsent() {
        this.setConsentStatus('declined');
        
        // Disable GA4
        if (typeof window.gtag === 'function') {
            window.gtag('config', this.measurementId, {
                'send_page_view': false
            });
            window[`ga-disable-${this.measurementId}`] = true;
        }
        
        this.initialized = false;
        console.log('📊 Consent withdrawn - analytics disabled');
    }

    /**
     * Re-prompt for consent (useful for settings page)
     */
    promptConsent() {
        this.resetConsent();
        this.showConsentBanner();
    }
}

// ============================================================================
// CREATE GLOBAL INSTANCE
// ============================================================================

window.analyticsManager = new AnalyticsManager();

// Also expose the class for potential extension
window.AnalyticsManager = AnalyticsManager;

console.log('✓ Analytics Manager module loaded (with consent management)');
