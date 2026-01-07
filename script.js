// Improved script.js
// - Uses deferred execution (script tag uses defer).
// - Avoids innerHTML for user-provided content to prevent XSS.
// - Event delegation for menu clicks.
// - Notification has ARIA live region and safer insertion.
// - window.open executed synchronously to avoid popup blockers.
// - Debounce with cancel support.
// - Better focus management for menu and a11y improvements.

(() => {
  // DOM cache
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-btn');
  const engineTrigger = document.getElementById('engine-trigger');
  const engineMenu = document.getElementById('engine-menu');
  const engineNameDisplay = document.getElementById('current-engine-name');
  const directBadge = document.getElementById('direct-badge');

  // state
  const state = {
    currentSearchUrl: "https://www.bing.com/search?q=",
    activeIndex: -1,
    searchEngines: [
      { name: 'Bing', url: 'https://www.bing.com/search?q=', domain: 'bing.com' },
      { name: 'Google', url: 'https://www.google.com/search?q=', domain: 'google.com' },
      { name: 'Baidu', url: 'https://www.baidu.com/s?wd=', domain: 'baidu.com' }
    ],
    customEngines: []
  };

  const directShortcuts = {
    'gh': { name: 'GitHub', url: 'https://github.com/search?q=' },
    'yt': { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
    'bili': { name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=' },
    'wiki': { name: '维基百科', url: 'https://zh.wikipedia.org/wiki/' },
    'z': { name: '知乎', url: 'https://www.zhihu.com/search?q=' },
    'db': { name: '豆瓣', url: 'https://www.douban.com/search?q=' }
  };

  // Debounce with cancel
  const debounce = (func, wait = 100) => {
    let timeout;
    const debounced = function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
  };

  // Utility: safe text node creation (prevents XSS)
  const setSafeContent = (el, text) => {
    el.textContent = text;
  };

  // Custom engine commands (partial)
  const customEngineCommands = {
    add: (params) => {
      if (params.length < 2) {
        showNotification('用法: /add <名称> <URL模板> [域名]');
        return;
      }

      const name = params[0];
      const urlTemplate = params[1];
      const domain = params[2] || extractDomain(urlTemplate);

      if (!urlTemplate.includes('{query}')) {
        showNotification('URL模板必须包含 {query} 占位符');
        return;
      }

      const testUrl = urlTemplate.replace(/{query}/g, 'test');
      try {
        // add protocol if absent for validation
        const validated = testUrl.startsWith('http') ? testUrl : `https://${testUrl}`;
        new URL(validated);
      } catch (e) {
        showNotification('URL格式不正确');
        return;
      }

      const existingIndex = state.customEngines.findIndex(engine => engine.name === name);
      if (existingIndex !== -1) {
        state.customEngines[existingIndex] = { name, url: urlTemplate, domain };
        showNotification(`搜索引擎 "${name}" 已更新`);
      } else {
        // limit length for safety
        if (JSON.stringify(state.customEngines).length > 20000) {
          showNotification('自定义引擎已达上限');
          return;
        }
        state.customEngines.push({ name, url: urlTemplate, domain });
        showNotification(`已添加搜索引擎 "${name}"`);
      }

      saveEnginesToStorage();
      updateEngineMenu();
    },
    remove: (params) => {
      if (params.length < 1) {
        showNotification('用法: /remove <名称>');
        return;
      }
      const name = params[0];
      const idx = state.customEngines.findIndex(e => e.name === name);
      if (idx === -1) {
        showNotification(`未找到名为 "${name}" 的自定义引擎`);
        return;
      }
      state.customEngines.splice(idx, 1);
      saveEnginesToStorage();
      updateEngineMenu();
      showNotification(`已删除搜索引擎 "${name}"`);
    },
    list: () => {
      if (state.customEngines.length === 0) {
        showNotification('暂无自定义引擎');
        return;
      }
      const lines = state.customEngines.map(e => `${e.name} — ${e.domain}`).join('\n');
      showNotification(lines);
    }
  };

  const extractDomain = (url) => {
    try {
      const tmp = url.startsWith('http') ? url : `https://${url}`;
      return new URL(tmp).hostname.replace('www.', '');
    } catch (e) {
      return '自定义';
    }
  };

  const saveEnginesToStorage = () => {
    try {
      localStorage.setItem('customSearchEngines', JSON.stringify(state.customEngines));
    } catch (e) {
      // storage might be full or blocked
      console.warn('保存自定义引擎失败', e);
    }
  };

  const loadEnginesFromStorage = () => {
    try {
      const stored = localStorage.getItem('customSearchEngines');
      if (stored) {
        state.customEngines = JSON.parse(stored);
      }
    } catch (e) {
      console.error('加载自定义引擎失败:', e);
      state.customEngines = [];
    }
  };

  // Build menu using DocumentFragment and safe DOM methods (avoid innerHTML for user input)
  const updateEngineMenu = () => {
    // keep a reference to existing selected name
    const selectedName = engineNameDisplay.textContent;
    const fragment = document.createDocumentFragment();

    const createLiForEngine = (engine, idx, isCustom = false) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('data-name', engine.name);
      li.setAttribute('data-url', engine.url);
      li.id = isCustom ? `engine-option-custom-${idx}` : `engine-option-${idx}`;

      if (selectedName === engine.name) {
        li.classList.add('selected');
        li.setAttribute('aria-selected', 'true');
      } else {
        li.setAttribute('aria-selected', 'false');
      }

      const engineInfo = document.createElement('div');
      engineInfo.className = 'engine-info';

      const spanMain = document.createElement('span');
      spanMain.className = 'engine-main';
      setSafeContent(spanMain, engine.name);

      const spanDesc = document.createElement('span');
      spanDesc.className = 'engine-desc';
      setSafeContent(spanDesc, engine.domain);

      engineInfo.appendChild(spanMain);
      engineInfo.appendChild(spanDesc);
      li.appendChild(engineInfo);

      return li;
    };

    // Add preset engines
    state.searchEngines.forEach((engine, index) => {
      fragment.appendChild(createLiForEngine(engine, index, false));
    });

    // Add custom separator + engines
    if (state.customEngines.length > 0) {
      const separator = document.createElement('li');
      separator.className = 'menu-separator';
      separator.style.padding = '10px 16px';
      separator.style.fontSize = '12px';
      separator.style.opacity = '0.7';
      separator.style.textAlign = 'center';
      separator.style.borderTop = '1px solid var(--border-color)';
      separator.style.marginTop = '8px';
      separator.style.cursor = 'default';

      const sepDiv = document.createElement('div');
      sepDiv.className = 'separator-line';
      setSafeContent(sepDiv, '自定义引擎');
      separator.appendChild(sepDiv);
      fragment.appendChild(separator);

      state.customEngines.forEach((engine, index) => {
        fragment.appendChild(createLiForEngine(engine, index, true));
      });
    }

    // replace children in one operation
    engineMenu.innerHTML = ''; // acceptable single reflow
    engineMenu.appendChild(fragment);
  };

  // Initialize engine state
  const initializeEngine = () => {
    loadEnginesFromStorage();
    updateEngineMenu();

    const savedEngineName = localStorage.getItem('selectedEngineName');
    const savedEngineUrl = localStorage.getItem('selectedEngineUrl');

    if (savedEngineName && savedEngineUrl) {
      const allEngines = [...state.searchEngines, ...state.customEngines];
      const foundEngine = allEngines.find(engine =>
        engine.name === savedEngineName && engine.url === savedEngineUrl);

      if (foundEngine) {
        updateEngineState(savedEngineName, savedEngineUrl);
        return;
      }
    }
    // default
    const defaultEngine = state.searchEngines[0];
    updateEngineState(defaultEngine.name, defaultEngine.url);
  };

  function updateEngineState(name, url) {
    engineNameDisplay.textContent = name;
    state.currentSearchUrl = url;
    input.placeholder = `使用 ${name} 搜索...`;

    // update aria-selected states (query live)
    const menuItems = engineMenu.querySelectorAll('li[data-name]');
    menuItems.forEach(item => {
      const isSelected = item.getAttribute('data-name') === name;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-selected', isSelected.toString());
    });

    localStorage.setItem('selectedEngineName', name);
    localStorage.setItem('selectedEngineUrl', url);
  }

  // Notification: safer rendering and ARIA
  const showNotification = (content) => {
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      // accessibility
      notification.setAttribute('role', 'status');
      notification.setAttribute('aria-live', 'polite');
      notification.setAttribute('aria-atomic', 'true');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }

    // If the content looks like developer-controlled HTML (starts with '<' and is predefined),
    // allow innerHTML; otherwise use textContent to avoid XSS.
    if (typeof content === 'string' && content.trim().startsWith('<')) {
      // Only allowed for trusted templates
      notification.innerHTML = content;
    } else {
      notification.textContent = content;
    }

    notification.classList.add('show');

    if (notification._hideTimer) {
      clearTimeout(notification._hideTimer);
    }
    notification._hideTimer = setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  };

  // Menu open/close with focus management
  function toggleMenu(show) {
    if (form.classList.contains('direct-mode') && show) return;

    if (show) {
      engineMenu.classList.add('active');
      engineTrigger.classList.add('is-open');
      engineTrigger.setAttribute('aria-expanded', 'true');
      engineMenu.setAttribute('tabindex', '0');
      engineMenu.focus();
      state.activeIndex = -1;
      engineMenu.setAttribute('aria-activedescendant', '');
      // For screen reader announce
      engineMenu.setAttribute('aria-hidden', 'false');
    } else {
      engineMenu.classList.remove('active');
      engineTrigger.classList.remove('is-open');
      engineTrigger.setAttribute('aria-expanded', 'false');
      engineTrigger.focus();
      state.activeIndex = -1;
      engineMenu.setAttribute('aria-hidden', 'true');
      // clear key highlights
      const menuItems = engineMenu.querySelectorAll('li');
      menuItems.forEach(item => item.classList.remove('key-active'));
    }
  }

  // Event delegation for menu clicks
  engineMenu.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-name]');
    if (!li) return;
    const name = li.getAttribute('data-name');
    const url = li.getAttribute('data-url');
    updateEngineState(name, url);
    toggleMenu(false);
    input.focus();
  });

  // pointerover for accessible hover-like highlight
  engineMenu.addEventListener('pointerover', (e) => {
    const li = e.target.closest('li[data-name]');
    if (!li) return;
    const items = Array.from(engineMenu.querySelectorAll('li[data-name]'));
    state.activeIndex = items.indexOf(li);
    updateMenuHighlight(items);
  });

  // keyboard handling (scoped)
  document.addEventListener('keydown', (e) => {
    // Quick focus on input with "/"
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      return;
    }

    // Only handle menu navigation if menu is active
    if (!engineMenu.classList.contains('active')) return;

    const items = Array.from(engineMenu.querySelectorAll('li[data-name]'));
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.activeIndex = (state.activeIndex + 1 + items.length) % items.length;
      updateMenuHighlight(items);
      const id = items[state.activeIndex].id;
      engineMenu.setAttribute('aria-activedescendant', id);
      items[state.activeIndex].focus?.();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.activeIndex = (state.activeIndex - 1 + items.length) % items.length;
      updateMenuHighlight(items);
      const id = items[state.activeIndex].id;
      engineMenu.setAttribute('aria-activedescendant', id);
      items[state.activeIndex].focus?.();
    } else if (e.key === 'Enter' && state.activeIndex > -1) {
      e.preventDefault();
      const target = items[state.activeIndex];
      if (target) {
        target.click();
      }
    } else if (e.key === 'Escape') {
      toggleMenu(false);
      input.focus();
    } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      // letter quick select (when menu active)
      const key = e.key.toLowerCase();
      const matching = items.find(item => item.getAttribute('data-name').toLowerCase().startsWith(key));
      if (matching) {
        matching.click();
      }
    }
  });

  function updateMenuHighlight(items) {
    items.forEach((item, index) => {
      item.classList.toggle('key-active', index === state.activeIndex);
    });
  }

  // Close menu when clicking outside both trigger and menu
  document.addEventListener('click', (e) => {
    if (!engineTrigger.contains(e.target) && !engineMenu.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Input debounce: toggle clear btn & direct mode
  const checkDirectMode = (val) => {
    const query = val.trim();

    if (query.startsWith('/')) {
      form.classList.remove('direct-mode');
      directBadge.setAttribute('aria-hidden', 'true');
      return;
    }

    const parts = query.split(/\s+/);
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-]*)*\/?$/i;

    let isDirect = false;
    let label = "跳转";

    if (urlPattern.test(query)) {
      isDirect = true;
      label = "跳转";
    } else if (parts.length > 1) {
      const prefix = parts[0].toLowerCase();
      if (directShortcuts[prefix]) {
        isDirect = true;
        label = directShortcuts[prefix].name;
      }
    }

    if (isDirect) {
      directBadge.textContent = label;
      directBadge.setAttribute('aria-hidden', 'false');
      form.classList.add('direct-mode');
    } else {
      form.classList.remove('direct-mode');
      directBadge.setAttribute('aria-hidden', 'true');
    }
  };

  const debouncedToggleClearBtn = debounce(() => {
    const hasText = input.value.length > 0;
    clearBtn.classList.toggle('visible', hasText);
    checkDirectMode(input.value);
  }, 100);

  const clearInput = () => {
    input.value = '';
    debouncedToggleClearBtn();
    input.focus();
    // Announce for screen readers
    showNotification('已清除输入');
  };

  input.addEventListener('input', debouncedToggleClearBtn);
  clearBtn.addEventListener('click', clearInput);

  // Initialize
  initializeEngine();
  debouncedToggleClearBtn();

  // Form submit logic: synchronous window.open to reduce popup blocking
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    if (query.startsWith('/')) {
      handleCustomEngineCommand(query);
      input.value = '';
      debouncedToggleClearBtn();
      return;
    }

    const searchBtn = form.querySelector('.search-button');
    searchBtn.classList.add('is-loading');

    let targetUrl = "";
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.\-]*)*\/?$/i;
    if (urlPattern.test(query)) {
      targetUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      const parts = query.split(/\s+/);
      const prefix = parts[0].toLowerCase();
      if (directShortcuts[prefix] && parts.length > 1) {
        const keyword = query.substring(parts[0].length).trim();
        targetUrl = directShortcuts[prefix].url + encodeURIComponent(keyword);
      } else {
        const currentEngine = [...state.searchEngines, ...state.customEngines]
          .find(engine => engine.name === engineNameDisplay.textContent);

        if (currentEngine && currentEngine.url.includes('{query}')) {
          targetUrl = currentEngine.url.replace(/{query}/g, encodeURIComponent(query));
        } else {
          targetUrl = state.currentSearchUrl + encodeURIComponent(query);
        }
      }
    }

    // open synchronously to avoid popup blocking (open blank then set location)
    try {
      const newWin = window.open('', '_blank');
      if (newWin) {
        newWin.location = targetUrl;
      } else {
        // fallback: change current tab
        window.location.href = targetUrl;
      }
    } catch (error) {
      console.error('无法打开搜索结果:', error);
      showNotification('无法打开搜索结果，请检查URL格式');
    } finally {
      searchBtn.classList.remove('is-loading');
    }
  });

  // Command handling (help replaced safely)
  const handleCustomEngineCommand = (command) => {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].substring(1).toLowerCase();
    const params = parts.slice(1);

    if (customEngineCommands[cmd]) {
      customEngineCommands[cmd](params);
      return;
    } else if (cmd === 'help') {
      const helpContent = `
        <div style="line-height: 1.6;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">自定义搜索引擎帮助</h3>
            <div style="margin-bottom: 12px;">
                <div style="margin-bottom: 8px; display: flex;">
                    <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; margin-right: 10px; flex-shrink: 0;">/add</code>
                    <span>添加搜索引擎: <code>/add &lt;名称&gt; &lt;URL模板&gt; [域名]</code></span>
                </div>
                <div style="margin-bottom: 8px; display: flex;">
                    <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; margin-right: 10px; flex-shrink: 0;">/remove</code>
                    <span>删除搜索引擎: <code>/remove &lt;名称&gt;</code></span>
                </div>
                <div style="margin-bottom: 8px; display: flex;">
                    <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; margin-right: 10px; flex-shrink: 0;">/list</code>
                    <span>列出所有自定义引擎</span>
                </div>
                <div style="margin-bottom: 8px; display: flex;">
                    <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; margin-right: 10px; flex-shrink: 0;">/help</code>
                    <span>显示此帮助信息</span>
                </div>
            </div>
            <div style="font-size: 13px; opacity: 0.8;">
                <p style="margin: 8px 0;">提示：URL模板中请使用 <code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px;">{query}</code> 作为查询占位符</p>
                <p style="margin: 8px 0;">例如: <code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; word-break: break-all;">/add GitHub https://github.com/search?q={query}</code></p>
            </div>
        </div>
      `;
      // helpContent is developer-controlled HTML -> allowed innerHTML
      showNotification(helpContent);
    } else {
      showNotification(`未知命令: /${cmd}\n输入 /help 查看可用命令`);
    }
  };

  // prefers-color-scheme listener (modern API)
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof darkModeMediaQuery.addEventListener === 'function') {
    darkModeMediaQuery.addEventListener('change', (e) => {
      console.log('深色模式状态已更改:', e.matches);
    });
  } else if (typeof darkModeMediaQuery.addListener === 'function') {
    // fallback (old browsers)
    darkModeMediaQuery.addListener((e) => {
      console.log('深色模式状态已更改 (fallback):', e.matches);
    });
  }

  // expose for debugging (optional)
  window._searchPageState = state;
})();
