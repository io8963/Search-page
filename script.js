document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');
    const selectGroup = document.querySelector('.engine-select-group');

    // 定义移动端断点 (需与 CSS 保持一致)
    const MOBILE_BREAKPOINT = 768; 

    // Logo 切换函数
    function updateLogo() {
        // 只有在移动端才进行 Logo 替换
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            const selectedOption = select.options[select.selectedIndex];
            const logoIconName = selectedOption.getAttribute('data-logo');

            // 构造 Logo 元素（Material Symbols Icon）
            selectGroup.innerHTML = `
                <span class="material-symbols-outlined logo-icon">${logoIconName}</span>
            `;
            
            // 重新添加 select 元素（必须保留，用于实际值传递）
            selectGroup.appendChild(select);
            
            // 隐藏搜索放大镜图标（它只在 PC 端有意义）
            const searchIcon = selectGroup.querySelector('.icon-search');
            if(searchIcon) searchIcon.style.display = 'none';

        } else {
             // PC 端恢复默认显示（仅重新添加放大镜图标）
             const existingIcon = selectGroup.querySelector('.icon-search');
             if (!existingIcon) {
                // 确保在 select 前面有放大镜图标
                selectGroup.prepend(document.createElement('span')).className = 'material-symbols-outlined icon-search';
                selectGroup.querySelector('.icon-search').textContent = 'search';
             }
             // 确保移除 Logo Icon
             const logoIcon = selectGroup.querySelector('.logo-icon');
             if (logoIcon) logoIcon.remove();
        }
    }

    // 初始化时和窗口大小变化时更新 Logo
    window.addEventListener('resize', updateLogo);
    updateLogo();

    // 监听 select 改变事件
    select.addEventListener('change', updateLogo);

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const selectedEngineUrl = select.value;
        const query = encodeURIComponent(input.value.trim());
        
        if (query) {
            const searchUrl = selectedEngineUrl + query;
            window.open(searchUrl, '_blank');
        } else {
            input.focus();
        }
    });
});
