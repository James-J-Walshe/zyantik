// modules/ai_project_extractor.js
// AI Project Extractor - Uses Claude API to extract project details from text,
// images, and documents simultaneously for maximum context.

class AIProjectExtractor {
    constructor() {
        this.modalId = 'aiExtractorModal';
        this.images    = [];   // [{ base64, mediaType, name }]
        this.documents = [];   // [{ base64, mediaType, name, textContent }]
        console.log('🤖 AI Project Extractor loaded');
    }

    initialize() {
        console.log('✓ AI Project Extractor initialized');
        this.connectButton();
    }

    connectButton() {
        const btn = document.getElementById('aiExtractBtn');
        if (btn && !btn.hasAttribute('data-ai-listener-attached')) {
            btn.addEventListener('click', () => {
                if (window.initManager) window.initManager.closeAllDropdowns();
                this.showModal();
            });
            btn.setAttribute('data-ai-listener-attached', 'true');
        }
    }

    // ─── Modal ───────────────────────────────────────────────────────────────

    showModal() {
        const existing = document.getElementById(this.modalId);
        if (existing) existing.remove();
        this.images    = [];
        this.documents = [];

        const container = document.createElement('div');
        container.id = this.modalId;
        container.innerHTML = this.buildModalHTML();
        document.body.appendChild(container);

        this.injectStyles();
        this.wireModalEvents(container);

        requestAnimationFrame(() => {
            container.querySelector('.aipe-overlay').style.opacity = '1';
        });
    }

