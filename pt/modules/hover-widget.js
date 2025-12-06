/**
 * Hover Widget Navigation
 * Provides a side-panel navigation widget for switching between Zyantik applications
 */

class HoverWidget {
    constructor(config = {}) {
        this.config = {
            items: config.items || [],
            position: config.position || 'left',
            ...config
        };
        
        this.init();
    }
    
    init() {
        this.createWidget();
        this.attachEventListeners();
    }
    
    createWidget() {
        // Create main container
        const container = document.createElement('div');
        container.className = 'hover-widget-container';
        container.id = 'hoverWidget';
        
        // Create panel structure
        const panel = document.createElement('div');
        panel.className = 'widget-panel';
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        // Create icons container
        const icons = document.createElement('div');
        icons.className = 'panel-icons';
        
        // Add configured items
        this.config.items.forEach(item => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            iconItem.dataset.url = item.url;
            iconItem.dataset.app = item.id;
            
            // Add SVG icon
            const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.innerHTML = item.iconSvg;
            
            // Add label
            const label = document.createElement('span');
            label.className = 'icon-label';
            label.textContent = item.label;
            
            iconItem.appendChild(iconSvg);
            iconItem.appendChild(label);
            icons.appendChild(iconItem);
        });
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'widget-tab';
        
        const arrow = document.createElement('span');
        arrow.className = 'widget-tab-arrow';
        arrow.textContent = '❯';
        
        tab.appendChild(arrow);
        
        // Assemble structure
        content.appendChild(icons);
        panel.appendChild(content);
        panel.appendChild(tab);
        container.appendChild(panel);
        
        // Add to body
        document.body.appendChild(container);
        
        this.container = container;
        this.icons = icons;
    }
    
    attachEventListeners() {
        // Navigation click handlers
        this.icons.addEventListener('click', (e) => {
            const iconItem = e.target.closest('.icon-item');
            if (iconItem) {
                this.handleNavigation(iconItem);
            }
        });
        
        // Optional: Keyboard shortcut (Ctrl/Cmd + M to toggle)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.container.classList.toggle('force-open');
            }
        });
    }
    
    handleNavigation(iconItem) {
        const url = iconItem.dataset.url;
        const appId = iconItem.dataset.app;
        
        console.log(`🚀 Navigating to: ${appId}`);
        
        // Add visual feedback
        iconItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            iconItem.style.transform = '';
        }, 150);
        
        // Navigate after brief delay for visual feedback
        setTimeout(() => {
            if (url) {
                window.location.href = url;
            } else {
                console.warn(`No URL configured for ${appId}`);
            }
        }, 200);
    }
    
    // Public method to add new items dynamically
    addItem(item) {
        this.config.items.push(item);
        
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        iconItem.dataset.url = item.url;
        iconItem.dataset.app = item.id;
        
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.innerHTML = item.iconSvg;
        
        const label = document.createElement('span');
        label.className = 'icon-label';
        label.textContent = item.label;
        
        iconItem.appendChild(iconSvg);
        iconItem.appendChild(label);
        this.icons.appendChild(iconItem);
    }
    
    // Public method to remove the widget
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Configuration for Zyantik applications
    const widgetConfig = {
        items: [
            {
                id: 'estimator',
                label: 'Cost Estimator',
                iconSvg: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
                url: 'index.html' // Current application - could link to home or refresh
            },
            {
                id: 'portfolio',
                label: 'Portfolio Manager',
                iconSvg: '<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 12H5V8h14v10z"/>',
                url: 'portfolio.html' // Update with actual URL when available
            }
            // Add more applications as needed:
            // {
            //     id: 'resource-manager',
            //     label: 'Resource Manager',
            //     iconSvg: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
            //     url: 'resources.html'
            // }
        ],
        position: 'left'
    };
    
    // Create the widget
    window.zyantikWidget = new HoverWidget(widgetConfig);
    
    console.log('✅ Zyantik Hover Widget initialized');
});
