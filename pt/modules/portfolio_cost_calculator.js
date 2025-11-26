/**
 * Portfolio Cost Calculator Module
 * Aggregates and analyzes costs across multiple projects
 * Handles monthly timeline calculations and cost rollups
 */

class PortfolioCostCalculator {
    constructor() {
        this.initialized = false;
        console.log('🧮 Portfolio Cost Calculator constructed');
    }

    initialize() {
        console.log('🧮 Initializing Portfolio Cost Calculator...');
        this.initialized = true;
        console.log('✓ Portfolio Cost Calculator initialized');
    }

    /**
     * Calculate portfolio-wide monthly costs
     * @param {Array} projects - Array of project objects
     * @returns {Object} Monthly cost breakdown across portfolio
     */
    calculateMonthlyCosts(projects) {
        if (!projects || projects.length === 0) {
            return { months: [], totals: [] };
        }

        // Build complete timeline across all projects
        const timeline = this.buildPortfolioTimeline(projects);
        const monthlyCosts = {};

        // Initialize all months with zero costs
        timeline.forEach(month => {
            monthlyCosts[month.key] = {
                date: month.date,
                label: month.label,
                internal: 0,
                external: 0,
                tools: 0,
                misc: 0,
                total: 0,
                projects: []
            };
        });

        // Aggregate costs from each project
        projects.forEach(project => {
            const projectTimeline = this.getProjectTimeline(project);
            
            projectTimeline.forEach((month, index) => {
                const monthKey = month.key;
                if (monthlyCosts[monthKey]) {
                    // Get costs for this month from the project
                    const monthNum = index + 1;
                    const internalCost = project.costs.internal.monthlyBreakdown[monthNum] || 0;
                    const externalCost = project.costs.external.monthlyBreakdown[monthNum] || 0;
                    const miscCost = project.costs.misc.monthlyBreakdown[monthNum] || 0;
                    
                    // Add to portfolio month
                    monthlyCosts[monthKey].internal += internalCost;
                    monthlyCosts[monthKey].external += externalCost;
                    monthlyCosts[monthKey].misc += miscCost;
                    
                    // Track which projects contribute to this month
                    if (internalCost + externalCost + miscCost > 0) {
                        monthlyCosts[monthKey].projects.push({
                            name: project.metadata.projectName,
                            cost: internalCost + externalCost + miscCost
                        });
                    }
                }
            });

            // Distribute tool costs across project duration
            if (project.costs.tools.total > 0) {
                const projectMonths = projectTimeline.length;
                const toolCostPerMonth = project.costs.tools.total / projectMonths;
                
                projectTimeline.forEach(month => {
                    if (monthlyCosts[month.key]) {
                        monthlyCosts[month.key].tools += toolCostPerMonth;
                    }
                });
            }
        });

        // Calculate totals
        Object.keys(monthlyCosts).forEach(key => {
            const month = monthlyCosts[key];
            month.total = month.internal + month.external + month.tools + month.misc;
        });

        // Convert to arrays for easier rendering
        const months = timeline.map(m => m.label);
        const totals = timeline.map(m => monthlyCosts[m.key].total);

        return {
            months,
            totals,
            breakdown: monthlyCosts,
            timeline
        };
    }

    /**
     * Build complete timeline spanning all projects
     * @param {Array} projects - Array of project objects
     * @returns {Array} Timeline array with month objects
     */
    buildPortfolioTimeline(projects) {
        let earliestDate = null;
        let latestDate = null;

        // Find earliest and latest dates across all projects
        projects.forEach(project => {
            if (project.metadata.startDate) {
                const start = new Date(project.metadata.startDate);
                if (!earliestDate || start < earliestDate) {
                    earliestDate = start;
                }
            }

            if (project.metadata.endDate) {
                const end = new Date(project.metadata.endDate);
                if (!latestDate || end > latestDate) {
                    latestDate = end;
                }
            }
        });

        // If no dates found, return empty timeline
        if (!earliestDate || !latestDate) {
            return [];
        }

        // Build month-by-month timeline
        const timeline = [];
        const current = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
        const end = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);

        while (current <= end) {
            const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            timeline.push({
                key: monthKey,
                date: new Date(current),
                label: monthLabel,
                year: current.getFullYear(),
                month: current.getMonth() + 1
            });

            current.setMonth(current.getMonth() + 1);
        }

