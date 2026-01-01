// Rate Card Merger Module
// Handles rate card conflict detection, resolution, and merging

class RateCardMerger {
    constructor() {
        console.log('Rate Card Merger initialized');
        this.conflicts = [];
        this.newRateCards = [];
        this.updatedRateCards = [];
        this.backup = null;
    }

    // Analyze rate cards between master and specialist files
    analyzeRateCards(masterData, specialistData) {
        const masterRateCards = this.normalizeRateCards(masterData);
        const specialistRateCards = this.normalizeRateCards(specialistData);
        
        this.conflicts = [];
        this.newRateCards = [];
        this.updatedRateCards = [];
        
        // Create a map of master rate cards by role name for quick lookup
        const masterMap = new Map();
        masterRateCards.forEach(card => {
            masterMap.set(card.role.toLowerCase(), card);
        });
        
        // Analyze specialist rate cards
        specialistRateCards.forEach(specialistCard => {
            const roleKey = specialistCard.role.toLowerCase();
            const masterCard = masterMap.get(roleKey);
            
            if (!masterCard) {
                // New rate card not in master
                this.newRateCards.push({
                    ...specialistCard,
                    action: 'add',
                    source: 'specialist'
                });
            } else if (this.hasConflict(masterCard, specialistCard)) {
                // Existing card with different rates
                this.conflicts.push({
                    role: specialistCard.role,
                    master: masterCard,
                    specialist: specialistCard,
                    resolution: 'keep_master' // default
                });
            }
        });
        
        return {
            conflicts: this.conflicts,
            newCards: this.newRateCards,
            hasConflicts: this.conflicts.length > 0,
            hasNewCards: this.newRateCards.length > 0
        };
    }
    
    // Normalize rate cards to consistent structure
    normalizeRateCards(projectData) {
        const cards = [];
        
        // Handle different rate card structures in your data
        if (projectData.rateCards) {
            cards.push(...projectData.rateCards);
        }
        
        // Legacy support for separate internal/external rates
        if (projectData.internalRates) {
            projectData.internalRates.forEach(rate => {
                if (!cards.find(c => c.role === rate.role)) {
                    cards.push({
                        ...rate,
                        category: 'Internal'
                    });
                }
            });
        }
        
        if (projectData.externalRates) {
            projectData.externalRates.forEach(rate => {
                if (!cards.find(c => c.role === rate.role)) {
                    cards.push({
                        ...rate,
                        category: 'External'
                    });
                }
            });
        }
        
        return cards;
    }
    
    // Check if two rate cards have conflicts
    hasConflict(masterCard, specialistCard) {
        return masterCard.rate !== specialistCard.rate ||
               masterCard.category !== specialistCard.category;
    }
    
    // Create backup of current rate cards
    createBackup(masterData) {
        this.backup = {
            timestamp: new Date().toISOString(),
            rateCards: JSON.parse(JSON.stringify(masterData.rateCards || [])),
            internalRates: JSON.parse(JSON.stringify(masterData.internalRates || [])),
            externalRates: JSON.parse(JSON.stringify(masterData.externalRates || []))
        };
        console.log('Rate cards backup created');
    }
    
    // Execute the merge with transactional approach
    executeMerge(masterData, resolutions) {
        try {
            // Create backup first
            this.createBackup(masterData);
            
            // Start transaction
            const mergedRateCards = [...this.normalizeRateCards(masterData)];
            const roleMap = new Map(mergedRateCards.map(card => [card.role.toLowerCase(), card]));
            
            // Process new rate cards
            this.newRateCards.forEach(newCard => {
                if (!roleMap.has(newCard.role.toLowerCase())) {
                    mergedRateCards.push({
                        role: newCard.role,
                        rate: newCard.rate,
                        category: newCard.category || 'External'
                    });
                    console.log(`Added new rate card: ${newCard.role}`);
                }
            });
            
            // Process conflicts based on resolutions
            resolutions.forEach(resolution => {
                if (resolution.action === 'use_specialist' || resolution.action === 'update') {
                    const index = mergedRateCards.findIndex(
                        card => card.role.toLowerCase() === resolution.role.toLowerCase()
                    );
                    
                    if (index !== -1) {
                        // Update existing
                        mergedRateCards[index] = {
                            ...mergedRateCards[index],
                            rate: resolution.specialistRate,
                            category: resolution.specialistCategory || mergedRateCards[index].category
                        };
                        console.log(`Updated rate card: ${resolution.role}`);
                    }
                }
            });
            
            // Update master data with merged rate cards
            masterData.rateCards = mergedRateCards;
            
            // Update legacy structures for backward compatibility
            masterData.internalRates = mergedRateCards
                .filter(card => card.category === 'Internal')
                .map(card => ({ role: card.role, rate: card.rate }));
                
            masterData.externalRates = mergedRateCards
                .filter(card => card.category === 'External')
                .map(card => ({ role: card.role, rate: card.rate }));
            
            // Update references in resources if needed
            this.updateResourceReferences(masterData, mergedRateCards);
            
            console.log('Rate cards merge completed successfully');
            return { success: true, mergedCount: mergedRateCards.length };
            
        } catch (error) {
            console.error('Rate card merge failed:', error);
            this.rollback(masterData);
            throw error;
        }
    }
    
    // Update resource references to use new rate cards
    updateResourceReferences(masterData, mergedRateCards) {
        const rateMap = new Map(mergedRateCards.map(card => [card.role, card.rate]));
        
        // Update internal resources
        if (masterData.internalResources) {
            masterData.internalResources.forEach(resource => {
                if (rateMap.has(resource.role)) {
                    resource.rate = rateMap.get(resource.role);
                }
            });
        }
        
        // Update vendor resources if they reference rate cards
        if (masterData.vendorCosts) {
            masterData.vendorCosts.forEach(vendor => {
                if (vendor.role && rateMap.has(vendor.role)) {
                    vendor.rate = rateMap.get(vendor.role);
                }
            });
        }
    }
    
    // Rollback to backup if merge fails
    rollback(masterData) {
        if (this.backup) {
            masterData.rateCards = this.backup.rateCards;
            masterData.internalRates = this.backup.internalRates;
            masterData.externalRates = this.backup.externalRates;
            console.log('Rate cards rolled back to backup');
        }
    }
    
    // Generate summary of merge results
    getMergeSummary(resolutions) {
        const summary = {
            newCardsAdded: this.newRateCards.length,
            cardsUpdated: resolutions.filter(r => r.action === 'use_specialist').length,
            cardsKept: resolutions.filter(r => r.action === 'keep_master').length,
            totalCards: 0
        };
        
        summary.totalCards = summary.newCardsAdded + summary.cardsUpdated + summary.cardsKept;
        
        return summary;
    }
}

// Create and export instance
window.RateCardMerger = new RateCardMerger();
