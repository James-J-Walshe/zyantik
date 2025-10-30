/**
 * COMPLETE PROFESSIONAL STYLING FIXES - MERGED VERSION
 * 
 * Combines:
 * 1. Auto-expanding input fields to match text size
 * 2. CORRECT blue header colors (#667EEA) with CSS override
 * 3. Professional tick/cross buttons matching pen/bin styling
 * 4. Proper header structure without inline style conflicts
 * 5. CSS injection to defeat conflicting gradient rules
 */

// SOLUTION 1: CSS Override Injection to Force Blue Headers
function injectForceBlueHeadersCSS() {
    console.log('Injecting CSS to force blue headers and override conflicting gradient...');
    
    // Create a style element to inject our override CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'force-blue-headers-override';
    
    // CSS to force the correct colors with !important
    styleElement.textContent = `
        /* FORCE BLUE YEAR HEADERS - Override any conflicting gradients */
        .data-table thead tr.year-header-row th {
            background: #667eea !important;
            background-color: #667eea !important;
            background-image: none !important;
            color: white !important;
            font-weight: 700 !important;
            text-align: center !important;
            font-size: 0.9rem !important;
            padding: 0.4rem 1rem !important;
            border-bottom: 1px solid rgba(255,255,255,0.3) !important;
        }
        
        /* FORCE LIGHT GRAY MONTH HEADERS */
        .data-table thead tr.month-header-row th {
            background: #f1f5f9 !important;
            background-color: #f1f5f9 !important;
            background-image: none !important;
            color: #374151 !important;
            font-weight: 600 !important;
            text-align: center !important;
            font-size: 0.8rem !important;
            padding: 0.4rem 0.5rem !important;
            border-bottom: 2px solid #e5e7eb !important;
            white-space: nowrap !important;
        }
        
        /* SPECIAL STYLING FOR FIXED COLUMNS IN MONTH HEADER ROW */
        .data-table thead tr.month-header-row th.fixed-column {
            background: #f8fafc !important;
            background-color: #f8fafc !important;
            background-image: none !important;
            font-size: 0.875rem !important;
            font-weight: 600 !important;
            padding: 1rem !important;
            text-align: left !important;
        }
        
        /* ADDITIONAL OVERRIDE: Remove any gradient from year header rows */
        .year-header-row th {
            background: #667eea !important;
            background-image: none !important;
        }
        
        /* ENSURE NO CONFLICTING GRADIENTS */
        thead tr.year-header-row th,
        tr.year-header-row th,
        .year-header-row th {
            background: #667eea !important;
            background-color: #667eea !important;
            background-image: none !important;
            color: white !important;
        }
    `;
    
    // Remove any existing override styles
    const existingOverride = document.getElementById('force-blue-headers-override');
    if (existingOverride) {
        existingOverride.remove();
    }
    
    // Inject the new styles
    document.head.appendChild(styleElement);
    
    console.log('Blue header override CSS injected successfully');
}

// SOLUTION 2: Auto-expanding input functionality
function createAutoExpandingInput(value, fieldName, itemType) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.step = itemType === 'internal-resource' ? '0.5' : '0.01';
    input.min = '0';
    input.className = 'row-edit-input';
    input.setAttribute('data-field', fieldName);
    
    // Calculate initial width based on content
    const minWidth = Math.max(60, value.toString().length * 10 + 20);
    
    input.style.cssText = `
        width: ${minWidth}px !important;
        max-width: 120px !important;
        min-width: 60px !important;
        padding: 6px !important;
        border: 1px solid #007bff !important;
        border-radius: 3px !important;
        text-align: center !important;
        font-size: 13px !important;
        background: white !important;
        box-sizing: border-box !important;
        transition: width 0.2s ease !important;
    `;
    
    // Auto-expand function
    function adjustWidth() {
        const textLength = input.value.length;
        const newWidth = Math.max(60, Math.min(120, textLength * 10 + 20));
        input.style.width = newWidth + 'px';
    }
    
    // Add event listeners for auto-expansion
    input.addEventListener('input', adjustWidth);
    input.addEventListener('keyup', adjustWidth);
    input.addEventListener('paste', () => setTimeout(adjustWidth, 10));
    
    return input;
}

