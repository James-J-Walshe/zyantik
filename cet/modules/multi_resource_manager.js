/**
 * Multi Resource Manager Module
 * Handles adding multiple internal resources at once
 * 
 * GitHub Issue: #134 - Change the Add Resource Process
 * 
 * Flow:
 * 1. User clicks "Add Resource" button on Internal Resources tab
 * 2. Modal opens with single role dropdown
 * 3. User selects a role → "Add Resource" button becomes enabled
 * 4. User clicks "Add Resource" → New dropdown appears, button disables
 * 5. Repeat steps 3-4 to add multiple roles
 * 6. User clicks "Save" → All selected roles added with 0 hours, returns to tab
 * 7. User clicks "Close" → Returns to tab without adding anything
 */

class MultiResourceManager {
    constructor() {
        this.initialized = false;
        this.pendingResources = [];  // Roles selected but not yet saved
        this.dropdownCount = 0;      // Track number of dropdowns rendered
        console.log('Multi Resource Manager loaded');
    }

    /**
     * Initialize the manager - called by init_manager.js
     */
    initialize() {
        if (this.initialized) {
            console.log('⚠️ Multi Resource Manager already initialized - skipping');
            return;
        }

        this.attachEventListeners();
        this.initialized = true;
        console.log('✓ Multi Resource Manager initialized');
    }

