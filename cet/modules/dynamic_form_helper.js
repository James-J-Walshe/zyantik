// Dynamic Form Helper Functions
// Handles dynamic month columns in forms based on project dates

class DynamicFormHelper {
    constructor() {
        console.log('Dynamic Form Helper initialized');
        this.setupEventListeners();
    }

    // Calculate project months (same as in table renderer for consistency)
    calculateProjectMonths() {
        const projectData = window.projectData || {};
        const projectInfo = projectData.projectInfo || {};
        
        if (!projectInfo.startDate || !projectInfo.endDate) {
            console.log('No project dates found, using default 4 months');
            return {
                months: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
                monthKeys: ['month1', 'month2', 'month3', 'month4'],
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
                count: 4
            };
        }

        const months = [];
        const monthKeys = [];
        let currentDate = new Date(startDate);
        let monthIndex = 1;

        // Calculate months between start and end date
        while (currentDate <= endDate) {
            const monthName = currentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
            months.push(monthName);
            monthKeys.push(`month${monthIndex}`);
            
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
            months.push('Month 1');
            monthKeys.push('month1');
        }

        console.log(`Dynamic months calculated: ${months.length} months`, months);
        
        return {
            months: months,
            monthKeys: monthKeys,
            count: months.length
        };
    }

    // Setup event listeners for project date changes
    setupEventListeners() {
        // Listen for date changes on project info form
        document.addEventListener('change', (event) => {
            if (event.target.id === 'startDate' || event.target.id === 'endDate') {
                this.handleProjectDatesChange();
            }
        });

        // Listen for project info changes
        document.addEventListener('input', (event) => {
            if (['projectName', 'projectManager', 'projectDescription'].includes(event.target.id)) {
                this.handleProjectInfoChange();
            }
        });
    }

    // Handle project date changes
    handleProjectDatesChange() {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        
        console.log('Project dates changed:', startDate, endDate);
        
        if (startDate && endDate) {
            // Update project data
            if (!window.projectData) {
                window.projectData = {};
            }
            if (!window.projectData.projectInfo) {
                window.projectData.projectInfo = {};
            }
            
            window.projectData.projectInfo.startDate = startDate;
            window.projectData.projectInfo.endDate = endDate;
            
            // Update summary display
            this.updateProjectSummary();
            
            // Migrate existing data to new month structure
            this.migrateDataToNewFormat();
            
            // Re-render all tables with new month structure ONLY if we're in main view
            const settingsApp = document.getElementById('settingsApp');
            const isInSettingsView = settingsApp && settingsApp.style.display !== 'none';
            
            if (window.tableRenderer && !isInSettingsView) {
                window.tableRenderer.renderAllTables();
            }
            
            // Auto-save if data manager is available
            if (window.DataManager && window.DataManager.saveToLocalStorage) {
                window.DataManager.saveToLocalStorage();
            }
            
            console.log(`Project dates updated: ${startDate} to ${endDate}`);
        }
    }

    // Handle project info changes
    handleProjectInfoChange() {
        const projectName = document.getElementById('projectName')?.value;
        const projectManager = document.getElementById('projectManager')?.value;
        const projectDescription = document.getElementById('projectDescription')?.value;
        
        if (!window.projectData) {
            window.projectData = {};
        }
        if (!window.projectData.projectInfo) {
            window.projectData.projectInfo = {};
        }
        
        if (projectName !== undefined) window.projectData.projectInfo.projectName = projectName;
        if (projectManager !== undefined) window.projectData.projectInfo.projectManager = projectManager;
        if (projectDescription !== undefined) window.projectData.projectInfo.projectDescription = projectDescription;
        
        // Update summary display
        this.updateProjectSummary();
        
        // Auto-save if data manager is available
        if (window.DataManager && window.DataManager.saveToLocalStorage) {
            window.DataManager.saveToLocalStorage();
        }
    }

