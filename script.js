document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');
    
    const engineTrigger = document.getElementById('engine-trigger');
    const engineMenu = document.getElementById('engine-menu');
    const engineNameDisplay = document.getElementById('current-engine-name');
    const menuItems = engineMenu.querySelectorAll('li');

    let currentSearchUrl = "https://www.bing.com/search?q=";
    let activeIndex = -1; 

    // --- 1. 直达功能配置 ---
    const directShortcuts = {
        'gh': 'https://github.com/search?q=',
        'yt': 'https://www.youtube.com/results?search_query=',
        'bili': 'https://search.bilibili.com/all?keyword=',
        'wiki': 'https://zh.wikipedia.org/wiki/',
        'z': 'https://www.zhihu.com/search?q=',
        'db': 'https://www.douban.com/search?q='
    };

    // --- 2. 初始化引擎状态 ---
    const savedEngineName = localStorage.getItem('selectedEngineName');
    const savedEngineUrl = localStorage.getItem('selectedEngineUrl');

    if (savedEngineName && savedEngineUrl) {
        updateEngineState(savedEngineName, savedEngineUrl);
    }

    function updateEngineState(name, url) {
        engineNameDisplay.textContent = name;
        currentSearchUrl = url;
        input.placeholder = `使用 ${name} 搜索...`;
        
        menuItems.forEach(item => {
            if (item.getAttribute('data-name') === name) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        localStorage.setItem('selectedEngineName', name);
        localStorage.setItem('selectedEngineUrl', url);
    }

    // --- 3. 菜单开关逻辑 ---
    function toggleMenu(show) {
        if (show) {
            engineMenu.classList.add('active');
            engineTrigger.classList.add('is-open'); 
            engineTrigger.setAttribute('aria-expanded', 'true');
            activeIndex = -1; 
        } else {
            engineMenu.classList.remove('active');
            engineTrigger.classList.remove('is-open');
            engineTrigger.setAttribute('aria-expanded', 'false');
            menuItems.forEach(item => item.classList.remove('key-active'));
        }
    }

    engineTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(!engineMenu.classList.contains('active')); 
    });

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const name = item.getAttribute('data-name');
            const url = item.getAttribute('data-url');
            updateEngineState(name, url);
            toggleMenu(false); 
            input.focus();
        });
    });

    // --- 4. 键盘与全局点击 ---
    document.addEventListener('keydown', (e) => {
        if (engineMenu.classList.contains('active')) {
            const items = Array.from(menuItems);
            if (e.key === 'ArrowDown') {
                e.preventDefault(); 
                activeIndex = (activeIndex + 1) % items.length;
                updateMenuHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                updateMenuHighlight(items);
            } else if (e.key === 'Enter' && activeIndex > -1) {
                e.preventDefault();
                items[activeIndex].click();
            } else if (e.key === 'Escape') {
                toggleMenu(false);
            }
        }
        
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            input.focus();
        }
    });

    function updateMenuHighlight(items) {
        items.forEach((item, index) => {
            item.classList.toggle('key-active', index === activeIndex);
        });
    }

    document.addEventListener('click', () => toggleMenu(false));

    // --- 5. 输入框监听 (清除按钮 & 直达模式视觉反馈) ---
    const checkDirectMode = (val) => {
        const query = val.trim();
        const parts = query.split(' ');
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        
        if (urlPattern.test(query) || (parts.length > 1 && directShortcuts[parts[0].toLowerCase()])) {
            form.classList.add('direct-mode');
        } else {
            form.classList.remove('direct-mode');
        }
    };

    const toggleClearBtn = () => {
        const hasText = input.value.length > 0;
        clearBtn.classList.toggle('visible', hasText);
        checkDirectMode(input.value);
    };
    
    const clearInput = () => {
        input.value = ''; 
        toggleClearBtn(); 
        input.focus();    
    };

    input.addEventListener('input', toggleClearBtn);
    clearBtn.addEventListener('click', clearInput);
    
    toggleClearBtn();

    // --- 6. 提交搜索逻辑 (核心直达逻辑) ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const query = input.value.trim();
        if (!query) return;

        const searchBtn = form.querySelector('.search-button');
        searchBtn.classList.add('is-loading');

        let targetUrl = "";

        // A. 判定是否为纯网址直达
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (urlPattern.test(query)) {
            targetUrl = query.startsWith('http') ? query : `https://${query}`;
        } 
        else {
            // B. 判定是否为快捷键直达 (例如 "gh react")
            const parts = query.split(' ');
            const prefix = parts[0].toLowerCase();
            if (directShortcuts[prefix] && parts.length > 1) {
                const keyword = query.substring(parts[0].length).trim();
                targetUrl = directShortcuts[prefix] + encodeURIComponent(keyword);
            } 
            else {
                // C. 普通搜索
                targetUrl = currentSearchUrl + encodeURIComponent(query);
            }
        }

        // 执行跳转
        setTimeout(() => {
            window.open(targetUrl, '_blank');
            searchBtn.classList.remove('is-loading');
        }, 300); 
    });
});