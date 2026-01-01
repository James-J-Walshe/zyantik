/**
 * Feature Toggle Manager Module
 * Handles feature flags, toggle management, and feature availability checks
 */
class FeatureToggleManager {
    constructor() {
        this.initialized = false;
        this.toggles = {};
        console.log('Feature Toggle Manager constructed');
    }

    initialize() {
        console.log('Initializing Feature Toggle Manager...');
        
        // Ensure feature toggles data structure exists
        if (!window.projectData.featureToggles) {
            window.projectData.featureToggles = {
                toggles: this.getDefaultToggles(),
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Load toggles
        this.loadToggles();
        
        // Setup admin UI button if user is admin
        this.setupAdminButton();
        
        // Apply feature toggles to UI
        this.applyFeatureToggles();
        
        this.initialized = true;
        console.log('✓ Feature Toggle Manager initialized');
    }

    getDefaultToggles() {
        return {
            "export_excel": {
                key: "export_excel",
                displayName: "Excel Export",
                description: "Enable exporting project data to Excel format",
                enabled: true,
                restrictions: {
                    roles: [],
                    userIds: []
                }
            },
            "currency_management": {
                key: "currency_management",
                displayName: "Currency Management",
                description: "Enable multi-currency support and exchange rates",
                enabled: true,
                restrictions: {
                    roles: ["admin"],
                    userIds: []
                }
            },
            "risk_assessment": {
                key: "risk_assessment",
                displayName: "Risk Assessment",
                description: "Enable risk and contingency planning features",
                enabled: true,
                restrictions: {
                    roles: [],
                    userIds: []
                }
            },
            "advanced_reporting": {
                key: "advanced_reporting",
                displayName: "Advanced Reporting",
                description: "Enable advanced reporting and analytics features",
                enabled: false,
                restrictions: {
                    roles: ["admin"],
                    userIds: []
                }
            },
            "project_templates": {
                key: "project_templates",
                displayName: "Project Templates",
                description: "Enable saving and loading project templates",
                enabled: false,
                restrictions: {
                    roles: [],
                    userIds: []
                }
            },
            "api_integration": {
                key: "api_integration",
                displayName: "API Integration",
                description: "Enable external API integrations",
                enabled: false,
                restrictions: {
                    roles: ["admin"],
                    userIds: []
                }
            }
        };
    }

    loadToggles() {
        this.toggles = window.projectData.featureToggles?.toggles || this.getDefaultToggles();
        console.log('Feature toggles loaded:', Object.keys(this.toggles).length, 'toggles');
    }

    saveToggles() {
        window.projectData.featureToggles = {
            toggles: this.toggles,
            lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        if (window.DataManager && window.DataManager.saveToLocalStorage) {
            window.DataManager.saveToLocalStorage();
        } else {
            try {
                localStorage.setItem('ictProjectData', JSON.stringify(window.projectData));
            } catch (e) {
                console.error('Error saving feature toggles:', e);
            }
        }
        
        console.log('Feature toggles saved');
    }

    isFeatureEnabled(featureKey) {
        const toggle = this.toggles[featureKey];
        
        if (!toggle) {
            console.warn(`Feature toggle not found: ${featureKey}`);
            return false;
        }
        
        // Check if globally disabled
        if (!toggle.enabled) {
            return false;
        }
        
        // Check user restrictions
        const currentUser = window.userManager?.getCurrentUser();
        
        if (!currentUser) {
            // No user logged in - only allow features without restrictions
            return toggle.restrictions.roles.length === 0 && 
                   toggle.restrictions.userIds.length === 0;
        }
        
        // Check role restrictions
        if (toggle.restrictions.roles.length > 0) {
            if (!toggle.restrictions.roles.includes(currentUser.role)) {
                return false;
            }
        }
        
        // Check user ID restrictions
        if (toggle.restrictions.userIds.length > 0) {
            if (!toggle.restrictions.userIds.includes(currentUser.id)) {
                return false;
            }
        }
        
        return true;
    }

    setupAdminButton() {
        const currentUser = window.userManager?.getCurrentUser();
        
        // Only show for admin users
        if (!currentUser || currentUser.role !== 'admin') {
            return;
        }
        
        // Add feature toggles button to header
        const desktopMenu = document.querySelector('.desktop-menu');
        if (desktopMenu) {
            // Check if button already exists
            if (!document.getElementById('featureTogglesBtn')) {
                const togglesBtn = document.createElement('button');
                togglesBtn.id = 'featureTogglesBtn';
                togglesBtn.className = 'btn btn-secondary';
                togglesBtn.innerHTML = '⚡ Feature Toggles';
                togglesBtn.onclick = () => this.showAdminUI();
                
                // Insert before settings button
                const settingsBtn = document.getElementById('settingsBtn');
                desktopMenu.insertBefore(togglesBtn, settingsBtn);
            }
        }
        
        // Add to mobile menu
        const mobileDropdown = document.getElementById('mobileDropdown');
        if (mobileDropdown) {
            // Check if button already exists
            if (!document.getElementById('featureTogglesBtnMobile')) {
                const togglesBtnMobile = document.createElement('button');
                togglesBtnMobile.id = 'featureTogglesBtnMobile';
                togglesBtnMobile.className = 'dropdown-item';
                togglesBtnMobile.innerHTML = '<span>⚡ Feature Toggles</span>';
                togglesBtnMobile.onclick = () => {
                    this.showAdminUI();
                    mobileDropdown.style.display = 'none';
                };
                
                // Insert before settings button
                const settingsBtnMobile = document.getElementById('settingsBtnMobile');
                mobileDropdown.insertBefore(togglesBtnMobile, settingsBtnMobile);
            }
        }
    }

    showAdminUI() {
        // Create admin UI view
        const adminView = document.createElement('div');
        adminView.id = 'featureTogglesAdmin';
        adminView.className = 'feature-toggles-view';
        adminView.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
            overflow-y: auto;
        `;
        
        adminView.innerHTML = `
            <div class="feature-toggles-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
                <div class="feature-toggles-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                ">
                    <h1 style="font-size: 2rem; font-weight: 600; color: #374151;">
                        ⚡ Feature Toggles Management
                    </h1>
                    <button onclick="window.featureToggleManager.closeAdminUI()" style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        border: 1px solid #dee2e6;
                        background: #f8f9fa;
                        color: #6c757d;
                        font-size: 24px;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
                
                <div class="feature-toggles-stats" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                ">
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 1.5rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 2rem; font-weight: 700;">${Object.keys(this.toggles).length}</div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Total Features</div>
                    </div>
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 1.5rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 2rem; font-weight: 700;">
                            ${Object.values(this.toggles).filter(t => t.enabled).length}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Enabled</div>
                    </div>
                    <div class="stat-card" style="
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        color: white;
                        padding: 1.5rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 2rem; font-weight: 700;">
                            ${Object.values(this.toggles).filter(t => t.restrictions.roles.length > 0).length}
                        </div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">Restricted</div>
                    </div>
                </div>
                
                <div class="actions-bar" style="
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                ">
                    <button onclick="window.featureToggleManager.addNewToggle()" style="
                        padding: 0.75rem 1.5rem;
                        background: #4f46e5;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">+ Add New Feature Toggle</button>
                    <button onclick="window.featureToggleManager.saveAllChanges()" style="
                        padding: 0.75rem 1.5rem;
                        background: #10b981;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">💾 Save All Changes</button>
                </div>
                
                <div id="togglesList" class="toggles-list">
                    ${this.renderTogglesList()}
                </div>
            </div>
        `;
        
        document.body.appendChild(adminView);
    }

    renderTogglesList() {
        return Object.values(this.toggles).map(toggle => `
            <div class="toggle-card" style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151;">
                                ${toggle.displayName}
                            </h3>
                            <code style="
                                background: #e5e7eb;
                                padding: 2px 8px;
                                border-radius: 4px;
                                font-size: 0.75rem;
                            ">${toggle.key}</code>
                            ${toggle.enabled ? `
                                <span style="
                                    background: #10b981;
                                    color: white;
                                    padding: 2px 8px;
                                    border-radius: 4px;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                ">ENABLED</span>
                            ` : `
                                <span style="
                                    background: #ef4444;
                                    color: white;
                                    padding: 2px 8px;
                                    border-radius: 4px;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                ">DISABLED</span>
                            `}
                        </div>
                        <p style="color: #6b7280; margin-bottom: 1rem;">${toggle.description}</p>
                        
                        <div style="display: flex; gap: 2rem;">
                            <div>
                                <strong style="font-size: 0.875rem; color: #374151;">Restricted to Roles:</strong>
                                <span style="color: #6b7280; font-size: 0.875rem;">
                                    ${toggle.restrictions.roles.length > 0 ? toggle.restrictions.roles.join(', ') : 'None (All users)'}
                                </span>
                            </div>
                            <div>
                                <strong style="font-size: 0.875rem; color: #374151;">Restricted to User IDs:</strong>
                                <span style="color: #6b7280; font-size: 0.875rem;">
                                    ${toggle.restrictions.userIds.length > 0 ? toggle.restrictions.userIds.join(', ') : 'None'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="window.featureToggleManager.toggleFeature('${toggle.key}')" style="
                            padding: 0.5rem 1rem;
                            background: ${toggle.enabled ? '#ef4444' : '#10b981'};
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                        ">${toggle.enabled ? 'Disable' : 'Enable'}</button>
                        <button onclick="window.featureToggleManager.editToggle('${toggle.key}')" style="
                            padding: 0.5rem 1rem;
                            background: #4f46e5;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                        ">Edit</button>
                        <button onclick="window.featureToggleManager.deleteToggle('${toggle.key}')" style="
                            padding: 0.5rem 1rem;
                            background: #dc2626;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                        ">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    toggleFeature(key) {
        if (this.toggles[key]) {
            this.toggles[key].enabled = !this.toggles[key].enabled;
            this.refreshAdminUI();
        }
    }

    editToggle(key) {
        const toggle = this.toggles[key];
        if (!toggle) return;
        
        // Show edit modal
        const modal = document.createElement('div');
        modal.id = 'editToggleModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-bottom: 1.5rem; color: #374151;">Edit Feature Toggle</h2>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Feature Key:</label>
                    <input type="text" id="editKey" value="${toggle.key}" readonly style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        background: #f3f4f6;
                    ">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Display Name:</label>
                    <input type="text" id="editDisplayName" value="${toggle.displayName}" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description:</label>
                    <textarea id="editDescription" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        min-height: 80px;
                    ">${toggle.description}</textarea>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Enabled:</label>
                    <select id="editEnabled" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                        <option value="true" ${toggle.enabled ? 'selected' : ''}>Enabled</option>
                        <option value="false" ${!toggle.enabled ? 'selected' : ''}>Disabled</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Restricted Roles (comma-separated):</label>
                    <input type="text" id="editRoles" value="${toggle.restrictions.roles.join(', ')}" placeholder="e.g., admin, user" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                    <small style="color: #6b7280; font-size: 0.75rem;">Leave empty to allow all roles</small>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Restricted User IDs (comma-separated):</label>
                    <input type="text" id="editUserIds" value="${toggle.restrictions.userIds.join(', ')}" placeholder="e.g., user123, user456" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                    <small style="color: #6b7280; font-size: 0.75rem;">Leave empty to allow all users</small>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.featureToggleManager.saveEditToggle('${toggle.key}')" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: #4f46e5;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Save Changes</button>
                    <button onclick="window.featureToggleManager.closeEditModal()" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    saveEditToggle(key) {
        const toggle = this.toggles[key];
        if (!toggle) return;
        
        toggle.displayName = document.getElementById('editDisplayName').value;
        toggle.description = document.getElementById('editDescription').value;
        toggle.enabled = document.getElementById('editEnabled').value === 'true';
        
        const rolesInput = document.getElementById('editRoles').value;
        toggle.restrictions.roles = rolesInput ? rolesInput.split(',').map(r => r.trim()).filter(r => r) : [];
        
        const userIdsInput = document.getElementById('editUserIds').value;
        toggle.restrictions.userIds = userIdsInput ? userIdsInput.split(',').map(u => u.trim()).filter(u => u) : [];
        
        this.closeEditModal();
        this.refreshAdminUI();
    }

    closeEditModal() {
        const modal = document.getElementById('editToggleModal');
        if (modal) modal.remove();
    }

    addNewToggle() {
        // Show add modal
        const modal = document.createElement('div');
        modal.id = 'addToggleModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-bottom: 1.5rem; color: #374151;">Add New Feature Toggle</h2>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Feature Key:</label>
                    <input type="text" id="newKey" placeholder="e.g., my_new_feature" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                    <small style="color: #6b7280; font-size: 0.75rem;">Use lowercase with underscores</small>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Display Name:</label>
                    <input type="text" id="newDisplayName" placeholder="e.g., My New Feature" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description:</label>
                    <textarea id="newDescription" placeholder="Describe what this feature does..." style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        min-height: 80px;
                    "></textarea>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Initial State:</label>
                    <select id="newEnabled" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                        <option value="false">Disabled</option>
                        <option value="true">Enabled</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Restricted Roles (comma-separated):</label>
                    <input type="text" id="newRoles" placeholder="e.g., admin, user" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                    <small style="color: #6b7280; font-size: 0.75rem;">Leave empty to allow all roles</small>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.featureToggleManager.saveNewToggle()" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: #4f46e5;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Add Feature Toggle</button>
                    <button onclick="window.featureToggleManager.closeAddModal()" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    saveNewToggle() {
        const key = document.getElementById('newKey').value.trim();
        const displayName = document.getElementById('newDisplayName').value.trim();
        const description = document.getElementById('newDescription').value.trim();
        const enabled = document.getElementById('newEnabled').value === 'true';
        const rolesInput = document.getElementById('newRoles').value;
        
        if (!key || !displayName) {
            alert('Feature key and display name are required');
            return;
        }
        
        if (this.toggles[key]) {
            alert('A feature with this key already exists');
            return;
        }
        
        this.toggles[key] = {
            key: key,
            displayName: displayName,
            description: description,
            enabled: enabled,
            restrictions: {
                roles: rolesInput ? rolesInput.split(',').map(r => r.trim()).filter(r => r) : [],
                userIds: []
            }
        };
        
        this.closeAddModal();
        this.refreshAdminUI();
    }

    closeAddModal() {
        const modal = document.getElementById('addToggleModal');
        if (modal) modal.remove();
    }

    deleteToggle(key) {
        if (confirm(`Are you sure you want to delete the feature toggle "${this.toggles[key].displayName}"?`)) {
            delete this.toggles[key];
            this.refreshAdminUI();
        }
    }

    refreshAdminUI() {
        const togglesList = document.getElementById('togglesList');
        if (togglesList) {
            togglesList.innerHTML = this.renderTogglesList();
        }
    }

    saveAllChanges() {
        this.saveToggles();
        this.applyFeatureToggles();
        alert('All changes saved successfully!');
    }

    closeAdminUI() {
        const adminView = document.getElementById('featureTogglesAdmin');
        if (adminView) {
            adminView.remove();
        }
        // Re-apply feature toggles to ensure UI is updated
        this.applyFeatureToggles();
    }

    applyFeatureToggles() {
        // Apply toggles to UI elements
        this.applyToggleToElement('exportBtn', 'export_excel');
        this.applyToggleToElement('exportBtnMobile', 'export_excel');
        
        // Currency tab in settings
        const currencyTab = document.querySelector('[data-settings-tab="currency"]');
        if (currencyTab) {
            currencyTab.style.display = this.isFeatureEnabled('currency_management') ? 'flex' : 'none';
        }
        
        // Risks tab
        const risksTab = document.querySelector('[data-tab="risks"]');
        if (risksTab) {
            risksTab.style.display = this.isFeatureEnabled('risk_assessment') ? 'inline-block' : 'none';
        }
        
        // Update admin button visibility
        this.setupAdminButton();
        
        console.log('Feature toggles applied to UI');
    }

    applyToggleToElement(elementId, featureKey) {
        const element = document.getElementById(elementId);
        if (element) {
            const isEnabled = this.isFeatureEnabled(featureKey);
            element.style.display = isEnabled ? '' : 'none';
            
            // Also disable the element to prevent any attached events
            if (!isEnabled) {
                element.disabled = true;
            } else {
                element.disabled = false;
            }
        }
    }

    refreshFeatures() {
        // Called when user login/logout occurs
        this.applyFeatureToggles();
        console.log('Features refreshed based on user context');
    }

// Add to your existing FeatureToggleManager class:

    showFeatureTogglesFromDropdown() {
        // Show feature toggles in user settings view
        const mainApp = document.getElementById('mainApp');
        const userApp = document.getElementById('userApp');
        
        if (mainApp && userApp) {
            mainApp.style.display = 'none';
            userApp.style.display = 'block';
            
            // Switch to features tab
            const featuresTab = document.querySelector('[data-user-tab="features"]');
            if (featuresTab) {
                featuresTab.click();
            }
            
            // Render toggles in user-friendly format
            this.renderUserFeatureToggles();
        }
    }

    renderUserFeatureToggles() {
        const container = document.querySelector('.feature-toggles-list');
        if (!container) return;
        
        const currentUser = window.userManager?.getCurrentUser();
        
        container.innerHTML = Object.values(this.toggles)
            .filter(toggle => {
                // Only show toggles the current user can access
                return this.isFeatureEnabled(toggle.key) || 
                       (currentUser && currentUser.role === 'admin');
            })
            .map(toggle => this.createUserToggleElement(toggle))
            .join('');
    }

    setupDropdownIntegration() {
        const featureTogglesBtn = document.getElementById('featureTogglesBtn');
        if (featureTogglesBtn) {
            featureTogglesBtn.addEventListener('click', () => {
                const currentUser = window.userManager?.getCurrentUser();
                if (currentUser && currentUser.role === 'admin') {
                    this.showAdminUI(); // Your existing admin UI
                } else {
                    this.showFeatureTogglesFromDropdown(); // User view
                }
            });
        }
    }

}

// Create and export singleton
window.featureToggleManager = new FeatureToggleManager();
console.log('Feature Toggle Manager module loaded');
