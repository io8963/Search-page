document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');
    
    const engineTrigger = document.getElementById('engine-trigger');
    const engineMenu = document.getElementById('engine-menu');
    const engineNameDisplay = document.getElementById('current-engine-name');
    const directBadge = document.getElementById('direct-badge');
    const menuItems = engineMenu.querySelectorAll('li');

    // --- 优化1: 使用状态对象管理引擎状态 ---
    const state = {
        currentSearchUrl: "https://www.bing.com/search?q=",
        activeIndex: -1,
        searchEngines: [
            { name: 'Bing', url: 'https://www.bing.com/search?q=', domain: 'bing.com' },
            { name: 'Google', url: 'https://www.google.com/search?q=', domain: 'google.com' },
            { name: 'Baidu', url: 'https://www.baidu.com/s?wd=', domain: 'baidu.com' }
        ]
    };

    // --- 优化2: 直达功能配置 ---
    const directShortcuts = {
        'gh': { name: 'GitHub', url: 'https://github.com/search?q=' },
        'yt': { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
        'bili': { name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=' },
        'wiki': { name: '维基百科', url: 'https://zh.wikipedia.org/wiki/' },
        'z': { name: '知乎', url: 'https://www.zhihu.com/search?q=' },
        'db': { name: '豆瓣', url: 'https://www.douban.com/search?q=' }
    };

    // --- 优化3: 防抖函数 ---
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // --- 优化4: 初始化引擎状态 ---
    const initializeEngine = () => {
        const savedEngineName = localStorage.getItem('selectedEngineName');
        const savedEngineUrl = localStorage.getItem('selectedEngineUrl');

        if (savedEngineName && savedEngineUrl) {
            updateEngineState(savedEngineName, savedEngineUrl);
        } else {
            // 设置默认引擎
            const defaultEngine = state.searchEngines[0];
            updateEngineState(defaultEngine.name, defaultEngine.url);
        }
    };

    // --- 优化5: 更新引擎状态 ---
    function updateEngineState(name, url) {
        engineNameDisplay.textContent = name;
        state.currentSearchUrl = url;
        input.placeholder = `使用 ${name} 搜索...`;
        
        // 更新菜单项选择状态
        menuItems.forEach(item => {
            const isSelected = item.getAttribute('data-name') === name;
            item.classList.toggle('selected', isSelected);
            item.setAttribute('aria-selected', isSelected.toString());
        });

        localStorage.setItem('selectedEngineName', name);
        localStorage.setItem('selectedEngineUrl', url);
    }

    // --- 优化6: 菜单开关逻辑 ---
    function toggleMenu(show) {
        // 如果处于直达模式，点击左侧不触发菜单
        if (form.classList.contains('direct-mode') && show) return;

        if (show) {
            engineMenu.classList.add('active');
            engineTrigger.classList.add('is-open'); 
            engineTrigger.setAttribute('aria-expanded', 'true');
            state.activeIndex = -1; 
        } else {
            engineMenu.classList.remove('active');
            engineTrigger.classList.remove('is-open');
            engineTrigger.setAttribute('aria-expanded', 'false');
            
            // 移除键盘导航高亮
            menuItems.forEach(item => item.classList.remove('key-active'));
        }
    }

    engineTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(!engineMenu.classList.contains('active')); 
    });

    // --- 优化7: 菜单项事件处理 ---
    menuItems.forEach((item, index) => {
        // 添加 ARIA 属性
        item.setAttribute('role', 'option');
        item.id = `engine-option-${index}`;
        
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const name = item.getAttribute('data-name');
            const url = item.getAttribute('data-url');
            updateEngineState(name, url);
            toggleMenu(false); 
            input.focus();
        });
        
        // 鼠标悬停时更新键盘导航索引
        item.addEventListener('mouseenter', () => {
            state.activeIndex = index;
            updateMenuHighlight(Array.from(menuItems));
        });
        
        // 优化触摸设备体验
        item.addEventListener('touchstart', (e) => {
            state.activeIndex = index;
            updateMenuHighlight(Array.from(menuItems));
        });
    });

    // --- 优化8: 键盘导航 ---
    document.addEventListener('keydown', (e) => {
        // 字母快速选择
        if (engineMenu.classList.contains('active') && e.key.length === 1 && e.key.match(/[a-z]/i)) {
            const key = e.key.toLowerCase();
            const matchingItem = Array.from(menuItems).find(item => 
                item.getAttribute('data-name').toLowerCase().startsWith(key)
            );
            if (matchingItem) {
                matchingItem.click();
                return;
            }
        }
        
        if (engineMenu.classList.contains('active')) {
            const items = Array.from(menuItems);
            if (e.key === 'ArrowDown') {
                e.preventDefault(); 
                state.activeIndex = (state.activeIndex + 1) % items.length;
                updateMenuHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.activeIndex = (state.activeIndex - 1 + items.length) % items.length;
                updateMenuHighlight(items);
            } else if (e.key === 'Enter' && state.activeIndex > -1) {
                e.preventDefault();
                items[state.activeIndex].click();
            } else if (e.key === 'Escape') {
                toggleMenu(false);
                input.focus();
            }
        }
        
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            input.focus();
        }
    });

    function updateMenuHighlight(items) {
        items.forEach((item, index) => {
            item.classList.toggle('key-active', index === state.activeIndex);
        });
    }

    // 点击菜单外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!engineTrigger.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // --- 优化9: 输入框防抖处理 ---
    const debouncedToggleClearBtn = debounce(() => {
        const hasText = input.value.length > 0;
        clearBtn.classList.toggle('visible', hasText);
        checkDirectMode(input.value);
    }, 100);

    // --- 优化10: 直达模式检测 ---
    const checkDirectMode = (val) => {
        const query = val.trim();
        const parts = query.split(/\s+/);
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        
        let isDirect = false;
        let label = "跳转";

        // 识别 URL
        if (urlPattern.test(query)) {
            isDirect = true;
            label = "跳转";
        } 
        // 识别快捷键 (需空格触发，如 "gh ")
        else if (parts.length > 1) {
            const prefix = parts[0].toLowerCase();
            if (directShortcuts[prefix]) {
                isDirect = true;
                label = directShortcuts[prefix].name;
            }
        }

        if (isDirect) {
            directBadge.textContent = label;
            form.classList.add('direct-mode');
        } else {
            form.classList.remove('direct-mode');
        }
    };

    const clearInput = () => {
        input.value = ''; 
        debouncedToggleClearBtn(); 
        input.focus();    
    };

    input.addEventListener('input', debouncedToggleClearBtn);
    clearBtn.addEventListener('click', clearInput);
    
    // 初始化
    initializeEngine();
    debouncedToggleClearBtn();

    // --- 优化11: 提交搜索逻辑 ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const query = input.value.trim();
        if (!query) return;

        const searchBtn = form.querySelector('.search-button');
        searchBtn.classList.add('is-loading');

        let targetUrl = "";

        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (urlPattern.test(query)) {
            targetUrl = query.startsWith('http') ? query : `https://${query}`;
        } 
        else {
            const parts = query.split(/\s+/);
            const prefix = parts[0].toLowerCase();
            if (directShortcuts[prefix] && parts.length > 1) {
                const keyword = query.substring(parts[0].length).trim();
                targetUrl = directShortcuts[prefix].url + encodeURIComponent(keyword);
            } 
            else {
                targetUrl = state.currentSearchUrl + encodeURIComponent(query);
            }
        }

        // 模拟网络延迟
        setTimeout(() => {
            try {
                window.open(targetUrl, '_blank');
            } catch (error) {
                console.error('无法打开搜索结果:', error);
                // 可以添加用户友好的错误提示
            } finally {
                searchBtn.classList.remove('is-loading');
            }
        }, 300); 
    });
    
    // --- 深色模式切换支持 ---
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 监听深色模式切换
    darkModeMediaQuery.addListener((e) => {
        // 可以在这里添加深色模式切换时的特殊处理
        console.log('深色模式状态已更改:', e.matches);
    });
});