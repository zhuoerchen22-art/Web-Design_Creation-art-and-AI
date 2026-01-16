const button = document.getElementById('buttonPart');
const panels = document.querySelectorAll('.panel');
const body = document.body;
const textWrapper = document.getElementById('textWrapper');
const leftText = document.querySelector('.left-text');
const rightText = document.querySelector('.right-text');
const closeBtn = document.getElementById('closeBtn');

// 读取 CSS 变量
const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let isSplit = false;
let expandedPanel = null;

// 保存初始位置
const originalPositions = new Map();
panels.forEach(panel=>{
    originalPositions.set(panel, {
        top: panel.style.top,
        left: panel.style.left,
        width: panel.style.width,
        height: panel.style.height
    });
});

function splitPanels(){
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;

    // 切换背景
    body.style.filter = 'brightness(1)'; 
    body.style.background = getCssVar('--split-bg');
    
    // 切换封面文字颜色
    leftText.style.color = getCssVar('--split-text');
    rightText.style.color = getCssVar('--split-text');
    
    // **分裂时设置问号为深色 (使用内联样式)**
    document.querySelector('#buttonPart .eq').style.color = getCssVar('--split-text');

    leftText.style.opacity = '0';
    rightText.style.opacity = '0';
    textWrapper.style.opacity = '0';

    panels.forEach(panel => {
        panel.style.zIndex = "1";
        const pos = originalPositions.get(panel);
        panel.style.top = pos.top;
        panel.style.left = pos.left;
        panel.style.width = pos.width;
        panel.style.height = pos.height;
        panel.querySelector('.panel-content').style.display = 'none';

        panel.style.opacity = '0.95';
        
        // 面板背景为深蓝绿半透明
        panel.style.background = getCssVar('--panel-color'); 
        
        const pr = panel.getBoundingClientRect();
        const offsetX = pr.left + pr.width/2 < centerX ? -40 : 40;
        const offsetY = pr.top + pr.height/2 < centerY ? -40 : 40;
        const rotateDeg = offsetX < 0 ? -3 : 3;

        panel.dataset.splitTransform =
          `translate(${offsetX}px,${offsetY}px) rotate(${rotateDeg}deg)`;
        panel.style.transform = panel.dataset.splitTransform;
    });

    isSplit = true;
    
    // 在分裂状态下，强制清除按钮容器的内联样式
    button.removeAttribute('style'); 
}

// hover 弹性动画 (修改 hover 逻辑以适应背景色变化)
panels.forEach(panel=>{
    panel.addEventListener('mouseenter', ()=>{
        if(!isSplit || expandedPanel === panel) return;
        const transform = panel.dataset.splitTransform;
        if(!transform) return;
        const [tx, ty, rotate] = transform.match(/-?\d+/g).map(Number);
        const innerX = tx < 0 ? tx + 20 : tx - 20;
        const innerY = ty < 0 ? ty + 20 : ty - 20;
        panel.style.transform = `translate(${innerX}px,${innerY}px) rotate(${rotate}deg)`;
    });
    panel.addEventListener('mouseleave', ()=>{
        if(!isSplit || expandedPanel === panel) return;
        const transform = panel.dataset.splitTransform;
        if(transform) panel.style.transform = transform;
    });
});

function restoreInitial(){
    panels.forEach(panel=>{
        panel.style.transform = 'translate(0,0) rotate(0deg)';
        panel.style.opacity = '0';
        panel.style.background = 'transparent'; 
        const pos = originalPositions.get(panel);
        panel.style.top = pos.top;
        panel.style.left = pos.left;
        panel.style.width = pos.width;
        panel.style.height = pos.height;
        panel.querySelector('.panel-content').style.display='none';
        
        // **重置滚动条**
        panel.querySelector('.panel-content').scrollTop = 0; 
    });

    // 恢复初始背景
    body.style.filter='brightness(1)';
    body.style.background=getCssVar('--initial-bg'); 
    
    // 恢复封面文字颜色
    leftText.style.color = getCssVar('--initial-text');
    rightText.style.color = getCssVar('--initial-text');
    
    leftText.style.opacity='1';
    rightText.style.opacity='1';
    textWrapper.style.opacity='1';

    closeBtn.style.display='none';
    expandedPanel = null;
    
    // **第 1 步：** 移除按钮容器 (#buttonPart) 上的所有内联样式 (修复米色方框悬停)
    button.removeAttribute('style'); 
    
    // **第 2 步：** 移除问号元素 (.eq) 上的所有内联样式 (修复问号颜色悬停)
    document.querySelector('#buttonPart .eq').removeAttribute('style'); 

    isSplit = false;
}

button.addEventListener('click', e=>{
    e.stopPropagation();
    if(!isSplit) splitPanels();
    else restoreInitial();
});

panels.forEach(panel=>{
    panel.addEventListener('click', e=>{
        if(!isSplit) return;
        e.stopPropagation();
        expandedPanel = panel;
        panels.forEach(p=>{ if(p!==panel) p.style.opacity='0'; });

        panel.style.top='0'; panel.style.left='0';
        panel.style.width='100%'; panel.style.height='100%';
        panel.style.transform='translate(0,0) rotate(0deg)';
        panel.style.zIndex='10';

        panel.querySelector('.panel-content').style.display='block';
        closeBtn.style.display='block';
    });
});

closeBtn.addEventListener('click', ()=>{
    if(expandedPanel){
        // **重置滚动条**
        expandedPanel.querySelector('.panel-content').scrollTop = 0; 

        expandedPanel.querySelector('.panel-content').style.display='none';
        expandedPanel.style.zIndex='1';
        expandedPanel = null;
        splitPanels();
        closeBtn.style.display='none';
    }
});
