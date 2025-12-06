// modules/tool_costs_manager.js
// Tool Costs Manager Module
// Handles calculations, validations, and business logic for tool costs including
// recurring licenses, billing frequencies, and timeline management

class ToolCostsManager {
    constructor() {
        console.log('Tool Costs Manager initialized');
        this.billingFrequencies = {
            'one-time': { months: 0, label: 'One-time' },
            'monthly': { months: 1, label: 'Monthly' },
            'quarterly': { months: 3, label: 'Quarterly' },
            'annual': { months: 12, label: 'Annual' }
        };
        
        this.procurementTypes = [
            'Software License',
            'Hardware',
            'Cloud Services'
        ];
    }

    /**
     * Calculate total cost for a tool based on billing frequency and duration
     * @param {Object} toolCost - Tool cost object with all properties
     * @returns {number} Total cost
     */
    calculateTotalCost(toolCost) {
        try {
            const { costPerPeriod, quantity, billingFrequency, startDate, endDate, isOngoing } = toolCost;
            
            if (!costPerPeriod || !quantity) return 0;
            
            // One-time costs
            if (billingFrequency === 'one-time') {
                return costPerPeriod * quantity;
            }
            
            // Recurring costs - calculate based on project timeline
            const projectStartDate = this.getProjectStartDate();
            const projectEndDate = this.getProjectEndDate();
            
            if (!projectStartDate || !startDate) return 0;
            
            // Determine the effective end date for calculation
            let effectiveEndDate = projectEndDate;
            if (!isOngoing && endDate) {
                const toolEndDate = new Date(endDate);
                const projEndDate = new Date(projectEndDate);
                effectiveEndDate = toolEndDate < projEndDate ? endDate : projectEndDate;
            }
            
            // Calculate number of billing periods
            const periods = this.calculateBillingPeriods(startDate, effectiveEndDate, billingFrequency);
            
            return costPerPeriod * quantity * periods;
            
        } catch (error) {
            console.error('Error calculating total cost:', error);
            return 0;
        }
    }

