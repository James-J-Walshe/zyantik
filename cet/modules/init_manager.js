// modules/init_manager.js
// Initialization Manager - UPDATED VERSION WITH DROPDOWN MENU SUPPORT
// Ensures proper loading order and dependency availability

class InitializationManager {
    constructor() {
        this.initialized = false;
        this.modules = {
            dataManager: false,
            tableRenderer: false,
            editManager: false,
            dynamicFormHelper: false,
            domManager: false,
            tableFixes: false,
            newProjectWelcome: false,
            currencyManager: false,
            userManager: false,
            featureToggleManager: false,
            toolCostsManager: false,
            mergeManager: false
        };
    }

    // Initialize project data structure
    initializeProjectData() {
        if (!window.projectData) {
            window.projectData = {
                projectInfo: {
                    projectName: '',
                    startDate: '',
                    endDate: '',
                    projectManager: '',
                    projectDescription: ''
                },
                currency: {
                    primaryCurrency: 'USD',
                    exchangeRates: []
                },
                internalResources: [],
                vendorCosts: [],
                toolCosts: [],
                miscCosts: [],
                risks: [],
                rateCards: [
                    { role: 'Project Manager', rate: 800, category: 'Internal' },
                    { role: 'Business Analyst', rate: 650, category: 'Internal' },
                    { role: 'Technical Lead', rate: 750, category: 'Internal' },
                    { role: 'Developer', rate: 600, category: 'Internal' },
                    { role: 'Tester', rate: 550, category: 'Internal' },
                    { role: 'Senior Consultant', rate: 1200, category: 'External' },
                    { role: 'Technical Architect', rate: 1500, category: 'External' },
                    { role: 'Implementation Specialist', rate: 900, category: 'External' },
                    { role: 'Support Specialist', rate: 700, category: 'External' }
                ],
                contingencyPercentage: 10
            };
            console.log('✓ Project data structure initialized');
        }
    }

    // Check if all required modules are loaded
    checkModules() {
        // Check for data manager
        this.modules.dataManager = !!(window.dataManager || window.DataManager);
        
        // Check for table renderer
        this.modules.tableRenderer = !!(window.tableRenderer || window.TableRenderer);
        
        // Check for edit manager
        this.modules.editManager = !!(window.editManager || window.EditManager);
        
        // Check for dynamic form helper
        this.modules.dynamicFormHelper = !!(window.dynamicFormHelper || window.DynamicFormHelper);
        
        // Check for DOM manager
        this.modules.domManager = !!(window.domManager || window.DOMManager);
        
        // Check for table fixes
        this.modules.tableFixes = !!(window.tableFixes || window.TableFixes);
        
        // Check for new project welcome
        this.modules.newProjectWelcome = !!(window.newProjectWelcome);

        // Check for Currency Manager
        this.modules.currencyManager = !!(window.currencyManager || window.CurrencyManager);

        // Check for User Manager
        this.modules.userManager = !!(window.userManager || window.UserManager);

        // Check for tool costs manager
        this.modules.toolCostsManager = !!(window.toolCostsManager || window.ToolCostsManager);

        // Check for merge manager
        this.modules.mergeManager = !!(window.mergeManager || window.MergeManager);

        // Check for Feature Toggle Manager  
        this.modules.featureToggleManager = !!(window.featureToggleManager || window.FeatureToggleManager);

        const loaded = Object.entries(this.modules)
            .filter(([_, status]) => status)
            .map(([name, _]) => name);
        
        console.log('✓ Modules loaded:', loaded.join(', '));
        
        return this.modules;
    }

