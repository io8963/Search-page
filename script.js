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

    // --- 1. 初始化 ---
    const savedEngineName = localStorage.getItem('selectedEngineName');
    const savedEngineUrl = localStorage.getItem('selectedEngineUrl');

    if (savedEngineName && savedEngineUrl) {
        updateEngineState(savedEngineName, savedEngineUrl);
    } else {
        // 默认聚焦输入框
        input.focus();
    }

    // --- 核心：更新引擎状态 ---
    function updateEngineState(name, url) {
        engineNameDisplay.textContent = name;
        currentSearchUrl = url;
        input.placeholder = `使用 ${name} 搜索...`;
        
        // 仅处理选中状态，不处理图标
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

    // --- 菜单开关 (带箭头动画类) ---
    function toggleMenu(show) {
        if (show) {
            engineMenu.classList.add('active');
            engineTrigger.classList.add('is-open'); 
            engineTrigger.setAttribute('aria-expanded', 'true');
            activeIndex = -1; 
            menuItems.forEach(item => item.classList.remove('key-active'));
        } else {
            engineMenu.classList.remove('active');
            engineTrigger.classList.remove('is-open');
            engineTrigger.setAttribute('aria-expanded', 'false');
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

    // --- 键盘导航菜单 ---
    document.addEventListener('keydown', (e) => {
        if (engineMenu.classList.contains('active')) {
            const items = Array.from(menuItems);
            if (e.key === 'ArrowDown') {
                e.preventDefault(); 
                activeIndex++;
                if (activeIndex >= items.length) activeIndex = 0; 
                updateMenuHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex--;
                if (activeIndex < 0) activeIndex = items.length - 1; 
                updateMenuHighlight(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex > -1) items[activeIndex].click();
                else toggleMenu(false);
            } else if (e.key === 'Escape') {
                toggleMenu(false);
            }
        }
    });

    function updateMenuHighlight(items) {
        items.forEach((item, index) => {
            if (index === activeIndex) item.classList.add('key-active');
            else item.classList.remove('key-active');
        });
    }

    document.addEventListener('click', () => toggleMenu(false));

    // --- 输入框与清除逻辑 ---
    function toggleClearBtn() {
        clearBtn.style.display = input.value.trim().length > 0 ? 'flex' : 'none';
    }
    
    function clearInput() {
        input.value = ''; 
        input.focus();    
        toggleClearBtn(); 
    }

    input.addEventListener('input', toggleClearBtn);
    clearBtn.addEventListener('click', clearInput);
    
    // 允许键盘操作清除按钮
    clearBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearInput(); }
    });

    // --- 全局快捷键逻辑 ---
    document.addEventListener('keydown', (e) => {
        // "/" 键聚焦
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault(); 
            input.focus();      
        }
        // "Escape" 键清除内容或失焦
        if (e.key === 'Escape' && document.activeElement === input) {
            e.preventDefault();
            if (input.value.length > 0) {
                clearInput();
            } else {
                input.blur(); 
            }
        }
    });

    // --- 提交逻辑 (带抖动反馈和加载动画) ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const rawQuery = input.value.trim();
        
        // 错误反馈：空内容抖动
        if (!rawQuery) {
            form.classList.add('error-shake');
            input.focus();
            setTimeout(() => { form.classList.remove('error-shake'); }, 500);
            return; 
        }

        // 加载动画
        const searchBtn = form.querySelector('.search-button');
        searchBtn.classList.add('is-loading'); 

        setTimeout(() => {
            window.open(currentSearchUrl + encodeURIComponent(rawQuery), '_blank');
            // 重置动画
            setTimeout(() => { searchBtn.classList.remove('is-loading'); }, 500); 
        }, 200); 
    });
});