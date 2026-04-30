/**
 * Accessibility Widget - Production Bundle
 * WCAG 2.1 AA Compliant Accessibility Widget
 * 
 * Usage:
 * <script src="accessibility-widget.js" defer></script>
 * 
 * Or with options:
 * <script>
 *   window.A11yWidgetOptions = { position: 'bottom-left', language: 'en' };
 * </script>
 * <script src="accessibility-widget.js" defer></script>
 */

(function() {
  'use strict';

  // ============================================
  // STORAGE MODULE
  // ============================================
  
  class AccessibilityStorage {
    constructor() {
      this.prefix = 'a11y_widget_';
    }

    save(key, value) {
      try {
        const fullKey = this.prefix + key;
        localStorage.setItem(fullKey, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('Failed to save to LocalStorage:', e);
        return false;
      }
    }

    load(key, defaultValue = null) {
      try {
        const fullKey = this.prefix + key;
        const item = localStorage.getItem(fullKey);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn('Failed to load from LocalStorage:', e);
        return defaultValue;
      }
    }

    remove(key) {
      try {
        const fullKey = this.prefix + key;
        localStorage.removeItem(fullKey);
      } catch (e) {
        console.warn('Failed to remove from LocalStorage:', e);
      }
    }

    clear() {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
        return true;
      } catch (e) {
        console.warn('Failed to clear LocalStorage:', e);
        return false;
      }
    }

    getAll() {
      const settings = {};
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            const settingKey = key.replace(this.prefix, '');
            settings[settingKey] = this.load(settingKey);
          }
        });
      } catch (e) {
        console.warn('Failed to get all settings:', e);
      }
      return settings;
    }
  }

  // ============================================
  // DOM UTILITIES
  // ============================================
  
  class DOMUtils {
    static createElement(tag, attrs = {}, content = '') {
      const el = document.createElement(tag);
      Object.keys(attrs).forEach(key => {
        if (key === 'className') {
          el.className = attrs[key];
        } else if (key === 'innerHTML') {
          el.innerHTML = attrs[key];
        } else if (key.startsWith('data-')) {
          el.setAttribute(key, attrs[key]);
        } else if (key === 'style' && typeof attrs[key] === 'string') {
          el.setAttribute('style', attrs[key]);
        } else {
          el[key] = attrs[key];
        }
      });
      if (typeof content === 'string') {
        el.textContent = content;
      } else if (content instanceof HTMLElement) {
        el.appendChild(content);
      }
      return el;
    }

    static on(el, event, handler, namespace = 'a11y') {
      el.addEventListener(event, handler);
      if (!el._a11yListeners) {
        el._a11yListeners = [];
      }
      el._a11yListeners.push({ event, handler });
    }

    static off(el) {
      if (el._a11yListeners) {
        el._a11yListeners.forEach(({ event, handler }) => {
          el.removeEventListener(event, handler);
        });
        el._a11yListeners = [];
      }
    }

    static injectCSS(css, id) {
      let styleEl = document.getElementById(id);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = id;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = css;
    }

    static addBodyClass(className) {
      document.body.classList.add(className);
    }

    static removeBodyClass(className) {
      document.body.classList.remove(className);
    }

    static toggleBodyClass(className, force) {
      document.body.classList.toggle(className, force);
    }

    static setCSSVariable(name, value) {
      document.documentElement.style.setProperty(name, value);
    }

    static getCSSVariable(name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
  }

  // ============================================
  // CSS STYLES (Embedded)
  // ============================================
  
  const widgetCSS = `
    #a11y-widget-container * { box-sizing: border-box; margin: 0; padding: 0; }
    #a11y-widget-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; font-size: 14px; line-height: 1.5; color: #333; z-index: 999999; position: fixed; }
    #a11y-widget-container.a11y-hidden { display: none !important; }
    .a11y-floating-button { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: #0066CC; color: white; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: all 0.3s ease; z-index: 999998; display: flex; align-items: center; justify-content: center; }
    .a11y-floating-button:hover { background: #0052A3; transform: scale(1.1); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
    .a11y-floating-button:focus { outline: 3px solid #0066CC; outline-offset: 2px; }
    .a11y-floating-button.a11y-active { background: #0052A3; }
    .a11y-panel { position: fixed; top: 0; right: -500px; width: 500px; height: 100vh; background: #F5F5F5; box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1); transition: right 0.3s ease; overflow-y: auto; z-index: 999997; }
    .a11y-panel-open { right: 0 !important; }
    .a11y-panel-header { background: #0066CC; color: white; padding: 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .a11y-close-btn { background: none; border: none; color: white; font-size: 28px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s; }
    .a11y-close-btn:hover { background: rgba(255, 255, 255, 0.2); }
    .a11y-close-btn:focus { outline: 2px solid white; outline-offset: 2px; }
    .a11y-lang-selector { margin-left: auto; margin-right: 10px; }
    .a11y-lang-btn { background: rgba(255, 255, 255, 0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 6px; }
    .a11y-lang-btn:hover { background: rgba(255, 255, 255, 0.3); }
    .a11y-panel-title { font-size: 20px; font-weight: 600; margin: 0; flex: 1; text-align: center; }
    .a11y-panel-content { padding: 20px; }
    .a11y-action-buttons { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .a11y-action-btn { flex: 1; min-width: 120px; padding: 12px 16px; background: white; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 14px; color: #0066CC; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .a11y-action-btn:hover { background: #f0f0f0; border-color: #0066CC; }
    .a11y-action-btn:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-search-container { margin-bottom: 20px; position: relative; }
    .a11y-search-input { width: 100%; padding: 12px 16px; padding-left: 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: white; }
    .a11y-search-input:focus { outline: 2px solid #0066CC; outline-offset: -2px; border-color: #0066CC; }
    .a11y-search-container::before { content: '🔍'; position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; z-index: 1; }
    .a11y-section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
    .a11y-section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333; }
    .a11y-profiles-list { display: flex; flex-direction: column; gap: 12px; }
    .a11y-profile-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.2s; cursor: pointer; }
    .a11y-profile-item:hover { border-color: #0066CC; background: #f8f9ff; }
    .a11y-profile-icon { font-size: 24px; width: 40px; text-align: center; }
    .a11y-profile-info { flex: 1; }
    .a11y-profile-name { font-weight: 500; margin-bottom: 4px; color: #333; }
    .a11y-profile-desc { font-size: 12px; color: #666; }
    .a11y-toggle { position: relative; width: 50px; height: 26px; background: #e0e0e0; border: none; border-radius: 13px; cursor: pointer; transition: background 0.3s; padding: 0; }
    .a11y-toggle:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-toggle-slider { position: absolute; top: 2px; left: 2px; width: 22px; height: 22px; background: white; border-radius: 50%; transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }
    .a11y-toggle-active { background: #0066CC; }
    .a11y-toggle-active .a11y-toggle-slider { transform: translateX(24px); }
    .a11y-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .a11y-feature-card { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 100px; }
    .a11y-feature-card:hover { border-color: #0066CC; background: #f0f7ff; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
    .a11y-feature-card:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-feature-card.a11y-feature-active { background: #e6f2ff; border-color: #0066CC; }
    .a11y-feature-icon { font-size: 24px; margin-bottom: 4px; }
    .a11y-feature-name { font-size: 12px; font-weight: 500; color: #333; }
    .a11y-feature-controls { display: flex; align-items: center; gap: 8px; margin-top: 8px; width: 100%; }
    .a11y-control-btn { width: 28px; height: 28px; border-radius: 50%; background: #0066CC; color: white; border: none; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
    .a11y-control-btn:hover { background: #0052A3; transform: scale(1.1); }
    .a11y-control-btn:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-control-value { flex: 1; text-align: center; font-size: 12px; color: #0066CC; font-weight: 500; padding: 0 8px; }
    .a11y-dropdown { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: white; font-size: 12px; margin-top: 8px; cursor: pointer; }
    .a11y-dropdown:focus { outline: 2px solid #0066CC; outline-offset: -2px; border-color: #0066CC; }
    .a11y-color-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .a11y-color-presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .a11y-color-preset-card { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .a11y-color-preset-card:hover { border-color: #0066CC; background: #f0f7ff; }
    .a11y-color-preset-card.a11y-preset-active { background: #e6f2ff; border: 2px solid #0066CC; }
    .a11y-color-preset-icon { font-size: 24px; margin-bottom: 4px; }
    .a11y-color-preset-name { font-size: 12px; font-weight: 500; color: #333; }
    .a11y-color-selectors { display: flex; flex-direction: column; gap: 12px; }
    .a11y-color-selector-card { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .a11y-color-selector-title { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 8px; }
    .a11y-color-palette { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .a11y-color-btn { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #ddd; cursor: pointer; transition: all 0.2s; padding: 0; }
    .a11y-color-btn:hover { transform: scale(1.1); border-color: #0066CC; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); }
    .a11y-color-btn:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-cancel-btn { padding: 8px 16px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px; color: #666; transition: all 0.2s; align-self: center; }
    .a11y-cancel-btn:hover { background: #f0f0f0; border-color: #0066CC; color: #0066CC; }
    .a11y-cancel-btn:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000000; animation: a11yFadeIn 0.3s; }
    @keyframes a11yFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .a11y-modal-content { background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; animation: a11ySlideUp 0.3s; }
    @keyframes a11ySlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .a11y-modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 28px; cursor: pointer; color: #666; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s; }
    .a11y-modal-close:hover { background: #f0f0f0; }
    .a11y-modal-close:focus { outline: 2px solid #0066CC; outline-offset: 2px; }
    .a11y-modal-body { margin-top: 20px; line-height: 1.6; color: #666; }
    .a11y-modal-body p { margin-bottom: 16px; }
    body.a11y-content-scaling { zoom: var(--a11y-content-scale, 1); transform: scale(var(--a11y-content-scale, 1)); transform-origin: top left; }
    body.a11y-font-size-adjusted * { font-size: calc(1em * var(--a11y-font-size-multiplier, 1)) !important; }
    body.a11y-line-height-adjusted * { line-height: var(--a11y-line-height, 1.5) !important; }
    body.a11y-readable-font * { font-family: Arial, sans-serif !important; font-weight: 400 !important; }
    body.a11y-highlight-titles h1, body.a11y-highlight-titles h2, body.a11y-highlight-titles h3, body.a11y-highlight-titles h4, body.a11y-highlight-titles h5, body.a11y-highlight-titles h6 { background: yellow !important; padding: 2px 4px !important; }
    body.a11y-highlight-links a { background: yellow !important; padding: 2px 4px !important; text-decoration: underline !important; }
    body.a11y-align-center * { text-align: center !important; }
    body.a11y-align-left * { text-align: left !important; }
    body.a11y-hide-images img, body.a11y-hide-images [style*="background-image"] { display: none !important; }
    body.a11y-mute-sounds audio, body.a11y-mute-sounds video { display: none !important; }
    body.a11y-stop-animations *, body.a11y-stop-animations *::before, body.a11y-stop-animations *::after { animation: none !important; transition: none !important; }
    body.a11y-read-mode { max-width: 800px !important; margin: 0 auto !important; }
    body.a11y-read-mode * { font-size: 18px !important; line-height: 1.8 !important; }
    body.a11y-highlight-hover *:hover { outline: 3px solid #0066CC !important; outline-offset: 2px !important; }
    body.a11y-highlight-focus *:focus { outline: 3px solid #0066CC !important; outline-offset: 2px !important; box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.3) !important; }
    body.a11y-big-black-cursor * { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="black"/></svg>'), auto !important; }
    body.a11y-big-white-cursor * { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="white" stroke="black" stroke-width="2"/></svg>'), auto !important; }
    .a11y-reading-guide { position: fixed; left: 0; width: 100%; height: 2px; background: #0066CC; z-index: 999996; pointer-events: none; display: none; }
    .a11y-reading-mask { position: fixed; width: 200px; height: 100px; background: rgba(0, 0, 0, 0.3); border: 2px solid #0066CC; border-radius: 8px; z-index: 999995; pointer-events: none; transform: translate(-50%, -50%); }
    .a11y-text-magnifier { position: fixed; background: white; border: 2px solid #0066CC; border-radius: 8px; padding: 8px 12px; font-size: 16px; max-width: 200px; z-index: 999994; pointer-events: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); display: none; }
    body.a11y-dark-contrast { filter: brightness(0.8) contrast(1.2); }
    body.a11y-light-contrast { filter: brightness(1.2) contrast(0.9); }
    body.a11y-high-contrast { filter: contrast(1.5) brightness(1.1); }
    body.a11y-monochrome { filter: grayscale(100%); }
    body.a11y-high-saturation { filter: saturate(1.5); }
    body.a11y-low-saturation { filter: saturate(0.5); }
    @media (max-width: 768px) { .a11y-panel { width: 100%; right: -100%; } .a11y-grid { grid-template-columns: repeat(2, 1fr); } .a11y-color-grid { grid-template-columns: 1fr; } }
    .a11y-panel::-webkit-scrollbar { width: 8px; }
    .a11y-panel::-webkit-scrollbar-track { background: #f1f1f1; }
    .a11y-panel::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
    .a11y-panel::-webkit-scrollbar-thumb:hover { background: #555; }
  `;

  // ============================================
  // MAIN WIDGET CLASS
  // ============================================
  
  class AccessibilityWidget {
    constructor(options = {}) {
      this.options = {
        position: options.position || 'bottom-right',
        language: options.language || 'en',
        defaultProfile: options.defaultProfile || null,
        ...options
      };

      this.storage = new AccessibilityStorage();
      this.state = {
        isOpen: false,
        isHidden: false,
        activeProfile: null,
        settings: {}
      };

      this.init();
    }

    init() {
      this.loadSettings();
      this.createUI();
      this.applySettings();
      this.setupEventListeners();
      this.injectStyles();
    }

    loadSettings() {
      this.state.settings = this.storage.getAll();
      this.state.isHidden = this.storage.load('isHidden', false);
      this.state.activeProfile = this.storage.load('activeProfile', null);
    }

    createUI() {
      this.container = DOMUtils.createElement('div', {
        id: 'a11y-widget-container',
        className: 'a11y-widget-container',
        'aria-label': 'Accessibility Adjustments',
        role: 'application'
      });

      this.createFloatingButton();
      this.createMainPanel();
      document.body.appendChild(this.container);

      if (this.state.isHidden) {
        this.container.classList.add('a11y-hidden');
      }
    }

    createFloatingButton() {
      this.floatingButton = DOMUtils.createElement('button', {
        id: 'a11y-floating-button',
        className: 'a11y-floating-button',
        'aria-label': 'Open Accessibility Adjustments',
        'aria-expanded': 'false',
        type: 'button'
      }, '♿');
      this.container.appendChild(this.floatingButton);
    }

    createMainPanel() {
      this.panel = DOMUtils.createElement('div', {
        id: 'a11y-panel',
        className: 'a11y-panel',
        'aria-hidden': 'true',
        role: 'dialog',
        'aria-labelledby': 'a11y-panel-title'
      });

      this.createPanelHeader();
      this.createPanelContent();
      this.container.appendChild(this.panel);
    }

    createPanelHeader() {
      const header = DOMUtils.createElement('div', { className: 'a11y-panel-header' });
      const closeBtn = DOMUtils.createElement('button', {
        className: 'a11y-close-btn',
        'aria-label': 'Close Accessibility Adjustments',
        type: 'button'
      }, '×');
      const langSelector = DOMUtils.createElement('div', { className: 'a11y-lang-selector' });
      const langBtn = DOMUtils.createElement('button', {
        className: 'a11y-lang-btn',
        'aria-label': 'Select Language',
        type: 'button'
      });
      langBtn.innerHTML = '🇺🇸 ENGLISH (US) ▼';
      langSelector.appendChild(langBtn);
      const title = DOMUtils.createElement('h2', {
        id: 'a11y-panel-title',
        className: 'a11y-panel-title'
      }, 'Accessibility Adjustments');
      header.appendChild(closeBtn);
      header.appendChild(langSelector);
      header.appendChild(title);
      this.panel.appendChild(header);
    }

    createPanelContent() {
      const content = DOMUtils.createElement('div', { className: 'a11y-panel-content' });
      this.createActionButtons(content);
      this.createSearchBar(content);
      this.createProfilesSection(content);
      this.createOrientationSection(content);
      this.createColorSection(content);
      this.createContentSection(content);
      this.panel.appendChild(content);
    }

    createActionButtons(container) {
      const actions = DOMUtils.createElement('div', { className: 'a11y-action-buttons' });
      const resetBtn = DOMUtils.createElement('button', {
        className: 'a11y-action-btn',
        'aria-label': 'Reset all settings',
        type: 'button'
      });
      resetBtn.innerHTML = '🔄 Reset Settings';
      const statementBtn = DOMUtils.createElement('button', {
        className: 'a11y-action-btn',
        'aria-label': 'View accessibility statement',
        type: 'button'
      });
      statementBtn.innerHTML = '📜 Statement';
      const hideBtn = DOMUtils.createElement('button', {
        className: 'a11y-action-btn',
        'aria-label': 'Hide accessibility interface',
        type: 'button'
      });
      hideBtn.innerHTML = '👁️ Hide Interface';
      actions.appendChild(resetBtn);
      actions.appendChild(statementBtn);
      actions.appendChild(hideBtn);
      container.appendChild(actions);
    }

    createSearchBar(container) {
      const searchContainer = DOMUtils.createElement('div', { className: 'a11y-search-container' });
      const searchInput = DOMUtils.createElement('input', {
        type: 'text',
        className: 'a11y-search-input',
        placeholder: 'Unclear content? Search in dictionary...',
        'aria-label': 'Search dictionary',
        role: 'searchbox'
      });
      searchContainer.appendChild(searchInput);
      container.appendChild(searchContainer);
    }

    createProfilesSection(container) {
      const section = DOMUtils.createElement('div', { className: 'a11y-section a11y-profiles-section' });
      const title = DOMUtils.createElement('h3', { className: 'a11y-section-title' }, 'Choose the right accessibility profile for you');
      const profilesList = DOMUtils.createElement('div', { className: 'a11y-profiles-list' });
      const profiles = [
        { id: 'seizure-safe', name: 'Seizure Safe Profile', desc: 'Clear flashes & reduces color', icon: '⚡' },
        { id: 'vision-impaired', name: 'Vision Impaired Profile', desc: 'Enhances website\'s visuals', icon: '👁️' },
        { id: 'adhd-friendly', name: 'ADHD Friendly Profile', desc: 'More focus & fewer distractions', icon: '📋' },
        { id: 'cognitive-disability', name: 'Cognitive Disability Profile', desc: 'Assists with reading & focusing', icon: '🎯' },
        { id: 'keyboard-navigation', name: 'Keyboard Navigation (Motor)', desc: 'Use website with the keyboard', icon: '⌨️' }
      ];
      profiles.forEach(profile => {
        const profileItem = this.createProfileItem(profile);
        profilesList.appendChild(profileItem);
      });
      section.appendChild(title);
      section.appendChild(profilesList);
      container.appendChild(section);
    }

    createProfileItem(profile) {
      const item = DOMUtils.createElement('div', {
        className: 'a11y-profile-item',
        'data-profile-id': profile.id
      });
      const icon = DOMUtils.createElement('span', { className: 'a11y-profile-icon' }, profile.icon);
      const info = DOMUtils.createElement('div', { className: 'a11y-profile-info' });
      const name = DOMUtils.createElement('div', { className: 'a11y-profile-name' }, profile.name);
      const desc = DOMUtils.createElement('div', { className: 'a11y-profile-desc' }, profile.desc);
      info.appendChild(name);
      info.appendChild(desc);
      const toggle = DOMUtils.createElement('button', {
        className: 'a11y-toggle',
        'aria-label': `Toggle ${profile.name}`,
        'aria-pressed': 'false',
        type: 'button',
        role: 'switch'
      });
      toggle.innerHTML = '<span class="a11y-toggle-slider"></span>';
      item.appendChild(icon);
      item.appendChild(info);
      item.appendChild(toggle);
      return item;
    }

    createOrientationSection(container) {
      const section = DOMUtils.createElement('div', { className: 'a11y-section a11y-orientation-section' });
      const title = DOMUtils.createElement('h3', { className: 'a11y-section-title' }, 'Orientation Adjustments');
      const grid = DOMUtils.createElement('div', { className: 'a11y-grid' });
      const orientationFeatures = [
        { id: 'mute-sounds', name: 'Mute Sounds', icon: '🔇' },
        { id: 'hide-images', name: 'Hide Images', icon: '🖼️' },
        { id: 'read-mode', name: 'Read Mode', icon: '📖' },
        { id: 'reading-guide', name: 'Reading Guide', icon: '📏' },
        { id: 'reading-mask', name: 'Reading Mask', icon: '🎭' },
        { id: 'stop-animations', name: 'Stop Animations', icon: '⚡' },
        { id: 'highlight-hover', name: 'Highlight Hover', icon: '🔍' },
        { id: 'highlight-focus', name: 'Highlight Focus', icon: '🎯' },
        { id: 'big-black-cursor', name: 'Big Black Cursor', icon: '👆' },
        { id: 'big-white-cursor', name: 'Big White Cursor', icon: '👆' },
        { id: 'useful-links', name: 'Useful Links', icon: '🔗', isDropdown: true }
      ];
      orientationFeatures.forEach(feature => {
        const card = this.createFeatureCard(feature);
        grid.appendChild(card);
      });
      section.appendChild(title);
      section.appendChild(grid);
      container.appendChild(section);
    }

    createColorSection(container) {
      const section = DOMUtils.createElement('div', { className: 'a11y-section a11y-color-section' });
      const title = DOMUtils.createElement('h3', { className: 'a11y-section-title' }, 'Color Adjustments');
      const colorGrid = DOMUtils.createElement('div', { className: 'a11y-color-grid' });
      const presetsContainer = DOMUtils.createElement('div', { className: 'a11y-color-presets' });
      const presets = [
        { id: 'dark-contrast', name: 'Dark Contrast', icon: '🌙' },
        { id: 'light-contrast', name: 'Light Contrast', icon: '☀️' },
        { id: 'high-contrast', name: 'High Contrast', icon: '⚫' },
        { id: 'monochrome', name: 'Monochrome', icon: '💧' },
        { id: 'high-saturation', name: 'High Saturation', icon: '💧' },
        { id: 'low-saturation', name: 'Low Saturation', icon: '💧' }
      ];
      presets.forEach(preset => {
        const card = this.createColorPresetCard(preset);
        presetsContainer.appendChild(card);
      });
      const selectorsContainer = DOMUtils.createElement('div', { className: 'a11y-color-selectors' });
      const colorSelectors = [
        { id: 'text-color', name: 'Adjust Text Colors' },
        { id: 'title-color', name: 'Adjust Title Colors' },
        { id: 'background-color', name: 'Adjust Background Colors' }
      ];
      colorSelectors.forEach(selector => {
        const card = this.createColorSelectorCard(selector);
        selectorsContainer.appendChild(card);
      });
      colorGrid.appendChild(presetsContainer);
      colorGrid.appendChild(selectorsContainer);
      section.appendChild(title);
      section.appendChild(colorGrid);
      container.appendChild(section);
    }

    createContentSection(container) {
      const section = DOMUtils.createElement('div', { className: 'a11y-section a11y-content-section' });
      const title = DOMUtils.createElement('h3', { className: 'a11y-section-title' }, 'Content Adjustments');
      const grid = DOMUtils.createElement('div', { className: 'a11y-grid' });
      const contentFeatures = [
        { id: 'content-scaling', name: 'Content Scaling', icon: '🔍', hasControls: true },
        { id: 'readable-font', name: 'Readable Font', icon: 'A' },
        { id: 'highlight-titles', name: 'Highlight Titles', icon: 'T' },
        { id: 'highlight-links', name: 'Highlight Links', icon: '🔗' },
        { id: 'text-magnifier', name: 'Text Magnifier', icon: '🔎' },
        { id: 'adjust-font-size', name: 'Adjust Font Sizing', icon: 'A', hasControls: true },
        { id: 'align-center', name: 'Align Center', icon: '≡' },
        { id: 'adjust-line-height', name: 'Adjust Line Height', icon: '↕', hasControls: true },
        { id: 'align-left', name: 'Align Left', icon: '≡' }
      ];
      contentFeatures.forEach(feature => {
        const card = this.createContentFeatureCard(feature);
        grid.appendChild(card);
      });
      section.appendChild(title);
      section.appendChild(grid);
      container.appendChild(section);
    }

    createFeatureCard(feature) {
      const card = DOMUtils.createElement('div', {
        className: 'a11y-feature-card',
        'data-feature-id': feature.id
      });
      if (feature.isDropdown) {
        const icon = DOMUtils.createElement('div', { className: 'a11y-feature-icon' }, feature.icon);
        const name = DOMUtils.createElement('div', { className: 'a11y-feature-name' }, feature.name);
        const dropdown = DOMUtils.createElement('select', {
          className: 'a11y-dropdown',
          'aria-label': feature.name
        });
        dropdown.innerHTML = '<option>Select an option</option>';
        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(dropdown);
      } else {
        const icon = DOMUtils.createElement('div', { className: 'a11y-feature-icon' }, feature.icon);
        const name = DOMUtils.createElement('div', { className: 'a11y-feature-name' }, feature.name);
        card.appendChild(icon);
        card.appendChild(name);
      }
      return card;
    }

    createColorPresetCard(preset) {
      const card = DOMUtils.createElement('div', {
        className: 'a11y-color-preset-card',
        'data-preset-id': preset.id
      });
      const icon = DOMUtils.createElement('div', { className: 'a11y-color-preset-icon' }, preset.icon);
      const name = DOMUtils.createElement('div', { className: 'a11y-color-preset-name' }, preset.name);
      card.appendChild(icon);
      card.appendChild(name);
      return card;
    }

    createColorSelectorCard(selector) {
      const card = DOMUtils.createElement('div', {
        className: 'a11y-color-selector-card',
        'data-selector-id': selector.id
      });
      const title = DOMUtils.createElement('div', { className: 'a11y-color-selector-title' }, selector.name);
      const palette = DOMUtils.createElement('div', { className: 'a11y-color-palette' });
      const colors = ['#0066CC', '#6B46C1', '#DC2626', '#EA580C', '#0891B2', '#16A34A', '#FFFFFF', '#000000'];
      colors.forEach(color => {
        const colorBtn = DOMUtils.createElement('button', {
          className: 'a11y-color-btn',
          'aria-label': `Select ${color}`,
          type: 'button',
          style: `background-color: ${color}`
        });
        palette.appendChild(colorBtn);
      });
      const cancelBtn = DOMUtils.createElement('button', {
        className: 'a11y-cancel-btn',
        type: 'button'
      }, 'Cancel');
      card.appendChild(title);
      card.appendChild(palette);
      card.appendChild(cancelBtn);
      return card;
    }

    createContentFeatureCard(feature) {
      const card = DOMUtils.createElement('div', {
        className: 'a11y-feature-card',
        'data-feature-id': feature.id
      });
      const icon = DOMUtils.createElement('div', { className: 'a11y-feature-icon' }, feature.icon);
      const name = DOMUtils.createElement('div', { className: 'a11y-feature-name' }, feature.name);
      card.appendChild(icon);
      card.appendChild(name);
      if (feature.hasControls) {
        const controls = DOMUtils.createElement('div', { className: 'a11y-feature-controls' });
        const decreaseBtn = DOMUtils.createElement('button', {
          className: 'a11y-control-btn a11y-decrease-btn',
          'aria-label': 'Decrease',
          type: 'button'
        }, '▼');
        const value = DOMUtils.createElement('div', { className: 'a11y-control-value' }, 'Default');
        const increaseBtn = DOMUtils.createElement('button', {
          className: 'a11y-control-btn a11y-increase-btn',
          'aria-label': 'Increase',
          type: 'button'
        }, '▲');
        controls.appendChild(decreaseBtn);
        controls.appendChild(value);
        controls.appendChild(increaseBtn);
        card.appendChild(controls);
      }
      return card;
    }

    setupEventListeners() {
      DOMUtils.on(this.floatingButton, 'click', () => this.togglePanel());
      const closeBtn = this.panel.querySelector('.a11y-close-btn');
      if (closeBtn) {
        DOMUtils.on(closeBtn, 'click', () => this.closePanel());
      }
      const resetBtn = this.panel.querySelector('.a11y-action-buttons .a11y-action-btn:nth-child(1)');
      if (resetBtn) {
        DOMUtils.on(resetBtn, 'click', () => this.resetSettings());
      }
      const statementBtn = this.panel.querySelector('.a11y-action-buttons .a11y-action-btn:nth-child(2)');
      if (statementBtn) {
        DOMUtils.on(statementBtn, 'click', () => this.showStatement());
      }
      const hideBtn = this.panel.querySelector('.a11y-action-buttons .a11y-action-btn:nth-child(3)');
      if (hideBtn) {
        DOMUtils.on(hideBtn, 'click', () => this.hideInterface());
      }
      const profileItems = this.panel.querySelectorAll('.a11y-profile-item');
      profileItems.forEach(item => {
        const toggle = item.querySelector('.a11y-toggle');
        if (toggle) {
          DOMUtils.on(toggle, 'click', () => {
            const profileId = item.getAttribute('data-profile-id');
            this.toggleProfile(profileId);
          });
        }
      });
      const featureCards = this.panel.querySelectorAll('.a11y-feature-card');
      featureCards.forEach(card => {
        DOMUtils.on(card, 'click', () => {
          const featureId = card.getAttribute('data-feature-id');
          if (featureId !== 'useful-links') {
            this.toggleFeature(featureId);
          }
        });
      });
      const colorPresets = this.panel.querySelectorAll('.a11y-color-preset-card');
      colorPresets.forEach(card => {
        DOMUtils.on(card, 'click', () => {
          const presetId = card.getAttribute('data-preset-id');
          this.applyColorPreset(presetId);
        });
      });
      const colorButtons = this.panel.querySelectorAll('.a11y-color-btn');
      colorButtons.forEach(btn => {
        DOMUtils.on(btn, 'click', (e) => {
          e.stopPropagation();
          const style = e.target.getAttribute('style') || '';
          const colorMatch = style.match(/background-color:\s*([^;]+)/);
          const color = colorMatch ? colorMatch[1].trim() : e.target.style.backgroundColor;
          const selectorCard = btn.closest('.a11y-color-selector-card');
          if (selectorCard) {
            const selectorId = selectorCard.getAttribute('data-selector-id');
            this.applyColor(selectorId, color);
          }
        });
      });
      const cancelButtons = this.panel.querySelectorAll('.a11y-cancel-btn');
      cancelButtons.forEach(btn => {
        DOMUtils.on(btn, 'click', () => {
          const selectorCard = btn.closest('.a11y-color-selector-card');
          const selectorId = selectorCard.getAttribute('data-selector-id');
          this.resetColor(selectorId);
        });
      });
      const decreaseButtons = this.panel.querySelectorAll('.a11y-decrease-btn');
      decreaseButtons.forEach(btn => {
        DOMUtils.on(btn, 'click', (e) => {
          e.stopPropagation();
          const card = e.target.closest('.a11y-feature-card');
          const featureId = card.getAttribute('data-feature-id');
          this.adjustControl(featureId, -1);
        });
      });
      const increaseButtons = this.panel.querySelectorAll('.a11y-increase-btn');
      increaseButtons.forEach(btn => {
        DOMUtils.on(btn, 'click', (e) => {
          e.stopPropagation();
          const card = e.target.closest('.a11y-feature-card');
          const featureId = card.getAttribute('data-feature-id');
          this.adjustControl(featureId, 1);
        });
      });
      DOMUtils.on(document, 'keydown', (e) => {
        if (e.key === 'Escape' && this.state.isOpen) {
          this.closePanel();
        }
      });
      DOMUtils.on(this.panel, 'click', (e) => {
        if (e.target === this.panel) {
          this.closePanel();
        }
      });
    }

    togglePanel() {
      if (this.state.isOpen) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      this.state.isOpen = true;
      this.panel.classList.add('a11y-panel-open');
      this.panel.setAttribute('aria-hidden', 'false');
      this.floatingButton.setAttribute('aria-expanded', 'true');
      this.floatingButton.classList.add('a11y-active');
    }

    closePanel() {
      this.state.isOpen = false;
      this.panel.classList.remove('a11y-panel-open');
      this.panel.setAttribute('aria-hidden', 'true');
      this.floatingButton.setAttribute('aria-expanded', 'false');
      this.floatingButton.classList.remove('a11y-active');
    }

    toggleProfile(profileId) {
      const isActive = this.state.activeProfile === profileId;
      if (isActive) {
        this.deactivateProfile(profileId);
        this.state.activeProfile = null;
      } else {
        if (this.state.activeProfile) {
          this.deactivateProfile(this.state.activeProfile);
        }
        this.activateProfile(profileId);
        this.state.activeProfile = profileId;
      }
      this.storage.save('activeProfile', this.state.activeProfile);
      this.updateProfileUI();
    }

    activateProfile(profileId) {
      const profileHandlers = {
        'seizure-safe': () => this.applySeizureSafeProfile(),
        'vision-impaired': () => this.applyVisionImpairedProfile(),
        'adhd-friendly': () => this.applyADHDFriendlyProfile(),
        'cognitive-disability': () => this.applyCognitiveDisabilityProfile(),
        'keyboard-navigation': () => this.applyKeyboardNavigationProfile()
      };
      if (profileHandlers[profileId]) {
        profileHandlers[profileId]();
      }
    }

    deactivateProfile(profileId) {
      document.body.classList.remove(`a11y-profile-${profileId}`);
    }

    updateProfileUI() {
      const profileItems = this.panel.querySelectorAll('.a11y-profile-item');
      profileItems.forEach(item => {
        const profileId = item.getAttribute('data-profile-id');
        const toggle = item.querySelector('.a11y-toggle');
        if (profileId === this.state.activeProfile) {
          toggle.classList.add('a11y-toggle-active');
          toggle.setAttribute('aria-pressed', 'true');
        } else {
          toggle.classList.remove('a11y-toggle-active');
          toggle.setAttribute('aria-pressed', 'false');
        }
      });
    }

    applySeizureSafeProfile() {
      DOMUtils.addBodyClass('a11y-profile-seizure-safe');
      this.toggleFeature('stop-animations', true);
      this.toggleFeature('mute-sounds', true);
      this.applyColorPreset('low-saturation');
    }

    applyVisionImpairedProfile() {
      DOMUtils.addBodyClass('a11y-profile-vision-impaired');
      this.applyColorPreset('high-contrast');
      this.toggleFeature('readable-font', true);
      this.adjustControl('adjust-font-size', 2);
    }

    applyADHDFriendlyProfile() {
      DOMUtils.addBodyClass('a11y-profile-adhd-friendly');
      this.toggleFeature('reading-guide', true);
      this.toggleFeature('highlight-focus', true);
      this.toggleFeature('stop-animations', true);
    }

    applyCognitiveDisabilityProfile() {
      DOMUtils.addBodyClass('a11y-profile-cognitive-disability');
      this.toggleFeature('read-mode', true);
      this.adjustControl('adjust-line-height', 2);
      this.toggleFeature('readable-font', true);
    }

    applyKeyboardNavigationProfile() {
      DOMUtils.addBodyClass('a11y-profile-keyboard-navigation');
      this.toggleFeature('highlight-focus', true);
      this.toggleFeature('big-white-cursor', true);
    }

    toggleFeature(featureId, force = null) {
      const currentState = this.state.settings[featureId] || false;
      const newState = force !== null ? force : !currentState;
      this.state.settings[featureId] = newState;
      this.storage.save(featureId, newState);

      const featureHandlers = {
        'mute-sounds': () => this.handleMuteSounds(newState),
        'hide-images': () => this.handleHideImages(newState),
        'read-mode': () => this.handleReadMode(newState),
        'reading-guide': () => this.handleReadingGuide(newState),
        'reading-mask': () => this.handleReadingMask(newState),
        'stop-animations': () => this.handleStopAnimations(newState),
        'highlight-hover': () => this.handleHighlightHover(newState),
        'highlight-focus': () => this.handleHighlightFocus(newState),
        'big-black-cursor': () => this.handleBigCursor(newState, 'black'),
        'big-white-cursor': () => this.handleBigCursor(newState, 'white'),
        'readable-font': () => this.handleReadableFont(newState),
        'highlight-titles': () => this.handleHighlightTitles(newState),
        'highlight-links': () => this.handleHighlightLinks(newState),
        'text-magnifier': () => this.handleTextMagnifier(newState),
        'align-center': () => this.handleAlignCenter(newState),
        'align-left': () => this.handleAlignLeft(newState)
      };

      if (featureHandlers[featureId]) {
        featureHandlers[featureId]();
      }
      this.updateFeatureUI(featureId, newState);
    }

    updateFeatureUI(featureId, state) {
      const card = this.panel.querySelector(`[data-feature-id="${featureId}"]`);
      if (card) {
        if (state) {
          card.classList.add('a11y-feature-active');
        } else {
          card.classList.remove('a11y-feature-active');
        }
      }
    }

    adjustControl(featureId, direction) {
      const currentValue = this.state.settings[featureId] || 0;
      const newValue = Math.max(-3, Math.min(3, currentValue + direction));
      this.state.settings[featureId] = newValue;
      this.storage.save(featureId, newValue);

      const controlHandlers = {
        'content-scaling': () => this.handleContentScaling(newValue),
        'adjust-font-size': () => this.handleFontSize(newValue),
        'adjust-line-height': () => this.handleLineHeight(newValue)
      };

      if (controlHandlers[featureId]) {
        controlHandlers[featureId]();
      }
      this.updateControlUI(featureId, newValue);
    }

    updateControlUI(featureId, value) {
      const card = this.panel.querySelector(`[data-feature-id="${featureId}"]`);
      if (card) {
        const valueEl = card.querySelector('.a11y-control-value');
        if (valueEl) {
          if (value === 0) {
            valueEl.textContent = 'Default';
          } else if (value > 0) {
            valueEl.textContent = `+${value}`;
          } else {
            valueEl.textContent = value.toString();
          }
        }
      }
    }

    applyColorPreset(presetId) {
      document.body.classList.remove(
        'a11y-dark-contrast', 'a11y-light-contrast', 'a11y-high-contrast',
        'a11y-monochrome', 'a11y-high-saturation', 'a11y-low-saturation'
      );
      document.body.classList.add(`a11y-${presetId}`);
      const presetCards = this.panel.querySelectorAll('.a11y-color-preset-card');
      presetCards.forEach(card => {
        if (card.getAttribute('data-preset-id') === presetId) {
          card.classList.add('a11y-preset-active');
        } else {
          card.classList.remove('a11y-preset-active');
        }
      });
      this.storage.save('colorPreset', presetId);
    }

    applyColor(selectorId, color) {
      const colorMap = {
        'text-color': '--a11y-text-color',
        'title-color': '--a11y-title-color',
        'background-color': '--a11y-bg-color'
      };
      const cssVar = colorMap[selectorId];
      if (cssVar) {
        DOMUtils.setCSSVariable(cssVar, color);
        this.storage.save(selectorId, color);
      }
    }

    resetColor(selectorId) {
      const colorMap = {
        'text-color': '--a11y-text-color',
        'title-color': '--a11y-title-color',
        'background-color': '--a11y-bg-color'
      };
      const cssVar = colorMap[selectorId];
      if (cssVar) {
        DOMUtils.setCSSVariable(cssVar, '');
        this.storage.remove(selectorId);
      }
    }

    handleMuteSounds(enabled) {
      if (enabled) {
        DOMUtils.addBodyClass('a11y-mute-sounds');
        document.querySelectorAll('audio, video').forEach(media => {
          media.pause();
          media.setAttribute('data-a11y-muted', 'true');
        });
      } else {
        DOMUtils.removeBodyClass('a11y-mute-sounds');
      }
    }

    handleHideImages(enabled) { DOMUtils.toggleBodyClass('a11y-hide-images', enabled); }
    handleReadMode(enabled) { DOMUtils.toggleBodyClass('a11y-read-mode', enabled); }
    handleReadingGuide(enabled) { enabled ? this.createReadingGuide() : this.removeReadingGuide(); }
    handleReadingMask(enabled) { enabled ? this.createReadingMask() : this.removeReadingMask(); }
    handleStopAnimations(enabled) { DOMUtils.toggleBodyClass('a11y-stop-animations', enabled); }
    handleHighlightHover(enabled) { DOMUtils.toggleBodyClass('a11y-highlight-hover', enabled); }
    handleHighlightFocus(enabled) { DOMUtils.toggleBodyClass('a11y-highlight-focus', enabled); }
    handleBigCursor(enabled, color) {
      if (enabled) {
        DOMUtils.removeBodyClass('a11y-big-black-cursor');
        DOMUtils.removeBodyClass('a11y-big-white-cursor');
        DOMUtils.addBodyClass(`a11y-big-${color}-cursor`);
      } else {
        DOMUtils.removeBodyClass(`a11y-big-${color}-cursor`);
      }
    }
    handleReadableFont(enabled) { DOMUtils.toggleBodyClass('a11y-readable-font', enabled); }
    handleHighlightTitles(enabled) { DOMUtils.toggleBodyClass('a11y-highlight-titles', enabled); }
    handleHighlightLinks(enabled) { DOMUtils.toggleBodyClass('a11y-highlight-links', enabled); }
    handleTextMagnifier(enabled) { enabled ? this.createTextMagnifier() : this.removeTextMagnifier(); }
    handleAlignCenter(enabled) {
      if (enabled) {
        DOMUtils.removeBodyClass('a11y-align-left');
        DOMUtils.addBodyClass('a11y-align-center');
      } else {
        DOMUtils.removeBodyClass('a11y-align-center');
      }
    }
    handleAlignLeft(enabled) {
      if (enabled) {
        DOMUtils.removeBodyClass('a11y-align-center');
        DOMUtils.addBodyClass('a11y-align-left');
      } else {
        DOMUtils.removeBodyClass('a11y-align-left');
      }
    }
    handleContentScaling(value) {
      const scale = 1 + (value * 0.1);
      DOMUtils.setCSSVariable('--a11y-content-scale', scale);
      DOMUtils.toggleBodyClass('a11y-content-scaling', value !== 0);
    }
    handleFontSize(value) {
      const fontSize = 1 + (value * 0.1);
      DOMUtils.setCSSVariable('--a11y-font-size-multiplier', fontSize);
      DOMUtils.toggleBodyClass('a11y-font-size-adjusted', value !== 0);
    }
    handleLineHeight(value) {
      const lineHeight = 1.5 + (value * 0.1);
      DOMUtils.setCSSVariable('--a11y-line-height', lineHeight);
      DOMUtils.toggleBodyClass('a11y-line-height-adjusted', value !== 0);
    }

    createReadingGuide() {
      if (document.getElementById('a11y-reading-guide')) return;
      const guide = DOMUtils.createElement('div', { id: 'a11y-reading-guide', className: 'a11y-reading-guide' });
      document.body.appendChild(guide);
      let isActive = false;
      DOMUtils.on(document, 'mousemove', (e) => {
        if (!isActive) return;
        guide.style.top = (e.clientY - 1) + 'px';
        guide.style.display = 'block';
      });
      DOMUtils.on(document, 'mousedown', () => { isActive = true; });
      DOMUtils.on(document, 'mouseup', () => { isActive = false; guide.style.display = 'none'; });
    }

    removeReadingGuide() {
      const guide = document.getElementById('a11y-reading-guide');
      if (guide) guide.remove();
    }

    createReadingMask() {
      if (document.getElementById('a11y-reading-mask')) return;
      const mask = DOMUtils.createElement('div', { id: 'a11y-reading-mask', className: 'a11y-reading-mask' });
      document.body.appendChild(mask);
      DOMUtils.on(document, 'mousemove', (e) => {
        mask.style.left = (e.clientX - 100) + 'px';
        mask.style.top = (e.clientY - 50) + 'px';
      });
    }

    removeReadingMask() {
      const mask = document.getElementById('a11y-reading-mask');
      if (mask) mask.remove();
    }

    createTextMagnifier() {
      if (document.getElementById('a11y-text-magnifier')) return;
      const magnifier = DOMUtils.createElement('div', { id: 'a11y-text-magnifier', className: 'a11y-text-magnifier' });
      document.body.appendChild(magnifier);
      DOMUtils.on(document, 'mousemove', (e) => {
        magnifier.style.left = (e.clientX + 20) + 'px';
        magnifier.style.top = (e.clientY + 20) + 'px';
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.textContent) {
          magnifier.textContent = element.textContent.substring(0, 50);
          magnifier.style.display = 'block';
        }
      });
    }

    removeTextMagnifier() {
      const magnifier = document.getElementById('a11y-text-magnifier');
      if (magnifier) magnifier.remove();
    }

    applySettings() {
      if (this.state.activeProfile) {
        this.activateProfile(this.state.activeProfile);
        this.updateProfileUI();
      }
      Object.keys(this.state.settings).forEach(key => {
        const value = this.state.settings[key];
        if (typeof value === 'boolean') {
          this.toggleFeature(key, value);
        } else if (typeof value === 'number') {
          this.state.settings[key] = value;
          const handlers = {
            'content-scaling': () => this.handleContentScaling(value),
            'adjust-font-size': () => this.handleFontSize(value),
            'adjust-line-height': () => this.handleLineHeight(value)
          };
          if (handlers[key]) handlers[key]();
          this.updateControlUI(key, value);
        }
      });
      const colorPreset = this.storage.load('colorPreset');
      if (colorPreset) {
        this.applyColorPreset(colorPreset);
      }
    }

    resetSettings() {
      if (confirm('Are you sure you want to reset all accessibility settings?')) {
        this.storage.clear();
        this.state.settings = {};
        this.state.activeProfile = null;
        const classesToRemove = Array.from(document.body.classList).filter(c => c.startsWith('a11y-'));
        classesToRemove.forEach(c => document.body.classList.remove(c));
        DOMUtils.setCSSVariable('--a11y-content-scale', '');
        DOMUtils.setCSSVariable('--a11y-font-size-multiplier', '');
        DOMUtils.setCSSVariable('--a11y-line-height', '');
        DOMUtils.setCSSVariable('--a11y-text-color', '');
        DOMUtils.setCSSVariable('--a11y-title-color', '');
        DOMUtils.setCSSVariable('--a11y-bg-color', '');
        this.removeReadingGuide();
        this.removeReadingMask();
        this.removeTextMagnifier();
        this.updateProfileUI();
        this.panel.querySelectorAll('.a11y-feature-card').forEach(card => {
          card.classList.remove('a11y-feature-active');
        });
        this.panel.querySelectorAll('.a11y-color-preset-card').forEach(card => {
          card.classList.remove('a11y-preset-active');
        });
      }
    }

    showStatement() {
      const modal = DOMUtils.createElement('div', {
        className: 'a11y-modal',
        role: 'dialog',
        'aria-labelledby': 'a11y-modal-title',
        'aria-modal': 'true'
      });
      modal.innerHTML = `
        <div class="a11y-modal-content">
          <button class="a11y-modal-close" aria-label="Close">×</button>
          <h2 id="a11y-modal-title">Accessibility Statement</h2>
          <div class="a11y-modal-body">
            <p>We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
            <p>This website aims to conform to WCAG 2.1 Level AA standards. We welcome your feedback on the accessibility of this website.</p>
            <p>If you encounter any accessibility barriers, please contact us.</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const closeBtn = modal.querySelector('.a11y-modal-close');
      DOMUtils.on(closeBtn, 'click', () => { modal.remove(); });
      DOMUtils.on(modal, 'click', (e) => { if (e.target === modal) modal.remove(); });
      DOMUtils.on(document, 'keydown', (e) => { if (e.key === 'Escape') modal.remove(); });
    }

    hideInterface() {
      this.state.isHidden = true;
      this.storage.save('isHidden', true);
      this.container.classList.add('a11y-hidden');
    }

    injectStyles() {
      DOMUtils.injectCSS(widgetCSS, 'a11y-widget-styles');
    }

    destroy() {
      DOMUtils.off(this.floatingButton);
      DOMUtils.off(this.panel);
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // ============================================
  // AUTO-INITIALIZATION
  // ============================================
  
  function initWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
      return;
    }

    if (document.body) {
      const options = window.A11yWidgetOptions || {};
      window.A11yWidget = new AccessibilityWidget(options);
    } else {
      setTimeout(initWidget, 100);
    }
  }

  // Start initialization
  initWidget();

})();