        return timeline;
    }

    /**
     * Get timeline for a specific project
     * @param {Object} project - Project object
     * @returns {Array} Timeline for this project
     */
    getProjectTimeline(project) {
        if (!project.metadata.startDate || !project.metadata.endDate) {
            return [];
        }

        const start = new Date(project.metadata.startDate);
        const end = new Date(project.metadata.endDate);
        const timeline = [];

        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

        while (current <= endMonth) {
            const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            timeline.push({
                key: monthKey,
                date: new Date(current),
                label: monthLabel,
                year: current.getFullYear(),
                month: current.getMonth() + 1
            });

            current.setMonth(current.getMonth() + 1);
        }

        return timeline;
    }

    /**
     * Calculate total portfolio cost
     * @param {Array} projects - Array of project objects
     * @returns {Number} Total cost across all projects
     */
    calculateTotalPortfolioCost(projects) {
        if (!projects || projects.length === 0) {
            return 0;
        }

        return projects.reduce((sum, project) => sum + (project.costs.total || 0), 0);
    }

    /**
     * Get cost breakdown by category
     * @param {Array} projects - Array of project objects
     * @returns {Object} Breakdown by cost category
     */
    getCostBreakdown(projects) {
        if (!projects || projects.length === 0) {
            return {
                internal: 0,
                external: 0,
                tools: 0,
                misc: 0,
                contingency: 0,
                total: 0
            };
        }

        const breakdown = {
            internal: 0,
            external: 0,
            tools: 0,
            misc: 0,
            contingency: 0,
            total: 0
        };

        projects.forEach(project => {
            breakdown.internal += project.costs.internal.total || 0;
            breakdown.external += project.costs.external.total || 0;
            breakdown.tools += project.costs.tools.total || 0;
            breakdown.misc += project.costs.misc.total || 0;
            breakdown.contingency += project.costs.contingency || 0;
        });

        breakdown.total = 
            breakdown.internal + 
            breakdown.external + 
            breakdown.tools + 
            breakdown.misc + 
            breakdown.contingency;

        return breakdown;
    }

    /**
     * Calculate peak resource demand across portfolio
     * @param {Array} projects - Array of project objects
     * @returns {Object} Peak FTE demand information
     */
    calculatePeakResourceDemand(projects) {
        if (!projects || projects.length === 0) {
            return { peak: 0, month: '', breakdown: {} };
        }

        const timeline = this.buildPortfolioTimeline(projects);
        const monthlyFTE = {};

        // Initialize all months
        timeline.forEach(month => {
            monthlyFTE[month.key] = {
                internal: 0,
                external: 0,
                total: 0,
                label: month.label
            };
        });

        // Calculate FTE for each project/month
        projects.forEach(project => {
            const projectTimeline = this.getProjectTimeline(project);
            
            projectTimeline.forEach((month, index) => {
                const monthKey = month.key;
                const monthNum = index + 1;

                if (monthlyFTE[monthKey]) {
                    // Internal resources
                    const internalResources = project.resources.internal || [];
                    internalResources.forEach(resource => {
                        const daysKey = `month${monthNum}Days`;
                        const days = parseFloat(resource[daysKey]) || 0;
                        const fte = days / 22; // Assuming 22 working days per month
                        monthlyFTE[monthKey].internal += fte;
                    });

                    // External resources (vendors)
                    const externalResources = project.resources.external || [];
                    externalResources.forEach(vendor => {
                        const costKey = `month${monthNum}Cost`;
                        const cost = parseFloat(vendor[costKey]) || 0;
                        // Estimate FTE based on cost (rough estimate)
                        if (cost > 0) {
                            const estimatedDays = cost / 1000; // Rough estimate
                            const fte = estimatedDays / 22;
                            monthlyFTE[monthKey].external += fte;
                        }
                    });

                    monthlyFTE[monthKey].total = 
                        monthlyFTE[monthKey].internal + 
                        monthlyFTE[monthKey].external;
                }
            });
        });

        // Find peak month
        let peakMonth = null;
        let peakFTE = 0;

        Object.keys(monthlyFTE).forEach(key => {
            if (monthlyFTE[key].total > peakFTE) {
                peakFTE = monthlyFTE[key].total;
                peakMonth = key;
            }
        });

        return {
            peak: Math.round(peakFTE * 10) / 10, // Round to 1 decimal
            month: peakMonth ? monthlyFTE[peakMonth].label : '',
            monthKey: peakMonth,
            breakdown: monthlyFTE
        };
    }

    /**
     * Get timeline range (earliest to latest date)
     * @param {Array} projects - Array of project objects
     * @returns {String} Date range string
     */
    getTimelineRange(projects) {
        if (!projects || projects.length === 0) {
            return '-';
        }

        const timeline = this.buildPortfolioTimeline(projects);
        if (timeline.length === 0) {
            return '-';
        }

        const firstMonth = timeline[0].label;
        const lastMonth = timeline[timeline.length - 1].label;

        if (firstMonth === lastMonth) {
            return firstMonth;
        }

        return `${firstMonth} - ${lastMonth}`;
    }

    /**
     * Compare projects side by side
     * @param {Array} projects - Array of project objects
     * @param {String} sortBy - Sort criteria
     * @returns {Array} Sorted projects with comparison metrics
     */
    compareProjects(projects, sortBy = 'cost-desc') {
        if (!projects || projects.length === 0) {
            return [];
        }

        // Add comparison metrics
        const comparison = projects.map(project => {
            const duration = this.calculateProjectDuration(project);
            return {
                ...project,
                comparison: {
                    duration,
                    costPerMonth: duration > 0 ? project.costs.total / duration : 0,
                    resourceCount: 
                        (project.costs.internal.count || 0) + 
                        (project.costs.external.count || 0)
                }
            };
        });

        // Sort based on criteria
        comparison.sort((a, b) => {
            switch (sortBy) {
                case 'cost-desc':
                    return b.costs.total - a.costs.total;
                case 'cost-asc':
                    return a.costs.total - b.costs.total;
                case 'duration-desc':
                    return b.comparison.duration - a.comparison.duration;
                case 'duration-asc':
                    return a.comparison.duration - b.comparison.duration;
                case 'name':
                    return a.metadata.projectName.localeCompare(b.metadata.projectName);
                default:
                    return 0;
            }
        });

        return comparison;
    }

    /**
     * Calculate project duration in months
     * @param {Object} project - Project object
     * @returns {Number} Duration in months
     */
    calculateProjectDuration(project) {
        if (!project.metadata.startDate || !project.metadata.endDate) {
            return 0;
        }

        const start = new Date(project.metadata.startDate);
        const end = new Date(project.metadata.endDate);

        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth()) + 1;

        return Math.max(1, months);
    }

    /**
     * Format currency for display
     * @param {Number} amount - Amount to format
     * @returns {String} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Format currency with decimals
     * @param {Number} amount - Amount to format
     * @returns {String} Formatted currency string with decimals
     */
    formatCurrencyDetailed(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Create and export instance
window.portfolioCostCalculator = new PortfolioCostCalculator();
console.log('🧮 Portfolio Cost Calculator module loaded');
