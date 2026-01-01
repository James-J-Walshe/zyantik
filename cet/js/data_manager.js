// Data Manager Module
// Handles all data persistence, import/export, and file operations

class DataManager {
    constructor() {
        console.log('Data Manager initialized');
    }

    // Load data from localStorage
    loadDefaultData() {
        try {
            if (typeof(Storage) !== "undefined" && localStorage) {
                const savedData = localStorage.getItem('ictProjectData');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    
                    // Get current projectData reference
                    const currentProjectData = window.projectData || {};
                    
                    // Log what we're loading
                    console.log('Data loaded from localStorage:', {
                        vendorCosts: parsed.vendorCosts?.length || 0,
                        toolCosts: parsed.toolCosts?.length || 0,
                        internalResources: parsed.internalResources?.length || 0,
                        hasCurrency: !!parsed.currency,
                        contingencyMethod: parsed.contingencyMethod || 'not set' // ADDED for Issue #129
                    });
                    
                    // Update the global projectData - merge arrays properly
                    if (window.projectData) {
                        // Merge each array individually to preserve data
                        window.projectData.projectInfo = { ...window.projectData.projectInfo, ...parsed.projectInfo };
                        window.projectData.internalResources = parsed.internalResources || [];
                        window.projectData.vendorCosts = parsed.vendorCosts || [];
                        window.projectData.toolCosts = parsed.toolCosts || [];
                        window.projectData.miscCosts = parsed.miscCosts || [];
                        window.projectData.risks = parsed.risks || [];
                        window.projectData.contingencyPercentage = parsed.contingencyPercentage || 10;
                        
                        // ADDED for Issue #129: Load contingency method
                        window.projectData.contingencyMethod = parsed.contingencyMethod || 'percentage';
                        
                        // Load currency settings
                        if (parsed.currency) {
                            window.projectData.currency = parsed.currency;
                            console.log('✓ Currency data loaded:', parsed.currency.primaryCurrency);
                        } else {
                            // Ensure currency structure exists for old projects
                            if (!window.projectData.currency) {
                                window.projectData.currency = {
                                    primaryCurrency: 'USD',
                                    exchangeRates: []
                                };
                                console.log('⚠ No currency in saved data, initialized with defaults');
                            }
                        }
                        
                        // Handle rate cards properly
                        if (parsed.rateCards) {
                            window.projectData.rateCards = parsed.rateCards;
                        }
                        if (parsed.internalRates) {
                            window.projectData.internalRates = parsed.internalRates;
                        }
                        if (parsed.externalRates) {
                            window.projectData.externalRates = parsed.externalRates;
                        }
                    }
                    
                    // Migrate old rate cards to new unified format if needed
                    if (!window.projectData.rateCards && (window.projectData.internalRates || window.projectData.externalRates)) {
                        window.projectData.rateCards = [];
                        
                        // Migrate internal rates
                        if (window.projectData.internalRates) {
                            window.projectData.internalRates.forEach(rate => {
                                window.projectData.rateCards.push({
                                    id: rate.id || Date.now() + Math.random(),
                                    role: rate.role,
                                    rate: rate.rate,
                                    category: 'Internal'
                                });
                            });
                        }
                        
                        // Migrate external rates
                        if (window.projectData.externalRates) {
                            window.projectData.externalRates.forEach(rate => {
                                window.projectData.rateCards.push({
                                    id: rate.id || Date.now() + Math.random(),
                                    role: rate.role,
                                    rate: rate.rate,
                                    category: 'External'
                                });
                            });
                        }
                    }
                    
                    // Populate form fields
                    this.populateFormFields();
                    
                    // Log final state after loading
                    console.log('Final data state after loading:', {
                        vendorCosts: window.projectData.vendorCosts?.length || 0,
                        toolCosts: window.projectData.toolCosts?.length || 0,
                        internalResources: window.projectData.internalResources?.length || 0,
                        projectData: window.projectData,
                        currency: window.projectData.currency?.primaryCurrency || 'Not set',
                        contingencyMethod: window.projectData.contingencyMethod || 'percentage' // ADDED for Issue #129
                    });
                    
                    console.log('Data loaded and populated successfully');
                    return true;
                }
            }
            
            console.log('No saved data found or localStorage not available');
            return false;
        } catch (e) {
            console.error('Error loading saved data:', e);
            return false;
        }
    }

    // Populate form fields with project data
    populateFormFields() {
        const projectData = window.projectData || {};
        const formFields = {
            projectName: projectData.projectInfo?.projectName || '',
            startDate: projectData.projectInfo?.startDate || '',
            endDate: projectData.projectInfo?.endDate || '',
            projectManager: projectData.projectInfo?.projectManager || '',
            projectDescription: projectData.projectInfo?.projectDescription || '',
            contingencyPercentage: projectData.contingencyPercentage || 10
        };
        
        Object.keys(formFields).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = formFields[id];
            }
        });

        // ADDED for Issue #129: Set contingency method radio buttons
        const contingencyMethod = projectData.contingencyMethod || 'percentage';
        const radioToCheck = document.getElementById(
            contingencyMethod === 'percentage' ? 'contingencyMethodPercentage' : 'contingencyMethodRiskBased'
        );
        if (radioToCheck) {
            radioToCheck.checked = true;
        }
    }

    // Save to localStorage (helper method)
    saveToLocalStorage() {
        try {
            const projectData = window.projectData;
            if (!projectData) {
                console.error('No project data to save');
                return false;
            }

            if (typeof(Storage) !== "undefined" && localStorage) {
                localStorage.setItem('ictProjectData', JSON.stringify(projectData));
                console.log('Project auto-saved to localStorage');
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    // Save project to localStorage
    saveProject() {
        try {
            const projectData = window.projectData;
            if (!projectData) {
                console.error('No project data to save');
                return false;
            }

            if (typeof(Storage) !== "undefined" && localStorage) {
                localStorage.setItem('ictProjectData', JSON.stringify(projectData));
                this.showAlert('Project saved to browser storage successfully!', 'success');
                return true;
            } else {
                this.showAlert('Local storage not available. Cannot save project.', 'error');
                return false;
            }
        } catch (e) {
            console.error('Error saving project:', e);
            this.showAlert('Error saving project: ' + e.message, 'error');
            return false;
        }
    }

    // Download project as JSON file
    downloadProject() {
        try {
            const projectData = window.projectData;
            if (!projectData) {
                console.error('No project data to download');
                return false;
            }

            const dataStr = JSON.stringify(projectData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `ICT_Project_${projectData.projectInfo?.projectName || 'Untitled'}.json`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showAlert('Project file downloaded successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error downloading project:', error);
            this.showAlert('Error downloading project file: ' + error.message, 'error');
            return false;
        }
    }

    // Create a new project (reset to initial state)
    newProject() {
        if (confirm('Are you sure you want to start a new project? This will clear all current data. Make sure to save or download your current project first.')) {
            try {
                // Reset projectData to initial state
                window.projectData = {
                    projectInfo: {
                        projectName: '',
                        startDate: '',
                        endDate: '',
                        projectManager: '',
                        projectDescription: ''
                    },
                    currency: {
                        primaryCurrency: 'USD',
                        exchangeRates: []
                    },
                    internalResources: [],
                    vendorCosts: [],
                    toolCosts: [],
                    miscCosts: [],
                    risks: [],
                    rateCards: [
                        { role: 'Project Manager', rate: 800, category: 'Internal' },
                        { role: 'Business Analyst', rate: 650, category: 'Internal' },
                        { role: 'Technical Lead', rate: 750, category: 'Internal' },
                        { role: 'Developer', rate: 600, category: 'Internal' },
                        { role: 'Tester', rate: 550, category: 'Internal' },
                        { role: 'Senior Consultant', rate: 1200, category: 'External' },
                        { role: 'Technical Architect', rate: 1500, category: 'External' },
                        { role: 'Implementation Specialist', rate: 900, category: 'External' },
                        { role: 'Support Specialist', rate: 700, category: 'External' }
                    ],
                    contingencyPercentage: 10,
                    contingencyMethod: 'percentage' // ADDED for Issue #129
                };
                
                // Clear form fields
                this.populateFormFields();
                
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
                
                // Clear localStorage
                localStorage.removeItem('ictProjectData');
                
                this.showAlert('New project created successfully! Please enter your project information.', 'success');
                
                console.log('New project created');
                return true;
                
            } catch (error) {
                console.error('Error creating new project:', error);
                this.showAlert('Error creating new project: ' + error.message, 'error');
                return false;
            }
        }
        return false;
    }

    // Load project from file
    loadProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadProjectFromFile(file);
            }
        };
        input.click();
    }

    // Load project from file object
    loadProjectFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Update the global projectData
                if (window.projectData) {
                    // Merge each array individually to preserve data
                    window.projectData.projectInfo = { ...window.projectData.projectInfo, ...data.projectInfo };
                    window.projectData.internalResources = data.internalResources || [];
                    window.projectData.vendorCosts = data.vendorCosts || [];
                    window.projectData.toolCosts = data.toolCosts || [];
                    window.projectData.miscCosts = data.miscCosts || [];
                    window.projectData.risks = data.risks || [];
                    window.projectData.contingencyPercentage = data.contingencyPercentage || 10;
                    
                    // ADDED for Issue #129: Load contingency method
                    window.projectData.contingencyMethod = data.contingencyMethod || 'percentage';
                    
                    // Handle rate cards properly
                    if (data.rateCards) {
                        window.projectData.rateCards = data.rateCards;
                    }
                    if (data.internalRates) {
                        window.projectData.internalRates = data.internalRates;
                    }
                    if (data.externalRates) {
                        window.projectData.externalRates = data.externalRates;
                    }

                    // Load currency if present
                    if (data.currency) {
                        window.projectData.currency = data.currency;
                    }
                }
                
                this.populateFormFields();
                
                if (window.TableRenderer) {
                    window.TableRenderer.renderAllTables();
                }
                if (window.updateSummary) {
                    window.updateSummary();
                }
                if (window.updateMonthHeaders) {
                    window.updateMonthHeaders();
                }
                
                this.showAlert('Project loaded successfully!', 'success');
            } catch (err) {
                console.error('Error loading project:', err);
                this.showAlert('Error loading project file: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Export project to Excel/CSV
    exportToExcel() {
        try {
            const csvContent = this.generateCSVExport();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const projectData = window.projectData;
            link.setAttribute('href', url);
            link.setAttribute('download', `ICT_Cost_Estimate_${projectData?.projectInfo?.projectName || 'Project'}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showAlert('Export completed successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error exporting:', error);
            this.showAlert('Error exporting project: ' + error.message, 'error');
            return false;
        }
    }

    // Generate CSV export content
    generateCSVExport() {
        const projectData = window.projectData || {};
        const months = window.calculateProjectMonths ? window.calculateProjectMonths() : 
                      ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
        
        let csv = 'ICT Project Cost Estimate Export\n\n';
        
        // Project Info
        csv += 'PROJECT INFORMATION\n';
        csv += `Project Name,"${projectData.projectInfo?.projectName || ''}"\n`;
        csv += `Start Date,"${projectData.projectInfo?.startDate || ''}"\n`;
        csv += `End Date,"${projectData.projectInfo?.endDate || ''}"\n`;
        csv += `Project Manager,"${projectData.projectInfo?.projectManager || ''}"\n`;
        csv += `Description,"${projectData.projectInfo?.projectDescription || ''}"\n\n`;
        
        // Rate Cards
        csv += 'RATE CARDS\n';
        csv += 'Role,Category,Daily Rate\n';
        if (projectData.rateCards) {
            projectData.rateCards.forEach(rate => {
                csv += `"${rate.role}","${rate.category}",${rate.rate}\n`;
            });
        }
        
        // Internal Resources
        csv += '\nINTERNAL RESOURCES\n';
        csv += `Role,Rate Card,Daily Rate,${months[0]} Days,${months[1]} Days,${months[2]} Days,${months[3]} Days,Total Cost\n`;
        if (projectData.internalResources) {
            projectData.internalResources.forEach(resource => {
                const month1Days = resource.month1Days || resource.q1Days || 0;
                const month2Days = resource.month2Days || resource.q2Days || 0;
                const month3Days = resource.month3Days || resource.q3Days || 0;
                const month4Days = resource.month4Days || resource.q4Days || 0;
                const totalCost = (month1Days + month2Days + month3Days + month4Days) * resource.dailyRate;
                csv += `"${resource.role}","${resource.rateCard}",${resource.dailyRate},${month1Days},${month2Days},${month3Days},${month4Days},${totalCost}\n`;
            });
        }
        
        // Vendor Costs
        csv += '\nVENDOR COSTS\n';
        csv += `Vendor,Description,Category,${months[0]} Cost,${months[1]} Cost,${months[2]} Cost,${months[3]} Cost,Total Cost\n`;
        if (projectData.vendorCosts) {
            projectData.vendorCosts.forEach(vendor => {
                const month1Cost = vendor.month1Cost || vendor.q1Cost || 0;
                const month2Cost = vendor.month2Cost || vendor.q2Cost || 0;
                const month3Cost = vendor.month3Cost || vendor.q3Cost || 0;
                const month4Cost = vendor.month4Cost || vendor.q4Cost || 0;
                const totalCost = month1Cost + month2Cost + month3Cost + month4Cost;
                csv += `"${vendor.vendor}","${vendor.description}","${vendor.category}",${month1Cost},${month2Cost},${month3Cost},${month4Cost},${totalCost}\n`;
            });
        }
        
        // Tool Costs
        csv += '\nTOOL COSTS\n';
        csv += 'Tool/Software,License Type,Users/Licenses,Monthly Cost,Duration (Months),Total Cost\n';
        if (projectData.toolCosts) {
            projectData.toolCosts.forEach(tool => {
                const totalCost = tool.users * tool.monthlyCost * tool.duration;
                csv += `"${tool.tool}","${tool.licenseType}",${tool.users},${tool.monthlyCost},${tool.duration},${totalCost}\n`;
            });
        }
        
        // Miscellaneous Costs
        csv += '\nMISCELLANEOUS COSTS\n';
        csv += 'Item,Description,Category,Cost\n';
        if (projectData.miscCosts) {
            projectData.miscCosts.forEach(misc => {
                csv += `"${misc.item}","${misc.description}","${misc.category}",${misc.cost}\n`;
            });
        }
        
        // Risks
        csv += '\nRISKS\n';
        csv += 'Description,Probability,Impact,Risk Score,Mitigation Cost\n';
        if (projectData.risks) {
            projectData.risks.forEach(risk => {
                const riskScore = risk.probability * risk.impact;
                csv += `"${risk.description}",${risk.probability},${risk.impact},${riskScore},${risk.mitigationCost}\n`;
            });
        }
        
        // ADDED for Issue #129: Contingency Calculation section
        csv += '\nCONTINGENCY CALCULATION\n';
        const contingencyMethod = projectData.contingencyMethod || 'percentage';
        csv += `Method,"${contingencyMethod}"\n`;
        
        if (contingencyMethod === 'percentage') {
            const percentage = projectData.contingencyPercentage || 0;
            csv += `Percentage,${percentage}%\n`;
        } else {
            const riskCount = projectData.risks?.length || 0;
            csv += `Risk Count,${riskCount}\n`;
        }
        
        const contingencyAmount = window.calculateContingency ? window.calculateContingency() : 0;
        csv += `Contingency Amount,$${contingencyAmount.toLocaleString()}\n`;
        
        // Summary
        csv += '\nPROJECT SUMMARY\n';
        const internalTotal = window.calculateInternalResourcesTotal ? window.calculateInternalResourcesTotal() : 0;
        const vendorTotal = window.calculateVendorCostsTotal ? window.calculateVendorCostsTotal() : 0;
        const toolTotal = window.calculateToolCostsTotal ? window.calculateToolCostsTotal() : 0;
        const miscTotal = window.calculateMiscCostsTotal ? window.calculateMiscCostsTotal() : 0;
        const subtotal = internalTotal + vendorTotal + toolTotal + miscTotal;
        const contingency = contingencyAmount;
        const total = subtotal + contingency;
        
        csv += `Internal Resources,${internalTotal}\n`;
        csv += `Vendor Costs,${vendorTotal}\n`;
        csv += `Tool Costs,${toolTotal}\n`;
        csv += `Miscellaneous,${miscTotal}\n`;
        csv += `Subtotal,${subtotal}\n`;
        
        // Show contingency with method info
        if (contingencyMethod === 'percentage') {
            csv += `Contingency (${projectData.contingencyPercentage || 10}%),${contingency}\n`;
        } else {
            csv += `Contingency (Risk-based),${contingency}\n`;
        }
        
        csv += `Total Project Cost,${total}\n`;
        
        return csv;
    }

    // Show alert message
    showAlert(message, type) {
        try {
            // Create alert element
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            
            // Insert at top of content
            const content = document.querySelector('.content');
            if (content) {
                content.insertBefore(alert, content.firstChild);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 5000);
            } else {
                // Fallback to console if content area not found
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        } catch (error) {
            console.error('Error showing alert:', error);
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Create and export data manager instance
const dataManager = new DataManager();

// Make it globally available with both casing for compatibility
window.dataManager = dataManager;
window.DataManager = dataManager;

// Export functions for backward compatibility
window.loadDefaultData = () => dataManager.loadDefaultData();
window.saveProject = () => dataManager.saveProject();
window.downloadProject = () => dataManager.downloadProject();
window.loadProject = () => dataManager.loadProject();
window.newProject = () => dataManager.newProject();
window.exportToExcel = () => dataManager.exportToExcel();
window.generateCSVExport = () => dataManager.generateCSVExport();

console.log('Data Manager module loaded');
