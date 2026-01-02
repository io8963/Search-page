document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');
    
    // 自定义引擎选择器元素
    const engineTrigger = document.getElementById('engine-trigger');
    const engineMenu = document.getElementById('engine-menu');
    const engineNameDisplay = document.getElementById('current-engine-name');
    const menuItems = engineMenu.querySelectorAll('li');

    // 当前选中的搜索引擎 URL (默认为 Bing)
    let currentSearchUrl = "https://www.bing.com/search?q=";

    // --- 1. 初始化：从本地存储读取 ---
    const savedEngineName = localStorage.getItem('selectedEngineName');
    const savedEngineUrl = localStorage.getItem('selectedEngineUrl');

    if (savedEngineName && savedEngineUrl) {
        // 更新状态
        updateEngineState(savedEngineName, savedEngineUrl);
    }

    // --- 核心函数：更新引擎状态 ---
    function updateEngineState(name, url) {
        // 1. 更新显示的文字
        engineNameDisplay.textContent = name;
        
        // 2. 更新 URL 变量
        currentSearchUrl = url;
        
        // 3. 更新 Placeholder
        input.placeholder = `使用 ${name} 搜索...`;
        
        // 4. 更新菜单项的选中样式
        menuItems.forEach(item => {
            if (item.getAttribute('data-name') === name) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // 5. 保存到本地存储
        localStorage.setItem('selectedEngineName', name);
        localStorage.setItem('selectedEngineUrl', url);
    }

    // --- 交互 1: 点击左侧区域，切换菜单显示 ---
    engineTrigger.addEventListener('click', (e) => {
        // 阻止冒泡，防止触发 document 的点击关闭事件
        e.stopPropagation();
        engineMenu.classList.toggle('active');
    });

    // --- 交互 2: 点击菜单项 ---
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡
            
            const name = item.getAttribute('data-name');
            const url = item.getAttribute('data-url');
            
            updateEngineState(name, url);
            
            // 关闭菜单
            engineMenu.classList.remove('active');
            
            // 聚焦输入框
            input.focus();
        });
    });

    // --- 交互 3: 点击页面其他地方关闭菜单 ---
    document.addEventListener('click', () => {
        engineMenu.classList.remove('active');
    });

    // --- 其他原有逻辑 (清除按钮、提交、快捷键) ---
    
    function toggleClearBtn() {
        if (input.value.trim().length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    input.addEventListener('input', toggleClearBtn);

    clearBtn.addEventListener('click', () => {
        input.value = ''; 
        input.focus();    
        toggleClearBtn(); 
    });

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
        
        const encodedQuery = encodeURIComponent(rawQuery);
        const searchUrl = currentSearchUrl + encodedQuery;
        
        window.open(searchUrl, '_blank');
    });
});