// SOLUTION 3: Fixed header rendering with proper structure
function renderTableHeadersCorrectly() {
    console.log('Rendering table headers with CORRECT structure and CSS classes...');
    
    const monthInfo = window.tableRenderer ? window.tableRenderer.calculateProjectMonths() : {
        months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        monthKeys: ['month1', 'month2', 'month3', 'month4', 'month5', 'month6', 'month7', 'month8', 'month9', 'month10', 'month11', 'month12'],
        yearGroups: [
            { year: 2026, months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], count: 8 },
            { year: 2027, months: ['Jan', 'Feb', 'Mar', 'Apr'], count: 4 }
        ],
        count: 12
    };
    
    // Update Internal Resources table headers
    const internalYearHeader = document.getElementById('internalResourcesYearHeader');
    const internalMonthHeader = document.getElementById('internalResourcesTableHeader');
    
    if (internalYearHeader && internalMonthHeader) {
        // Apply CSS classes to the TR elements themselves
        internalYearHeader.className = 'year-header-row';
        internalMonthHeader.className = 'month-header-row';
        
        // Build year header row
        let yearRowHTML = `
            <th rowspan="2" class="fixed-column">Role</th>
            <th rowspan="2" class="fixed-column">Rate Card</th>
            <th rowspan="2" class="fixed-column">Daily Rate</th>
        `;
        
        // Add year columns with proper colspan
        monthInfo.yearGroups.forEach(yearGroup => {
            yearRowHTML += `<th colspan="${yearGroup.count}">${yearGroup.year}</th>`;
        });
        
        yearRowHTML += `
            <th rowspan="2" class="fixed-column">Total Cost</th>
            <th rowspan="2" class="fixed-column">Actions</th>
        `;
        
        // Build month header row (only month names, no fixed columns)
        let monthRowHTML = '';
        monthInfo.months.forEach(month => {
            monthRowHTML += `<th>${month}</th>`;
        });
        
        internalYearHeader.innerHTML = yearRowHTML;
        internalMonthHeader.innerHTML = monthRowHTML;
        
        console.log('Internal Resources headers rendered correctly');
    }
    
    // Update Vendor Costs table headers
    const vendorYearHeader = document.getElementById('vendorCostsYearHeader');
    const vendorMonthHeader = document.getElementById('vendorCostsTableHeader');
    
    if (vendorYearHeader && vendorMonthHeader) {
        vendorYearHeader.className = 'year-header-row';
        vendorMonthHeader.className = 'month-header-row';
        
        let yearRowHTML = `
            <th rowspan="2" class="fixed-column">Vendor</th>
            <th rowspan="2" class="fixed-column">Category</th>
            <th rowspan="2" class="fixed-column">Description</th>
        `;
        
        monthInfo.yearGroups.forEach(yearGroup => {
            yearRowHTML += `<th colspan="${yearGroup.count}">${yearGroup.year}</th>`;
        });
        
        yearRowHTML += `
            <th rowspan="2" class="fixed-column">Total Cost</th>
            <th rowspan="2" class="fixed-column">Actions</th>
        `;
        
        let monthRowHTML = '';
        monthInfo.months.forEach(month => {
            monthRowHTML += `<th>${month}</th>`;
        });
        
        vendorYearHeader.innerHTML = yearRowHTML;
        vendorMonthHeader.innerHTML = monthRowHTML;
        
        console.log('Vendor Costs headers rendered correctly');

            const forecastYearHeader = document.getElementById('forecastTableYearHeader');
    const forecastMonthHeader = document.getElementById('forecastTableHeader');
    
    if (forecastYearHeader && forecastMonthHeader) {
        forecastYearHeader.className = 'year-header-row';
        forecastMonthHeader.className = 'month-header-row';
        
        let yearRowHTML = `
            <th rowspan="2" class="fixed-column">Category</th>
        `;
        
        monthInfo.yearGroups.forEach(yearGroup => {
            yearRowHTML += `<th colspan="${yearGroup.count}">${yearGroup.year}</th>`;
        });
        
        yearRowHTML += `
            <th rowspan="2" class="fixed-column">Total</th>
        `;
        
        let monthRowHTML = '';
        monthInfo.months.forEach(month => {
            monthRowHTML += `<th>${month}</th>`;
        });
        
        forecastYearHeader.innerHTML = yearRowHTML;
        forecastMonthHeader.innerHTML = monthRowHTML;
        
        console.log('Forecast table headers rendered correctly');
    }
    }
}

