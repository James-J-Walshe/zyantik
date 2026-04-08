/**
 * Edit Manager Module
 * Handles inline editing functionality for all data types with dynamic month support
 * UPDATED: Now includes Rate Card editing with unique role name validation
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
     * @param {string} itemType - Type of item (internal-resource, vendor-cost, rate-card, etc.)
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
        const originalData = this.extractRowData(row, itemType, itemId);
        this.originalValues.set(itemId, originalData);

        // Convert cells to edit inputs
        this.convertToEditInputs(row, itemType, originalData, itemId);

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
    extractRowData(row, itemType, itemId) {
        const data = {};
        const cells = row.querySelectorAll('td');
        
        // Get month info for dynamic extraction
        const monthInfo = window.dynamicFormHelper ? 
            window.dynamicFormHelper.calculateProjectMonths() : 
            { monthKeys: ['month1', 'month2', 'month3', 'month4'], count: 4 };
        
        switch (itemType) {
            case 'internal-resource': {
                data.role = cells[0]?.textContent?.trim() || '';
                data.rateCard = cells[1]?.textContent?.trim() || '';
                data.dailyRate = parseFloat(cells[2]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                // STR-001: cell[3] is now the Currency column — read currency from projectData
                const _irId = isNaN(Number(itemId)) ? itemId : Number(itemId);
                const _irEntry = window.projectData?.internalResources?.find(r => r.id === _irId);
                const _irPrimary = window.projectData?.currency?.primaryCurrency || '';
                data.currency = _irEntry?.currency || _irPrimary;
                data.originalAmount = _irEntry?.originalAmount || 0;

                // Extract dynamic month data — cells start at index 4 now (Currency is index 3)
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 4 + index;
                    const fieldName = monthKey + 'Days';
                    data[fieldName] = parseFloat(cells[cellIndex]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                });
                break;
            }

            case 'vendor-cost': {
                data.vendor = cells[0]?.textContent?.trim() || '';
                data.category = cells[1]?.textContent?.trim() || '';
                data.description = cells[2]?.textContent?.trim() || '';
                // STR-001: cell[3] is now the Currency column — read currency from projectData
                const _vcId = isNaN(Number(itemId)) ? itemId : Number(itemId);
                const _vcEntry = window.projectData?.vendorCosts?.find(v => v.id === _vcId);
                const _vcPrimary = window.projectData?.currency?.primaryCurrency || '';
                data.currency = _vcEntry?.currency || _vcPrimary;
                data.originalAmount = _vcEntry?.originalAmount || 0;

                // Extract dynamic month data — cells start at index 4 now (Currency is index 3)
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 4 + index;
                    const fieldName = monthKey + 'Cost';
                    data[fieldName] = parseFloat(cells[cellIndex]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                });
                break;
            }
                
            case 'tool-cost': {
                // Read directly from projectData to avoid parsing formatted display values.
                // itemId from the DOM is always a string; stored IDs (Date.now()) are numbers.
                const _numId = Number(itemId);
                const _id = isNaN(_numId) ? itemId : _numId;
                const toolData = window.projectData?.toolCosts?.find(t => t.id === _id);
                if (toolData) {
                    data.tool = toolData.tool || '';
                    data.procurementType = toolData.procurementType || '';
                    data.billingFrequency = toolData.billingFrequency || '';
                    // STR-001: use originalAmount for costPerPeriod display if non-base currency
                    data.costPerPeriod = toolData.originalAmount !== undefined ? toolData.originalAmount : (toolData.costPerPeriod || 0);
                    data.quantity = toolData.quantity || 1;
                    data.startDate = toolData.startDate || '';
                    data.endDate = toolData.endDate || '';
                    data.isOngoing = toolData.isOngoing || false;
                    // STR-001: currency fields
                    data.currency = toolData.currency || (window.projectData?.currency?.primaryCurrency || '');
                    data.originalAmount = toolData.originalAmount || 0;
                }
                break;
            }

            case 'misc-cost':
                // Columns rendered as: Item, Description, Category, Cost
                data.item = cells[0]?.textContent?.trim() || '';
                data.description = cells[1]?.textContent?.trim() || '';
                data.category = cells[2]?.textContent?.trim() || '';
                data.cost = parseFloat(cells[3]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                break;

            case 'risk':
                data.description = cells[0]?.textContent?.trim() || '';
                data.probability = parseFloat(cells[1]?.textContent?.replace(/[^0-9.-]/g, '')) || 1;
                data.impact = parseFloat(cells[2]?.textContent?.replace(/[^0-9.-]/g, '')) || 1;
                data.mitigationCost = parseFloat(cells[4]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                break;
                
            case 'rate-card':
                data.role = cells[0]?.textContent?.trim() || '';
                // Extract category from the badge span
                const categoryBadge = cells[1]?.querySelector('.category-badge');
                data.category = categoryBadge?.textContent?.trim() || '';
                data.rate = parseFloat(cells[2]?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
                break;
        }
        
        return data;
    }

    /**
     * Convert row cells to input fields with dynamic month support
     */
    convertToEditInputs(row, itemType, data, itemId) {
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
                // STR-001: cell[3] is the Currency column
                if (cells[3]) {
                    const irCurrencyOptions = window.buildCurrencyOptions ? window.buildCurrencyOptions(data.currency) : '';
                    cells[3].innerHTML = `<select class="edit-input currency-selector" data-field="currency">${irCurrencyOptions}</select>`;
                }

                // Create dynamic month inputs — cells start at index 4 now
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 4 + index;
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
                // STR-001: cell[3] is the Currency column
                if (cells[3]) {
                    const vcCurrencyOptions = window.buildCurrencyOptions ? window.buildCurrencyOptions(data.currency) : '';
                    cells[3].innerHTML = `<select class="edit-input currency-selector" data-field="currency">${vcCurrencyOptions}</select>`;
                }

                // Create dynamic month inputs — cells start at index 4 now
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cellIndex = 4 + index;
                    if (cells[cellIndex]) {
                        const fieldName = monthKey + 'Cost';
                        const value = data[fieldName] || 0;
                        cells[cellIndex].innerHTML = `<input type="number" class="edit-input" value="${value}" data-field="${fieldName}" step="0.01" min="0">`;
                    }
                });
                break;
                
            case 'tool-cost':
                // Columns: Tool, Type, Billing, Cost/Period, Quantity, Start Date, End Date, Currency, Total (read-only)
                cells[0].innerHTML = `<input type="text" class="edit-input" value="${data.tool}" data-field="tool">`;
                cells[1].innerHTML = `<select class="edit-input" data-field="procurementType">
                    ${this.getProcurementTypeOptions(data.procurementType)}
                </select>`;
                cells[2].innerHTML = `<select class="edit-input" data-field="billingFrequency">
                    ${this.getBillingFrequencyOptions(data.billingFrequency)}
                </select>`;
                cells[3].innerHTML = `<input type="number" class="edit-input" value="${data.costPerPeriod}" data-field="costPerPeriod" step="0.01" min="0">`;
                cells[4].innerHTML = `<input type="number" class="edit-input" value="${data.quantity}" data-field="quantity" step="1" min="1">`;
                cells[5].innerHTML = `<input type="date" class="edit-input" value="${data.startDate}" data-field="startDate">`;
                if (data.isOngoing) {
                    cells[6].innerHTML = `<span>Ongoing</span><input type="hidden" class="edit-input" value="" data-field="endDate">`;
                } else {
                    cells[6].innerHTML = `<input type="date" class="edit-input" value="${data.endDate}" data-field="endDate">`;
                }
                // STR-001: cell[7] is Currency
                if (cells[7]) {
                    const tcCurrencyOptions = window.buildCurrencyOptions ? window.buildCurrencyOptions(data.currency) : '';
                    cells[7].innerHTML = `<select class="edit-input currency-selector" data-field="currency">${tcCurrencyOptions}</select>`;
                }
                // cells[8] is Total Cost (computed) — leave as-is
                break;

            case 'misc-cost':
                // Columns rendered as: Item, Description, Category, Cost
                cells[0].innerHTML = `<input type="text" class="edit-input" value="${data.item}" data-field="item">`;
                cells[1].innerHTML = `<input type="text" class="edit-input" value="${data.description}" data-field="description">`;
                cells[2].innerHTML = `<select class="edit-input" data-field="category">
                    ${this.getMiscCategoryOptions(data.category)}
                </select>`;
                cells[3].innerHTML = `<input type="number" class="edit-input" value="${data.cost}" data-field="cost" step="0.01" min="0">`;
                break;

            case 'risk':
                // Probability and impact are stored as integers 1–5
                cells[0].innerHTML = `<textarea class="edit-input" data-field="description" rows="2">${data.description}</textarea>`;
                cells[1].innerHTML = `<input type="number" class="edit-input" value="${data.probability}" data-field="probability" min="1" max="5" step="1">`;
                cells[2].innerHTML = `<input type="number" class="edit-input" value="${data.impact}" data-field="impact" min="1" max="5" step="1">`;
                // cells[3] is Risk Score (computed) — leave as-is
                cells[4].innerHTML = `<input type="number" class="edit-input" value="${data.mitigationCost}" data-field="mitigationCost" step="0.01" min="0">`;
                break;
                
            case 'rate-card':
                cells[0].innerHTML = `<input type="text" class="edit-input" value="${data.role}" data-field="role" placeholder="Role Name">`;
                cells[1].innerHTML = `<select class="edit-input" data-field="category">
                    ${this.getCategoryOptions(data.category)}
                </select>`;
                cells[2].innerHTML = `<input type="number" class="edit-input" value="${data.rate}" data-field="rate" step="1" min="0" placeholder="Daily Rate">`;
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

            // STR-001: currency validation for the three cost types
            if (['internal-resource', 'vendor-cost', 'tool-cost'].includes(editState.type)) {
                const currencySelector = row.querySelector('.currency-selector');
                const selectedCurrency = currencySelector ? currencySelector.value : (window.projectData?.currency?.primaryCurrency || '');
                // Find an error span sibling if any (edit-mode rows don't have them, so pass null)
                if (window.validateCurrencyRate && !window.validateCurrencyRate(selectedCurrency, currencySelector, null)) {
                    // Show a brief alert since edit rows have no dedicated error span
                    alert(`Exchange rate for ${selectedCurrency} is not configured. Please configure it in Settings before saving this entry.`);
                    row.classList.remove('saving');
                    return;
                }
                // Store currency on newData for updateItemData
                newData.currency = selectedCurrency;
                const primaryCurrency = window.projectData?.currency?.primaryCurrency || '';
                if (selectedCurrency && selectedCurrency !== primaryCurrency && window.currencyManager) {
                    if (editState.type === 'tool-cost' && newData.costPerPeriod !== undefined) {
                        newData.originalAmount = newData.costPerPeriod;
                        newData.costPerPeriod = window.currencyManager.convertCurrency(newData.costPerPeriod, selectedCurrency, primaryCurrency);
                    } else if (editState.type === 'internal-resource' && newData.dailyRate !== undefined) {
                        newData.originalAmount = newData.dailyRate;
                        newData.dailyRate = window.currencyManager.convertCurrency(newData.dailyRate, selectedCurrency, primaryCurrency);
                    }
                    // vendor-cost: month costs are entered directly in base currency in edit mode
                    // originalAmount tracks total; no per-month conversion needed here
                } else {
                    // Base currency — clear currency fields
                    newData.currency = undefined;
                    newData.originalAmount = undefined;
                }
            }

            // Validate data
            if (!this.validateEditData(newData, editState.type, itemId)) {
                row.classList.remove('saving');
                return;
            }

            // For tool costs, warn if dates extend beyond the project end date
            if (editState.type === 'tool-cost') {
                const projEnd = window.projectData?.projectInfo?.endDate;
                if (projEnd && newData.startDate) {
                    const projEndYM  = projEnd.substring(0, 7); // normalise to YYYY-MM
                    const toolStartYM = newData.startDate.substring(0, 7);
                    const isOngoing = !newData.endDate || newData.endDate === '';
                    const toolEndYM = !isOngoing ? newData.endDate.substring(0, 7) : null;
                    const fmtMonth = ym => new Date(ym + '-01').toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
                    const fmtDay   = d  => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

                    let warningMsg = null;
                    if (toolStartYM > projEndYM) {
                        warningMsg = `⚠️ Date Warning\n\nThe tool start date (${fmtDay(newData.startDate)}) is after the project end date (${fmtMonth(projEndYM)}).\n\nThis tool will show $0 in the project totals, as costs outside the project timeline are excluded.\n\nYou may want to adjust the dates before saving.\n\nDo you want to save anyway?`;
                    } else if (toolEndYM && toolEndYM > projEndYM) {
                        warningMsg = `⚠️ Date Warning\n\nThe tool end date (${fmtDay(newData.endDate)}) is after the project end date (${fmtMonth(projEndYM)}).\n\nCosts will only be calculated up to the end of the project (${fmtMonth(projEndYM)}). The remaining period will not be included in the project total.\n\nDo you want to continue?`;
                    }

                    if (warningMsg) {
                        row.classList.remove('saving');
                        if (!confirm(warningMsg)) {
                            return;
                        }
                        row.classList.add('saving');
                    }
                }
            }

            // Update the data
            this.updateItemData(itemId, newData, editState.type);
            
            // Finish editing
            this.finishEditing(itemId, newData, editState.type);
            
            // Re-render tables
            if (window.tableRenderer) {
                window.tableRenderer.renderAllTables();
            }
            
            // Update summary if available
            if (window.calculateAndDisplaySummary) {
                window.calculateAndDisplaySummary();
            }
            
            console.log('Save completed successfully');
        } catch (error) {
            console.error('Error saving edit:', error);
            alert('An error occurred while saving. Please try again.');
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
     * Validate edit data with unique role name validation for rate cards
     */
    validateEditData(data, itemType, itemId) {
        switch (itemType) {
            case 'internal-resource':
                return data.role && data.dailyRate >= 0;
            case 'vendor-cost':
                return data.vendor && data.description;
            case 'tool-cost':
                return data.tool && data.costPerPeriod >= 0 && data.quantity >= 1;
            case 'misc-cost':
                return data.item && data.cost >= 0;
            case 'risk':
                return data.description && data.probability && data.impact;
            case 'rate-card':
                // Validate required fields
                if (!data.role || !data.category || data.rate < 0) {
                    alert('Please fill in all required fields:\n- Role name\n- Category (Internal/External)\n- Daily Rate (must be 0 or greater)');
                    return false;
                }
                
                // Check for duplicate role names (case-insensitive)
                const projectData = window.projectData || {};
                const isDuplicate = projectData.rateCards?.some(card => {
                    const cardId = card.id || card.role;
                    return card.role.toLowerCase() === data.role.toLowerCase() && cardId !== itemId;
                });
                
                if (isDuplicate) {
                    alert(`A rate card with the role "${data.role}" already exists.\nPlease use a unique role name.`);
                    return false;
                }
                
                return true;
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
     * Get category options for rate cards (Internal/External)
     */
    getCategoryOptions(selectedCategory) {
        const categories = ['Internal', 'External'];
        let options = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            const selected = category === selectedCategory ? 'selected' : '';
            options += `<option value="${category}" ${selected}>${category}</option>`;
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
     * Get procurement type options for tool costs
     */
    getProcurementTypeOptions(selected) {
        const types = ['Software License', 'Hardware', 'Cloud Services'];
        let options = '<option value="">-- Select Type --</option>';
        types.forEach(type => {
            options += `<option value="${type}" ${type === selected ? 'selected' : ''}>${type}</option>`;
        });
        return options;
    }

    /**
     * Get billing frequency options for tool costs
     */
    getBillingFrequencyOptions(selected) {
        const freqs = [
            { value: 'one-time', label: 'One-time' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'annual', label: 'Annual' }
        ];
        let options = '<option value="">-- Select Frequency --</option>';
        freqs.forEach(f => {
            options += `<option value="${f.value}" ${f.value === selected ? 'selected' : ''}>${f.label}</option>`;
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
     * Get miscellaneous category options
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
     * Get probability options for risks
     */
    getProbabilityOptions(selectedProbability) {
        const probabilities = [
            { value: 'Low', label: 'Low (< 30%)' },
            { value: 'Medium', label: 'Medium (30-60%)' },
            { value: 'High', label: 'High (> 60%)' }
        ];
        
        let options = '<option value="">Select Probability</option>';
        
        probabilities.forEach(prob => {
            const selected = prob.value === selectedProbability ? 'selected' : '';
            options += `<option value="${prob.value}" ${selected}>${prob.label}</option>`;
        });
        
        return options;
    }

    /**
     * Get impact options for risks
     */
    getImpactOptions(selectedImpact) {
        const impacts = [
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' }
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

console.log('✅ Edit Manager loaded with Rate Card editing support and unique role name validation');