    /**
     * Calculate number of billing periods between two dates
     * @param {string} startDate - ISO date string
     * @param {string} endDate - ISO date string
     * @param {string} billingFrequency - 'monthly', 'quarterly', or 'annual'
     * @returns {number} Number of billing periods
     */
    calculateBillingPeriods(startDate, endDate, billingFrequency) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start) || isNaN(end)) return 0;
            if (start > end) return 0;
            
            // Calculate total months between dates
            const monthsDiff = this.getMonthsDifference(start, end);
            
            // Convert to billing periods
            const periodLength = this.billingFrequencies[billingFrequency]?.months || 1;
            
            // Add 1 to include both start and end months
            const periods = Math.ceil((monthsDiff + 1) / periodLength);
            
            return periods;
            
        } catch (error) {
            console.error('Error calculating billing periods:', error);
            return 0;
        }
    }

    /**
     * Calculate months difference between two dates
     * @param {Date} start - Start date
     * @param {Date} end - End date
     * @returns {number} Number of months
     */
    getMonthsDifference(start, end) {
        const months = (end.getFullYear() - start.getFullYear()) * 12;
        return months + end.getMonth() - start.getMonth();
    }

    /**
     * Get monthly cost breakdown for a tool cost across project timeline
     * Returns an object with month keys (e.g., "2025-03") and cost values
     * @param {Object} toolCost - Tool cost object
     * @returns {Object} Monthly breakdown { "2025-03": 750, "2025-04": 750, ... }
     */
    getMonthlyBreakdown(toolCost) {
        try {
            const breakdown = {};
            const { costPerPeriod, quantity, billingFrequency, startDate, endDate, isOngoing } = toolCost;
            
            if (!costPerPeriod || !quantity || !startDate) return breakdown;
            
            // One-time costs appear only in start month
            if (billingFrequency === 'one-time') {
                const monthKey = this.getMonthKey(new Date(startDate));
                breakdown[monthKey] = costPerPeriod * quantity;
                return breakdown;
            }
            
            // Recurring costs
            const projectStartDate = new Date(this.getProjectStartDate());
            const projectEndDate = new Date(this.getProjectEndDate());
            const toolStartDate = new Date(startDate);
            
            if (!projectStartDate || isNaN(projectStartDate)) return breakdown;
            
            // Determine effective end date
            let effectiveEndDate = projectEndDate;
            if (!isOngoing && endDate) {
                const toolEndDate = new Date(endDate);
                effectiveEndDate = toolEndDate < projectEndDate ? toolEndDate : projectEndDate;
            }
            
            // Generate cost entries for each billing period
            const periodMonths = this.billingFrequencies[billingFrequency]?.months || 1;
            const costAmount = costPerPeriod * quantity;
            
            let currentDate = new Date(toolStartDate);
            
            while (currentDate <= effectiveEndDate) {
                const monthKey = this.getMonthKey(currentDate);
                breakdown[monthKey] = costAmount;
                
                // Move to next billing period
                currentDate.setMonth(currentDate.getMonth() + periodMonths);
            }
            
            return breakdown;
            
        } catch (error) {
            console.error('Error generating monthly breakdown:', error);
            return {};
        }
    }

    /**
     * Get all tool costs breakdown aggregated by month
     * @returns {Object} { "2025-03": totalCost, "2025-04": totalCost, ... }
     */
    getAllToolCostsMonthlyBreakdown() {
        try {
            const projectData = window.projectData || {};
            const toolCosts = projectData.toolCosts || [];
            const aggregated = {};
            
            toolCosts.forEach(toolCost => {
                const breakdown = this.getMonthlyBreakdown(toolCost);
                
                // Aggregate costs by month
                Object.keys(breakdown).forEach(monthKey => {
                    if (!aggregated[monthKey]) {
                        aggregated[monthKey] = 0;
                    }
                    aggregated[monthKey] += breakdown[monthKey];
                });
            });
            
            return aggregated;
            
        } catch (error) {
            console.error('Error calculating all tool costs breakdown:', error);
            return {};
        }
    }

    /**
     * Convert a date to month key format (YYYY-MM)
     * @param {Date} date
     * @returns {string} Month key
     */
    getMonthKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Validate tool cost data
     * @param {Object} data - Form data from modal
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateToolCost(data) {
        const errors = [];
        
        // Required fields
        if (!data.tool || data.tool.trim() === '') {
            errors.push('Tool/Software name is required');
        }
        
        if (!data.procurementType) {
            errors.push('Procurement type is required');
        }
        
        if (!data.billingFrequency) {
            errors.push('Billing frequency is required');
        }
        
        if (!data.costPerPeriod || parseFloat(data.costPerPeriod) <= 0) {
            errors.push('Cost per period must be greater than 0');
        }
        
        if (!data.quantity || parseInt(data.quantity) <= 0) {
            errors.push('Quantity must be greater than 0');
        }
        
        if (!data.startDate) {
            errors.push('Start date is required');
        }
        
        // Date validation
        if (data.startDate && !data.isOngoing && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            
            if (end < start) {
                errors.push('End date cannot be before start date');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Format tool cost for display in table
     * @param {Object} toolCost
     * @returns {Object} Formatted display data
     */
    formatToolCostForDisplay(toolCost) {
        try {
            const totalCost = this.calculateTotalCost(toolCost);
            const billingLabel = this.billingFrequencies[toolCost.billingFrequency]?.label || toolCost.billingFrequency;
            
            const endDateDisplay = toolCost.isOngoing 
                ? 'Ongoing' 
                : (toolCost.endDate ? new Date(toolCost.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '-');
            
            const startDateDisplay = toolCost.startDate 
                ? new Date(toolCost.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                : '-';
            
            return {
                tool: toolCost.tool,
                procurementType: toolCost.procurementType,
                billingFrequency: billingLabel,
                costPerPeriod: toolCost.costPerPeriod,
                quantity: toolCost.quantity,
                startDate: startDateDisplay,
                endDate: endDateDisplay,
                totalCost: totalCost,
                isOngoing: toolCost.isOngoing
            };
            
        } catch (error) {
            console.error('Error formatting tool cost:', error);
            return {};
        }
    }

    /**
     * Get project start date from projectData
     * @returns {string} ISO date string
     */
    getProjectStartDate() {
        const projectData = window.projectData || {};
        return projectData.projectInfo?.startDate || '';
    }

    /**
     * Get project end date from projectData
     * @returns {string} ISO date string
     */
    getProjectEndDate() {
        const projectData = window.projectData || {};
        return projectData.projectInfo?.endDate || '';
    }

    /**
     * Get minimum allowed start date (project start date)
     * @returns {string} ISO date string
     */
    getMinimumStartDate() {
        return this.getProjectStartDate();
    }

    /**
     * Get maximum allowed end date (project end date or 2 years from now)
     * @returns {string} ISO date string
     */
    getMaximumEndDate() {
        const projectEndDate = this.getProjectEndDate();
        if (projectEndDate) return projectEndDate;
        
        // Default to 2 years from now if no project end date
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 2);
        return maxDate.toISOString().split('T')[0];
    }

    /**
     * Calculate total of all tool costs
     * @returns {number} Total cost
     */
    calculateAllToolCostsTotal() {
        try {
            const projectData = window.projectData || {};
            const toolCosts = projectData.toolCosts || [];
            
            return toolCosts.reduce((total, toolCost) => {
                return total + this.calculateTotalCost(toolCost);
            }, 0);
            
        } catch (error) {
            console.error('Error calculating all tool costs total:', error);
            return 0;
        }
    }

    /**
     * Initialize the module
     */
    initialize() {
        console.log('✓ Tool Costs Manager ready');
        return true;
    }
}

// Create and export instance
window.toolCostsManager = new ToolCostsManager();
window.ToolCostsManager = ToolCostsManager;

console.log('Tool Costs Manager module loaded');
