/* ==========================================================================
   汉韵彭城 · V40 精细东方空灵交互特效引擎 (Ethereal FX Engine)
   1. 全站「香烟流光 · 墨雾游丝」鼠标流体尾迹 + 点击水波涟漪 (#izInkTrail)
   2. 序言独幅巨卷「拂灯照夜 × 湖面波光 × 3D 挂轴微倾」活画特效 (#izProLiveCv)
   3. 九景主画「时光透视镜 · 夜色显古石拓片」光学穿透镜 (.iz-xray-layer)
   4. 挂轴滚轮惯性微倾 (Kinetic Skew) × 换景水墨轻岚 (#izMistSweep)
   ========================================================================== */
(function () {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (RM) return;

  /* ---------- 1. 全站「香烟流光 · 墨雾游丝」鼠标流体尾迹 & 点击涟漪 ---------- */
  if (FINE) {
    const cv = document.createElement('canvas');
    cv.className = 'iz-ink-trail';
    cv.id = 'izInkTrail';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W = innerWidth, H = innerHeight, dpr = 1;
    const resize = () => {
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    const trail = [];   // {x, y, vx, vy, life}
    const motes = [];   // {x, y, vx, vy, r, life, maxLife, ph}
    const ripples = []; // {x, y, life}
    let lastX = -999, lastY = -999, distAcc = 0, running = false;

    const wake = () => {
      if (!running) {
        running = true;
        requestAnimationFrame(tickTrail);
      }
    };

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      if (document.body.classList.contains('ed-detail-open')) return;
      const x = e.clientX, y = e.clientY;
      const dx = lastX > -500 ? x - lastX : 0;
      const dy = lastY > -500 ? y - lastY : 0;
      const step = Math.hypot(dx, dy);
      if (step < 1.5 && trail.length) return;
      lastX = x; lastY = y;

      trail.push({
        x, y,
        vx: dx * 0.025 + (Math.random() - 0.5) * 0.14,
        vy: dy * 0.015 - 0.22 - Math.random() * 0.18, // 如焚香轻烟缓缓上升
        life: 1
      });
      if (trail.length > 26) trail.shift();

      distAcc += step;
      if (distAcc > 32) {
        distAcc = 0;
        motes.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.35 + dx * 0.02,
          vy: -(0.35 + Math.random() * 0.55),
          r: 0.9 + Math.random() * 1.15,
          life: 1,
          ph: Math.random() * 6.28
        });
        if (motes.length > 28) motes.shift();
      }
      wake();
    }, { passive: true });

    document.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest('input, select, textarea, #pcMapWrap, #rub')) return;
      ripples.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (ripples.length > 6) ripples.shift();
      wake();
    }, { passive: true });

    function tickTrail(t) {
      ctx.clearRect(0, 0, W, H);
      const dark = document.documentElement.classList.contains('theme-obsidian');

      // 更新并绘制双层青墨烟岚 + 流金游丝
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx + Math.sin(t * 0.002 + i * 0.5) * 0.16;
        p.y += p.vy;
        p.vx *= 0.96;
        p.life -= 0.024;
        if (p.life <= 0) trail.splice(i, 1);
      }

      if (trail.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // 外层：青墨轻烟丝雾
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1], b = trail[i];
          const k = Math.min(a.life, b.life);
          ctx.strokeStyle = dark
            ? `rgba(164, 186, 214, ${(k * 0.085).toFixed(3)})`
            : `rgba(82, 70, 56, ${(k * 0.055).toFixed(3)})`;
          ctx.lineWidth = (1 - k) * 14 + 3.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // 内层：极细古泥金飞白游丝
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1], b = trail[i];
          const k = Math.min(a.life, b.life);
          ctx.strokeStyle = dark
            ? `rgba(236, 206, 146, ${(k * 0.34).toFixed(3)})`
            : `rgba(158, 42, 34, ${(k * 0.24).toFixed(3)})`;
          ctx.lineWidth = Math.max(0.35, k * 1.15);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 飘散流金微尘
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.x += m.vx + Math.sin(t * 0.003 + m.ph) * 0.22;
        m.y += m.vy;
        m.life -= 0.018;
        if (m.life <= 0) { motes.splice(i, 1); continue; }
        ctx.save();
        ctx.fillStyle = dark
          ? `rgba(244, 214, 152, ${(m.life * 0.62).toFixed(3)})`
          : `rgba(158, 42, 34, ${(m.life * 0.42).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * (0.5 + m.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 点击水波涟漪（双同心椭圆细纹）
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.life -= 0.018;
        if (rp.life <= 0) { ripples.splice(i, 1); continue; }
        const prog = 1 - rp.life;
        const ease = 1 - Math.pow(1 - prog, 3);
        const r1 = 8 + ease * 68;
        const r2 = 4 + ease * 42;
        ctx.save();
        ctx.strokeStyle = dark
          ? `rgba(234, 204, 146, ${(rp.life * 0.36).toFixed(3)})`
          : `rgba(158, 42, 34, ${(rp.life * 0.28).toFixed(3)})`;
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, r1, r1 * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = dark
          ? `rgba(240, 246, 255, ${(rp.life * 0.22).toFixed(3)})`
          : `rgba(60, 52, 44, ${(rp.life * 0.16).toFixed(3)})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, r2, r2 * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (trail.length || motes.length || ripples.length) {
        requestAnimationFrame(tickTrail);
      } else {
        running = false;
      }
    }
  }

  /* ---------- 2. 序言独幅巨卷「拂灯照夜 × 湖面波光 × 3D 挂轴微倾」 ---------- */
  const proPlate = $('#izProPlate');
  const proCv = $('#izProLiveCv');
  if (proPlate && proCv) {
    const pctx = proCv.getContext('2d');
    let pW = 480, pH = 600, pDpr = 1;
    const pResize = () => {
      const r = proPlate.getBoundingClientRect();
      pW = Math.max(200, r.width);
      pH = Math.max(240, r.height);
      proCv.width = pW * pDpr;
      proCv.height = pH * pDpr;
      pctx.setTransform(pDpr, 0, 0, pDpr, 0, 0);
    };
    pResize();
    addEventListener('resize', pResize);

    // 河面暖金波光微纹 + 轻升灯笼流萤
    const glints = Array.from({ length: 26 }, () => ({
      rx: 0.08 + Math.random() * 0.84,
      ry: 0.56 + Math.random() * 0.38,
      len: 10 + Math.random() * 20,
      ph: Math.random() * 6.28
    }));
    const flies = Array.from({ length: 14 }, () => ({
      x: Math.random(),
      y: 0.35 + Math.random() * 0.58,
      vy: 0.00025 + Math.random() * 0.00035,
      r: 1.1 + Math.random() * 1.4,
      ph: Math.random() * 6.28
    }));
    const wRipples = [];

    let hover = false, inView = false, proRaf = 0;
    let tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5, lightA = 0;
    let trx = 0, try_ = 0, crx = 0, cry = 0, lastWRip = 0;

    const wakePro = () => {
      if (inView && !proRaf && !document.hidden && !document.body.classList.contains('ed-detail-open')) {
        proRaf = requestAnimationFrame(drawProLive);
      }
    };
    new IntersectionObserver(es => {
      inView = !!(es[0] && es[0].isIntersecting);
      if (inView) wakePro();
    }, { rootMargin: '80px 0px' }).observe(proPlate);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) wakePro(); });

    if (FINE) {
      proPlate.addEventListener('pointerenter', () => {
        hover = true;
        proPlate.classList.add('is-hover');
        wakePro();
      });
      proPlate.addEventListener('pointerleave', () => {
        hover = false;
        trx = 0; try_ = 0;
        proPlate.classList.remove('is-hover');
      });
      proPlate.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = proPlate.getBoundingClientRect();
        tx = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
        ty = Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(1, r.height)));
        trx = (0.5 - ty) * 4.6;
        try_ = (tx - 0.5) * 4.6;
        const now = performance.now();
        // 滑过下方水域时漾开暖金湖面涟漪
        if (ty > 0.52 && now - lastWRip > 110) {
          lastWRip = now;
          wRipples.push({ x: tx * pW, y: ty * pH, r: 4, maxR: 46 + Math.random() * 22, life: 1 });
          if (wRipples.length > 9) wRipples.shift();
        }
      }, { passive: true });
    }

    function drawProLive(t) {
      proRaf = 0;
      if (!inView || document.hidden || document.body.classList.contains('ed-detail-open')) return;
      pctx.clearRect(0, 0, pW, pH);
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      lightA += ((hover ? 1 : 0) - lightA) * 0.08;
      crx += (trx - crx) * 0.1;
      cry += (try_ - cry) * 0.1;
      proPlate.style.setProperty('--pro-rx', `${crx.toFixed(2)}deg`);
      proPlate.style.setProperty('--pro-ry', `${cry.toFixed(2)}deg`);

      const dark = document.documentElement.classList.contains('theme-obsidian');
      if (dark) {
        // 1) 右上满月月华呼吸微晕
        const mp = 0.55 + 0.45 * Math.sin(t * 0.0014);
        const mg = pctx.createRadialGradient(pW * 0.88, pH * 0.10, 4, pW * 0.88, pH * 0.10, pW * 0.28);
        mg.addColorStop(0, `rgba(255, 240, 198, ${(0.18 * mp).toFixed(3)})`);
        mg.addColorStop(0.5, `rgba(220, 206, 174, ${(0.06 * mp).toFixed(3)})`);
        mg.addColorStop(1, 'rgba(220, 206, 174, 0)');
        pctx.fillStyle = mg;
        pctx.fillRect(0, 0, pW, pH * 0.45);

        // 2) 下方河面灯火细碎波光
        pctx.lineWidth = 1.25;
        for (const g of glints) {
          const pulse = 0.45 + 0.55 * Math.sin(t * 0.0026 + g.ph);
          pctx.strokeStyle = `rgba(248, 208, 128, ${(0.34 * pulse).toFixed(3)})`;
          const gx = g.rx * pW + Math.sin(t * 0.001 + g.ph) * 3.5;
          const gy = g.ry * pH;
          pctx.beginPath();
          pctx.moveTo(gx - g.len * 0.5, gy);
          pctx.lineTo(gx + g.len * 0.5, gy);
          pctx.stroke();
        }

        // 3) 极细暖金灯火流萤缓升（零渐变对象分配，轻量化双层柔光）
        for (const f of flies) {
          f.y -= f.vy;
          if (f.y < 0.08) { f.y = 0.92; f.x = 0.1 + Math.random() * 0.8; }
          const fx = f.x * pW + Math.sin(t * 0.0016 + f.ph) * 9;
          const fy = f.y * pH;
          const al = (0.35 + 0.45 * Math.sin(t * 0.0032 + f.ph));
          pctx.fillStyle = `rgba(238, 192, 108, ${(al * 0.26).toFixed(3)})`;
          pctx.beginPath();
          pctx.arc(fx, fy, f.r * 2.8, 0, Math.PI * 2);
          pctx.fill();
          pctx.fillStyle = `rgba(255, 244, 212, ${al.toFixed(3)})`;
          pctx.beginPath();
          pctx.arc(fx, fy, f.r * 0.9, 0, Math.PI * 2);
          pctx.fill();
        }
      }

      // 4) 鼠标拨水生澜（透视压扁的暖金水波）
      for (let i = wRipples.length - 1; i >= 0; i--) {
        const r = wRipples[i];
        r.r += (r.maxR - r.r) * 0.045;
        r.life -= 0.017;
        if (r.life <= 0) { wRipples.splice(i, 1); continue; }
        pctx.strokeStyle = `rgba(246, 214, 146, ${(r.life * 0.48).toFixed(3)})`;
        pctx.lineWidth = 1.1;
        pctx.beginPath();
        pctx.ellipse(r.x, r.y, r.r, r.r * 0.32, 0, 0, Math.PI * 2);
        pctx.stroke();
      }

      // 5) 拂灯照夜暖金光晕
      if (lightA > 0.01) {
        pctx.save();
        pctx.globalCompositeOperation = 'screen';
        const lx = cx * pW, ly = cy * pH;
        const lg = pctx.createRadialGradient(lx, ly, 6, lx, ly, Math.min(pW, pH) * 0.42);
        lg.addColorStop(0, `rgba(255, 228, 166, ${(0.24 * lightA).toFixed(3)})`);
        lg.addColorStop(0.45, `rgba(232, 182, 102, ${(0.10 * lightA).toFixed(3)})`);
        lg.addColorStop(1, 'rgba(232, 182, 102, 0)');
        pctx.fillStyle = lg;
        pctx.fillRect(0, 0, pW, pH);
        pctx.restore();
      }
      proRaf = requestAnimationFrame(drawProLive);
    }
  }

  /* ---------- 3. 九景主画「时光透视镜 · 夜色显古石拓片」 ---------- */
  if (FINE) {
    const scenes = $$('#sites .iz-scene');
    scenes.forEach(sc => {
      const id = sc.dataset.id;
      const main = $('.iz-main', sc);
      if (!id || !main || $('.iz-xray-layer', main)) return;

      const layer = document.createElement('div');
      layer.className = 'iz-xray-layer';
      layer.innerHTML = `<img src="assets/img/rub/${id}.webp" alt="" aria-hidden="true" loading="lazy">`;
      const ring = document.createElement('div');
      ring.className = 'iz-xray-ring';
      ring.setAttribute('aria-hidden', 'true');
      ring.innerHTML = '<span>时光显影 · 石刻拓本</span>';
      const cue = document.createElement('span');
      cue.className = 'iz-xray-cue';
      cue.setAttribute('aria-hidden', 'true');
      cue.textContent = '✦ 轻拂画幅 · 透视古石刻痕';
      main.append(layer, ring, cue);

      let on = false, raf = 0;
      let tx = 0, ty = 0, cx = 0, cy = 0, rad = 0, tRad = 0;

      const stepLens = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        rad += (tRad - rad) * 0.14;
        main.style.setProperty('--xr-x', `${cx.toFixed(1)}px`);
        main.style.setProperty('--xr-y', `${cy.toFixed(1)}px`);
        main.style.setProperty('--xr-r', `${rad.toFixed(1)}px`);
        if (on || rad > 0.6 || Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
          raf = requestAnimationFrame(stepLens);
        } else {
          raf = 0;
        }
      };

      main.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        const r = main.getBoundingClientRect();
        tx = cx = e.clientX - r.left;
        ty = cy = e.clientY - r.top;
        on = true; tRad = 114;
        main.classList.add('xr-on');
        if (!raf) raf = requestAnimationFrame(stepLens);
      });
      main.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = main.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        if (!on) { on = true; tRad = 114; main.classList.add('xr-on'); }
        if (!raf) raf = requestAnimationFrame(stepLens);
      }, { passive: true });
      main.addEventListener('pointerleave', () => {
        on = false; tRad = 0;
        main.classList.remove('xr-on');
        if (!raf) raf = requestAnimationFrame(stepLens);
      });
    });
  }

  /* ---------- 4. 换景水墨轻岚（V57 已去除画幅滚动扭斜 skewY，保持画幅端正稳重、零晃动） ---------- */

  const mistEl = $('#izMistSweep');
  if (mistEl) {
    addEventListener('iz-amb-swap', () => {
      mistEl.classList.remove('run');
      void mistEl.offsetWidth;
      mistEl.classList.add('run');
    });
  }
})();
