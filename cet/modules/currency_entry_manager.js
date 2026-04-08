/**
 * Currency Entry Manager — STR-001
 * Provides shared helpers for multi-currency cost entry across
 * Internal Resources, Vendor Costs, and Tool Costs tabs.
 *
 * All functions are attached to window so they degrade gracefully
 * if the module fails to load.
 */

/* ---- Constants ---- */
const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW'];

/* ------------------------------------------------------------------ */
/* window.buildCurrencyOptions(selectedCode)                          */
/* Returns an HTML <option> string for every currency returned by     */
/* window.currencyManager.getAllCurrencies(). The base currency is     */
/* labelled "(base)". selectedCode (or base currency) is pre-selected. */
/* ------------------------------------------------------------------ */
window.buildCurrencyOptions = function buildCurrencyOptions(selectedCode) {
    if (!window.currencyManager || !window.projectData) return '';

    const primaryCurrency = window.projectData.currency?.primaryCurrency || 'USD';
    const effectiveSelected = selectedCode || primaryCurrency;
    const currencies = window.currencyManager.getAllCurrencies();

    return currencies.map(c => {
        const isBase = c.code === primaryCurrency;
        const label = isBase ? `${c.code} - ${c.name} (base)` : `${c.code} - ${c.name}`;
        const selected = c.code === effectiveSelected ? 'selected' : '';
        return `<option value="${c.code}" ${selected}>${label}</option>`;
    }).join('');
};

/* ------------------------------------------------------------------ */
/* window.validateCurrencyRate(currencyCode, selectorEl, errorEl)     */
/* Returns true when the currency needs no rate (base) or a rate      */
/* exists. Returns false and applies error state otherwise.           */
/* selectorEl and errorEl are optional — pass null when calling from  */
/* the save path if you want to supply them explicitly.               */
/* ------------------------------------------------------------------ */
window.validateCurrencyRate = function validateCurrencyRate(currencyCode, selectorEl, errorEl) {
    if (!window.projectData) return true;

    const primaryCurrency = window.projectData.currency?.primaryCurrency || 'USD';

    // Base currency always valid
    if (!currencyCode || currencyCode === primaryCurrency) {
        if (selectorEl) selectorEl.classList.remove('input-error');
        if (errorEl)    errorEl.style.display = 'none';
        return true;
    }

    // Look for a matching exchange rate
    const rates = window.projectData.currency?.exchangeRates || [];
    const rateExists = rates.some(r => r.currency === currencyCode);

    if (rateExists) {
        if (selectorEl) selectorEl.classList.remove('input-error');
        if (errorEl)    errorEl.style.display = 'none';
        return true;
    }

    // Rate missing — apply error state
    if (selectorEl) selectorEl.classList.add('input-error');
    if (errorEl) {
        errorEl.textContent = `Exchange rate for ${currencyCode} is not configured. Please configure it in Settings before adding this cost.`;
        errorEl.style.display = 'block';
    }
    return false;
};

/* ------------------------------------------------------------------ */
/* window.convertAndFormatCost(amount, fromCurrency)                  */
/* Returns { originalText, convertedText }                            */
/* convertedText is null when fromCurrency is the base currency.      */
/* ------------------------------------------------------------------ */
window.convertAndFormatCost = function convertAndFormatCost(amount, fromCurrency) {
    if (!window.currencyManager || !window.projectData) {
        return { originalText: String(amount), convertedText: null };
    }

    const primaryCurrency = window.projectData.currency?.primaryCurrency || 'USD';
    const fromSymbol = window.currencyManager.getCurrencySymbol(fromCurrency);
    const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(fromCurrency);
    const originalText = `${fromSymbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: isZeroDecimal ? 0 : 2,
        maximumFractionDigits: isZeroDecimal ? 0 : 2
    })} ${fromCurrency}`;

    if (fromCurrency === primaryCurrency) {
        return { originalText, convertedText: null };
    }

    const convertedAmount = window.currencyManager.convertCurrency(amount, fromCurrency, primaryCurrency);
    const baseSymbol = window.currencyManager.getCurrencySymbol(primaryCurrency);
    const isBaseZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(primaryCurrency);
    const convertedText = `= ${baseSymbol}${convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: isBaseZeroDecimal ? 0 : 2,
        maximumFractionDigits: isBaseZeroDecimal ? 0 : 2
    })} ${primaryCurrency}`;

    return { originalText, convertedText };
};

