// Table Renderer Module
// Handles all table rendering functionality with edit capabilities and dynamic month columns
// Compatible with existing dynamic_form_helper.js
// Enhanced with two-row headers (year + month)
// FIXED VERSION: All 5 forecast rows + proper tool cost calculation

class TableRenderer {
    constructor() {
        console.log('Table Renderer initialized with two-row header support');
    }

    // Calculate dynamic months based on project dates - Enhanced with year information
    calculateProjectMonths() {
        const projectData = window.projectData || {};
        const projectInfo = projectData.projectInfo || {};
        
        if (!projectInfo.startDate || !projectInfo.endDate) {
            console.log('No project dates found, using default 4 months');
            return {
                months: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
                monthKeys: ['month1', 'month2', 'month3', 'month4'],
                yearGroups: [{ year: new Date().getFullYear(), months: ['Month 1', 'Month 2', 'Month 3', 'Month 4'], count: 4 }],
                count: 4
            };
        }

        const startDate = new Date(projectInfo.startDate);
        const endDate = new Date(projectInfo.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.log('Invalid project dates, using default 4 months');
            return {
                months: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
                monthKeys: ['month1', 'month2', 'month3', 'month4'],
                yearGroups: [{ year: new Date().getFullYear(), months: ['Month 1', 'Month 2', 'Month 3', 'Month 4'], count: 4 }],
                count: 4
            };
        }

        const months = [];
        const monthKeys = [];
        const yearGroups = [];
        let currentDate = new Date(startDate);
        let monthIndex = 1;
        let currentYear = null;
        let currentYearGroup = null;

        // Calculate months between start and end date
        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
            
            // Start a new year group if needed
            if (currentYear !== year) {
                currentYear = year;
                currentYearGroup = { year: year, months: [], count: 0 };
                yearGroups.push(currentYearGroup);
            }
            
            months.push(monthName);
            monthKeys.push(`month${monthIndex}`);
            currentYearGroup.months.push(monthName);
            currentYearGroup.count++;
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
            monthIndex++;
            
            // Safety check to prevent infinite loops
            if (monthIndex > 24) {
                console.warn('Project duration exceeds 24 months, limiting to 24 months');
                break;
            }
        }

        // Ensure at least 1 month
        if (months.length === 0) {
            const currentYear = new Date().getFullYear();
            months.push('Month 1');
            monthKeys.push('month1');
            yearGroups.push({ year: currentYear, months: ['Month 1'], count: 1 });
        }

        console.log(`Dynamic months calculated: ${months.length} months across ${yearGroups.length} years`, { months, yearGroups });
        
