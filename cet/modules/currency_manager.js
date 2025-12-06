/**
 * Currency Manager Module
 * Handles currency selection and exchange rate management
 */
class CurrencyManager {
    constructor() {
        this.initialized = false;
        console.log('Currency Manager constructed');
    }

    initialize() {
        console.log('Initializing Currency Manager...');
        
        // Ensure currency data structure exists
        if (!window.projectData.currency) {
            window.projectData.currency = {
                primaryCurrency: 'USD',
                exchangeRates: []
            };
        }
        
        this.setupEventListeners();
        this.loadCurrencySettings();
        this.initialized = true;
        
        console.log('✓ Currency Manager initialized');
    }

    setupEventListeners() {
        // Primary currency selection
        const primaryCurrencySelect = document.getElementById('primaryCurrencySelect');
        if (primaryCurrencySelect) {
            primaryCurrencySelect.addEventListener('change', (e) => {
                this.handlePrimaryCurrencyChange(e.target.value);
            });
        }

        // Add exchange rate button
        const addExchangeRateBtn = document.getElementById('addExchangeRate');
        if (addExchangeRateBtn) {
            addExchangeRateBtn.addEventListener('click', () => {
                this.showAddExchangeRateModal();
            });
        }

        // Save currency settings button
        const saveCurrencyBtn = document.getElementById('saveCurrencySettingsBtn');
        if (saveCurrencyBtn) {
            saveCurrencyBtn.addEventListener('click', () => {
                this.saveCurrencySettings();
            });
        }

        console.log('Currency Manager event listeners set up');
    }

    handlePrimaryCurrencyChange(currencyCode) {
        window.projectData.currency.primaryCurrency = currencyCode;
        this.updateCurrencyDisplay();
        console.log('Primary currency changed to:', currencyCode);
    }

    updateCurrencyDisplay() {
        const currencyCode = window.projectData.currency.primaryCurrency;
        const currencyName = this.getCurrencyName(currencyCode);
        const displayElement = document.getElementById('currentCurrencyDisplay');
        
        if (displayElement) {
            displayElement.textContent = `${currencyCode} - ${currencyName}`;
        }

        // Update all currency symbols in the app
        this.updateAllCurrencySymbols();
    }

    getCurrencyName(code) {
        const currencyNames = {
            'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
            'JPY': 'Japanese Yen', 'CNY': 'Chinese Yuan', 'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar', 'CHF': 'Swiss Franc', 'INR': 'Indian Rupee',
            'SGD': 'Singapore Dollar', 'AED': 'UAE Dirham', 'ARS': 'Argentine Peso',
            'BRL': 'Brazilian Real', 'CZK': 'Czech Koruna', 'DKK': 'Danish Krone',
            'HKD': 'Hong Kong Dollar', 'HUF': 'Hungarian Forint', 'IDR': 'Indonesian Rupiah',
            'ILS': 'Israeli Shekel', 'KRW': 'South Korean Won', 'MXN': 'Mexican Peso',
            'MYR': 'Malaysian Ringgit', 'NOK': 'Norwegian Krone', 'NZD': 'New Zealand Dollar',
            'PHP': 'Philippine Peso', 'PLN': 'Polish Zloty', 'RON': 'Romanian Leu',
            'RUB': 'Russian Ruble', 'SEK': 'Swedish Krona', 'THB': 'Thai Baht',
            'TRY': 'Turkish Lira', 'TWD': 'Taiwan Dollar', 'ZAR': 'South African Rand'
        };
        return currencyNames[code] || code;
    }

