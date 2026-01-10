// Application State
// Issue #134: addInternalResource now handled by Multi Resource Manager
let projectData = {
    projectInfo: {
        projectName: '',
        startDate: '',
        endDate: '',
        projectManager: '',
        projectDescription: ''
    },
    currency: {
        primaryCurrency: 'USD',
        exchangeRates: []  // Array of {currency, rate, lastUpdated}
    },
    internalResources: [],
    vendorCosts: [],
    toolCosts: [],
    miscCosts: [],
    risks: [],
    // Unified rate cards with category metadata
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
    contingencyPercentage: 10,
    contingencyMethod: 'percentage' // ADDED for Issue #129: 'percentage' or 'risk-based'
};

// Make projectData available globally for modules
window.projectData = projectData;

// ====================================================================
// NOTE: DOMContentLoaded initialization has been REMOVED
// All initialization is now handled by js/init_manager.js
// ====================================================================

// Basic functionality fallback
function initializeBasicFunctionality() {
    // ====================================================================
    // FIX for Issue #130: Prevent duplicate event listener attachment
    // This check ensures listeners are only attached once, even if this
    // function is called multiple times (e.g., by both dom_manager.js 
    // and script.js via init_manager.js)
    // ====================================================================
    if (window._basicFunctionalityInitialized) {
        console.log('⚠️ Basic functionality already initialized - skipping to prevent duplicate listeners');
        return;
    }
    window._basicFunctionalityInitialized = true;
    
    console.log('Initializing basic functionality...');

    // Initialize tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons && tabContents) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update active tab content
                tabContents.forEach(content => content.classList.remove('active'));
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Refresh data for specific tabs
                if (targetTab === 'summary') {
                    updateSummary();
                }
            });
        });
        console.log('Tab functionality initialized');
    }

    // Initialize button event listeners
    initializeBasicEventListeners();
}

function initializeBasicEventListeners() {
    // ====================================================================
    // FIX for Issue #130: Prevent duplicate event listener attachment
    // Check if DOM Manager has already initialized these listeners
    // ====================================================================
    if (window._basicEventListenersInitialized) {
        console.log('⚠️ Basic event listeners already initialized - skipping to prevent duplicates');
        return;
    }
    window._basicEventListenersInitialized = true;
    
    // ====================================================================
    // Issue #134: addInternalResource is now handled by Multi Resource Manager
    // Removed from this array to prevent duplicate listeners
    // ====================================================================
    const addButtons = [
        // { id: 'addInternalResource', type: 'internalResource', title: 'Add Internal Resource' }, // Issue #134: Handled by Multi Resource Manager
        { id: 'addVendorCost', type: 'vendorCost', title: 'Add Vendor Cost' },
        { id: 'addToolCost', type: 'toolCost', title: 'Add Tool Cost' },
        { id: 'addMiscCost', type: 'miscCost', title: 'Add Miscellaneous Cost' },
        { id: 'addRisk', type: 'risk', title: 'Add Risk' },
        { id: 'addInternalRate', type: 'rateCard', title: 'Add Rate Card' },
        { id: 'addExternalRate', type: 'rateCard', title: 'Add Rate Card' },
        { id: 'addRate', type: 'rateCard', title: 'Add Rate Card' }
    ];

    addButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            // Guard to prevent duplicate listener attachment
            if (element.hasAttribute('data-add-listener-attached')) {
                console.log(`⚠️ Add listener already attached to ${btn.id} - skipping`);
                return;
            }
            element.addEventListener('click', () => {
                openModal(btn.title, btn.type);
            });
            element.setAttribute('data-add-listener-attached', 'true');
            console.log(`Event listener added to ${btn.id}`);
        }
    });

    // Issue #134: Log that addInternalResource is handled by Multi Resource Manager
    console.log('addInternalResource handled by Multi Resource Manager (Issue #134)');

    // ====================================================================
    // FIX for Issue #130: Action buttons (Save, Load, Export, etc.) are 
    // handled by init_manager.js dropdown menu system. Removing duplicate
    // listeners here to prevent double save/load/export actions.
    // ====================================================================
    console.log('Action buttons (saveBtn, loadBtn, etc.) handled by init_manager dropdown menus');

    // Settings button functionality
    initializeSettingsButton();

    // Modal listeners
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const cancelModal = document.getElementById('cancelModal');
    const modalForm = document.getElementById('modalForm');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (cancelModal) {
        cancelModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ====================================================================
    // FIX for Issue #130: Only attach form submit listener if not already attached
    // This was the primary cause of duplicate tool cost entries
    // ====================================================================
    if (modalForm && !modalForm.hasAttribute('data-submit-listener-attached')) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleModalSubmit();
        });
        modalForm.setAttribute('data-submit-listener-attached', 'true');
        console.log('Modal form submit listener attached');
    } else if (modalForm) {
        console.log('⚠️ Modal form submit listener already attached - skipping');
    }

    // Project info form listeners
    const projectFields = [
        'projectName', 'startDate', 'endDate', 
        'projectManager', 'projectDescription', 'contingencyPercentage'
    ];

    projectFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', (e) => {
                if (fieldId === 'contingencyPercentage') {
                    projectData.contingencyPercentage = parseFloat(e.target.value) || 0;
                } else {
                    projectData.projectInfo[fieldId] = e.target.value;
                }

                updateSummary();
                if ((fieldId === 'startDate' || fieldId === 'endDate')) {
                    updateMonthHeaders();
                }
            });
        }
    });
}

// Settings functionality
function initializeSettingsButton() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsBtnMobile = document.getElementById('settingsBtnMobile');
    const backToMain = document.getElementById('backToMain');

    // Desktop settings button
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings button clicked');
            showSettingsView();
        });
        console.log('Settings button listener added');
    }

    // Mobile settings button
    if (settingsBtnMobile) {
        settingsBtnMobile.addEventListener('click', () => {
            console.log('Mobile settings button clicked');
            showSettingsView();
            // Close mobile menu
            const mobileDropdown = document.getElementById('mobileDropdown');
            if (mobileDropdown) {
                mobileDropdown.style.display = 'none';
            }
        });
        console.log('Mobile settings button listener added');
    }

    // Back to main button
    if (backToMain) {
        backToMain.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Back to main button clicked - validating form...');
            validateProjectInfoAndClose();
        });
        console.log('Back to main button listener added with validation');
    }

    // Initialize settings navigation
    initializeSettingsNavigation();

    // Initialize mobile hamburger menu
    initializeMobileMenu();
}

