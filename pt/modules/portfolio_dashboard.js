/**
 * Portfolio Dashboard Module
 * Handles all UI rendering for portfolio views including:
 * - Dashboard summary cards
 * - Cost breakdown charts
 * - Project list
 * - Timeline table
 * - Comparison table
 * - Tab navigation
 */

class PortfolioDashboard {
    constructor() {
        this.initialized = false;
        this.currentTab = 'dashboard';
        console.log('📈 Portfolio Dashboard constructed');
    }

    initialize() {
        console.log('📈 Initializing Portfolio Dashboard...');
        this.setupTabNavigation();
        this.initialized = true;
        console.log('✓ Portfolio Dashboard initialized');
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Setup comparison sort listener
        const sortSelect = document.getElementById('comparisonSortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.renderComparison();
            });
        }

        console.log('✓ Tab navigation set up');
    }

    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        this.currentTab = tabName;

        // Render content for this tab
        const projects = window.portfolioManager.getProjects();
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard(projects);
                break;
            case 'projects':
                this.renderProjectsList(projects);
                break;
            case 'timeline':
                this.renderTimeline(projects);
                break;
            case 'comparison':
                this.renderComparison(projects);
                break;
        }
    }

    /**
     * Render the main dashboard
     */
    renderDashboard(projects) {
        if (!projects || projects.length === 0) {
            return;
        }

        const calc = window.portfolioCostCalculator;

        // Update summary cards
        this.updateSummaryCards(projects);

        // Render cost breakdown chart
        this.renderCostBreakdownChart(projects);

        // Render timeline chart
        this.renderTimelineChart(projects);
    }

    /**
     * Update summary cards with portfolio metrics
     */
    updateSummaryCards(projects) {
        const calc = window.portfolioCostCalculator;

        // Total projects
        const totalProjectsEl = document.getElementById('totalProjectsCount');
        if (totalProjectsEl) {
            totalProjectsEl.textContent = projects.length;
        }

        // Total portfolio value
        const totalValue = calc.calculateTotalPortfolioCost(projects);
        const totalValueEl = document.getElementById('totalPortfolioValue');
        if (totalValueEl) {
            totalValueEl.textContent = calc.formatCurrency(totalValue);
        }

        // Timeline range
        const timelineRange = calc.getTimelineRange(projects);
        const timelineEl = document.getElementById('timelineRange');
        if (timelineEl) {
            timelineEl.textContent = timelineRange;
        }

        // Peak resource demand
        const peakDemand = calc.calculatePeakResourceDemand(projects);
        const peakEl = document.getElementById('peakResourceDemand');
        if (peakEl) {
            peakEl.textContent = `${peakDemand.peak} FTE`;
            if (peakDemand.month) {
                peakEl.title = `Peak occurs in ${peakDemand.month}`;
            }
        }
    }

    /**
     * Render cost breakdown chart (simple bar chart)
     */
    renderCostBreakdownChart(projects) {
        const container = document.getElementById('costBreakdownChart');
        if (!container) return;

        container.innerHTML = '';

        const calc = window.portfolioCostCalculator;
        const sorted = projects.sort((a, b) => b.costs.total - a.costs.total);

        const maxCost = Math.max(...sorted.map(p => p.costs.total));

        const html = `
            <div class="horizontal-bar-chart">
                ${sorted.map(project => {
                    const percentage = (project.costs.total / maxCost) * 100;
                    return `
                        <div class="bar-row">
                            <div class="bar-label">${this.escapeHtml(project.metadata.projectName)}</div>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${percentage}%;">
                                    <span class="bar-value">${calc.formatCurrency(project.costs.total)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render timeline chart (monthly costs over time)
     */
    /**
     * Pick round axis values ("nice numbers") instead of fractions of the max.
     *
     * The step is snapped to 1, 2, 2.5 or 5 x a power of ten, so a portfolio
     * peaking at 416,985 gets ticks every 100,000 and one peaking at 2.3M gets
     * ticks every 500,000 — rather than the previous max / max-over-2 / 0.
     *
     * @param {number} maxValue - largest value that must fit on the axis
     * @param {number} targetTicks - roughly how many intervals to aim for
     * @returns {{axisMax: number, step: number, ticks: number[]}}
     */
    niceScale(maxValue, targetTicks = 5) {
        if (!isFinite(maxValue) || maxValue <= 0) {
            return { axisMax: 0, step: 0, ticks: [0] };
        }

        const rawStep = maxValue / targetTicks;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalised = rawStep / magnitude;

        let niceNormalised;
        if (normalised <= 1) niceNormalised = 1;
        else if (normalised <= 2) niceNormalised = 2;
        else if (normalised <= 2.5) niceNormalised = 2.5;
        else if (normalised <= 5) niceNormalised = 5;
        else niceNormalised = 10;

        const step = niceNormalised * magnitude;
        const axisMax = Math.ceil(maxValue / step) * step;

        const ticks = [];
        for (let value = 0; value <= axisMax + step / 2; value += step) {
            ticks.push(Math.round(value * 1e6) / 1e6);
        }

        return { axisMax, step, ticks };
    }

    /**
     * Compact axis tick label. One unit is chosen from the axis maximum so the
     * whole axis reads consistently ($0 / $100k / $200k), never a mix.
     *
     * The label must state the tick exactly: a 250,000 step shown as "$0.3M"
     * would misreport it, so the number of decimals is the fewest that
     * represents the value without rounding, and thousands are only abbreviated
     * once the axis is large enough for whole-ish values.
     */
    formatAxisTick(value, axisMax) {
        if (value === 0) return '$0';

        const units = [
            { divisor: 1000000, suffix: 'M', minAxis: 1000000 },
            { divisor: 1000, suffix: 'k', minAxis: 10000 },
            { divisor: 1, suffix: '', minAxis: 0 }
        ];
        const unit = units.find(u => axisMax >= u.minAxis) || units[units.length - 1];

        if (unit.divisor === 1) {
            return `$${Math.round(value).toLocaleString()}`;
        }

        const scaled = value / unit.divisor;
        let decimals = 0;
        while (decimals < 2 && Math.abs(scaled - Number(scaled.toFixed(decimals))) > 1e-9) {
            decimals++;
        }

        return `$${scaled.toFixed(decimals)}${unit.suffix}`;
    }

    /**
     * Stable colour slot for a project.
     *
     * Slots are handed out first-come and never reassigned, so removing one
     * project does not repaint the others — colour follows the project, not its
     * position in the current list.
     */
    getProjectColorSlot(projectId) {
        if (!this._projectColorSlots) {
            this._projectColorSlots = new Map();
        }
        if (!this._projectColorSlots.has(projectId)) {
            this._projectColorSlots.set(projectId, this._projectColorSlots.size);
        }
        return this._projectColorSlots.get(projectId);
    }

    renderTimelineChart(projects) {
        const container = document.getElementById('costTrendChart');
        if (!container) return;

        container.innerHTML = '';

        const calc = window.portfolioCostCalculator;
        const monthlyCosts = calc.calculateMonthlyCosts(projects);

        if (monthlyCosts.months.length === 0) {
            container.innerHTML = '<p class="text-muted">No timeline data available</p>';
            return;
        }

        const maxCost = Math.max(...monthlyCosts.totals, 0);
        const scale = this.niceScale(maxCost);
        const axisMax = scale.axisMax || 1;
        const peakIndex = monthlyCosts.totals.indexOf(maxCost);

        // Series capped at 8 distinct colours; anything beyond folds into "Other"
        const MAX_SERIES = 8;
        const seriesFor = (entry) => {
            const slot = this.getProjectColorSlot(entry.id);
            return slot < MAX_SERIES
                ? { slot, name: entry.name }
                : { slot: -1, name: 'Other' };
        };

        // Legend entries, in slot order, for every project appearing in the range
        const legend = new Map();
        monthlyCosts.timeline.forEach(month => {
            (monthlyCosts.breakdown[month.key].projects || []).forEach(entry => {
                const series = seriesFor(entry);
                if (!legend.has(series.name)) {
                    legend.set(series.name, series.slot);
                }
            });
        });

        const gridHtml = scale.ticks.map(tick => {
            const bottom = (tick / axisMax) * 100;
            return `
                <div class="tl-gridline" style="bottom: ${bottom.toFixed(4)}%;">
                    <span class="tl-tick">${this.formatAxisTick(tick, axisMax)}</span>
                </div>
            `;
        }).join('');

        const barsHtml = monthlyCosts.timeline.map((month, index) => {
            const monthData = monthlyCosts.breakdown[month.key];
            const total = monthlyCosts.totals[index];
            const stackHeight = (total / axisMax) * 100;
            const contributors = monthData.projects || [];

            // Segments are emitted bottom-up; the stack is column-reverse
            const segments = contributors.map(entry => {
                const series = seriesFor(entry);
                const share = total > 0 ? (entry.cost / total) * 100 : 0;
                const colorVar = series.slot < 0
                    ? 'var(--series-other)'
                    : `var(--series-${series.slot + 1})`;
                const label = `${month.label} · ${series.name}: ${calc.formatCurrency(entry.cost)}`;
                return `<div class="tl-seg" style="height: ${share.toFixed(4)}%; background: ${colorVar};" title="${this.escapeHtml(label)}"></div>`;
            }).join('');

            // Direct-label only the peak month; the gridlines carry the rest
            const peakLabel = (index === peakIndex && total > 0)
                ? `<div class="tl-peak">${calc.formatCurrency(total)}</div>`
                : '';

            return `
                <div class="tl-col">
                    ${peakLabel}
                    <div class="tl-stack" style="height: ${stackHeight.toFixed(4)}%;"
                         title="${this.escapeHtml(`${month.label} total: ${calc.formatCurrency(total)}`)}">
                        ${segments}
                    </div>
                </div>
            `;
        }).join('');

        const xAxisHtml = monthlyCosts.timeline
            .map(month => `<div class="tl-xlabel"><span>${this.escapeHtml(month.label)}</span></div>`)
            .join('');

        const legendHtml = [...legend.entries()].map(([name, slot]) => {
            const colorVar = slot < 0 ? 'var(--series-other)' : `var(--series-${slot + 1})`;
            return `
                <div class="tl-legend-item">
                    <span class="tl-swatch" style="background: ${colorVar};"></span>
                    <span class="tl-legend-label">${this.escapeHtml(name)}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="timeline-chart">
                <div class="tl-plot">
                    <div class="tl-gridlines">${gridHtml}</div>
                    <div class="tl-bars">${barsHtml}</div>
                </div>
                <div class="tl-xaxis">${xAxisHtml}</div>
                ${legend.size > 1 ? `<div class="tl-legend">${legendHtml}</div>` : ''}
            </div>
        `;
    }

    /**
     * Render projects list
     */
    renderProjectsList(projects) {
        const container = document.getElementById('projectsList');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;">
                        <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" fill="currentColor"/>
                    </svg>
                    <p>No projects loaded yet. Upload project files to get started.</p>
                </div>
            `;
            return;
        }

        const calc = window.portfolioCostCalculator;

        const html = projects.map(project => {
            const duration = calc.calculateProjectDuration(project);
            return `
                <div class="project-card" data-project-id="${project.id}">
                    <div class="project-card-header">
                        <div>
                            <h3 class="project-name">${this.escapeHtml(project.metadata.projectName)}</h3>
                            <p class="project-file-name">${this.escapeHtml(project.fileName)}</p>
                        </div>
                        <button class="btn-icon btn-danger" onclick="window.portfolioDashboard.removeProject('${project.id}')" title="Remove project">
                            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="project-card-details">
                        <div class="detail-row">
                            <span class="detail-label">Project Manager:</span>
                            <span class="detail-value">${this.escapeHtml(project.metadata.projectManager) || '-'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">${project.metadata.startDate ? project.metadata.startDate : '-'} to ${project.metadata.endDate ? project.metadata.endDate : '-'} (${duration} months)</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Cost:</span>
                            <span class="detail-value cost-value">${calc.formatCurrency(project.costs.total)}</span>
                        </div>
                    </div>

                    <div class="project-card-breakdown">
                        <div class="breakdown-item">
                            <span class="breakdown-label">Internal</span>
                            <span class="breakdown-value">${calc.formatCurrency(project.costs.internal.total)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">External</span>
                            <span class="breakdown-value">${calc.formatCurrency(project.costs.external.total)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Tools</span>
                            <span class="breakdown-value">${calc.formatCurrency(project.costs.tools.total)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Misc</span>
                            <span class="breakdown-value">${calc.formatCurrency(project.costs.misc.total)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Contingency</span>
                            <span class="breakdown-value">${calc.formatCurrency(project.costs.contingency)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Remove a project from portfolio
     */
    removeProject(projectId) {
        if (confirm('Are you sure you want to remove this project from the portfolio?')) {
            window.portfolioManager.removeProject(projectId);
        }
    }

    /**
     * Render timeline table with monthly breakdown
     */
    renderTimeline(projects) {
        const container = document.getElementById('timelineTable');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p class="empty-state">No projects loaded</p>';
            return;
        }

        const calc = window.portfolioCostCalculator;
        const monthlyCosts = calc.calculateMonthlyCosts(projects);

        if (monthlyCosts.months.length === 0) {
            container.innerHTML = '<p class="empty-state">No timeline data available</p>';
            return;
        }

        let html = `
            <div class="timeline-table-scroll">
                <table class="data-table timeline-table">
                    <thead>
                        <tr>
                            <th class="fixed-column">Month</th>
                            <th>Internal</th>
                            <th>External</th>
                            <th>Tools</th>
                            <th>Misc</th>
                            <th>Total</th>
                            <th>Projects Contributing</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        monthlyCosts.timeline.forEach(month => {
            const costs = monthlyCosts.breakdown[month.key];
            const projectsList = costs.projects.map(p => p.name).join(', ') || '-';

            html += `
                <tr>
                    <td class="fixed-column"><strong>${month.label}</strong></td>
                    <td class="text-right">${calc.formatCurrency(costs.internal)}</td>
                    <td class="text-right">${calc.formatCurrency(costs.external)}</td>
                    <td class="text-right">${calc.formatCurrency(costs.tools)}</td>
                    <td class="text-right">${calc.formatCurrency(costs.misc)}</td>
                    <td class="text-right"><strong>${calc.formatCurrency(costs.total)}</strong></td>
                    <td class="project-list-cell">${this.escapeHtml(projectsList)}</td>
                </tr>
            `;
        });

        // Issue #4: this row previously showed the contingency-inclusive total
        // above contingency-exclusive columns, so it reconciled in neither
        // direction — the category columns summed to the subtotal, not the
        // stated total, and neither did the monthly rows above it.
        // Contingency is a project-level figure with no monthly breakdown, so it
        // is shown as its own row rather than invented per month.
        const breakdown = calc.getCostBreakdown(projects);
        const subtotal = breakdown.internal + breakdown.external + breakdown.tools + breakdown.misc;
        html += `
                <tr class="subtotal-row">
                    <td class="fixed-column"><strong>SUBTOTAL</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.internal)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.external)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.tools)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.misc)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(subtotal)}</strong></td>
                    <td></td>
                </tr>
                <tr class="contingency-row">
                    <td class="fixed-column">Contingency</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">${calc.formatCurrency(breakdown.contingency)}</td>
                    <td></td>
                </tr>
                <tr class="total-row">
                    <td class="fixed-column"><strong>TOTAL</strong></td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right">-</td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.total)}</strong></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render project comparison table
     */
    renderComparison(projects) {
        const container = document.getElementById('comparisonTable');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p class="empty-state">No projects to compare</p>';
            return;
        }

        const sortSelect = document.getElementById('comparisonSortBy');
        const sortBy = sortSelect ? sortSelect.value : 'cost-desc';

        const calc = window.portfolioCostCalculator;
        const comparison = calc.compareProjects(projects, sortBy);

        let html = `
            <div class="comparison-table-scroll">
                <table class="data-table comparison-table">
                    <thead>
                        <tr>
                            <th class="fixed-column">Project Name</th>
                            <th>Project Manager</th>
                            <th>Duration (Months)</th>
                            <th>Total Cost</th>
                            <th>Cost/Month</th>
                            <th>Internal Cost</th>
                            <th>External Cost</th>
                            <th>Tools Cost</th>
                            <th>Misc Cost</th>
                            <th>Contingency</th>
                            <th>Resource Count</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        comparison.forEach(project => {
            html += `
                <tr>
                    <td class="fixed-column"><strong>${this.escapeHtml(project.metadata.projectName)}</strong></td>
                    <td>${this.escapeHtml(project.metadata.projectManager) || '-'}</td>
                    <td class="text-center">${project.comparison.duration}</td>
                    <td class="text-right"><strong>${calc.formatCurrency(project.costs.total)}</strong></td>
                    <td class="text-right">${calc.formatCurrency(project.comparison.costPerMonth)}</td>
                    <td class="text-right">${calc.formatCurrency(project.costs.internal.total)}</td>
                    <td class="text-right">${calc.formatCurrency(project.costs.external.total)}</td>
                    <td class="text-right">${calc.formatCurrency(project.costs.tools.total)}</td>
                    <td class="text-right">${calc.formatCurrency(project.costs.misc.total)}</td>
                    <td class="text-right">${calc.formatCurrency(project.costs.contingency)}</td>
                    <td class="text-center">${project.comparison.resourceCount}</td>
                </tr>
            `;
        });

        // Add totals row
        // Issue #5: duration was summed across projects, so two 6-month projects
        // running partly in parallel reported 12 months for a portfolio that
        // actually spans 8 calendar months — and Cost/Month, derived from that
        // inflated figure, was understated by the same proportion. Use the real
        // portfolio span (earliest start -> latest end), which is exactly what
        // the monthly timeline already walks and what the Dashboard reports as
        // its Timeline Range.
        const breakdown = calc.getCostBreakdown(projects);
        const portfolioTimeline = calc.calculateMonthlyCosts(projects);
        const portfolioMonths = portfolioTimeline && portfolioTimeline.timeline
            ? portfolioTimeline.timeline.length
            : 0;
        const avgCostPerMonth = portfolioMonths > 0 ? breakdown.total / portfolioMonths : 0;
        const totalResources = comparison.reduce((sum, p) => sum + p.comparison.resourceCount, 0);

        html += `
                <tr class="total-row">
                    <td class="fixed-column"><strong>TOTAL</strong></td>
                    <td></td>
                    <td class="text-center"><strong>${portfolioMonths}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.total)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(avgCostPerMonth)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.internal)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.external)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.tools)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.misc)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.contingency)}</strong></td>
                    <td class="text-center"><strong>${totalResources}</strong></td>
                </tr>
            </tbody>
        </table>
        </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create and export instance
window.portfolioDashboard = new PortfolioDashboard();
console.log('📈 Portfolio Dashboard module loaded');
