document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');

    form.addEventListener('submit', (e) => {
        // 阻止表单默认提交行为 (页面刷新)
        e.preventDefault(); 
        
        // 获取选中的搜索引擎基础 URL
        const selectedEngineUrl = select.value;
        
        // 获取用户输入的查询词，并进行 URL 编码
        const query = encodeURIComponent(input.value.trim());
        
        if (query) {
            // 构建完整的搜索 URL
            const searchUrl = selectedEngineUrl + query;
            
            // 在新标签页中打开搜索结果
            window.open(searchUrl, '_blank');
        } else {
            // 如果输入为空，可以给出提示或不进行任何操作
            alert('请输入搜索内容！');
            input.focus();
        }
    });
});
