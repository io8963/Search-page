document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');
    const clearBtn = document.getElementById('clear-btn'); // 获取清除按钮

    // --- 1. 初始化：从本地存储读取上次选择的引擎 ---
    const savedEngine = localStorage.getItem('selectedEngine');
    if (savedEngine) {
        select.value = savedEngine;
    }

    // --- 2. 界面更新逻辑 ---
    function updatePlaceholder() {
        const selectedOption = select.options[select.selectedIndex];
        const engineName = selectedOption.textContent;
        
        // 设置新的 Placeholder
        input.placeholder = `使用 ${engineName} 搜索...`;
        
        // 💾 每次改变都记住用户的选择
        localStorage.setItem('selectedEngine', select.value);
    }
    
    // 控制清除按钮的显示与隐藏
    function toggleClearBtn() {
        if (input.value.trim().length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    // 初始化执行
    updatePlaceholder();
    // 页面加载自动聚焦输入框
    input.focus();

    // --- 3. 事件监听 ---
    
    // 监听 select 改变
    select.addEventListener('change', updatePlaceholder);

    // 监听输入框内容变化 (输入时判断是否显示清除按钮)
    input.addEventListener('input', toggleClearBtn);

    // 监听清除按钮点击
    clearBtn.addEventListener('click', () => {
        input.value = ''; // 清空内容
        input.focus();    // 重新聚焦
        toggleClearBtn(); // 隐藏按钮
    });

    // 监听全局快捷键 "/"
    document.addEventListener('keydown', (e) => {
        // 如果当前没有聚焦在输入框，且按下了 "/" 键
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault(); // 阻止默认的输入 "/" 行为
            input.focus();      // 聚焦输入框
        }
    });

    // 监听表单提交
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const selectedEngineUrl = select.value;
        const rawQuery = input.value.trim();
        
        if (!rawQuery) {
            input.focus();
            return; 
        }
        
        const encodedQuery = encodeURIComponent(rawQuery);
        const searchUrl = selectedEngineUrl + encodedQuery;
        
        window.open(searchUrl, '_blank');
    });
});