function initializeProjectInfoSaveButton() {
    const saveProjectInfoBtn = document.getElementById('saveProjectInfoBtn');
    const messageContainer = document.getElementById('projectInfoMessage');

    // Track active timeout for auto-hide
    let autoHideTimeout = null;

    if (saveProjectInfoBtn) {
        saveProjectInfoBtn.addEventListener('click', () => {
            console.log('Save Project Info button clicked');

            // Clear any existing auto-hide timeout
            if (autoHideTimeout) {
                clearTimeout(autoHideTimeout);
                autoHideTimeout = null;
            }

            // Immediately clear any existing messages
            if (messageContainer) {
                messageContainer.style.display = 'none';
                messageContainer.className = 'project-info-message';
                messageContainer.innerHTML = '';
            }

            // Validate required fields before saving
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');

            let isValid = true;
            let errors = [];

            // Reset border colors
            if (startDate) startDate.style.borderColor = '';
            if (endDate) endDate.style.borderColor = '';

            // Validate start date
            if (!startDate.value) {
                isValid = false;
                errors.push('Start Date is required');
                startDate.style.borderColor = '#dc2626';
            }

            // Validate end date
            if (!endDate.value) {
                isValid = false;
                errors.push('End Date is required');
                endDate.style.borderColor = '#dc2626';
            }

            // Validate that end date is after start date
            if (startDate.value && endDate.value) {
                const start = new Date(startDate.value);
                const end = new Date(endDate.value);

                if (end <= start) {
                    isValid = false;
                    errors.push('End Date must be after Start Date');
                    endDate.style.borderColor = '#dc2626';
                }
            }

            // Show errors if validation failed
            if (!isValid) {
                showMessage('error', 'Please fix the following errors:', errors);
                return;
            }

            // Call the same save function as the top-level Save Project button
            if (window.DataManager && typeof window.DataManager.saveProject === 'function') {
                window.DataManager.saveProject();
                showMessage('success', 'Project saved successfully!');
            } else if (window.dataManager && typeof window.dataManager.saveProject === 'function') {
                window.dataManager.saveProject();
                showMessage('success', 'Project saved successfully!');
            } else {
                // Fallback to basic localStorage save
                try {
                    localStorage.setItem('ictProjectData', JSON.stringify(window.projectData));
                    console.log('Project saved using fallback method from settings');
                    showMessage('success', 'Project saved successfully!');
                } catch (e) {
                    console.error('Error saving project:', e);
                    showMessage('error', 'Error saving project. Please try again.');
                }
            }
        });

        console.log('Project Info Save button listener added');
    }

    // Helper function to show messages
    function showMessage(type, message, errorList = null) {
        if (!messageContainer) {
            console.error('Message container not found');
            return;
        }

        console.log('Showing message:', type, message);

        // Build message HTML
        let html = message;

        if (errorList && errorList.length > 0) {
            html += '<ul>';
            errorList.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += '</ul>';
        }

        // Set message content and type
        messageContainer.innerHTML = html;
        messageContainer.className = `project-info-message ${type}`;
        messageContainer.style.display = 'block';

        console.log('Message displayed, scrolling into view');

        // Scroll to message with a small delay to ensure it's rendered
        setTimeout(() => {
            messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            console.log('Setting auto-hide timeout for 5 seconds');
            autoHideTimeout = setTimeout(() => {
                console.log('Auto-hiding success message');
                hideMessage();
            }, 5000);
        } else {
            console.log('Error message - will not auto-hide');
        }
    }

    // Helper function to hide messages
    function hideMessage() {
        if (!messageContainer) return;

        console.log('Hiding message');

        // Add fade-out animation
        messageContainer.classList.add('fade-out');

        // Wait for animation to complete, then hide
        setTimeout(() => {
            messageContainer.style.display = 'none';
            messageContainer.classList.remove('fade-out');
            messageContainer.className = 'project-info-message';
        }, 300);
    }
}

function showSettingsView() {
    const mainApp = document.getElementById('mainApp');
    const settingsApp = document.getElementById('settingsApp');

    if (mainApp && settingsApp) {
        mainApp.style.display = 'none';
        settingsApp.style.display = 'block';
        console.log('Switched to settings view');

        // Add visual enhancements to the back button
        enhanceBackButton();

        // Re-render tables in settings if needed
        if (window.TableRenderer) {
            setTimeout(() => {
                window.TableRenderer.renderUnifiedRateCardsTable();
            }, 100);
        }
    }
}

function enhanceBackButton() {
    const backToMain = document.getElementById('backToMain');
    const settingsHeader = document.querySelector('.settings-header');

    if (backToMain && settingsHeader) {
        // Transform the back button into an X close button
        backToMain.innerHTML = '×'; // Use × symbol for close

        // Position it on the right side of the settings header
        settingsHeader.style.position = 'relative';
        settingsHeader.style.display = 'flex';
        settingsHeader.style.justifyContent = 'space-between';
        settingsHeader.style.alignItems = 'center';

        // Style the X button
        backToMain.style.position = 'absolute';
        backToMain.style.right = '20px';
        backToMain.style.top = '50%';
        backToMain.style.transform = 'translateY(-50%)';
        backToMain.style.width = '32px';
        backToMain.style.height = '32px';
        backToMain.style.borderRadius = '50%';
        backToMain.style.border = '1px solid #dee2e6';
        backToMain.style.backgroundColor = '#f8f9fa';
        backToMain.style.color = '#6c757d';
        backToMain.style.fontSize = '20px';
        backToMain.style.fontWeight = 'bold';
        backToMain.style.display = 'flex';
        backToMain.style.alignItems = 'center';
        backToMain.style.justifyContent = 'center';
        backToMain.style.cursor = 'pointer';
        backToMain.style.transition = 'all 0.2s ease';
        backToMain.style.padding = '0';
        backToMain.style.lineHeight = '1';
        backToMain.style.zIndex = '10';

        // Add hover effects for the X button
        backToMain.addEventListener('mouseenter', () => {
            backToMain.style.backgroundColor = '#e9ecef';
            backToMain.style.borderColor = '#adb5bd';
            backToMain.style.color = '#495057';
            backToMain.style.transform = 'translateY(-50%) scale(1.1)';
            backToMain.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        });

        backToMain.addEventListener('mouseleave', () => {
            backToMain.style.backgroundColor = '#f8f9fa';
            backToMain.style.borderColor = '#dee2e6';
            backToMain.style.color = '#6c757d';
            backToMain.style.transform = 'translateY(-50%) scale(1)';
            backToMain.style.boxShadow = 'none';
        });

        backToMain.addEventListener('mousedown', () => {
            backToMain.style.transform = 'translateY(-50%) scale(0.95)';
            backToMain.style.backgroundColor = '#dee2e6';
        });

        backToMain.addEventListener('mouseup', () => {
            backToMain.style.transform = 'translateY(-50%) scale(1.1)';
            backToMain.style.backgroundColor = '#e9ecef';
        });

        // Add title for accessibility
        backToMain.title = 'Close Settings';
        backToMain.setAttribute('aria-label', 'Close Settings');

        console.log('Back button transformed to X close button');
    } else {
        console.log('Settings header or back button not found');
    }

    // Also enhance any other clickable areas that might need visual cues
    enhanceClickableAreas();
}

function enhanceClickableAreas() {
    // Add visual enhancements to settings navigation buttons
    const settingsNavButtons = document.querySelectorAll('.settings-nav-btn');
    settingsNavButtons.forEach(button => {
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';

        // Add subtle hover effects if they don't already exist
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('active')) {
                button.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                button.style.backgroundColor = '';
            }
        });
    });

    // Enhance any other potentially unclear clickable areas
    const allButtons = document.querySelectorAll('button:not([style*="cursor"])');
    allButtons.forEach(button => {
        if (!button.style.cursor) {
            button.style.cursor = 'pointer';
        }
    });

    console.log('Additional clickable areas enhanced');
}

