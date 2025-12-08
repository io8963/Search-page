document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const select = document.getElementById('engine-select');
    const selectGroup = document.querySelector('.engine-select-group');

    // 定义移动端断点 (需与 CSS 保持一致)
    const MOBILE_BREAKPOINT = 768; 

    // Logo 切换函数
    function updateLogo() {
        const selectedOption = select.options[select.selectedIndex];
        const logoIconName = selectedOption.getAttribute('data-logo');
        
        let logoIcon = selectGroup.querySelector('.logo-icon');
        let searchIcon = selectGroup.querySelector('.icon-search');

        // --- 1. 检查是否在移动端 ---
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            // 移动端：显示 Logo，隐藏搜索图标
            if (!logoIcon) {
                // 如果 Logo 元素不存在，创建它
                logoIcon = document.createElement('span');
                logoIcon.className = 'material-symbols-outlined logo-icon';
                selectGroup.prepend(logoIcon); // 将 Logo 放在最前面
            }

            // 更新 Logo 图标名称
            logoIcon.textContent = logoIconName;
            logoIcon.style.display = 'block';

            // 隐藏 PC 端的搜索图标和 `<select>` 的文字
            if (searchIcon) searchIcon.style.display = 'none';
            select.style.opacity = '0'; // 隐藏 `<select>` 自身
            select.style.pointerEvents = 'auto'; // 确保可点击

        } else {
            // PC 端：显示搜索图标和 `<select>` 的文字
            if (!searchIcon) {
                // 如果搜索图标不存在，创建它
                searchIcon = document.createElement('span');
                searchIcon.className = 'material-symbols-outlined icon-search';
                searchIcon.textContent = 'search';
                selectGroup.prepend(searchIcon);
            }
            searchIcon.style.display = 'block';
            select.style.opacity = '1';
            select.style.pointerEvents = 'auto';

            // 移除 Logo 图标
            if (logoIcon) logoIcon.remove(); 
        }
    }

    // 初始化时和窗口大小变化时更新 Logo
    window.addEventListener('resize', updateLogo);
    updateLogo(); // 初始化调用

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
