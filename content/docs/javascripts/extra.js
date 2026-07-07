/* ============================================================
   Chipsea Zephyr EC Manual — 前端增强脚本
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ---- 阅读进度条 ---- */
  var progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  /* ---- 导航手风琴：点击一个 section 时关闭其他 ---- */
  var navSections = document.querySelectorAll('.md-nav__item--nested');
  navSections.forEach(function(section) {
    var toggle = section.querySelector('.md-nav__link');
    if (!toggle) return;
    toggle.addEventListener('click', function() {
      // 当前 section 被展开时，关闭同级其他 section
      setTimeout(function() {
        var isOpen = section.classList.contains('md-nav__item--active');
        if (!isOpen) return;
        var siblings = section.parentElement.querySelectorAll('.md-nav__item--nested');
        siblings.forEach(function(sib) {
          if (sib !== section) {
            sib.classList.remove('md-nav__item--active');
            var checkbox = sib.querySelector('.md-nav__toggle');
            if (checkbox) checkbox.checked = false;
          }
        });
      }, 50);
    });
  });

  /* ---- 代码块语言标签 ---- */
  document.querySelectorAll('.md-typeset pre > code[class*="language-"]').forEach(function(block) {
    var classes = block.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf('language-') === 0) {
        block.setAttribute('data-lang', classes[i].replace('language-', ''));
        break;
      }
    }
  });

  /* ---- Hero 芯片引脚 SVG 背景 ---- */
  var hero = document.querySelector('.cyber-hero');
  if (!hero) return;

  var NS = 'http://www.w3.org/2000/svg';
  var bg = document.createElement('div');
  bg.className = 'hero-circuit-bg';

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 800 400');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // 芯片封装
  svg.appendChild(el('rect', { x: 320, y: 140, width: 160, height: 120, rx: 4, fill: 'none', stroke: '#673AB7', 'stroke-width': 1.5 }));
  svg.appendChild(el('line', { x1: 400, y1: 150, x2: 400, y2: 250, stroke: '#673AB7', 'stroke-width': 0.4 }));
  svg.appendChild(el('line', { x1: 330, y1: 200, x2: 470, y2: 200, stroke: '#673AB7', 'stroke-width': 0.4 }));
  // 芯片中心圆
  svg.appendChild(el('circle', { cx: 400, cy: 200, r: 8, fill: 'none', stroke: '#673AB7', 'stroke-width': 0.6 }));
  // Pin 1 标记
  svg.appendChild(el('circle', { cx: 330, cy: 150, r: 3, fill: '#673AB7' }));

  // 引脚生成
  var pins = [];
  for (var i = 0; i < 8; i++) {
    var px = 335 + i * 18;
    pins.push([px, 140, px, 95 - i * 4]);
    pins.push([px, 260, px, 305 + i * 4]);
  }
  for (var i = 0; i < 6; i++) {
    var py = 155 + i * 18;
    pins.push([320, py, 275 - i * 4, py]);
    pins.push([480, py, 525 + i * 4, py]);
  }

  pins.forEach(function(p) {
    svg.appendChild(el('line', { x1: p[0], y1: p[1], x2: p[2], y2: p[3], stroke: '#00e5ff', 'stroke-width': 0.8, 'stroke-linecap': 'round' }));
    svg.appendChild(el('circle', { cx: p[2], cy: p[3], r: 2, fill: '#00e5ff' }));
  });

  // PCB 走线
  var traces = [
    'M 275 155 L 180 155 L 180 70 L 80 70',
    'M 275 173 L 160 173 L 160 110 L 50 110',
    'M 525 155 L 620 155 L 620 70 L 720 70',
    'M 525 173 L 640 173 L 640 110 L 750 110',
    'M 335 95 L 335 55 L 180 55',
    'M 418 95 L 418 35 L 620 35',
    'M 353 305 L 353 350 L 180 350',
    'M 436 305 L 436 370 L 650 370',
    'M 275 200 L 220 200 L 220 280 L 100 280',
    'M 525 200 L 580 200 L 580 280 L 700 280',
  ];

  traces.forEach(function(d) {
    svg.appendChild(el('path', { d: d, fill: 'none', stroke: '#673AB7', 'stroke-width': 0.5, 'stroke-linecap': 'round' }));
  });

  // 走线末端小方块（焊盘）
  var pads = [[80,70],[50,110],[720,70],[750,110],[100,280],[700,280]];
  pads.forEach(function(pt) {
    svg.appendChild(el('rect', { x: pt[0]-3, y: pt[1]-3, width: 6, height: 6, rx: 1, fill: 'none', stroke: '#00e5ff', 'stroke-width': 0.5 }));
  });

  bg.appendChild(svg);
  hero.insertBefore(bg, hero.firstChild);
});