    /**
     * Attach event listener to Add Resource button with guard pattern
     */
    attachEventListeners() {
        const addResourceBtn = document.getElementById('addInternalResource');
        
        if (!addResourceBtn) {
            console.warn('addInternalResource button not found');
            return;
        }

        // Guard pattern to prevent duplicate listeners
        if (addResourceBtn.hasAttribute('data-multi-resource-listener-attached')) {
            console.log('⚠️ Multi-resource listener already attached to addInternalResource - skipping');
            return;
        }

        // Remove any existing listeners by cloning the button
        const newBtn = addResourceBtn.cloneNode(true);
        addResourceBtn.parentNode.replaceChild(newBtn, addResourceBtn);

        // Attach our listener to the new button
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openMultiResourceModal();
        });

        // Mark as attached
        newBtn.setAttribute('data-multi-resource-listener-attached', 'true');
        console.log('Event listener added to addInternalResource (Multi Resource Manager)');
    }

    /**
     * Open the multi-resource modal
     */
    openMultiResourceModal() {
        console.log('Opening multi-resource modal...');
        
        // Reset state
        this.pendingResources = [];
        this.dropdownCount = 0;

        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalFields = document.getElementById('modalFields');
        const modalForm = document.getElementById('modalForm');

        if (!modal || !modalTitle || !modalFields || !modalForm) {
            console.error('Modal elements not found');
            return;
        }

        // Set modal title
        modalTitle.textContent = 'Add Resources';

        // Generate modal content
        modalFields.innerHTML = this.generateModalContent();

        // Set form type for identification
        modalForm.setAttribute('data-type', 'multiResource');

        // Hide the standard modal action buttons (Save/Cancel at bottom)
        const standardModalActions = modalForm.querySelector('.modal-actions:not(.multi-resource-actions)');
        if (standardModalActions) {
            standardModalActions.style.display = 'none';
        }
        
        // Also try to hide by ID if they exist
        const cancelModal = document.getElementById('cancelModal');
        const saveModal = modalForm.querySelector('button[type="submit"]');
        if (cancelModal) cancelModal.style.display = 'none';
        if (saveModal) saveModal.style.display = 'none';

        // Attach event listeners for this modal instance
        this.attachModalEventListeners();

        // Show modal
        modal.style.display = 'block';

        console.log('Multi-resource modal opened');
    }

    /**
     * Generate the modal HTML content
     */
    generateModalContent() {
        const rateCards = window.projectData?.rateCards || [];
        
        if (rateCards.length === 0) {
            return `
                <div class="multi-resource-container">
                    <div class="alert alert-info" style="margin-bottom: 1rem; padding: 1rem; background: #dbeafe; border-radius: 6px; color: #1e40af;">
                        <strong>No Rate Cards Available</strong><br>
                        Please add rate cards in Settings before adding resources.
                    </div>
                </div>
                <div class="multi-resource-actions" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <button type="button" class="btn btn-secondary" id="multiResourceClose" style="background-color: #6b7280; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer;">Close</button>
                </div>
            `;
        }

        // Generate first dropdown
        this.dropdownCount = 1;
        
        return `
            <div class="multi-resource-container" id="multiResourceContainer">
                <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.9rem;">
                    Select roles to add. Resources will be created with 0 hours - you can edit effort estimates after saving.
                </p>
                
                <div id="roleDropdownsContainer">
                    ${this.generateRoleDropdown(1)}
                </div>
                
                <div id="addAnotherContainer" style="margin-top: 1rem;">
                    <button type="button" class="btn btn-outline" id="addAnotherResource" disabled style="background-color: transparent; color: #6366f1; padding: 0.5rem 1rem; border: 1px solid #6366f1; border-radius: 6px; cursor: pointer; opacity: 0.5;">
                        + Add Another Role
                    </button>
                </div>
            </div>
            
            <div class="multi-resource-actions" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                <button type="button" id="multiResourceClose" style="background-color: #6b7280; color: white; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Close</button>
                <button type="button" id="multiResourceSave" style="background-color: #6366f1; color: white; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Save</button>
            </div>
        `;
    }

    /**
     * Generate a single role dropdown
     */
    generateRoleDropdown(index) {
        const rateCards = window.projectData?.rateCards || [];
        
        const options = rateCards.map(rate => 
            `<option value="${rate.role}" data-rate="${rate.rate}" data-category="${rate.category}">${rate.role} (${rate.category})</option>`
        ).join('');

        return `
            <div class="form-group role-dropdown-group" data-dropdown-index="${index}" style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Role ${index > 1 ? index : ''}:</label>
                <select name="role_${index}" class="form-control role-select" data-index="${index}" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                    <option value="">Select Role...</option>
                    ${options}
                </select>
            </div>
        `;
    }

    /**
     * Attach event listeners within the modal
     */
    attachModalEventListeners() {
        // Add Another Resource button
        const addAnotherBtn = document.getElementById('addAnotherResource');
        if (addAnotherBtn) {
            addAnotherBtn.addEventListener('click', () => this.addAnotherDropdown());
        }

        // Save button
        const saveBtn = document.getElementById('multiResourceSave');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveResources());
        }

        // Close button
        const closeBtn = document.getElementById('multiResourceClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Attach change listener to the first dropdown
        this.attachDropdownChangeListener(1);

        // Override the default form submit to prevent standard handling
        const modalForm = document.getElementById('modalForm');
        if (modalForm) {
            const submitHandler = (e) => {
                if (modalForm.getAttribute('data-type') === 'multiResource') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.saveResources();
                }
            };
            
            // Remove old submit handlers and add new one
            modalForm.removeEventListener('submit', submitHandler);
            modalForm.addEventListener('submit', submitHandler);
        }
    }

    /**
     * Attach change listener to a role dropdown
     */
    attachDropdownChangeListener(index) {
        const dropdown = document.querySelector(`select[data-index="${index}"]`);
        if (dropdown) {
            dropdown.addEventListener('change', () => this.onDropdownChange());
        }
    }

    /**
     * Handle dropdown change - update Add Resource button state
     */
    onDropdownChange() {
        const addAnotherBtn = document.getElementById('addAnotherResource');
        if (!addAnotherBtn) return;

        // Check if all dropdowns have selections
        const allDropdowns = document.querySelectorAll('.role-select');
        let allSelected = true;

        allDropdowns.forEach(dropdown => {
            if (!dropdown.value) {
                allSelected = false;
            }
        });

        // Enable/disable the Add Resource button and update styling
        addAnotherBtn.disabled = !allSelected;
        addAnotherBtn.style.opacity = allSelected ? '1' : '0.5';
        addAnotherBtn.style.cursor = allSelected ? 'pointer' : 'not-allowed';
        
        console.log(`Dropdown change - All selected: ${allSelected}`);
    }

    /**
     * Add another role dropdown to the form
     */
    addAnotherDropdown() {
        const container = document.getElementById('roleDropdownsContainer');
        if (!container) return;

        this.dropdownCount++;
        
        // Create new dropdown element
        const newDropdownHTML = this.generateRoleDropdown(this.dropdownCount);
        container.insertAdjacentHTML('beforeend', newDropdownHTML);

        // Attach change listener to new dropdown
        this.attachDropdownChangeListener(this.dropdownCount);

        // Disable Add Resource button until new dropdown has selection
        const addAnotherBtn = document.getElementById('addAnotherResource');
        if (addAnotherBtn) {
            addAnotherBtn.disabled = true;
        }

        // Focus on new dropdown
        const newDropdown = document.querySelector(`select[data-index="${this.dropdownCount}"]`);
        if (newDropdown) {
            newDropdown.focus();
        }

        console.log(`Added dropdown ${this.dropdownCount}`);
    }

    /**
     * Save all selected resources
     */
    saveResources() {
        console.log('Saving resources...');

        // Collect all selected roles
        const allDropdowns = document.querySelectorAll('.role-select');
        const selectedRoles = [];

        allDropdowns.forEach(dropdown => {
            if (dropdown.value) {
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                selectedRoles.push({
                    role: dropdown.value,
                    rate: parseFloat(selectedOption.dataset.rate) || 0,
                    category: selectedOption.dataset.category || 'Internal'
                });
            }
        });

        if (selectedRoles.length === 0) {
            console.log('No roles selected - nothing to save');
            this.closeModal();
            return;
        }

        // Get project month information for setting up 0 hours
        const monthInfo = window.tableRenderer?.calculateProjectMonths() || { count: 12, monthKeys: [] };
        
        // Add each selected role to internal resources
        selectedRoles.forEach((roleData, index) => {
            const newResource = {
                id: Date.now() + index,  // Unique ID for each
                role: roleData.role,
                rateCard: roleData.category,
                dailyRate: roleData.rate
            };

            // Initialize all months with 0 days
            for (let i = 1; i <= monthInfo.count; i++) {
                newResource[`month${i}Days`] = 0;
            }

            // Also set legacy quarter fields for backward compatibility
            newResource.q1Days = 0;
            newResource.q2Days = 0;
            newResource.q3Days = 0;
            newResource.q4Days = 0;

            // Add to project data
            if (!window.projectData.internalResources) {
                window.projectData.internalResources = [];
            }
            window.projectData.internalResources.push(newResource);

            console.log(`Added resource: ${roleData.role} (${roleData.category}) @ ${roleData.rate}/day`);
        });

        // Re-render tables
        if (window.TableRenderer) {
            window.TableRenderer.renderAllTables();
        } else if (window.tableRenderer) {
            window.tableRenderer.renderAllTables();
        }

        // Update summary
        if (window.updateSummary) {
            window.updateSummary();
        }

        // Save to localStorage
        if (window.dataManager?.saveToLocalStorage) {
            window.dataManager.saveToLocalStorage();
        } else if (typeof saveToLocalStorage === 'function') {
            saveToLocalStorage();
        }

        // Show success message
        const message = selectedRoles.length === 1 
            ? `Added 1 resource: ${selectedRoles[0].role}`
            : `Added ${selectedRoles.length} resources`;
        
        this.showAlert(message, 'success');

        console.log(`✓ Saved ${selectedRoles.length} resources`);

        // Close modal
        this.closeModal();
    }

    /**
     * Close the modal without saving
     */
    closeModal() {
        const modal = document.getElementById('modal');
        const modalForm = document.getElementById('modalForm');
        
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Restore the standard modal action buttons for next use
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
        
        // Reset state
        this.pendingResources = [];
        this.dropdownCount = 0;

        console.log('Multi-resource modal closed');
    }

    /**
     * Show an alert message
     */
    showAlert(message, type = 'info') {
        // Use existing alert mechanism if available
        if (window.dataManager?.showAlert) {
            window.dataManager.showAlert(message, type);
            return;
        }

        // Fallback: create temporary alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        if (type === 'success') {
            alertDiv.style.backgroundColor = '#d1fae5';
            alertDiv.style.color = '#065f46';
            alertDiv.style.border = '1px solid #a7f3d0';
        } else if (type === 'error') {
            alertDiv.style.backgroundColor = '#fee2e2';
            alertDiv.style.color = '#991b1b';
            alertDiv.style.border = '1px solid #fca5a5';
        } else {
            alertDiv.style.backgroundColor = '#dbeafe';
            alertDiv.style.color = '#1e40af';
            alertDiv.style.border = '1px solid #93c5fd';
        }

        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
}

// Export to window for global access
window.multiResourceManager = new MultiResourceManager();
