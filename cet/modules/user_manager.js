/**
 * User Manager Module
 * Handles user authentication, roles, and session management
 */
class UserManager {
    constructor() {
        this.initialized = false;
        this.currentUser = null;
        console.log('User Manager constructed');
    }

    initialize() {
        console.log('Initializing User Manager...');
        
        // Load user session from localStorage
        this.loadUserSession();
        
        // Setup login/logout UI
        this.setupUserInterface();
        
        // If no user logged in, show login prompt
        if (!this.currentUser) {
            this.showLoginPrompt();
        }
        
        this.initialized = true;
        console.log('✓ User Manager initialized');
    }

    loadUserSession() {
        try {
            const sessionData = localStorage.getItem('userSession');
            if (sessionData) {
                this.currentUser = JSON.parse(sessionData);
                console.log('User session loaded:', this.currentUser.username);
            }
        } catch (e) {
            console.error('Error loading user session:', e);
        }
    }

    saveUserSession() {
        try {
            if (this.currentUser) {
                localStorage.setItem('userSession', JSON.stringify(this.currentUser));
            } else {
                localStorage.removeItem('userSession');
            }
        } catch (e) {
            console.error('Error saving user session:', e);
        }
    }

    login(username, role = 'user') {
        // Simple login - in production, this would validate against a backend
        this.currentUser = {
            id: Date.now().toString(),
            username: username,
            role: role, // 'admin' or 'user'
            loginTime: new Date().toISOString()
        };
        
        this.saveUserSession();
        this.updateUserDisplay();
        
        // Trigger feature toggle refresh
        if (window.featureToggleManager) {
            window.featureToggleManager.refreshFeatures();
        }
        
        console.log('User logged in:', username, role);
        return true;
    }

    logout() {
        this.currentUser = null;
        this.saveUserSession();
        this.updateUserDisplay();
        this.showLoginPrompt();
        
        // Trigger feature toggle refresh
        if (window.featureToggleManager) {
            window.featureToggleManager.refreshFeatures();
        }
        
        console.log('User logged out');
    }

    setupUserInterface() {
        // Add user display to header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const userDisplay = document.createElement('div');
            userDisplay.id = 'userDisplay';
            userDisplay.className = 'user-display';
            userDisplay.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                margin-right: 10px;
                padding: 5px 10px;
                background: rgba(255,255,255,0.2);
                border-radius: 6px;
                color: white;
                font-size: 0.875rem;
            `;
            
            // Insert before the first button
            headerActions.insertBefore(userDisplay, headerActions.firstChild);
            
            this.updateUserDisplay();
        }
    }

    updateUserDisplay() {
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            if (this.currentUser) {
                userDisplay.innerHTML = `
                    <span>${this.currentUser.username}</span>
                    <span class="role-badge" style="
                        background: ${this.currentUser.role === 'admin' ? '#fbbf24' : '#60a5fa'};
                        color: ${this.currentUser.role === 'admin' ? '#000' : '#fff'};
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: bold;
                    ">${this.currentUser.role.toUpperCase()}</span>
                    <button onclick="window.userManager.logout()" style="
                        background: rgba(255,255,255,0.3);
                        border: none;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.75rem;
                    ">Logout</button>
                `;
            } else {
                userDisplay.innerHTML = `
                    <button onclick="window.userManager.showLoginPrompt()" style="
                        background: rgba(255,255,255,0.3);
                        border: none;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Login</button>
                `;
            }
        }
    }

    showLoginPrompt() {
        // Create login modal
        const modal = document.createElement('div');
        modal.id = 'loginModal';
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
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                width: 400px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-bottom: 1.5rem; color: #374151;">Login</h2>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Username:</label>
                    <input type="text" id="loginUsername" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    " placeholder="Enter username">
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Role:</label>
                    <select id="loginRole" style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                    ">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.userManager.handleLogin()" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: #4f46e5;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Login</button>
                    <button onclick="window.userManager.closeLoginModal()" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel (Guest Mode)</button>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
                    <strong>Demo Users:</strong><br>
                    • Admin: admin (full access)<br>
                    • User: user1 (limited access)<br>
                    • Guest: Cancel (no login required)
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus username field
        setTimeout(() => {
            document.getElementById('loginUsername')?.focus();
        }, 100);
    }

    handleLogin() {
        const username = document.getElementById('loginUsername')?.value;
        const role = document.getElementById('loginRole')?.value;
        
        if (username) {
            this.login(username, role);
            this.closeLoginModal();
        } else {
            alert('Please enter a username');
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.remove();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    showUserProfile() {
        // Show user profile view from dropdown
        const mainApp = document.getElementById('mainApp');
        const userApp = document.getElementById('userApp');
        
        if (mainApp && userApp) {
            mainApp.style.display = 'none';
            userApp.style.display = 'block';
            
            // Load current user data
            this.loadUserProfileData();
        }
    }

    loadUserProfileData() {
        if (this.currentUser) {
            const userNameField = document.getElementById('userName');
            const userEmailField = document.getElementById('userEmail');
            const userRoleField = document.getElementById('userRole');
            
            if (userNameField) userNameField.value = this.currentUser.username;
            if (userEmailField) userEmailField.value = this.currentUser.email || '';
            if (userRoleField) userRoleField.value = this.currentUser.role;
        }
    }

    setupDropdownIntegration() {
        // Update the user badge in the new dropdown menu
        const currentUserName = document.getElementById('currentUserName');
        if (currentUserName && this.currentUser) {
            currentUserName.textContent = this.currentUser.username;
        }
        
        // Hook up the dropdown menu items
        const userProfileBtn = document.getElementById('userProfileBtn');
        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', () => this.showUserProfile());
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

}

// Create and export singleton
window.userManager = new UserManager();
console.log('User Manager module loaded');