    buildModalHTML() {
        const savedKey = localStorage.getItem('claudeApiKey') || '';
        return `
        <div class="aipe-overlay" style="opacity:0;">
            <div class="aipe-modal">
                <div class="aipe-header">
                    <div class="aipe-header-title">
                        <span class="aipe-icon">✨</span>
                        <h2>AI Project Extractor</h2>
                    </div>
                    <button class="aipe-close" id="aipeClose" title="Close">✕</button>
                </div>

                <div class="aipe-body">

                    <!-- API Key + Model -->
                    <div class="aipe-section">
                        <label class="aipe-label">Claude API Key</label>
                        <div class="aipe-api-row">
                            <input type="password" id="aipeApiKey" class="aipe-input"
                                   value="${savedKey}" placeholder="sk-ant-api03-…" autocomplete="off">
                            <button type="button" id="aipeToggleKey" class="aipe-icon-btn" title="Show/hide key">👁</button>
                        </div>
                        <p class="aipe-hint">Stored locally in your browser. Get your key at <strong>console.anthropic.com</strong></p>
                    </div>
                    <div class="aipe-section">
                        <label class="aipe-label">Model</label>
                        <select id="aipeModel" class="aipe-select">
                            <option value="claude-haiku-4-5-20251001" ${this.getSavedModel() === 'claude-haiku-4-5-20251001' ? 'selected' : ''}>Claude Haiku 4.5 — Fast &amp; economical</option>
                            <option value="claude-sonnet-4-6"         ${this.getSavedModel() === 'claude-sonnet-4-6'         ? 'selected' : ''}>Claude Sonnet 4.6 — Balanced</option>
                            <option value="claude-opus-4-6"           ${this.getSavedModel() === 'claude-opus-4-6'           ? 'selected' : ''}>Claude Opus 4.6 — Most capable</option>
                        </select>
                        <p class="aipe-hint">A more capable model may extract richer detail from complex documents or images.</p>
                    </div>

                    <p class="aipe-intro">Provide as much information as you have — any combination of text, images, and documents will be used together to extract your project details.</p>

                    <!-- ① Text description -->
                    <div class="aipe-section">
                        <label class="aipe-label">📝 Project Description <span class="aipe-optional">optional</span></label>
                        <textarea id="aipeText" class="aipe-textarea"
                            placeholder="Describe your project here. For example:&#10;&#10;'We need to deliver a new customer portal by end of Q4 2025. The project starts in July 2025. We'll need a project manager full-time, two developers for 6 months, a business analyst for the first 3 months, and QA for the final 2 months. The project is called Customer Portal Upgrade and will be led by Sarah Johnson.'"></textarea>
                    </div>

                    <!-- ② Images -->
                    <div class="aipe-section">
                        <label class="aipe-label">🖼️ Images / Timeline Screenshots <span class="aipe-optional">optional</span></label>
                        <div class="aipe-drop-zone" id="aipeImageDropZone">
                            <div class="aipe-drop-icon">🖼️</div>
                            <p>Drop images here, or <strong>click to browse</strong></p>
                            <p class="aipe-hint">PNG, JPG, GIF, WEBP · up to 5 images · max 5 MB each</p>
                            <input type="file" id="aipeImageInput" accept="image/png,image/jpeg,image/gif,image/webp" multiple style="display:none;">
                        </div>
                        <div id="aipeImageList" class="aipe-file-list"></div>
                    </div>

                    <!-- ③ Documents -->
                    <div class="aipe-section">
                        <label class="aipe-label">📄 Documents <span class="aipe-optional">optional</span></label>
                        <div class="aipe-drop-zone" id="aipeDocDropZone">
                            <div class="aipe-drop-icon">📄</div>
                            <p>Drop documents here, or <strong>click to browse</strong></p>
                            <p class="aipe-hint">PDF, Word (.docx), plain text (.txt, .md) · up to 3 files · max 10 MB each</p>
                            <input type="file" id="aipeDocInput" accept=".pdf,.docx,.doc,.txt,.md,.csv" multiple style="display:none;">
                        </div>
                        <div id="aipeDocList" class="aipe-file-list"></div>
                    </div>

                    <!-- Submit -->
                    <div class="aipe-actions">
                        <button type="button" id="aipeSubmit" class="aipe-btn-primary">🔍 Extract Project Details</button>
                        <button type="button" id="aipeCancel" class="aipe-btn-secondary">Cancel</button>
                    </div>

                    <!-- Loading -->
                    <div id="aipeLoading" class="aipe-loading" style="display:none;">
                        <div class="aipe-spinner"></div>
                        <p id="aipeLoadingMsg">Analysing with Claude AI…</p>
                    </div>

                    <!-- Results -->
                    <div id="aipeResults" style="display:none;">
                        <div class="aipe-results-header">
                            <h3>✅ Extracted Project Details</h3>
                            <p class="aipe-hint">Review the details below, then click <strong>Apply</strong> to populate your project.</p>
                        </div>
                        <div id="aipeResultsContent"></div>
                        <div class="aipe-results-actions">
                            <button type="button" id="aipeApply" class="aipe-btn-primary">Apply to Project</button>
                            <button type="button" id="aipeRetry" class="aipe-btn-secondary">Try Again</button>
                        </div>
                    </div>

                    <!-- Error -->
                    <div id="aipeError" class="aipe-error" style="display:none;"></div>

                </div>
            </div>
        </div>`;
    }

    wireModalEvents(container) {
        // Close
        container.querySelector('#aipeClose').addEventListener('click', () => this.closeModal());
        container.querySelector('#aipeCancel').addEventListener('click', () => this.closeModal());
        container.querySelector('.aipe-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('aipe-overlay')) this.closeModal();
        });

        this._escHandler = (e) => { if (e.key === 'Escape') this.closeModal(); };
        document.addEventListener('keydown', this._escHandler);

        // API key visibility toggle
        container.querySelector('#aipeToggleKey').addEventListener('click', () => {
            const inp = container.querySelector('#aipeApiKey');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        });

        // Image drop zone
        this.wireDropZone(
            container.querySelector('#aipeImageDropZone'),
            container.querySelector('#aipeImageInput'),
            container.querySelector('#aipeImageList'),
            'image',
            container
        );

        // Document drop zone
        this.wireDropZone(
            container.querySelector('#aipeDocDropZone'),
            container.querySelector('#aipeDocInput'),
            container.querySelector('#aipeDocList'),
            'document',
            container
        );

