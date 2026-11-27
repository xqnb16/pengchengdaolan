/* ==========================================================================
   汉韵彭城 · Awwwards 电影级微动效引擎 (IZANAMI + sakazuki 手感)
   1. 开卷幕帘 (Preloader)
   2. 定制「观展 / 入画 / 拓印」磁性朱砂光标
   3. 卷轴画幅剪裁展开 (Clip-Path Unveil)
   4. 九景全目细线索引 + 跟手浮现画作 (Hover-Reveal Floating Plate)
   5. 轻量级丝滑阻尼滚轮 (Smooth Wheel Interpolation)
   ========================================================================== */
(function () {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. 开卷预加载幕帘 (IZANAMI 00→100 丝幕轻揭) + 首屏错峰入场仪式 ---------- */
  const pre = $('#edPreloader');
  if (pre) {
    if (RM) {
      pre.remove();
      document.documentElement.classList.add('ed-ready');
    } else {
      document.documentElement.classList.add('ed-anim-hero');
      const pctEl = $('#edPrePct');
      const barEl = $('#edPreBar');
      const tStart = performance.now();
      const dur = 860;
      const stepPre = now => {
        const p = Math.min(1, (now - tStart) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(eased * 100);
        if (pctEl) pctEl.textContent = String(val).padStart(2, '0');
        if (barEl) barEl.style.transform = `scaleX(${eased.toFixed(3)})`;
        if (p < 1) {
          requestAnimationFrame(stepPre);
        } else {
          setTimeout(() => {
            pre.classList.add('done');
            requestAnimationFrame(() => document.documentElement.classList.add('ed-ready'));
            setTimeout(() => pre.remove(), 950);
          }, 120);
        }
      };
      requestAnimationFrame(stepPre);
    }
  } else {
    document.documentElement.classList.add('ed-ready');
  }

  /* ---------- 2. 定制「观展」磁性光标 ---------- */
  if (FINE && !RM) {
    const dot = document.createElement('div');
    dot.className = 'ed-cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'ed-cursor-ring';
    ring.innerHTML = '<span>入画</span>';
    const label = $('span', ring);
    document.body.append(dot, ring);

    let mx = -100, my = -100, rx = -100, ry = -100, visible = false, curRaf = 0;
    const tick = () => {
      curRaf = 0;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (visible && (Math.abs(mx - rx) > 0.35 || Math.abs(my - ry) > 0.35)) {
        curRaf = requestAnimationFrame(tick);
      }
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        rx = mx; ry = my; visible = true;
        document.documentElement.classList.add('ed-cursor-on');
      }
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      if (!curRaf) curRaf = requestAnimationFrame(tick);
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      visible = false;
      document.documentElement.classList.remove('ed-cursor-on', 'ed-cursor-active', 'ed-cursor-link');
    });

    document.addEventListener('pointerover', e => {
      const t = e.target;
      const plate = t.closest('.sc5, .iz-stage, .sjc, .fyc, .ed-idx-row, .pin2');
      const rub = t.closest('#rub, .rb8');
      const link = t.closest('a, button, select');
      document.documentElement.classList.remove('ed-cursor-active', 'ed-cursor-link');
      if (rub) {
        label.textContent = '拓印';
        document.documentElement.classList.add('ed-cursor-active');
      } else if (plate) {
        label.textContent = plate.matches('.ed-idx-row') ? '观展' : '入画';
        document.documentElement.classList.add('ed-cursor-active');
      } else if (link) {
        document.documentElement.classList.add('ed-cursor-link');
      }
    }, { passive: true });
  }

  /* ---------- 3. 画幅卷轴剪裁展开 ---------- */
  function bindReveal() {
    const cards = $$('.sc5');
    if (RM || !('IntersectionObserver' in window)) {
      cards.forEach(c => { c.classList.remove('ed-wait'); c.classList.add('ed-in'); });
      return;
    }
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('ed-wait');
          e.target.classList.add('ed-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    cards.forEach(c => {
      c.classList.add('ed-wait');
      io.observe(c);
    });
  }

  /* ---------- 4. 九景全目细线索引 + 跟手浮现画作 ---------- */
  function buildIndex() {
    const host = $('#sites .wrap');
    const X = window.XZ;
    const ALL = window.ALL || window.ORDER || [];
    if (!host || !X || !ALL.length || $('#edIndex')) return;

    const FEAT_TXT = {
      gs: '提灯走甬道 · 隔空拓印',
      bwg: '玉衣放大镜 · 隔空拓印',
      sz: '隔空拓印 · 汉俑军阵',
      xmt: '隔空拓印 · 楚汉首景',
      hbs: '隔空拓印 · 明清院落',
      hlw: '隔空拓印 · 古城街巷',
      wm: '隔空拓印 · 彭城文脉',
      yls: '隔空拓印 · 放鹤山水',
      ylh: '隔空拓印 · 城市画卷'
    };

    const rows = ALL.map((id, i) => {
      const s = X.get(id);
      if (!s) return '';
      return `<li><a class="ed-idx-row" href="#site-${id}" data-img="${X.art(s.cover)}" data-cap="${s.n} · ${s.line}">
        <span class="ed-idx-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="ed-idx-name">${s.n}</span>
        <span class="ed-idx-era">${s.era}</span>
        <span class="ed-idx-feat">${FEAT_TXT[id] || '支持隔空拓印'}</span>
        <span class="ed-idx-go">观展 →</span>
      </a></li>`;
    }).join('');

    host.insertAdjacentHTML('beforeend', `
      <div class="ed-index" id="edIndex" aria-label="彭城九景全目索引">
        <div class="ed-idx-hd">
          <h3>彭城九景 · 全目索引</h3>
          <span>INDEX OF NINE HERITAGE SITES · 悬停预览画作</span>
        </div>
        <ul class="ed-idx-list">${rows}</ul>
      </div>
    `);

    if (FINE && !RM) {
      const plate = document.createElement('div');
      plate.className = 'ed-hover-plate';
      plate.setAttribute('aria-hidden', 'true');
      plate.innerHTML = '<img src="" alt=""><p></p>';
      document.body.appendChild(plate);
      const img = $('img', plate), cap = $('p', plate);
      let px = 0, py = 0, tx = 0, ty = 0, on = false;

      const loop = () => {
        if (on) {
          px += (tx - px) * 0.14;
          py += (ty - py) * 0.14;
          plate.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
          requestAnimationFrame(loop);
        }
      };

      const list = $('#edIndex .ed-idx-list');
      list.addEventListener('pointermove', e => {
        const x = Math.min(innerWidth - 310, e.clientX + 28);
        const y = Math.max(84, Math.min(innerHeight - 230, e.clientY - 110));
        tx = x; ty = y;
        if (!on) { px = x; py = y; }
      }, { passive: true });

      list.addEventListener('pointerover', e => {
        const row = e.target.closest('.ed-idx-row');
        if (!row) return;
        if (img.getAttribute('src') !== row.dataset.img) img.src = row.dataset.img;
        cap.textContent = row.dataset.cap;
        if (!on) {
          on = true;
          plate.classList.add('on');
          requestAnimationFrame(loop);
        }
      });

      list.addEventListener('pointerleave', () => {
        on = false;
        plate.classList.remove('on');
      });
    }
  }

  /* ---------- 5. SAKAZUKI 级真·连续滚动驱动三幕剧场 + 双行反向画廊 (120fps 纯 GPU 插值) ---------- */
  const skStage = $('#skStage');
  const skSlides = skStage ? $$('.sk-slide', skStage) : [];
  const skBtns = skStage ? $$('.sk-pbtn', skStage) : [];
  const skBars = skBtns.map(b => $('.sk-pbar b', b));
  const skMeta = skSlides.map(s => ({
    el: s,
    bg: $('.sk-bg', s),
    img: $('.sk-bg img', s),
    h2: $('.sk-copy-box h2', s),
    copy: $('.sk-copy-box', s),
    inset: $('.sk-inset-plate', s)
  }));
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  let curAct = 0;

  function renderStageScrub(p) {
    if (!skStage || skSlides.length < 3) return;
    if (innerWidth <= 960 || RM) {
      skStage.classList.remove('sk-scrub');
      const k = p < 0.34 ? 0 : (p < 0.68 ? 1 : 2);
      if (k !== curAct) {
        curAct = k;
        skSlides.forEach((s, i) => { s.style.clipPath = ''; s.classList.toggle('on', i === k); });
        skBtns.forEach((b, i) => b.classList.toggle('on', i === k));
      }
      return;
    }
    skStage.classList.add('sk-scrub');

    // 连续过渡区间：0->1 在 [0.24, 0.44]，1->2 在 [0.60, 0.80]
    const t1 = easeOut(clamp01((p - 0.24) / 0.20));
    const t2 = easeOut(clamp01((p - 0.60) / 0.20));
    const active = p < 0.36 ? 0 : (p < 0.72 ? 1 : 2);
    curAct = active;
    skBtns.forEach((b, i) => b.classList.toggle('on', i === active));

    // 每幕实时细线进度条
    const progVals = [
      clamp01(p / 0.34),
      clamp01((p - 0.34) / 0.34),
      clamp01((p - 0.68) / 0.32)
    ];
    skBars.forEach((bar, i) => { if (bar) bar.style.transform = `scaleX(${progVals[i].toFixed(4)})`; });

    // Act 0：基础底层，随着 t1 上升缓慢放大微退
    const s0 = skMeta[0];
    s0.el.style.zIndex = 1;
    if (s0.bg) s0.bg.style.clipPath = 'none';
    if (s0.img) s0.img.style.transform = `scale(${(1.01 + t1 * 0.08).toFixed(4)})`;
    if (s0.copy) {
      s0.copy.style.opacity = clamp01(1 - t1 * 1.65).toFixed(3);
      s0.copy.style.transform = `translate3d(0,${(-t1 * 32).toFixed(1)}px,0)`;
    }
    if (s0.h2) s0.h2.style.letterSpacing = `${(0.14 + t1 * 0.10).toFixed(3)}em`;

    // Act 1：仅对背景画幅做丝卷擦除 (绝不裁切文字！)，文案于其上干净淡入上浮
    const s1 = skMeta[1];
    s1.el.style.zIndex = 2;
    const w1 = (1 - t1) * 100;
    if (s1.bg) s1.bg.style.clipPath = w1 <= 0.1 ? 'none' : `inset(0 0 0 ${w1.toFixed(2)}%)`;
    s1.el.style.pointerEvents = t1 > 0.5 && t2 < 0.5 ? 'auto' : 'none';
    if (s1.img) s1.img.style.transform = `scale(${(1.10 - t1 * 0.09 + t2 * 0.07).toFixed(4)})`;
    if (s1.copy) {
      const op1 = clamp01((t1 - 0.35) / 0.55) * clamp01(1 - t2 * 1.65);
      const y1 = (1 - t1) * 28 - t2 * 30;
      s1.copy.style.opacity = op1.toFixed(3);
      s1.copy.style.transform = `translate3d(0,${y1.toFixed(1)}px,0)`;
    }
    if (s1.h2) s1.h2.style.letterSpacing = `${(0.24 - t1 * 0.10 + t2 * 0.08).toFixed(3)}em`;
    if (s1.inset) {
      const iop = clamp01((t1 - 0.30) / 0.60) * clamp01(1 - t2 * 1.5);
      s1.inset.style.opacity = iop.toFixed(3);
      s1.inset.style.transform = `translate3d(0,${((1 - t1) * 36 - t2 * 24).toFixed(1)}px,0)`;
    }

    // Act 2（汉代器物长卷）：背景宣纸丝卷擦入，文案干净上浮定格
    const s2 = skMeta[2];
    s2.el.style.zIndex = 3;
    const w2 = (1 - t2) * 100;
    if (s2.bg) s2.bg.style.clipPath = w2 <= 0.1 ? 'none' : `inset(0 0 0 ${w2.toFixed(2)}%)`;
    s2.el.style.pointerEvents = t2 > 0.5 ? 'auto' : 'none';
    if (s2.img) s2.img.style.transform = `scale(${(1.06 - t2 * 0.05).toFixed(4)})`;
    if (s2.copy) {
      const op2 = clamp01((t2 - 0.35) / 0.55);
      s2.copy.style.opacity = op2.toFixed(3);
      s2.copy.style.transform = `translate3d(0,${((1 - t2) * 28).toFixed(1)}px,0)`;
    }
    if (s2.h2) s2.h2.style.letterSpacing = `${(0.24 - t2 * 0.10).toFixed(3)}em`;
  }

  skBtns.forEach(b => {
    b.onclick = () => {
      const k = +b.dataset.to;
      if (!skStage) return;
      const targets = [0.02, 0.50, 0.90];
      const top = skStage.offsetTop + (skStage.offsetHeight - innerHeight) * targets[k];
      window.scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
    };
  });

  const skStrip = $('#skFilmstrip'), rowA = $('#skRowA'), rowB = $('#skRowB');

  /* ---------- 6. IZANAMI 全域暗房丝滑转场 + 导航问导览 + 首屏地标显隐 ---------- */
  const heroEl = $('#top');
  const pinsBtn = $('#pinsToggle');
  if (heroEl && pinsBtn) {
    pinsBtn.onclick = () => {
      const on = heroEl.classList.toggle('pins-all');
      pinsBtn.setAttribute('aria-pressed', on);
      $('span', pinsBtn).textContent = on ? '隐去地标名' : '悬停微光观景 · 显示全部地标';
    };
  }
  const navGuide = $('#navGuideBtn');
  if (navGuide) {
    navGuide.onclick = () => {
      const gav = $('#gav');
      if (gav) gav.click();
    };
  }
  const sj = $('#sanjue');
  if (sj && 'IntersectionObserver' in window) {
    const darkIO = new IntersectionObserver(es => {
      es.forEach(e => {
        document.documentElement.classList.toggle('ed-dark-room', e.isIntersecting);
      });
    }, { rootMargin: '-32% 0px -32% 0px', threshold: 0 });
    darkIO.observe(sj);
  }

  /* ---------- 7. 顶部朱砂阅读进度细线 + SAKAZUKI 3幕翻页 + 双行反向画廊 + 视差缩放 ---------- */
  const prog = $('#edProgress');
  let praf = 0;
  const updateScrollFX = () => {
    praf = 0;
    const vh = innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    if (prog) prog.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / max)).toFixed(4)})`;

    // 3 幕吸顶翻页：连续 120fps GPU 滚动插值
    if (skStage) {
      const r = skStage.getBoundingClientRect();
      const span = Math.max(1, skStage.offsetHeight - vh);
      const p = Math.max(0, Math.min(1, -r.top / span));
      renderStageScrub(p);
    }

    // 双行反向视差画廊带
    if (skStrip && rowA && rowB && !RM) {
      const r = skStrip.getBoundingClientRect();
      if (r.bottom > -100 && r.top < vh + 100) {
        const p = (vh - r.top) / (vh + r.height);
        const shift = (p - 0.5) * 260;
        rowA.style.transform = `translate3d(${(-140 - shift).toFixed(1)}px,0,0)`;
        rowB.style.transform = `translate3d(${(-240 + shift).toFixed(1)}px,0,0)`;
      }
    }

    // 景点画幅滚动呼吸缩放 + 内视差（仅在存在旧版 .sc5 时运行）
    const sc5Imgs = $$('.sc5 .im');
    if (!RM && FINE && sc5Imgs.length) {
      sc5Imgs.forEach(box => {
        const r = box.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const p = (r.top + r.height / 2) / vh - 0.5;
        const sc = 1 - Math.min(0.035, Math.abs(p) * 0.045);
        box.style.transform = `scale(${sc.toFixed(4)})`;
        const img = $('img', box);
        if (img) img.style.objectPosition = `50% ${(50 + p * 12).toFixed(1)}%`;
      });
    }
  };
  addEventListener('scroll', () => { if (!praf) praf = requestAnimationFrame(updateScrollFX); }, { passive: true });
  updateScrollFX();

  /* ---------- 8. 极简东方古琴泛音声景 + 交互微泛音联动 (仅在用户开启「声 · 鸣」时轻响) ---------- */
  let playCue = () => {};
  const sndBtn = $('#navSoundBtn');
  if (sndBtn && (window.AudioContext || window.webkitAudioContext)) {
    let ctx = null, master = null, timer = null, playing = false;
    // 五声音阶（宫商角徵羽：D4 E4 F#4 A4 B4 D5 A3）
    const NOTES = [220, 293.66, 329.63, 369.99, 440, 493.88, 587.33];
    const strikeNote = (freq, peak = 0.08, dur = 3.2) => {
      if (!playing || !ctx || !master) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const harm = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq * 2, now);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(1250, now);
      filt.frequency.exponentialRampToValueAtTime(260, now + dur * 0.85);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      const hGain = ctx.createGain();
      hGain.gain.value = 0.16;
      osc.connect(filt);
      harm.connect(hGain);
      hGain.connect(filt);
      filt.connect(gain);
      gain.connect(master);
      osc.start(now);
      harm.start(now);
      osc.stop(now + dur + 0.15);
      harm.stop(now + dur + 0.15);
    };
    playCue = (freq, dur = 1.9) => strikeNote(freq, 0.065, dur);
    const pluck = () => {
      if (!playing || !ctx) return;
      strikeNote(NOTES[Math.floor(Math.random() * NOTES.length)], 0.085, 4.2);
      timer = setTimeout(pluck, 2600 + Math.random() * 2800);
    };
    sndBtn.onclick = () => {
      if (!playing) {
        if (!ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          ctx = new AC();
          master = ctx.createGain();
          master.gain.value = 0.001;
          master.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') ctx.resume();
        playing = true;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 0.6);
        sndBtn.setAttribute('aria-pressed', 'true');
        sndBtn.dataset.tip = '古琴声景 · 鸣';
        const sp = $('span', sndBtn);
        if (sp) sp.textContent = '声 · 鸣';
        pluck();
      } else {
        playing = false;
        clearTimeout(timer);
        if (ctx && master) {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        }
        sndBtn.setAttribute('aria-pressed', 'false');
        sndBtn.dataset.tip = '古琴声景 · 静';
        const sp = $('span', sndBtn);
        if (sp) sp.textContent = '声 · 静';
      }
    };
  }

  /* ---------- 9. 彭城四时动态景致引擎 (春柳放鹤 / 夏湖微光 / 秋飘银杏 / 冬落细雪 + 鼠标微风交互) ---------- */
  const clockEl = $('#edClockTime');
  if (clockEl) {
    const fmt = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const updClock = () => { clockEl.textContent = fmt.format(new Date()); };
    updClock();
    setInterval(updClock, 1000);
  }

  let curSeason = document.documentElement.classList.contains('theme-obsidian') ? 'night' : 'spring';
  const seasonBtns = $$('#edSeasonBar button');
  if (heroEl) heroEl.dataset.season = curSeason;

  if (heroEl) {
    const cv = document.createElement('canvas');
    cv.className = 'ed-hero-fx';
    cv.setAttribute('aria-hidden', 'true');
    heroEl.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      W = heroEl.clientWidth || 1440;
      H = heroEl.clientHeight || 900;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    // 季节手绘质感粒子池（清晰可见且保留钢笔淡彩雅致质感）
    let parts = [];
    const spawnPart = (s, randomY) => {
      const z = 0.55 + Math.random() * 0.95; // 明显景深层次
      const base = {
        x: Math.random() * (W + 140) - 70,
        y: randomY ? Math.random() * H : -24 - Math.random() * 70,
        z,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.036,
        ph: Math.random() * Math.PI * 2,
        wx: 0,
        wy: 0
      };
      if (s === 'night') {
        const lCols = ['#F7DA94', '#E8B25C', '#FCE8B6', '#D98C45'];
        return { ...base, kind: 'lantern', y: randomY ? (0.28 + Math.random() * 0.68) * H : H + 18, sz: (1.8 + Math.random() * 2.6) * z, vx: (Math.random() - 0.5) * 0.35 * z, vy: -(0.24 + Math.random() * 0.38) * z, a: Math.min(0.9, 0.42 + z * 0.42), col: lCols[Math.floor(Math.random() * lCols.length)] };
      }
      if (s === 'spring') {
        const isPetal = Math.random() < 0.68;
        const pCols = ['#E8A8A4', '#F1C6C2', '#D98E8A', '#F7E7E2'];
        return { ...base, kind: isPetal ? 'petal' : 'catkin', sz: (isPetal ? 7.2 : 3.6) * z, vx: (0.55 + Math.random() * 0.5) * z, vy: (0.45 + Math.random() * 0.45) * z, a: Math.min(0.88, (isPetal ? 0.62 : 0.52) * z), col: pCols[Math.floor(Math.random() * pCols.length)] };
      }
      if (s === 'summer') {
        const isPetal = Math.random() < 0.35;
        return { ...base, kind: isPetal ? 'lotus' : 'mote', y: randomY ? (0.3 + Math.random() * 0.65) * H : H + 12, sz: (isPetal ? 6.5 : 3.0) * z, vx: (0.32 + Math.random() * 0.4) * z, vy: -(0.22 + Math.random() * 0.28) * z, a: Math.min(0.76, 0.48 * z) };
      }
      if (s === 'autumn') {
        const isMaple = Math.random() < 0.36;
        const gCols = ['#DFA334', '#CC8325', '#E8B84E', '#C47722'];
        const mCols = ['#B8422B', '#C95434', '#A23322'];
        return { ...base, kind: isMaple ? 'maple' : 'ginkgo', sz: (isMaple ? 10.5 : 10.0) * z, vx: (0.68 + Math.random() * 0.62) * z, vy: (0.62 + Math.random() * 0.55) * z, a: Math.min(0.94, 0.68 + z * 0.24), col: isMaple ? mCols[Math.floor(Math.random() * mCols.length)] : gCols[Math.floor(Math.random() * gCols.length)] };
      }
      // winter：清晰层次感漫天飞雪
      return { ...base, kind: 'snow', sz: (2.4 + Math.random() * 3.8) * z, vx: (0.28 + Math.random() * 0.55) * z, vy: (0.72 + Math.random() * 0.88) * z, a: Math.min(0.95, 0.58 + z * 0.32) };
    };

    const SEASON_POET = {
      night: '夜 · 彭城华灯',
      spring: '春 · 放鹤柳风',
      summer: '夏 · 云龙荷韵',
      autumn: '秋 · 彭城银杏',
      winter: '冬 · 雪霁古城'
    };
    const seasonInk = $('#edSeasonInk');
    const seasonPoet = $('#edSeasonPoet');
    const moveSeasonInk = btn => {
      if (!seasonInk || !btn) return;
      seasonInk.style.width = `${btn.offsetWidth}px`;
      seasonInk.style.transform = `translate3d(${btn.offsetLeft}px,0,0)`;
    };

    const initSeason = (s, animatePoet) => {
      curSeason = s;
      heroEl.dataset.season = s;
      let activeBtn = null;
      seasonBtns.forEach(b => {
        const on = b.dataset.s === s;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
        if (on) activeBtn = b;
      });
      requestAnimationFrame(() => moveSeasonInk(activeBtn));
      if (seasonPoet) {
        const txt = SEASON_POET[s] || '';
        if (animatePoet) {
          seasonPoet.classList.add('swap');
          setTimeout(() => {
            seasonPoet.textContent = txt;
            seasonPoet.classList.remove('swap');
          }, 190);
        } else {
          seasonPoet.textContent = txt;
        }
      }
      const count = s === 'winter' ? 115 : (s === 'night' ? 48 : (s === 'autumn' ? 52 : (s === 'spring' ? 46 : 36)));
      parts = Array.from({ length: count }, () => spawnPart(s, true));
    };
    const SEASON_FREQ = { night: 220, spring: 293.66, summer: 329.63, autumn: 440, winter: 493.88 };
    initSeason(curSeason, false);
    addEventListener('resize', () => moveSeasonInk($('#edSeasonBar button.on')));
    seasonBtns.forEach(b => {
      b.onclick = () => {
        initSeason(b.dataset.s, true);
        playCue(SEASON_FREQ[b.dataset.s] || 329.63, 2.2);
      };
    });

    // 16 张高清暗夜重绘图库与白昼原图无缝双向联动（保留素宣白昼与玄夜暗馆各自最完美的原生画作）
    const NIGHT_SITES = new Set(['gs', 'wm', 'hlw', 'hbs', 'xmt', 'bwg', 'sz', 'yls', 'ylh']);
    const syncThemeArt = dark => {
      // 1) 三幕吸顶翻页全幅主图 + 户部山辅图
      const actMap = [
        ['#skStage .sk-slide[data-act="0"] .sk-bg img', 'assets/img/night/act1_night.webp', 'assets/img/art/hero.webp'],
        ['#skStage .sk-slide[data-act="1"] .sk-bg img', 'assets/img/night/act2_night.webp', 'assets/img/art/xmt_c.webp'],
        ['#skStage .sk-slide[data-act="1"] .sk-inset-plate img', 'assets/img/night/hbs_night.webp', 'assets/img/art/hbs.webp'],
        ['#skStage .sk-slide[data-act="2"] .sk-bg img', 'assets/img/night/act3_night.webp', 'assets/img/ed/relics_full.jpg?v=2']
      ];
      actMap.forEach(([sel, nSrc, dSrc]) => {
        const im = $(sel);
        if (im) im.setAttribute('src', dark ? nSrc : dSrc);
      });
      // 2) 01 彭城七里长卷 9 处景点
      $$('#track .stop').forEach(el => {
        const id = el.dataset.id;
        const vg = $('.vg', el);
        if (vg && NIGHT_SITES.has(id)) {
          vg.style.backgroundImage = `url(${dark ? `assets/img/night/${id}_night.webp` : `assets/img/art/${id}.webp`})`;
        }
      });
      // 3) 02 九处彭城 9 处景点主封面（兼容传统 .sc5 与 V36 空灵 .iz-scene）
      $$('#sites .sc5').forEach(card => {
        const href = card.getAttribute('href') || '';
        const id = href.replace(/^#site-/, '') || (card.id || '').replace(/^site-/, '');
        const im = $('.im img', card);
        if (im && NIGHT_SITES.has(id)) {
          im.setAttribute('src', dark ? `assets/img/night/${id}_night.webp` : `assets/img/art/${id}.webp`);
        }
      });
      $$('#sites .iz-scene').forEach(sc => {
        const id = sc.dataset.id;
        const im = $('.iz-main img', sc);
        const bgIm = $('.iz-folio-bg img', sc);
        if (NIGHT_SITES.has(id)) {
          const src = dark ? `assets/img/night/${id}_night.webp` : `assets/img/art/${id}.webp`;
          if (im) im.setAttribute('src', src);
          if (bgIm) bgIm.setAttribute('src', src);
        }
      });
      const proBack = $('#edPrologue .iz-pro-back img');
      const proFront = $('#edPrologue .iz-pro-front img');
      if (proBack) proBack.setAttribute('src', dark ? 'assets/img/night/act1_night.webp' : 'assets/img/art/hero.webp');
      if (proFront) proFront.setAttribute('src', dark ? 'assets/img/night/ylh_night.webp' : 'assets/img/art/ylh.webp');
      // 4) 04 彭城手艺 4 项非遗黑漆底单品
      $$('#fy .fyc .im img').forEach(im => {
        if (!im.dataset.daySrc) im.dataset.daySrc = im.getAttribute('src') || '';
        const m = im.dataset.daySrc.match(/(fy_[a-z]+)/);
        if (m) {
          im.setAttribute('src', dark ? `assets/img/night/${m[1]}_night.webp` : im.dataset.daySrc);
        }
      });
      // 4B) 03 汉代三绝左栏保留真实龟山甬道与汉兵马俑原画（配 V32 暗室提灯聚光展窗，彻底去重！）
      // 4C) 同步拓印玄石/宣纸底色
      if (window.XZ_REPAINT_RUB) window.XZ_REPAINT_RUB();
      // 5) 详情页主图与上下站缩略图同步
      const dEl = $('#detail');
      if (dEl && !dEl.hidden) {
        const curId = (location.hash || '').replace(/^#site-/, '');
        const h5 = $('.h5img img', dEl);
        if (h5 && NIGHT_SITES.has(curId)) {
          h5.setAttribute('src', dark ? `assets/img/night/${curId}_night.webp` : `assets/img/art/${curId}.webp`);
        }
        $$('.dnext a', dEl).forEach(a => {
          const nid = (a.getAttribute('href') || '').replace(/^#site-/, '');
          const im = $('img', a);
          if (im && NIGHT_SITES.has(nid)) {
            im.setAttribute('src', dark ? `assets/img/night/${nid}_night.webp` : `assets/img/art/${nid}.webp`);
          }
        });
      }
    };
    syncThemeArt(document.documentElement.classList.contains('theme-obsidian'));
    // 长卷窗口缩放重排 & 02 九处彭城定时刷新状态时自动保持暗夜图同步
    const keepNightSynced = () => {
      if (document.documentElement.classList.contains('theme-obsidian')) syncThemeArt(true);
    };
    if ('MutationObserver' in window) {
      const trackEl = $('#track');
      if (trackEl) new MutationObserver(keepNightSynced).observe(trackEl, { childList: true });
      const sgridEl = $('#sgrid');
      if (sgridEl) new MutationObserver(keepNightSynced).observe(sgridEl, { childList: true });
    }
    if (window.XZ && XZ.on) {
      XZ.on('detail', () => requestAnimationFrame(() => syncThemeArt(document.documentElement.classList.contains('theme-obsidian'))));
    }

    // 顶栏「玄 · 夜 / 素 · 宣」一键双主题切换 + 圆形光幕涟漪 View Transition 转场
    const themeBtn = $('#navThemeBtn');
    if (themeBtn) {
      const applyThemeToggle = () => {
        const dark = document.documentElement.classList.toggle('theme-obsidian');
        themeBtn.setAttribute('aria-pressed', dark);
        themeBtn.dataset.tip = dark ? '玄夜 · 切素宣' : '素宣 · 切玄夜';
        const sp = $('span', themeBtn);
        if (sp) sp.textContent = dark ? '玄 · 夜' : '素 · 宣';
        syncThemeArt(dark);
        initSeason(dark ? 'night' : 'spring', true);
        dispatchEvent(new Event('scroll'));
        playCue(dark ? 220 : 369.99, 2.2);
      };
      themeBtn.onclick = () => {
        if (!RM && document.startViewTransition) {
          const r = themeBtn.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const maxR = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
          const vt = document.startViewTransition(applyThemeToggle);
          vt.ready.then(() => {
            document.documentElement.animate(
              { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${maxR.toFixed(0)}px at ${cx}px ${cy}px)`] },
              { duration: 680, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
            );
          }).catch(() => {});
        } else {
          applyThemeToggle();
        }
      };
    }

    // 琉璃卡片鼠标跟手微光（IZANAMI × SAKAZUKI 灵动透光边界）
    const glassSel = '.sc5, #sanjue .sjc, #sanjue .sjr, #sanjue .lfl li, #fy .fyc, #go .panel';
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target && e.target.closest ? e.target.closest(glassSel) : null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${(e.clientX - r.left).toFixed(1)}px`);
      card.style.setProperty('--gy', `${(e.clientY - r.top).toFixed(1)}px`);
    }, { passive: true });

    // 云龙山放鹤意象：4 只极简水墨远鹤/飞燕缓缓掠过城北与云龙湖上空
    const birds = [
      { x: W * 0.80, y: H * 0.21, vx: -0.46, sc: 1.15, ph: 0.0 },
      { x: W * 0.86, y: H * 0.25, vx: -0.40, sc: 0.88, ph: 1.8 },
      { x: W * 0.36, y: H * 0.16, vx: 0.36, sc: 0.78, ph: 3.1 },
      { x: W * 0.22, y: H * 0.64, vx: 0.52, sc: 0.72, ph: 4.5 }
    ];

    // 云龙湖面细碎日光微纹（左下湖域）
    const glints = Array.from({ length: 22 }, () => ({
      rx: 0.04 + Math.random() * 0.29,
      ry: 0.58 + Math.random() * 0.32,
      len: 12 + Math.random() * 20,
      ph: Math.random() * Math.PI * 2
    }));

    // 鼠标微风气流 + 湖面极细水波
    let mx = -999, my = -999, pmx = -999, pmy = -999, mvx = 0, mvy = 0;
    const lakeRipples = [];
    let lastRip = 0, heroVis = true, heroRaf = 0;
    const wakeHero = () => {
      if (heroVis && !heroRaf && !document.hidden && !document.body.classList.contains('ed-detail-open')) {
        heroRaf = requestAnimationFrame(drawFX);
      }
    };
    new IntersectionObserver(es => {
      heroVis = !!(es[0] && es[0].isIntersecting);
      if (heroVis) wakeHero();
    }).observe(heroEl);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) wakeHero(); });

    heroEl.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const rect = heroEl.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      if (pmx > -500) {
        mvx = Math.max(-16, Math.min(16, mx - pmx));
        mvy = Math.max(-16, Math.min(16, my - pmy));
      }
      pmx = mx; pmy = my;
      const now = performance.now();
      if (mx < W * 0.36 && my > H * 0.54 && now - lastRip > 120) {
        lastRip = now;
        lakeRipples.push({ x: mx, y: my, r: 4, maxR: 50 + Math.random() * 24, life: 1 });
        if (lakeRipples.length > 10) lakeRipples.shift();
      }
    }, { passive: true });
    heroEl.addEventListener('pointerleave', () => { mx = my = pmx = pmy = -999; mvx = mvy = 0; });

    const drawGinkgo = (sz, col, a) => {
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.strokeStyle = 'rgba(72, 46, 18, 0.58)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(0, sz * 0.55);
      ctx.quadraticCurveTo(-sz * 0.92, -sz * 0.04, -sz * 0.48, -sz * 0.68);
      ctx.quadraticCurveTo(-sz * 0.12, -sz * 0.54, 0, -sz * 0.32);
      ctx.quadraticCurveTo(sz * 0.12, -sz * 0.54, sz * 0.48, -sz * 0.68);
      ctx.quadraticCurveTo(sz * 0.92, -sz * 0.04, 0, sz * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, sz * 0.55);
      ctx.lineTo(0, sz * 0.96);
      ctx.stroke();
    };

    const drawMaple = (sz, col, a) => {
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.strokeStyle = 'rgba(68, 22, 14, 0.55)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, sz * 0.48);
      ctx.lineTo(-sz * 0.52, sz * 0.32);
      ctx.lineTo(-sz * 0.32, sz * 0.05);
      ctx.lineTo(-sz * 0.72, -sz * 0.16);
      ctx.lineTo(-sz * 0.24, -sz * 0.22);
      ctx.lineTo(0, -sz * 0.78);
      ctx.lineTo(sz * 0.24, -sz * 0.22);
      ctx.lineTo(sz * 0.72, -sz * 0.16);
      ctx.lineTo(sz * 0.32, sz * 0.05);
      ctx.lineTo(sz * 0.52, sz * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, sz * 0.48);
      ctx.lineTo(0, sz * 0.9);
      ctx.stroke();
    };

    const drawFX = t => {
      heroRaf = 0;
      if (!heroVis || document.hidden || document.body.classList.contains('ed-detail-open')) return;
      ctx.clearRect(0, 0, W, H);
      mvx *= 0.92; mvy *= 0.92;

      // 0. 暮夜模式下：故黄河远山极淡夜岚薄雾缓慢飘移 + 暖金灯火湖面微晕
      if (curSeason === 'night') {
        const drift1 = Math.sin(t * 0.00022) * W * 0.08;
        const mist1 = ctx.createRadialGradient(W * 0.56 + drift1, H * 0.27, 10, W * 0.56 + drift1, H * 0.27, W * 0.42);
        mist1.addColorStop(0, 'rgba(130, 166, 214, 0.09)');
        mist1.addColorStop(0.55, 'rgba(92, 128, 178, 0.035)');
        mist1.addColorStop(1, 'rgba(18, 21, 28, 0)');
        ctx.fillStyle = mist1;
        ctx.fillRect(0, 0, W, H * 0.55);

        const drift2 = Math.cos(t * 0.00028) * W * 0.05;
        const lakeGlow = ctx.createRadialGradient(W * 0.16 + drift2, H * 0.72, 10, W * 0.16 + drift2, H * 0.72, W * 0.28);
        lakeGlow.addColorStop(0, 'rgba(246, 198, 108, 0.085)');
        lakeGlow.addColorStop(0.55, 'rgba(226, 168, 84, 0.025)');
        lakeGlow.addColorStop(1, 'rgba(18, 21, 28, 0)');
        ctx.fillStyle = lakeGlow;
        ctx.fillRect(0, H * 0.45, W * 0.52, H * 0.55);
      }

      // 1. 云龙湖面微光水波（夜色呈暖金灯火倒影波纹）
      if (curSeason !== 'winter') {
        ctx.lineWidth = curSeason === 'night' ? 1.45 : 1.25;
        for (const g of glints) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.0024 + g.ph);
          const alpha = (curSeason === 'night' ? 0.52 : (curSeason === 'summer' ? 0.44 : 0.24)) * pulse;
          ctx.strokeStyle = curSeason === 'night'
            ? `rgba(246, 206, 126, ${alpha.toFixed(3)})`
            : (curSeason === 'autumn'
              ? `rgba(250, 226, 178, ${alpha.toFixed(3)})`
              : `rgba(255, 254, 248, ${alpha.toFixed(3)})`);
          const gx = g.rx * W + Math.sin(t * 0.0008 + g.ph) * 4;
          const gy = g.ry * H;
          ctx.beginPath();
          ctx.moveTo(gx - g.len * 0.5, gy);
          ctx.lineTo(gx + g.len * 0.5, gy);
          ctx.stroke();
        }
      }

      // 2. 湖面鼠标轻拂细水纹
      for (let i = lakeRipples.length - 1; i >= 0; i--) {
        const r = lakeRipples[i];
        r.r += (r.maxR - r.r) * 0.04;
        r.life -= 0.016;
        if (r.life <= 0) { lakeRipples.splice(i, 1); continue; }
        ctx.strokeStyle = curSeason === 'night'
          ? `rgba(244, 210, 140, ${(r.life * 0.34).toFixed(3)})`
          : `rgba(68, 96, 86, ${(r.life * 0.28).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. 极简水墨放鹤/飞燕掠影（白昼春夏秋出现，夜雪隐去）
      if (curSeason !== 'winter' && curSeason !== 'night') {
        ctx.save();
        ctx.strokeStyle = curSeason === 'autumn' ? 'rgba(62, 46, 34, 0.52)' : 'rgba(34, 42, 40, 0.50)';
        ctx.lineCap = 'round';
        for (const b of birds) {
          b.x += b.vx;
          if (b.vx < 0 && b.x < -60) b.x = W + 60;
          if (b.vx > 0 && b.x > W + 60) b.x = -60;
          const flap = Math.sin(t * 0.005 + b.ph) * 5.0 * b.sc;
          const by = b.y + Math.sin(t * 0.0014 + b.ph) * 7;
          const wing = 10.5 * b.sc;
          ctx.lineWidth = 1.35 * b.sc;
          ctx.beginPath();
          ctx.moveTo(b.x - wing, by - flap);
          ctx.quadraticCurveTo(b.x - wing * 0.4, by - 3.8 * b.sc - flap * 0.4, b.x, by);
          ctx.quadraticCurveTo(b.x + wing * 0.4, by - 3.8 * b.sc - flap * 0.4, b.x + wing, by - flap);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. 四时粒子 + 鼠标轻拂微风偏移（零逐粒渐变分配，10× 性能提升）
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const dx = p.x - mx, dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 22500 && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 150) * 0.48;
          p.wx += (mvx * 0.18 + (dx / dist) * 0.7) * force;
          p.wy += (mvy * 0.18 + (dy / dist) * 0.45) * force;
        }
        p.wx *= 0.93; p.wy *= 0.93;
        const sway = Math.sin(t * 0.0017 + p.ph) * (p.kind === 'ginkgo' || p.kind === 'maple' ? 0.72 : 0.4);
        p.x += p.vx + sway + p.wx;
        p.y += p.vy + p.wy;
        p.rot += p.vrot + p.wx * 0.024;

        if (p.kind === 'mote' || p.kind === 'lotus' || p.kind === 'lantern') {
          if (p.y < -24 || p.x > W + 50 || p.x < -50) Object.assign(p, spawnPart(curSeason, false));
        } else if (p.y > H + 34 || p.x > W + 70 || p.x < -90) {
          Object.assign(p, spawnPart(curSeason, false));
        }

        if (p.kind === 'lantern') {
          const flicker = 0.52 + 0.48 * Math.sin(t * 0.0036 + p.ph);
          const al = p.a * flicker;
          ctx.globalAlpha = al * 0.24;
          ctx.fillStyle = p.col;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = al;
          ctx.fillStyle = '#FFF6DA';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 0.85, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }
        if (p.kind === 'snow') {
          ctx.globalAlpha = p.a * 0.26;
          ctx.fillStyle = '#E8F0F8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 1.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = p.a;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 0.78, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.kind === 'petal' || p.kind === 'lotus') {
          ctx.rotate(p.rot);
          ctx.scale(1, 0.52 + 0.48 * Math.abs(Math.cos(p.rot * 0.7)));
          ctx.globalAlpha = p.a;
          ctx.fillStyle = p.kind === 'lotus' ? '#F3BFC2' : p.col;
          ctx.strokeStyle = 'rgba(138, 72, 70, 0.34)';
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.sz, p.sz * 0.54, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (p.kind === 'catkin') {
          ctx.globalAlpha = p.a;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = 'rgba(140, 140, 130, 0.3)';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.arc(0, 0, p.sz * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (p.kind === 'mote') {
          ctx.globalAlpha = p.a * (0.45 + 0.55 * Math.sin(t * 0.0032 + p.ph));
          ctx.fillStyle = '#FFF9DF';
          ctx.beginPath();
          ctx.arc(0, 0, p.sz, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'ginkgo') {
          ctx.rotate(p.rot);
          ctx.scale(1, 0.45 + 0.55 * Math.abs(Math.sin(t * 0.0022 + p.ph)));
          drawGinkgo(p.sz, p.col, p.a);
        } else if (p.kind === 'maple') {
          ctx.rotate(p.rot);
          ctx.scale(1, 0.5 + 0.5 * Math.abs(Math.cos(t * 0.002 + p.ph)));
          drawMaple(p.sz, p.col, p.a);
        }
        ctx.restore();
      }
      heroRaf = requestAnimationFrame(drawFX);
    };
    wakeHero();
  }

  /* ---------- 10. IZANAMI 全站文字基线浮现 + 1px 细线绘制 + 详情页幕帘转场 + 交通双Tab + 轻磁性触感 ---------- */
  function bindCraftReveals() {
    // 1) 全站大标题与章节标题包裹基线遮罩 (.cm-mask > .cm-line)
    const heads = $$('.sh5 h2, .chap .chh h3, .ed-interlude h3, .sk-strip-hd h3');
    heads.forEach(h => {
      if (h.dataset.cmMasked) return;
      h.dataset.cmMasked = '1';
      h.innerHTML = `<span class="cm-mask"><span class="cm-line">${h.innerHTML}</span></span>`;
    });

    const hairTargets = $$('#sites .sh5, #sanjue .sh5, #fy .sh5, #go .sh5, .chap:not(:first-child)');
    const imgCards = $$('.fyc, .sjc');

    if (RM || !('IntersectionObserver' in window)) {
      heads.forEach(h => h.classList.add('cm-in'));
      hairTargets.forEach(el => el.classList.add('cm-in'));
      imgCards.forEach(el => el.classList.add('cm-in'));
      return;
    }

    hairTargets.forEach(el => el.classList.add('cm-hair-wait'));
    imgCards.forEach(el => el.classList.add('cm-wait'));

    const cmIO = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('cm-wait');
          e.target.classList.add('cm-in');
          cmIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    [...heads, ...hairTargets, ...imgCards].forEach(el => cmIO.observe(el));
  }

  // 2) 景点详情页 (#detail) 电影级宣纸幕帘入场转场 + 微声呼应
  const detEl = $('#detail');
  if (detEl && 'MutationObserver' in window) {
    new MutationObserver(() => {
      if (!detEl.hidden) {
        detEl.classList.remove('cm-det-open');
        void detEl.offsetWidth;
        detEl.classList.add('cm-det-open');
        playCue(293.66, 2.4);
        setTimeout(() => playCue(440, 2.2), 110);
      } else {
        detEl.classList.remove('cm-det-open');
      }
    }).observe(detEl, { attributes: true, attributeFilter: ['hidden'] });
  }

  // 3) 05 彭城行旅路引 (#go) 双 Tab 滑动游标切换
  const goTabs = $$('#goTabs button');
  const goPanes = $$('#go .go-pane');
  const goInk = $('#goTabInk');
  const moveGoInk = btn => {
    if (!goInk || !btn) return;
    goInk.style.width = `${btn.offsetWidth}px`;
    goInk.style.transform = `translate3d(${btn.offsetLeft}px,0,0)`;
  };
  if (goTabs.length) {
    goTabs.forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.gtab;
        goTabs.forEach(b => {
          const on = b === btn;
          b.classList.toggle('on', on);
          b.setAttribute('aria-selected', on);
        });
        goPanes.forEach(p => p.classList.toggle('on', p.dataset.gpane === key));
        moveGoInk(btn);
        playCue(key === 'metro' ? 587.33 : 440, 1.5);
      };
    });
    requestAnimationFrame(() => moveGoInk($('#goTabs button.on')));
    addEventListener('resize', () => moveGoInk($('#goTabs button.on')));
  }

  // 4) 03 汉代三绝暗室暖金展柜聚光微晕跟随鼠标 (IZANAMI 物理光感)
  if (sj && FINE && !RM) {
    const spot = document.createElement('div');
    spot.className = 'sj-spot';
    spot.setAttribute('aria-hidden', 'true');
    sj.prepend(spot);
    let tx = 0.5, ty = 0.4, sx = 0.5, sy = 0.4, inSj = false, sjRaf = 0;
    const renderSpot = () => {
      sjRaf = 0;
      sx += (tx - sx) * 0.12;
      sy += (ty - sy) * 0.12;
      spot.style.background = `radial-gradient(560px circle at ${(sx * 100).toFixed(2)}% ${(sy * 100).toFixed(2)}%, rgba(200, 168, 107, 0.115), rgba(200, 168, 107, 0.032) 44%, transparent 74%)`;
      if (inSj || Math.abs(tx - sx) > 0.002 || Math.abs(ty - sy) > 0.002) {
        sjRaf = requestAnimationFrame(renderSpot);
      }
    };
    sj.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = sj.getBoundingClientRect();
      tx = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
      ty = Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(1, r.height)));
      inSj = true;
      if (!sjRaf) sjRaf = requestAnimationFrame(renderSpot);
    }, { passive: true });
    sj.addEventListener('pointerleave', () => { inSj = false; });
  }

  // 5) 仅在存在 #fy 时启用轻量滚动惯性（当前精简版无 #fy，零空转）
  if (FINE && !RM && $$('#fy .fyc .im').length) {
    let lastY = scrollY, vel = 0, velRaf = 0;
    const fyImgs = $$('#fy .fyc .im');
    const tickInertia = () => {
      velRaf = 0;
      vel *= 0.86;
      const lag = Math.max(-10, Math.min(10, vel * 0.16));
      fyImgs.forEach((el, idx) => {
        const dir = idx % 2 === 0 ? 1 : -0.7;
        el.style.transform = Math.abs(lag) < 0.08 ? '' : `translate3d(0,${(lag * dir).toFixed(2)}px,0)`;
      });
      if (Math.abs(vel) > 0.25) velRaf = requestAnimationFrame(tickInertia);
    };
    addEventListener('scroll', () => {
      const dy = scrollY - lastY;
      lastY = scrollY;
      vel = vel * 0.55 + Math.max(-60, Math.min(60, dy)) * 0.45;
      if (!velRaf) velRaf = requestAnimationFrame(tickInertia);
    }, { passive: true });
  }

  // 6) 极克制微磁性触感 (±3.5px 物理阻尼吸附，仅限桌面端精细指针)
  window.XZ_CUE = (f, d) => playCue(f, d);
  if (FINE && !RM) {
    const magSel = '.hero .cta .lnk, .nav-ico-btn, .ed-pins-toggle, .detail .v5bar .bk, .detail .pcbtn, #sanjue .rubact .b5, .sc-card .nav2 button';
    let magActive = null;
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const el = e.target && e.target.closest ? e.target.closest(magSel) : null;
      if (magActive && magActive !== el) {
        magActive.style.transform = '';
        magActive = null;
      }
      if (!el) return;
      magActive = el;
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / Math.max(1, r.width / 2)) * 3.5;
      const dy = ((e.clientY - (r.top + r.height / 2)) / Math.max(1, r.height / 2)) * 2.8;
      el.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => {
      if (magActive) { magActive.style.transform = ''; magActive = null; }
    });
  }

  /* ==========================================================================
     V31 旗舰策展光学与空间引擎：
     1) 全域极稀暗夜浮金尘埃画布（让全页滚到哪都有博物馆空气呼吸）
     2) 右侧极简悬浮「彭城纵轴标尺」(#edRail)
     3) Window Parallax 窗景微视差（±13px GPU 平移）
     4) 景点画幅 ±1.8° 3D 玻璃微倾角
     ========================================================================== */

  // V31-1: 全域极稀暗夜浮金尘埃（dpr=1 + 24fps 节流 + 详情页自动休眠，减少 4.5× GPU 像素填充）
  if (!RM) {
    const dustCv = document.createElement('canvas');
    dustCv.className = 'ed-ambient-dust';
    dustCv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dustCv);
    const dctx = dustCv.getContext('2d');
    let dW = 0, dH = 0;
    const dResize = () => {
      dW = innerWidth; dH = innerHeight;
      dustCv.width = dW; dustCv.height = dH;
    };
    dResize();
    addEventListener('resize', dResize);
    const motes = Array.from({ length: 22 }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 0.75 + Math.random() * 1.25,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -(0.12 + Math.random() * 0.30),
      a: 0.09 + Math.random() * 0.19,
      ph: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.62
    }));
    let lastDustT = 0;
    const drawDust = t => {
      if (!document.hidden && !document.body.classList.contains('ed-detail-open') && document.documentElement.classList.contains('theme-obsidian')) {
        if (t - lastDustT >= 42) {
          lastDustT = t;
          dctx.clearRect(0, 0, dW, dH);
          for (const m of motes) {
            m.x += m.vx + Math.sin(t * 0.0005 + m.ph) * 0.14;
            m.y += m.vy;
            if (m.y < -10) { m.y = dH + 10; m.x = Math.random() * dW; }
            if (m.x < -10) m.x = dW + 10;
            if (m.x > dW + 10) m.x = -10;
            const pulse = 0.55 + 0.45 * Math.sin(t * 0.0014 + m.ph);
            const al = m.a * pulse;
            dctx.fillStyle = m.gold
              ? `rgba(229, 202, 144, ${al.toFixed(3)})`
              : `rgba(232, 238, 252, ${(al * 0.85).toFixed(3)})`;
            dctx.beginPath();
            dctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
            dctx.fill();
          }
        }
      }
      requestAnimationFrame(drawDust);
    };
    requestAnimationFrame(drawDust);
  }

  // V31-2: 右侧极简悬浮「彭城纵轴标尺」(#edRail) — V36 精简空灵章节同步
  const railSecs = [
    ['top', '00', '开卷全景'],
    ['edPrologue', '01', '彭城序言'],
    ['sites', '02', '壹至玖景'],
    ['sanjue', '03', '汉代三绝'],
    ['go', '04', '行旅地铁'],
    ['epilogue', '05', '卷尾余韵']
  ];
  const rail = document.createElement('nav');
  rail.className = 'ed-rail';
  rail.id = 'edRail';
  rail.setAttribute('aria-label', '页面章节标尺');
  rail.innerHTML = railSecs.map(([id, no, name], i) =>
    `<button type="button" class="ed-rail-btn${i === 0 ? ' on' : ''}" data-target="${id}" aria-label="前往 ${no} ${name}"><span class="ed-rail-lbl"><em>${no}</em>${name}</span><span class="ed-rail-tick"><i></i></span></button>`
  ).join('');
  document.body.appendChild(rail);
  const railBtns = $$('.ed-rail-btn', rail);
  const railFreqs = [220, 261.63, 293.66, 329.63, 392, 440];
  railBtns.forEach((btn, idx) => {
    btn.onclick = () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      playCue(railFreqs[idx] || 329.63, 1.5);
    };
  });
  const railTargets = railSecs.map(([id]) => document.getElementById(id));
  const navLinks = $$('.nav .links a');
  let railRaf = 0, lastActiveIdx = -1;
  const syncRail = () => {
    railRaf = 0;
    const mid = scrollY + innerHeight * 0.42;
    let activeIdx = 0;
    for (let i = 0; i < railTargets.length; i++) {
      const el = railTargets[i];
      if (el && el.offsetTop <= mid) activeIdx = i;
    }
    if (activeIdx === lastActiveIdx) return;
    const prevIdx = lastActiveIdx;
    lastActiveIdx = activeIdx;
    if (prevIdx >= 0) playCue(railFreqs[activeIdx] || 329.63, 2.2);
    railBtns.forEach((b, i) => b.classList.toggle('on', i === activeIdx));
    const activeId = railSecs[activeIdx] ? railSecs[activeIdx][0] : 'top';
    const navHash = (activeId === 'sites' || activeId === 'sanjue' || activeId === 'go') ? ('#' + activeId) : '';
    navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === navHash));
  };
  addEventListener('scroll', () => { if (!railRaf) railRaf = requestAnimationFrame(syncRail); }, { passive: true });
  syncRail();

  // V31-3: Window Parallax 窗景微视差（缓存节点，无旧版 .sc5 时零 DOM 遍历）
  const wpImgs = $$('#sites .sc5 .im img, #sanjue .sjc .im img');
  if (!RM && wpImgs.length) {
    let wpRaf = 0;
    const updateWindowParallax = () => {
      wpRaf = 0;
      const vh = innerHeight;
      const rects = wpImgs.map(img => img.parentElement ? img.parentElement.getBoundingClientRect() : null);
      for (let i = 0; i < wpImgs.length; i++) {
        const r = rects[i];
        if (!r || r.bottom < -40 || r.top > vh + 40) continue;
        const p = (r.top + r.height * 0.5) / vh - 0.5;
        const shift = Math.max(-13, Math.min(13, p * -24));
        wpImgs[i].style.setProperty('--wp-y', `${shift.toFixed(1)}px`);
      }
    };
    addEventListener('scroll', () => {
      if (!wpRaf) wpRaf = requestAnimationFrame(updateWindowParallax);
    }, { passive: true });
    updateWindowParallax();
  }

  // V31-4: 02 九处彭城画幅 ±1.8° 极克制 3D 实体玻璃画框微倾角
  if (FINE && !RM) {
    let tiltCard = null;
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !document.documentElement.classList.contains('theme-obsidian')) return;
      const card = e.target && e.target.closest ? e.target.closest('#sites .cgrid .sc5') : null;
      if (tiltCard && tiltCard !== card) {
        tiltCard.style.transform = '';
        tiltCard.classList.remove('ed-tilt');
        tiltCard = null;
      }
      if (!card) return;
      tiltCard = card;
      card.classList.add('ed-tilt');
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
      const ny = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
      const rx = (-ny * 3.4).toFixed(2);
      const ry = (nx * 3.4).toFixed(2);
      card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => {
      if (tiltCard) {
        tiltCard.style.transform = '';
        tiltCard.classList.remove('ed-tilt');
        tiltCard = null;
      }
    });
  }

  // V32-1: 03 汉代三绝「暗室提灯窥甬道 / 聚光阅军阵」真实原画互动展窗（兼容 V38 空灵无框版）
  const sjCards = $$('#sanjue .sjc');
  const sjCues = ['移动光标 · 提灯窥甬道', '移动光标 · 聚光阅军阵'];
  sjCards.forEach((card, idx) => {
    const box = $('.im', card);
    if (!box || $('.sj-lantern-veil', box)) return;
    const veil = document.createElement('div');
    veil.className = 'sj-lantern-veil';
    veil.setAttribute('aria-hidden', 'true');
    const cue = document.createElement('span');
    cue.className = 'sj-lantern-cue';
    cue.innerHTML = `<i aria-hidden="true"></i>${sjCues[idx] || '移动光标 · 提灯赏珍'}`;
    box.appendChild(veil);
    box.appendChild(cue);
    let hovering = false;
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      hovering = true;
      const r = box.getBoundingClientRect();
      const px = Math.max(0, Math.min(100, ((e.clientX - r.left) / Math.max(1, r.width)) * 100));
      const py = Math.max(0, Math.min(100, ((e.clientY - r.top) / Math.max(1, r.height)) * 100));
      veil.style.setProperty('--lx', `${px.toFixed(1)}%`);
      veil.style.setProperty('--ly', `${py.toFixed(1)}%`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => { hovering = false; });
    // 未悬停时：仅在进入视口时极缓慢柔和地巡检微光（离屏自动完全休眠）
    if (!RM) {
      let cardInView = false, swRaf = 0;
      const autoSweep = t => {
        swRaf = 0;
        if (!cardInView || document.hidden || document.body.classList.contains('ed-detail-open')) return;
        if (!hovering && document.documentElement.classList.contains('theme-obsidian')) {
          const ph = t * 0.00055 + idx * 1.9;
          const ax = 50 + Math.sin(ph) * 26;
          const ay = 48 + Math.cos(ph * 0.72) * 18;
          veil.style.setProperty('--lx', `${ax.toFixed(1)}%`);
          veil.style.setProperty('--ly', `${ay.toFixed(1)}%`);
        }
        swRaf = requestAnimationFrame(autoSweep);
      };
      new IntersectionObserver(es => {
        cardInView = !!(es[0] && es[0].isIntersecting);
        if (cardInView && !swRaf) swRaf = requestAnimationFrame(autoSweep);
      }, { rootMargin: '60px 0px' }).observe(card);
    }
  });

  // V55 性能引擎：全面交还浏览器原生合成器线程滚轮（120Hz 硬件直出，彻底消除 JS 滚轮劫持卡顿）

  /* ==========================================================================
     V37 流光换景 × 大视差叠画 × 电影级动效引擎 (IZANAMI Kinetic Engine)
     1) #edAmbientBg 清晰双缓冲换景 + 120fps 跟手滚动推镜/平移 + 非对称光影遮罩 + 每景专属色晕
     2) .iz-prologue & 9 处 .iz-scene 幕帘揭幕 (.iz-vis) + 连续视口焦点景深 (.is-focus)
     3) 主夜画与汉画像石拓本 110px+ 大幅度反向悬浮视差 + 鼠标 3D 景深偏移
     4) 左下角机械滚轮景别指示器 (#izSceneHud) 随换景实时翻滚
     ========================================================================== */
  const ambWrap = $('#edAmbientBg');
  const ambStage = $('#edAmbStage');
  const ambAura = $('#edAmbAura');
  const ambA = ambWrap ? $('.ed-amb-a', ambWrap) : null;
  const ambB = ambWrap ? $('.ed-amb-b', ambWrap) : null;
  const hudEl = $('#izSceneHud');
  const hudNo = $('#izHudNo');
  const hudName = $('#izHudName');
  const hudSep = hudEl ? $('.iz-hud-sep', hudEl) : null;

  let ambActive = ambA;
  let ambCurSrc = ambA ? (ambA.getAttribute('src') || '') : '';
  let ambReqId = 0;
  let lastHudKey = '';
  let lastSide = '';

  const resolveAmbSrc = raw => {
    if (!raw) return '';
    if (document.documentElement.classList.contains('theme-obsidian')) return raw;
    const m = raw.match(/assets\/img\/night\/([a-z0-9]+)_night\.webp/i);
    if (m && m[1] !== 'act1' && m[1] !== 'act2' && m[1] !== 'act3') {
      return `assets/img/art/${m[1]}.webp`;
    }
    return raw.replace('assets/img/night/act1_night.webp', 'assets/img/art/hero.webp');
  };

  const swapAmb = nextSrc => {
    if (!ambA || !ambB || !nextSrc || nextSrc === ambCurSrc) return;
    ambCurSrc = nextSrc;
    const token = ++ambReqId;
    const nextImg = ambActive === ambA ? ambB : ambA;
    const prevImg = ambActive;
    const loader = new Image();
    loader.onload = () => {
      if (token !== ambReqId) return;
      nextImg.src = nextSrc;
      // 强制触发缩放回拉过渡
      nextImg.classList.remove('on');
      void nextImg.offsetWidth;
      requestAnimationFrame(() => {
        nextImg.classList.add('on');
        prevImg.classList.remove('on');
        ambActive = nextImg;
        dispatchEvent(new CustomEvent('iz-amb-swap'));
      });
    };
    loader.src = nextSrc;
  };

  const syncHudAndMood = el => {
    if (!el) return;
    const side = el.dataset.ambSide || 'center';
    if (side !== lastSide) {
      lastSide = side;
      document.body.classList.remove('iz-amb-side-left', 'iz-amb-side-right', 'iz-amb-side-center');
      document.body.classList.add('iz-amb-side-' + side);
    }
    if (ambAura && el.dataset.ambTint) {
      ambAura.style.setProperty('--amb-tint', el.dataset.ambTint);
    }
    if (hudEl && hudNo && hudName) {
      const no = el.dataset.hudNo || '';
      const nm = el.dataset.hudName || '';
      const key = no + '|' + nm;
      if (no && key !== lastHudKey) {
        lastHudKey = key;
        hudNo.textContent = no;
        hudName.textContent = nm;
        if (hudSep) hudSep.style.display = /^\d{2}$/.test(no) ? '' : 'none';
        hudEl.classList.remove('flip');
        void hudEl.offsetWidth;
        hudEl.classList.add('flip');
      }
    }
  };

  const izNodes = $$('.iz-prologue, .iz-scene');
  if (izNodes.length) {
    if (RM || !('IntersectionObserver' in window)) {
      izNodes.forEach(n => n.classList.add('iz-vis', 'is-focus'));
    } else {
      document.documentElement.classList.add('iz-motion-ready');
      const izIO = new IntersectionObserver(es => {
        es.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('iz-vis');
            izIO.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
      izNodes.forEach(n => izIO.observe(n));
    }
  }

  const cachedAmbEls = $$('[data-amb]');
  const cachedFolios = $$('#sites .iz-folio');
  const cachedProNodes = izNodes.filter(el => !el.classList.contains('iz-folio'));
  const cachedGoEl = $('#go');

  let izRaf = 0;
  const updateIzEthereal = () => {
    izRaf = 0;
    if (document.body.classList.contains('ed-detail-open')) return;
    const vh = innerHeight || 900;
    const sy = scrollY;
    const desktop = innerWidth > 980;
    const mid = vh * 0.5;

    /* ---- 统一读取阶段 (Single Read Pass · 零强制重排 Layout Thrashing) ---- */
    const goRect = cachedGoEl ? cachedGoEl.getBoundingClientRect() : null;
    const ambRects = cachedAmbEls.map(el => el.getBoundingClientRect());
    const folioRects = (desktop && !RM) ? cachedFolios.map(fl => fl.getBoundingClientRect()) : [];
    const proRects = !RM ? cachedProNodes.map(el => el.getBoundingClientRect()) : [];

    /* ---- 统一写入阶段 (Single Write Pass) ---- */
    document.body.classList.toggle('iz-amb-on', sy > vh * 0.34);
    if (goRect) {
      document.body.classList.toggle('iz-in-go', goRect.top < vh * 0.6 && goRect.bottom > vh * 0.25);
    }

    // 1) 寻找最贴近视口中轴的 [data-amb] 章节并无缝换景
    let bestIdx = -1, bestDist = Infinity, folioCoversAll = false;
    for (let i = 0; i < cachedAmbEls.length; i++) {
      const el = cachedAmbEls[i];
      const r = ambRects[i];
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
      if (el.classList.contains('iz-folio')) {
        if (r.top <= 72 && r.bottom >= vh - 8) folioCoversAll = true;
        if (r.top <= vh * 0.45 && r.bottom >= vh * 0.52) {
          bestIdx = i;
          bestDist = -1;
        }
        continue;
      }
      if (bestDist < 0) continue;
      const c = r.top + r.height * 0.5;
      const d = Math.abs(c - mid);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    // 当九景不透明吸顶页完全覆盖视口时隐藏底层固定大背景，节省整屏 GPU 合成带宽
    document.body.classList.toggle('iz-folios-cover', folioCoversAll);

    if (bestIdx >= 0 && ambWrap && sy > vh * 0.22) {
      const bestEl = cachedAmbEls[bestIdx];
      if (!folioCoversAll) swapAmb(resolveAmbSrc(bestEl.dataset.amb));
      syncHudAndMood(bestEl);
      if (ambStage && !RM && !folioCoversAll) {
        const br = ambRects[bestIdx];
        const localP = Math.max(-1, Math.min(1, ((br.top + br.height * 0.5) - mid) / Math.max(vh * 0.65, br.height * 0.6)));
        const ambY = localP * -52;
        const ambX = Math.sin(sy * 0.0014) * 16;
        const ambSc = 1.05 + (1 - Math.abs(localP)) * 0.075;
        ambStage.style.setProperty('--amb-y', `${ambY.toFixed(1)}px`);
        ambStage.style.setProperty('--amb-x', `${ambX.toFixed(1)}px`);
        ambStage.style.setProperty('--amb-sc', ambSc.toFixed(4));
      }
    }

    // 2) 九景吸顶叠页视差 + 自动休眠已被完全覆盖或尚未入屏的叠页（最多只合成 1–2 层！）
    if (!RM) {
      if (desktop && cachedFolios.length) {
        for (let idx = 0; idx < cachedFolios.length; idx++) {
          const fl = cachedFolios[idx];
          const fr = folioRects[idx];
          const nextRect = idx + 1 < cachedFolios.length ? folioRects[idx + 1] : null;
          let coverP = 0;
          if (nextRect) {
            coverP = Math.max(0, Math.min(1, (vh - nextRect.top) / Math.max(1, vh - 64)));
          }
          // 已被下一景完全盖住（coverP >= 0.99）或仍在视口下方 120px 外，立即裁切休眠零绘制
          const isOff = coverP >= 0.99 || fr.top > vh + 120 || fr.bottom < -120;
          fl.classList.toggle('iz-off', isOff);
          if (isOff) continue;

          fl.style.setProperty('--folio-sc', (1 - coverP * 0.055).toFixed(4));
          fl.style.setProperty('--folio-y', `${(-coverP * 38).toFixed(1)}px`);
          fl.style.setProperty('--folio-op', (1 - coverP * 0.72).toFixed(3));
          fl.classList.toggle('is-focus', coverP < 0.45 && fr.top <= vh * 0.55);

          const enterP = Math.max(-1, Math.min(1, (fr.top - 64) / Math.max(1, vh * 0.85)));
          fl.style.setProperty('--iz-p1', `${(enterP * -24).toFixed(1)}px`);
          fl.style.setProperty('--iz-pv', `${(enterP * 32).toFixed(1)}px`);
          fl.style.setProperty('--iz-img-sc', (1.03 + Math.abs(enterP) * 0.08).toFixed(4));
          fl.style.setProperty('--iz-img-y', `${(enterP * -18).toFixed(1)}px`);
          fl.style.setProperty('--fbg-y', `${(enterP * -36 + coverP * -24).toFixed(1)}px`);
          fl.style.setProperty('--fbg-sc', (1.05 + (1 - Math.abs(enterP)) * 0.05 - coverP * 0.025).toFixed(4));
        }
      }

      for (let i = 0; i < cachedProNodes.length; i++) {
        const el = cachedProNodes[i];
        const r = proRects[i];
        if (r.bottom < -160 || r.top > vh + 160) continue;
        const center = r.top + r.height * 0.5;
        const p = Math.max(-1, Math.min(1, (center - mid) / (vh * 0.68)));
        if (desktop) {
          const isPro = el.classList.contains('iz-prologue');
          el.style.setProperty('--iz-p1', `${(p * (isPro ? -32 : -26)).toFixed(1)}px`);
          el.style.setProperty('--iz-pv', `${(p * 36).toFixed(1)}px`);
          el.style.setProperty('--iz-img-sc', (1.03 + Math.abs(p) * 0.09).toFixed(4));
          el.style.setProperty('--iz-img-y', `${(p * -16).toFixed(1)}px`);
        }
      }
    }
  };
  addEventListener('scroll', () => {
    if (!izRaf) izRaf = requestAnimationFrame(updateIzEthereal);
  }, { passive: true });
  updateIzEthereal();

  // 3) V57：移除悬停瞬移偏移 (--iz-mx1/my1)，确保九景主画在滑动与鼠标悬停透视石刻时端正稳固、绝不跳动

  /* 初始化 */
  bindReveal();
  bindCraftReveals();
})();