    // Wait for a function to be available
    waitForFunction(funcName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkFunction = () => {
                if (typeof window[funcName] === 'function') {
                    resolve(window[funcName]);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for function: ${funcName}`));
                } else {
                    setTimeout(checkFunction, 50);
                }
            };
            
            checkFunction();
        });
    }

    // Initialize DOM Manager if available
    initializeDOMManager() {
        if (this.modules.domManager) {
            if (typeof window.DOMManager !== 'undefined' && typeof window.DOMManager.initialize === 'function') {
                console.log('Initializing DOMManager...');
                window.DOMManager.initialize();
            } else if (typeof window.domManager !== 'undefined') {
                if (typeof window.domManager.initialize === 'function') {
                    console.log('Initializing domManager...');
                    window.domManager.initialize();
                } else if (typeof window.domManager.init === 'function') {
                    console.log('Initializing domManager (init method)...');
                    window.domManager.init();
                }
            }
            console.log('✓ DOM Manager initialized');
            
            // ALWAYS also initialize basic functionality from script.js
            // This sets up tab listeners, button listeners, etc.
            if (typeof window.initializeBasicFunctionality === 'function') {
                console.log('Initializing basic event listeners from script.js...');
                window.initializeBasicFunctionality();
                console.log('✓ Basic event listeners initialized');
            }
        } else {
            console.log('DOM Manager not available, using fallback initialization');
            if (typeof window.initializeBasicFunctionality === 'function') {
                window.initializeBasicFunctionality();
            }
        }
    }

    // NEW: Initialize header dropdown menus
    initializeHeaderDropdowns() {
        console.log('Initializing header dropdown menus...');
        
        try {
            // Get all dropdown toggles
            const projectMenuToggle = document.getElementById('projectMenuToggle');
            const settingsMenuToggle = document.getElementById('settingsMenuToggle');
            const userMenuToggle = document.getElementById('userMenuToggle');
            
            // Get all dropdown contents
            const projectMenuContent = document.getElementById('projectMenuContent');
            const settingsMenuContent = document.getElementById('settingsMenuContent');
            const userMenuContent = document.getElementById('userMenuContent');

            // Function to close all dropdowns
            function closeAllDropdowns() {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                document.querySelectorAll('.dropdown-toggle, .user-badge').forEach(toggle => {
                    toggle.classList.remove('active');
                });
            }

            // Project Menu Toggle
            if (projectMenuToggle && projectMenuContent) {
                projectMenuToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = projectMenuContent.classList.contains('show');
                    closeAllDropdowns();
                    if (!isOpen) {
                        projectMenuContent.classList.add('show');
                        projectMenuToggle.classList.add('active');
                    }
                });
                console.log('✓ Project menu dropdown initialized');
            }

            // Settings Menu Toggle
            if (settingsMenuToggle && settingsMenuContent) {
                settingsMenuToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = settingsMenuContent.classList.contains('show');
                    closeAllDropdowns();
                    if (!isOpen) {
                        settingsMenuContent.classList.add('show');
                        settingsMenuToggle.classList.add('active');
                    }
                });
                console.log('✓ Settings menu dropdown initialized');
            }

            // User Menu Toggle
            if (userMenuToggle && userMenuContent) {
                userMenuToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = userMenuContent.classList.contains('show');
                    closeAllDropdowns();
                    if (!isOpen) {
                        userMenuContent.classList.add('show');
                        userMenuToggle.classList.add('active');
                    }
                });
                console.log('✓ User menu dropdown initialized');
            }

            // Close dropdowns when clicking outside
            document.addEventListener('click', () => {
                closeAllDropdowns();
            });

            // Prevent dropdown content clicks from closing the dropdown
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });

            // Hook up project menu items to existing functions
            this.connectProjectMenuButtons();
            
            // Hook up settings menu items
            this.connectSettingsMenuButtons();
            
            // Hook up user menu items
            this.connectUserMenuButtons();

            console.log('✓ All header dropdowns initialized');
        } catch (error) {
            console.error('Error initializing header dropdowns:', error);
        }
    }

    // NEW: Connect project menu buttons
    connectProjectMenuButtons() {
        const projectMenuButtons = {
            'newProjectBtn': () => {
                this.closeAllDropdowns();
                if (window.handleNewProjectWelcome) {
                    window.handleNewProjectWelcome();
                } else if (window.DataManager && typeof window.DataManager.newProject === 'function') {
                    window.DataManager.newProject();
                } else if (window.dataManager && typeof window.dataManager.newProject === 'function') {
                    window.dataManager.newProject();
                } else {
                    console.warn('New project function not available');
                }
            },
            'saveBtn': () => {
                this.closeAllDropdowns();
                if (window.DataManager && typeof window.DataManager.saveProject === 'function') {
                    window.DataManager.saveProject();
                } else if (window.dataManager && typeof window.dataManager.saveProject === 'function') {
                    window.dataManager.saveProject();
                } else {
                    // Fallback to localStorage
                    try {
                        localStorage.setItem('ictProjectData', JSON.stringify(window.projectData));
                        console.log('Project saved using fallback method');
                    } catch (e) {
                        console.error('Error saving project:', e);
                    }
                }
            },
            'downloadBtn': () => {
                this.closeAllDropdowns();
                if (window.DataManager && typeof window.DataManager.downloadProject === 'function') {
                    window.DataManager.downloadProject();
                } else if (window.dataManager && typeof window.dataManager.downloadProject === 'function') {
                    window.dataManager.downloadProject();
                } else {
                    console.warn('Download function not available');
                }
            },
            'loadBtn': () => {
                this.closeAllDropdowns();
                if (window.DataManager && typeof window.DataManager.loadProject === 'function') {
                    window.DataManager.loadProject();
                } else if (window.dataManager && typeof window.dataManager.loadProject === 'function') {
                    window.dataManager.loadProject();
                } else {
                    console.warn('Load function not available');
                }
            },
            'exportBtn': () => {
                this.closeAllDropdowns();
                if (window.DataManager && typeof window.DataManager.exportToExcel === 'function') {
                    window.DataManager.exportToExcel();
                } else if (window.dataManager && typeof window.dataManager.exportToExcel === 'function') {
                    window.dataManager.exportToExcel();
                } else {
                    console.warn('Export function not available');
                }
            }
        };

        // Connect project menu buttons
        Object.entries(projectMenuButtons).forEach(([id, handler]) => {
            const button = document.querySelector(`.grid-menu-item#${id}`);
            if (button) {
                button.addEventListener('click', handler);
                console.log(`  - Connected: ${id}`);
            }
        });
    }