// SOLUTION 4: Enhanced rendering with CORRECT CSS and NO inline overrides
function renderInternalResourcesTableFixed() {
    console.log('Starting renderInternalResourcesTableFixed with CORRECT structure...');
    
    // First ensure headers are correct
    renderTableHeadersCorrectly();
    
    const tbody = document.getElementById('internalResourcesTable');
    if (!tbody) {
        console.error('Internal resources table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    const projectData = window.projectData || {};
    
    if (!projectData.internalResources || projectData.internalResources.length === 0) {
        const monthInfo = window.tableRenderer ? window.tableRenderer.calculateProjectMonths() : { count: 16 };
        const colspan = 3 + monthInfo.count + 2;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state" style="padding: 2rem; text-align: center; color: #6b7280;">No internal resources added yet</td></tr>`;
        return;
    }
    
    const monthInfo = window.tableRenderer ? window.tableRenderer.calculateProjectMonths() : {
        monthKeys: ['month1', 'month2', 'month3', 'month4', 'month5', 'month6', 'month7', 'month8', 'month9', 'month10', 'month11', 'month12'],
        count: 12
    };
    
    console.log('Rendering Internal Resources with NO inline style overrides...');
    
    projectData.internalResources.forEach((resource, index) => {
        let monthCells = '';
        let totalDays = 0;
        
        // Generate month cells using monthKeys
        monthInfo.monthKeys.forEach((monthKey, i) => {
            const fieldName = `${monthKey}Days`;
            let days = resource[fieldName];
            if (days === undefined) {
                const quarterIndex = Math.ceil((i + 1) / 3);
                days = resource[`q${quarterIndex}Days`] || 0;
            } else {
                days = days || 0;
            }
            
            totalDays += days;
            
            // CRITICAL: NO inline styles - let CSS handle everything
            monthCells += `<td class="month-cell" data-field="${fieldName}">${days}</td>`;
        });
        
        const totalCost = totalDays * (resource.dailyRate || 0);
        
        const row = document.createElement('tr');
        row.setAttribute('data-id', resource.id);
        row.setAttribute('data-type', 'internal-resource');
        
        // CRITICAL: Remove inline styles - let CSS handle styling
        row.innerHTML = `
            <td>${resource.role || 'Unknown Role'}</td>
            <td><span class="category-badge category-internal">${resource.rateCard || 'Internal'}</span></td>
            <td style="text-align: right;">$${(resource.dailyRate || 0).toLocaleString()}</td>
            ${monthCells}
            <td class="cost-total"><strong>$${totalCost.toLocaleString()}</strong></td>
            <td class="action-cell">
                <div class="action-buttons" style="display: flex; gap: 4px; align-items: center; justify-content: center;">
                    <button class="edit-row-btn icon-btn" data-id="${resource.id}" data-type="internal-resource" title="Edit Row" onclick="editWholeRowProfessional(this)"
                            style="background-color: #17a2b8; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; margin-right: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ${createDeleteButtonProfessional(resource.id, 'internalResources')}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('Internal Resources table rendered with CORRECT CSS');
}

// SOLUTION 5: Enhanced vendor costs rendering with CORRECT CSS
function renderVendorCostsTableFixed() {
    console.log('Starting renderVendorCostsTableFixed with CORRECT structure...');
    
    // First ensure headers are correct
    renderTableHeadersCorrectly();
    
    const tbody = document.getElementById('vendorCostsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const projectData = window.projectData || {};
    if (!projectData.vendorCosts || projectData.vendorCosts.length === 0) {
        const monthInfo = window.tableRenderer ? window.tableRenderer.calculateProjectMonths() : { count: 16 };
        const colspan = 3 + monthInfo.count + 2;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state" style="padding: 2rem; text-align: center; color: #6b7280;">No vendor costs added yet</td></tr>`;
        return;
    }
    
    const monthInfo = window.tableRenderer ? window.tableRenderer.calculateProjectMonths() : {
        monthKeys: ['month1', 'month2', 'month3', 'month4', 'month5', 'month6', 'month7', 'month8', 'month9', 'month10', 'month11', 'month12'],
        count: 12
    };
    
    console.log('Rendering Vendor Costs with NO inline style overrides...');
    
    projectData.vendorCosts.forEach(vendor => {
        let monthCells = '';
        let totalCost = 0;
        
        monthInfo.monthKeys.forEach((monthKey, i) => {
            const fieldName = `${monthKey}Cost`;
            let cost = vendor[fieldName];
            if (cost === undefined) {
                const quarterIndex = Math.ceil((i + 1) / 3);
                cost = vendor[`q${quarterIndex}Cost`] || 0;
            } else {
                cost = cost || 0;
            }
            
            totalCost += cost;
            
            // CRITICAL: NO inline styles - let CSS handle everything
            monthCells += `<td class="month-cell" data-field="${fieldName}">$${cost.toLocaleString()}</td>`;
        });
        
        const row = document.createElement('tr');
        row.setAttribute('data-id', vendor.id);
        row.setAttribute('data-type', 'vendor-cost');
        
        row.innerHTML = `
            <td>${vendor.vendor || 'Unknown Vendor'}</td>
            <td><span class="category-badge">${vendor.category || 'Other'}</span></td>
            <td>${vendor.description || 'No description'}</td>
            ${monthCells}
            <td class="cost-total"><strong>$${totalCost.toLocaleString()}</strong></td>
            <td class="action-cell">
                <div class="action-buttons" style="display: flex; gap: 4px; align-items: center; justify-content: center;">
                    <button class="edit-row-btn icon-btn" data-id="${vendor.id}" data-type="vendor-cost" title="Edit Row" onclick="editWholeRowProfessional(this)"
                            style="background-color: #17a2b8; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; margin-right: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ${createDeleteButtonProfessional(vendor.id, 'vendorCosts')}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('Vendor Costs table rendered with CORRECT CSS');
}

// SOLUTION 6: Professional whole row editing with auto-expanding inputs
function editWholeRowProfessional(button) {
    const row = button.closest('tr');
    const itemId = button.getAttribute('data-id');
    const itemType = button.getAttribute('data-type');
    
    if (row.classList.contains('editing-row')) return;
    
    console.log(`Starting professional whole row edit for ${itemType} ${itemId}`);
    
    row.classList.add('editing-row');
    
    // Store original data
    const originalData = {};
    const monthCells = row.querySelectorAll('.month-cell');
    
    monthCells.forEach(cell => {
        const fieldName = cell.getAttribute('data-field');
        originalData[fieldName] = cell.textContent.replace(/[$,]/g, '');
    });
    
    // Convert cells to auto-expanding inputs
    monthCells.forEach((cell, index) => {
        const fieldName = cell.getAttribute('data-field');
        const currentValue = cell.textContent.replace(/[$,]/g, '');
        
        const input = createAutoExpandingInput(currentValue, fieldName, itemType);
        
        // Enhanced editing state styling
        cell.style.cssText = `
            background-color: #fff3cd !important;
            border: 1px solid #ffc107 !important;
            padding: 8px !important;
            text-align: center !important;
        `;
        
        cell.innerHTML = '';
        cell.appendChild(input);
    });
    
    // Professional save/cancel buttons
    const actionCell = row.querySelector('.action-cell');
    actionCell.innerHTML = `
        <div class="row-edit-actions" style="display: flex; gap: 4px; justify-content: center;">
            <button class="save-row-btn icon-btn" onclick="saveWholeRowProfessional(this, '${itemId}', '${itemType}')" title="Save Row Changes"
                    style="background-color: #28a745; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s ease;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
            </button>
            <button class="cancel-row-btn icon-btn" onclick="cancelWholeRowProfessional(this, '${itemId}', '${itemType}')" title="Cancel Row Changes"
                    style="background-color: #dc3545; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s ease;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    row.setAttribute('data-original', JSON.stringify(originalData));
    
    // Focus first input
    const firstInput = row.querySelector('.row-edit-input');
    if (firstInput) {
        firstInput.focus();
        firstInput.select();
    }
}

// SOLUTION 7: Professional save function
function saveWholeRowProfessional(button, itemId, itemType) {
    const row = button.closest('tr');
    console.log(`Saving professional whole row for ${itemType} ${itemId}`);
    
    try {
        const projectData = window.projectData || {};
        let item = null;
        
        if (itemType === 'internal-resource') {
            item = projectData.internalResources?.find(r => r.id == itemId);
        } else if (itemType === 'vendor-cost') {
            item = projectData.vendorCosts?.find(v => v.id == itemId);
        }
        
        if (!item) {
            throw new Error('Item not found');
        }
        
        const inputs = row.querySelectorAll('.row-edit-input');
        let hasChanges = false;
        
        inputs.forEach(input => {
            const fieldName = input.getAttribute('data-field');
            const newValue = parseFloat(input.value) || 0;
            const oldValue = item[fieldName] || 0;
            
            if (newValue !== oldValue) {
                hasChanges = true;
                item[fieldName] = newValue;
            }
        });
        
        if (hasChanges) {
            if (window.DataManager && window.DataManager.saveToLocalStorage) {
                window.DataManager.saveToLocalStorage();
            } else if (typeof(Storage) !== "undefined") {
                localStorage.setItem('ictProjectData', JSON.stringify(projectData));
            }
        }
        
        // Re-render with CORRECT styling
        if (itemType === 'internal-resource') {
            renderInternalResourcesTableFixed();
        } else if (itemType === 'vendor-cost') {
            renderVendorCostsTableFixed();
        }
        
        updateResourcePlanTabProfessional();
        
        if (window.updateSummary) {
            window.updateSummary();
        }
        
        console.log('Professional row saved successfully');
        
    } catch (error) {
        console.error('Error saving professional row:', error);
        alert('Error saving changes: ' + error.message);
        cancelWholeRowProfessional(button, itemId, itemType);
    }
}

// SOLUTION 8: Professional cancel function
function cancelWholeRowProfessional(button, itemId, itemType) {
    const row = button.closest('tr');
    console.log(`Cancelling professional row edit for ${itemType} ${itemId}`);
    
    if (itemType === 'internal-resource') {
        renderInternalResourcesTableFixed();
    } else if (itemType === 'vendor-cost') {
        renderVendorCostsTableFixed();
    }
}

// SOLUTION 9: Enhanced resource plan update
function updateResourcePlanTabProfessional() {
    console.log('Updating resource plan tab with professional calculations...');
    
    try {
        if (window.tableRenderer && window.tableRenderer.renderForecastTable) {
            window.tableRenderer.renderForecastTable();
        }
        
        const internalTotal = calculateInternalResourcesTotalFixed();
        const vendorTotal = calculateVendorCostsTotalFixed();
        const toolTotal = calculateToolCostsTotalFixed();
        const miscTotal = calculateMiscCostsTotalFixed();
        
        const totalProject = internalTotal + vendorTotal + toolTotal + miscTotal;
        const totalExternal = vendorTotal + toolTotal + miscTotal;
        
        const totalProjectCostEl = document.getElementById('totalProjectCost');
        const totalInternalCostEl = document.getElementById('totalInternalCost');
        const totalExternalCostEl = document.getElementById('totalExternalCost');
        
        if (totalProjectCostEl) totalProjectCostEl.textContent = `$${totalProject.toLocaleString()}`;
        if (totalInternalCostEl) totalInternalCostEl.textContent = `$${internalTotal.toLocaleString()}`;
        if (totalExternalCostEl) totalExternalCostEl.textContent = `$${totalExternal.toLocaleString()}`;
        
        console.log('Resource plan updated professionally');
        
    } catch (error) {
        console.error('Error updating resource plan:', error);
    }
}

// SOLUTION 10: Professional delete button
function createDeleteButtonProfessional(itemId, arrayName) {
    return `<button class="delete-btn icon-btn" onclick="deleteItem('${arrayName}', ${typeof itemId === 'string' ? `'${itemId}'` : itemId})" title="Delete"
                style="background-color: #dc3545; color: white; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s ease;"
                onmouseover="this.style.backgroundColor='#c82333'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 8px rgba(220, 53, 69, 0.3)';"
                onmouseout="this.style.backgroundColor='#dc3545'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>
        </svg>
    </button>`;
}

// SOLUTION 11: Calculation functions
function calculateInternalResourcesTotalFixed() {
    const projectData = window.projectData || {};
    return (projectData.internalResources || []).reduce((total, resource) => {
        let totalDays = 0;
        for (let i = 1; i <= 24; i++) {
            const monthField = `month${i}Days`;
            if (resource[monthField] !== undefined) {
                totalDays += resource[monthField] || 0;
            }
        }
        if (totalDays === 0) {
            totalDays = (resource.q1Days || 0) + (resource.q2Days || 0) + (resource.q3Days || 0) + (resource.q4Days || 0);
        }
        return total + (totalDays * (resource.dailyRate || 0));
    }, 0);
}

function calculateVendorCostsTotalFixed() {
    const projectData = window.projectData || {};
    return (projectData.vendorCosts || []).reduce((total, vendor) => {
        let totalCost = 0;
        for (let i = 1; i <= 24; i++) {
            const monthField = `month${i}Cost`;
            if (vendor[monthField] !== undefined) {
                totalCost += vendor[monthField] || 0;
            }
        }
        if (totalCost === 0) {
            totalCost = (vendor.q1Cost || 0) + (vendor.q2Cost || 0) + (vendor.q3Cost || 0) + (vendor.q4Cost || 0);
        }
        return total + totalCost;
    }, 0);
}

function calculateToolCostsTotalFixed() {
    const projectData = window.projectData || {};
    return (projectData.toolCosts || []).reduce((total, tool) => {
        return total + ((tool.users || 0) * (tool.monthlyCost || 0) * (tool.duration || 0));
    }, 0);
}

function calculateMiscCostsTotalFixed() {
    const projectData = window.projectData || {};
    return (projectData.miscCosts || []).reduce((total, misc) => {
        return total + (misc.cost || 0);
    }, 0);
}

// SOLUTION 12: Force header colors with JavaScript
function forceBlueHeadersEverywhere() {
    console.log('FORCING blue headers with JavaScript override...');
    
    setTimeout(() => {
        // Target all possible year header elements and force blue
        const yearHeaders = document.querySelectorAll(`
            #internalResourcesYearHeader,
            #vendorCostsYearHeader,
            #forecastTableYearHeader,
            .year-header-row,
            tr.year-header-row
        `);
        
        yearHeaders.forEach(header => {
            if (header) {
                header.style.setProperty('background-color', '#667eea', 'important');
                header.style.setProperty('background', '#667eea', 'important');
                header.style.setProperty('background-image', 'none', 'important');
                header.style.setProperty('color', 'white', 'important');
                
                // Force all th elements within to blue
                const thElements = header.querySelectorAll('th');
                thElements.forEach(th => {
                    th.style.setProperty('background-color', '#667eea', 'important');
                    th.style.setProperty('background', '#667eea', 'important');
                    th.style.setProperty('background-image', 'none', 'important');
                    th.style.setProperty('color', 'white', 'important');
                });
            }
        });
        
        console.log('Blue headers forced with JavaScript');
    }, 300);
}

// SOLUTION 13: Apply COMPLETE professional fixes with all features
function applyCompleteProfessionalStylingFixes() {
    console.log('Applying COMPLETE professional styling fixes - ALL FEATURES COMBINED...');
    
    // Step 1: Inject CSS override to defeat gradient
    injectForceBlueHeadersCSS();
    
    // Step 2: Fix header structure
    renderTableHeadersCorrectly();
    
    // Step 3: Override table rendering functions
    if (window.tableRenderer) {
        window.tableRenderer.updateTableHeaders = renderTableHeadersCorrectly;
        window.tableRenderer.renderInternalResourcesTable = renderInternalResourcesTableFixed;
        window.tableRenderer.renderVendorCostsTable = renderVendorCostsTableFixed;
        
        try {
            // Render tables with ALL fixes
            renderInternalResourcesTableFixed();
            renderVendorCostsTableFixed();
            
            console.log('All table rendering overrides applied successfully');
        } catch (error) {
            console.error('Error applying table rendering overrides:', error);
        }
    }
    
    // Step 4: Force header colors with JavaScript as backup
    forceBlueHeadersEverywhere();
    
    console.log('COMPLETE professional styling applied - CSS + Structure + JavaScript override');
}

// SOLUTION 14: Global function exports
window.editWholeRowProfessional = editWholeRowProfessional;
window.saveWholeRowProfessional = saveWholeRowProfessional;
window.cancelWholeRowProfessional = cancelWholeRowProfessional;
window.updateResourcePlanTabProfessional = updateResourcePlanTabProfessional;
window.applyCompleteProfessionalStylingFixes = applyCompleteProfessionalStylingFixes;
window.renderTableHeadersCorrectly = renderTableHeadersCorrectly;
window.injectForceBlueHeadersCSS = injectForceBlueHeadersCSS;
window.forceBlueHeadersEverywhere = forceBlueHeadersEverywhere;

// Auto-apply COMPLETE professional fixes
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('Auto-applying COMPLETE professional styling fixes...');
        applyCompleteProfessionalStylingFixes();
    }, 2000);
});

console.log('COMPLETE MERGED PROFESSIONAL STYLING fixes loaded - Auto-expanding inputs + Blue headers + Professional buttons + All features combined');