        return {
            months: months,
            monthKeys: monthKeys,
            yearGroups: yearGroups,
            count: months.length
        };
    }

    // Helper function to create action buttons with edit functionality
    createActionButtons(itemId, itemType) {
        const editButton = window.editManager ? 
            window.editManager.createEditButton(itemId, itemType) : '';
        
        return `
            <div class="action-buttons">
                ${editButton}
                <button class="btn btn-danger btn-small delete-btn icon-btn" onclick="deleteItem('${this.getArrayName(itemType)}', ${typeof itemId === 'string' ? `'${itemId}'` : itemId})" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>
                    </svg>
                </button>
            </div>
        `;
    }

    // Helper function to get array name from item type
    getArrayName(itemType) {
        const mapping = {
            'internal-resource': 'internalResources',
            'vendor-cost': 'vendorCosts',
            'tool-cost': 'toolCosts',
            'misc-cost': 'miscCosts',
            'risk': 'risks',
            'rate-card': 'rateCards'
        };
        return mapping[itemType] || itemType;
    }

    // Helper function to get month value with backward compatibility
    getMonthValue(item, monthKey, fallbackPrefix = 'q') {
        // Try new format first (month1Days, month1Cost, etc.)
        const newKey = monthKey + (item.hasOwnProperty(monthKey + 'Days') ? 'Days' : 'Cost');
        if (item.hasOwnProperty(newKey)) {
            return item[newKey] || 0;
        }
        
        // Fall back to old format (q1Days, q1Cost, etc.)
        const monthNumber = parseInt(monthKey.replace('month', ''));
        const quarterIndex = Math.ceil(monthNumber / 3);
        const oldKey = fallbackPrefix + quarterIndex + (item.hasOwnProperty('q' + quarterIndex + 'Days') ? 'Days' : 'Cost');
        return item[oldKey] || 0;
    }

    // Create two-row header HTML (year + month rows)
    createTwoRowHeaders(fixedColumns, monthInfo, includeActions = true) {
        let yearRowHTML = '';
        let monthRowHTML = '';
        
        // Add fixed columns to both rows
        fixedColumns.forEach(column => {
            yearRowHTML += `<th rowspan="2" class="fixed-column">${column}</th>`;
        });
        
        // Add year headers with colspan
        monthInfo.yearGroups.forEach(yearGroup => {
            yearRowHTML += `<th colspan="${yearGroup.count}">${yearGroup.year}</th>`;
        });
        
        // Add total and actions columns
        if (includeActions) {
            yearRowHTML += `<th rowspan="2" class="fixed-column">Total Cost</th>`;
            yearRowHTML += `<th rowspan="2" class="fixed-column col-actions"></th>`;
        } else {
            yearRowHTML += `<th rowspan="2" class="fixed-column">Total</th>`;
        }
        
        // Add month headers
        monthInfo.months.forEach(month => {
            monthRowHTML += `<th>${month}</th>`;
        });
        
        return { yearRowHTML, monthRowHTML };
    }

    // Update table headers dynamically with two-row structure
    updateTableHeaders() {
        const monthInfo = this.calculateProjectMonths();
        
        // Update Internal Resources table header — STR-001: added Currency column
        const internalYearHeader = document.getElementById('internalResourcesYearHeader');
        const internalHeader = document.getElementById('internalResourcesTableHeader');
        if (internalYearHeader && internalHeader) {
            const headers = this.createTwoRowHeaders(['Role', 'Rate Card', 'Daily Rate', 'Currency'], monthInfo, true);
            internalYearHeader.innerHTML = headers.yearRowHTML;
            internalHeader.innerHTML = headers.monthRowHTML;
        }

        // Update Vendor Costs table header — STR-001: added Currency column
        const vendorYearHeader = document.getElementById('vendorCostsYearHeader');
        const vendorHeader = document.getElementById('vendorCostsTableHeader');
        if (vendorYearHeader && vendorHeader) {
            const headers = this.createTwoRowHeaders(['Vendor', 'Category', 'Description', 'Currency'], monthInfo, true);
            vendorYearHeader.innerHTML = headers.yearRowHTML;
            vendorHeader.innerHTML = headers.monthRowHTML;
        }

        // Update Forecast table header
        const forecastYearHeader = document.getElementById('forecastTableYearHeader');
        const forecastHeader = document.getElementById('forecastTableHeader');
        if (forecastYearHeader && forecastHeader) {
            const headers = this.createTwoRowHeaders(['Category'], monthInfo, false);
            forecastYearHeader.innerHTML = headers.yearRowHTML;
            forecastHeader.innerHTML = headers.monthRowHTML;
        }

        console.log('Two-row table headers updated with dynamic months:', monthInfo.months);
    }

    // Render all tables
    renderAllTables() {
        try {
            this.updateTableHeaders(); // Update headers first
            this.renderInternalResourcesTable();
            this.renderVendorCostsTable();
            this.renderToolCostsTable();
            this.renderMiscCostsTable();
            this.renderRisksTable();
            this.renderInternalRatesTable();
            this.renderExternalRatesTable();
            this.renderUnifiedRateCardsTable();
            this.renderForecastTable();
            this.addTopScrollbars();
            this.applyFrozenColumns();
            console.log('All tables rendered successfully with dynamic two-row headers');
        } catch (error) {
            console.error('Error rendering tables:', error);
        }
    }

    // Freeze info columns on the left (Role, Name, Rate Card, Daily Rate) and
    // summary columns on the right (Total Cost, Actions) so only the month
    // columns scroll horizontally.
    applyFrozenColumns() {
        const configs = [
            { yearHeaderId: 'internalResourcesYearHeader', tbodyId: 'internalResourcesTable' },
            { yearHeaderId: 'vendorCostsYearHeader',       tbodyId: 'vendorCostsTable'       },
        ];

        requestAnimationFrame(() => {
            configs.forEach(({ yearHeaderId, tbodyId }) => {
                const yearRow = document.getElementById(yearHeaderId);
                const tbody   = document.getElementById(tbodyId);
                if (!yearRow || !tbody) return;

                // Count left fixed columns: rowspan=2 cells before the first year-group colspan
                const yearCells = Array.from(yearRow.children);
                let leftCount = 0;
                for (const cell of yearCells) {
                    if (!cell.hasAttribute('colspan') && cell.hasAttribute('rowspan')) {
                        leftCount++;
                    } else {
                        break;
                    }
                }
                if (leftCount === 0) return;

                // Use the first data row for width measurement; bail if table is empty
                const refRow = tbody.querySelector('tr');
                if (!refRow || refRow.cells.length === 0) return;
                if (refRow.querySelector('.empty-state')) return;

                const refCells = Array.from(refRow.cells);
                const n = refCells.length;

                // Cumulative left offsets
                const leftOffsets = [];
                let cumLeft = 0;
                for (let i = 0; i < leftCount; i++) {
                    leftOffsets.push(cumLeft);
                    cumLeft += refCells[i]?.offsetWidth || 100;
                }

                // Width of the Actions column (last cell) for Total Cost right offset
                const actionsWidth = refCells[n - 1]?.offsetWidth || 90;

                // --- Year-header-row: left cells ---
                yearCells.forEach((cell, i) => {
                    if (i >= leftCount) return;
                    cell.style.position = 'sticky';
                    cell.style.left = leftOffsets[i] + 'px';
                    cell.style.zIndex = '4';
                    cell.classList.add('col-sticky-left');
                    if (i === leftCount - 1) cell.classList.add('col-sticky-left-last');
                });

                // --- Year-header-row: right cells (after year-group colspans) ---
                let pastGroups = false;
                const rightYearCells = [];
                yearCells.forEach(cell => {
                    if (cell.hasAttribute('colspan')) { pastGroups = true; return; }
                    if (pastGroups) rightYearCells.push(cell);
                });
                let cumRight = 0;
                for (let i = rightYearCells.length - 1; i >= 0; i--) {
                    rightYearCells[i].style.position = 'sticky';
                    rightYearCells[i].style.right = cumRight + 'px';
                    rightYearCells[i].style.zIndex = '4';
                    rightYearCells[i].classList.add('col-sticky-right');
                    if (i === 0) rightYearCells[i].classList.add('col-sticky-right-first');
                    cumRight += rightYearCells[i].offsetWidth || 90;
                }

                // --- Data rows ---
                tbody.querySelectorAll('tr').forEach(row => {
                    const cells  = Array.from(row.cells);
                    const rowLen = cells.length;
                    cells.forEach((cell, i) => {
                        if (i < leftCount) {
                            cell.style.position = 'sticky';
                            cell.style.left = leftOffsets[i] + 'px';
                            cell.style.zIndex = '3';
                            cell.classList.add('col-sticky-left');
                            if (i === leftCount - 1) cell.classList.add('col-sticky-left-last');
                        } else if (i === rowLen - 2) {
                            // Total Cost
                            cell.style.position = 'sticky';
                            cell.style.right = actionsWidth + 'px';
                            cell.style.zIndex = '2';
                            cell.classList.add('col-sticky-right');
                            cell.classList.add('col-sticky-right-first');
                        } else if (i === rowLen - 1) {
                            // Actions
                            cell.style.position = 'sticky';
                            cell.style.right = '0px';
                            cell.style.zIndex = '2';
                            cell.classList.add('col-sticky-right');
                        }
                    });
                });
            });
        });
    }

    // Add a mirrored scrollbar above each table-container so users can scroll
    // horizontally without having to first scroll to the bottom of the table.
    addTopScrollbars() {
        document.querySelectorAll('.table-container').forEach(container => {
            // Remove any existing top scrollbar to avoid duplicates on re-render
            const prev = container.previousElementSibling;
            if (prev && prev.classList.contains('table-top-scrollbar')) {
                prev.remove();
            }

            const table = container.querySelector('table');
            if (!table) return;

            const topScroll = document.createElement('div');
            topScroll.className = 'table-top-scrollbar';
            const inner = document.createElement('div');
            inner.className = 'table-top-scrollbar-inner';
            topScroll.appendChild(inner);

            // Match inner width to the full scrollable width of the table
            inner.style.width = table.scrollWidth + 'px';

            // Sync scroll in both directions, guarded to prevent loops
            let syncing = false;
            topScroll.addEventListener('scroll', () => {
                if (syncing) return;
                syncing = true;
                container.scrollLeft = topScroll.scrollLeft;
                syncing = false;
            });
            container.addEventListener('scroll', () => {
                if (syncing) return;
                syncing = true;
                topScroll.scrollLeft = container.scrollLeft;
                syncing = false;
            });

            container.parentNode.insertBefore(topScroll, container);
        });
    }

    // Unified rate cards table rendering
    renderUnifiedRateCardsTable() {
        const tbody = document.getElementById('rateCardsTable');
        console.log('renderUnifiedRateCardsTable - tbody element:', tbody);
        
        if (!tbody) {
            console.log('rateCardsTable not found');
            return;
        }
        
        tbody.innerHTML = '';
        
        // Access global projectData variable
        const projectData = window.projectData || {};
        if (!projectData.rateCards || projectData.rateCards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No rate cards added yet</td></tr>';
            return;
        }
        
        // Sort by category then by role
        const sortedRates = [...projectData.rateCards].sort((a, b) => {
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }
            return a.role.localeCompare(b.role);
        });
        
        console.log('Rates to render:', sortedRates);
        
        sortedRates.forEach(rate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rate.role}</td>
                <td><span class="category-badge category-${rate.category.toLowerCase()}">${rate.category}</span></td>
                <td>${rate.rate.toLocaleString()}</td>
                <td class="col-actions">${this.createActionButtons(rate.id || rate.role, 'rate-card')}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('Unified rate cards table rendered successfully');
    }

    // Internal resources table with dynamic months and two-row headers
    renderInternalResourcesTable() {
        const tbody = document.getElementById('internalResourcesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.internalResources || projectData.internalResources.length === 0) {
            const monthInfo = this.calculateProjectMonths();
            const colspan = 4 + monthInfo.count + 2; // Fixed columns (Role, Rate Card, Daily Rate, Currency) + months + Total Cost + Actions
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No internal resources added yet</td></tr>`;
            return;
        }

        const monthInfo = this.calculateProjectMonths();

        projectData.internalResources.forEach(resource => {
            let monthlyDays = [];
            let totalDays = 0;

            // Get days for each month
            monthInfo.monthKeys.forEach(monthKey => {
                const days = this.getMonthValue(resource, monthKey, 'q');
                monthlyDays.push(days);
                totalDays += days;
            });

            const totalCost = totalDays * resource.dailyRate;

            // STR-001: staleness check
            const isStale = window.isRateStale ? window.isRateStale(resource) : false;
            const currencyDisplay = resource.currency || (projectData.currency?.primaryCurrency || '');

            const row = document.createElement('tr');
            let rowHTML = `
                <td>${resource.role}</td>
                <td>${resource.rateCard || 'Internal'}</td>
                <td>${resource.dailyRate.toLocaleString()}</td>
                <td>${currencyDisplay}</td>
            `;

            // Add month columns
            monthlyDays.forEach(days => {
                rowHTML += `<td>${days}</td>`;
            });

            // STR-001: cost cell with dual-currency annotation
            const costCellHTML = window.buildCostCellHTML ? window.buildCostCellHTML(resource, totalCost) : totalCost.toLocaleString();
            // STR-001: disable edit button if stale
            const actionButtons = isStale
                ? this.createActionButtons(resource.id, 'internal-resource').replace(
                    'class="edit-btn icon-btn"',
                    'class="edit-btn icon-btn" style="opacity:0.5;pointer-events:none;cursor:not-allowed"'
                  )
                : this.createActionButtons(resource.id, 'internal-resource');

            rowHTML += `
                <td>${costCellHTML}</td>
                <td class="col-actions">${actionButtons}</td>
            `;

            row.innerHTML = rowHTML;
            tbody.appendChild(row);

            // STR-001: append staleness warning sub-row if needed
            if (isStale) {
                const staleRow = document.createElement('tr');
                staleRow.className = 'stale-rate-warning-row';
                const colspan = 4 + monthInfo.count + 2;
                staleRow.innerHTML = `<td colspan="${colspan}" class="stale-rate-warning">The exchange rate for ${resource.currency} has been removed. This entry cannot be modified until a rate is reconfigured in Settings.</td>`;
                tbody.appendChild(staleRow);
            }
        });
    }

    // Vendor costs table with dynamic months and two-row headers
    renderVendorCostsTable() {
        const tbody = document.getElementById('vendorCostsTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.vendorCosts || projectData.vendorCosts.length === 0) {
            const monthInfo = this.calculateProjectMonths();
            const colspan = 4 + monthInfo.count + 2; // Fixed columns (Vendor, Category, Description, Currency) + months + Total Cost + Actions
            tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No vendor costs added yet</td></tr>`;
            return;
        }

        const monthInfo = this.calculateProjectMonths();

        projectData.vendorCosts.forEach(vendor => {
            let monthlyCosts = [];
            let totalCost = 0;

            // Get costs for each month
            monthInfo.monthKeys.forEach(monthKey => {
                const cost = this.getMonthValue(vendor, monthKey, 'q');
                monthlyCosts.push(cost);
                totalCost += cost;
            });

            // STR-001: staleness check
            const isStale = window.isRateStale ? window.isRateStale(vendor) : false;
            const currencyDisplay = vendor.currency || (projectData.currency?.primaryCurrency || '');

            const row = document.createElement('tr');
            let rowHTML = `
                <td>${vendor.vendor}</td>
                <td>${vendor.category}</td>
                <td>${vendor.description}</td>
                <td>${currencyDisplay}</td>
            `;

            // Add month columns
            monthlyCosts.forEach(cost => {
                rowHTML += `<td>${cost.toLocaleString()}</td>`;
            });

            // STR-001: cost cell with dual-currency annotation
            const costCellHTML = window.buildCostCellHTML ? window.buildCostCellHTML(vendor, totalCost) : totalCost.toLocaleString();
            // STR-001: disable edit button if stale
            const actionButtons = isStale
                ? this.createActionButtons(vendor.id, 'vendor-cost').replace(
                    'class="edit-btn icon-btn"',
                    'class="edit-btn icon-btn" style="opacity:0.5;pointer-events:none;cursor:not-allowed"'
                  )
                : this.createActionButtons(vendor.id, 'vendor-cost');

            rowHTML += `
                <td>${costCellHTML}</td>
                <td class="col-actions">${actionButtons}</td>
            `;

            row.innerHTML = rowHTML;
            tbody.appendChild(row);

            // STR-001: append staleness warning sub-row if needed
            if (isStale) {
                const staleRow = document.createElement('tr');
                staleRow.className = 'stale-rate-warning-row';
                const colspan = 4 + monthInfo.count + 2;
                staleRow.innerHTML = `<td colspan="${colspan}" class="stale-rate-warning">The exchange rate for ${vendor.currency} has been removed. This entry cannot be modified until a rate is reconfigured in Settings.</td>`;
                tbody.appendChild(staleRow);
            }
        });
    }
  
    // Tool costs table
    renderToolCostsTable() {
        const tbody = document.getElementById('toolCostsTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.toolCosts || projectData.toolCosts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No tool costs added yet</td></tr>';
            return;
        }
        
        projectData.toolCosts.forEach(tool => {
            const row = document.createElement('tr');

            // STR-001: staleness check
            const isStale = window.isRateStale ? window.isRateStale(tool) : false;
            const currencyDisplay = tool.currency || (projectData.currency?.primaryCurrency || '');

            // Use Tool Costs Manager for formatting if available
            if (window.toolCostsManager) {
                const formatted = window.toolCostsManager.formatToolCostForDisplay(tool);

                // STR-001: cost cell with dual-currency annotation
                const costCellHTML = window.buildCostCellHTML ? window.buildCostCellHTML(tool, formatted.totalCost) : `$${formatted.totalCost.toLocaleString()}`;
                // STR-001: disable edit button if stale
                const actionButtons = isStale
                    ? this.createActionButtons(tool.id, 'tool-cost').replace(
                        'class="edit-btn icon-btn"',
                        'class="edit-btn icon-btn" style="opacity:0.5;pointer-events:none;cursor:not-allowed"'
                      )
                    : this.createActionButtons(tool.id, 'tool-cost');

                row.innerHTML = `
                    <td>${formatted.tool}</td>
                    <td>${formatted.procurementType}</td>
                    <td>${formatted.billingFrequency}</td>
                    <td>$${formatted.costPerPeriod.toLocaleString()}</td>
                    <td>${formatted.quantity}</td>
                    <td>${formatted.startDate}</td>
                    <td>${formatted.endDate}${formatted.isOngoing ? ' <span style="color: #059669;">&#x267E;</span>' : ''}</td>
                    <td>${currencyDisplay}</td>
                    <td>${costCellHTML}</td>
                    <td class="col-actions">${actionButtons}</td>
                `;
            } else {
                // Fallback for old structure
                const totalCost = tool.users * tool.monthlyCost * tool.duration;
                row.innerHTML = `
                    <td>${tool.tool}</td>
                    <td>${tool.licenseType || '-'}</td>
                    <td>${tool.monthlyCost.toLocaleString()}</td>
                    <td>${tool.users}</td>
                    <td>${tool.duration}</td>
                    <td>${currencyDisplay}</td>
                    <td>${totalCost.toLocaleString()}</td>
                    <td class="col-actions">${this.createActionButtons(tool.id, 'tool-cost')}</td>
                `;
            }

            tbody.appendChild(row);

            // STR-001: append staleness warning sub-row if needed
            if (isStale) {
                const staleRow = document.createElement('tr');
                staleRow.className = 'stale-rate-warning-row';
                staleRow.innerHTML = `<td colspan="10" class="stale-rate-warning">The exchange rate for ${tool.currency} has been removed. This entry cannot be modified until a rate is reconfigured in Settings.</td>`;
                tbody.appendChild(staleRow);
            }
        });
    }

    // Miscellaneous costs table
    renderMiscCostsTable() {
        const tbody = document.getElementById('miscCostsTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.miscCosts || projectData.miscCosts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No miscellaneous costs added yet</td></tr>';
            return;
        }
        
        projectData.miscCosts.forEach(misc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${misc.item}</td>
                <td>${misc.description}</td>
                <td>${misc.category}</td>
                <td>${misc.cost.toLocaleString()}</td>
                <td class="col-actions">${this.createActionButtons(misc.id, 'misc-cost')}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Risks table
    renderRisksTable() {
        const tbody = document.getElementById('risksTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.risks || projectData.risks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No risks added yet</td></tr>';
            return;
        }
        
        projectData.risks.forEach(risk => {
            const riskScore = risk.probability * risk.impact;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${risk.description}</td>
                <td>${risk.probability}</td>
                <td>${risk.impact}</td>
                <td>${riskScore}</td>
                <td>${(risk.mitigationCost || 0).toLocaleString()}</td>
                <td class="col-actions">${this.createActionButtons(risk.id, 'risk')}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Internal rates table (backward compatibility)
    renderInternalRatesTable() {
        const tbody = document.getElementById('internalRatesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.rateCards) return;
        
        // Show internal rates from unified rateCards
        const internalRates = projectData.rateCards.filter(rate => rate.category === 'Internal');
        
        if (internalRates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No internal rates added yet</td></tr>';
            return;
        }
        
        internalRates.forEach(rate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rate.role}</td>
                <td>${rate.rate.toLocaleString()}</td>
                <td class="col-actions">${this.createActionButtons(rate.id || rate.role, 'rate-card')}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // External rates table (backward compatibility)
    renderExternalRatesTable() {
        const tbody = document.getElementById('externalRatesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const projectData = window.projectData || {};
        if (!projectData.rateCards) return;
        
        // Show external rates from unified rateCards
        const externalRates = projectData.rateCards.filter(rate => rate.category === 'External');
        
        if (externalRates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No external rates added yet</td></tr>';
            return;
        }
        
        externalRates.forEach(rate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rate.role}</td>
                <td>${rate.rate.toLocaleString()}</td>
                <td class="col-actions">${this.createActionButtons(rate.id || rate.role, 'rate-card')}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // ============= FIXED FORECAST TABLE WITH ALL 5 ROWS =============
    renderForecastTable() {
        console.log('🎯 Starting renderForecastTable with COMPLETE 5-row structure...');
        
        const tbody = document.getElementById('forecastTable');
        const projectData = window.projectData || {};
        
        if (!tbody) {
            console.error('❌ forecastTable tbody not found!');
            return;
        }
        
        if (!projectData) {
            console.warn('⚠️  No projectData available');
            tbody.innerHTML = '<tr><td colspan="13" class="empty-state">No project data available</td></tr>';
            return;
        }
        
        // Update headers first
        this.updateTableHeaders();
        
        tbody.innerHTML = '';
        
        const monthInfo = this.calculateProjectMonths();
        const projectStart = projectData.projectInfo?.startDate ? new Date(projectData.projectInfo.startDate) : null;
        
        console.log('📅 Rendering forecast with month info:', monthInfo);
        console.log('🗓️ Project start date:', projectStart);
        
        // Initialize arrays for ALL categories
        const internalMonthly = new Array(monthInfo.count).fill(0);
        const vendorMonthly = new Array(monthInfo.count).fill(0);
        const toolMonthly = new Array(monthInfo.count).fill(0);
        const miscMonthly = new Array(monthInfo.count).fill(0);
        
        // Calculate Internal Resources
        if (projectData.internalResources && projectData.internalResources.length > 0) {
            console.log(`👥 Processing ${projectData.internalResources.length} internal resources`);
            projectData.internalResources.forEach(resource => {
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const days = this.getMonthValue(resource, monthKey, 'q');
                    internalMonthly[index] += days * (resource.dailyRate || 0);
                });
            });
        }
        
        // Calculate Vendor Costs
        if (projectData.vendorCosts && projectData.vendorCosts.length > 0) {
            console.log(`🏢 Processing ${projectData.vendorCosts.length} vendor costs`);
            projectData.vendorCosts.forEach(vendor => {
                monthInfo.monthKeys.forEach((monthKey, index) => {
                    const cost = this.getMonthValue(vendor, monthKey, 'q');
                    vendorMonthly[index] += cost;
                });
            });
        }
        
        // Calculate Tool Costs - FIXED VERSION
        if (projectData.toolCosts && projectData.toolCosts.length > 0) {
            console.log(`🔧 Processing ${projectData.toolCosts.length} tool costs`);
            
            projectData.toolCosts.forEach((tool, toolIndex) => {
                console.log(`\n📦 Tool ${toolIndex + 1}: ${tool.tool}`);
                console.log('   Data:', {
                    costPerPeriod: tool.costPerPeriod,
                    quantity: tool.quantity,
                    billingFrequency: tool.billingFrequency,
                    isOngoing: tool.isOngoing,
                    startDate: tool.startDate,
                    endDate: tool.endDate
                });
                
                let costPerMonth = 0;
                let startMonthIndex = 0;
                let endMonthIndex = monthInfo.count - 1;
                
                if (tool.users && tool.monthlyCost) {
                    // OLD structure
                    costPerMonth = (tool.users || 0) * (tool.monthlyCost || 0);
                    const toolDuration = tool.duration || 0;
                    endMonthIndex = Math.min(toolDuration - 1, monthInfo.count - 1);
                    console.log(`   📊 Old structure: $${costPerMonth}/month for ${toolDuration} months`);
                    
                } else if (tool.costPerPeriod !== undefined && tool.billingFrequency) {
                    // NEW structure
                    const costPerPeriod = parseFloat(tool.costPerPeriod) || 0;
                    const quantity = parseInt(tool.quantity) || 1;
                    const billingFreq = tool.billingFrequency.toLowerCase();
                    const fullCharge = costPerPeriod * quantity;
                    
                    // Calculate start month
                    if (tool.startDate && projectStart) {
                        const toolStart = new Date(tool.startDate);
                        startMonthIndex = Math.max(0, Math.floor((toolStart - projectStart) / (1000 * 60 * 60 * 24 * 30)));
                    }
                    
                    // Calculate end month
                    if (tool.isOngoing) {
                        endMonthIndex = monthInfo.count - 1;
                        console.log(`   ♾️  Ongoing: months ${startMonthIndex + 1}-${monthInfo.count}`);
                    } else if (tool.endDate && projectStart) {
                        const toolEnd = new Date(tool.endDate);
                        endMonthIndex = Math.min(monthInfo.count - 1, Math.floor((toolEnd - projectStart) / (1000 * 60 * 60 * 24 * 30)));
                        console.log(`   📆 Date range: months ${startMonthIndex + 1}-${endMonthIndex + 1}`);
                    }
                    
                    if (billingFreq === 'monthly') {
                        // Monthly: charge every month
                        costPerMonth = fullCharge;
                        console.log(`   💰 Monthly: $${costPerMonth}/month`);
                        
                    } else if (billingFreq === 'quarterly') {
                        // Quarterly: charge every 3 months (months 1, 4, 7, 10, etc.)
                        console.log(`   📅 Quarterly: $${fullCharge} every 3 months`);
                        let billingMonths = [];
                        for (let i = startMonthIndex; i <= endMonthIndex; i += 3) {
                            toolMonthly[i] += fullCharge;
                            billingMonths.push(i + 1);
                        }
                        const totalForTool = fullCharge * billingMonths.length;
                        console.log(`   ✅ Added $${fullCharge} to months: ${billingMonths.join(', ')} = $${totalForTool} total`);
                        return; // Already distributed
                        
                    } else if (billingFreq === 'annual') {
                        // Annual: charge every 12 months (months 1, 13, 25, etc.)
                        console.log(`   📅 Annual: $${fullCharge} every 12 months`);
                        let billingMonths = [];
                        for (let i = startMonthIndex; i <= endMonthIndex; i += 12) {
                            toolMonthly[i] += fullCharge;
                            billingMonths.push(i + 1);
                        }
                        const totalForTool = fullCharge * billingMonths.length;
                        console.log(`   ✅ Added $${fullCharge} to months: ${billingMonths.join(', ')} = $${totalForTool} total`);
                        return; // Already distributed
                        
                    } else if (billingFreq === 'one-time') {
                        // One-time: single charge in the start month
                        console.log(`   🎯 One-time: $${fullCharge} total`);
                        toolMonthly[startMonthIndex] += fullCharge;
                        console.log(`   ✅ Added $${fullCharge} to month ${startMonthIndex + 1}`);
                        return; // Already distributed
                        
                    } else {
                        console.warn(`   ⚠️  Unknown billing frequency: "${tool.billingFrequency}" - skipping this tool`);
                        return;
                    }
                }
                
                // Distribute MONTHLY recurring costs only (quarterly/annual/one-time already handled above)
                if (costPerMonth > 0) {
                    console.log(`   💵 Monthly cost to distribute: $${costPerMonth}`);
                    for (let i = startMonthIndex; i <= endMonthIndex; i++) {
                        toolMonthly[i] += costPerMonth;
                    }
                    const totalForTool = costPerMonth * (endMonthIndex - startMonthIndex + 1);
                    console.log(`   ✅ Distributed: $${costPerMonth}/month × ${endMonthIndex - startMonthIndex + 1} months = $${totalForTool} total`);
                } else if (costPerMonth === 0) {
                    console.warn(`   ⚠️  costPerMonth is $0 - nothing to distribute!`);
                }
            });
        }
        
        // Calculate Miscellaneous
        if (projectData.miscCosts && projectData.miscCosts.length > 0) {
            console.log(`📋 Processing ${projectData.miscCosts.length} miscellaneous costs`);
            projectData.miscCosts.forEach(misc => {
                const costPerMonth = (misc.cost || 0) / monthInfo.count;
                for (let i = 0; i < monthInfo.count; i++) {
                    miscMonthly[i] += costPerMonth;
                }
            });
        }
        
        // Calculate totals
        const internalTotal = internalMonthly.reduce((sum, val) => sum + val, 0);
        const vendorTotal = vendorMonthly.reduce((sum, val) => sum + val, 0);
        const toolTotal = toolMonthly.reduce((sum, val) => sum + val, 0);
        const miscTotal = miscMonthly.reduce((sum, val) => sum + val, 0);
        const grandTotal = internalTotal + vendorTotal + toolTotal + miscTotal;
        
        console.log('\n💰 Forecast totals:', {
            internal: `$${Math.round(internalTotal).toLocaleString()}`,
            vendor: `$${Math.round(vendorTotal).toLocaleString()}`,
            tool: `$${Math.round(toolTotal).toLocaleString()}`,
            misc: `$${Math.round(miscTotal).toLocaleString()}`,
            grand: `$${Math.round(grandTotal).toLocaleString()}`
        });
        
        // Build HTML rows
        let internalRowHTML = '<td>Internal Resources</td>';
        internalMonthly.forEach(cost => {
            internalRowHTML += `<td>$${Math.round(cost).toLocaleString()}</td>`;
        });
        internalRowHTML += `<td><strong>$${Math.round(internalTotal).toLocaleString()}</strong></td>`;

        let vendorRowHTML = '<td>Vendor Costs</td>';
        vendorMonthly.forEach(cost => {
            vendorRowHTML += `<td>$${Math.round(cost).toLocaleString()}</td>`;
        });
        vendorRowHTML += `<td><strong>$${Math.round(vendorTotal).toLocaleString()}</strong></td>`;

        let toolRowHTML = '<td>Tool Costs</td>';
        toolMonthly.forEach(cost => {
            toolRowHTML += `<td>$${Math.round(cost).toLocaleString()}</td>`;
        });
        toolRowHTML += `<td><strong>$${Math.round(toolTotal).toLocaleString()}</strong></td>`;

        let miscRowHTML = '<td>Miscellaneous</td>';
        miscMonthly.forEach(cost => {
            miscRowHTML += `<td>$${Math.round(cost).toLocaleString()}</td>`;
        });
        miscRowHTML += `<td><strong>$${Math.round(miscTotal).toLocaleString()}</strong></td>`;
        
        let totalRowHTML = '<td><strong style="font-size: 1.1em;">Total</strong></td>';
        for (let i = 0; i < monthInfo.count; i++) {
            const monthTotal = internalMonthly[i] + vendorMonthly[i] + toolMonthly[i] + miscMonthly[i];
            totalRowHTML += `<td><strong>$${Math.round(monthTotal).toLocaleString()}</strong></td>`;
        }
        totalRowHTML += `<td><strong style="font-size: 1.1em;">$${Math.round(grandTotal).toLocaleString()}</strong></td>`;
        
        // Render ALL 5 ROWS
        tbody.innerHTML = `
            <tr>${internalRowHTML}</tr>
            <tr>${vendorRowHTML}</tr>
            <tr>${toolRowHTML}</tr>
            <tr>${miscRowHTML}</tr>
            <tr class="total-row" style="background-color: #f4f4f5; font-weight: bold; border-top: 2px solid #e4e4e7;">${totalRowHTML}</tr>
        `;
        
        console.log('✅ Forecast table rendered successfully with ALL 5 ROWS\n');
    }
}

// Data update integration for edit functionality
function updateItemById(itemId, newData, itemType) {
    const projectData = window.projectData || {};
    // DOM dataset values are always strings; stored IDs (Date.now()) are numbers.
    // Normalise so === comparison works regardless of which type is passed in.
    const numId = Number(itemId);
    const id = isNaN(numId) ? itemId : numId;

    switch (itemType) {
        case 'internal-resource':
            const resourceIndex = projectData.internalResources.findIndex(r => r.id === id);
            if (resourceIndex !== -1) {
                Object.assign(projectData.internalResources[resourceIndex], newData);
                const rate = projectData.rateCards.find(r => r.role === newData.role);
                if (rate) {
                    // STR-001: only overwrite dailyRate from rate card when no foreign currency conversion is stored
                    const primaryCurrency = projectData.currency?.primaryCurrency || '';
                    const entryCurrency = projectData.internalResources[resourceIndex].currency;
                    if (!entryCurrency || entryCurrency === primaryCurrency) {
                        projectData.internalResources[resourceIndex].dailyRate = rate.rate;
                    }
                    projectData.internalResources[resourceIndex].rateCard = rate.category;
                }
            }
            break;
            
        case 'vendor-cost':
            const vendorIndex = projectData.vendorCosts.findIndex(v => v.id === id);
            if (vendorIndex !== -1) {
                Object.assign(projectData.vendorCosts[vendorIndex], newData);
            }
            break;

        case 'tool-cost':
            const toolIndex = projectData.toolCosts.findIndex(t => t.id === id);
            if (toolIndex !== -1) {
                Object.assign(projectData.toolCosts[toolIndex], newData);
            }
            break;

        case 'misc-cost':
            const miscIndex = projectData.miscCosts.findIndex(m => m.id === id);
            if (miscIndex !== -1) {
                Object.assign(projectData.miscCosts[miscIndex], newData);
            }
            break;

        case 'risk':
            const riskIndex = projectData.risks.findIndex(r => r.id === id);
            if (riskIndex !== -1) {
                Object.assign(projectData.risks[riskIndex], newData);
            }
            break;

        case 'rate-card':
            const rateIndex = projectData.rateCards.findIndex(r =>
                (r.id && r.id === id) || r.role === itemId
            );
            if (rateIndex !== -1) {
                Object.assign(projectData.rateCards[rateIndex], newData);

                if (newData.category === 'Internal') {
                    const internalIndex = projectData.internalRates?.findIndex(r =>
                        (r.id && r.id === id) || r.role === itemId
                    );
                    if (internalIndex !== -1 && projectData.internalRates) {
                        Object.assign(projectData.internalRates[internalIndex], {
                            role: newData.role,
                            rate: newData.rate
                        });
                    }
                } else if (newData.category === 'External') {
                    const externalIndex = projectData.externalRates?.findIndex(r =>
                        (r.id && r.id === id) || r.role === itemId
                    );
                    if (externalIndex !== -1 && projectData.externalRates) {
                        Object.assign(projectData.externalRates[externalIndex], {
                            role: newData.role,
                            rate: newData.rate
                        });
                    }
                }
            }
            break;
    }
    
    if (window.DataManager && window.DataManager.saveToLocalStorage) {
        window.DataManager.saveToLocalStorage();
    }
}

// Create and export table renderer instance
const tableRenderer = new TableRenderer();

// Make it globally available
window.tableRenderer = tableRenderer;
window.TableRenderer = tableRenderer;

// Export individual functions for backward compatibility
window.renderAllTables = () => tableRenderer.renderAllTables();
window.renderUnifiedRateCardsTable = () => tableRenderer.renderUnifiedRateCardsTable();
window.renderInternalResourcesTable = () => tableRenderer.renderInternalResourcesTable();
window.renderVendorCostsTable = () => tableRenderer.renderVendorCostsTable();
window.renderToolCostsTable = () => tableRenderer.renderToolCostsTable();
window.renderMiscCostsTable = () => tableRenderer.renderMiscCostsTable();
window.renderRisksTable = () => tableRenderer.renderRisksTable();
window.renderInternalRatesTable = () => tableRenderer.renderInternalRatesTable();
window.renderExternalRatesTable = () => tableRenderer.renderExternalRatesTable();
window.renderForecastTable = () => tableRenderer.renderForecastTable();
window.updateTableHeaders = () => tableRenderer.updateTableHeaders();
window.updateItemById = updateItemById;

console.log('✅ Enhanced Table Renderer module loaded - COMPLETE with 5-row forecast and tool cost fixes');
