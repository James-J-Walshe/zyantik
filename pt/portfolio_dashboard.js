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

        const maxCost = Math.max(...monthlyCosts.totals);

        const html = `
            <div class="timeline-chart">
                <div class="timeline-chart-bars">
                    ${monthlyCosts.months.map((month, index) => {
                        const cost = monthlyCosts.totals[index];
                        const height = maxCost > 0 ? (cost / maxCost) * 100 : 0;
                        return `
                            <div class="timeline-bar-column">
                                <div class="timeline-bar-container">
                                    <div class="timeline-bar" style="height: ${height}%;" 
                                         title="${month}: ${calc.formatCurrency(cost)}">
                                    </div>
                                </div>
                                <div class="timeline-label">${month}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="timeline-y-axis">
                    <div class="y-axis-label">${calc.formatCurrency(maxCost)}</div>
                    <div class="y-axis-label">${calc.formatCurrency(maxCost / 2)}</div>
                    <div class="y-axis-label">$0</div>
                </div>
            </div>
        `;

        container.innerHTML = html;
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
                    <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; color: #9CA3AF; margin-bottom: 1rem;">
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

        // Add totals row
        const breakdown = calc.getCostBreakdown(projects);
        html += `
                <tr class="total-row">
                    <td class="fixed-column"><strong>TOTAL</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.internal)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.external)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.tools)}</strong></td>
                    <td class="text-right"><strong>${calc.formatCurrency(breakdown.misc)}</strong></td>
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
        const breakdown = calc.getCostBreakdown(projects);
        const totalDuration = comparison.reduce((sum, p) => sum + p.comparison.duration, 0);
        const avgCostPerMonth = totalDuration > 0 ? breakdown.total / totalDuration : 0;
        const totalResources = comparison.reduce((sum, p) => sum + p.comparison.resourceCount, 0);

        html += `
                <tr class="total-row">
                    <td class="fixed-column"><strong>TOTAL</strong></td>
                    <td></td>
                    <td class="text-center"><strong>${totalDuration}</strong></td>
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