        // Submit
        container.querySelector('#aipeSubmit').addEventListener('click', () => this.handleSubmit(container));
    }

    wireDropZone(dropZone, fileInput, listEl, type, container) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            [...e.dataTransfer.files].forEach(f => this.loadFile(f, type, listEl, container));
        });

        fileInput.addEventListener('change', () => {
            [...fileInput.files].forEach(f => this.loadFile(f, type, listEl, container));
            fileInput.value = '';
        });
    }

    // ─── File Loading ─────────────────────────────────────────────────────────

    loadFile(file, type, listEl, container) {
        if (type === 'image') {
            this.loadImageFile(file, listEl, container);
        } else {
            this.loadDocumentFile(file, listEl, container);
        }
    }

    loadImageFile(file, listEl, container) {
        if (this.images.length >= 5) {
            this.showError('Maximum 5 images allowed.', container);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showError(`Image "${file.name}" exceeds 5 MB limit.`, container);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            const entry = { base64, mediaType: file.type, name: file.name };
            this.images.push(entry);
            this.addFileChip(listEl, file.name, () => {
                this.images = this.images.filter(i => i !== entry);
            });
        };
        reader.readAsDataURL(file);
    }

    async loadDocumentFile(file, listEl, container) {
        if (this.documents.length >= 3) {
            this.showError('Maximum 3 documents allowed.', container);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            this.showError(`File "${file.name}" exceeds 10 MB limit.`, container);
            return;
        }

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                const entry = { base64, mediaType: 'application/pdf', name: file.name, textContent: null };
                this.documents.push(entry);
                this.addFileChip(listEl, file.name, () => {
                    this.documents = this.documents.filter(d => d !== entry);
                });
            };
            reader.readAsDataURL(file);

        } else if (ext === 'docx' || ext === 'doc') {
            try {
                const textContent = await this.extractWordText(file, container);
                const entry = { base64: null, mediaType: null, name: file.name, textContent };
                this.documents.push(entry);
                this.addFileChip(listEl, file.name, () => {
                    this.documents = this.documents.filter(d => d !== entry);
                });
            } catch (err) {
                this.showError(`Could not read "${file.name}": ${err.message}`, container);
            }

        } else {
            // Plain text: txt, md, csv
            const reader = new FileReader();
            reader.onload = (e) => {
                const entry = { base64: null, mediaType: null, name: file.name, textContent: e.target.result };
                this.documents.push(entry);
                this.addFileChip(listEl, file.name, () => {
                    this.documents = this.documents.filter(d => d !== entry);
                });
            };
            reader.readAsText(file);
        }
    }

    async extractWordText(file, container) {
        // Load mammoth.js from CDN dynamically (only when a Word doc is uploaded)
        if (!window.mammoth) {
            this.updateLoadingMsg('Loading Word document parser…', container);
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js';
                s.onload = resolve;
                s.onerror = () => reject(new Error('Could not load Word parser. Try saving the file as PDF or TXT.'));
                document.head.appendChild(s);
            });
            this.updateLoadingMsg('Analysing with Claude AI…', container);
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }

    addFileChip(listEl, name, onRemove) {
        const chip = document.createElement('div');
        chip.className = 'aipe-file-chip';
        chip.innerHTML = `<span class="aipe-chip-name" title="${this.esc(name)}">${this.esc(name)}</span>
                          <button type="button" class="aipe-chip-remove" title="Remove">✕</button>`;
        chip.querySelector('.aipe-chip-remove').addEventListener('click', () => {
            onRemove();
            chip.remove();
        });
        listEl.appendChild(chip);
    }

    closeModal() {
        document.removeEventListener('keydown', this._escHandler);
        const modal = document.getElementById(this.modalId);
        if (modal) {
            const overlay = modal.querySelector('.aipe-overlay');
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease';
            setTimeout(() => modal.remove(), 200);
        }
        this.images    = [];
        this.documents = [];
    }

    // ─── API Call ─────────────────────────────────────────────────────────────

    async handleSubmit(container) {
        const apiKey = container.querySelector('#aipeApiKey').value.trim();
        if (!apiKey) {
            this.showError('Please enter your Claude API key.', container);
            return;
        }

        const text = container.querySelector('#aipeText').value.trim();
        const hasInput = text || this.images.length > 0 || this.documents.length > 0;
        if (!hasInput) {
            this.showError('Please provide at least one input: a description, an image, or a document.', container);
            return;
        }

        localStorage.setItem('claudeApiKey', apiKey);
        const model = container.querySelector('#aipeModel').value;
        localStorage.setItem('claudeModel', model);

        this.setLoadingState(true, container);
        this.hideError(container);
        container.querySelector('#aipeResults').style.display = 'none';

        try {
            const result = await this.callClaudeAPI(apiKey, model, text, container);
            this.setLoadingState(false, container);
            this.showResults(result, container);
        } catch (err) {
            this.setLoadingState(false, container);
            this.showError(`Error: ${err.message}`, container);
        }
    }

    async callClaudeAPI(apiKey, model, text, container) {
        const today = new Date().toISOString().slice(0, 7); // YYYY-MM

        const systemPrompt = `You are an expert project analyst. Extract structured project details from all provided inputs (text, images, and documents). Combine all sources — prioritise the most specific information available across all inputs.

Today's date is ${today}.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "projectName": "string",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM",
  "projectManager": "string or empty string",
  "projectDescription": "string - 1-3 sentence summary",
  "suggestedResources": [
    {
      "role": "string - must be one of the available roles",
      "category": "Internal or External",
      "allocationPercent": number between 0 and 100,
      "startMonthOffset": number (0 = project start),
      "endMonthOffset": number (0-based from project start, inclusive),
      "rationale": "brief explanation"
    }
  ],
  "confidence": "high or medium or low",
  "notes": "string - any important caveats or assumptions made"
}

Available roles (use exact names):
Internal: Project Manager, Business Analyst, Technical Lead, Developer, Tester
External: Senior Consultant, Technical Architect, Implementation Specialist, Support Specialist

Rules:
- Dates MUST always be provided in YYYY-MM format — never leave them blank.
- If dates are explicitly stated in the inputs, use those.
- If dates are not stated, derive them from any available evidence (e.g. "Q3 2025 launch" → endDate 2025-09, startDate estimated 6 months earlier). Use today's date (${today}) as your reference point for relative dates like "next quarter" or "in 3 months".
- Explain any date estimates in the "notes" field.
- allocationPercent: 100 = full time (20 days/month), 50 = half time (10 days/month)
- startMonthOffset and endMonthOffset are 0-indexed from project start
- Only suggest roles that are genuinely needed based on the inputs
- projectManager: extract the person's name if mentioned, otherwise leave empty
- Synthesise information across all inputs; later or more specific inputs take precedence`;

        // Build multipart content array
        const userContent = [];

        // Add text description first
        if (text) {
            userContent.push({ type: 'text', text: `Project description:\n\n${text}` });
        }

        // Add images
        this.images.forEach((img, i) => {
            if (i === 0) userContent.push({ type: 'text', text: `Project image${this.images.length > 1 ? ` ${i + 1} of ${this.images.length}` : ''}:` });
            else userContent.push({ type: 'text', text: `Project image ${i + 1} of ${this.images.length}:` });
            userContent.push({
                type: 'image',
                source: { type: 'base64', media_type: img.mediaType, data: img.base64 }
            });
        });

        // Add documents
        for (const doc of this.documents) {
            if (doc.base64) {
                // PDF — use document API
                userContent.push({ type: 'text', text: `Document: ${doc.name}` });
                userContent.push({
                    type: 'document',
                    source: { type: 'base64', media_type: doc.mediaType, data: doc.base64 }
                });
            } else if (doc.textContent) {
                // Plain text (Word extracted or text file)
                userContent.push({
                    type: 'text',
                    text: `Document "${doc.name}":\n\n${doc.textContent.substring(0, 8000)}`
                });
            }
        }

        userContent.push({ type: 'text', text: 'Extract all available project details from the above inputs and return the JSON.' });

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 4096,
                system: systemPrompt,
                messages: [{ role: 'user', content: userContent }]
            })
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.content?.[0]?.text || '';

        // Robustly extract JSON: find the outermost { ... } block,
        // handling any code-fence variation Claude might use
        const firstBrace = rawText.indexOf('{');
        const lastBrace  = rawText.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
            throw new Error(`No JSON object found in AI response. Raw output: ${rawText.substring(0, 200)}`);
        }
        const jsonStr = rawText.slice(firstBrace, lastBrace + 1);

        try {
            return JSON.parse(jsonStr);
        } catch {
            throw new Error(`Could not parse AI response. Raw output: ${rawText.substring(0, 200)}`);
        }
    }

    // ─── Results ──────────────────────────────────────────────────────────────

    showResults(result, container) {
        const projectMonthCount = this.monthsBetween(result.startDate, result.endDate);

        const resourceRows = (result.suggestedResources || []).map(r => {
            const daysPerMonth = Math.round((r.allocationPercent / 100) * 20);
            const duration = (r.endMonthOffset - r.startMonthOffset + 1);
            return `<tr>
                <td><strong>${this.esc(r.role)}</strong></td>
                <td>${this.esc(r.category)}</td>
                <td>${r.allocationPercent}% <span class="aipe-days">(${daysPerMonth} days/mo)</span></td>
                <td>${duration} month${duration !== 1 ? 's' : ''}</td>
                <td class="aipe-rationale">${this.esc(r.rationale || '')}</td>
            </tr>`;
        }).join('');

        const badges = { high: 'aipe-badge-high', medium: 'aipe-badge-medium', low: 'aipe-badge-low' };
        const confidenceLabel = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };
        const confidenceBadge = result.confidence
            ? `<span class="aipe-badge ${badges[result.confidence] || ''}">${confidenceLabel[result.confidence] || result.confidence}</span>`
            : '';

        container.querySelector('#aipeResultsContent').innerHTML = `
            <div class="aipe-result-grid">
                <div class="aipe-result-item">
                    <span class="aipe-result-label">Project Name</span>
                    <span class="aipe-result-value">${this.esc(result.projectName || '—')}</span>
                </div>
                <div class="aipe-result-item">
                    <span class="aipe-result-label">Start Date</span>
                    <span class="aipe-result-value">${this.esc(result.startDate || '—')}</span>
                </div>
                <div class="aipe-result-item">
                    <span class="aipe-result-label">End Date</span>
                    <span class="aipe-result-value">${this.esc(result.endDate || '—')}</span>
                </div>
                <div class="aipe-result-item">
                    <span class="aipe-result-label">Duration</span>
                    <span class="aipe-result-value">${projectMonthCount} month${projectMonthCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="aipe-result-item">
                    <span class="aipe-result-label">Project Manager</span>
                    <span class="aipe-result-value">${this.esc(result.projectManager || '—')}</span>
                </div>
                <div class="aipe-result-item aipe-result-wide">
                    <span class="aipe-result-label">Description</span>
                    <span class="aipe-result-value">${this.esc(result.projectDescription || '—')}</span>
                </div>
            </div>

            ${resourceRows ? `
            <h4 class="aipe-section-title">Suggested Resource Profile</h4>
            <div class="aipe-table-wrap">
                <table class="aipe-resource-table">
                    <thead><tr>
                        <th>Role</th><th>Category</th><th>Allocation</th><th>Duration</th><th>Rationale</th>
                    </tr></thead>
                    <tbody>${resourceRows}</tbody>
                </table>
            </div>` : ''}

            ${result.notes ? `<div class="aipe-notes">ℹ️ ${this.esc(result.notes)}</div>` : ''}
            ${confidenceBadge}
        `;

        container.querySelector('#aipeResults').style.display = 'block';
        container.querySelector('#aipeApply').onclick = () => this.applyToProject(result, container);
        container.querySelector('#aipeRetry').onclick = () => {
            container.querySelector('#aipeResults').style.display = 'none';
        };

        // Scroll results into view
        container.querySelector('#aipeResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ─── Apply ────────────────────────────────────────────────────────────────

    applyToProject(result, container) {
        const pd = window.projectData;
        if (!pd) {
            this.showError('projectData not available.', container);
            return;
        }

        if (result.projectName)        pd.projectInfo.projectName        = result.projectName;
        if (result.startDate)          pd.projectInfo.startDate          = result.startDate;
        if (result.endDate)            pd.projectInfo.endDate            = result.endDate;
        if (result.projectManager)     pd.projectInfo.projectManager     = result.projectManager;
        if (result.projectDescription) pd.projectInfo.projectDescription = result.projectDescription;

        this.syncFormFields(pd.projectInfo);

        if ((result.suggestedResources || []).length > 0) {
            this.applyResources(result.suggestedResources, pd);
        }

        if (typeof window.updateSummary === 'function')           window.updateSummary();
        if (typeof window.updateMonthHeaders === 'function')      window.updateMonthHeaders();
        if (window.tableRenderer?.renderAllTables)                window.tableRenderer.renderAllTables();
        if (typeof window.renderResourcePlanForecast === 'function') window.renderResourcePlanForecast();

        try { localStorage.setItem('ictProjectData', JSON.stringify(pd)); } catch (_) {}

        this.closeModal();

        if (window.initManager?.showSettingsView) {
            window.initManager.showSettingsView('project-info');
        }

        console.log('✅ AI-extracted project details applied successfully');
    }

    syncFormFields(info) {
        const dateFields = new Set(['startDate', 'endDate']);
        ['projectName', 'startDate', 'endDate', 'projectManager', 'projectDescription'].forEach(key => {
            const el = document.getElementById(key);
            if (!el || !info[key]) return;
            // type="date" inputs require YYYY-MM-DD; projectData stores YYYY-MM, so append -01
            el.value = dateFields.has(key) ? `${info[key]}-01` : info[key];
        });
    }

    applyResources(resources, pd) {
        const totalMonths = this.monthsBetween(pd.projectInfo.startDate, pd.projectInfo.endDate);
        if (totalMonths < 1) return;

        resources.forEach(r => {
            const rateCard = pd.rateCards.find(rc => rc.role === r.role && rc.category === r.category)
                          || pd.rateCards.find(rc => rc.role === r.role);
            if (!rateCard) {
                console.warn(`⚠ Rate card not found for role: ${r.role}`);
                return;
            }

            const daysPerMonth = Math.round((r.allocationPercent / 100) * 20);
            const resource = {
                id: Date.now() + Math.random(),
                role: rateCard.role,
                rateCard: rateCard.category,
                dailyRate: rateCard.rate
            };

            for (let m = 1; m <= Math.min(totalMonths, 24); m++) {
                const idx = m - 1;
                const inRange = idx >= (r.startMonthOffset || 0) &&
                                idx <= (r.endMonthOffset !== undefined ? r.endMonthOffset : totalMonths - 1);
                resource[`month${m}Days`] = inRange ? daysPerMonth : 0;
            }

            pd.internalResources.push(resource);
        });

        console.log(`✓ Applied ${resources.length} resource(s) to project`);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    getSavedModel() {
        return localStorage.getItem('claudeModel') || 'claude-haiku-4-5-20251001';
    }

    monthsBetween(startStr, endStr) {
        if (!startStr || !endStr) return 0;
        const [sy, sm] = startStr.split('-').map(Number);
        const [ey, em] = endStr.split('-').map(Number);
        return (ey - sy) * 12 + (em - sm) + 1;
    }

    setLoadingState(loading, container) {
        container.querySelector('#aipeLoading').style.display = loading ? 'flex' : 'none';
        container.querySelector('#aipeSubmit').disabled       = loading;
    }

    updateLoadingMsg(msg, container) {
        const el = container?.querySelector('#aipeLoadingMsg');
        if (el) el.textContent = msg;
    }

    showError(msg, container) {
        const el = container.querySelector('#aipeError');
        el.textContent = msg;
        el.style.display = 'block';
    }

    hideError(container) {
        container.querySelector('#aipeError').style.display = 'none';
    }

    esc(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ─── Styles ───────────────────────────────────────────────────────────────

    injectStyles() {
        if (document.getElementById('aipe-styles')) return;
        const style = document.createElement('style');
        style.id = 'aipe-styles';
        style.textContent = `
        .aipe-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6);
            z-index: 10500; display: flex; align-items: center; justify-content: center;
            padding: 16px; transition: opacity 0.25s ease;
        }
        .aipe-modal {
            background: #fff; border-radius: 12px; width: 100%; max-width: 700px;
            max-height: 92vh; overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25); display: flex; flex-direction: column;
        }
        .aipe-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 18px 24px; border-radius: 12px 12px 0 0;
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white;
            position: sticky; top: 0; z-index: 1;
        }
        .aipe-header-title { display: flex; align-items: center; gap: 10px; }
        .aipe-header-title h2 { margin: 0; font-size: 1.15rem; font-weight: 600; color: white; }
        .aipe-icon { font-size: 1.3rem; }
        .aipe-close {
            background: rgba(255,255,255,0.2); border: none; border-radius: 6px;
            color: white; width: 30px; height: 30px; cursor: pointer; font-size: 1rem;
            display: flex; align-items: center; justify-content: center; transition: background 0.15s;
        }
        .aipe-close:hover { background: rgba(255,255,255,0.35); }
        .aipe-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 18px; }
        .aipe-intro {
            margin: 0; padding: 10px 14px; background: #f0f9ff;
            border: 1px solid #bae6fd; border-radius: 8px;
            font-size: 0.85rem; color: #0369a1; line-height: 1.5;
        }
        .aipe-section { display: flex; flex-direction: column; gap: 8px; }
        .aipe-label { font-weight: 600; font-size: 0.875rem; color: #374151; }
        .aipe-optional {
            font-weight: 400; font-size: 0.75rem; color: #9ca3af;
            margin-left: 6px; font-style: italic;
        }
        .aipe-api-row { display: flex; gap: 8px; }
        .aipe-input {
            flex: 1; padding: 8px 12px; border: 1px solid #d1d5db;
            border-radius: 6px; font-size: 0.875rem; font-family: monospace;
        }
        .aipe-input:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.15); }
        .aipe-icon-btn {
            padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px;
            background: #f9fafb; cursor: pointer; font-size: 1rem;
        }
        .aipe-icon-btn:hover { background: #f3f4f6; }
        .aipe-select {
            width: 100%; padding: 8px 12px; border: 1px solid #d1d5db;
            border-radius: 6px; font-size: 0.875rem; background: #fff; cursor: pointer;
        }
        .aipe-select:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.15); }
        .aipe-hint { font-size: 0.78rem; color: #9ca3af; margin: 0; }
        .aipe-textarea {
            width: 100%; min-height: 110px; padding: 10px 12px;
            border: 1px solid #d1d5db; border-radius: 8px;
            font-size: 0.875rem; line-height: 1.5; resize: vertical; font-family: inherit;
            box-sizing: border-box;
        }
        .aipe-textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.15); }
        .aipe-drop-zone {
            border: 2px dashed #d1d5db; border-radius: 10px; padding: 22px 20px;
            display: flex; flex-direction: column; align-items: center; gap: 6px;
            cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .aipe-drop-zone:hover, .aipe-drop-zone.drag-over {
            border-color: #0d9488; background: rgba(13,148,136,0.04);
        }
        .aipe-drop-icon { font-size: 1.8rem; }
        .aipe-drop-zone p { margin: 0; color: #6b7280; font-size: 0.85rem; text-align: center; }
        .aipe-file-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 0; }
        .aipe-file-chip {
            display: flex; align-items: center; gap: 6px; padding: 4px 10px;
            background: #f0fdf4; border: 1px solid #86efac; border-radius: 20px;
            font-size: 0.8rem; color: #166534; max-width: 220px;
        }
        .aipe-chip-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aipe-chip-remove {
            background: none; border: none; cursor: pointer; color: #6b7280;
            font-size: 0.75rem; line-height: 1; padding: 0; flex-shrink: 0;
        }
        .aipe-chip-remove:hover { color: #b91c1c; }
        .aipe-actions { display: flex; gap: 10px; }
        .aipe-btn-primary {
            flex: 1; padding: 10px 20px;
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: white; border: none; border-radius: 8px;
            font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
        }
        .aipe-btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .aipe-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .aipe-btn-secondary {
            padding: 10px 20px; background: #f3f4f6; color: #374151;
            border: 1px solid #d1d5db; border-radius: 8px;
            font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: background 0.15s;
        }
        .aipe-btn-secondary:hover { background: #e5e7eb; }
        .aipe-loading {
            display: flex; align-items: center; gap: 12px; padding: 14px 16px;
            background: #f0fdfa; border-radius: 8px; color: #0d9488; font-weight: 500;
        }
        .aipe-spinner {
            width: 20px; height: 20px; border: 3px solid #99f6e4;
            border-top-color: #0d9488; border-radius: 50%;
            animation: aipe-spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes aipe-spin { to { transform: rotate(360deg); } }
        .aipe-error {
            padding: 12px 16px; background: #fef2f2;
            border: 1px solid #fca5a5; border-radius: 8px;
            color: #b91c1c; font-size: 0.875rem;
        }
        .aipe-results-header h3 { margin: 0 0 4px; font-size: 1rem; color: #065f46; }
        .aipe-result-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;
        }
        .aipe-result-wide { grid-column: 1 / -1; }
        .aipe-result-item {
            background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
            padding: 10px 14px; display: flex; flex-direction: column; gap: 2px;
        }
        .aipe-result-label {
            font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.05em; color: #9ca3af;
        }
        .aipe-result-value { font-size: 0.9rem; color: #111827; font-weight: 500; }
        .aipe-section-title { margin: 4px 0 10px; font-size: 0.9rem; font-weight: 600; color: #374151; }
        .aipe-table-wrap { overflow-x: auto; }
        .aipe-resource-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .aipe-resource-table th {
            background: #f3f4f6; padding: 8px 10px; text-align: left;
            font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;
        }
        .aipe-resource-table td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
        .aipe-resource-table tr:last-child td { border-bottom: none; }
        .aipe-rationale { color: #9ca3af; font-style: italic; }
        .aipe-days { color: #9ca3af; font-size: 0.78rem; }
        .aipe-notes {
            margin-top: 12px; padding: 10px 14px; background: #fffbeb;
            border: 1px solid #fcd34d; border-radius: 8px;
            font-size: 0.82rem; color: #92400e;
        }
        .aipe-badge {
            display: inline-block; margin-top: 10px; padding: 3px 10px;
            border-radius: 12px; font-size: 0.75rem; font-weight: 600;
        }
        .aipe-badge-high   { background: #d1fae5; color: #065f46; }
        .aipe-badge-medium { background: #fef3c7; color: #92400e; }
        .aipe-badge-low    { background: #fee2e2; color: #b91c1c; }
        .aipe-results-actions { display: flex; gap: 10px; margin-top: 16px; }
        @media (max-width: 540px) {
            .aipe-result-grid { grid-template-columns: 1fr; }
            .aipe-result-wide { grid-column: auto; }
            .aipe-modal { max-height: 96vh; }
        }
        `;
        document.head.appendChild(style);
    }
}

window.aiProjectExtractor = new AIProjectExtractor();
