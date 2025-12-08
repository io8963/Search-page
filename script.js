document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');

    // --- 1. Placeholder 动态更新函数 ---
    function updatePlaceholder() {
        const selectedOption = select.options[select.selectedIndex];
        const engineName = selectedOption.textContent;
        
        // 设置新的 Placeholder 文本
        input.placeholder = `使用 ${engineName} 搜索...`;
    }

    // 初始化 Placeholder
    updatePlaceholder();
    
    // 监听 select 改变事件，实时更新 Placeholder
    select.addEventListener('change', updatePlaceholder);


    // --- 2. 核心搜索提交逻辑 ---
    form.addEventListener('submit', (e) => {
        // 阻止表单默认提交行为
        e.preventDefault(); 
        
        const selectedEngineUrl = select.value;
        const rawQuery = input.value.trim();
        
        if (!rawQuery) {
            input.focus();
            return; 
        }
        
        const encodedQuery = encodeURIComponent(rawQuery);
        const searchUrl = selectedEngineUrl + encodedQuery;
        
        // 在新标签页中打开
        window.open(searchUrl, '_blank');
    });
});
