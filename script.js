document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');

    // 核心：监听表单提交事件 (当点击 type="submit" 的按钮时触发)
    form.addEventListener('submit', (e) => {
        // 阻止表单默认提交行为 (防止页面刷新)
        e.preventDefault(); 
        
        // 1. 获取选中的搜索引擎基础 URL
        const selectedEngineUrl = select.value;
        
        // 2. 获取用户输入的查询词
        const rawQuery = input.value.trim();
        
        // 检查输入是否为空
        if (!rawQuery) {
            // 如果输入为空，给出提示并聚焦输入框
            input.focus();
            // 可以选择添加一个视觉提示，但目前保持简约，只聚焦
            return; 
        }
        
        // 3. 对查询词进行 URL 编码，确保特殊字符能被正确识别
        const encodedQuery = encodeURIComponent(rawQuery);
        
        // 4. 构建完整的搜索 URL
        const searchUrl = selectedEngineUrl + encodedQuery;
        
        // 5. 在新标签页中打开搜索结果
        window.open(searchUrl, '_blank');
        
        // 搜索完成后，可以选择清空输入框
        // input.value = ''; 
    });
});
