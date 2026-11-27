/* ==========================================================================
   汉韵彭城 · V50 暗室聚光圆台 · 博物馆级 2.5D 孤品数字展柜
   - 视觉范式：无框暗室丁达尔聚光束 + 3D 哑光黑金圆台 + 透明底抠图文物孤品
   - 交互体验：拖拽 2.5D 立体偏转与光影扫掠 / 右侧 + − 与滚轮缩放 / 自动旋转 /
              默认隐藏热点（点击「热点标注」开关）/ 「+ 文物故事」侧抽屉
   - 100% 徐州博物馆 / 狮子山楚王陵 / 龟山汉墓真实镇馆之宝，纯本地离线秒开
   ========================================================================== */
(function () {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];

  const RELICS = {
    yulong: {
      id: 'yulong',
      siteId: 'bwg',
      tab: 'S 形玉龙佩',
      poem: '玉龙破云，\n汉韵生姿。',
      sub: '西汉 · 狮子山楚王陵 S 形玉龙佩',
      era: '西汉早期 · 徐州狮子山楚王陵出土 · 徐州博物馆藏',
      dim: '长 15.7 cm · 和田白玉双面透雕（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_yulong.webp',
      scale: 0.94,
      lift: 8,
      story: '此件 S 形玉龙佩出土于徐州狮子山楚王陵，精选新疆和田白玉双面透雕而成。龙首回眸张口、长角后卷、身躯蜿蜒如游云，两面满布立体谷纹与勾连云纹；历经两千余年楚王地宫浸润，龙尾泛起温润深邃的赤褐土沁，堪称西汉玉龙艺术的巅峰之作。',
      hotspots: [
        { x: 48, y: 24, title: '回眸龙首', desc: '龙首昂起回望、张口吐舌、长角后卷，兼具战国遗风与西汉大开大合的磅礴气象。' },
        { x: 64, y: 54, title: '满布游丝谷纹', desc: '双面精雕规整饱满的立体谷纹与卷云纹，滚轮放大可细观刀工起伏。' },
        { x: 45, y: 80, title: '赤褐古玉土沁', desc: '地宫岁月赋予龙尾温润赤褐沁色，如飞龙破云腾跃而出。' }
      ],
      facts: [
        ['出土地点', '徐州狮子山楚王陵'],
        ['核心工艺', '和田白玉双面透雕 · 谷纹卷云'],
        ['藏品归属', '徐州博物馆「天工汉玉」展厅']
      ]
    },
    yuyi: {
      id: 'yuyi',
      siteId: 'bwg',
      tab: '金缕玉衣',
      poem: '金缕缀玉，\n楚王不朽。',
      sub: '西汉 · 狮子山楚王陵金缕玉衣（4248 片）',
      era: '西汉 · 徐州狮子山楚王陵出土 · 徐州博物馆头号镇馆之宝',
      dim: '全长 1.74 米 · 和田玉 4248 片 · 纯金丝约 1576 克（CC0）',
      img: 'assets/img/relics/cut_yuyi.webp',
      altImg: 'assets/img/relics/cut_yuyi_head.webp',
      altLabel: '头部金丝特写',
      mainLabel: '返回全貌卧展',
      scale: 1.06,
      lift: 34,
      story: '我国迄今出土年代最早、玉片数量最多、玉质最优、工艺最精的完整西汉金缕玉衣。全衣分头套、上衣、袖筒、手套、裤筒与玉鞋十二部分，以 4248 片新疆和田白玉与青白玉打磨钻孔，再用重达 1576 克的纯金丝一一穿缀而成，寄托着汉代诸侯王“玉敛不朽”的升仙宏愿。',
      hotspots: [
        { x: 14, y: 48, title: '玉面罩与头套', desc: '按人脸起伏弧度精细拼合，并饰红色织锦镶边，工艺冠绝全国汉墓玉衣。' },
        { x: 46, y: 44, title: '4248 片玉片金丝连缀', desc: '全衣用金丝约 1576 克，可在「文物故事」中一键切换头部金丝微距特写。' },
        { x: 84, y: 34, title: '玉裤筒与玉鞋', desc: '十二部分独立编缀再整体组合，汉代唯帝王与诸侯王方能使用“金缕”。' }
      ],
      facts: [
        ['玉片总数', '4,248 片新疆和田玉'],
        ['用金总量', '约 1,576 克纯金丝'],
        ['历史地位', '徐州博物馆头号镇馆之宝']
      ]
    },
    wuyong: {
      id: 'wuyong',
      siteId: 'bwg',
      tab: '陶绕襟衣舞俑',
      poem: '长袖善舞，\n绕襟凌波。',
      sub: '西汉 · 驮篮山楚王墓陶绕襟衣舞俑',
      era: '西汉 · 徐州驮篮山楚王墓出土 · 徐州博物馆藏',
      dim: '灰陶彩绘 · 楚汉宫廷乐舞雕塑代表作（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_wuyong.webp',
      scale: 0.94,
      lift: 14,
      story: '出土于徐州驮篮山楚王墓的彩绘陶绕襟衣舞俑，以极简传神的写意泥塑定格了西汉宫廷“翘袖折腰”的绝美舞姿。舞女细腰盈握、长袖垂扬，曲裾深衣螺旋绕襟曳地而下，与史书“长袖善舞”的楚汉风韵互为印证。',
      hotspots: [
        { x: 48, y: 14, title: '婉约盘髻面容', desc: '低挽发髻、眉目含笑、微首斜顾，凝住两千年前楚宫乐舞最柔和的一瞬。' },
        { x: 16, y: 36, title: '翘袖折腰长袖', desc: '右臂高举长袖垂落、左袖轻展，极富韵律感与动态张力。' },
        { x: 56, y: 80, title: '曲裾绕襟长裙', desc: '螺旋绕襟拖地裙摆稳托纤细腰身，呈现极具东方美学的 S 形雕塑曲线。' }
      ],
      facts: [
        ['出土地点', '徐州驮篮山楚王墓'],
        ['艺术特征', '细腰长袖 · 写意汉风雕塑'],
        ['藏品归属', '徐州博物馆常设展厅']
      ]
    },
    pillow: {
      id: 'pillow',
      siteId: 'bwg',
      tab: '鎏金镶玉漆枕',
      poem: '朱漆鎏金，\n蟠龙入梦。',
      sub: '西汉 · 后楼山五号墓鎏金龙纹镶玉漆枕',
      era: '西汉 · 徐州后楼山五号墓出土 · 徐州博物馆藏',
      dim: '朱漆木胎 · 鎏金青铜蟠龙镶玉（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_pillow.webp',
      scale: 0.88,
      lift: 22,
      story: '以汉代至纯朱砂漆为胎底，通体镶嵌透雕鎏金青铜蟠龙与温润玉片。朱红与流金的强烈对比不仅展现了西汉楚国王室起居礼制的极致华美，也是本站「暗夜玄金 × 汉漆朱红」视觉色系的直接文物灵感本源。',
      hotspots: [
        { x: 50, y: 20, title: '枕面鎏金云气蟠龙', desc: '枕顶满饰鎏金蟠龙与玉片，在暗室光束下泛出温厚金属光泽。' },
        { x: 46, y: 58, title: '汉漆朱砂地子', desc: '历经两千年仍艳丽沉稳的朱漆底色，与透雕鎏金涡纹交相辉映。' }
      ],
      facts: [
        ['出土地点', '徐州后楼山五号汉墓'],
        ['材质工艺', '朱漆木胎 · 鎏金透雕 · 镶玉'],
        ['藏品归属', '徐州博物馆藏']
      ]
    },
    leopard: {
      id: 'leopard',
      siteId: 'bwg',
      tab: '豹形铜镇',
      poem: '伏豹镇席，\n鎏金生辉。',
      sub: '西汉 · 狮子山楚王陵鎏金豹形铜镇',
      era: '西汉 · 徐州狮子山楚王陵出土 · 徐州博物馆藏',
      dim: '青铜灌铅 · 鎏金席镇（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_leopard.webp',
      scale: 0.84,
      lift: 22,
      story: '汉代席地而坐，贵族常于筵席四角置铜镇压席防卷。此件豹形铜镇腹内灌铅增重，猛豹蜷伏回首、张口低吼，肌肉线条饱满雄健，体表犹存西汉鎏金残彩与铜绿锈色。',
      hotspots: [
        { x: 60, y: 28, title: '回首张口猛豹', desc: '方寸之间雕出猛兽蛰伏待发之势，尽显西汉写实动物雕塑神采。' },
        { x: 54, y: 78, title: '腹内灌铅增重', desc: '实用与审美合一，稳压华席四角。' }
      ],
      facts: [
        ['出土地点', '徐州狮子山楚王陵'],
        ['文物用途', '西汉贵族筵席压席镇器'],
        ['藏品归属', '徐州博物馆藏']
      ]
    },
    army1: {
      id: 'army1',
      siteId: 'sz',
      tab: '狮子山跪姿武士俑',
      poem: '千军护陵，\n汉风犹在。',
      sub: '西汉 · 狮子山汉兵马俑一号坑跪姿武士俑',
      era: '西汉早期 · 徐州狮子山楚王陵兵马俑一号坑出土',
      dim: '微缩彩绘灰陶武士俑 · 独立全轮廓精抠（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_warrior_sz.webp',
      scale: 0.90,
      lift: 14,
      story: '出土于徐州狮子山汉兵马俑一号坑的跪姿武士俑。不同于秦俑的真人等大，徐州汉兵马俑小巧写意、表情肃穆安详，双手前伸虚握长兵，领口与袖端犹存两千年前朱红彩绘痕迹。',
      hotspots: [
        { x: 48, y: 20, title: '头戴兜鍪写意面容', desc: '眉眼柔和简洁、神情沉静笃定，是西汉早期楚国陶俑最具辨识度的雕塑风格。' },
        { x: 52, y: 34, title: '朱红彩绘领缘', desc: '颈下深红领口彩绘历经两千余年仍清晰可辨。' },
        { x: 84, y: 66, title: '双手虚握执械', desc: '陶俑手部留有圆孔，下葬时原配执木质或铜质兵器护卫楚王陵寝。' }
      ],
      facts: [
        ['出土地点', '徐州狮子山汉兵马俑一号坑'],
        ['陶俑特色', '微缩写意 · 彩绘领缘与执械手孔'],
        ['历史地位', '徐州「汉代三绝」核心代表']
      ]
    },
    army2: {
      id: 'army2',
      siteId: 'sz',
      tab: '彩绘立姿陶兵俑',
      poem: '披甲执戟，\n威震彭城。',
      sub: '西汉 · 徐州楚王陵彩绘立姿陶武士俑',
      era: '西汉早期 · 徐州北洞山楚王墓出土 · 徐州博物馆藏',
      dim: '彩绘灰陶立俑 · 完整服饰与双足形态（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_soldier_bd.webp',
      scale: 0.96,
      lift: 12,
      story: '出土于徐州楚王墓的彩绘立姿陶武士俑，身着交领长袍、袖口与衣缘敷以朱红矿物彩绘，双手叠握于腹前持械而立，脚踏翘头方履，与狮子山兵马俑共同构成徐州两汉地下护陵军制奇观。',
      hotspots: [
        { x: 48, y: 12, title: '束冠英挺面容', desc: '眉目清朗、鼻梁挺直，兼具写实轮廓与汉代简约概括之力。' },
        { x: 46, y: 50, title: '朱彩广袖交领袍', desc: '袖口可见鲜明汉代朱砂彩绘，呈现西汉楚国卫士军服细节。' }
      ],
      facts: [
        ['出土地点', '徐州楚王陵墓葬群'],
        ['彩绘特征', '朱砂袖口 · 交领长袍 · 翘头履'],
        ['藏品归属', '徐州博物馆藏']
      ]
    },
    cavalry: {
      id: 'cavalry',
      siteId: 'sz',
      tab: '重甲铁骑复原',
      poem: '铁马冰河，\n汉甲生光。',
      sub: '西汉 · 徐州博物馆重甲铁骑与甲马复原展陈',
      era: '两汉 · 徐州博物馆军事文物馆藏复原',
      dim: '铁札甲片编缀 · 汉代重装骑兵与具装铠马（CC BY-SA 4.0）',
      img: 'assets/img/relics/cut_cavalry_xz.webp',
      scale: 0.94,
      lift: 14,
      story: '依据徐州狮子山楚王陵等西汉楚国墓葬出土的成套铁甲片科学复原的汉代重装骑兵与披甲战马，铁片如鱼鳞层叠编缀，直观再现两汉“大风起兮云飞扬”的精锐铁骑军威。',
      hotspots: [
        { x: 24, y: 40, title: '马面帘与具装铠', desc: '战马颈胸披挂层叠编缀甲片，展现汉代精良治铁与军工技艺。' },
        { x: 74, y: 42, title: '鱼鳞札甲武士', desc: '头盔、披膊、胸甲与裙甲分区编缀，防护严密且灵活自如。' }
      ],
      facts: [
        ['展陈地点', '徐州博物馆两汉军事展厅'],
        ['甲胄工艺', '狮子山铁甲片考古复原'],
        ['历史背景', '西汉精锐重装骑兵军制']
      ]
    },
    relief: {
      id: 'relief',
      siteId: 'gs',
      tab: '汉画像石浮雕',
      poem: '凿石成画，\n车马出行。',
      sub: '东汉 · 徐州汉画像石浅浮雕',
      era: '两汉 · 徐州「汉代三绝」石刻艺术代表',
      dim: '青石减地浅浮雕 · 竖纹凿底暗室侧光还原',
      img: 'assets/img/relics/cut_huaxiangshi.webp',
      scale: 1.04,
      lift: 14,
      canStamp: true,
      story: '徐州汉画像石与汉墓、汉兵马俑并称“汉代三绝”，被誉为“绣像的汉代史”。此幅车马出行浮雕以减地平面浅浮雕辅以阴线刻，四马驾华盖轺车奔腾向前、骑吏执戟随行，背景遍施汉代独有的竖纹凿痕。',
      hotspots: [
        { x: 24, y: 54, title: '四马驾轺车', desc: '四骏昂首腾蹄、车轮飞转，定格汉代贵族出行的煊赫仪仗。' },
        { x: 52, y: 40, title: '华盖与卷云纹', desc: '拖拽展台侧看光影起伏，感受青石减地浅浮雕的刀工层次。' },
        { x: 78, y: 54, title: '执戟骑吏仪仗', desc: '后队骑兵持戟举旌，构图饱满雄浑。' }
      ],
      facts: [
        ['雕刻技法', '减地平面浅浮雕 · 竖纹凿底'],
        ['文化地位', '徐州「汉代三绝」之首'],
        ['专属互动', '可在故事面板中体验「现场落印」']
      ]
    },
    seal: {
      id: 'seal',
      siteId: 'gs',
      tab: '西汉楚国官印',
      poem: '银印定名，\n凿山为藏。',
      sub: '西汉 · 徐州博物馆藏楚国官印（对照龟山「刘注」银印）',
      era: '西汉 · 徐州博物馆藏西汉印章实物（CC0）',
      dim: '方形阴刻篆书印面全轮廓精抠 · 支持「现场落印」楚王刘注朱拓',
      img: 'assets/img/relics/cut_seal.webp',
      scale: 0.72,
      lift: 18,
      canStamp: true,
      story: '1981 年考古发掘龟山汉墓时，正是凭借墓室中出土的一枚刻有阴文篆书「刘注」二字的龟钮银印，一举确证这座凿山而成的宏伟崖洞墓主人乃西汉第六代楚王刘注。点击下方「+ 文物故事」内的「现场落印」即可亲手加盖楚王朱拓！',
      hotspots: [
        { x: 50, y: 46, title: '西汉阴刻篆书印面', desc: '刀法方折峻利，印证汉代森严的官印与诸侯王印制。' }
      ],
      facts: [
        ['实物来源', '徐州博物馆藏西汉铜印实拍（CC0）'],
        ['龟山物证', '凭「刘注」龟钮银印锁定楚王身份'],
        ['专属互动', '支持一键加盖「刘注」朱拓印章']
      ]
    }
  };

  function mountRelicStage(container, relicIds) {
    if (!container || !relicIds || !relicIds.length) return;
    let curKey = relicIds[0];
    let model = RELICS[curKey] || RELICS.yulong;
    let useAlt = false;
    let autoSpin = true;
    let showPins = false; // 默认隐藏热点，保持如参考图般极致纯净的文物孤品感！
    let storyOpen = false;
    let stamped = false;
    let activePin = 0;

    let rx = 0, ry = 0, trx = 0, try_ = 0;
    let zoom = 1, tZoom = 1;
    let dragging = false, lx = 0, ly = 0;
    let alive = true;

    const tabsHtml = relicIds.length > 1
      ? `<div class="r50-switcher" role="tablist" aria-label="切换馆藏文物">${relicIds.map((k, i) => {
          const m = RELICS[k]; if (!m) return '';
          return `<button type="button" role="tab" data-rk="${k}" class="${i === 0 ? 'on' : ''}">${m.tab}</button>`;
        }).join('')}</div>`
      : '';

    container.innerHTML = `
      <div class="r50-chamber" id="r50Chamber">
        <div class="r50-beam" aria-hidden="true"></div>
        <canvas class="r50-dust" id="r50Dust" aria-hidden="true"></canvas>

        <div class="r50-head">
          <div class="r50-poem-wrap">
            <h2 class="r50-poem serif" id="r50Poem"></h2>
            <p class="r50-sub" id="r50Sub"></p>
          </div>
          ${tabsHtml}
        </div>

        <div class="r50-stage" id="r50Stage">
          <div class="r50-rig" id="r50Rig">
            <div class="r50-disc" aria-hidden="true">
              <div class="r50-disc-top"></div>
              <div class="r50-disc-shadow"></div>
            </div>
            <div class="r50-obj-wrap" id="r50ObjWrap">
              <img class="r50-obj" id="r50Obj" src="" alt="" draggable="false">
              <div class="r50-sheen" id="r50Sheen"></div>
              <div class="r50-pins" id="r50Pins" hidden></div>
            </div>
          </div>

          <div class="r50-zoom" aria-label="缩放控制">
            <button type="button" id="r50Zin" aria-label="放大">+</button>
            <i></i>
            <button type="button" id="r50Zout" aria-label="缩小">−</button>
          </div>

          <div class="r50-pin-toast" id="r50PinToast" hidden></div>

          <div class="r3d-stamp-card r50-stamp-card" id="r3dStampCard" hidden>
            <div class="r3d-seal-imprint"><span>刘</span><span>注</span></div>
            <small>楚王刘注 · 龟钮银印朱拓</small>
          </div>
        </div>

        <div class="r50-foot">
          <p class="r50-hint">拖动观赏各个角度 · 滚轮或右侧按钮缩放</p>
          <div class="r50-pills">
            <button type="button" class="r50-pill on" id="r50SpinBtn">↻ 自动旋转</button>
            <button type="button" class="r50-pill" id="r50PinBtn">◎ 热点标注</button>
            <button type="button" class="r50-pill" id="r50ResetBtn">✦ 复位视角</button>
            <button type="button" class="r50-pill" id="r50StoryBtn">+ 文物故事</button>
          </div>
        </div>

        <aside class="r50-drawer" id="r50Drawer" hidden aria-label="文物策展说明">
          <div class="r50-drawer-hd">
            <small>CURATORIAL NOTE · 馆藏档案</small>
            <button type="button" class="r50-drawer-x" id="r50DrawerX" aria-label="关闭">×</button>
          </div>
          <h3 class="serif" id="r50DrTitle"></h3>
          <p class="r50-dr-meta" id="r50DrMeta"></p>
          <p class="r50-dr-body" id="r50DrBody"></p>
          <dl class="r50-dr-facts" id="r50DrFacts"></dl>
          <div class="r50-dr-acts">
            <button type="button" class="r50-pill" id="r50AltBtn" hidden></button>
            <button type="button" class="r50-pill" id="r3dStampBtn" hidden>印 · 现场落印</button>
          </div>
        </aside>
      </div>`;

    const chamber = $('#r50Chamber', container);
    const stage = $('#r50Stage', container);
    const rig = $('#r50Rig', container);
    const objWrap = $('#r50ObjWrap', container);
    const obj = $('#r50Obj', container);
    const sheen = $('#r50Sheen', container);
    const pinsBox = $('#r50Pins', container);
    const pinToast = $('#r50PinToast', container);
    const drawer = $('#r50Drawer', container);
    const spinBtn = $('#r50SpinBtn', container);
    const pinBtn = $('#r50PinBtn', container);
    const storyBtn = $('#r50StoryBtn', container);
    const altBtn = $('#r50AltBtn', container);
    const stampBtn = $('#r3dStampBtn', container);
    const stampCard = $('#r3dStampCard', container);
    const dustCv = $('#r50Dust', container);
    const dustCtx = dustCv.getContext('2d');

    const motes = Array.from({ length: 30 }, () => ({
      x: 0.12 + Math.random() * 0.76,
      y: Math.random(),
      r: 0.7 + Math.random() * 1.4,
      sp: 0.00022 + Math.random() * 0.00045,
      ph: Math.random() * Math.PI * 2
    }));

    function curSrc() {
      return (useAlt && model.altImg) ? model.altImg : model.img;
    }

    function showToastForPin(idx) {
      const h = model.hotspots[idx];
      if (!h || !showPins) { pinToast.hidden = true; return; }
      pinToast.innerHTML = `<span>0${idx + 1}</span><div><b>${h.title}</b><p>${h.desc}</p></div>`;
      pinToast.hidden = false;
    }

    function renderPins() {
      pinsBox.innerHTML = model.hotspots.map((h, i) =>
        `<button type="button" class="r50-pin${i === activePin ? ' on' : ''}" data-hi="${i}" style="left:${h.x}%;top:${h.y}%"><i>${i + 1}</i><span>${h.title}</span></button>`
      ).join('');
      pinsBox.hidden = !showPins;
      $$('.r50-pin', pinsBox).forEach(b => {
        b.onclick = e => {
          e.stopPropagation();
          activePin = +b.dataset.hi;
          $$('.r50-pin', pinsBox).forEach((x, j) => x.classList.toggle('on', j === activePin));
          const h = model.hotspots[activePin];
          try_ = ((h.x - 50) / 50) * 16;
          trx = -((h.y - 50) / 50) * 9;
          showToastForPin(activePin);
          if (window.XZ_CUE) window.XZ_CUE(392, 1.0);
        };
      });
      showToastForPin(activePin);
    }

    function syncUI() {
      $('#r50Poem', container).innerHTML = model.poem.replace(/\n/g, '<br>');
      $('#r50Sub', container).textContent = model.sub;
      obj.src = curSrc();
      obj.alt = model.sub;
      objWrap.style.setProperty('--base-sc', String(model.scale || 1));
      objWrap.style.setProperty('--lift', `${model.lift || 0}px`);

      $('#r50DrTitle', container).textContent = model.tab;
      $('#r50DrMeta', container).textContent = `${model.era} · ${model.dim}`;
      $('#r50DrBody', container).textContent = model.story;
      $('#r50DrFacts', container).innerHTML = model.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

      if (model.altImg) {
        altBtn.hidden = false;
        altBtn.textContent = useAlt ? (model.mainLabel || '返回全貌') : (model.altLabel || '微距特写');
        altBtn.classList.toggle('on', useAlt);
      } else {
        altBtn.hidden = true;
      }
      stampBtn.hidden = !model.canStamp;
      if (!model.canStamp) { stamped = false; stampCard.hidden = true; }
      renderPins();
    }

    function loadModel(k) {
      if (!RELICS[k]) return;
      curKey = k;
      model = RELICS[k];
      useAlt = false;
      activePin = 0;
      trx = 0; try_ = 0; tZoom = 1;
      syncUI();
      if (window.XZ_MINT_STAMP && model.siteId) window.XZ_MINT_STAMP(model.siteId, true);
      if (window.XZ_CUE) window.XZ_CUE(440, 1.0);
    }

    $$('.r50-switcher button', container).forEach(b => {
      b.onclick = () => {
        $$('.r50-switcher button', container).forEach(x => x.classList.toggle('on', x === b));
        loadModel(b.dataset.rk);
      };
    });

    spinBtn.onclick = () => {
      autoSpin = !autoSpin;
      spinBtn.classList.toggle('on', autoSpin);
    };
    pinBtn.onclick = () => {
      showPins = !showPins;
      pinBtn.classList.toggle('on', showPins);
      renderPins();
    };
    $('#r50ResetBtn', container).onclick = () => {
      trx = 0; try_ = 0; tZoom = 1;
      if (useAlt) { useAlt = false; syncUI(); }
    };
    storyBtn.onclick = () => {
      storyOpen = !storyOpen;
      drawer.hidden = !storyOpen;
      storyBtn.classList.toggle('on', storyOpen);
    };
    $('#r50DrawerX', container).onclick = () => {
      storyOpen = false;
      drawer.hidden = true;
      storyBtn.classList.remove('on');
    };
    altBtn.onclick = () => {
      useAlt = !useAlt;
      syncUI();
    };
    stampBtn.onclick = () => {
      stamped = !stamped;
      stampCard.hidden = !stamped;
      if (stamped && window.XZ_MINT_STAMP) window.XZ_MINT_STAMP('gs');
      if (window.XZ_CUE) window.XZ_CUE(293.66, 1.6);
    };
    $('#r50Zin', container).onclick = () => { tZoom = Math.min(2.15, tZoom + 0.24); };
    $('#r50Zout', container).onclick = () => { tZoom = Math.max(0.78, tZoom - 0.24); };

    // 拖拽 2.5D 观赏与滚轮缩放
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.r50-pin, .r50-zoom, .r50-stamp-card, .r50-pin-toast')) return;
      dragging = true; lx = e.clientX; ly = e.clientY;
      stage.setPointerCapture(e.pointerId);
      if (window.XZ_MINT_STAMP && model.siteId) window.XZ_MINT_STAMP(model.siteId, true);
    });
    stage.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      try_ = Math.max(-28, Math.min(28, try_ + dx * 0.16));
      trx = Math.max(-14, Math.min(14, trx - dy * 0.11));
    });
    ['pointerup', 'pointercancel'].forEach(ev => stage.addEventListener(ev, () => { dragging = false; }));
    stage.addEventListener('wheel', e => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 4) return;
      if (e.target.closest('.r50-obj-wrap')) {
        e.preventDefault();
        tZoom = Math.max(0.78, Math.min(2.15, tZoom + (e.deltaY < 0 ? 0.14 : -0.14)));
      }
    }, { passive: false });

    let t = 0;
    let cW = chamber.clientWidth || 1000, cH = chamber.clientHeight || 740;
    const syncDustSize = () => {
      cW = chamber.clientWidth || 1000;
      cH = chamber.clientHeight || 740;
      if (dustCv.width !== cW || dustCv.height !== cH) { dustCv.width = cW; dustCv.height = cH; }
    };
    syncDustSize();
    const onResize = () => syncDustSize();
    addEventListener('resize', onResize);

    const detailHost = document.getElementById('detail');
    let lastDustT = 0;

    function tick(now) {
      if (!alive || !document.body.contains(container) || (detailHost && detailHost.hidden)) {
        removeEventListener('resize', onResize);
        return;
      }
      t += 0.016;
      const targetY = (!dragging && autoSpin) ? Math.sin(t * 0.65) * 11.5 : try_;
      const targetX = (!dragging && autoSpin) ? Math.cos(t * 0.48) * 3.4 : trx;
      ry += (targetY - ry) * 0.08;
      rx += (targetX - rx) * 0.08;
      zoom += (tZoom - zoom) * 0.1;

      objWrap.style.transform = `translateY(var(--lift, 0px)) scale(${(zoom * (model.scale || 1)).toFixed(3)}) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) translateZ(26px)`;

      if (!lastDustT || now - lastDustT >= 32) {
        lastDustT = now;
        dustCtx.clearRect(0, 0, cW, cH);
        for (const m of motes) {
          m.y -= m.sp * 1.9;
          if (m.y < -0.04) { m.y = 1.04; m.x = 0.15 + Math.random() * 0.7; }
          const mx = (m.x + Math.sin(t * 0.55 + m.ph) * 0.012) * cW - ry * 0.9;
          const my = m.y * cH;
          const al = 0.10 + 0.24 * (0.5 + 0.5 * Math.sin(t * 1.9 + m.ph));
          dustCtx.fillStyle = `rgba(242, 224, 188, ${al.toFixed(3)})`;
          dustCtx.beginPath();
          dustCtx.arc(mx, my, m.r, 0, Math.PI * 2);
          dustCtx.fill();
        }
      }
      requestAnimationFrame(tick);
    }

    syncUI();
    requestAnimationFrame(tick);
  }

  window.XZ_RELIC3D = { mount: mountRelicStage, RELICS };
})();