function showMainView() {
    const mainApp = document.getElementById('mainApp');
    const settingsApp = document.getElementById('settingsApp');
    
    if (mainApp && settingsApp) {
        mainApp.style.display = 'block';
        settingsApp.style.display = 'none';
        console.log('Switched to main view');
        
        // CRITICAL: Clean up old month data before rendering
        if (window.tableRenderer) {
            const monthInfo = window.tableRenderer.calculateProjectMonths();
            const currentMonthCount = monthInfo.count;
            
            console.log(`Current month count: ${currentMonthCount}, months:`, monthInfo.months);
            
            // Clean internal resources
            if (window.projectData && window.projectData.internalResources) {
                window.projectData.internalResources.forEach(resource => {
                    // Ensure all current months exist
                    for (let i = 1; i <= currentMonthCount; i++) {
                        if (resource[`month${i}Days`] === undefined) {
                            resource[`month${i}Days`] = 0;
                        }
                    }
                    // Remove any month data beyond current range
                    for (let i = currentMonthCount + 1; i <= 24; i++) {
                        delete resource[`month${i}Days`];
                    }
                });
                console.log('Internal resources cleaned');
            }
            
            // Clean vendor costs
            if (window.projectData && window.projectData.vendorCosts) {
                window.projectData.vendorCosts.forEach(vendor => {
                    // Ensure all current months exist
                    for (let i = 1; i <= currentMonthCount; i++) {
                        if (vendor[`month${i}Cost`] === undefined) {
                            vendor[`month${i}Cost`] = 0;
                        }
                    }
                    // Remove any month data beyond current range
                    for (let i = currentMonthCount + 1; i <= 24; i++) {
                        delete vendor[`month${i}Cost`];
                    }
                });
                console.log('Vendor costs cleaned');
            }
        }
        
        // Update summary immediately
        updateSummary();
        
        // Re-render all tables with updated month structure
        if (window.TableRenderer) {
            // CRITICAL: Update headers FIRST before rendering any content
            window.TableRenderer.updateTableHeaders();
            console.log('Headers updated');
            
            // Clear forecast table completely before re-rendering
            const forecastTbody = document.getElementById('forecastTable');
            if (forecastTbody) {
                forecastTbody.innerHTML = '';
                console.log('Forecast table cleared');
            }
            
            // Now render all tables
            window.TableRenderer.renderAllTables();
            console.log('All tables rendered');
        }
        
        // Force table_fixes rendering (this may override forecast table headers)
        if (window.renderTableHeadersCorrectly) {
            window.renderTableHeadersCorrectly();
            console.log('Table headers corrected via table_fixes');
        }
        
        if (window.renderInternalResourcesTableFixed) {
            window.renderInternalResourcesTableFixed();
        }
        
        if (window.renderVendorCostsTableFixed) {
            window.renderVendorCostsTableFixed();
        }
        
        // Force a final forecast table re-render
        setTimeout(() => {
            updateSummary();
            
            // Clear and re-render forecast one more time
            const forecastTbody = document.getElementById('forecastTable');
            if (forecastTbody) {
                forecastTbody.innerHTML = '';
            }
            
            if (window.TableRenderer && window.TableRenderer.renderForecastTable) {
                window.TableRenderer.renderForecastTable();
                console.log('Forecast table re-rendered in timeout');
            }
        }, 50);
    }
}

// User Profile Dropdown Toggle
const userProfileBtn = document.getElementById('userProfileBtn');
const userProfileDropdown = document.getElementById('userProfileDropdown');

if (userProfileBtn && userProfileDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfileDropdown.style.display = 
            userProfileDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        userProfileDropdown.style.display = 'none';
    });
}

// Account Settings Button
const accountSettingsBtn = document.getElementById('accountSettingsBtn');
if (accountSettingsBtn) {
    accountSettingsBtn.addEventListener('click', () => {
        // Add your account settings logic here
        console.log('Account settings clicked');
    });
}

// Logout Button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Add your logout logic here
        console.log('Logout clicked');
    });
}

