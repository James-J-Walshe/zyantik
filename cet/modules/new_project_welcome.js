// New Project Welcome Feature
// Handles welcome popup for new users/projects and project initialization

class NewProjectWelcome {
    constructor() {
        this.welcomeModal = null;
        this.isInitialized = false;
    }

    // Main function to check and show welcome popup
    checkAndShowWelcome() {
        try {
            // Check if user is new or project is new (no start date)
            if (this.isNewProject()) {
                console.log('New project detected - showing welcome popup');
                this.showWelcomePopup();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking for new project:', error);
            return false;
        }
    }

    // Determine if this is a new project based on lack of start date
    isNewProject() {
        const projectData = window.projectData;
        
        // If no project data exists, it's definitely new
        if (!projectData) {
            return true;
        }
        
        // If no project info exists, it's new
        if (!projectData.projectInfo) {
            return true;
        }
        
        // If no start date is set, consider it a new project
        if (!projectData.projectInfo.startDate || projectData.projectInfo.startDate.trim() === '') {
            return true;
        }
        
        return false;
    }

    // Create and show the welcome popup
    showWelcomePopup() {
        try {
            // Remove existing welcome modal if it exists
            this.removeWelcomeModal();
            
            // Create the welcome modal
            this.createWelcomeModal();
            
            // Show the modal
            this.welcomeModal.style.display = 'flex';
            
            console.log('Welcome popup displayed');
        } catch (error) {
            console.error('Error showing welcome popup:', error);
        }
    }

    // Create the welcome modal HTML structure
    createWelcomeModal() {
        // Create modal overlay
        this.welcomeModal = document.createElement('div');
        this.welcomeModal.id = 'welcomeModal';
        this.welcomeModal.className = 'welcome-modal-overlay';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'welcome-modal-content';
        
        // Set modal HTML
        modalContent.innerHTML = `
            <div class="welcome-header">
                <div class="welcome-logo">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                        <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"></path>
                    </svg>
                </div>
                <h2>Welcome to Project Estimating Tool</h2>
                <p>Let's get started with your project cost estimation.</p>
            </div>
            
            <div class="welcome-options">
                <div class="welcome-option" id="loadExistingProject">
                    <div class="option-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                    </div>
                    <div class="option-content">
                        <h3>Load Existing Project</h3>
                        <p>Import a previously saved project file to continue working on your cost estimation.</p>
                    </div>
                    <div class="option-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </div>
                </div>
                
                <div class="welcome-option" id="startNewProject">
                    <div class="option-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <div class="option-content">
                        <h3>Start New Project</h3>
                        <p>Begin a fresh project by entering your project information and building your cost estimate from scratch.</p>
                    </div>
                    <div class="option-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
         
        `;
        
        this.welcomeModal.appendChild(modalContent);
        
        // Add styles
        this.addWelcomeStyles();
        
        // Add event listeners
        this.addWelcomeEventListeners();
        
        // Append to body
        document.body.appendChild(this.welcomeModal);
    }

    // Add CSS styles for the welcome modal
    addWelcomeStyles() {
        // Check if styles already exist
        if (document.getElementById('welcomeModalStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'welcomeModalStyles';
        style.textContent = `
            .welcome-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: welcomeFadeIn 0.3s ease;
            }
            
            @keyframes welcomeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .welcome-modal-content {
                background: white;
                border-radius: 16px;
                padding: 0;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: welcomeSlideIn 0.3s ease;
                position: relative;
            }
            
            @keyframes welcomeSlideIn {
                from { transform: scale(0.9) translateY(20px); opacity: 0; }
                to { transform: scale(1) translateY(0); opacity: 1; }
            }
            
            .welcome-header {
                text-align: center;
                padding: 2.5rem 2rem 1.5rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 16px 16px 0 0;
            }
            
            .welcome-logo {
                margin-bottom: 1rem;
            }
            
            .welcome-logo svg {
                width: 48px;
                height: 48px;
                stroke: white;
            }
            
            .welcome-header h2 {
                margin: 0 0 0.5rem;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .welcome-header p {
                margin: 0;
                opacity: 0.9;
                font-size: 1rem;
            }
            
            .welcome-options {
                padding: 2rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .welcome-option {
                display: flex;
                align-items: center;
                padding: 1.5rem;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: #fafafa;
            }
            
            .welcome-option:hover {
                border-color: #667eea;
                background: #f8faff;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
            }
            
            .welcome-option:active {
                transform: translateY(0);
            }
            
            .option-icon {
                flex-shrink: 0;
                width: 64px;
                height: 64px;
                border-radius: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 1.5rem;
            }
            
            .option-icon svg {
                stroke: white;
            }
            
            .option-content {
                flex: 1;
            }
            
            .option-content h3 {
                margin: 0 0 0.5rem;
                font-size: 1.1rem;
                font-weight: 600;
                color: #374151;
            }
            
            .option-content p {
                margin: 0;
                color: #6b7280;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .option-arrow {
                flex-shrink: 0;
                color: #9ca3af;
                transition: transform 0.2s ease;
            }
            
            .welcome-option:hover .option-arrow {
                transform: translateX(4px);
                color: #667eea;
            }
            
            .welcome-footer {
                padding: 1rem 2rem 2rem;
                text-align: center;
                border-top: 1px solid #f3f4f6;
            }
            
            .welcome-btn-secondary {
                background: none;
                border: 1px solid #d1d5db;
                color: #6b7280;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }
            
            .welcome-btn-secondary:hover {
                background: #f9fafb;
                border-color: #9ca3af;
                color: #374151;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 640px) {
                .welcome-modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                
                .welcome-header {
                    padding: 2rem 1.5rem 1rem;
                }
                
                .welcome-options {
                    padding: 1.5rem;
                }
                
                .welcome-option {
                    padding: 1rem;
                    flex-direction: column;
                    text-align: center;
                }
                
                .option-icon {
                    margin: 0 0 1rem 0;
                    width: 56px;
                    height: 56px;
                }
                
                .option-arrow {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Add event listeners to welcome modal elements
    addWelcomeEventListeners() {
        // Load existing project option
        const loadExistingBtn = this.welcomeModal.querySelector('#loadExistingProject');
        if (loadExistingBtn) {
            loadExistingBtn.addEventListener('click', () => {
                console.log('Load existing project clicked');
                this.handleLoadExistingProject();
            });
        }
        
        // Start new project option
        const startNewBtn = this.welcomeModal.querySelector('#startNewProject');
        if (startNewBtn) {
            startNewBtn.addEventListener('click', () => {
                console.log('Start new project clicked');
                this.handleStartNewProject();
            });
        }
        
        // Skip/close button
        const closeBtn = this.welcomeModal.querySelector('#welcomeCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Welcome modal closed');
                this.closeWelcomeModal();
            });
        }
        
        // Close on overlay click
        this.welcomeModal.addEventListener('click', (e) => {
            if (e.target === this.welcomeModal) {
                this.closeWelcomeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.welcomeModal && this.welcomeModal.style.display !== 'none') {
                this.closeWelcomeModal();
            }
        });
    }

    // Handle loading an existing project
    handleLoadExistingProject() {
        try {
            console.log('Initiating load existing project flow');
            
            // Close the welcome modal first
            this.closeWelcomeModal();
            
            // Use the existing loadProject functionality
            if (window.DataManager && window.DataManager.loadProject) {
                window.DataManager.loadProject();
            } else if (window.dataManager && window.dataManager.loadProject) {
                window.dataManager.loadProject();
            } else if (window.loadProject) {
                window.loadProject();
            } else {
                // Fallback implementation
                this.fallbackLoadProject();
            }
            
        } catch (error) {
            console.error('Error handling load existing project:', error);
            this.showErrorMessage('Error loading project. Please try again.');
        }
    }

    // Handle starting a new project
    handleStartNewProject() {
        try {
            console.log('Initiating start new project flow');
            
            // Close the welcome modal
            this.closeWelcomeModal();
            
            // First, clear all cached data to ensure clean slate
            this.clearProjectData();
            
            // Use the standard settings mechanism (same as clicking settings button)
            this.triggerStandardSettings();
            
        } catch (error) {
            console.error('Error handling start new project:', error);
            this.showErrorMessage('Error starting new project. Please try again.');
        }
    }

    // Clear all project data for a fresh start
    clearProjectData() {
        try {
            console.log('Clearing project data for new project');
            
            // Reset project data to initial clean state
            if (window.projectData) {
                window.projectData.projectInfo = {
                    projectName: '',
                    startDate: '',
                    endDate: '',
                    projectManager: '',
                    projectDescription: ''
                };
                window.projectData.internalResources = [];
                window.projectData.vendorCosts = [];
                window.projectData.toolCosts = [];
                window.projectData.miscCosts = [];
                window.projectData.risks = [];
                window.projectData.contingencyPercentage = 10;
                // Keep default rate cards as they are system defaults
            }
            
            // Clear localStorage to ensure no stale data persists
            if (typeof(Storage) !== "undefined" && localStorage) {
                localStorage.removeItem('ictProjectData');
                console.log('Cleared localStorage');
            }
            
            // Clear all form fields immediately
            this.clearAllFormFields();
            
            // Update UI to reflect clean state
            if (window.updateSummary) {
                window.updateSummary();
            }
            if (window.TableRenderer && window.TableRenderer.renderAllTables) {
                window.TableRenderer.renderAllTables();
            }
            
            console.log('Project data cleared successfully');
            
        } catch (error) {
            console.error('Error clearing project data:', error);
        }
    }
    
    // Clear all form fields
    clearAllFormFields() {
        try {
            const formFields = [
                'projectName', 
                'startDate', 
                'endDate', 
                'projectManager', 
                'projectDescription',
                'contingencyPercentage'
            ];
            
            formFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    if (fieldId === 'contingencyPercentage') {
                        field.value = '10'; // Default contingency
                    } else {
                        field.value = '';
                    }
                }
            });
            
            console.log('Form fields cleared');
        } catch (error) {
            console.error('Error clearing form fields:', error);
        }
    }
    
    // Use the standard settings mechanism (same as clicking settings button)
    triggerStandardSettings() {
        try {
            console.log('Triggering standard settings view');
            
            // Use the same mechanism as the settings button
            const settingsBtn = document.getElementById('settingsBtn');
            if (settingsBtn) {
                // Trigger click on settings button to ensure proper initialization
                settingsBtn.click();
                
                // After settings opens, navigate to project-info tab
                setTimeout(() => {
                    this.navigateToProjectInfoTab();
                }, 100); // Small delay to ensure settings is fully loaded
                
            } else {
                // Fallback: try the showSettingsView function directly
                if (window.showSettingsView || typeof showSettingsView === 'function') {
                    if (window.showSettingsView) {
                        window.showSettingsView();
                    } else {
                        showSettingsView();
                    }
                    
                    setTimeout(() => {
                        this.navigateToProjectInfoTab();
                    }, 100);
                    
                } else {
                    console.warn('Could not find settings mechanism - using fallback navigation');
                    this.navigateToProjectSettings(); // Original fallback method
                }
            }
            
        } catch (error) {
            console.error('Error triggering standard settings:', error);
            // Use original navigation as last resort
            this.navigateToProjectSettings();
        }
    }
    
    // Navigate specifically to the project info tab within settings
    navigateToProjectInfoTab() {
        try {
            // Navigate to project-info tab within settings
            const projectInfoTab = document.querySelector('[data-settings-tab="project-info"]');
            if (projectInfoTab) {
                projectInfoTab.click();
                console.log('Navigated to project-info tab');
                
                // Focus on the project name field for user convenience
                setTimeout(() => {
                    const projectNameField = document.getElementById('projectName');
                    if (projectNameField) {
                        projectNameField.focus();
                        projectNameField.select(); // Select text if any exists
                    }
                }, 200);
            } else {
                console.warn('Project info tab not found');
            }
            
        } catch (error) {
            console.error('Error navigating to project info tab:', error);
        }
    }
    // Navigate to project information settings
    navigateToProjectSettings() {
        try {
            // First, check if we're in the settings view or main view
            const mainApp = document.getElementById('mainApp');
            const settingsApp = document.getElementById('settingsApp');
            
            if (mainApp && settingsApp) {
                // Switch to settings view
                mainApp.style.display = 'none';
                settingsApp.style.display = 'block';
                
                // Navigate to project-info tab within settings
                const projectInfoTab = document.querySelector('[data-settings-tab="project-info"]');
                if (projectInfoTab) {
                    projectInfoTab.click();
                }
                
                console.log('Navigated to project settings');
                
                // Focus on the project name field
                setTimeout(() => {
                    const projectNameField = document.getElementById('projectName');
                    if (projectNameField) {
                        projectNameField.focus();
                    }
                }, 300);
                
            } else {
                console.warn('Could not find main app or settings app elements');
                // Fallback: try to trigger settings button
                const settingsBtn = document.getElementById('settingsBtn');
                if (settingsBtn) {
                    settingsBtn.click();
                }
            }
        } catch (error) {
            console.error('Error navigating to project settings:', error);
        }
    }

    // Fallback load project implementation
    fallbackLoadProject() {
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
                        
                        // Update project data
                        if (window.projectData) {
                            Object.assign(window.projectData, data);
                        }
                        
                        // Refresh the UI
                        if (window.updateSummary) window.updateSummary();
                        if (window.TableRenderer && window.TableRenderer.renderAllTables) {
                            window.TableRenderer.renderAllTables();
                        }
                        
                        console.log('Project loaded successfully via fallback');
                        
                    } catch (err) {
                        console.error('Error loading project file:', err);
                        this.showErrorMessage('Error loading project file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // Close the welcome modal
    closeWelcomeModal() {
        if (this.welcomeModal) {
            this.welcomeModal.style.display = 'none';
            console.log('Welcome modal closed');
        }
    }

    // Remove the welcome modal from DOM
    removeWelcomeModal() {
        if (this.welcomeModal) {
            this.welcomeModal.remove();
            this.welcomeModal = null;
        }
    }

    // Show error message
    showErrorMessage(message) {
        if (window.showAlert) {
            window.showAlert(message, 'error');
        } else {
            alert(message);
        }
    }

    // Initialize the welcome functionality
    initialize() {
        if (this.isInitialized) {
            return;
        }
        
        this.isInitialized = true;
        
        // Check and show welcome on initialization
        setTimeout(() => {
            this.checkAndShowWelcome();
        }, 500); // Small delay to ensure DOM is fully loaded
        
        console.log('New Project Welcome feature initialized');
    }

    // Public method to manually trigger welcome popup
    showWelcome() {
        this.showWelcomePopup();
    }

    // Public method to manually trigger for new project button
    handleNewProjectButton() {
        // This can be called when the existing "New Project" button is clicked
        this.showWelcomePopup();
    }
}

// Create and initialize the welcome feature
const newProjectWelcome = new NewProjectWelcome();

// Make it globally available
window.newProjectWelcome = newProjectWelcome;

// Export the main functions for easy access
window.checkAndShowWelcome = () => newProjectWelcome.checkAndShowWelcome();
window.showProjectWelcome = () => newProjectWelcome.showWelcome();
window.handleNewProjectWelcome = () => newProjectWelcome.handleNewProjectButton();

// Auto-initialize when the script loads
console.log('New Project Welcome feature loaded');
