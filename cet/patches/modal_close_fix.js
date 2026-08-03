// ============================================================================
// MODAL CLOSE BUTTON FIX - V4 (Properly Resets State)
// Fixes close button WITHOUT breaking modal reopening
// ============================================================================

(function() {
    'use strict';
    
    console.log('🔧 Loading modal close button fix V4...');
    
    // Function to properly close the modal and reset state
    function closeModal() {
        const modal = document.getElementById('modal');
        if (!modal) return;

        console.log('🚪 Closing modal properly...');

        // Set display to none (standard way)
        modal.style.display = 'none';

        // Restore standard Save/Cancel buttons in case they were hidden (e.g. after vendor cost modal)
        if (window.restoreStandardModalButtons) {
            window.restoreStandardModalButtons();
        }

        console.log('✅ Modal closed');
    }
    
    // Fix function that only handles close button
    function fixModalCloseButtons() {
        console.log('🔧 Fixing modal close buttons...');
        
        const modal = document.getElementById('modal');
        const mergeModal = document.getElementById('mergeModal');
        
        if (modal) {
            // Get the close button
            const closeBtn = modal.querySelector('.close');
            const cancelBtn = document.getElementById('cancelModal');
            
            if (closeBtn) {
                // Remove existing onclick to avoid conflicts
                closeBtn.onclick = null;
                
                // Add new click handler - use named function for easier debugging
                closeBtn.addEventListener('click', function modalCloseBtnClick(e) {
                    console.log('✅ Close button (X) clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                });
                
                console.log('✅ Close button event listener added');
            }
            
            if (cancelBtn) {
                // Remove existing listeners
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                
                newCancelBtn.addEventListener('click', function modalCancelBtnClick(e) {
                    console.log('✅ Cancel button clicked');
                    e.preventDefault();
                    closeModal();
                });
                
                console.log('✅ Cancel button event listener added');
            }
            
            // Click outside modal to close
            modal.addEventListener('click', function modalBackdropClick(e) {
                if (e.target === modal) {
                    console.log('✅ Clicked outside modal - closing');
                    closeModal();
                }
            });
            
            // Escape key to close
            document.addEventListener('keydown', function modalEscapeKey(e) {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    console.log('✅ Escape key pressed - closing modal');
                    closeModal();
                }
            });
        }
        
        // Fix merge modal too
        if (mergeModal) {
            const mergeCloseBtn = mergeModal.querySelector('.close');
            if (mergeCloseBtn) {
                mergeCloseBtn.onclick = null;
                mergeCloseBtn.addEventListener('click', function mergeModalCloseBtnClick(e) {
                    console.log('✅ Merge modal close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    mergeModal.style.display = 'none';
                });
            }
        }
        
        console.log('✅ Modal close button fix complete');
    }
    
    // Force CSS styles
    function forceCloseButtonStyles() {
        // Check if already added
        if (document.getElementById('modal-close-fix-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'modal-close-fix-styles';
        style.textContent = `
            /* Close button styles with high specificity */
            #modal .close,
            .modal .close {
                position: absolute !important;
                top: 1rem !important;
                right: 1.5rem !important;
                z-index: 9999 !important;
                cursor: pointer !important;
                pointer-events: auto !important;
                width: 32px !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 2rem !important;
                font-weight: bold !important;
                color: #6b7280 !important;
                background: transparent !important;
                border: none !important;
                transition: all 0.2s ease !important;
            }
            
            #modal .close:hover,
            .modal .close:hover {
                color: #374151 !important;
                background-color: #f3f4f6 !important;
                border-radius: 4px !important;
            }
            
            #modal .close:active,
            .modal .close:active {
                background-color: #e5e7eb !important;
                transform: scale(0.95) !important;
            }
            
            .modal-content {
                position: relative !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Close button styles applied');
    }
    
    // Monitor for modal opening and ensure close button is ready
    function monitorModalOpening() {
        const modal = document.getElementById('modal');
        if (!modal) {
            console.warn('⚠️ Modal element not found');
            return;
        }
        
        // Use MutationObserver to watch for display changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = modal.style.display;
                    if (display === 'block') {
                        console.log('📢 Modal opened - ensuring close button is ready');
                        
                        // Small delay to ensure modal content is rendered
                        setTimeout(function() {
                            const closeBtn = modal.querySelector('.close');
                            if (closeBtn) {
                                // Ensure the close button is clickable
                                closeBtn.style.pointerEvents = 'auto';
                                closeBtn.style.cursor = 'pointer';
                                console.log('✅ Close button ready');
                            }
                        }, 50);
                    }
                }
            });
        });
        
        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        console.log('✅ Modal monitor active');
    }
    
    // Initialize everything
    function init() {
        console.log('🚀 Initializing modal close fix V4...');
        forceCloseButtonStyles();
        fixModalCloseButtons();
        monitorModalOpening();
        console.log('✅ Modal close button fix V4 initialized');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run on window load as backup
    window.addEventListener('load', function() {
        console.log('🔄 Window loaded - running init again');
        setTimeout(init, 100);
    });
    
})();

console.log('✅ Modal close button fix V4 loaded - Properly resets state');