    // Update project summary display
    updateProjectSummary() {
        const projectInfo = window.projectData?.projectInfo || {};
        
        // Update summary display elements
        const summaryProjectName = document.getElementById('summaryProjectName');
        const summaryProjectManager = document.getElementById('summaryProjectManager');
        const summaryStartDate = document.getElementById('summaryStartDate');
        const summaryEndDate = document.getElementById('summaryEndDate');
        const summaryProjectDuration = document.getElementById('summaryProjectDuration');
        const summaryProjectDescription = document.getElementById('summaryProjectDescription');
        
        if (summaryProjectName) summaryProjectName.textContent = projectInfo.projectName || 'Not specified';
        if (summaryProjectManager) summaryProjectManager.textContent = projectInfo.projectManager || 'Not specified';
        if (summaryStartDate) summaryStartDate.textContent = projectInfo.startDate || 'Not specified';
        if (summaryEndDate) summaryEndDate.textContent = projectInfo.endDate || 'Not specified';
        if (summaryProjectDescription) summaryProjectDescription.textContent = projectInfo.projectDescription || 'Not specified';
        
        // Calculate and display duration
        if (projectInfo.startDate && projectInfo.endDate) {
            const start = new Date(projectInfo.startDate);
            const end = new Date(projectInfo.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const months = Math.round(diffDays / 30);
            
            if (summaryProjectDuration) {
                summaryProjectDuration.textContent = `${diffDays} days (${months} months)`;
            }
        }
    }

    // Save project info function
    saveProjectInfo() {
        this.handleProjectInfoChange();
        this.handleProjectDatesChange();
        
        alert('Project information saved successfully!');
        console.log('Project info saved:', window.projectData.projectInfo);
    }

    // Generate dynamic month form fields for Internal Resources
    generateInternalResourceMonthFields(resourceData = {}) {
        const monthInfo = this.calculateProjectMonths();
        let fieldsHTML = '';
        
        monthInfo.months.forEach((monthName, index) => {
            const monthKey = monthInfo.monthKeys[index];
            const fieldName = monthKey + 'Days';
            const value = resourceData[fieldName] || resourceData[`q${index + 1}Days`] || 0;
            
            fieldsHTML += `
                <div class="form-group">
                    <label for="${fieldName}">${monthName} (Days):</label>
                    <input type="number" 
                           id="${fieldName}" 
                           name="${fieldName}" 
                           value="${value}" 
                           min="0" 
                           step="0.5" 
                           class="form-control">
                </div>
            `;
        });
        
        return fieldsHTML;
    }

    // Generate dynamic month form fields for Vendor Costs
    generateVendorCostMonthFields(vendorData = {}) {
        const monthInfo = this.calculateProjectMonths();
        let fieldsHTML = '';
        
        monthInfo.months.forEach((monthName, index) => {
            const monthKey = monthInfo.monthKeys[index];
            const fieldName = monthKey + 'Cost';
            const value = vendorData[fieldName] || vendorData[`q${index + 1}Cost`] || 0;
            
            fieldsHTML += `
                <div class="form-group">
                    <label for="${fieldName}">${monthName} ($):</label>
                    <input type="number" 
                           id="${fieldName}" 
                           name="${fieldName}" 
                           value="${value}" 
                           min="0" 
                           step="0.01" 
                           class="form-control">
                </div>
            `;
        });
        
        return fieldsHTML;
    }

    // Add dynamic month fields to modal forms
    addDynamicMonthFieldsToModal(itemType, itemData = {}) {
        const modalFields = document.getElementById('modalFields');
        if (!modalFields) return;

        // Find or create month fields container
        let monthContainer = modalFields.querySelector('.dynamic-month-fields');
        if (!monthContainer) {
            monthContainer = document.createElement('div');
            monthContainer.className = 'dynamic-month-fields';
            modalFields.appendChild(monthContainer);
        }

        // Generate appropriate month fields
        if (itemType === 'internal-resource') {
            monthContainer.innerHTML = this.generateInternalResourceMonthFields(itemData);
        } else if (itemType === 'vendor-cost') {
            monthContainer.innerHTML = this.generateVendorCostMonthFields(itemData);
        } else {
            // Clear month fields for other item types
            monthContainer.innerHTML = '';
        }
    }

    // Extract form data with dynamic month fields
    extractFormData(form, itemType = 'internal-resource') {
        const formData = new FormData(form);
        const data = {};
        
        // Extract all form fields
        for (let [key, value] of formData.entries()) {
            if (key.includes('month') && (key.includes('Days') || key.includes('Cost'))) {
                data[key] = parseFloat(value) || 0;
            } else if (key === 'dailyRate' || key.includes('Cost') || key === 'rate') {
                data[key] = parseFloat(value) || 0;
            } else if (key === 'users' || key === 'duration' || key === 'probability' || key === 'impact') {
                data[key] = parseInt(value) || 0;
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    // Migrate old data format to new dynamic format
    migrateDataToNewFormat() {
        const projectData = window.projectData || {};
        const monthInfo = this.calculateProjectMonths();
        
        // Migrate Internal Resources
        if (projectData.internalResources) {
            projectData.internalResources.forEach(resource => {
                // If we have old quarter data but no month data, migrate it
                if (resource.q1Days !== undefined && resource.month1Days === undefined) {
                    // Map quarters to months based on new structure
                    if (monthInfo.count >= 1) resource.month1Days = resource.q1Days || 0;
                    if (monthInfo.count >= 2) resource.month2Days = resource.q2Days || 0;
                    if (monthInfo.count >= 3) resource.month3Days = resource.q3Days || 0;
                    if (monthInfo.count >= 4) resource.month4Days = resource.q4Days || 0;
                    
                    // If we have more months than quarters, initialize remaining months
                    for (let i = 5; i <= monthInfo.count; i++) {
                        resource[`month${i}Days`] = 0;
                    }
                }
            });
        }

        // Migrate Vendor Costs
        if (projectData.vendorCosts) {
            projectData.vendorCosts.forEach(vendor => {
                if (vendor.q1Cost !== undefined && vendor.month1Cost === undefined) {
                    if (monthInfo.count >= 1) vendor.month1Cost = vendor.q1Cost || 0;
                    if (monthInfo.count >= 2) vendor.month2Cost = vendor.q2Cost || 0;
                    if (monthInfo.count >= 3) vendor.month3Cost = vendor.q3Cost || 0;
                    if (monthInfo.count >= 4) vendor.month4Cost = vendor.q4Cost || 0;
                    
                    for (let i = 5; i <= monthInfo.count; i++) {
                        vendor[`month${i}Cost`] = 0;
                    }
                }
            });
        }

        // Save migrated data
        if (window.DataManager && window.DataManager.saveToLocalStorage) {
            window.DataManager.saveToLocalStorage();
        }
    }

    // Refresh dynamic elements
    refreshDynamicElements() {
        console.log('Refreshing dynamic elements');
        
        // Update table headers
        if (window.tableRenderer && window.tableRenderer.updateTableHeaders) {
            window.tableRenderer.updateTableHeaders();
        }
        
        // Re-render all tables
        if (window.renderAllTables) {
            window.renderAllTables();
        }
        
        // Update summary
        this.updateProjectSummary();
    }

    // Initialize dynamic forms
    initializeDynamicForms() {
        console.log('Initializing dynamic forms');
        
        // Load existing project data if available
        if (window.DataManager && window.DataManager.loadFromLocalStorage) {
            window.DataManager.loadFromLocalStorage();
        }
        
        // Populate form fields if project info exists
        if (window.projectData && window.projectData.projectInfo) {
            const info = window.projectData.projectInfo;
            
            const startDateField = document.getElementById('startDate');
            const endDateField = document.getElementById('endDate');
            const projectNameField = document.getElementById('projectName');
            const projectManagerField = document.getElementById('projectManager');
            const projectDescriptionField = document.getElementById('projectDescription');
            
            if (info.startDate && startDateField) startDateField.value = info.startDate;
            if (info.endDate && endDateField) endDateField.value = info.endDate;
            if (info.projectName && projectNameField) projectNameField.value = info.projectName;
            if (info.projectManager && projectManagerField) projectManagerField.value = info.projectManager;
            if (info.projectDescription && projectDescriptionField) projectDescriptionField.value = info.projectDescription;
            
            // Update summary display
            this.updateProjectSummary();
        }
        
        // Migrate existing data if needed
        this.migrateDataToNewFormat();
        
        // Render all tables
        if (window.tableRenderer) {
            setTimeout(() => {
                window.tableRenderer.renderAllTables();
            }, 100);
        }
    }
}

// Create and export dynamic form helper instance
const dynamicFormHelper = new DynamicFormHelper();

// Make it globally available
window.dynamicFormHelper = dynamicFormHelper;

// Export utility functions for global access
window.onProjectDatesUpdated = () => dynamicFormHelper.handleProjectDatesChange();
window.setupDynamicMonthFields = (formId, itemType, itemData) => {
    dynamicFormHelper.addDynamicMonthFieldsToModal(itemType, itemData);
};
window.extractDynamicFormData = (form, itemType) => {
    return dynamicFormHelper.extractFormData(form, itemType);
};

// Export the missing functions that are referenced in your HTML
window.handleProjectDatesChange = () => dynamicFormHelper.handleProjectDatesChange();
window.handleProjectInfoChange = () => dynamicFormHelper.handleProjectInfoChange();
window.updateProjectSummary = () => dynamicFormHelper.updateProjectSummary();
window.saveProjectInfo = () => dynamicFormHelper.saveProjectInfo();
window.refreshDynamicElements = () => dynamicFormHelper.refreshDynamicElements();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            dynamicFormHelper.initializeDynamicForms();
        }, 100);
    });
} else {
    setTimeout(() => {
        dynamicFormHelper.initializeDynamicForms();
    }, 100);
}

console.log('Dynamic Form Helper module loaded with all global functions exported');