function initializeSettingsNavigation() {
    const settingsNavButtons = document.querySelectorAll('.settings-nav-btn');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');

    settingsNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-settings-tab');

            // Update active nav button
            settingsNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active tab content
            settingsTabContents.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(`settings-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            console.log(`Switched to settings tab: ${targetTab}`);
        });
    });

    console.log('Settings navigation initialized');
}

function initializeMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDropdown = document.getElementById('mobileDropdown');

    if (hamburgerBtn && mobileDropdown) {
        hamburgerBtn.addEventListener('click', () => {
            const isVisible = mobileDropdown.style.display === 'block';
            mobileDropdown.style.display = isVisible ? 'none' : 'block';
            console.log('Mobile menu toggled');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !mobileDropdown.contains(e.target)) {
                mobileDropdown.style.display = 'none';
            }
        });

        console.log('Mobile menu initialized');
    }
}

// Fallback functions for when modules aren't available
function saveProjectFallback() {
    if (window.DataManager) {
        window.DataManager.saveProject();
    } else if (window.dataManager) {
        window.dataManager.saveProject();
    } else {
        // Basic localStorage save
        try {
            localStorage.setItem('ictProjectData', JSON.stringify(projectData));
            console.log('Project saved using fallback method');
        } catch (e) {
            console.error('Error saving project:', e);
        }
    }
}

function loadProjectFallback() {
    if (window.DataManager) {
        window.DataManager.loadProject();
    } else if (window.dataManager) {
        window.dataManager.loadProject();
    } else {
        // Basic file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        projectData = { ...projectData, ...data };
                        updateSummary();
                        if (window.TableRenderer) {
                            window.TableRenderer.renderAllTables();
                        }
                        console.log('Project loaded using fallback method');
                    } catch (err) {
                        console.error('Error loading project:', err);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
}

function exportToExcelFallback() {
    if (window.DataManager) {
        window.DataManager.exportToExcel();
    } else if (window.dataManager) {
        window.dataManager.exportToExcel();
    } else {
        console.log('Export functionality requires Data Manager module');
    }
}

function newProjectFallback() {
    // Show welcome popup instead of immediate confirmation
    if (window.handleNewProjectWelcome) {
        window.handleNewProjectWelcome();
    } else if (window.DataManager) {
        window.DataManager.newProject();
    } else if (window.dataManager) {
        window.dataManager.newProject();
    } else {
        if (confirm('Start a new project? This will clear all current data.')) {
            // Reset to initial state
            projectData = {
                projectInfo: { projectName: '', startDate: '', endDate: '', projectManager: '', projectDescription: '' },
                internalResources: [], vendorCosts: [], toolCosts: [], miscCosts: [], risks: [],
                rateCards: projectData.rateCards, // Keep default rate cards
                contingencyPercentage: 10,
                contingencyMethod: 'percentage' // ADDED for Issue #129
            };
            updateSummary();
            if (window.TableRenderer) {
                window.TableRenderer.renderAllTables();
            }
            console.log('New project created using fallback method');
        }
    }
}

function downloadProjectFallback() {
    if (window.DataManager) {
        window.DataManager.downloadProject();
    } else if (window.dataManager) {
        window.dataManager.downloadProject();
    } else {
        // Basic download
        const dataStr = JSON.stringify(projectData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ICT_Project_${projectData.projectInfo.projectName || 'Untitled'}.json`;
        link.click();
        console.log('Project downloaded using fallback method');
    }
}

function loadDefaultDataBasic() {
    try {
        if (typeof(Storage) !== "undefined" && localStorage) {
            const savedData = localStorage.getItem('ictProjectData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                projectData = { ...projectData, ...parsed };
                console.log('Data loaded using basic method');
            }
        }
    } catch (e) {
        console.error('Error loading saved data:', e);
    }
}

// Calculate months based on start date
function calculateProjectMonths() {
    const startDate = projectData.projectInfo.startDate;

    if (!startDate) {
        return ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    }

    const start = new Date(startDate);
    const months = [];
    const current = new Date(start);

    // Generate up to 12 months from start date
    for (let i = 0; i < 12; i++) {
        months.push(current.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        }));
        current.setMonth(current.getMonth() + 1);
    }

    return months;
}

// Update all month headers
function updateMonthHeaders() {
    const months = calculateProjectMonths();

    // Update forecast table headers (6 months shown)
    for (let i = 1; i <= 6; i++) {
        const header = document.getElementById(`month${i}Header`);
        if (header && months[i-1]) {
            header.textContent = months[i-1];
        }
    }

    // Update internal resources headers (4 months shown)
    for (let i = 1; i <= 4; i++) {
        const header = document.getElementById(`month${i}DaysHeader`);
        if (header && months[i-1]) {
            header.textContent = `${months[i-1]} Days`;
        }
    }

    // Update vendor costs headers (4 months shown)
    for (let i = 1; i <= 4; i++) {
        const header = document.getElementById(`month${i}CostHeader`);
        if (header && months[i-1]) {
            header.textContent = `${months[i-1]} Cost`;
        }
    }
}

// Generate Resource Plan forecast table
function renderResourcePlanForecast() {
    const table = document.getElementById('forecastTable');
    const thead = document.getElementById('forecastTableHead');
    const tbody = document.getElementById('forecastTableBody');
    
    if (!table || !thead || !tbody) return;
    
    // Get project date range
    const startDate = projectData.projectInfo?.startDate;
    const endDate = projectData.projectInfo?.endDate;
    
    if (!startDate) {
        thead.innerHTML = '<tr><th>Cost Category</th><th colspan="6">Please set project start date in Project Settings</th></tr>';
        tbody.innerHTML = '';
        return;
    }
    
    // Calculate months to display
    const months = calculateProjectMonthsArray(startDate, endDate);
    
    // Build header row
    let headerHTML = '<tr class="month-header-row"><th>Cost Category</th>';
    months.forEach(month => {
        headerHTML += `<th>${month.label}</th>`;
    });
    headerHTML += '<th>Total</th></tr>';
    thead.innerHTML = headerHTML;
    
    // Get cost data
    const internalCosts = getInternalResourcesMonthlyCosts(months);
    const vendorCosts = getVendorMonthlyCosts(months);
    const toolCosts = getToolCostsMonthlyCosts(months);
    const miscCosts = getMiscMonthlyCosts(months);
    
    // Build body rows
    let bodyHTML = '';
    
    // Internal Resources row
    bodyHTML += '<tr><td><strong>Internal Resources</strong></td>';
    let internalTotal = 0;
    months.forEach(month => {
        const cost = internalCosts[month.key] || 0;
        internalTotal += cost;
        bodyHTML += `<td>$${cost.toLocaleString()}</td>`;
    });
    bodyHTML += `<td><strong>$${internalTotal.toLocaleString()}</strong></td></tr>`;
    
    // Vendor Costs row
    bodyHTML += '<tr><td><strong>Vendor Costs</strong></td>';
    let vendorTotal = 0;
    months.forEach(month => {
        const cost = vendorCosts[month.key] || 0;
        vendorTotal += cost;
        bodyHTML += `<td>$${cost.toLocaleString()}</td>`;
    });
    bodyHTML += `<td><strong>$${vendorTotal.toLocaleString()}</strong></td></tr>`;
    
    // Tool Costs row (NEW)
    bodyHTML += '<tr><td><strong>Tool Costs</strong></td>';
    let toolTotal = 0;
    months.forEach(month => {
        const cost = toolCosts[month.key] || 0;
        toolTotal += cost;
        bodyHTML += `<td>$${cost.toLocaleString()}</td>`;
    });
    bodyHTML += `<td><strong>$${toolTotal.toLocaleString()}</strong></td></tr>`;
    
    // Miscellaneous row
    bodyHTML += '<tr><td><strong>Miscellaneous</strong></td>';
    let miscTotal = 0;
    months.forEach(month => {
        const cost = miscCosts[month.key] || 0;
        miscTotal += cost;
        bodyHTML += `<td>$${cost.toLocaleString()}</td>`;
    });
    bodyHTML += `<td><strong>$${miscTotal.toLocaleString()}</strong></td></tr>`;
    
    // Total row
    bodyHTML += '<tr class="total-row" style="background: #f0f9ff; font-weight: bold;"><td><strong>Total Monthly Cost</strong></td>';
    let grandTotal = 0;
    months.forEach(month => {
        const monthTotal = (internalCosts[month.key] || 0) + 
                          (vendorCosts[month.key] || 0) + 
                          (toolCosts[month.key] || 0) + 
                          (miscCosts[month.key] || 0);
        grandTotal += monthTotal;
        bodyHTML += `<td><strong>$${monthTotal.toLocaleString()}</strong></td>`;
    });
    bodyHTML += `<td><strong>$${grandTotal.toLocaleString()}</strong></td></tr>`;
    
    tbody.innerHTML = bodyHTML;
}

