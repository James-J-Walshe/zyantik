/**
 * Zyantik Blog - Category Filter and Utilities
 * 
 * This script provides:
 * - Category filtering functionality
 * - Smooth scroll for navigation
 * - Read time estimation
 */

// Category Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize category filters if they exist
    const filterBtns = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get selected category
                const category = this.dataset.category;
                
                // Filter blog cards with smooth animation
                blogCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = 'block';
                        // Fade in animation
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.transition = 'opacity 0.3s ease-in-out';
                            card.style.opacity = '1';
                        }, 10);
                    } else {
                        // Fade out animation
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
                
                // Update URL with selected category (optional)
                if (category !== 'all') {
                    const url = new URL(window.location);
                    url.searchParams.set('category', category);
                    window.history.pushState({}, '', url);
                } else {
                    const url = new URL(window.location);
                    url.searchParams.delete('category');
                    window.history.pushState({}, '', url);
                }
            });
        });
        
        // Check URL for category parameter on page load
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            const targetBtn = document.querySelector(`[data-category="${categoryParam}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    }
    
    // Pagination functionality
    const pageButtons = document.querySelectorAll('.page-btn');
    
    if (pageButtons.length > 0) {
        pageButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all page buttons
                pageButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                if (!this.textContent.includes('Next') && !this.textContent.includes('Previous')) {
                    this.classList.add('active');
                }
                
                // Scroll to top of blog container smoothly
                const blogContainer = document.querySelector('.blog-container');
                if (blogContainer) {
                    blogContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
                // In a real implementation, this would load new blog posts
                // For now, we'll just simulate the page change
                console.log('Loading page:', this.textContent);
            });
        });
    }
    
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Don't prevent default if it's just '#'
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Calculate and display read time for blog posts
    function calculateReadTime() {
        const postContent = document.querySelector('.post-content');
        
        if (postContent) {
            const text = postContent.textContent;
            const wordsPerMinute = 200; // Average reading speed
            const wordCount = text.trim().split(/\s+/).length;
            const readTime = Math.ceil(wordCount / wordsPerMinute);
            
            // Update read time if element exists
            const readTimeElements = document.querySelectorAll('.post-read-time');
            readTimeElements.forEach(element => {
                if (!element.textContent.includes('min')) {
                    element.textContent = `${readTime} min read`;
                }
            });
        }
    }
    
    calculateReadTime();
    
    // Add copy functionality to code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        `;
        
        // Make pre relative for absolute positioning
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
        
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                copyBtn.innerHTML = '✓ Copied!';
                copyBtn.style.background = 'rgba(0, 255, 0, 0.2)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                    copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code:', err);
                copyBtn.innerHTML = '✗ Failed';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                }, 2000);
            }
        });
        
        // Hover effect
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        copyBtn.addEventListener('mouseleave', () => {
            if (!copyBtn.innerHTML.includes('Copied')) {
                copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
    });
    
    // Add table of contents functionality for long posts
    function generateTableOfContents() {
        const postContent = document.querySelector('.post-content');
        
        if (!postContent) return;
        
        const headings = postContent.querySelectorAll('h2');
        
        if (headings.length < 3) return; // Only show TOC for posts with 3+ sections
        
        // Create TOC container
        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h3>Table of Contents</h3><ul></ul>';
        toc.style.cssText = `
            background: var(--bg-secondary);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        `;
        
        const tocList = toc.querySelector('ul');
        tocList.style.cssText = `
            list-style: none;
            padding-left: 0;
        `;
        
        // Add headings to TOC
        headings.forEach((heading, index) => {
            // Add ID to heading for linking
            const id = `section-${index}`;
            heading.id = id;
            
            // Create TOC item
            const li = document.createElement('li');
            li.style.cssText = 'margin-bottom: 0.5rem;';
            
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            link.style.cssText = `
                color: var(--primary-color);
                text-decoration: none;
                transition: all 0.2s ease;
            `;
            
            link.addEventListener('mouseenter', () => {
                link.style.textDecoration = 'underline';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.textDecoration = 'none';
            });
            
            li.appendChild(link);
            tocList.appendChild(li);
        });
        
        // Insert TOC after author section or at beginning of content
        const author = document.querySelector('.post-author');
        if (author) {
            author.after(toc);
        } else {
            postContent.prepend(toc);
        }
    }
    
    generateTableOfContents();
    
    // Add social sharing buttons (optional)
    function addSocialSharing() {
        const postContainer = document.querySelector('.post-container');
        
        if (!postContainer) return;
        
        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share';
        shareContainer.innerHTML = `
            <h4>Share this article</h4>
            <div class="share-buttons">
                <button class="share-btn twitter" data-platform="twitter">
                    🐦 Twitter
                </button>
                <button class="share-btn linkedin" data-platform="linkedin">
                    💼 LinkedIn
                </button>
                <button class="share-btn facebook" data-platform="facebook">
                    📘 Facebook
                </button>
                <button class="share-btn copy-link" data-platform="copy">
                    🔗 Copy Link
                </button>
            </div>
        `;
        
        shareContainer.style.cssText = `
            margin: 3rem 0;
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: 8px;
            text-align: center;
        `;
        
        const shareButtons = shareContainer.querySelector('.share-buttons');
        shareButtons.style.cssText = `
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 1rem;
        `;
        
        // Style all share buttons
        const buttons = shareContainer.querySelectorAll('.share-btn');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                background: var(--primary-color);
                color: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
            
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const url = window.location.href;
                const title = document.title;
                
                let shareUrl;
                
                switch(platform) {
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                        window.open(shareUrl, '_blank', 'width=550,height=420');
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                        window.open(shareUrl, '_blank', 'width=550,height=420');
                        break;
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                        window.open(shareUrl, '_blank', 'width=550,height=420');
                        break;
                    case 'copy':
                        navigator.clipboard.writeText(url).then(() => {
                            btn.innerHTML = '✓ Copied!';
                            setTimeout(() => {
                                btn.innerHTML = '🔗 Copy Link';
                            }, 2000);
                        });
                        break;
                }
            });
        });
        
        // Insert before tags
        const tags = document.querySelector('.post-tags');
        if (tags) {
            tags.before(shareContainer);
        }
    }
    
    addSocialSharing();
    
    console.log('Zyantik Blog scripts loaded successfully! ✨');
});