/* ------------------------------------------------------------------ */
/* window.buildCostCellHTML(entry, totalCost)                         */
/* Returns the innerHTML for a Total Cost <td>.                       */
/* Plain formatted amount for base / absent currency entries.         */
/* Two-span structure for non-base entries.                           */
/* ------------------------------------------------------------------ */
window.buildCostCellHTML = function buildCostCellHTML(entry, totalCost) {
    if (!window.projectData) return totalCost.toLocaleString();

    const primaryCurrency = window.projectData.currency?.primaryCurrency || 'USD';
    const entryCurrency = entry && entry.currency;

    // No currency annotation needed
    if (!entryCurrency || entryCurrency === primaryCurrency) {
        return totalCost.toLocaleString();
    }

    // Non-base currency — show dual annotation
    const originalAmount = (entry.originalAmount !== undefined) ? entry.originalAmount : totalCost;
    const { originalText, convertedText } = window.convertAndFormatCost(originalAmount, entryCurrency);

    if (!convertedText) {
        // Conversion failed gracefully — fall back to plain
        return totalCost.toLocaleString();
    }

    return `<span class="cost-original">${originalText}</span><span class="cost-converted">${convertedText}</span>`;
};

/* ------------------------------------------------------------------ */
/* window.isRateStale(entry)                                          */
/* Returns true when the entry has a non-base currency that no longer  */
/* has a matching rate in projectData.currency.exchangeRates.         */
/* ------------------------------------------------------------------ */
window.isRateStale = function isRateStale(entry) {
    if (!entry || !window.projectData) return false;

    const primaryCurrency = window.projectData.currency?.primaryCurrency || 'USD';
    const entryCurrency = entry.currency;

    if (!entryCurrency || entryCurrency === primaryCurrency) return false;

    const rates = window.projectData.currency?.exchangeRates || [];
    return !rates.some(r => r.currency === entryCurrency);
};

/* ------------------------------------------------------------------ */
/* window.initCurrencySelectors(modalEl)                              */
/* Populates all .currency-selector elements in the modal, then       */
/* attaches change and blur listeners for validation.                 */
/* modalEl defaults to the global #modal element if not provided.     */
/* ------------------------------------------------------------------ */
window.initCurrencySelectors = function initCurrencySelectors(modalEl) {
    const container = modalEl || document.getElementById('modal');
    if (!container) return;

    const selectors = container.querySelectorAll('.currency-selector');
    if (!selectors.length) return;

    selectors.forEach(selector => {
        // Populate options
        selector.innerHTML = window.buildCurrencyOptions ? window.buildCurrencyOptions() : '';

        // Error span lives in the same form-group
        const formGroup = selector.closest('.form-group');
        const errorEl = formGroup ? formGroup.querySelector('.currency-error-msg') : null;

        // Resolve the associated amount input (next numeric input after the selector's form-group)
        // We look for the nearest following number or cost input in the modal.
        function findAmountInput() {
            if (!formGroup) return null;
            // Walk siblings of the form-group
            let next = formGroup.nextElementSibling;
            while (next) {
                const input = next.querySelector('input[type="number"]');
                if (input) return input;
                next = next.nextElementSibling;
            }
            return null;
        }

        // Change on the selector — clear error if now valid; re-validate if amount non-empty
        selector.addEventListener('change', () => {
            const amountInput = findAmountInput();
            const amountFilled = amountInput && amountInput.value !== '';
            if (amountFilled) {
                window.validateCurrencyRate(selector.value, selector, errorEl);
            } else {
                // Just clear any stale error for the old currency
                selector.classList.remove('input-error');
                if (errorEl) errorEl.style.display = 'none';
                // Re-validate new selection
                window.validateCurrencyRate(selector.value, selector, errorEl);
            }
        });

        // Blur on the amount input — validate the current currency selection
        const amountInput = findAmountInput();
        if (amountInput) {
            amountInput.addEventListener('blur', () => {
                window.validateCurrencyRate(selector.value, selector, errorEl);
            });
        }
    });
};

console.log('currency_entry_manager.js loaded — STR-001');