    getCurrencySymbol(code) {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
            'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'INR': '₹', 'SGD': 'S$',
            'AED': 'د.إ', 'ARS': '$', 'BRL': 'R$', 'CZK': 'Kč', 'DKK': 'kr',
            'HKD': 'HK$', 'HUF': 'Ft', 'IDR': 'Rp', 'ILS': '₪', 'KRW': '₩',
            'MXN': '$', 'MYR': 'RM', 'NOK': 'kr', 'NZD': 'NZ$', 'PHP': '₱',
            'PLN': 'zł', 'RON': 'lei', 'RUB': '₽', 'SEK': 'kr', 'THB': '฿',
            'TRY': '₺', 'TWD': 'NT$', 'ZAR': 'R'
        };
        return symbols[code] || code + ' ';
    }

    updateAllCurrencySymbols() {
        const symbol = this.getCurrencySymbol(window.projectData.currency.primaryCurrency);
        
        // This would be expanded to update all currency displays throughout the app
        // For now, we're just triggering an update of the summary
        if (window.updateSummary) {
            window.updateSummary();
        }
        
        console.log('Currency symbols updated to:', symbol);
    }

    showAddExchangeRateModal() {
        // Get available currencies (exclude primary currency and already added ones)
        const primaryCurrency = window.projectData.currency.primaryCurrency;
        const existingCurrencies = window.projectData.currency.exchangeRates.map(r => r.currency);
        
        const availableCurrencies = this.getAllCurrencies().filter(c => 
            c.code !== primaryCurrency && !existingCurrencies.includes(c.code)
        );

        if (availableCurrencies.length === 0) {
            alert('All available currencies have been added.');
            return;
        }

        // Build currency options HTML
        let optionsHTML = availableCurrencies.map(c => 
            `<option value="${c.code}">${c.code} - ${c.name}</option>`
        ).join('');

        // Use the modal system
        const modalFields = `
            <div class="form-group">
                <label>Currency:</label>
                <select name="currency" class="form-control" required>
                    ${optionsHTML}
                </select>
            </div>
            <div class="form-group">
                <label>Exchange Rate (1 ${primaryCurrency} = ? in selected currency):</label>
                <input type="number" name="rate" class="form-control" min="0" step="0.0001" required placeholder="e.g., 1.25">
                <small>Enter how many units of the selected currency equal 1 ${primaryCurrency}</small>
            </div>
        `;

        if (window.openModal) {
            const modal = document.getElementById('modal');
            const modalTitle = document.getElementById('modalTitle');
            const modalFieldsContainer = document.getElementById('modalFields');
            const modalForm = document.getElementById('modalForm');

            modalTitle.textContent = 'Add Exchange Rate';
            modalFieldsContainer.innerHTML = modalFields;
            modal.style.display = 'block';
            modalForm.setAttribute('data-type', 'exchangeRate');

            // Override the modal submit handler
            modalForm.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(modalForm);
                const currency = formData.get('currency');
                const rate = parseFloat(formData.get('rate'));

                this.addExchangeRate(currency, rate);
                modal.style.display = 'none';
            };
        }
    }

    addExchangeRate(currency, rate) {
        const exchangeRate = {
            id: Date.now(),
            currency: currency,
            rate: rate,
            lastUpdated: new Date().toISOString()
        };

        window.projectData.currency.exchangeRates.push(exchangeRate);
        this.renderExchangeRatesTable();
        
        console.log('Exchange rate added:', exchangeRate);
    }

    deleteExchangeRate(id) {
        if (confirm('Are you sure you want to remove this exchange rate?')) {
            window.projectData.currency.exchangeRates = 
                window.projectData.currency.exchangeRates.filter(r => r.id !== id);
            this.renderExchangeRatesTable();
        }
    }

    renderExchangeRatesTable() {
        const tbody = document.getElementById('exchangeRatesTable');
        const emptyState = document.getElementById('exchangeRatesEmptyState');
        const rates = window.projectData.currency.exchangeRates;

        if (!tbody) return;

        if (rates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No exchange rates configured</td></tr>';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        const primaryCurrency = window.projectData.currency.primaryCurrency;
        
        tbody.innerHTML = rates.map(rate => {
            const currencyName = this.getCurrencyName(rate.currency);
            const lastUpdated = new Date(rate.lastUpdated).toLocaleString();
            
            return `
                <tr class="exchange-rate-row">
                    <td><span class="currency-code">${rate.currency}</span> - ${currencyName}</td>
                    <td>
                        <span>1 ${primaryCurrency} = ${rate.rate} ${rate.currency}</span>
                    </td>
                    <td class="last-updated">${lastUpdated}</td>
                    <td>
                        <button class="btn btn-small btn-danger" onclick="window.currencyManager.deleteExchangeRate(${rate.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadCurrencySettings() {
        // Load primary currency
        const primaryCurrencySelect = document.getElementById('primaryCurrencySelect');
        if (primaryCurrencySelect && window.projectData.currency) {
            primaryCurrencySelect.value = window.projectData.currency.primaryCurrency;
        }

        // Update display
        this.updateCurrencyDisplay();
        
        // Render exchange rates table
        this.renderExchangeRatesTable();

        console.log('Currency settings loaded');
    }

    saveCurrencySettings() {
        // Save to localStorage
        if (window.DataManager && window.DataManager.saveToLocalStorage) {
            window.DataManager.saveToLocalStorage();
        } else if (window.dataManager && window.dataManager.saveToLocalStorage) {
            window.dataManager.saveToLocalStorage();
        } else {
            // Fallback
            try {
                localStorage.setItem('ictProjectData', JSON.stringify(window.projectData));
            } catch (e) {
                console.error('Error saving currency settings:', e);
            }
        }

        // Show success message
        const messageContainer = document.getElementById('currencyMessage');
        if (messageContainer) {
            messageContainer.innerHTML = 'Currency settings saved successfully!';
            messageContainer.className = 'project-info-message success';
            messageContainer.style.display = 'block';

            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 3000);
        }

        console.log('Currency settings saved');
    }

    getAllCurrencies() {
        return [
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' },
            { code: 'GBP', name: 'British Pound' },
            { code: 'JPY', name: 'Japanese Yen' },
            { code: 'CNY', name: 'Chinese Yuan' },
            { code: 'AUD', name: 'Australian Dollar' },
            { code: 'CAD', name: 'Canadian Dollar' },
            { code: 'CHF', name: 'Swiss Franc' },
            { code: 'INR', name: 'Indian Rupee' },
            { code: 'SGD', name: 'Singapore Dollar' },
            { code: 'AED', name: 'UAE Dirham' },
            { code: 'ARS', name: 'Argentine Peso' },
            { code: 'BRL', name: 'Brazilian Real' },
            { code: 'CZK', name: 'Czech Koruna' },
            { code: 'DKK', name: 'Danish Krone' },
            { code: 'HKD', name: 'Hong Kong Dollar' },
            { code: 'HUF', name: 'Hungarian Forint' },
            { code: 'IDR', name: 'Indonesian Rupiah' },
            { code: 'ILS', name: 'Israeli Shekel' },
            { code: 'KRW', name: 'South Korean Won' },
            { code: 'MXN', name: 'Mexican Peso' },
            { code: 'MYR', name: 'Malaysian Ringgit' },
            { code: 'NOK', name: 'Norwegian Krone' },
            { code: 'NZD', name: 'New Zealand Dollar' },
            { code: 'PHP', name: 'Philippine Peso' },
            { code: 'PLN', name: 'Polish Zloty' },
            { code: 'RON', name: 'Romanian Leu' },
            { code: 'RUB', name: 'Russian Ruble' },
            { code: 'SEK', name: 'Swedish Krona' },
            { code: 'THB', name: 'Thai Baht' },
            { code: 'TRY', name: 'Turkish Lira' },
            { code: 'TWD', name: 'Taiwan Dollar' },
            { code: 'ZAR', name: 'South African Rand' }
        ];
    }

    // Helper method to convert amounts between currencies
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        const primaryCurrency = window.projectData.currency.primaryCurrency;
        
        // If converting from primary currency
        if (fromCurrency === primaryCurrency) {
            const rate = window.projectData.currency.exchangeRates.find(r => r.currency === toCurrency);
            return rate ? amount * rate.rate : amount;
        }
        
        // If converting to primary currency
        if (toCurrency === primaryCurrency) {
            const rate = window.projectData.currency.exchangeRates.find(r => r.currency === fromCurrency);
            return rate ? amount / rate.rate : amount;
        }

        // For conversions between two non-primary currencies, go through primary
        const toRate = window.projectData.currency.exchangeRates.find(r => r.currency === toCurrency);
        const fromRate = window.projectData.currency.exchangeRates.find(r => r.currency === fromCurrency);
        
        if (toRate && fromRate) {
            const inPrimary = amount / fromRate.rate;
            return inPrimary * toRate.rate;
        }

        return amount;
    }
}

// Create and export the singleton instance
window.currencyManager = new CurrencyManager();
console.log('Currency Manager module loaded');
