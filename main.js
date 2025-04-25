// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 初始化弹出框
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 收藏主题功能
    const saveTopicBtn = document.getElementById('save-topic');
    if (saveTopicBtn) {
        saveTopicBtn.addEventListener('click', function() {
            const topicTitle = document.querySelector('.container h1').textContent;
            let savedTopics = JSON.parse(localStorage.getItem('savedTopics') || '[]');
            
            if (!savedTopics.includes(topicTitle)) {
                savedTopics.push(topicTitle);
                localStorage.setItem('savedTopics', JSON.stringify(savedTopics));
                
                // 更改按钮状态
                this.innerHTML = '<i class="bi bi-bookmark-check-fill me-1"></i> 已收藏';
                this.classList.remove('btn-outline-light');
                this.classList.add('btn-light');
                
                // 显示提示
                const toast = new bootstrap.Toast(document.getElementById('saveToast'));
                document.getElementById('toastMessage').textContent = `已将"${topicTitle}"添加到收藏`;
                toast.show();
            } else {
                // 如果已经收藏，则取消收藏
                savedTopics = savedTopics.filter(topic => topic !== topicTitle);
                localStorage.setItem('savedTopics', JSON.stringify(savedTopics));
                
                // 更改按钮状态
                this.innerHTML = '<i class="bi bi-bookmark-plus me-1"></i> 收藏主题';
                this.classList.remove('btn-light');
                this.classList.add('btn-outline-light');
                
                // 显示提示
                const toast = new bootstrap.Toast(document.getElementById('saveToast'));
                document.getElementById('toastMessage').textContent = `已将"${topicTitle}"从收藏中移除`;
                toast.show();
            }
        });
        
        // 检查当前主题是否已收藏
        const topicTitle = document.querySelector('.container h1')?.textContent;
        if (topicTitle) {
            let savedTopics = JSON.parse(localStorage.getItem('savedTopics') || '[]');
            if (savedTopics.includes(topicTitle)) {
                saveTopicBtn.innerHTML = '<i class="bi bi-bookmark-check-fill me-1"></i> 已收藏';
                saveTopicBtn.classList.remove('btn-outline-light');
                saveTopicBtn.classList.add('btn-light');
            }
        }
    }
    
    // 分享功能
    const sharePageBtn = document.getElementById('share-page');
    if (sharePageBtn) {
        sharePageBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                }).then(() => {
                    console.log('分享成功');
                }).catch(console.error);
            } else {
                // 如果不支持Web Share API，则复制链接到剪贴板
                const dummy = document.createElement('input');
                document.body.appendChild(dummy);
                dummy.value = window.location.href;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                
                // 显示提示
                const toast = new bootstrap.Toast(document.getElementById('shareToast'));
                toast.show();
            }
        });
    }
    
    // 学习进度追踪
    const progressCheckboxes = document.querySelectorAll('.progress-checkbox');
    if (progressCheckboxes.length > 0) {
        progressCheckboxes.forEach(checkbox => {
            const itemId = checkbox.getAttribute('data-item-id');
            const isCompleted = localStorage.getItem(`completed_${itemId}`) === 'true';
            
            checkbox.checked = isCompleted;
            
            if (isCompleted) {
                checkbox.closest('.list-group-item').classList.add('list-group-item-success');
            }
            
            checkbox.addEventListener('change', function() {
                const isChecked = this.checked;
                localStorage.setItem(`completed_${itemId}`, isChecked);
                
                if (isChecked) {
                    this.closest('.list-group-item').classList.add('list-group-item-success');
                } else {
                    this.closest('.list-group-item').classList.remove('list-group-item-success');
                }
                
                // 更新进度条
                updateProgressBar();
            });
        });
        
        // 初始化进度条
        updateProgressBar();
    }
    
    // 更新进度条函数
    function updateProgressBar() {
        const progressBar = document.getElementById('learningProgress');
        if (progressBar) {
            const totalItems = document.querySelectorAll('.progress-checkbox').length;
            let completedItems = 0;
            
            document.querySelectorAll('.progress-checkbox').forEach(checkbox => {
                const itemId = checkbox.getAttribute('data-item-id');
                if (localStorage.getItem(`completed_${itemId}`) === 'true') {
                    completedItems++;
                }
            });
            
            const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.setAttribute('aria-valuenow', progressPercentage);
            document.getElementById('progressText').textContent = `${progressPercentage}%`;
            
            // 更新进度状态
            const progressStatus = document.getElementById('progressStatus');
            if (progressStatus) {
                if (progressPercentage === 0) {
                    progressStatus.textContent = '尚未开始';
                    progressStatus.className = 'badge bg-secondary';
                } else if (progressPercentage < 30) {
                    progressStatus.textContent = '刚刚起步';
                    progressStatus.className = 'badge bg-info';
                } else if (progressPercentage < 70) {
                    progressStatus.textContent = '稳步进行';
                    progressStatus.className = 'badge bg-primary';
                } else if (progressPercentage < 100) {
                    progressStatus.textContent = '即将完成';
                    progressStatus.className = 'badge bg-warning text-dark';
                } else {
                    progressStatus.textContent = '已完成';
                    progressStatus.className = 'badge bg-success';
                }
            }
        }
    }
    
    // 搜索功能
    const searchForm = document.querySelector('form.d-flex');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"]');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // 在实际应用中，这里应该跳转到搜索结果页面
                // 这里我们简单地弹出一个模态框显示搜索结果
                const searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
                document.getElementById('searchTerm').textContent = searchTerm;
                searchModal.show();
                
                // 清空搜索框
                searchInput.value = '';
            }
        });
    }
    
    // 学习路径选择器
    const pathSelector = document.getElementById('pathSelector');
    if (pathSelector) {
        pathSelector.addEventListener('change', function() {
            window.location.href = this.value;
        });
    }
    
    // 主题过滤器
    const topicFilters = document.querySelectorAll('.topic-filter');
    if (topicFilters.length > 0) {
        topicFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // 移除所有过滤器的激活状态
                document.querySelectorAll('.topic-filter').forEach(f => {
                    f.classList.remove('active');
                });
                
                // 激活当前过滤器
                this.classList.add('active');
                
                // 过滤主题卡片
                const topicCards = document.querySelectorAll('.topic-card');
                topicCards.forEach(card => {
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // 资源难度过滤器
    const difficultyFilters = document.querySelectorAll('.difficulty-filter');
    if (difficultyFilters.length > 0) {
        difficultyFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const difficulty = this.getAttribute('data-difficulty');
                
                // 移除所有过滤器的激活状态
                document.querySelectorAll('.difficulty-filter').forEach(f => {
                    f.classList.remove('active');
                });
                
                // 激活当前过滤器
                this.classList.add('active');
                
                // 过滤资源卡片
                const resourceItems = document.querySelectorAll('.resource-item');
                resourceItems.forEach(item => {
                    if (difficulty === 'all' || item.getAttribute('data-difficulty') === difficulty) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // 项目难度过滤器
    const projectFilters = document.querySelectorAll('.project-filter');
    if (projectFilters.length > 0) {
        projectFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const difficulty = this.getAttribute('data-difficulty');
                
                // 移除所有过滤器的激活状态
                document.querySelectorAll('.project-filter').forEach(f => {
                    f.classList.remove('active');
                });
                
                // 激活当前过滤器
                this.classList.add('active');
                
                // 过滤项目卡片
                const projectCards = document.querySelectorAll('.project-card');
                projectCards.forEach(card => {
                    if (difficulty === 'all' || card.getAttribute('data-difficulty') === difficulty) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // 暗色模式切换
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // 检查用户偏好
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // 初始化状态
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
    
    // 字体大小调整
    const fontSizeControls = document.querySelectorAll('.font-size-control');
    if (fontSizeControls.length > 0) {
        // 获取当前字体大小
        let currentSize = parseInt(localStorage.getItem('fontSize') || '100');
        
        // 初始化
        document.body.style.fontSize = `${currentSize}%`;
        
        fontSizeControls.forEach(control => {
            control.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                
                if (action === 'increase') {
                    currentSize += 10;
                    if (currentSize > 150) currentSize = 150;
                } else if (action === 'decrease') {
                    currentSize -= 10;
                    if (currentSize < 80) currentSize = 80;
                } else if (action === 'reset') {
                    currentSize = 100;
                }
                
                document.body.style.fontSize = `${currentSize}%`;
                localStorage.setItem('fontSize', currentSize);
            });
        });
    }
    
    // 反馈表单提交
    const feedbackForm = document.querySelector('#feedbackModal form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 在实际应用中，这里应该发送表单数据到服务器
            // 这里我们简单地显示一个成功消息
            const feedbackModal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
            feedbackModal.hide();
            
            const toast = new bootstrap.Toast(document.getElementById('feedbackToast'));
            toast.show();
            
            // 重置表单
            this.reset();
        });
    }
    
    // 添加搜索模态框到DOM（如果不存在）
    if (!document.getElementById('searchModal')) {
        const searchModalHTML = `
        <div class="modal fade" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="searchModalLabel">搜索结果</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>搜索关键词: <strong id="searchTerm"></strong></p>
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            搜索功能正在开发中，敬请期待！
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', searchModalHTML);
    }
    
    // 添加Toast通知到DOM（如果不存在）
    if (!document.getElementById('saveToast')) {
        const toastHTML = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div id="saveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-success text-white">
           
(Content truncated due to size limit. Use line ranges to read in chunks)