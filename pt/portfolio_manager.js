/**
 * Portfolio Manager Module
 * Handles loading, validating, and managing multiple project files
 * Following Zyantik's initialization manager pattern
 */

class PortfolioManager {
    constructor() {
        this.projects = [];
        this.initialized = false;
        console.log('📊 Portfolio Manager constructed');
    }

    initialize() {
        console.log('📊 Initializing Portfolio Manager...');
        this.setupEventListeners();
        this.initialized = true;
        console.log('✓ Portfolio Manager initialized');
    }

    setupEventListeners() {
        // Load Projects button
        const loadBtn = document.getElementById('loadProjectsBtn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.triggerFileSelect());
        }

        // Add More Projects button
        const addMoreBtn = document.getElementById('addMoreProjectsBtn');
        if (addMoreBtn) {
            addMoreBtn.addEventListener('click', () => this.triggerFileSelect());
        }

        // File input change
        const fileInput = document.getElementById('portfolioFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Export Portfolio button
        const exportBtn = document.getElementById('exportPortfolioBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPortfolio());
        }

        console.log('✓ Portfolio Manager event listeners set up');
    }

    triggerFileSelect() {
        const fileInput = document.getElementById('portfolioFileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    async handleFileSelect(event) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        console.log(`📁 Loading ${files.length} project file(s)...`);
        this.showStatus(`Loading ${files.length} project(s)...`, 'info');

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const project = await this.loadProjectFile(file);
                if (project) {
                    this.addProject(project);
                    successCount++;
                    console.log(`✓ Loaded: ${project.metadata.projectName}`);
                } else {
                    errorCount++;
                    errors.push(`${file.name}: Invalid project file`);
                }
            } catch (error) {
                errorCount++;
                errors.push(`${file.name}: ${error.message}`);
                console.error(`❌ Error loading ${file.name}:`, error);
            }
        }

        // Show results
        if (successCount > 0) {
            this.showStatus(`✓ Successfully loaded ${successCount} project(s)`, 'success');
            this.updateUI();
        }

        if (errorCount > 0) {
            const errorMsg = `Failed to load ${errorCount} project(s):\n${errors.join('\n')}`;
            this.showStatus(errorMsg, 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    loadProjectFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate project structure
                    if (!this.validateProjectData(data)) {
                        reject(new Error('Invalid Zyantik project file structure'));
                        return;
                    }

                    // Extract and structure project data
                    const project = {
                        id: this.generateProjectId(),
                        fileName: file.name,
                        loadedAt: new Date().toISOString(),
                        metadata: {
                            projectName: data.projectInfo?.projectName || 'Untitled Project',
                            startDate: data.projectInfo?.startDate || '',
                            endDate: data.projectInfo?.endDate || '',
                            projectManager: data.projectInfo?.projectManager || '',
                            projectDescription: data.projectInfo?.projectDescription || ''
                        },
                        costs: {
                            internal: this.calculateInternalCosts(data),
                            external: this.calculateExternalCosts(data),
                            tools: this.calculateToolCosts(data),
                            misc: this.calculateMiscCosts(data),
                            contingency: this.calculateContingency(data)
                        },
                        resources: {
                            internal: data.internalResources || [],
                            external: data.vendorCosts || []
                        },
                        rawData: data // Keep original data for detailed analysis
                    };

                    // Calculate total cost
                    project.costs.total = 
                        project.costs.internal.total +
                        project.costs.external.total +
                        project.costs.tools.total +
                        project.costs.misc.total +
                        project.costs.contingency;

                    resolve(project);
                } catch (error) {
                    reject(new Error('Failed to parse JSON: ' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    validateProjectData(data) {
        // Check for required Zyantik project structure
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Must have project info
        if (!data.projectInfo) {
            return false;
        }

        // Should have at least one cost category
        const hasAnyCosts = 
            (data.internalResources && data.internalResources.length > 0) ||
            (data.vendorCosts && data.vendorCosts.length > 0) ||
            (data.toolCosts && data.toolCosts.length > 0) ||
            (data.miscCosts && data.miscCosts.length > 0);

        return hasAnyCosts || true; // Allow empty projects for now
    }

    calculateInternalCosts(data) {
        const resources = data.internalResources || [];
        let total = 0;
        const monthlyBreakdown = {};

        resources.forEach(resource => {
            const rate = parseFloat(resource.dailyRate) || 0;
            
            // Sum costs across all month fields
            for (let key in resource) {
                if (key.startsWith('month') && key.endsWith('Days')) {
                    const days = parseFloat(resource[key]) || 0;
                    const cost = days * rate;
                    total += cost;

                    // Extract month number
                    const monthMatch = key.match(/month(\d+)Days/);
                    if (monthMatch) {
                        const monthNum = parseInt(monthMatch[1]);
                        if (!monthlyBreakdown[monthNum]) {
                            monthlyBreakdown[monthNum] = 0;
                        }
                        monthlyBreakdown[monthNum] += cost;
                    }
                }
            }
        });

        return { total, monthlyBreakdown, count: resources.length };
    }

    calculateExternalCosts(data) {
        const vendors = data.vendorCosts || [];
        let total = 0;
        const monthlyBreakdown = {};

        vendors.forEach(vendor => {
            // Sum costs across all month fields
            for (let key in vendor) {
                if (key.startsWith('month') && key.endsWith('Cost')) {
                    const cost = parseFloat(vendor[key]) || 0;
                    total += cost;

                    // Extract month number
                    const monthMatch = key.match(/month(\d+)Cost/);
                    if (monthMatch) {
                        const monthNum = parseInt(monthMatch[1]);
                        if (!monthlyBreakdown[monthNum]) {
                            monthlyBreakdown[monthNum] = 0;
                        }
                        monthlyBreakdown[monthNum] += cost;
                    }
                }
            }
        });

        return { total, monthlyBreakdown, count: vendors.length };
    }

    calculateToolCosts(data) {
        const tools = data.toolCosts || [];
        let total = 0;

        tools.forEach(tool => {
            const cost = parseFloat(tool.totalCost) || 0;
            total += cost;
        });

        return { total, count: tools.length };
    }

    calculateMiscCosts(data) {
        const misc = data.miscCosts || [];
        let total = 0;
        const monthlyBreakdown = {};

        misc.forEach(item => {
            // Sum costs across all month fields
            for (let key in item) {
                if (key.startsWith('month') && key.endsWith('Cost')) {
                    const cost = parseFloat(item[key]) || 0;
                    total += cost;

                    // Extract month number
                    const monthMatch = key.match(/month(\d+)Cost/);
                    if (monthMatch) {
                        const monthNum = parseInt(monthMatch[1]);
                        if (!monthlyBreakdown[monthNum]) {
                            monthlyBreakdown[monthNum] = 0;
                        }
                        monthlyBreakdown[monthNum] += cost;
                    }
                }
            }
        });

        return { total, monthlyBreakdown, count: misc.length };
    }

    calculateContingency(data) {
        const percentage = parseFloat(data.contingencyPercentage) || 0;
        const internalTotal = this.calculateInternalCosts(data).total;
        const externalTotal = this.calculateExternalCosts(data).total;
        const toolsTotal = this.calculateToolCosts(data).total;
        const miscTotal = this.calculateMiscCosts(data).total;
        
        const baseTotal = internalTotal + externalTotal + toolsTotal + miscTotal;
        return (baseTotal * percentage) / 100;
    }

    addProject(project) {
        // Check for duplicates
        const existingIndex = this.projects.findIndex(p => 
            p.metadata.projectName === project.metadata.projectName &&
            p.fileName === project.fileName
        );

        if (existingIndex >= 0) {
            console.log(`⚠️ Replacing existing project: ${project.metadata.projectName}`);
            this.projects[existingIndex] = project;
        } else {
            this.projects.push(project);
        }

        console.log(`📊 Portfolio now contains ${this.projects.length} project(s)`);
    }

    removeProject(projectId) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index >= 0) {
            const removed = this.projects.splice(index, 1)[0];
            console.log(`🗑️ Removed project: ${removed.metadata.projectName}`);
            this.updateUI();
            this.showStatus(`Removed project: ${removed.metadata.projectName}`, 'success');
        }
    }

    getProjects() {
        return this.projects;
    }

    getProject(projectId) {
        return this.projects.find(p => p.id === projectId);
    }

    generateProjectId() {
        return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    updateUI() {
        // Hide upload section, show dashboard
        const uploadSection = document.querySelector('.portfolio-upload-section');
        const dashboard = document.getElementById('portfolioDashboard');
        const exportBtn = document.getElementById('exportPortfolioBtn');

        if (this.projects.length > 0) {
            if (uploadSection) uploadSection.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            if (exportBtn) exportBtn.style.display = 'flex';

            // Update dashboard
            if (window.portfolioDashboard && window.portfolioDashboard.initialized) {
                window.portfolioDashboard.renderDashboard(this.projects);
            }
        } else {
            if (uploadSection) uploadSection.style.display = 'block';
            if (dashboard) dashboard.style.display = 'none';
            if (exportBtn) exportBtn.style.display = 'none';
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('uploadStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `upload-status ${type}`;
            statusDiv.style.display = 'block';

            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 5000);
            }
        }
    }

    exportPortfolio() {
        if (this.projects.length === 0) {
            this.showStatus('No projects to export', 'error');
            return;
        }

        try {
            // Create export data structure
            const exportData = {
                exportDate: new Date().toISOString(),
                portfolioName: 'Zyantik Portfolio',
                projectCount: this.projects.length,
                projects: this.projects.map(p => ({
                    projectName: p.metadata.projectName,
                    fileName: p.fileName,
                    totalCost: p.costs.total,
                    startDate: p.metadata.startDate,
                    endDate: p.metadata.endDate,
                    projectManager: p.metadata.projectManager,
                    costBreakdown: {
                        internal: p.costs.internal.total,
                        external: p.costs.external.total,
                        tools: p.costs.tools.total,
                        misc: p.costs.misc.total,
                        contingency: p.costs.contingency
                    }
                })),
                totalPortfolioCost: this.projects.reduce((sum, p) => sum + p.costs.total, 0)
            };

            // Generate CSV
            this.exportToCSV(exportData);
            this.showStatus('Portfolio exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showStatus('Failed to export portfolio: ' + error.message, 'error');
        }
    }

    exportToCSV(data) {
        let csv = 'ZYANTIK PORTFOLIO EXPORT\n\n';
        csv += `Export Date,${data.exportDate}\n`;
        csv += `Portfolio Name,${data.portfolioName}\n`;
        csv += `Total Projects,${data.projectCount}\n`;
        csv += `Total Portfolio Value,$${data.totalPortfolioCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

        csv += 'PROJECT BREAKDOWN\n';
        csv += 'Project Name,File Name,Start Date,End Date,Project Manager,Internal Costs,External Costs,Tool Costs,Misc Costs,Contingency,Total Cost\n';

        data.projects.forEach(project => {
            csv += `"${project.projectName}",`;
            csv += `"${project.fileName}",`;
            csv += `${project.startDate},`;
            csv += `${project.endDate},`;
            csv += `"${project.projectManager}",`;
            csv += `${project.costBreakdown.internal.toFixed(2)},`;
            csv += `${project.costBreakdown.external.toFixed(2)},`;
            csv += `${project.costBreakdown.tools.toFixed(2)},`;
            csv += `${project.costBreakdown.misc.toFixed(2)},`;
            csv += `${project.costBreakdown.contingency.toFixed(2)},`;
            csv += `${project.totalCost.toFixed(2)}\n`;
        });

        // Download file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Zyantik_Portfolio_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Create and export instance
window.portfolioManager = new PortfolioManager();
console.log('📊 Portfolio Manager module loaded');