// Calculate months array from start to end date
function calculateProjectMonthsArray(startDate, endDate) {
    const months = [];
    const start = new Date(startDate);
    let end;
    
    if (endDate) {
        end = new Date(endDate);
    } else {
        // Default to 12 months if no end date
        end = new Date(start);
        end.setMonth(end.getMonth() + 11);
    }
    
    let current = new Date(start);
    while (current <= end) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        const label = current.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        months.push({ key, label });
        current.setMonth(current.getMonth() + 1);
    }
    
    return months;
}

// Get internal resources costs by month
function getInternalResourcesMonthlyCosts(months) {
    const costs = {};
    const resources = projectData.internalResources || [];
    
    // This is simplified - assumes 4 months currently
    // You may need to enhance this based on your existing logic
    resources.forEach(resource => {
        const dailyRate = resource.dailyRate || 0;
        if (months[0]) costs[months[0].key] = (costs[months[0].key] || 0) + (resource.month1Days || 0) * dailyRate;
        if (months[1]) costs[months[1].key] = (costs[months[1].key] || 0) + (resource.month2Days || 0) * dailyRate;
        if (months[2]) costs[months[2].key] = (costs[months[2].key] || 0) + (resource.month3Days || 0) * dailyRate;
        if (months[3]) costs[months[3].key] = (costs[months[3].key] || 0) + (resource.month4Days || 0) * dailyRate;
    });
    
    return costs;
}

// Get vendor costs by month
function getVendorMonthlyCosts(months) {
    const costs = {};
    const vendors = projectData.vendorCosts || [];
    
    // Simplified - assumes 4 months currently
    vendors.forEach(vendor => {
        if (months[0]) costs[months[0].key] = (costs[months[0].key] || 0) + (vendor.month1Cost || 0);
        if (months[1]) costs[months[1].key] = (costs[months[1].key] || 0) + (vendor.month2Cost || 0);
        if (months[2]) costs[months[2].key] = (costs[months[2].key] || 0) + (vendor.month3Cost || 0);
        if (months[3]) costs[months[3].key] = (costs[months[3].key] || 0) + (vendor.month4Cost || 0);
    });
    
    return costs;
}

// Get tool costs by month using Tool Costs Manager
function getToolCostsMonthlyCosts(months) {
    if (window.toolCostsManager) {
        return window.toolCostsManager.getAllToolCostsMonthlyBreakdown();
    }
    return {};
}

// Get miscellaneous costs by month (spread evenly)
function getMiscMonthlyCosts(months) {
    const costs = {};
    const misc = projectData.miscCosts || [];
    const totalMisc = misc.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    // Spread misc costs evenly across all months
    const costPerMonth = months.length > 0 ? totalMisc / months.length : 0;
    months.forEach(month => {
        costs[month.key] = costPerMonth;
    });
    
    return costs;
}

// Export functions
window.renderResourcePlanForecast = renderResourcePlanForecast;

// Modal Management
function openModal(title, type) {
    try {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalFields = document.getElementById('modalFields');
        const modalForm = document.getElementById('modalForm');

        if (!modal || !modalTitle || !modalFields || !modalForm) {
            console.error('Modal elements not found');
            return;
        }

        modalTitle.textContent = title;
        modalFields.innerHTML = getModalFields(type);
        modal.style.display = 'block';
        modalForm.setAttribute('data-type', type);
        
        // Handle vendor cost modal - hide standard buttons and attach close handler
        if (type === 'vendorCost') {
            // Hide standard modal buttons
            const standardModalActions = modalForm.querySelector('.modal-actions:not(.vendor-cost-actions)');
            if (standardModalActions) {
                standardModalActions.style.display = 'none';
            }
            const cancelModal = document.getElementById('cancelModal');
            const saveModal = modalForm.querySelector('button[type="submit"]:not(#vendorCostSave)');
            if (cancelModal) cancelModal.style.display = 'none';
            if (saveModal) saveModal.style.display = 'none';
            
            // Attach close button handler
            const closeBtn = document.getElementById('vendorCostClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                    // Restore standard buttons for next modal
                    restoreStandardModalButtons();
                });
            }
        }
    } catch (error) {
        console.error('Error opening modal:', error);
    }
}

// Helper function to restore standard modal buttons
function restoreStandardModalButtons() {
    const modalForm = document.getElementById('modalForm');
    if (modalForm) {
        const standardModalActions = modalForm.querySelector('.modal-actions');
        if (standardModalActions) {
            standardModalActions.style.display = '';
        }
        const cancelModal = document.getElementById('cancelModal');
        const saveModal = modalForm.querySelector('button[type="submit"]');
        if (cancelModal) cancelModal.style.display = '';
        if (saveModal) saveModal.style.display = '';
    }
}

