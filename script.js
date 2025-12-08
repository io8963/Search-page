document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');

    // 搜索表单提交逻辑
    form.addEventListener('submit', (e) => {
        // 阻止表单默认提交行为 (页面刷新)
        e.preventDefault(); 
        
        // 获取选中的搜索引擎基础 URL
        const selectedEngineUrl = select.value;
        
        // 获取用户输入的查询词，并进行 URL 编码
        const query = encodeURIComponent(input.value.trim());
        
        if (query) {
            // 构建完整的搜索 URL 并在新标签页中打开
            const searchUrl = selectedEngineUrl + query;
            window.open(searchUrl, '_blank');
        } else {
            // 如果输入为空，聚焦输入框
            input.focus();
        }
    });
});