    // NEW: Connect settings menu buttons
    connectSettingsMenuButtons() {
        const settingsMenuButtons = {
            'projectInfoBtn': () => {
                this.closeAllDropdowns();
                this.showSettingsView('project-info');
            },
            'rateCardsBtn': () => {
                this.closeAllDropdowns();
                this.showSettingsView('rate-cards');
            },
            'currencyBtn': () => {
                this.closeAllDropdowns();
                this.showSettingsView('currency');
            }
        };

        // Connect settings menu buttons
        Object.entries(settingsMenuButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
                console.log(`  - Connected: ${id}`);
            }
        });
    }

    // NEW: Connect user menu buttons
    connectUserMenuButtons() {
        // User Profile button
        const userProfileBtn = document.getElementById('userProfileBtn');
        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', () => {
                this.closeAllDropdowns();
                this.showUserView('profile');
            });
            console.log('  - Connected: userProfileBtn');
        }

        // Feature Toggles button
        const featureTogglesBtn = document.getElementById('featureTogglesBtn');
        if (featureTogglesBtn) {
            featureTogglesBtn.addEventListener('click', () => {
                this.closeAllDropdowns();
                const currentUser = window.userManager?.getCurrentUser();
                if (currentUser && currentUser.role === 'admin') {
                    // Show admin UI for feature toggles
                    if (window.featureToggleManager && typeof window.featureToggleManager.showAdminUI === 'function') {
                        window.featureToggleManager.showAdminUI();
                    }
                } else {
                    // Show user view for feature toggles
                    this.showUserView('features');
                }
            });
            console.log('  - Connected: featureTogglesBtn');
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.closeAllDropdowns();
                if (window.userManager && typeof window.userManager.logout === 'function') {
                    window.userManager.logout();
                } else {
                    console.warn('Logout function not available');
                }
            });
            console.log('  - Connected: logoutBtn');
        }
    }

    // NEW: Helper method to close all dropdowns
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-toggle, .user-badge').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }

    // NEW: Helper method to show settings view
    showSettingsView(tabName) {
        const mainApp = document.getElementById('mainApp');
        const settingsApp = document.getElementById('settingsApp');
        const userApp = document.getElementById('userApp');
        
        if (mainApp && settingsApp) {
            mainApp.style.display = 'none';
            settingsApp.style.display = 'block';
            if (userApp) userApp.style.display = 'none';
            
            // Activate specific tab if provided
            if (tabName) {
                const tabButton = document.querySelector(`[data-settings-tab="${tabName}"]`);
                if (tabButton) {
                    tabButton.click();
                }
            }
            
            console.log(`Switched to settings view - ${tabName} tab`);
        }
    }

    // NEW: Helper method to show user view
    showUserView(tabName) {
        const mainApp = document.getElementById('mainApp');
        const settingsApp = document.getElementById('settingsApp');
        const userApp = document.getElementById('userApp');
        
        if (mainApp && userApp) {
            mainApp.style.display = 'none';
            if (settingsApp) settingsApp.style.display = 'none';
            userApp.style.display = 'block';
            
            // Activate specific tab if provided
            if (tabName) {
                const tabButton = document.querySelector(`[data-user-tab="${tabName}"]`);
                if (tabButton) {
                    tabButton.click();
                }
            }
            
            console.log(`Switched to user view - ${tabName} tab`);
        }
    }

    // NEW: Setup user view navigation
    setupUserViewNavigation() {
        // User view navigation
        const userNavButtons = document.querySelectorAll('.user-nav-btn');
        const userTabContents = document.querySelectorAll('.user-tab-content');

        userNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-user-tab');
                
                // Update active nav button
                userNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab content
                userTabContents.forEach(content => content.classList.remove('active'));
                const targetContent = document.getElementById(`user-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });

        // Back from user view button
        const backFromUser = document.getElementById('backFromUser');
        if (backFromUser) {
            backFromUser.addEventListener('click', () => {
                const mainApp = document.getElementById('mainApp');
                const userApp = document.getElementById('userApp');
                
                if (mainApp && userApp) {
                    mainApp.style.display = 'block';
                    userApp.style.display = 'none';
                    
                    // Update summary if needed
                    if (window.updateSummary) {
                        window.updateSummary();
                    }
                }
            });
        }
    }

    // NEW: Update user display in header
    updateUserDisplayInHeader() {
        if (window.userManager && window.userManager.getCurrentUser) {
            const currentUser = window.userManager.getCurrentUser();
            const currentUserName = document.getElementById('currentUserName');
            
            if (currentUserName && currentUser) {
                currentUserName.textContent = currentUser.username || currentUser.name || 'Guest';
            }
        }
    }

    // Initialize application in correct order
    async initialize() {
        if (this.initialized) {
            console.warn('Application already initialized');
            return;
        }

        console.log('🚀 Starting application initialization...');

        try {
            // Step 1: Initialize data structure
            this.initializeProjectData();

            // Step 2: Check which modules are available
            this.checkModules();

            // Step 3: Initialize DOM Manager
            this.initializeDOMManager();

            // Step 4: Wait for critical functions
            await this.waitForFunction('updateSummary');
            await this.waitForFunction('updateMonthHeaders');
            console.log('✓ Core functions available');

            // Step 5: Initialize Project Info Save Button
            if (typeof window.initializeProjectInfoSaveButton === 'function') {
                window.initializeProjectInfoSaveButton();
                console.log('✓ Project Info Save Button initialized');
            }

            // Step 6: Load data
            if (this.modules.dataManager) {
                if (window.DataManager && typeof window.DataManager.loadDefaultData === 'function') {
                    window.DataManager.loadDefaultData();
                } else if (window.dataManager && typeof window.dataManager.loadDefaultData === 'function') {
                    window.dataManager.loadDefaultData();
                }
                console.log('✓ Data loaded from storage');
            }

            // Step 7: Render tables
            if (this.modules.tableRenderer) {
                if (window.TableRenderer && typeof window.TableRenderer.renderAllTables === 'function') {
                    window.TableRenderer.renderAllTables();
                } else if (window.tableRenderer && typeof window.tableRenderer.renderAllTables === 'function') {
                    window.tableRenderer.renderAllTables();
                }
                console.log('✓ Tables rendered');
            }

            // Step8: Render Resource Plan forecast
            if (window.renderResourcePlanForecast) {
                window.renderResourcePlanForecast();
                console.log('✓ Resource Plan forecast rendered');
            }
            
            // Step 9: Update UI
            if (typeof window.updateSummary === 'function') {
                window.updateSummary();
            }
            if (typeof window.updateMonthHeaders === 'function') {
                window.updateMonthHeaders();
            }
            console.log('✓ UI updated');

            // Step 10: Initialize New Project Welcome if available
            if (this.modules.newProjectWelcome && typeof window.newProjectWelcome.initialize === 'function') {
                window.newProjectWelcome.initialize();
                console.log('✓ Step 9: New Project Welcome initialized');
            }

            // Step 11: Initialize User Manager
            if (this.modules.userManager && typeof window.userManager.initialize === 'function') {
                window.userManager.initialize();
                console.log('✓ Step 10: User Manager initialized');
            }

            // Step 12: Initialize Feature Toggle Manager
            if (this.modules.featureToggleManager && typeof window.featureToggleManager.initialize === 'function') {
                window.featureToggleManager.initialize();
                console.log('✓ Step 11: Feature Toggle Manager initialized');
            }

            // Step 13: Initialize Currency Manager
            if (this.modules.currencyManager && typeof window.currencyManager.initialize === 'function') {
                window.currencyManager.initialize();
                console.log('✓ Step 12: Currency Manager initialized');
            }

            // Step 14: Initialize Tool Costs Manager
            if (this.modules.toolCostsManager) {
                try {
                    if (window.toolCostsManager && window.toolCostsManager.initialize) {
                        window.toolCostsManager.initialize();
                        console.log('✓ Step 12: Tool Costs Manager initialized');
                    }
                } catch (error) {
                    console.error('Error initializing Tool Costs Manager:', error);
                }
            }
            
            // Step 15: Initialize Header Dropdowns (NEW)
            this.initializeHeaderDropdowns();
            console.log('✓ Step 13: Header dropdowns initialized');

            // Step 16: Setup User View Navigation (NEW)
            this.setupUserViewNavigation();
            console.log('✓ Step 14: User view navigation initialized');

            // Step 17: Update User Display in Header (NEW)
            this.updateUserDisplayInHeader();
            console.log('✓ Step 15: User display updated in header');

            // Step 18: Initialize Merge Manager
            if (this.modules.mergeManager && typeof window.mergeManager.initialize === 'function') {
                window.mergeManager.initialize();
                console.log('✓ Merge Manager initialized');
            } else if (this.modules.mergeManager) {
                console.warn('⚠ Merge Manager loaded but has no initialize method');
            } else {
                console.log('ℹ Merge Manager not available');
            }
            
            // Step 19: Re-render after short delay for loaded data
            setTimeout(() => {
                if (this.modules.tableRenderer) {
                    if (window.TableRenderer && typeof window.TableRenderer.renderAllTables === 'function') {
                        window.TableRenderer.renderAllTables();
                    } else if (window.tableRenderer && typeof window.tableRenderer.renderAllTables === 'function') {
                        window.tableRenderer.renderAllTables();
                    }
                }
                if (typeof window.updateSummary === 'function') {
                    window.updateSummary();
                }
                console.log('✓ Step 16: Final render complete');
            }, 100);

            this.initialized = true;
            console.log('✅ Application initialization complete with dropdown menu support');

        } catch (error) {
            console.error('❌ Error during initialization:', error);
            console.error('Stack trace:', error.stack);
            // Don't throw - try to continue with partial initialization
            this.initialized = true; // Mark as initialized to prevent retry loops
        }
    }
}

// Create global instance
window.initManager = new InitializationManager();

console.log('✓ Initialization Manager loaded - v2.0 with Dropdown Menu Support');
