// DOM Manager Module
// Handles all DOM manipulation, event listeners, and modal management
// Issue #134: addInternalResource now handled by Multi Resource Manager

class DOMManager {
    constructor() {
        this.elements = {};
        this.modal = null;
        this.modalContent = null;
        this.modalTitle = null;
        this.modalForm = null;
        this.modalFields = null;
        this.closeModal = null;
        this.cancelModal = null;
    }

    // Initialize all DOM elements
    initializeDOMElements() {
        try {
            // Tab elements
            this.elements.tabButtons = document.querySelectorAll('.tab-btn');
            this.elements.tabContents = document.querySelectorAll('.tab-content');
            
            // Modal elements
            this.modal = document.getElementById('modal');
            this.modalContent = document.querySelector('.modal-content');
            this.modalTitle = document.getElementById('modalTitle');
            this.modalForm = document.getElementById('modalForm');
            this.modalFields = document.getElementById('modalFields');
            this.closeModal = document.querySelector('.close');
            this.cancelModal = document.getElementById('cancelModal');

            console.log('DOM elements initialized');
            return true;
        } catch (error) {
            console.error('Error initializing DOM elements:', error);
            return false;
        }
    }

    // Initialize tab navigation
    initializeTabs() {
        if (!this.elements.tabButtons) {
            console.error('Tab buttons not found');
            return;
        }
        
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    // Switch between tabs
    switchTab(targetTab) {
        try {
            // Update active tab button
            this.elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
            }
            
            // Update active tab content
            this.elements.tabContents.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Trigger tab-specific updates
            if (targetTab === 'summary' && window.updateSummary) {
                window.updateSummary();
            }
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    // Initialize all event listeners
    initializeEventListeners() {
        try {
            this.initializeProjectInfoListeners();
            this.initializeButtonListeners();
            this.initializeModalListeners();
            console.log('Event listeners initialized');
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    // Project info form listeners
    initializeProjectInfoListeners() {
        const projectFields = [
            { id: 'projectName', prop: 'projectName' },
            { id: 'startDate', prop: 'startDate', callback: window.updateMonthHeaders },
            { id: 'endDate', prop: 'endDate', callback: window.updateMonthHeaders },
            { id: 'projectManager', prop: 'projectManager' },
            { id: 'projectDescription', prop: 'projectDescription' }
        ];

        projectFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.addEventListener('input', (e) => {
                    if (window.projectData && window.projectData.projectInfo) {
                        window.projectData.projectInfo[field.prop] = e.target.value;
                    }
                    if (field.callback) field.callback();
                    if (window.updateSummary) window.updateSummary();
                });
            }
        });

        // Contingency percentage
        const contingencyEl = document.getElementById('contingencyPercentage');
        if (contingencyEl) {
            contingencyEl.addEventListener('input', (e) => {
                if (window.projectData) {
                    window.projectData.contingencyPercentage = parseFloat(e.target.value) || 0;
                }
                if (window.updateSummary) window.updateSummary();
            });
        }

        // ADDED for Issue #129: Initialize contingency method radio buttons
        this.initializeContingencyMethodListeners();
    }

    // ADDED for Issue #129: Initialize contingency method radio buttons
    initializeContingencyMethodListeners() {
        console.log('Initializing contingency method listeners...');
        
        const methodRadios = document.querySelectorAll('input[name="contingencyMethod"]');
        
        methodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (window.projectData) {
                    window.projectData.contingencyMethod = e.target.value;
                    console.log(`Contingency method changed to: ${e.target.value}`);
                    
                    // Toggle percentage input visibility
                    if (window.togglePercentageInput) {
                        window.togglePercentageInput();
                    }
                    
                    // Update calculations and display
                    if (window.updateSummary) {
                        window.updateSummary();
                    }
                    
                    // Save to localStorage
                    if (window.dataManager && window.dataManager.saveToLocalStorage) {
                        window.dataManager.saveToLocalStorage();
                    } else if (window.DataManager && window.DataManager.saveToLocalStorage) {
                        window.DataManager.saveToLocalStorage();
                    }
                }
            });
        });
        
        // Set initial state based on projectData
        const currentMethod = window.projectData?.contingencyMethod || 'percentage';
        const radioToCheck = document.getElementById(
            currentMethod === 'percentage' ? 'contingencyMethodPercentage' : 'contingencyMethodRiskBased'
        );
        
        if (radioToCheck) {
            radioToCheck.checked = true;
        }
        
        // Initialize visibility
        if (window.togglePercentageInput) {
            window.togglePercentageInput();
        }
    }

    // Initialize button listeners
    initializeButtonListeners() {
        console.log('Initializing button listeners...');
        
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
            console.log(`Looking for button ${btn.id}:`, element);
            if (element) {
                // Guard to prevent duplicate listener attachment
                if (element.hasAttribute('data-add-listener-attached')) {
                    console.log(`⚠️ Add listener already attached to ${btn.id} - skipping`);
                    return;
                }
                element.addEventListener('click', () => {
                    console.log(`${btn.id} button clicked`);
                    this.openModal(btn.title, btn.type);
                });
                element.setAttribute('data-add-listener-attached', 'true');
                console.log(`Event listener added to ${btn.id}`);
            } else {
                console.warn(`Button ${btn.id} not found in DOM`);
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
        
        console.log('Button listener initialization complete');
    }

    // Initialize modal event listeners
    initializeModalListeners() {
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }
        
        if (this.cancelModal) {
            this.cancelModal.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });

        // ====================================================================
        // FIX for Issue #130: Prevent duplicate form submit listener attachment
        // Only attach the listener if it hasn't been attached already
        // This prevents the duplicate tool cost bug where items were added twice
        // ====================================================================
        if (this.modalForm && !this.modalForm.hasAttribute('data-submit-listener-attached')) {
            this.modalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (window.handleModalSubmit) {
                    window.handleModalSubmit();
                }
            });
            this.modalForm.setAttribute('data-submit-listener-attached', 'true');
            console.log('Modal form submit listener attached by DOM Manager');
        } else if (this.modalForm) {
            console.log('⚠️ Modal form submit listener already attached - skipping (DOM Manager)');
        }
        
        // ====================================================================
        // FIX for Issue #130: Remove duplicate save button listener
        // The form submit handler already handles the save action
        // This backup listener was causing the second submission
        // ====================================================================
        // REMOVED: Modal save button backup - this was causing duplicates
        // The form submit event handler above is sufficient
        /*
        const modalSaveBtn = document.querySelector('.modal-actions .btn-primary');
        if (modalSaveBtn) {
            modalSaveBtn.addEventListener('click', (e) => {
                if (e.target.type === 'submit') return;
                e.preventDefault();
                if (window.handleModalSubmit) {
                    window.handleModalSubmit();
                }
            });
        }
        */
    }

    // Open modal with specified content
    openModal(title, type) {
        try {
            if (!this.modal || !this.modalTitle || !this.modalFields || !this.modalForm) {
                console.error('Modal elements not found');
                return;
            }
            
            this.modalTitle.textContent = title;
            this.modalFields.innerHTML = this.getModalFields(type);
            this.modal.style.display = 'block';
            this.modalForm.setAttribute('data-type', type);
            
            // Handle vendor cost modal - hide standard buttons and attach close handler
            if (type === 'vendorCost') {
                // Hide standard modal buttons
                const standardModalActions = this.modalForm.querySelector('.modal-actions:not(.vendor-cost-actions)');
                if (standardModalActions) {
                    standardModalActions.style.display = 'none';
                }
                const cancelModal = document.getElementById('cancelModal');
                const saveModal = this.modalForm.querySelector('button[type="submit"]:not(#vendorCostSave)');
                if (cancelModal) cancelModal.style.display = 'none';
                if (saveModal) saveModal.style.display = 'none';
                
                // Attach close button handler
                const closeBtn = document.getElementById('vendorCostClose');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.modal.style.display = 'none';
                        // Restore standard buttons for next modal
                        this.restoreStandardModalButtons();
                    });
                }
            }
            
            // Handle tool cost modal - hide standard buttons and attach close handler
            if (type === 'toolCost') {
                // Hide standard modal buttons
                const standardModalActions = this.modalForm.querySelector('.modal-actions:not(.tool-cost-actions)');
                if (standardModalActions) {
                    standardModalActions.style.display = 'none';
                }
                const cancelModal = document.getElementById('cancelModal');
                const saveModal = this.modalForm.querySelector('button[type="submit"]:not(#toolCostSave)');
                if (cancelModal) cancelModal.style.display = 'none';
                if (saveModal) saveModal.style.display = 'none';
                
                // Attach close button handler
                const closeBtn = document.getElementById('toolCostClose');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.modal.style.display = 'none';
                        // Restore standard buttons for next modal
                        this.restoreStandardModalButtons();
                    });
                }
                
                // Attach ongoing checkbox handler to disable/enable end date
                const ongoingCheckbox = document.getElementById('isOngoing');
                const endDateInput = document.getElementById('toolEndDate');
                if (ongoingCheckbox && endDateInput) {
                    ongoingCheckbox.addEventListener('change', () => {
                        endDateInput.disabled = ongoingCheckbox.checked;
                        if (ongoingCheckbox.checked) {
                            endDateInput.value = '';
                            endDateInput.style.backgroundColor = '#f3f4f6';
                        } else {
                            endDateInput.style.backgroundColor = '';
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error opening modal:', error);
        }
    }
    
    // Helper function to restore standard modal buttons
    restoreStandardModalButtons() {
        if (this.modalForm) {
            const standardModalActions = this.modalForm.querySelector('.modal-actions');
            if (standardModalActions) {
                standardModalActions.style.display = '';
            }
            const cancelModal = document.getElementById('cancelModal');
            const saveModal = this.modalForm.querySelector('button[type="submit"]');
            if (cancelModal) cancelModal.style.display = '';
            if (saveModal) saveModal.style.display = '';
        }
    }

    // Generate modal fields based on type
    getModalFields(type) {
        const months = window.calculateProjectMonths ? window.calculateProjectMonths() : 
                      ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
        
        const fields = {
            internalResource: `
                <div class="form-group">
                    <label>Role:</label>
                    <select name="role" class="form-control" required>
                        ${window.projectData?.rateCards?.map(rate => 
                            `<option value="${rate.role}" data-category="${rate.category}">${rate.role} (${rate.category})</option>`
                        ).join('') || ''}
                    </select>
                </div>
                <div class="form-group">
                    <label>${months[0]} Days:</label>
                    <input type="number" name="month1Days" class="form-control" min="0" step="0.5" value="0">
                </div>
                <div class="form-group">
                    <label>${months[1]} Days:</label>
                    <input type="number" name="month2Days" class="form-control" min="0" step="0.5" value="0">
                </div>
                <div class="form-group">
                    <label>${months[2]} Days:</label>
                    <input type="number" name="month3Days" class="form-control" min="0" step="0.5" value="0">
                </div>
                <div class="form-group">
                    <label>${months[3]} Days:</label>
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
                <div class="tool-cost-container" style="max-height: 60vh; overflow-y: auto; padding-right: 0.5rem;">
                    <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.9rem;">
                        Enter tool/software details including billing frequency and duration.
                    </p>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Procurement Type:</label>
                        <select name="procurementType" class="form-control" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="">-- Select Type --</option>
                            <option value="Software License">Software License</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Cloud Services">Cloud Services</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Tool/Software Name:</label>
                        <input type="text" name="tool" class="form-control" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Billing Frequency:</label>
                        <select name="billingFrequency" class="form-control" id="billingFrequency" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="">-- Select Frequency --</option>
                            <option value="one-time">One-time</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Cost Per Period:</label>
                        <input type="number" name="costPerPeriod" class="form-control" id="costPerPeriod" min="0" step="0.01" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                        <small style="color: #6b7280; font-size: 0.8rem;">Enter the cost for one billing period</small>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quantity (Licenses/Units):</label>
                        <input type="number" name="quantity" class="form-control" id="quantity" min="1" step="1" value="1" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Start Date:</label>
                        <input type="date" name="startDate" class="form-control" id="toolStartDate" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;" id="endDateGroup">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">End Date:</label>
                        <input type="date" name="endDate" class="form-control" id="toolEndDate" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" name="isOngoing" id="isOngoing" style="width: auto; margin: 0;">
                            <span style="font-weight: 500;">Ongoing (no end date)</span>
                        </label>
                    </div>
                </div>
                <div class="tool-cost-actions" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <button type="button" id="toolCostClose" style="background-color: #6b7280; color: white; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Close</button>
                    <button type="submit" id="toolCostSave" style="background-color: #6366f1; color: white; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Save</button>
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

    // Update month headers across the application
    updateMonthHeaders() {
        const months = window.calculateProjectMonths ? window.calculateProjectMonths() : 
                      ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
        
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

    // Show alert messages
    showAlert(message, type) {
        try {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            
            const content = document.querySelector('.content');
            if (content) {
                content.insertBefore(alert, content.firstChild);
                
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 5000);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        } catch (error) {
            console.error('Error showing alert:', error);
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Settings functionality
    openSettings() {
        try {
            console.log('Opening settings page...');
            
            // Create settings overlay
            this.createSettingsOverlay();
            
            // Show settings overlay
            const settingsOverlay = document.getElementById('settingsOverlay');
            if (settingsOverlay) {
                settingsOverlay.style.display = 'flex';
                // Default to project info section
                this.switchSettingsSection('project-info');
            }
            
        } catch (error) {
            console.error('Error opening settings:', error);
        }
    }

    createSettingsOverlay() {
        // Remove existing overlay if present
        const existingOverlay = document.getElementById('settingsOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'settingsOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const settingsContainer = document.createElement('div');
        settingsContainer.style.cssText = `
            background: white;
            width: 90%;
            max-width: 1200px;
            height: 80%;
            border-radius: 8px;
            display: flex;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        `;

        const sidebar = document.createElement('div');
        sidebar.style.cssText = `
            width: 250px;
            background: #f8f9fa;
            border-right: 1px solid #dee2e6;
            padding: 20px 0;
            overflow-y: auto;
        `;

        const mainContent = document.createElement('div');
        mainContent.style.cssText = `
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            position: relative;
        `;

        // Close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6c757d;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeButton.addEventListener('click', () => this.closeSettings());

        // Sidebar navigation
        sidebar.innerHTML = `
            <h3 style="padding: 0 20px; margin-bottom: 20px; color: #495057;">Settings</h3>
            <div class="settings-nav">
                <div class="settings-nav-item" data-section="project-info">
                    <span>📋</span> Project Info
                </div>
                <div class="settings-nav-item" data-section="rate-cards">
                    <span>💰</span> Rate Cards
                </div>
                <div class="settings-nav-item" data-section="exchange-rates">
                    <span>💱</span> Exchange Rates
                </div>
            </div>
        `;

        // Main content area
        mainContent.innerHTML = `
            <div id="settings-content">
                <!-- Content will be populated by switchSettingsSection -->
            </div>
        `;

        // Add CSS for navigation items
        const style = document.createElement('style');
        style.textContent = `
            .settings-nav-item {
                padding: 12px 20px;
                cursor: pointer;
                border-bottom: 1px solid #e9ecef;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .settings-nav-item:hover {
                background-color: #e9ecef;
            }
            .settings-nav-item.active {
                background-color: #007bff;
                color: white;
            }
            .settings-section {
                display: none;
            }
            .settings-section.active {
                display: block;
            }
            .settings-form-group {
                margin-bottom: 20px;
            }
            .settings-form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #495057;
            }
            .settings-form-control {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
            }
            .settings-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .settings-table th,
            .settings-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            .settings-table th {
                background-color: #f8f9fa;
                font-weight: 500;
            }
            .settings-btn {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .settings-btn:hover {
                background-color: #0056b3;
            }
            .settings-btn-danger {
                background-color: #dc3545;
            }
            .settings-btn-danger:hover {
                background-color: #c82333;
            }
        `;

        mainContent.appendChild(closeButton);
        settingsContainer.appendChild(sidebar);
        settingsContainer.appendChild(mainContent);
        overlay.appendChild(settingsContainer);
        document.head.appendChild(style);
        document.body.appendChild(overlay);

        // Add click listeners to navigation items
        const navItems = sidebar.querySelectorAll('.settings-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.switchSettingsSection(section);
            });
        });
    }

    switchSettingsSection(section) {
        console.log('Switching to settings section:', section);

        // Update navigation active state
        const navItems = document.querySelectorAll('.settings-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === section) {
                item.classList.add('active');
            }
        });

        // Update content
        const contentArea = document.getElementById('settings-content');
        if (contentArea) {
            switch (section) {
                case 'project-info':
                    contentArea.innerHTML = this.getProjectInfoSettings();
                    this.bindProjectInfoEvents();
                    break;
                case 'rate-cards':
                    contentArea.innerHTML = this.getRateCardsSettings();
                    this.bindRateCardEvents();
                    break;
                case 'exchange-rates':
                    contentArea.innerHTML = this.getExchangeRatesSettings();
                    break;
                default:
                    contentArea.innerHTML = '<p>Section not found</p>';
            }
        }
    }

    getProjectInfoSettings() {
        const projectData = window.projectData || {};
        const projectInfo = projectData.projectInfo || {};

        return `
            <h2>Project Information</h2>
            <form id="settingsProjectForm">
                <div class="settings-form-group">
                    <label for="settingsProjectName">Project Name:</label>
                    <input type="text" id="settingsProjectName" class="settings-form-control" 
                           value="${projectInfo.projectName || ''}" />
                </div>
                <div class="settings-form-group">
                    <label for="settingsStartDate">Start Date:</label>
                    <input type="date" id="settingsStartDate" class="settings-form-control" 
                           value="${projectInfo.startDate || ''}" />
                </div>
                <div class="settings-form-group">
                    <label for="settingsEndDate">End Date:</label>
                    <input type="date" id="settingsEndDate" class="settings-form-control" 
                           value="${projectInfo.endDate || ''}" />
                </div>
                <div class="settings-form-group">
                    <label for="settingsProjectManager">Project Manager:</label>
                    <input type="text" id="settingsProjectManager" class="settings-form-control" 
                           value="${projectInfo.projectManager || ''}" />
                </div>
                <div class="settings-form-group">
                    <label for="settingsProjectDescription">Project Description:</label>
                    <textarea id="settingsProjectDescription" class="settings-form-control" 
                              rows="3">${projectInfo.projectDescription || ''}</textarea>
                </div>
                <div class="settings-form-group">
                    <label for="settingsContingency">Contingency Percentage:</label>
                    <input type="number" id="settingsContingency" class="settings-form-control" 
                           value="${projectData.contingencyPercentage || 10}" min="0" max="100" />
                </div>
                <button type="submit" class="settings-btn">Save Project Info</button>
            </form>
        `;
    }

    getRateCardsSettings() {
        const projectData = window.projectData || {};
        const rateCards = projectData.rateCards || [];

        let tableRows = '';
        rateCards.forEach(rate => {
            tableRows += `
                <tr>
                    <td>${rate.role}</td>
                    <td><span class="category-badge category-${rate.category.toLowerCase()}">${rate.category}</span></td>
                    <td>${rate.rate.toLocaleString()}</td>
                    <td>
                        <button class="settings-btn settings-btn-danger" onclick="deleteItem('rateCards', ${rate.id || `'${rate.role}'`})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        return `
            <h2>Rate Cards Management</h2>
            <div style="margin-bottom: 20px;">
                <button class="settings-btn" id="addNewRateCard">Add New Rate Card</button>
            </div>
            
            <table class="settings-table">
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>Category</th>
                        <th>Daily Rate</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows || '<tr><td colspan="4">No rate cards available</td></tr>'}
                </tbody>
            </table>
        `;
    }

    getExchangeRatesSettings() {
        return `
            <h2>Exchange Rates</h2>
            <div style="padding: 40px; text-align: center; color: #6c757d;">
                <p>Exchange rate functionality will be implemented in a future update.</p>
                <p>This will allow you to convert project costs between different currencies.</p>
            </div>
        `;
    }

    bindProjectInfoEvents() {
        const form = document.getElementById('settingsProjectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProjectInfo();
            });
        }
    }

    bindRateCardEvents() {
        const addButton = document.getElementById('addNewRateCard');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.closeSettings();
                this.openModal('Add Rate Card', 'rateCard');
            });
        }
    }

    saveProjectInfo() {
        try {
            const projectData = window.projectData || {};
            if (!projectData.projectInfo) {
                projectData.projectInfo = {};
            }

            // Get form values
            projectData.projectInfo.projectName = document.getElementById('settingsProjectName').value;
            projectData.projectInfo.startDate = document.getElementById('settingsStartDate').value;
            projectData.projectInfo.endDate = document.getElementById('settingsEndDate').value;
            projectData.projectInfo.projectManager = document.getElementById('settingsProjectManager').value;
            projectData.projectInfo.projectDescription = document.getElementById('settingsProjectDescription').value;
            projectData.contingencyPercentage = parseFloat(document.getElementById('settingsContingency').value) || 10;

            // Update the main form fields
            const mainFormFields = {
                projectName: projectData.projectInfo.projectName,
                startDate: projectData.projectInfo.startDate,
                endDate: projectData.projectInfo.endDate,
                projectManager: projectData.projectInfo.projectManager,
                projectDescription: projectData.projectInfo.projectDescription,
                contingencyPercentage: projectData.contingencyPercentage
            };

            Object.keys(mainFormFields).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = mainFormFields[id];
                }
            });

            // Trigger updates
            if (window.updateSummary) {
                window.updateSummary();
            }
            this.updateMonthHeaders();

            this.showAlert('Project information saved successfully!', 'success');
            console.log('Project info saved:', projectData.projectInfo);

        } catch (error) {
            console.error('Error saving project info:', error);
            this.showAlert('Error saving project information: ' + error.message, 'error');
        }
    }

    closeSettings() {
        const settingsOverlay = document.getElementById('settingsOverlay');
        if (settingsOverlay) {
            settingsOverlay.style.display = 'none';
        }
    }

    // Initialize the DOM Manager - ADDED to call all initialization methods
    initialize() {
        console.log('DOM Manager initialize() called');
        this.initializeDOMElements();
        this.initializeTabs();
        this.initializeEventListeners();
        console.log('✓ DOM Manager fully initialized with all event listeners');
    }
}

// Create and export DOM manager instance
window.domManager = new DOMManager();

// Export functions that need to be globally accessible
window.updateMonthHeaders = () => window.domManager.updateMonthHeaders();
window.showAlert = (message, type) => window.domManager.showAlert(message, type);
window.openModal = (title, type) => window.domManager.openModal(title, type);
window.switchTab = (targetTab) => window.domManager.switchTab(targetTab);
