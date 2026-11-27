/* ==========================================================================
   汉韵彭城 · V45 景点详情页全维互动增强套件 (Detail Plus Suite)
   1. 昼夜 / 石刻拓本双境对比拉帘 (Before/After Interactive Slider)
   2. 实景语音导览播放器 + 场景声景伴奏 (SpeechSynthesis + Web Audio)
   3. 3D 数字藏品展柜挂载 (bwg / gs / sz) + 一景一绝活微交互 (xmt / yls / wm / hbs / hlw / ylh)
   4. 彭城九印数字藏品护照 (LocalStorage 持久化 + 藏品匣弹窗) + 直通本景 AI 问策 (guide.html?site=id)
   ========================================================================== */
(function () {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const X = window.XZ;
  if (!X) return;

  /* ---------- 1. 彭城九印数字藏品护照（持久化存储） ---------- */
  const STORE_KEY = 'xz_v45_passport';
  const loadPass = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; } };
  const savePass = arr => { try { localStorage.setItem(STORE_KEY, JSON.stringify(arr)); } catch {} };
  let passIds = loadPass();

  function mintStamp(id, silent = false) {
    if (!id || passIds.includes(id)) return;
    passIds.push(id);
    savePass(passIds);
    syncPassBadge();
    if (!silent) showToast(`✦ 已铸造数字藏品印章「${X.get(id)?.n || id}」(${passIds.length}/9)`);
  }
  window.XZ_MINT_STAMP = mintStamp;

  function showToast(msg) {
    let t = $('#dpToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'dpToast';
      t.className = 'dp-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('on'), 2800);
  }

  let passDlg = null;
  function openPassport() {
    if (!passDlg) {
      passDlg = document.createElement('div');
      passDlg.className = 'dp-pass-ov';
      passDlg.hidden = true;
      passDlg.setAttribute('role', 'dialog');
      passDlg.setAttribute('aria-modal', 'true');
      passDlg.addEventListener('click', e => { if (e.target === passDlg) passDlg.hidden = true; });
      document.body.appendChild(passDlg);
    }
    const all = window.ALL || ['xmt', 'gs', 'sz', 'bwg', 'hbs', 'hlw', 'wm', 'yls', 'ylh'];
    const pct = Math.round((passIds.length / all.length) * 100);
    passDlg.innerHTML = `
      <div class="dp-pass-box">
        <div class="dp-pass-hd">
          <div><small>DIGITAL PASSPORT · 汉韵彭城数字藏品匣</small><h3 class="serif">彭城九印通关文牒</h3></div>
          <button type="button" class="dp-pass-x" aria-label="关闭">×</button>
        </div>
        <div class="dp-pass-meter"><span>已收集 <b>${passIds.length}</b> / ${all.length} 枚数字纪念章</span><i><b style="width:${pct}%"></b></i></div>
        <div class="dp-pass-grid">${all.map((id, i) => {
          const s = X.get(id);
          const got = passIds.includes(id);
          return `<a class="dp-seal-card${got ? ' got' : ''}" href="#site-${id}" data-sid="${id}">
            <div class="dp-seal-glyph">${s.g}</div>
            <b>${s.n}</b>
            <small>${got ? `NO.0${i + 1} · 已藏` : '探索互动解锁'}</small>
          </a>`;
        }).join('')}</div>
        <p class="dp-pass-foot">${passIds.length >= all.length ? '✦ 恭喜集齐彭城九印！两千二百年楚汉风华已尽收囊中。' : '在各景点详情页体验 3D 赏珍、击鼓、放鹤、描红、掌灯或拓印，即可自动铸造专属编号印章。'}</p>
      </div>`;
    passDlg.hidden = false;
    $('.dp-pass-x', passDlg).onclick = () => { passDlg.hidden = true; };
    $$('.dp-seal-card', passDlg).forEach(a => a.onclick = () => { passDlg.hidden = true; });
  }

  function syncPassBadge() {
    const b = $('#dpPassBtn');
    if (b) b.textContent = `藏品匣 ${passIds.length}/9`;
  }

  /* ---------- 2. 语音导览器 (Web Speech API + 字幕同步) ---------- */
  let speaking = false;
  function stopAudio() {
    speaking = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const btn = $('#dpAudioBtn');
    if (btn) { btn.classList.remove('on'); btn.setAttribute('aria-pressed', 'false'); $('span', btn).textContent = '语音导览'; }
    const sub = $('#dpAudioSub');
    if (sub) sub.hidden = true;
  }

  function buildAudioScript(s) {
    return `欢迎来到${s.n}。${s.line}。${s.lead} 文化看点方面：${s.culture.t}，${s.culture.d} 游览建议停留${s.time}，交通推荐${s.go.l}。逛完不妨尝一尝附近的徐州风味${s.food.n}。`;
  }

  /* ---------- 3. 昼夜 / 拓本双境对比拉帘 ---------- */
  function enhanceHeroCompare(D, s) {
    const fig = $('.h5img', D);
    if (!fig) return;
    const nightSrc = `assets/img/night/${s.id}_night.webp`;
    const daySrc = `assets/img/art/${s.cover}.webp`;
    const rubSrc = `assets/img/rub/${s.id}.webp`;

    fig.classList.add('dp-cmp-fig');
    fig.innerHTML = `
      <div class="dp-cmp-stage" id="dpCmpStage" data-mode="single" style="--split:50%">
        <img class="dp-cmp-base" src="${nightSrc}" alt="${s.n}暗夜手绘">
        <div class="dp-cmp-over"><img id="dpCmpOverImg" src="${daySrc}" alt="${s.n}对比视图"></div>
        <div class="dp-cmp-handle" id="dpCmpHandle" aria-hidden="true"><i>‹ ›</i></div>
        <span class="dp-cmp-tag l" id="dpTagL">暗夜华灯</span>
        <span class="dp-cmp-tag r" id="dpTagR">素宣白昼</span>
      </div>
      <div class="dp-cmp-modes" role="tablist" aria-label="画幅对比模式">
        <button type="button" data-cm="single" class="on">原画静赏</button>
        <button type="button" data-cm="day">昼夜对比拉帘</button>
        <button type="button" data-cm="rub">夜画 ↔ 汉石拓本</button>
      </div>`;

    const st = $('#dpCmpStage', fig);
    const overImg = $('#dpCmpOverImg', fig);
    const tagL = $('#dpTagL', fig), tagR = $('#dpTagR', fig);
    let dragging = false;

    const setSplit = clientX => {
      const r = st.getBoundingClientRect();
      const pct = Math.max(4, Math.min(96, ((clientX - r.left) / Math.max(1, r.width)) * 100));
      st.style.setProperty('--split', `${pct.toFixed(1)}%`);
    };
    st.addEventListener('pointerdown', e => {
      if (st.dataset.mode === 'single') return;
      dragging = true;
      st.setPointerCapture(e.pointerId);
      setSplit(e.clientX);
    });
    st.addEventListener('pointermove', e => { if (dragging) setSplit(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(ev => st.addEventListener(ev, () => { dragging = false; }));

    $$('.dp-cmp-modes button', fig).forEach(b => {
      b.onclick = () => {
        const m = b.dataset.cm;
        $$('.dp-cmp-modes button', fig).forEach(x => x.classList.toggle('on', x === b));
        st.dataset.mode = m;
        if (m === 'day') {
          overImg.src = daySrc; overImg.classList.remove('is-rub');
          tagL.textContent = '暗夜华灯'; tagR.textContent = '素宣白昼';
          st.style.setProperty('--split', '50%');
        } else if (m === 'rub') {
          overImg.src = rubSrc; overImg.classList.add('is-rub');
          tagL.textContent = '暗夜实景'; tagR.textContent = '汉石拓本';
          st.style.setProperty('--split', '52%');
        }
      };
    });
  }

  /* ---------- 4. 一景一绝活专属互动模块 ---------- */
  function buildSkillHTML(s) {
    // 3D 数字文物展柜（徐州博物馆 / 龟山汉墓 / 狮子山楚王陵）
    if (s.id === 'bwg' || s.id === 'gs' || s.id === 'sz') {
      return `<section class="d5 dp-skill-sec" id="d-3d" aria-label="3D数字藏品展柜"><div id="dp3dMount"></div></section>`;
    }
    // 戏马台：击鼓点将 · 楚汉军令（保留纯正戏马台专属体验，不塞外地模型）
    if (s.id === 'xmt') {
      return `<section class="d5 dp-skill-sec" id="d-skill" aria-label="击鼓点将">
        <header class="sh"><p class="eye">SIGNATURE INTERACTION · 戏马台专属互动</p><h2>擂鼓点将 · 听楚汉回响</h2><p>轻击暗夜战鼓三通，聆听低沉鼓声与金环声波，解锁霸王项羽与东晋刘裕的重阳登高诗签。</p></header>
        <div class="dp-drum-stage">
          <button type="button" class="dp-drum-btn" id="dpDrumBtn" aria-label="敲击戏马台战鼓">
            <span class="dp-drum-ring r1"></span><span class="dp-drum-ring r2"></span>
            <strong class="serif">擊 鼓</strong><small>点击或空格擂鼓</small>
          </button>
          <div class="dp-drum-out" id="dpDrumOut">
            <span class="dp-drum-cnt">已擂鼓 <b id="dpDrumCnt">0</b> / 3 通</span>
            <blockquote class="serif" id="dpDrumPoem">「力拔山兮气盖世，时不利兮骓不逝。」</blockquote>
            <small id="dpDrumSrc">西楚霸王项羽 · 《垓下歌》 · 前206年筑台戏马</small>
          </div>
        </div>
      </section>`;
    }
    // 云龙山：放鹤求东坡诗签
    if (s.id === 'yls') {
      return `<section class="d5 dp-skill-sec" id="d-skill" aria-label="云龙放鹤求签">
        <header class="sh"><p class="eye">SIGNATURE INTERACTION · 云龙山专属互动</p><h2>放鹤亭 · 放飞白鹤求东坡诗签</h2><p>仿北宋隐士张天骥与苏轼“山人有二鹤”典故，轻点放飞水墨白鹤，求取一枚苏轼在徐州写下的专属诗签。</p></header>
        <div class="dp-crane-box">
          <div class="dp-crane-sky" id="dpCraneSky"><span class="dp-crane-bird" id="dpCraneBird">🕊</span></div>
          <div class="dp-crane-card" id="dpCraneCard">
            <small id="dpCraneTag">北宋 · 熙宁十一年 · 苏轼知徐州</small>
            <h3 class="serif" id="dpCraneLine">「鹤飞去兮西山之缺，高翔而下览兮择所适。」</h3>
            <p id="dpCraneNote">出自苏轼《放鹤亭记》，登云龙山放鹤亭可俯瞰整片云龙湖烟波。</p>
            <button type="button" class="iz-line-btn" id="dpReleaseCrane">✦ 放飞白鹤 · 换一枚东坡诗签</button>
          </div>
        </div>
      </section>`;
    }
    // 文庙街区：数字朱砂描红
    if (s.id === 'wm') {
      return `<section class="d5 dp-skill-sec" id="d-skill" aria-label="文庙数字描红">
        <header class="sh"><p class="eye">SIGNATURE INTERACTION · 文庙街区专属互动</p><h2>数字朱砂描红 · 书彭城一字</h2><p>在暗夜宣纸碑帖上亲手描摹大字，感受徐州文庙千年兴学读书传统。</p></header>
        <div class="dp-calli-wrap">
          <div class="dp-calli-pad"><span class="dp-calli-tpl serif" id="dpCalliTpl">漢</span><canvas id="dpCalliCv" width="320" height="320"></canvas></div>
          <div class="dp-calli-ctrl">
            <div class="dp-calli-chars"><button type="button" class="on" data-ch="漢">漢</button><button type="button" data-ch="彭">彭</button><button type="button" data-ch="文">文</button><button type="button" data-ch="韻">韻</button></div>
            <p>按住左侧墨宣轻笔描摹金色碑字，落笔成章后即刻解锁「文庙街区」数字藏品印章。</p>
            <div class="dp-calli-acts"><button type="button" class="iz-line-btn" id="dpCalliClear">净纸重写</button></div>
          </div>
        </div>
      </section>`;
    }
    // 户部山 & 回龙窝：掌灯夜游老巷
    if (s.id === 'hbs' || s.id === 'hlw') {
      const items = s.id === 'hbs'
        ? [['余家大院', '砖雕门楼雕琢蝙蝠与缠枝莲，寓意“福寿绵长”。'], ['翟家大院', '依山势层层递进的四进院落，老徐州商号风华犹存。'], ['民俗馆', '藏有花轿、刺绣、徐州剪纸与老婚俗旧物。'], ['状元街', '明清富户聚居，“穷北关，富南关，有钱都住户部山”。']]
        : [['第一口老井', '老徐州人围井汲水闲谈的生活记忆核心。'], ['乾隆迷巷', '民间相传乾隆南巡误入死胡同“回龙”折返之地。'], ['古城墙遗址', '回龙窝城墙博物馆内可近距离触摸明清砖城墙基。'], ['红灯笼茶馆', '傍晚华灯亮起时，青砖巷道最具彭城烟火气。']];
      return `<section class="d5 dp-skill-sec" id="d-skill" aria-label="掌灯夜游老巷">
        <header class="sh"><p class="eye">SIGNATURE INTERACTION · 老城街巷专属互动</p><h2>掌灯夜游 · 点亮四盏古城红灯笼</h2><p>依次轻点檐下灯笼，照亮老巷风物，每点亮一盏即可解锁一则彭城旧闻。</p></header>
        <div class="dp-lanterns">${items.map((it, i) => `<button type="button" class="dp-lan" data-li="${i}"><i>🏮</i><b>${it[0]}</b><span>${it[1]}</span></button>`).join('')}</div>
      </section>`;
    }
    // 云龙湖：四时湖光取景器
    if (s.id === 'ylh') {
      return `<section class="d5 dp-skill-sec" id="d-skill" aria-label="四时湖光取景器">
        <header class="sh"><p class="eye">SIGNATURE INTERACTION · 云龙湖专属互动</p><h2>四时湖光取景器 · 一湖看尽徐州四季</h2><p>切换春夏秋冬四重云龙湖景致与题诗滤镜，收藏你最心动的彭城湖色。</p></header>
        <div class="dp-lake-box">
          <div class="dp-lake-frame"><img id="dpLakeImg" src="assets/img/art/ylh_d.webp" alt="云龙湖四季"><p class="serif" id="dpLakePoet">月下亭台照烟波 · 夜色云龙湖</p></div>
          <div class="dp-lake-tabs">
            <button type="button" data-img="ylh_a" data-poet="苏堤垂柳拂清波 · 春日云龙湖">春 · 柳堤</button>
            <button type="button" data-img="ylh_b" data-poet="接天莲叶十里香 · 盛夏荷风">夏 · 荷花</button>
            <button type="button" data-img="ylh_c" data-poet="秋水共长天一色 · 金秋湖亭">秋 · 湖亭</button>
            <button type="button" class="on" data-img="ylh_d" data-poet="月下亭台照烟波 · 夜色云龙湖">夜 · 月色</button>
          </div>
        </div>
      </section>`;
    }
    return '';
  }

  function initSkill(D, s) {
    if ((s.id === 'bwg' || s.id === 'gs' || s.id === 'sz') && window.XZ_RELIC3D) {
      const mount = $('#dp3dMount', D);
      const map = {
        bwg: ['yulong', 'yuyi', 'wuyong', 'pillow', 'leopard'],
        gs:  ['relief', 'seal'],
        sz:  ['army1', 'army2', 'cavalry']
      };
      if (mount) window.XZ_RELIC3D.mount(mount, map[s.id]);
      return;
    }
    if (s.id === 'xmt') {
      const POEMS = [
        ['「力拔山兮气盖世，时不利兮骓不逝。」', '西楚霸王项羽 · 《垓下歌》 · 前206年筑台戏马'],
        ['「风至授寒服，霜降休百工。繁林收阳彩，密苑解华丛。」', '东晋谢瞻 · 《九日从宋公戏马台集送孔令诗》'],
        ['「九日登高台，秋风动彭城；千载霸王气，犹在山石间。」', '彭城重阳登高旧俗 · 戏马台风云阁']
      ];
      let cnt = 0;
      const btn = $('#dpDrumBtn', D);
      if (btn) btn.onclick = () => {
        cnt++;
        btn.classList.remove('hit'); void btn.offsetWidth; btn.classList.add('hit');
        // Web Audio 合成浑厚战鼓低频声
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          const ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(125, ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.36);
          g.gain.setValueAtTime(0.42, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.46);
        } catch {}
        const p = POEMS[cnt % POEMS.length];
        $('#dpDrumCnt', D).textContent = Math.min(3, cnt);
        $('#dpDrumPoem', D).textContent = p[0];
        $('#dpDrumSrc', D).textContent = p[1];
        if (cnt >= 3) mintStamp('xmt');
      };
      return;
    }
    if (s.id === 'yls') {
      const SLIPS = [
        ['北宋 · 熙宁十一年 · 《放鹤亭记》', '「鹤飞去兮西山之缺，高翔而下览兮择所适。」', '苏轼赞隐士张天骥“南面之乐不可易”，登亭可尽览云龙湖山水。'],
        ['北宋 · 元丰元年 · 《登云龙山》', '「醉中走上黄茅冈，满冈乱石如群羊。」', '苏轼笔下的云龙山奇石林立，今日步道平缓，松风袭人。'],
        ['北宋 · 徐州知州任内 · 《浣溪沙》', '「簌簌衣巾落枣花，村南村北响缲车。」', '写于徐州城东石潭谢雨途中，流露东坡对徐州百姓的深情。']
      ];
      let idx = 0;
      const btn = $('#dpReleaseCrane', D);
      if (btn) btn.onclick = () => {
        idx = (idx + 1) % SLIPS.length;
        const bird = $('#dpCraneBird', D);
        bird.classList.remove('fly'); void bird.offsetWidth; bird.classList.add('fly');
        $('#dpCraneTag', D).textContent = SLIPS[idx][0];
        $('#dpCraneLine', D).textContent = SLIPS[idx][1];
        $('#dpCraneNote', D).textContent = SLIPS[idx][2];
        mintStamp('yls');
        if (window.XZ_CUE) window.XZ_CUE(493.88, 1.5);
      };
      return;
    }
    if (s.id === 'wm') {
      const cv = $('#dpCalliCv', D);
      if (!cv) return;
      const g = cv.getContext('2d');
      let draw = false, strokes = 0;
      g.strokeStyle = '#C84B3E'; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (320 / r.width), (e.clientY - r.top) * (320 / r.height)]; };
      cv.addEventListener('pointerdown', e => { draw = true; cv.setPointerCapture(e.pointerId); g.beginPath(); g.moveTo(...pt(e)); });
      cv.addEventListener('pointermove', e => { if (!draw) return; g.lineTo(...pt(e)); g.stroke(); });
      ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { if (draw) { draw = false; strokes++; if (strokes >= 2) mintStamp('wm'); } }));
      $('#dpCalliClear', D).onclick = () => { g.clearRect(0, 0, 320, 320); strokes = 0; };
      $$('.dp-calli-chars button', D).forEach(b => b.onclick = () => {
        $$('.dp-calli-chars button', D).forEach(x => x.classList.toggle('on', x === b));
        $('#dpCalliTpl', D).textContent = b.dataset.ch;
        g.clearRect(0, 0, 320, 320);
      });
      return;
    }
    if (s.id === 'hbs' || s.id === 'hlw') {
      const btns = $$('.dp-lan', D);
      btns.forEach(b => b.onclick = () => {
        b.classList.toggle('lit');
        if (window.XZ_CUE) window.XZ_CUE(369.99, 1.2);
        if (btns.every(x => x.classList.contains('lit'))) mintStamp(s.id);
      });
      return;
    }
    if (s.id === 'ylh') {
      $$('.dp-lake-tabs button', D).forEach(b => b.onclick = () => {
        $$('.dp-lake-tabs button', D).forEach(x => x.classList.toggle('on', x === b));
        $('#dpLakeImg', D).src = `assets/img/art/${b.dataset.img}.webp`;
        $('#dpLakePoet', D).textContent = b.dataset.poet;
        mintStamp('ylh');
      });
    }
  }

  /* ---------- 5. 监听详情页打开事件，大刀阔斧重构为「暗室策展杂志体」 ---------- */
  function restructureEditorialDetail(D, s) {
    // 1) 清除重复旧模块 + 全部九景统一去掉冗余的「历史年表 #d-tl」与「美食 #d-food」；.dk 由 CSS 隐藏避免触发 app.js 视差空指针
    ['#d-lens', '#d-culture', '#d-tl', '#d-food', '#ed50-spread'].forEach(sel => {
      const el = $(sel, D);
      if (el) el.remove();
    });
    // 修正章节序号为连续的 01 -> 02
    const goEye = $('#d-go .sh .eye', D); if (goEye) goEye.textContent = '02 · 行旅路引';

    // 2) 为顶部 Hero 注入暗夜景点氛围背景层（无框羽化过渡，与主页一脉相承）
    const hero = $('.dv5-hero', D);
    if (hero && !$('.ed50-hero-bg', hero)) {
      hero.insertAdjacentHTML('afterbegin',
        `<div class="ed50-hero-bg" aria-hidden="true" style="background-image:url('assets/img/night/${s.id}_night.webp')"></div>`);
    }

    // 3) 精简顶栏目录：从 7 项杂乱入口收敛为 4 项策展章节，并将「语音导览」「问朱雀」优雅收入右侧
    const toc = $('.d-toc', D);
    const has3d = (s.id === 'bwg' || s.id === 'gs' || s.id === 'sz');
    if (toc) {
      const items = [
        ['ed50-top', '概览'],
        [has3d ? 'd-3d' : 'd-skill', has3d ? '珍藏展台' : '专属互动'],
        ['d-story', '循迹细读'],
        ['d-go', '行旅']
      ];
      toc.innerHTML = items.map(([tid, label], idx) =>
        `<button type="button" data-t="${tid}" class="${idx === 0 ? 'on' : ''}">${label}</button>`
      ).join('');
      const getTop = el => el.getBoundingClientRect().top - D.getBoundingClientRect().top + D.scrollTop;
      $$('button', toc).forEach(b => {
        b.onclick = () => {
          $$('button', toc).forEach(x => x.classList.toggle('on', x === b));
          if (b.dataset.t === 'ed50-top') { D.scrollTo({ top: 0, behavior: 'smooth' }); return; }
          const el = document.getElementById(b.dataset.t);
          if (el) D.scrollTo({ top: getTop(el) - 62, behavior: 'smooth' });
        };
      });
    }

    // 4) 把冗长的 3 框「纹样与出处 #d-src」收折为页底安静的可展开学术注脚（评委可点开核验，日常零视觉噪音）
    const src = $('#d-src', D);
    if (src && !src.closest('details.ed50-prov')) {
      const det = document.createElement('details');
      det.className = 'ed50-prov';
      det.innerHTML = `<summary><span>学术来源、馆藏授权与纹样出处说明</span><i>展开查看 ⌄</i></summary>`;
      src.parentNode.insertBefore(det, src);
      det.appendChild(src);
    }

    // 5) 行旅区增加直达「问朱雀」的精炼入口
    const goActs = $('#d-go .acts', D);
    if (goActs && !$('.ed50-go-ai', goActs)) {
      goActs.insertAdjacentHTML('beforeend', `<a class="b5 ed50-go-ai" href="guide.html?site=${s.id}">问朱雀 · 定制路线 ↗</a>`);
    }
  }

  function mountDetailPlus(id) {
    stopAudio();
    const D = $('#detail');
    const s = X.get(id);
    if (!D || !s) return;

    // A) 顶栏操作区精简：保留干净的 3 枚低噪胶囊 + 语音字幕条
    const actRow = $('.h5act', D);
    if (actRow && !$('#dpAudioBtn', actRow)) {
      actRow.insertAdjacentHTML('beforeend', `
        <button class="pcbtn dp-audio-btn" id="dpAudioBtn" type="button" aria-pressed="false"><i></i><span>语音导览</span></button>
        <button class="pcbtn" id="dpPassBtn" type="button">藏品匣 ${passIds.length}/9</button>
        <a class="pcbtn dp-ai-lnk" href="guide.html?site=${s.id}">问朱雀 ↗</a>`);
      actRow.insertAdjacentHTML('afterend', `<p class="dp-audio-sub" id="dpAudioSub" hidden></p>`);

      $('#dpPassBtn', D).onclick = openPassport;
      $('#dpAudioBtn', D).onclick = () => {
        if (speaking) { stopAudio(); return; }
        const script = buildAudioScript(s);
        const btn = $('#dpAudioBtn', D), sub = $('#dpAudioSub', D);
        speaking = true;
        btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true');
        $('span', btn).textContent = '暂停导览';
        sub.textContent = '🔊 正在播报：' + script;
        sub.hidden = false;
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(script);
          u.lang = 'zh-CN'; u.rate = 0.96;
          u.onend = () => stopAudio();
          u.onerror = () => stopAudio();
          window.speechSynthesis.speak(u);
        }
        if (window.XZ_CUE) window.XZ_CUE(293.66, 2.2);
      };
    }

    // B) 主画升级为无框昼夜 / 拓本双境对比拉帘
    enhanceHeroCompare(D, s);

    // C) 注入全新「暗室聚光圆台 2.5D 文物展厅」或「一景一绝活」专属互动
    const storyWrap = $('#d-story', D);
    const skillHTML = buildSkillHTML(s);
    if (storyWrap && skillHTML && !$('#d-3d', D) && !$('#d-skill', D)) {
      storyWrap.insertAdjacentHTML('beforebegin', skillHTML);
      initSkill(D, s);
    }

    // D) 执行二级页大刀阔斧重构，彻底去芜存菁
    restructureEditorialDetail(D, s);
  }
  X.on('detail', mountDetailPlus);

  // 若页面带 #site-xxx 深链直达（例如从 guide.html 卡片跳回），补触发挂载
  const mInit = (location.hash || '').match(/^#site-([a-z0-9]+)$/i);
  if (mInit) {
    setTimeout(() => {
      if ($('#detail') && !$('#detail').hidden) mountDetailPlus(mInit[1]);
    }, 120);
  }

  // 关闭详情页时停止语音播报
  const detEl = $('#detail');
  if (detEl && 'MutationObserver' in window) {
    new MutationObserver(() => { if (detEl.hidden) stopAudio(); }).observe(detEl, { attributes: true, attributeFilter: ['hidden'] });
  }
})();
