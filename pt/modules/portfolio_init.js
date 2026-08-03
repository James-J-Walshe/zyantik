/**
 * Portfolio Initialization Manager
 * Orchestrates the initialization sequence for the Portfolio application
 * Following Zyantik's initialization manager pattern
 */

class PortfolioInitManager {
    constructor() {
        this.initialized = false;
        this.modules = {
            portfolioManager: false,
            portfolioCostCalculator: false,
            portfolioDashboard: false,
            analyticsManager: false
        };
        console.log('🚀 Portfolio Init Manager constructed');
    }

    async initialize() {
        if (this.initialized) {
            console.log('⚠️ Portfolio already initialized');
            return;
        }

        console.log('🚀 Starting Portfolio Application initialization...');
        console.log('================================================');

        try {
            // Step 1: Check for required modules
            console.log('Step 1: Checking for required modules...');
            this.checkModules();

            // Step 2: Initialize Portfolio Manager
            console.log('Step 2: Initializing Portfolio Manager...');
            if (window.portfolioManager && typeof window.portfolioManager.initialize === 'function') {
                window.portfolioManager.initialize();
                console.log('✓ Portfolio Manager initialized');
            } else {
                console.error('❌ Portfolio Manager not available');
            }

            // Step 3: Initialize Cost Calculator
            console.log('Step 3: Initializing Cost Calculator...');
            if (window.portfolioCostCalculator && typeof window.portfolioCostCalculator.initialize === 'function') {
                window.portfolioCostCalculator.initialize();
                console.log('✓ Cost Calculator initialized');
            } else {
                console.error('❌ Cost Calculator not available');
            }

            // Step 4: Initialize Dashboard
            console.log('Step 4: Initializing Dashboard...');
            if (window.portfolioDashboard && typeof window.portfolioDashboard.initialize === 'function') {
                window.portfolioDashboard.initialize();
                console.log('✓ Dashboard initialized');
            } else {
                console.error('❌ Dashboard not available');
            }

            // Step 5: Initialize Analytics Manager
            // Runs after the UI modules so its event hooks find the rendered DOM
            console.log('Step 5: Initializing Analytics Manager...');
            if (this.modules.analyticsManager && typeof window.analyticsManager.initialize === 'function') {
                window.analyticsManager.initialize();
                console.log('✓ Analytics Manager initialized');
            } else {
                console.warn('⚠️ Analytics Manager not available - continuing without analytics');
            }

            // Step 6: Show welcome message
            console.log('Step 6: Portfolio Application ready!');
            this.showWelcomeMessage();

            this.initialized = true;
            console.log('================================================');
            console.log('✓ Portfolio Application initialization complete!');
            console.log(`✓ Modules loaded: ${Object.values(this.modules).filter(Boolean).length}/${Object.keys(this.modules).length}`);

        } catch (error) {
            console.error('❌ Error during Portfolio initialization:', error);
            this.showErrorMessage(error);
        }
    }

    checkModules() {
        // Check Portfolio Manager
        this.modules.portfolioManager = !!(window.portfolioManager);
        console.log(`  ${this.modules.portfolioManager ? '✓' : '❌'} Portfolio Manager`);

        // Check Cost Calculator
        this.modules.portfolioCostCalculator = !!(window.portfolioCostCalculator);
        console.log(`  ${this.modules.portfolioCostCalculator ? '✓' : '❌'} Cost Calculator`);

        // Check Dashboard
        this.modules.portfolioDashboard = !!(window.portfolioDashboard);
        console.log(`  ${this.modules.portfolioDashboard ? '✓' : '❌'} Dashboard`);

        // Check Analytics Manager
        this.modules.analyticsManager = !!(window.analyticsManager || window.AnalyticsManager);
        console.log(`  ${this.modules.analyticsManager ? '✓' : '❌'} Analytics Manager`);

        const allModulesLoaded = Object.values(this.modules).every(Boolean);
        if (!allModulesLoaded) {
            console.warn('⚠️ Some modules are missing. Application may not function correctly.');
        }
    }

    showWelcomeMessage() {
        // No intrusive welcome message, just console log
        console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║       ZYANTIK PORTFOLIO COST MANAGEMENT           ║
║                                                    ║
║  Load multiple project files to analyze your      ║
║  ICT portfolio costs, timelines, and resources    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
        `);
    }

    showErrorMessage(error) {
        console.error(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║              INITIALIZATION ERROR                  ║
║                                                    ║
║  The Portfolio application failed to initialize.   ║
║  Please check the console for details.            ║
║                                                    ║
╚════════════════════════════════════════════════════╝
        `);
        console.error('Error details:', error);
    }
}

// Create and export instance
window.portfolioInitManager = new PortfolioInitManager();
console.log('🚀 Portfolio Init Manager module loaded');
