/**
 * Edit Manager Module
 * Handles inline editing functionality for all data types with dynamic month support
 */

class EditManager {
    constructor() {
        this.editingStates = new Map(); // Track what's being edited
        this.originalValues = new Map(); // Store original values for cancellation
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for edit button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const button = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
                this.handleEditClick(button);
            }
            
            if (e.target.classList.contains('save-edit-btn') || e.target.closest('.save-edit-btn')) {
                e.preventDefault();
                const button = e.target.classList.contains('save-edit-btn') ? e.target : e.target.closest('.save-edit-btn');
                this.handleSaveEdit(button);
            }
            
            if (e.target.classList.contains('cancel-edit-btn') || e.target.closest('.cancel-edit-btn')) {
                e.preventDefault();
                const button = e.target.classList.contains('cancel-edit-btn') ? e.target : e.target.closest('.cancel-edit-btn');
                this.handleCancelEdit(button);
            }
        });

        // Handle Enter key to save, Escape to cancel
        document.addEventListener('keydown', (e) => {
            const editingElement = document.querySelector('.editing');
            if (!editingElement) return;

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const saveBtn = editingElement.querySelector('.save-edit-btn');
                if (saveBtn) this.handleSaveEdit(saveBtn);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                const cancelBtn = editingElement.querySelector('.cancel-edit-btn');
                if (cancelBtn) this.handleCancelEdit(cancelBtn);
            }
        });
    }

    /**
     * Creates edit button HTML
     * @param {string} itemId - Unique identifier for the item
     * @param {string} itemType - Type of item (internal-resource, vendor-cost, etc.)
     */
    createEditButton(itemId, itemType) {
        return `<button class="edit-btn icon-btn" data-id="${itemId}" data-type="${itemType}" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </button>`;
    }

    /**
     * Handle edit button click
     */
    handleEditClick(button) {
        const itemId = button.dataset.id;
        const itemType = button.dataset.type;
        const row = button.closest('tr') || button.closest('.item-row');
        
        if (!row) return;

        // Prevent multiple simultaneous edits
        if (this.editingStates.has(itemId)) {
            return;
        }

        this.startEditing(row, itemId, itemType);
    }

    /**
     * Convert row to edit mode with dynamic month support
     */
    startEditing(row, itemId, itemType) {
        row.classList.add('editing');
        this.editingStates.set(itemId, { type: itemType, row: row });

        // Store original values
        const originalData = this.extractRowData(row, itemType);
        this.originalValues.set(itemId, originalData);

        // Convert cells to edit inputs
        this.convertToEditInputs(row, itemType, originalData);

        // Replace edit button with save/cancel buttons
        const editBtn = row.querySelector('.edit-btn');
        const actionCell = editBtn.closest('td') || editBtn.closest('.action-cell');
        
        // Ensure proper button structure and event handling
        actionCell.innerHTML = `
            <div class="action-buttons">
                <button type="button" class="save-edit-btn icon-btn success" data-id="${itemId}" title="Save Changes">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                </button>
                <button type="button" class="cancel-edit-btn icon-btn secondary" data-id="${itemId}" title="Cancel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
                ${row.querySelector('.delete-btn')?.outerHTML || ''}
            </div>
        `;
        
        // Ensure buttons are clickable
        const saveBtn = actionCell.querySelector('.save-edit-btn');
        const cancelBtn = actionCell.querySelector('.cancel-edit-btn');
        
        if (saveBtn) {
            saveBtn.style.pointerEvents = 'auto';
            saveBtn.style.zIndex = '1000';
        }
        if (cancelBtn) {
            cancelBtn.style.pointerEvents = 'auto';
            cancelBtn.style.zIndex = '1000';
        }
    }

    /**
     * Extract data from row based on item type with dynamic month support
     */
    extractRowData(row, itemType) {
        const data = {};
        const cells = row.querySelectorAll('td');
        
        // Get month info for dynamic extraction
        const monthInfo = window.dynamicFormHelper ? 
            window.dynamicFormHelper.calculateProjectMonths() : 
            { monthKeys: ['month1', 'month2', 'month3', 'month4'], count: 4 };
        
        switch (itemType) {
            case 'internal-resource':
                data.role = cells[0]?.textContent?.trim() || '';
                data.rateCard = cells[1]?.textContent?.trim() || '';
                data.dailyRate = parseFloat(cells[2]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                
                // Extract dynamic month data
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 3 + index; // Start from 4th cell (index 3)
                    const fieldName = monthKey + 'Days';
                    data[fieldName] = parseFloat(cells[cellIndex]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                });
                break;
                
            case 'vendor-cost':
                data.vendor = cells[0]?.textContent?.trim() || '';
                data.category = cells[1]?.textContent?.trim() || '';
                data.description = cells[2]?.textContent?.trim() || '';
                
                // Extract dynamic month data
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 3 + index; // Start from 4th cell (index 3)
                    const fieldName = monthKey + 'Cost';
                    data[fieldName] = parseFloat(cells[cellIndex]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                });
                break;
                
            case 'tool-cost':
                data.tool = cells[0]?.textContent?.trim() || '';
                data.licenseType = cells[1]?.textContent?.trim() || '';
                data.monthlyCost = parseFloat(cells[2]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                data.users = parseFloat(cells[3]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                data.duration = parseFloat(cells[4]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                break;
                
            case 'misc-cost':
                data.category = cells[0]?.textContent?.trim() || '';
                data.item = cells[1]?.textContent?.trim() || '';
                data.description = cells[2]?.textContent?.trim() || '';
                data.cost = parseFloat(cells[3]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                break;
                
            case 'risk':
                data.description = cells[0]?.textContent?.trim() || '';
                data.probability = cells[1]?.textContent?.trim() || '';
                data.impact = cells[2]?.textContent?.trim() || '';
                data.mitigationCost = parseFloat(cells[4]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                break;
        }
        
        return data;
    }

    /**
     * Convert row cells to input fields with dynamic month support
     */
    convertToEditInputs(row, itemType, data) {
        const cells = row.querySelectorAll('td:not(:last-child)'); // Exclude action column
        
        // Get month info for dynamic input creation
        const monthInfo = window.dynamicFormHelper ? 
            window.dynamicFormHelper.calculateProjectMonths() : 
            { monthKeys: ['month1', 'month2', 'month3', 'month4'], count: 4 };
        
        switch (itemType) {
            case 'internal-resource':
                cells[0].innerHTML = `<select class="edit-input" data-field="role" onchange="updateRateFromRole(this)">
                    ${this.getRoleOptions(data.role)}
                </select>`;
                cells[1].innerHTML = `<input type="text" class="edit-input" value="${data.rateCard}" data-field="rateCard" readonly>`;
                cells[2].innerHTML = `<input type="number" class="edit-input" value="${data.dailyRate}" data-field="dailyRate" step="0.01" min="0">`;
                
                // Create dynamic month inputs
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 3 + index;
                    if (cells[cellIndex]) {
                        const fieldName = monthKey + 'Days';
                        const value = data[fieldName] || 0;
                        cells[cellIndex].innerHTML = `<input type="number" class="edit-input month-input" value="${value}" data-field="${fieldName}" step="0.5" min="0">`;
                    }
                });
                break;
                
            case 'vendor-cost':
                cells[0].innerHTML = `<input type="text" class="edit-input" value="${data.vendor}" data-field="vendor">`;
                cells[1].innerHTML = `<select class="edit-input" data-field="category">
                    ${this.getVendorCategoryOptions(data.category)}
                </select>`;
                cells[2].innerHTML = `<input type="text" class="edit-input" value="${data.description}" data-field="description">`;
                
                // Create dynamic month inputs
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 3 + index;
                    if (cells[cellIndex]) {
                        const fieldName = monthKey + 'Cost';
                        const value = data[fieldName] || 0;
                        cells[cellIndex].innerHTML = `<input type="number" class="edit-input month-input" value="${value}" data-field="${fieldName}" step="0.01" min="0">`;
                    }
                });
                break;
                
            case 'tool-cost':
                cells[0].innerHTML = `<input type="text" class="edit-input" value="${data.tool}" data-field="tool">`;
                cells[1].innerHTML = `<select class="edit-input" data-field="licenseType">
                    ${this.getToolLicenseOptions(data.licenseType)}
                </select>`;
                cells[2].innerHTML = `<input type="number" class="edit-input" value="${data.monthlyCost}" data-field="monthlyCost" step="0.01" min="0">`;
                cells[3].innerHTML = `<input type="number" class="edit-input" value="${data.users}" data-field="users" step="1" min="1">`;
                cells[4].innerHTML = `<input type="number" class="edit-input" value="${data.duration}" data-field="duration" step="1" min="1">`;
                break;
                
            case 'misc-cost':
                cells[0].innerHTML = `<select class="edit-input" data-field="category">
                    ${this.getMiscCategoryOptions(data.category)}
                </select>`;
                cells[1].innerHTML = `<input type="text" class="edit-input" value="${data.item}" data-field="item">`;
                cells[2].innerHTML = `<input type="text" class="edit-input" value="${data.description}" data-field="description">`;
                cells[3].innerHTML = `<input type="number" class="edit-input" value="${data.cost}" data-field="cost" step="0.01" min="0">`;
                break;
                
            case 'risk':
                cells[0].innerHTML = `<textarea class="edit-input" data-field="description" rows="2">${data.description}</textarea>`;
                cells[1].innerHTML = `<select class="edit-input" data-field="probability">
                    ${this.getProbabilityOptions(data.probability)}
                </select>`;
                cells[2].innerHTML = `<select class="edit-input" data-field="impact">
                    ${this.getImpactOptions(data.impact)}
                </select>`;
                cells[4].innerHTML = `<input type="number" class="edit-input" value="${data.mitigationCost}" data-field="mitigationCost" step="0.01" min="0">`;
                break;
        }

        // Focus first input
        const firstInput = row.querySelector('.edit-input');
        if (firstInput) {
            firstInput.focus();
            firstInput.select();
        }
    }

    /**
     * Handle save edit with dynamic month support
     */
    handleSaveEdit(button) {
        console.log('Save button clicked', button);
        
        const itemId = button.dataset.id || button.getAttribute('data-id');
        const editState = this.editingStates.get(itemId);
        
        if (!editState) {
            console.error('No edit state found for item:', itemId);
            return;
        }

        const row = editState.row;
        row.classList.add('saving');
        
        try {
            const newData = this.extractEditData(row, editState.type);
            
            // Validate data
            if (!this.validateEditData(newData, editState.type)) {
                alert('Please check your inputs. Some fields are invalid.');
                row.classList.remove('saving');
                return;
            }

            // Add ID to data
            newData.id = itemId;

            console.log('Saving data:', newData);

            // Update the data in your main data structure
            this.updateItemData(itemId, newData, editState.type);
            
            // Convert back to display mode
            this.finishEditing(itemId, newData, editState.type);
            
            // Re-render tables to ensure consistency
            if (window.tableRenderer) {
                window.tableRenderer.renderAllTables();
            }
            
            // Recalculate totals
            if (window.updateAllCalculations) {
                window.updateAllCalculations();
            }
            
            // Save data
            if (window.saveProjectData) {
                window.saveProjectData();
            }
            
            console.log('Save completed successfully');
            
        } catch (error) {
            console.error('Error saving edit:', error);
            alert('Error saving changes: ' + error.message);
        } finally {
            row.classList.remove('saving');
        }
    }

    /**
     * Handle cancel edit
     */
    handleCancelEdit(button) {
        console.log('Cancel button clicked', button);
        
        const itemId = button.dataset.id || button.getAttribute('data-id');
        const editState = this.editingStates.get(itemId);
        const originalData = this.originalValues.get(itemId);
        
        if (!editState) {
            console.error('No edit state found for item:', itemId);
            return;
        }
        
        if (!originalData) {
            console.error('No original data found for item:', itemId);
            return;
        }
        
        this.finishEditing(itemId, originalData, editState.type);
        
        // Re-render tables to restore original values
        if (window.tableRenderer) {
            window.tableRenderer.renderAllTables();
        }
        
        console.log('Cancel completed successfully');
    }

    /**
     * Extract data from edit inputs with dynamic month support
     */
    extractEditData(row, itemType) {
        const inputs = row.querySelectorAll('.edit-input');
        const data = {};
        
        inputs.forEach(input => {
            const field = input.dataset.field;
            let value;
            
            if (input.type === 'number') {
                value = parseFloat(input.value) || 0;
            } else {
                value = input.value.trim();
            }
            
            data[field] = value;
        });
        
        return data;
    }

    /**
     * Validate edit data
     */
    validateEditData(data, itemType) {
        switch (itemType) {
            case 'internal-resource':
                return data.role && data.dailyRate >= 0;
            case 'vendor-cost':
                return data.vendor && data.description;
            case 'tool-cost':
                return data.tool && data.monthlyCost >= 0 && data.users >= 1 && data.duration >= 1;
            case 'misc-cost':
                return data.item && data.cost >= 0;
            case 'risk':
                return data.description && data.probability && data.impact;
        }
        return true;
    }

    /**
     * Update item data in main data structure using existing function
     */
    updateItemData(itemId, newData, itemType) {
        console.log('Updating item:', itemId, newData, itemType);
        
        // Use the existing updateItemById function from table_renderer.js
        if (window.updateItemById) {
            window.updateItemById(itemId, newData, itemType);
        } else {
            console.error('updateItemById function not available');
        }
    }

    /**
     * Finish editing and restore display mode
     */
    finishEditing(itemId, data, itemType) {
        const editState = this.editingStates.get(itemId);
        if (!editState) return;

        const row = editState.row;
        
        // Clean up
        row.classList.remove('editing');
        this.editingStates.delete(itemId);
        this.originalValues.delete(itemId);
        
        // Let the table renderer handle the display restoration
        // This ensures consistency with the main rendering logic
        console.log('Edit finished for:', itemId, itemType);
    }

    /**
     * Get role options for dropdown
     */
    getRoleOptions(selectedRole) {
        const rateCards = window.projectData?.rateCards || [];
        let options = '<option value="">Select Role</option>';
        
        rateCards.forEach(rate => {
            const selected = rate.role === selectedRole ? 'selected' : '';
            options += `<option value="${rate.role}" data-rate="${rate.rate}" data-category="${rate.category}" ${selected}>${rate.role}</option>`;
        });
        
        return options;
    }

    /**
     * Get vendor category options
     */
    getVendorCategoryOptions(selectedCategory) {
        const categories = ['Implementation', 'Consulting', 'Training', 'Support', 'Other'];
        let options = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            const selected = category === selectedCategory ? 'selected' : '';
            options += `<option value="${category}" ${selected}>${category}</option>`;
        });
        
        return options;
    }

    /**
     * Get tool license options
     */
    getToolLicenseOptions(selectedType) {
        const types = ['Per User', 'Per Device', 'Enterprise', 'One-time'];
        let options = '<option value="">Select License Type</option>';
        
        types.forEach(type => {
            const selected = type === selectedType ? 'selected' : '';
            options += `<option value="${type}" ${selected}>${type}</option>`;
        });
        
        return options;
    }

    /**
     * Get misc category options
     */
    getMiscCategoryOptions(selectedCategory) {
        const categories = ['Travel', 'Equipment', 'Training', 'Documentation', 'Other'];
        let options = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            const selected = category === selectedCategory ? 'selected' : '';
            options += `<option value="${category}" ${selected}>${category}</option>`;
        });
        
        return options;
    }

    /**
     * Get probability options
     */
    getProbabilityOptions(selectedProb) {
        const probs = [
            { value: '1', label: '1 - Very Low' },
            { value: '2', label: '2 - Low' },
            { value: '3', label: '3 - Medium' },
            { value: '4', label: '4 - High' },
            { value: '5', label: '5 - Very High' }
        ];
        let options = '<option value="">Select Probability</option>';
        
        probs.forEach(prob => {
            const selected = prob.value === selectedProb ? 'selected' : '';
            options += `<option value="${prob.value}" ${selected}>${prob.label}</option>`;
        });
        
        return options;
    }

    /**
     * Get impact options
     */
    getImpactOptions(selectedImpact) {
        const impacts = [
            { value: '1', label: '1 - Very Low' },
            { value: '2', label: '2 - Low' },
            { value: '3', label: '3 - Medium' },
            { value: '4', label: '4 - High' },
            { value: '5', label: '5 - Very High' }
        ];
        let options = '<option value="">Select Impact</option>';
        
        impacts.forEach(impact => {
            const selected = impact.value === selectedImpact ? 'selected' : '';
            options += `<option value="${impact.value}" ${selected}>${impact.label}</option>`;
        });
        
        return options;
    }
}

// Global function to update rate when role changes (for inline editing)
function updateRateFromRole(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption && selectedOption.dataset.rate) {
        const row = selectElement.closest('tr');
        const rateCardInput = row.querySelector('[data-field="rateCard"]');
        const dailyRateInput = row.querySelector('[data-field="dailyRate"]');
        
        if (rateCardInput) rateCardInput.value = selectedOption.dataset.category;
        if (dailyRateInput) dailyRateInput.value = selectedOption.dataset.rate;
    }
}

// Make function globally available
window.updateRateFromRole = updateRateFromRole;

// Initialize edit manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editManager = new EditManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditManager;
}

console.log('Edit Manager loaded with dynamic month support');