function getModalFields(type) {
    const months = calculateProjectMonths();

    const fields = {
        internalResource: `
            <div class="form-group">
                <label>Role:</label>
                <select name="role" class="form-control" required>
                    ${projectData.rateCards.map(rate => `<option value="${rate.role}" data-category="${rate.category}">${rate.role} (${rate.category})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>${months[0] || 'Month 1'} Days:</label>
                <input type="number" name="month1Days" class="form-control" min="0" step="0.5" value="0">
            </div>
            <div class="form-group">
                <label>${months[1] || 'Month 2'} Days:</label>
                <input type="number" name="month2Days" class="form-control" min="0" step="0.5" value="0">
            </div>
            <div class="form-group">
                <label>${months[2] || 'Month 3'} Days:</label>
                <input type="number" name="month3Days" class="form-control" min="0" step="0.5" value="0">
            </div>
            <div class="form-group">
                <label>${months[3] || 'Month 4'} Days:</label>
                <input type="number" name="month4Days" class="form-control" min="0" step="0.5" value="0">
            </div>
        `,
        vendorCost: `
            <div class="vendor-cost-container">
                <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.9rem;">
                    Enter vendor details. You can add monthly cost allocations after saving.
                </p>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Vendor Name:</label>
                    <input type="text" name="vendor" class="form-control" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description:</label>
                    <input type="text" name="description" class="form-control" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Category:</label>
                    <select name="category" class="form-control" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="">-- Select Category --</option>
                        <option value="Implementation">Implementation</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Training">Training</option>
                        <option value="Support">Support</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="vendor-cost-actions" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                <button type="button" id="vendorCostClose" style="background-color: #6b7280; color: white; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Close</button>
                <button type="submit" id="vendorCostSave" style="background-color: #6366f1; color: white; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Save</button>
            </div>
        `,
        toolCost: `
            <div class="form-group">
                <label>Procurement Type:</label>
                <select name="procurementType" class="form-control" required>
                    <option value="">-- Select Type --</option>
                    <option value="Software License">Software License</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Cloud Services">Cloud Services</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tool/Software Name:</label>
                <input type="text" name="tool" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Billing Frequency:</label>
                <select name="billingFrequency" class="form-control" id="billingFrequency" required>
                    <option value="">-- Select Frequency --</option>
                    <option value="one-time">One-time</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                </select>
            </div>
            <div class="form-group">
                <label>Cost Per Period:</label>
                <input type="number" name="costPerPeriod" class="form-control" id="costPerPeriod" min="0" step="0.01" required>
                <small class="form-text text-muted">Enter the cost for one billing period</small>
            </div>
            <div class="form-group">
                <label>Quantity (Licenses/Units):</label>
                <input type="number" name="quantity" class="form-control" id="quantity" min="1" step="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Start Date:</label>
                <input type="date" name="startDate" class="form-control" id="toolStartDate" required>
            </div>
            <div class="form-group" id="endDateGroup">
                <label>End Date:</label>
                <input type="date" name="endDate" class="form-control" id="toolEndDate">
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" name="isOngoing" id="isOngoing" style="width: auto; margin: 0;">
                    <span>Ongoing (no end date)</span>
                </label>
            </div>
            <div id="costPreview" class="cost-preview" style="display: none; margin-top: 1rem; padding: 1rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px;">
                <strong>Estimated Total Cost:</strong> <span id="previewAmount">$0</span>
                <br>
                <small id="previewDetails" class="text-muted"></small>
            </div>
        `,
        miscCost: `
            <div class="form-group">
                <label>Item:</label>
                <input type="text" name="item" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Description:</label>
                <input type="text" name="description" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Category:</label>
                <select name="category" class="form-control" required>
                    <option value="Travel">Travel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Training">Training</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Cost:</label>
                <input type="number" name="cost" class="form-control" min="0" step="0.01" required>
            </div>
        `,
        risk: `
            <div class="form-group">
                <label>Risk Description:</label>
                <textarea name="description" class="form-control" required></textarea>
            </div>
            <div class="form-group">
                <label>Probability (1-5):</label>
                <input type="number" name="probability" class="form-control" min="1" max="5" required>
            </div>
            <div class="form-group">
                <label>Impact (1-5):</label>
                <input type="number" name="impact" class="form-control" min="1" max="5" required>
            </div>
            <div class="form-group">
                <label>Mitigation Cost:</label>
                <input type="number" name="mitigationCost" class="form-control" min="0" step="0.01" value="0">
            </div>
        `,
        rateCard: `
            <div class="form-group">
                <label>Role:</label>
                <input type="text" name="role" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Category:</label>
                <select name="category" class="form-control" required>
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                </select>
            </div>
            <div class="form-group">
                <label>Daily Rate:</label>
                <input type="number" name="rate" class="form-control" min="0" step="0.01" required>
            </div>
        `
    };

    return fields[type] || '';
}

function handleModalSubmit() {
    try {
        const modalForm = document.getElementById('modalForm');
        const formData = new FormData(modalForm);
        const type = modalForm.getAttribute('data-type');
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        console.log('Modal submit - Type:', type);
        console.log('Modal submit - Data:', data);

        // Add item to appropriate array
        switch(type) {
            case 'internalResource':
                const rate = projectData.rateCards.find(r => r.role === data.role);
                projectData.internalResources.push({
                    id: Date.now(),
                    role: data.role,
                    rateCard: rate ? rate.category || 'Internal' : 'Internal',
                    dailyRate: rate ? rate.rate : 0,
                    month1Days: parseFloat(data.month1Days) || 0,
                    month2Days: parseFloat(data.month2Days) || 0,
                    month3Days: parseFloat(data.month3Days) || 0,
                    month4Days: parseFloat(data.month4Days) || 0
                });
                break;
            case 'vendorCost':
                // Get project month information for setting up 0 costs
                const vendorMonthInfo = window.tableRenderer?.calculateProjectMonths() || { count: 12 };
                const newVendor = {
                    id: Date.now(),
                    vendor: data.vendor,
                    description: data.description,
                    category: data.category
                };
                // Initialize all months with 0 cost
                for (let i = 1; i <= vendorMonthInfo.count; i++) {
                    newVendor[`month${i}Cost`] = 0;
                }
                projectData.vendorCosts.push(newVendor);
                // Restore standard modal buttons
                restoreStandardModalButtons();
                break;
            case 'toolCost':
                // Validate using tool costs manager
                if (window.toolCostsManager) {
                    const validation = window.toolCostsManager.validateToolCost(data);
                    if (!validation.valid) {
                        alert('Validation errors:\n' + validation.errors.join('\n'));
                        return;
                    }
                }
                
                projectData.toolCosts.push({
                    id: Date.now(),
                    tool: data.tool,
                    procurementType: data.procurementType,
                    billingFrequency: data.billingFrequency,
                    costPerPeriod: parseFloat(data.costPerPeriod),
                    quantity: parseInt(data.quantity),
                    startDate: data.startDate,
                    endDate: data.endDate || null,
                    isOngoing: data.isOngoing === 'on' || data.isOngoing === true
                });
                break;
            case 'miscCost':
                projectData.miscCosts.push({
                    id: Date.now(),
                    item: data.item,
                    description: data.description,
                    category: data.category,
                    cost: parseFloat(data.cost)
                });
                break;
            case 'risk':
                projectData.risks.push({
                    id: Date.now(),
                    description: data.description,
                    probability: parseInt(data.probability),
                    impact: parseInt(data.impact),
                    mitigationCost: parseFloat(data.mitigationCost) || 0
                });
                break;
            case 'rateCard':
                console.log('Adding rate card:', data);
                const newRateCard = {
                    id: Date.now(),
                    role: data.role,
                    rate: parseFloat(data.rate),
                    category: data.category
                };
                projectData.rateCards.push(newRateCard);
                break;
        }

        // Re-render tables
        if (window.TableRenderer) {
            window.TableRenderer.renderAllTables();
        } else if (window.tableRenderer) {
            window.tableRenderer.renderAllTables();
        }

        updateSummary();
        document.getElementById('modal').style.display = 'none';
        console.log('Modal submit completed successfully');
    } catch (error) {
        console.error('Error handling modal submit:', error);
    }
}

// Delete Item Function
function deleteItem(arrayName, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        if (arrayName === 'rateCards') {
            projectData.rateCards = projectData.rateCards.filter(item => 
                (item.id && item.id !== id) || (item.role !== id)
            );
        } else {
            projectData[arrayName] = projectData[arrayName].filter(item => item.id !== id);
        }

        // Re-render tables
        if (window.TableRenderer) {
            window.TableRenderer.renderAllTables();
        } else if (window.tableRenderer) {
            window.tableRenderer.renderAllTables();
        }

        updateSummary();
    }
}

// ADDED for Issue #129: Calculate contingency based on selected method
function calculateContingency() {
    const method = projectData.contingencyMethod || 'percentage';
    const internalTotal = calculateInternalResourcesTotal();
    const vendorTotal = calculateVendorCostsTotal();
    const toolTotal = calculateToolCostsTotal();
    const miscTotal = calculateMiscCostsTotal();
    const subtotal = internalTotal + vendorTotal + toolTotal + miscTotal;
    
    if (method === 'percentage') {
        const percentage = projectData.contingencyPercentage || 0;
        return (subtotal * percentage) / 100;
    } else if (method === 'risk-based') {
        // Sum all risk mitigation costs
        return projectData.risks.reduce((total, risk) => {
            return total + (parseFloat(risk.mitigationCost) || 0);
        }, 0);
    }
    return 0;
}

// ADDED for Issue #129: Update contingency method label in UI
function updateContingencyMethodLabel() {
    const label = document.getElementById('contingencyMethodLabel');
    const method = projectData.contingencyMethod || 'percentage';
    
    if (label) {
        if (method === 'percentage') {
            const percentage = projectData.contingencyPercentage || 0;
            label.textContent = `Calculated using: Percentage-based method (${percentage}%)`;
        } else {
            const riskCount = projectData.risks.length;
            label.textContent = `Calculated using: Risk-based method (${riskCount} risk${riskCount !== 1 ? 's' : ''} documented)`;
        }
    }
}

// ADDED for Issue #129: Toggle percentage input visibility based on method
function togglePercentageInput() {
    const method = projectData.contingencyMethod || 'percentage';
    const percentageGroup = document.getElementById('percentageContingencyGroup');
    const riskBasedContent = document.getElementById('riskBasedContent');
    
    if (method === 'percentage') {
        // Show percentage input, hide risk content
        if (percentageGroup) {
            percentageGroup.style.display = 'block';
        }
        if (riskBasedContent) {
            riskBasedContent.style.display = 'none';
        }
        console.log('Switched to percentage-based view');
    } else {
        // Hide percentage input, show risk content
        if (percentageGroup) {
            percentageGroup.style.display = 'none';
        }
        if (riskBasedContent) {
            riskBasedContent.style.display = 'block';
        }
        console.log('Switched to risk-based view');
    }
}

// Summary Calculations
function updateSummary() {
    try {
        // Calculate totals
        const internalTotal = calculateInternalResourcesTotal();
        const vendorTotal = calculateVendorCostsTotal();
        const toolTotal = calculateToolCostsTotal();
        const miscTotal = calculateMiscCostsTotal();

        const subtotal = internalTotal + vendorTotal + toolTotal + miscTotal;
        const contingency = calculateContingency(); // CHANGED for Issue #129: Use new function
        const total = subtotal + contingency;

        // Update resource plan cards
        const totalProjectCostEl = document.getElementById('totalProjectCost');
        const totalInternalCostEl = document.getElementById('totalInternalCost');
        const totalExternalCostEl = document.getElementById('totalExternalCost');

        if (totalProjectCostEl) totalProjectCostEl.textContent = `${total.toLocaleString()}`;
        if (totalInternalCostEl) totalInternalCostEl.textContent = `${internalTotal.toLocaleString()}`;
        if (totalExternalCostEl) totalExternalCostEl.textContent = `${(vendorTotal + toolTotal + miscTotal).toLocaleString()}`;

        // Update contingency display
        const contingencyAmountEl = document.getElementById('contingencyAmount');
        if (contingencyAmountEl) contingencyAmountEl.textContent = contingency.toLocaleString();
        
        // ADDED for Issue #129: Update contingency method label
        updateContingencyMethodLabel();

        // Update summary tab
        const summaryElements = {
            summaryInternalCost: internalTotal,
            summaryVendorCost: vendorTotal,
            summaryToolCost: toolTotal,
            summaryMiscCost: miscTotal,
            summarySubtotal: subtotal,
            summaryContingency: contingency,
            summaryTotal: total
        };

        Object.keys(summaryElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `${summaryElements[id].toLocaleString()}`;
            }
        });

        // Update project info in summary
        updateSummaryProjectInfo();
    } catch (error) {
        console.error('Error updating summary:', error);
    }
}

function calculateInternalResourcesTotal() {
    return projectData.internalResources.reduce((total, resource) => {
        const month1Days = resource.month1Days || 0;
        const month2Days = resource.month2Days || 0;
        const month3Days = resource.month3Days || 0;
        const month4Days = resource.month4Days || 0;

        return total + ((month1Days + month2Days + month3Days + month4Days) * resource.dailyRate);
    }, 0);
}

function calculateVendorCostsTotal() {
    return projectData.vendorCosts.reduce((total, vendor) => {
        const month1Cost = vendor.month1Cost || 0;
        const month2Cost = vendor.month2Cost || 0;
        const month3Cost = vendor.month3Cost || 0;
        const month4Cost = vendor.month4Cost || 0;

        return total + (month1Cost + month2Cost + month3Cost + month4Cost);
    }, 0);
}

// Calculate total tool costs using Tool Costs Manager
function calculateToolCostsTotal() {
    if (window.toolCostsManager) {
        return window.toolCostsManager.calculateAllToolCostsTotal();
    }
    
    // Fallback for old data structure
    return projectData.toolCosts.reduce((total, tool) => {
        if (tool.costPerPeriod !== undefined) {
            // New structure - handled by manager
            return total;
        } else {
            // Old structure
            const toolTotal = (tool.users || 0) * (tool.monthlyCost || 0) * (tool.duration || 0);
            return total + toolTotal;
        }
    }, 0);
}

// Make function available globally
window.calculateToolCostsTotal = calculateToolCostsTotal;

function calculateMiscCostsTotal() {
    return projectData.miscCosts.reduce((total, misc) => {
        return total + misc.cost;
    }, 0);
}

// Function to update project info in summary tab
function updateSummaryProjectInfo() {
    try {
        // Update project info in summary tab
        const projectInfoElements = {
            summaryProjectName: projectData.projectInfo.projectName || 'Not specified',
            summaryStartDate: projectData.projectInfo.startDate || 'Not specified', 
            summaryEndDate: projectData.projectInfo.endDate || 'Not specified',
            summaryProjectManager: projectData.projectInfo.projectManager || 'Not specified',
            summaryProjectDescription: projectData.projectInfo.projectDescription || 'Not specified'
        };

        Object.keys(projectInfoElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = projectInfoElements[id];
            }
        });

        // Calculate project duration if both dates are provided
        const summaryDurationEl = document.getElementById('summaryProjectDuration');
        if (summaryDurationEl && projectData.projectInfo.startDate && projectData.projectInfo.endDate) {
            const start = new Date(projectData.projectInfo.startDate);
            const end = new Date(projectData.projectInfo.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffMonths = Math.round(diffDays / 30.44);
            summaryDurationEl.textContent = `${diffDays} days (≈${diffMonths} months)`;
        } else if (summaryDurationEl) {
            summaryDurationEl.textContent = 'Not specified';
        }

        // Update resource counts
        const resourceCountsElements = {
            summaryInternalResourceCount: projectData.internalResources.length,
            summaryVendorCount: projectData.vendorCosts.length,
            summaryToolCount: projectData.toolCosts.length,
            summaryRiskCount: projectData.risks.length
        };

        Object.keys(resourceCountsElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = resourceCountsElements[id];
            }
        });

    } catch (error) {
        console.error('Error in updateSummaryProjectInfo:', error);
    }
}

function validateProjectInfoAndClose() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    let isValid = true;
    let errorMessage = '';

    // Reset border colors
    if (startDate) startDate.style.borderColor = '';
    if (endDate) endDate.style.borderColor = '';

    // Validate start date
    if (!startDate.value) {
        isValid = false;
        errorMessage += '• Start Date is required\n';
        startDate.style.borderColor = 'red';
    }

    // Validate end date
    if (!endDate.value) {
        isValid = false;
        errorMessage += '• End Date is required\n';
        endDate.style.borderColor = 'red';
    }

    // Validate that end date is after start date
    if (startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);

        if (end <= start) {
            isValid = false;
            errorMessage += '• End Date must be after Start Date\n';
            endDate.style.borderColor = 'red';
        }
    }

    if (!isValid) {
        alert('Please fix the following errors before closing settings:\n\n' + errorMessage);
        return false;
    }

    // FIXED: Ensure project data is saved before switching views
    // Save the current values to projectData
    if (window.projectData && window.projectData.projectInfo) {
        window.projectData.projectInfo.startDate = startDate.value;
        window.projectData.projectInfo.endDate = endDate.value;
        window.projectData.projectInfo.projectName = document.getElementById('projectName')?.value || '';
        window.projectData.projectInfo.projectManager = document.getElementById('projectManager')?.value || '';
        window.projectData.projectInfo.projectDescription = document.getElementById('projectDescription')?.value || '';
    }
    
    // Save to localStorage
    if (window.DataManager && window.DataManager.saveToLocalStorage) {
        window.DataManager.saveToLocalStorage();
    }

    // Now show main view with all updates
    showMainView();
    return true;
}

// Expose necessary functions globally
window.openModal = openModal;
window.handleModalSubmit = handleModalSubmit;
window.deleteItem = deleteItem;
window.updateSummary = updateSummary;
window.updateMonthHeaders = updateMonthHeaders;
window.calculateProjectMonths = calculateProjectMonths;
window.initializeBasicFunctionality = initializeBasicFunctionality;
window.initializeProjectInfoSaveButton = initializeProjectInfoSaveButton;
window.restoreStandardModalButtons = restoreStandardModalButtons;

// Calculation functions for modules
window.calculateInternalResourcesTotal = calculateInternalResourcesTotal;
window.calculateVendorCostsTotal = calculateVendorCostsTotal;
window.calculateToolCostsTotal = calculateToolCostsTotal;
window.calculateMiscCostsTotal = calculateMiscCostsTotal;

// ADDED for Issue #129: Export new contingency functions
window.calculateContingency = calculateContingency;
window.updateContingencyMethodLabel = updateContingencyMethodLabel;
window.togglePercentageInput = togglePercentageInput;
