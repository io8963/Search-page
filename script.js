document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');
    
    const engineTrigger = document.getElementById('engine-trigger');
    const engineMenu = document.getElementById('engine-menu');
    const engineNameDisplay = document.getElementById('current-engine-name');
    const menuItems = engineMenu.querySelectorAll('li');

    let currentSearchUrl = "https://www.bing.com/search?q=";
    
    // ✨ 键盘导航变量
    let activeIndex = -1; // -1 表示没有通过键盘选中任何项

    // --- 1. 初始化 ---
    const savedEngineName = localStorage.getItem('selectedEngineName');
    const savedEngineUrl = localStorage.getItem('selectedEngineUrl');

    if (savedEngineName && savedEngineUrl) {
        updateEngineState(savedEngineName, savedEngineUrl);
    }

    // --- 核心：更新引擎状态 ---
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

    // --- ✨ 核心：菜单开关控制 (重构) ---
    function toggleMenu(show) {
        if (show) {
            engineMenu.classList.add('active');
            activeIndex = -1; // 每次打开重置索引
            // 清除之前的键盘高亮
            menuItems.forEach(item => item.classList.remove('key-active'));
        } else {
            engineMenu.classList.remove('active');
        }
    }

    // --- 交互：点击开关菜单 ---
    engineTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = engineMenu.classList.contains('active');
        toggleMenu(!isActive); // 切换状态
    });

    // --- 交互：鼠标点击菜单项 ---
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const name = item.getAttribute('data-name');
            const url = item.getAttribute('data-url');
            updateEngineState(name, url);
            toggleMenu(false); // 关闭
            input.focus();
        });
    });

    // --- ✨ 交互：键盘导航 (新功能) ---
    document.addEventListener('keydown', (e) => {
        // 只有当菜单打开时，才拦截这些键
        if (engineMenu.classList.contains('active')) {
            const items = Array.from(menuItems);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault(); // 防止页面滚动
                activeIndex++;
                if (activeIndex >= items.length) activeIndex = 0; // 循环到底部回顶部
                updateMenuHighlight(items);
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex--;
                if (activeIndex < 0) activeIndex = items.length - 1; // 循环到顶部到底部
                updateMenuHighlight(items);
            } 
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex > -1) {
                    // 模拟点击当前高亮的项
                    items[activeIndex].click();
                } else {
                    // 如果没选中任何项按回车，就默认关闭菜单
                    toggleMenu(false);
                }
            }
            else if (e.key === 'Escape') {
                toggleMenu(false);
            }
        }
    });

    // 辅助：更新键盘高亮视觉
    function updateMenuHighlight(items) {
        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add('key-active');
            } else {
                item.classList.remove('key-active');
            }
        });
    }

    // --- 交互：点击空白关闭菜单 ---
    document.addEventListener('click', () => {
        toggleMenu(false);
    });

    // --- 其他原有逻辑 ---
    function toggleClearBtn() {
        clearBtn.style.display = input.value.trim().length > 0 ? 'flex' : 'none';
    }

    input.addEventListener('input', toggleClearBtn);

    clearBtn.addEventListener('click', () => {
        input.value = ''; 
        input.focus();    
        toggleClearBtn(); 
    });

    // 全局快捷键 "/" 聚焦
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault(); 
            input.focus();      
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const rawQuery = input.value.trim();
        if (!rawQuery) {
            input.focus();
            return; 
        }
        window.open(currentSearchUrl + encodeURIComponent(rawQuery), '_blank');
    });
});