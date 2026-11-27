/* ==========================================================================
   汉韵彭城 · V38 彭城暗夜流金真实地理导览地图 & 全路线站内精细引导引擎
   - 真实徐州 WGS84 经纬度 Web Mercator 投影（覆盖故黄河、云龙湖、九景与 1/2/3 号线）
   - 双底图模式：「流金舆图」（100% 离线秒开国风古舆图）×「实景街道」（暗夜高清街道瓦片叠加）
   - 全部 22 条核心接驳路段 × 双向 44 组精细分段实景指引（出入口 / 里程 / 转弯地标 / 贴士）
   - 站内镜头跟飞模拟导览（平滑推拉镜头 + 朱雀引路光点沿真实路网行进 + 自动/手动步进播报）
   ========================================================================== */
(function () {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const X = window.XZ;
  if (!X) return;

  /* ---------- 1. 真实地理节点库（九景 + 铁路枢纽 + 核心地铁换乘站） ---------- */
  const NODES = {
    east: { id: 'east', n: '徐州东站', kind: 'hub', tag: '高铁枢纽 · 1号线起点', lat: 34.2673, lng: 117.3025 },
    rail: { id: 'rail', n: '徐州站', kind: 'hub', tag: '火车站 · 1/3号线换乘', lat: 34.2667, lng: 117.2063 },
    ps:   { id: 'ps',   n: '彭城广场站', kind: 'stn', tag: '1/2号线核心换乘', lat: 34.2654, lng: 117.1828 },
    hs:   { id: 'hs',   n: '户部山站', kind: 'stn', tag: '2号线古城门户', lat: 34.2591, lng: 117.1846 },
    xmt:  { id: 'xmt',  n: '戏马台', kind: 'site', tag: '壹 · 秦末霸王点将台', lat: 34.2557, lng: 117.1842 },
    gs:   { id: 'gs',   n: '龟山汉墓', kind: 'site', tag: '贰 · 西汉楚王地宫', lat: 34.3085, lng: 117.1315 },
    sz:   { id: 'sz',   n: '狮子山楚王陵', kind: 'site', tag: '叁 · 汉兵马俑出土地', lat: 34.2708, lng: 117.2218 },
    bwg:  { id: 'bwg',  n: '徐州博物馆', kind: 'site', tag: '肆 · 乾隆行宫金缕玉衣', lat: 34.2521, lng: 117.1807 },
    hbs:  { id: 'hbs',  n: '户部山古民居', kind: 'site', tag: '伍 · 明清古院落群', lat: 34.2585, lng: 117.1821 },
    hlw:  { id: 'hlw',  n: '回龙窝', kind: 'site', tag: '陆 · 清代青砖老巷', lat: 34.2600, lng: 117.1863 },
    wm:   { id: 'wm',   n: '文庙街区', kind: 'site', tag: '柒 · 彭城七里北端', lat: 34.2690, lng: 117.1815 },
    yls:  { id: 'yls',  n: '云龙山', kind: 'site', tag: '捌 · 苏轼放鹤九节山', lat: 34.2490, lng: 117.1790 },
    ylh:  { id: 'ylh',  n: '云龙湖', kind: 'site', tag: '玖 · 5A 城市山水客厅', lat: 34.2380, lng: 117.1560 }
  };

  /* ---------- 2. 真实徐州地理骨架（水系 / 山体 / 主干道 / 地铁 1·2·3 号线） ---------- */
  const YUNLONG_LAKE = [
    [34.2498, 117.1672], [34.2485, 117.1578], [34.2452, 117.1455], [34.2408, 117.1365],
    [34.2342, 117.1345], [34.2286, 117.1392], [34.2258, 117.1488], [34.2266, 117.1610],
    [34.2314, 117.1695], [34.2382, 117.1718], [34.2448, 117.1704]
  ];
  const XIAONAN_LAKE = [
    [34.2254, 117.1492], [34.2222, 117.1475], [34.2194, 117.1540], [34.2202, 117.1636],
    [34.2248, 117.1656], [34.2264, 117.1580]
  ];
  const OLD_YELLOW_RIVER = [
    [34.3035, 117.1140], [34.2940, 117.1360], [34.2855, 117.1570], [34.2775, 117.1730],
    [34.2742, 117.1845], [34.2738, 117.1985], [34.2756, 117.2130], [34.2792, 117.2320],
    [34.2830, 117.2580], [34.2850, 117.2880], [34.2865, 117.3100]
  ];
  const MOUNTAINS = [
    { name: '云龙山', lat: 34.2462, lng: 117.1782, rx: 0.0046, ry: 0.0115, rot: -0.18 },
    { name: '户部山', lat: 34.2570, lng: 117.1830, rx: 0.0036, ry: 0.0028, rot: 0.1 },
    { name: '龟山',   lat: 34.3088, lng: 117.1318, rx: 0.0068, ry: 0.0042, rot: -0.25 },
    { name: '狮子山', lat: 34.2712, lng: 117.2224, rx: 0.0064, ry: 0.0044, rot: 0.15 },
    { name: '泉山',   lat: 34.2258, lng: 117.1735, rx: 0.0062, ry: 0.0048, rot: 0.3 }
  ];
  const ROADS = [
    { name: '淮海东 / 西路', major: true, pts: [[34.2642, 117.1220], [34.2650, 117.1540], [34.2654, 117.1828], [34.2662, 117.2063], [34.2666, 117.2460], [34.2673, 117.3025]] },
    { name: '彭城七里文脉轴', axis: true, pts: [[34.2742, 117.1818], [34.2690, 117.1815], [34.2654, 117.1828], [34.2600, 117.1842], [34.2585, 117.1825], [34.2557, 117.1836], [34.2521, 117.1807], [34.2490, 117.1790]] },
    { name: '中山南 / 北路', major: false, pts: [[34.3060, 117.1790], [34.2820, 117.1805], [34.2654, 117.1812], [34.2480, 117.1810], [34.2260, 117.1825]] },
    { name: '和平大道', major: false, pts: [[34.2528, 117.1720], [34.2535, 117.1940], [34.2546, 117.2240], [34.2558, 117.2680], [34.2580, 117.3020]] },
    { name: '湖东路 / 环湖路', major: false, pts: [[34.2512, 117.1710], [34.2442, 117.1715], [34.2368, 117.1705], [34.2320, 117.1560], [34.2380, 117.1560]] },
    { name: '复兴路 / 煤港路', major: false, pts: [[34.2667, 117.2063], [34.2810, 117.1960], [34.2940, 117.1720], [34.3030, 117.1500], [34.3085, 117.1315]] }
  ];
  const METRO_LINES = [
    {
      name: '1号线', color: '#C84B3E',
      stations: [
        ['路窝', 34.2620, 117.1220], ['韩山', 34.2636, 117.1440], ['人民广场', 34.2646, 117.1635],
        ['彭城广场', 34.2654, 117.1828, 1], ['民主北路', 34.2660, 117.1945], ['徐州火车站', 34.2667, 117.2063, 1],
        ['子房山', 34.2666, 117.2225], ['铜山路', 34.2665, 117.2390], ['黄山垅', 34.2666, 117.2550],
        ['医科大学', 34.2669, 117.2740], ['金龙湖', 34.2671, 117.2895], ['徐州东站', 34.2673, 117.3025, 1]
      ]
    },
    {
      name: '2号线', color: '#4E82AD',
      stations: [
        ['客运北站', 34.3120, 117.1780], ['九里山', 34.2960, 117.1802], ['庆云桥', 34.2770, 117.1822],
        ['彭城广场', 34.2654, 117.1828, 1], ['户部山', 34.2591, 117.1846, 1],
        ['师大云龙校区', 34.2508, 117.1862], ['中心医院', 34.2422, 117.1912], ['淮塔', 34.2345, 117.1972]
      ]
    },
    {
      name: '3号线', color: '#4F8F74',
      stations: [
        ['下淀', 34.2890, 117.2078], ['白云山', 34.2775, 117.2070], ['徐州火车站', 34.2667, 117.2063, 1],
        ['天桥', 34.2572, 117.2045], ['和平大桥', 34.2468, 117.2015], ['淮塔', 34.2345, 117.1972]
      ]
    }
  ];

  /* ---------- 3. 全部 22 条核心路段 × 双向 44 组精细路径坐标与实景引导词 ---------- */
  const ROUTE_SPEC = {
    'east|ps': {
      dist: '11.6 公里', line: '1号线', color: '#C84B3E',
      pts: [[34.2673, 117.3025], [34.2671, 117.2895], [34.2669, 117.2740], [34.2666, 117.2550], [34.2665, 117.2390], [34.2666, 117.2225], [34.2667, 117.2063], [34.2660, 117.1945], [34.2654, 117.1828]],
      fwd: { title: '乘地铁 1 号线 · 西行 10 站至彭城广场', gate: '徐州东站地下 1 号线站台（往路窝方向）', detail: '经金龙湖、乔家湖、医科大学、庆丰路、黄山垅、铜山路、子房山、徐州火车站、民主北路共 10 站，于「彭城广场站」下车。', tip: '高铁出站按蓝色地铁标识直行约 4 分钟即达安检口，站内无缝换乘 2 号线。' },
      rev: { title: '乘地铁 1 号线 · 东行 10 站至徐州东站', gate: '彭城广场站 1 号线站台（往徐州东站方向）', detail: '从市中心一路向东乘坐 10 站直达终点「徐州东站」，全程地下贯通不堵车。', tip: '建议提前预留至少 45 分钟（含地铁 22 分钟及高铁站安检候车）。' }
    },
    'rail|ps': {
      dist: '2.3 公里', line: '1号线', color: '#C84B3E',
      pts: [[34.2667, 117.2063], [34.2660, 117.1945], [34.2654, 117.1828]],
      fwd: { title: '乘地铁 1 号线 · 2 站直达彭城广场', gate: '徐州火车站地铁站（往路窝方向）', detail: '过民主北路站，第 2 站即抵城市核心枢纽「彭城广场站」。', tip: '下车后可站内直接换乘 2 号线南下户部山，或出站北行游文庙街区。' },
      rev: { title: '乘地铁 1 号线 · 2 站返回徐州火车站', gate: '彭城广场站 1 号线站台（往徐州东站方向）', detail: '乘 2 站经民主北路抵达「徐州火车站」，站内通道直通铁路进站口。', tip: '高峰期发车间隔约 5–6 分钟，十分快捷。' }
    },
    'ps|hs': {
      dist: '0.9 公里', line: '2号线', color: '#4E82AD',
      pts: [[34.2654, 117.1828], [34.2624, 117.1839], [34.2591, 117.1846]],
      fwd: { title: '站内换乘 2 号线 · 南行 1 站至户部山站', gate: '彭城广场站 2 号线站台（往新城区东方向）', detail: '按站内蓝色「2号线」地贴换乘，仅乘 1 站即达「户部山站」。', tip: '去回龙窝走 4 号口最快，去戏马台/户部山古民居出站后即见坡道指示牌。' },
      rev: { title: '乘地铁 2 号线 · 北行 1 站回彭城广场', gate: '户部山站 2 号线站台（往客运北站方向）', detail: '乘 1 站返回「彭城广场站」，可站内换乘 1 号线前往火车站或徐州东站。', tip: '若时间充裕，也可沿彭城路步行约 12 分钟顺道感受老城街景。' }
    },
    'ps|wm': {
      dist: '720 米', line: '步行', color: '#E2BE78',
      pts: [[34.2654, 117.1828], [34.2672, 117.1822], [34.2690, 117.1815]],
      fwd: { title: '沿彭城路向北漫步 · 抵文庙街区', gate: '彭城广场站北侧出口（彭城路）', detail: '出站后沿彭城路北行约 720 米，途经老城商业街与鼓楼片区，见飞檐牌坊即入「文庙街区」。', tip: '此段为「彭城七里」文脉轴北段，傍晚亮灯后市集与古建相映最出片。' },
      rev: { title: '沿彭城路向南步行 · 回彭城广场站', gate: '文庙街区南牌坊口', detail: '出棂星门沿彭城路笔直南行约 720 米，即回「彭城广场」地铁换乘枢纽。', tip: '沿途遍布老字号烙馍卷馓子与特色小吃，适合边逛边走。' }
    },
    'hs|hlw': {
      dist: '260 米', line: '步行', color: '#E2BE78',
      pts: [[34.2591, 117.1846], [34.2596, 117.1856], [34.2600, 117.1863]],
      fwd: { title: '出 4 号口东行 260 米 · 步入回龙窝老巷', gate: '2号线户部山站 4 号口', detail: '出站向东穿过解放路人行横道，沿青砖院墙步行约 4 分钟即达「回龙窝」主街口。', tip: '建议先看城墙博物馆，再钻进“三井”老巷喝茶打卡红灯笼夜景。' },
      rev: { title: '出回龙窝西口 · 步行 4 分钟至户部山站', gate: '回龙窝解放路出口', detail: '过解放路向西直行约 260 米即抵地铁 2 号线「户部山站」4 号口。', tip: '夜游结束后乘 2 号线返程非常方便。' }
    },
    'hs|hbs': {
      dist: '380 米', line: '步行', color: '#E2BE78',
      pts: [[34.2591, 117.1846], [34.2588, 117.1833], [34.2585, 117.1821]],
      fwd: { title: '循青石坡道上山 · 探户部山古民居', gate: '2号线户部山站西侧出口', detail: '出站向西经状元街口拾级而上约 380 米，层层叠叠的明清砖雕门楼渐次展开。', tip: '山坡多石阶，穿舒适平底鞋更轻松；逛完可无缝步行上戏马台。' },
      rev: { title: '沿石阶巷下行 · 返户部山地铁站', gate: '户部山古民居东侧山脚口', detail: '顺山势向东下坡步行约 6 分钟，直达地铁 2 号线「户部山站」。', tip: '山脚街边有徐州香包、剪纸手工艺小铺可顺路挑选伴手礼。' }
    },
    'hs|xmt': {
      dist: '520 米', line: '步行', color: '#E2BE78',
      pts: [[34.2591, 117.1846], [34.2574, 117.1845], [34.2557, 117.1842]],
      fwd: { title: '沿项王路登高 520 米 · 登西楚戏马台', gate: '2号线户部山站南侧出口', detail: '出站南行转入项王路，沿古阶坡道缓步上行约 8 分钟，见朱红三孔台门即达「戏马台」。', tip: '免费开放但需提前线上实名预约，16:30 停止入园，注意把握登台时间。' },
      rev: { title: '出戏马台门下行 · 返回户部山站', gate: '戏马台项王路主入口', detail: '下台阶沿项王路北行约 520 米，途经户部山古玩街直抵地铁 2 号线「户部山站」。', tip: '若顺路可拐入旁侧回龙窝品尝把子肉或蜜三刀。' }
    },
    'wm|hlw': {
      dist: '1.35 公里', line: '步行', color: '#E2BE78',
      pts: [[34.2690, 117.1815], [34.2654, 117.1828], [34.2624, 117.1848], [34.2600, 117.1863]],
      fwd: { title: '纵贯「彭城七里」中段 · 文庙漫步至回龙窝', gate: '文庙街区南门（彭城路）', detail: '沿彭城路向南步行经彭城广场、钟鼓楼街区，在解放路左转前行即抵「回龙窝」，全程约 1.35 公里。', tip: '这是徐州老城最具烟火气的 Citywalk 精华轴，沿途古今建筑交错。' },
      rev: { title: '沿彭城七里北上 · 回龙窝漫步至文庙', gate: '回龙窝西北口', detail: '沿解放路转彭城路一路北行约 20 分钟，途经彭城广场直达「文庙街区」。', tip: '如果走累了，也可以在户部山站乘 2 号线坐 1 站到彭城广场省力。' }
    },
    'hlw|hbs': {
      dist: '360 米', line: '步行', color: '#E2BE78',
      pts: [[34.2600, 117.1863], [34.2593, 117.1842], [34.2585, 117.1821]],
      fwd: { title: '穿解放路登坡 · 回龙窝直连户部山', gate: '回龙窝西门（解放路）', detail: '过马路向西沿户部山石坡上行约 360 米（5 分钟），由低洼老巷切换至高台明清大院。', tip: '一低一高两座清代街区仅隔一条马路，强烈推荐串联游览。' },
      rev: { title: '下山过街 · 户部山步入回龙窝', gate: '户部山古民居东口', detail: '顺石阶下行穿过解放路即进入「回龙窝」青砖巷道，仅需约 5 分钟。', tip: '傍晚从户部山看日落下来，正赶上回龙窝华灯初上。' }
    },
    'hbs|xmt': {
      dist: '340 米', line: '步行', color: '#E2BE78',
      pts: [[34.2585, 117.1821], [34.2571, 117.1832], [34.2557, 117.1842]],
      fwd: { title: '沿山顶石阶巷南行 · 户部山直通戏马台', gate: '户部山古民居南侧石巷', detail: '两处同在户部山巅，沿余家大院旁青石巷向南缓步上行约 340 米即见「戏马台」红墙。', tip: '一路高台古韵，登上戏马台可俯瞰徐州老城天际线。' },
      rev: { title: '出戏马台漫步古巷 · 抵户部山古民居', gate: '戏马台西侧步道', detail: '沿山顶石阶巷向北轻行约 5 分钟即达郑家大院、余家大院等明清宅院群。', tip: '可在民俗博物馆院落内寻访老徐州婚俗与砖雕门楼。' }
    },
    'xmt|bwg': {
      dist: '1.05 公里', line: '步行', color: '#E2BE78',
      pts: [[34.2557, 117.1842], [34.2538, 117.1826], [34.2521, 117.1807]],
      fwd: { title: '沿项王路转和平路南行 · 抵徐州博物馆', gate: '戏马台项王路入口', detail: '下山沿项王路向西南步行约 1 公里（15 分钟），穿过和平路绿荫大道即见云龙山北麓「徐州博物馆」。', tip: '博物馆免费但周一闭馆，记得提前在官方公众号预约入馆时段。' },
      rev: { title: '出博物馆北行 1 公里 · 登戏马台', gate: '徐州博物馆正门（和平路）', detail: '沿和平路向东北转项王路上行约 15 分钟即达「戏马台」山门。', tip: '看完金缕玉衣后再登霸王点将台，两汉与楚汉历史完美衔接。' }
    },
    'bwg|yls': {
      dist: '380 米', line: '步行', color: '#E2BE78',
      pts: [[34.2521, 117.1807], [34.2505, 117.1798], [34.2490, 117.1790]],
      fwd: { title: '毗邻直通 · 博物馆步行 5 分钟进云龙山北门', gate: '徐州博物馆南侧广场', detail: '徐州博物馆背倚云龙山北麓，出馆门向西南缓行约 380 米即见「云龙山北门石牌坊」。', tip: '登山步道坡度平缓、松柏蔽日，约 25 分钟即可登顶放鹤亭俯瞰云龙湖。' },
      rev: { title: '下云龙山北门 · 5 分钟直达徐州博物馆', gate: '云龙山北门牌坊', detail: '出石牌坊向东北步行约 380 米即到「徐州博物馆」入口广场。', tip: '适合上午先登云龙山吸氧，午后入馆静赏汉代珍宝。' }
    },
    'yls|ylh': {
      dist: '2.1 公里', line: '步行', color: '#E2BE78',
      pts: [[34.2490, 117.1790], [34.2465, 117.1715], [34.2418, 117.1640], [34.2380, 117.1560]],
      fwd: { title: '下山西行穿湖东路 · 步入云龙湖滨水长堤', gate: '云龙山西坡出口', detail: '从云龙山向西下行至湖东路，跨过湖畔绿道沿苏公塔/长堤漫步约 25 分钟即抵「云龙湖」核心湖岸。', tip: '傍晚落日时分从山顶看湖再下山沿湖吹风，是徐州最经典山水动线。' },
      rev: { title: '沿湖东路东行上坡 · 至云龙山登山口', gate: '云龙湖东岸滨湖公园', detail: '离开湖堤沿湖东路向东北漫步约 25 分钟抵达「云龙山」登山步道入口。', tip: '如果带老人小孩，也可选乘景区游 2 路公交接驳至云龙山站。' }
    },
    'bwg|ylh': {
      dist: '3.2 公里', line: '公交', color: '#D49A48',
      pts: [[34.2521, 117.1807], [34.2512, 117.1710], [34.2442, 117.1715], [34.2368, 117.1680], [34.2380, 117.1560]],
      fwd: { title: '乘游 2 路公交 · 博物馆直达云龙湖畔', gate: '和平路「云龙山」公交站', detail: '在博物馆门前乘游 2 路向西经湖东路沿湖行驶，于「云龙湖 / 滨湖公园」站下车（约 15 分钟）。', tip: '下车处步行可达徐州汉画像石艺术馆，傍晚可赏湖畔落日。' },
      rev: { title: '乘游 2 路公交 · 云龙湖返回徐州博物馆', gate: '湖东路「云龙湖」公交站', detail: '乘游 2 路向东北行驶约 15 分钟至「云龙山」站下车即抵徐州博物馆。', tip: '实时公交到站时间建议出发前稍作确认。' }
    },
    'ps|bwg': {
      dist: '2.1 公里', line: '公交', color: '#D49A48',
      pts: [[34.2654, 117.1828], [34.2590, 117.1812], [34.2535, 117.1810], [34.2521, 117.1807]],
      fwd: { title: '乘游 2 路 / 11 路 · 彭城广场直达博物馆', gate: '彭城广场南侧公交站（中山南路）', detail: '沿中山南路一路向南行驶 3–4 站至「云龙山 / 博物馆」站下车，全程约 15 分钟。', tip: '沿途经过老城商业区与户部山脚，下车步行 2 分钟即入博物馆广场。' },
      rev: { title: '乘游 2 路 / 11 路 · 博物馆回彭城广场', gate: '和平路「云龙山」公交站', detail: '北行约 15 分钟直达「彭城广场」，方便换乘地铁 1/2 号线。', tip: '若想多看古迹，也可选择步行 15 分钟经戏马台慢游回城。' }
    },
    'rail|gs': {
      dist: '9.4 公里', line: '公交', color: '#D49A48',
      pts: [[34.2667, 117.2063], [34.2795, 117.1965], [34.2925, 117.1740], [34.3025, 117.1510], [34.3085, 117.1315]],
      fwd: { title: '乘 13 / 21 路公交 · 徐州站直达龟山汉墓', gate: '徐州站前广场公交枢纽', detail: '乘车向西北过复兴北路、故黄河、煤港路，约 35 分钟至「龟山汉墓」站下车即达景区。', tip: '位于城区西北方向，建议预留充足往返时间；景区含圣旨博物馆与点石园。' },
      rev: { title: '乘 13 / 21 路公交 · 龟山汉墓回徐州站', gate: '龟山汉墓景区正门公交站', detail: '沿煤港路向东南行驶约 35 分钟返回「徐州火车站」，可无缝接驳地铁 1/3 号线。', tip: '下午闭园前高峰打车略紧张，可提前留意返程班次。' }
    },
    'ps|gs': {
      dist: '8.2 公里', line: '打车', color: '#86A9C9',
      pts: [[34.2654, 117.1828], [34.2780, 117.1735], [34.2910, 117.1560], [34.3020, 117.1415], [34.3085, 117.1315]],
      fwd: { title: '打车西北行 8.2 公里 · 彭城广场直达龟山汉墓', gate: '彭城广场地面上车点', detail: '经中山北路跨过故黄河，转入九里山西路与襄王北路直抵「龟山汉墓」景区大门，车程约 25 分钟。', tip: '市区去龟山汉墓最省时的方案，多人同行人均性价比极高。' },
      rev: { title: '打车东南行 · 龟山汉墓返回彭城广场', gate: '龟山汉墓景区停车场出口', detail: '经襄王路与中山北路返回市中心「彭城广场」，约 25 分钟直达繁华商圈与地铁枢纽。', tip: '返程可直接去回龙窝或文庙开启彭城夜游。' }
    },
    'gs|bwg': {
      dist: '9.8 公里', line: '打车', color: '#86A9C9',
      pts: [[34.3085, 117.1315], [34.2950, 117.1430], [34.2780, 117.1620], [34.2630, 117.1765], [34.2521, 117.1807]],
      fwd: { title: '两汉专程接驳 · 龟山汉墓打车至徐州博物馆', gate: '龟山汉墓正门上车点', detail: '沿西二环/苏堤路向南行驶约 30 分钟，直抵云龙山北麓「徐州博物馆」。', tip: '上午先走龟山楚王地宫，下午进博物馆看金缕玉衣，两汉脉络一气呵成。' },
      rev: { title: '打车西北行 · 徐州博物馆直赴龟山汉墓', gate: '徐州博物馆和平路门前', detail: '沿苏堤路向北跨故黄河驶向龟山景区，约 30 分钟抵达。', tip: '建议避开 16:30 停止入园时间，留出 1.5 小时深度参观甬道与墓室。' }
    },
    'rail|sz': {
      dist: '2.6 公里', line: '打车', color: '#86A9C9',
      pts: [[34.2667, 117.2063], [34.2682, 117.2145], [34.2708, 117.2218]],
      fwd: { title: '向东短途打车 2.6 公里 · 抵狮子山楚王陵', gate: '徐州站东侧出口上车点', detail: '沿津浦东路向东穿过铁路立交转兵马俑路，约 12 分钟即达「汉文化景区 / 狮子山楚王陵」。', tip: '兵马俑博物馆与狮子山楚王陵同在汉文化景区内，可一并深度游览。' },
      rev: { title: '向西打车 12 分钟 · 狮子山返徐州站', gate: '狮子山汉文化景区西门', detail: '沿兵马俑路向西行驶约 2.6 公里即回「徐州火车站」，方便转乘地铁 1/3 号线。', tip: '返程去市中心也可直接打车至彭城广场。' }
    },
    'ps|sz': {
      dist: '4.4 公里', line: '打车', color: '#86A9C9',
      pts: [[34.2654, 117.1828], [34.2668, 117.2020], [34.2688, 117.2140], [34.2708, 117.2218]],
      fwd: { title: '沿淮海东路东行 4.4 公里 · 抵狮子山楚王陵', gate: '彭城广场东侧路面', detail: '沿淮海东路穿过老城向东经火车站北侧转入兵马俑路，车程约 15 分钟即抵狮子山景区。', tip: '这里是金缕玉衣与成列汉兵马俑的原出土地，必看山腹凿石墓道。' },
      rev: { title: '沿淮海东路西行 · 狮子山返彭城广场', gate: '狮子山汉文化景区门前', detail: '向西行驶约 15 分钟直达市中心「彭城广场」，无缝衔接户部山与回龙窝。', tip: '看完地下军阵，回市中心吃一顿地道地锅鸡或徐州烧烤。' }
    },
    'east|sz': {
      dist: '8.6 公里', line: '打车', color: '#86A9C9',
      pts: [[34.2673, 117.3025], [34.2685, 117.2740], [34.2698, 117.2480], [34.2708, 117.2218]],
      fwd: { title: '高铁站出站向西直达 · 狮子山楚王陵', gate: '徐州东站西广场网约车/出租车区', detail: '沿和平大道/鲲鹏路向西快速行驶约 8.6 公里（25 分钟），直抵城东「狮子山汉文化景区」。', tip: '高铁抵达徐州后的第一站优选，顺路不折返！' },
      rev: { title: '向东行驶 25 分钟 · 狮子山赴徐州东站', gate: '狮子山景区南门上车点', detail: '沿城东主干道向东直行约 8.6 公里抵达「徐州东站」高铁出发层。', tip: '城东前往高铁站最为顺路，适合作为离徐前的压轴一站。' }
    },
    'sz|bwg': {
      dist: '5.4 公里', line: '打车', color: '#86A9C9',
      pts: [[34.2708, 117.2218], [34.2625, 117.2110], [34.2548, 117.1965], [34.2521, 117.1807]],
      fwd: { title: '沿和平大道西行 · 狮子山直连徐州博物馆', gate: '狮子山汉文化景区南门', detail: '沿三环东路转和平大道一路向西约 5.4 公里（20 分钟），直达云龙山北麓「徐州博物馆」。', tip: '先在狮子山看玉衣出土地宫，再到博物馆近赏金缕玉衣真品，绝佳呼应！' },
      rev: { title: '沿和平大道东行 · 博物馆赴狮子山楚王陵', gate: '徐州博物馆正门（和平路）', detail: '沿和平大道向东行驶约 20 分钟转兵马俑路，直抵「狮子山楚王陵」。', tip: '两处串联正好拼出最硬核的两汉文化寻踪半日线。' }
    }
  };

  function getEdgeDetail(a, b, fallbackLeg) {
    const k1 = `${a}|${b}`, k2 = `${b}|${a}`;
    if (ROUTE_SPEC[k1]) {
      const s = ROUTE_SPEC[k1];
      return { pts: s.pts, dist: s.dist, color: s.color, line: s.line, ...s.fwd };
    }
    if (ROUTE_SPEC[k2]) {
      const s = ROUTE_SPEC[k2];
      return { pts: s.pts.slice().reverse(), dist: s.dist, color: s.color, line: s.line, ...s.rev };
    }
    const na = NODES[a], nb = NODES[b];
    const pts = na && nb ? [[na.lat, na.lng], [nb.lat, nb.lng]] : [];
    return {
      pts,
      dist: fallbackLeg ? `约 ${Math.max(0.3, (fallbackLeg.min * 0.25)).toFixed(1)} 公里` : '—',
      color: '#E2BE78',
      line: fallbackLeg ? fallbackLeg.mode : '步行',
      title: `${na ? na.n : a} → ${nb ? nb.n : b}`,
      gate: `${na ? na.n : ''}出发`,
      detail: fallbackLeg ? fallbackLeg.txt : '按指引前往下一地标。',
      tip: '可放大地图查看途经街区与水系坐标。'
    };
  }

  /* ---------- 4. 地图渲染 & 交互镜头引擎 ---------- */
  const host = $('#pcMapWrap');
  if (!host) return;
  const cv = $('#pcMapCanvas', host);
  const ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Web Mercator 投影助手（世界坐标 0..1）
  const lngToX = lng => (lng + 180) / 360;
  const latToY = lat => {
    const r = (lat * Math.PI) / 180;
    return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2;
  };

  // 地图镜头状态（中心经纬度 + 缩放等级 zoom 11.4 ~ 16.2）
  const cam = {
    lat: 34.2640, lng: 117.1960, zoom: 12.45,
    tLat: 34.2640, tLng: 117.1960, tZoom: 12.45
  };
  const WECHAT = document.documentElement.classList.contains('wechat-mobile');
  let W = 800, H = 560, dpr = WECHAT ? 1 : Math.min(1.5, devicePixelRatio || 1);
  let tileMode = true; // 唯一默认模式：暗夜古金中文实景街道地图（断网时自动静默保底）
  const tileCache = new Map();

  // 当前路线与站内引导状态
  let activeSteps = []; // [{from,to,mode,min,pts,dist,color,line,title,gate,detail,tip,stopNo?}]
  let activeStops = []; // 多站拼程节点 ID 列表
  let guideIdx = -1;    // -1 = 全景总览；>=0 = 正在精细引导第 guideIdx 段
  let tourPlaying = false;
  let tourProg = 0;     // 0..1 朱雀流金光点在当前路段的飞行进度
  let userPos = null;   // {lat, lng, simulated}
  let hoverNode = null;
  let selectedNode = null;

  const worldSize = z => 256 * Math.pow(2, z);
  function llToScreen(lat, lng) {
    const ws = worldSize(cam.zoom);
    const sx = (lngToX(lng) - lngToX(cam.lng)) * ws + W * 0.5;
    const sy = (latToY(lat) - latToY(cam.lat)) * ws + H * 0.5;
    return [sx, sy];
  }
  function screenToLL(sx, sy) {
    const ws = worldSize(cam.zoom);
    const wx = lngToX(cam.lng) + (sx - W * 0.5) / ws;
    const wy = latToY(cam.lat) + (sy - H * 0.5) / ws;
    const lng = wx * 360 - 180;
    const n = Math.PI - 2 * Math.PI * wy;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return [lat, lng];
  }

  function fitPoints(pts, padFactor = 0.68, maxZ = 15.2) {
    if (!pts || !pts.length) return;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const [la, ln] of pts) {
      if (la < minLat) minLat = la;
      if (la > maxLat) maxLat = la;
      if (ln < minLng) minLng = ln;
      if (ln > maxLng) maxLng = ln;
    }
    const dx = Math.max(0.00018, Math.abs(lngToX(maxLng) - lngToX(minLng)));
    const dy = Math.max(0.00018, Math.abs(latToY(minLat) - latToY(maxLat)));
    // 顶部留工具栏 70px、底部留实景引导浮舱 155px，令路线优雅落在中上黄金视区
    const usableH = Math.max(220, H - 220);
    const zx = Math.log2((W * padFactor) / (256 * dx));
    const zy = Math.log2((usableH * padFactor) / (256 * dy));
    const z = Math.max(11.6, Math.min(maxZ, Math.min(zx, zy)));
    cam.tZoom = z;
    cam.tLng = (minLng + maxLng) * 0.5;
    // 将中心点略微南移（约 55px），使发光路线居中显示在底部引导浮舱上方
    const ws = worldSize(z);
    const midY = (latToY(minLat) + latToY(maxLat)) * 0.5 + 52 / ws;
    const n = Math.PI - 2 * Math.PI * midY;
    cam.tLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    W = Math.max(320, r.width);
    H = Math.max(380, r.height);
    const width = Math.floor(W * dpr);
    const height = Math.floor(H * dpr);
    if (cv.width === width && cv.height === height) return;
    cv.width = width;
    cv.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  /* ---------- 5. 暗夜中文实景街道瓦片层（免 Key 零水印，玄夜流金滤镜调色，离线自动安全回退） ---------- */
  function drawRealTiles() {
    const z = Math.max(11, Math.min(16, Math.round(cam.zoom)));
    const scale = Math.pow(2, cam.zoom - z);
    const tilePx = 256 * scale;
    const ws = worldSize(z);
    const cx = lngToX(cam.lng) * ws;
    const cy = latToY(cam.lat) * ws;
    const halfW = (W * 0.5) / scale;
    const halfH = (H * 0.5) / scale;
    const tx0 = Math.floor((cx - halfW) / 256);
    const tx1 = Math.floor((cx + halfW) / 256);
    const ty0 = Math.floor((cy - halfH) / 256);
    const ty1 = Math.floor((cy + halfH) / 256);

    const dark = document.documentElement.classList.contains('theme-obsidian');
    let drawn = 0;
    ctx.save();
    // 中文实景路网一键反相调为「玄夜古金暗夜风」，完全融入全站美学（零 API Key、零水印）
    ctx.filter = dark
      ? 'invert(0.93) hue-rotate(196deg) saturate(0.46) brightness(0.80) contrast(1.12) sepia(0.26)'
      : 'sepia(0.18) saturate(0.78) brightness(0.99)';
    for (let tx = tx0; tx <= tx1; tx++) {
      for (let ty = ty0; ty <= ty1; ty++) {
        const key = `amap/${z}/${tx}/${ty}`;
        let entry = tileCache.get(key);
        if (!entry) {
          const img = new Image();
          entry = { img, ok: false };
          tileCache.set(key, entry);
          img.onload = () => { entry.ok = true; };
          img.onerror = () => {
            if (!entry.fallback) {
              entry.fallback = true;
              img.src = `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
            } else {
              entry.ok = false;
            }
          };
          const sub = (Math.abs(tx + ty) % 4) + 1;
          img.src = `https://webrd0${sub}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=${tx}&y=${ty}&z=${z}`;
        }
        if (entry.ok) {
          const sx = (tx * 256 - cx) * scale + W * 0.5;
          const sy = (ty * 256 - cy) * scale + H * 0.5;
          ctx.drawImage(entry.img, sx, sy, tilePx + 0.6, tilePx + 0.6);
          drawn++;
        }
      }
    }
    ctx.restore();
    return drawn;
  }

  /* ---------- 6. 彭城暗夜流金古舆图绘制 ---------- */
  function drawPolyline(pts, close = false) {
    if (!pts.length) return;
    ctx.beginPath();
    pts.forEach(([la, ln], i) => {
      const [x, y] = llToScreen(la, ln);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    if (close) ctx.closePath();
  }

  function pointAlongPath(pts, t) {
    if (!pts.length) return [34.2654, 117.1828];
    if (pts.length === 1 || t <= 0) return pts[0];
    if (t >= 1) return pts[pts.length - 1];
    let total = 0;
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push(d);
      total += d;
    }
    if (total <= 1e-9) return pts[0];
    let target = t * total;
    for (let i = 0; i < segs.length; i++) {
      if (target <= segs[i] || i === segs.length - 1) {
        const f = segs[i] > 1e-9 ? target / segs[i] : 0;
        return [
          pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f,
          pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f
        ];
      }
      target -= segs[i];
    }
    return pts[pts.length - 1];
  }

  function drawMap(time) {
    const dark = document.documentElement.classList.contains('theme-obsidian');

    // 1) 底色：玄夜黛墨 / 素宣古纸
    const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.48, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    if (dark) {
      bgGrad.addColorStop(0, '#131823');
      bgGrad.addColorStop(0.62, '#0D1119');
      bgGrad.addColorStop(1, '#090C12');
    } else {
      bgGrad.addColorStop(0, '#F7F2E8');
      bgGrad.addColorStop(1, '#EBE2D2');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 默认铺设暗夜中文实景街道瓦片；仅在完全断网（drawn === 0）时静默兜底显示矢量水系骨架
    const drawnTiles = tileMode ? drawRealTiles() : 0;

    // 暗夜四周柔和暗角，令实景街道自然融入整站玄夜氛围
    if (drawnTiles > 0 && dark) {
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.48, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      vig.addColorStop(0, 'rgba(9, 12, 18, 0.04)');
      vig.addColorStop(0.75, 'rgba(9, 12, 18, 0.24)');
      vig.addColorStop(1, 'rgba(9, 12, 18, 0.58)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }

    // 仅当瓦片尚未就绪或离线时静默显示地理骨架，有实景街道时彻底隐去以免叠加杂乱
    const geoAlpha = drawnTiles > 0 ? 0 : 1;
    if (geoAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = geoAlpha;
    for (const m of MOUNTAINS) {
      const [mx, my] = llToScreen(m.lat, m.lng);
      const [ex, ey] = llToScreen(m.lat + m.ry, m.lng + m.rx);
      const rx = Math.abs(ex - mx), ry = Math.abs(ey - my);
      if (mx + rx < -40 || mx - rx > W + 40 || my + ry < -40 || my - ry > H + 40) continue;
      for (let k = 3; k >= 1; k--) {
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(m.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * (k / 3), ry * (k / 3), 0, 0, Math.PI * 2);
        ctx.fillStyle = dark ? `rgba(32, 46, 44, ${0.14 + (3 - k) * 0.05})` : `rgba(114, 134, 110, ${0.09 + (3 - k) * 0.04})`;
        ctx.fill();
        ctx.strokeStyle = dark ? `rgba(196, 172, 122, ${0.08 + (3 - k) * 0.05})` : `rgba(88, 108, 86, 0.22)`;
        ctx.lineWidth = 0.85;
        ctx.stroke();
        ctx.restore();
      }
      if (!tileMode) {
        ctx.fillStyle = dark ? 'rgba(182, 194, 184, 0.36)' : 'rgba(66, 84, 68, 0.56)';
        ctx.font = '11px "XZSerif", serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.name, mx, my + 4);
      }
    }

    // 4) 真实水系：云龙湖 + 小南湖 + 故黄河
    [YUNLONG_LAKE, XIAONAN_LAKE].forEach((poly, idx) => {
      drawPolyline(poly, true);
      ctx.fillStyle = dark ? 'rgba(24, 52, 72, 0.64)' : 'rgba(164, 196, 204, 0.52)';
      ctx.fill();
      ctx.strokeStyle = dark ? 'rgba(212, 180, 117, 0.28)' : 'rgba(72, 116, 126, 0.45)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      if (idx === 0 && !tileMode) {
        const [lx, ly] = llToScreen(34.2365, 117.1525);
        ctx.fillStyle = dark ? 'rgba(154, 196, 222, 0.48)' : 'rgba(48, 92, 108, 0.65)';
        ctx.font = '12px "XZSerif", serif';
        ctx.textAlign = 'center';
        ctx.fillText('云 龙 湖', lx, ly);
      }
    });

    // 故黄河古河道
    drawPolyline(OLD_YELLOW_RIVER, false);
    ctx.strokeStyle = dark ? 'rgba(34, 78, 98, 0.72)' : 'rgba(130, 174, 186, 0.65)';
    ctx.lineWidth = Math.max(4, (cam.zoom - 10.5) * 2.2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = dark ? 'rgba(212, 180, 117, 0.24)' : 'rgba(64, 108, 122, 0.38)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (!tileMode) {
      const [rx, ry] = llToScreen(34.2770, 117.1945);
      ctx.fillStyle = dark ? 'rgba(148, 192, 214, 0.48)' : 'rgba(56, 98, 112, 0.65)';
      ctx.font = '10.5px "XZSerif", serif';
      ctx.textAlign = 'center';
      ctx.fillText('故 黄 河', rx, ry - 8);
    }

    // 5) 城市主干道 & 彭城七里文脉轴
    for (const rd of ROADS) {
      drawPolyline(rd.pts, false);
      if (rd.axis) {
        ctx.strokeStyle = dark ? 'rgba(214, 168, 92, 0.34)' : 'rgba(158, 42, 34, 0.32)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([4, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = dark ? (rd.major ? 'rgba(220, 212, 194, 0.14)' : 'rgba(220, 212, 194, 0.085)') : 'rgba(54, 46, 38, 0.14)';
        ctx.lineWidth = rd.major ? 1.8 : 1.1;
        ctx.stroke();
      }
    }
    ctx.restore();
    }

    // 6) 徐州轨道交通 1 / 2 / 3 号线真实线网
    for (const line of METRO_LINES) {
      const pts = line.stations.map(s => [s[1], s[2]]);
      drawPolyline(pts, false);
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = dark ? 0.46 : 0.62;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;

      for (const st of line.stations) {
        const [sx, sy] = llToScreen(st[1], st[2]);
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
        const major = !!st[3];
        ctx.beginPath();
        ctx.arc(sx, sy, major ? 4.2 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = dark ? '#0E121B' : '#FAF6EE';
        ctx.fill();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = major ? 2 : 1.3;
        ctx.stroke();
        if (cam.zoom >= 13.8 && !major) {
          ctx.fillStyle = dark ? 'rgba(202, 210, 224, 0.56)' : 'rgba(60, 54, 48, 0.62)';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(st[0], sx, sy - 7);
        }
      }
    }

    // 7) 实时规划路线绘制（支持单程多段 + 一日多站串联 + 当前引导路段流金高亮）
    if (activeSteps.length) {
      activeSteps.forEach((st, idx) => {
        if (!st.pts || st.pts.length < 2) return;
        const isCur = guideIdx === idx;
        const dim = guideIdx >= 0 && !isCur;
        const isWalk = st.mode === '步行';

        // 外发光底线
        drawPolyline(st.pts, false);
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = isCur ? '#F5D693' : (st.color || '#E2BE78');
        ctx.globalAlpha = dim ? 0.24 : (isCur ? 0.42 : 0.28);
        ctx.lineWidth = isCur ? 11 : 7;
        ctx.stroke();

        // 主路线轨迹
        ctx.globalAlpha = dim ? 0.36 : 0.96;
        ctx.strokeStyle = isCur ? '#FBE3A9' : (st.color || '#E2BE78');
        ctx.lineWidth = isCur ? 4.2 : 3.2;
        if (isWalk) {
          ctx.setLineDash([7, 7]);
          ctx.lineDashOffset = -(time * 0.025);
        } else if (st.mode === '公交' || st.mode === '打车') {
          ctx.setLineDash([12, 6]);
          ctx.lineDashOffset = -(time * 0.032);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 当前引导路段：朱雀流金引导光点沿真实道路平滑巡航！
        if (isCur) {
          const [blat, blng] = pointAlongPath(st.pts, tourProg);
          const [bx, by] = llToScreen(blat, blng);
          ctx.save();
          const gr = ctx.createRadialGradient(bx, by, 2, bx, by, 22);
          gr.addColorStop(0, 'rgba(255, 246, 214, 0.98)');
          gr.addColorStop(0.38, 'rgba(232, 186, 98, 0.65)');
          gr.addColorStop(1, 'rgba(232, 186, 98, 0)');
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#FFFDF5';
          ctx.beginPath(); ctx.arc(bx, by, 5.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#C84B3E';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // 8) 用户定位点（若已开启定位）
    if (userPos) {
      const [ux, uy] = llToScreen(userPos.lat, userPos.lng);
      const pulse = 8 + (Math.sin(time * 0.005) * 0.5 + 0.5) * 14;
      ctx.save();
      ctx.beginPath(); ctx.arc(ux, uy, pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(110, 198, 255, 0.22)'; ctx.fill();
      ctx.beginPath(); ctx.arc(ux, uy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#6EC6FF'; ctx.fill();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#D8F0FF'; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(userPos.simulated ? '我的位置（彭城中心模拟）' : '我的位置', ux, uy - 12);
      ctx.restore();
    }

    // 9) 绘制九处景点 & 枢纽地标点（V60 智能防重叠标签避让：低缩放优先显景点与起终，放大后再显地铁换乘站）
    const routeNodeIds = new Set();
    activeSteps.forEach(s => { routeNodeIds.add(s.from); routeNodeIds.add(s.to); });
    const startId = activeSteps.length ? activeSteps[0].from : null;
    const endId = activeSteps.length ? activeSteps[activeSteps.length - 1].to : null;

    // 按优先级排序：起终点/悬停 > 路线途经 > 枢纽 > 景点 > 地铁站，确保重要标签永不被盖住
    const sortedNodes = Object.values(NODES).sort((a, b) => {
      const rank = nd => (nd.id === startId || nd.id === endId || (hoverNode && hoverNode.id === nd.id)) ? 0
        : (routeNodeIds.has(nd.id) ? 1 : (nd.kind === 'hub' ? 2 : (nd.kind === 'site' ? 3 : 4)));
      return rank(a) - rank(b);
    });
    const placedBoxes = [];
    const collides = (x1, y1, w, h) => {
      for (let i = 0; i < placedBoxes.length; i++) {
        const b = placedBoxes[i];
        if (x1 < b[2] && x1 + w > b[0] && y1 < b[3] && y1 + h > b[1]) return true;
      }
      return false;
    };

    sortedNodes.forEach(nd => {
      if (nd.kind === 'stn' && !routeNodeIds.has(nd.id)) return;
      const [x, y] = llToScreen(nd.lat, nd.lng);
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return;

      const isStart = nd.id === startId;
      const isEnd = nd.id === endId;
      const inRoute = routeNodeIds.has(nd.id);
      const isHov = hoverNode && hoverNode.id === nd.id;
      const isSel = selectedNode && selectedNode.id === nd.id;
      const stopIdx = activeStops.indexOf(nd.id);

      ctx.save();
      // 起终点或悬停脉冲环
      if (isStart || isEnd || isHov || isSel) {
        const pr = 11 + Math.sin(time * 0.004) * 3.5;
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, Math.PI * 2);
        ctx.strokeStyle = isEnd ? 'rgba(232, 198, 134, 0.72)' : 'rgba(232, 196, 122, 0.56)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 地标核心点
      const r = (isStart || isEnd || stopIdx >= 0) ? 7.5 : (nd.kind === 'site' ? 5.6 : 4.8);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isEnd ? '#D4B06A' : (isStart ? '#4F8F74' : (inRoute ? '#E8C57B' : (nd.kind === 'hub' ? '#4E82AD' : (dark ? '#1B2230' : '#FAF6EE'))));
      ctx.fill();
      ctx.strokeStyle = (isStart || isEnd || inRoute) ? '#FFF9EB' : (dark ? 'rgba(226, 198, 141, 0.78)' : '#9E2A22');
      ctx.lineWidth = (isStart || isEnd) ? 2.2 : 1.5;
      ctx.stroke();

      // 编号或起终字标
      if (isStart || isEnd || stopIdx >= 0) {
        ctx.fillStyle = isEnd ? '#0D1017' : (isStart ? '#FFFDF7' : '#0D1017');
        ctx.font = '700 9.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isStart ? '起' : (isEnd ? '终' : String(stopIdx + 1)), x, y + 0.5);
      }

      // 地标名称标签：低缩放屏蔽中转地铁站名，仅放大 (>=13.5) 时再显示，并启用真实包围盒防重叠
      const isStnHidden = nd.kind === 'stn' && !isStart && !isEnd && !isHov && cam.zoom < 13.5;
      const showLbl = !isStnHidden && (isStart || isEnd || inRoute || isHov || isSel || nd.kind === 'hub' || cam.zoom >= 12.1);
      if (showLbl) {
        const lbl = nd.n;
        ctx.font = (isStart || isEnd || isHov || inRoute) ? '600 12px "STSong", "Songti SC", serif' : '500 11px "STSong", "Songti SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const tw = ctx.measureText(lbl).width + 10;
        const th = 16;
        // 候选错位方位（优先正上，再尝试右上/左上/正下/右下/左下），确保零遮挡
        const offsets = [[0, -12], [tw * 0.45, -10], [-tw * 0.45, -10], [0, 22], [tw * 0.45, 20], [-tw * 0.45, 20]];
        let chosen = null;
        for (let oi = 0; oi < offsets.length; oi++) {
          const [ox, oy] = offsets[oi];
          const bx = x + ox - tw * 0.5;
          const by = y + oy - th;
          if (!collides(bx, by, tw, th)) {
            chosen = [ox, oy, bx, by];
            break;
          }
        }
        if (chosen || isStart || isEnd || isHov) {
          const [ox, oy, bx, by] = chosen || [0, -12, x - tw * 0.5, y - 12 - th];
          placedBoxes.push([bx - 2, by - 2, bx + tw + 2, by + th + 2]);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = dark ? 'rgba(9, 12, 18, 0.90)' : 'rgba(248, 243, 234, 0.94)';
          ctx.strokeText(lbl, x + ox, y + oy);
          ctx.fillStyle = (isStart || isEnd || isHov) ? '#FAF2DE' : (inRoute ? '#F0D394' : (dark ? 'rgba(226, 230, 240, 0.84)' : '#231E19'));
          ctx.fillText(lbl, x + ox, y + oy);
        }
      }
      ctx.restore();
    });

    // 10) 地图四周边框流金坐标刻度与比例尺
    ctx.save();
    const scaleKm = cam.zoom >= 14.5 ? 0.2 : (cam.zoom >= 13.4 ? 0.5 : (cam.zoom >= 12.2 ? 1 : 2));
    const [sx0] = llToScreen(34.26, 117.18);
    const [sx1] = llToScreen(34.26, 117.18 + scaleKm / 92.2);
    const barW = Math.max(36, Math.min(110, Math.abs(sx1 - sx0)));
    const bx = W - 26 - barW, by = H - 22;
    ctx.strokeStyle = dark ? 'rgba(212, 180, 117, 0.56)' : 'rgba(60, 50, 40, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + barW, by); ctx.lineTo(bx + barW, by - 4);
    ctx.stroke();
    ctx.fillStyle = dark ? 'rgba(212, 180, 117, 0.72)' : 'rgba(60, 50, 40, 0.72)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(scaleKm < 1 ? `${scaleKm * 1000} m` : `${scaleKm} km`, bx + barW, by - 7);
    ctx.restore();
  }

  /* ---------- 7. 主渲染循环（镜头平滑插值 + 引导光点自动推进；离屏自动休眠零耗电） ---------- */
  let lastT = performance.now();
  let mapInView = false;
  let mapRaf = 0;
  let lastIdleDraw = 0;

  function loop(now) {
    mapRaf = 0;
    if (!mapInView || document.hidden || document.body.classList.contains('ed-detail-open')) return;

    const dt = Math.min(0.08, Math.max(0.004, (now - lastT) / 1000));
    lastT = now;
    const ease = 1 - Math.exp(-dt * 7.5);
    const camMoving = Math.abs(cam.tLat - cam.lat) > 1e-6 || Math.abs(cam.tLng - cam.lng) > 1e-6 || Math.abs(cam.tZoom - cam.zoom) > 1e-4;
    if (camMoving) {
      cam.lat += (cam.tLat - cam.lat) * ease;
      cam.lng += (cam.tLng - cam.lng) * ease;
      cam.zoom += (cam.tZoom - cam.zoom) * ease;
    }

    if (guideIdx >= 0 && activeSteps[guideIdx]) {
      if (tourPlaying && !RM) {
        tourProg += dt * 0.22; // 约 4.5 秒丝滑走完一段，再优雅切往下一段
        if (tourProg >= 1) {
          if (guideIdx < activeSteps.length - 1) {
            setGuideStep(guideIdx + 1, true);
          } else {
            tourProg = 1;
            tourPlaying = false;
            renderGuideDock();
          }
        }
      }
    }

    const activeAnim = camMoving || tourPlaying || dragging;
    if (activeAnim || now - lastIdleDraw >= 55) {
      lastIdleDraw = now;
      drawMap(now);
    }
    mapRaf = requestAnimationFrame(loop);
  }

  const wakeMap = () => {
    if (mapInView && !mapRaf && !document.hidden && !document.body.classList.contains('ed-detail-open')) {
      lastT = performance.now();
      mapRaf = requestAnimationFrame(loop);
    }
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      const entry = es[0];
      mapInView = WECHAT ? entry.intersectionRatio >= 0.12 : entry.isIntersecting;
      if (mapInView) wakeMap();
    }, { rootMargin: WECHAT ? '0px' : '120px 0px', threshold: WECHAT ? 0.12 : 0 }).observe(host);
  } else {
    mapInView = true;
    wakeMap();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wakeMap(); });
  if (window.MutationObserver) {
    new MutationObserver(() => {
      if (!document.body.classList.contains('ed-detail-open')) wakeMap();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- 8. 交互：拖拽平移 / 按钮与 Ctrl+滚轮缩放 / 点击地标浮卡 ---------- */
  let dragging = false, dStart = null, dMoved = false;
  const hitNode = (mx, my) => {
    let best = null, bestD = 18;
    for (const nd of Object.values(NODES)) {
      const [x, y] = llToScreen(nd.lat, nd.lng);
      const d = Math.hypot(x - mx, y - my);
      if (d < bestD) { bestD = d; best = nd; }
    }
    return best;
  };

  cv.addEventListener('pointerdown', e => {
    dragging = true; dMoved = false;
    dStart = { x: e.clientX, y: e.clientY, lat: cam.tLat, lng: cam.tLng };
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    if (dragging && dStart) {
      const dx = e.clientX - dStart.x, dy = e.clientY - dStart.y;
      if (Math.hypot(dx, dy) > 4) dMoved = true;
      const ws = worldSize(cam.zoom);
      const nx = lngToX(dStart.lng) - dx / ws;
      const ny = latToY(dStart.lat) - dy / ws;
      cam.tLng = Math.max(117.08, Math.min(117.34, nx * 360 - 180));
      const n = Math.PI - 2 * Math.PI * ny;
      cam.tLat = Math.max(34.20, Math.min(34.33, (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))));
      return;
    }
    hoverNode = hitNode(mx, my);
    cv.style.cursor = hoverNode ? 'pointer' : 'grab';
  });
  cv.addEventListener('pointerup', e => {
    if (dragging && !dMoved) {
      const r = cv.getBoundingClientRect();
      const nd = hitNode(e.clientX - r.left, e.clientY - r.top);
      selectedNode = nd;
      renderNodePopover(nd);
    }
    dragging = false;
  });
  cv.addEventListener('pointercancel', () => { dragging = false; });
  cv.addEventListener('wheel', e => {
    // 仅按住 Ctrl 或双击放大，避免打断整页丝滑纵滚
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    cam.tZoom = Math.max(11.4, Math.min(16.0, cam.tZoom + (e.deltaY < 0 ? 0.55 : -0.55)));
  }, { passive: false });
  cv.addEventListener('dblclick', () => {
    cam.tZoom = Math.min(16.0, cam.tZoom + 0.9);
  });

  /* ---------- 9. 站内精细引导浮层 & 地标弹窗 ---------- */
  const dock = $('#pcGuideDock');
  const pop = $('#pcNodePop');

  function renderNodePopover(nd) {
    if (!pop) return;
    if (!nd) { pop.hidden = true; return; }
    const s = X.get(nd.id);
    pop.innerHTML = `
      <div class="pc-pop-hd">
        <div><small>${nd.tag}</small><h4>${nd.n}</h4></div>
        <button type="button" class="pc-pop-x" aria-label="关闭">×</button>
      </div>
      ${s ? `<p>${s.line} · ${s.go.l}</p>` : `<p>徐州核心交通枢纽，可直接设为行程起点或终点。</p>`}
      <div class="pc-pop-acts">
        <button type="button" data-as="from">设为起点</button>
        <button type="button" data-as="to">设为终点</button>
        ${s ? `<button type="button" class="pri" data-open="${nd.id}">入画观展 →</button>` : ''}
      </div>`;
    pop.hidden = false;
    $('.pc-pop-x', pop).onclick = () => { selectedNode = null; pop.hidden = true; };
    $('[data-as="from"]', pop).onclick = () => {
      const sel = $('#from');
      if (sel && [...sel.options].some(o => o.value === nd.id)) {
        sel.value = nd.id; sel.dispatchEvent(new Event('change'));
      }
      pop.hidden = true;
    };
    $('[data-as="to"]', pop).onclick = () => {
      const sel = $('#to');
      if (sel && [...sel.options].some(o => o.value === nd.id)) {
        sel.value = nd.id; sel.dispatchEvent(new Event('change'));
      }
      pop.hidden = true;
    };
    const op = $('[data-open]', pop);
    if (op) op.onclick = () => X.openDetail(nd.id);
  }

  function renderGuideDock() {
    if (!dock) return;
    if (!activeSteps.length) {
      dock.innerHTML = `<div class="pc-gd-idle"><span>选择起点与终点或任一精品主题线，即可在地图内开启逐步实景引导。</span></div>`;
      return;
    }
    const totMin = activeSteps.reduce((a, b) => a + (b.min || 0), 0);
    if (guideIdx < 0) {
      const stName = NODES[activeSteps[0].from]?.n || '';
      const edName = NODES[activeSteps[activeSteps.length - 1].to]?.n || '';
      dock.innerHTML = `
        <div class="pc-gd-summary">
          <div>
            <small>路线全景已就绪 · 共 ${activeSteps.length} 段 · 约 ${totMin} 分钟</small>
            <b>${stName} → ${edName}</b>
          </div>
          <div class="pc-gd-btns">
            <button type="button" class="pri" id="pcStartTour">▶ 开始站内分段引导</button>
          </div>
        </div>`;
      $('#pcStartTour', dock).onclick = () => setGuideStep(0, true);
      return;
    }
    const cur = activeSteps[guideIdx];
    const fromN = NODES[cur.from]?.n || cur.from;
    const toN = NODES[cur.to]?.n || cur.to;
    dock.innerHTML = `
      <div class="pc-gd-active">
        <div class="pc-gd-top">
          <span class="pc-gd-badge" style="--mc:${cur.color || '#E2BE78'}">${cur.line || cur.mode}</span>
          <span class="pc-gd-step">第 ${guideIdx + 1} / ${activeSteps.length} 步 · ${cur.dist} · 约 ${cur.min} 分钟</span>
          <div class="pc-gd-nav">
            <button type="button" id="pcPrevStep" ${guideIdx === 0 ? 'disabled' : ''}>‹ 上一步</button>
            <button type="button" id="pcTogglePlay">${tourPlaying ? '⏸ 暂停' : '▶ 巡航'}</button>
            <button type="button" id="pcNextStep" ${guideIdx === activeSteps.length - 1 ? 'disabled' : ''}>下一步 ›</button>
            <button type="button" class="ghost" id="pcOverview">全景</button>
          </div>
        </div>
        <div class="pc-gd-body">
          <h4>${cur.title}</h4>
          <p class="pc-gd-gate"><span>出入口 / 节点</span>${cur.gate}（${fromN} → ${toN}）</p>
          <p class="pc-gd-desc">${cur.detail}</p>
          <p class="pc-gd-tip">✦ 彭城贴士：${cur.tip}</p>
        </div>
      </div>`;
    $('#pcPrevStep', dock).onclick = () => setGuideStep(Math.max(0, guideIdx - 1), false);
    $('#pcNextStep', dock).onclick = () => setGuideStep(Math.min(activeSteps.length - 1, guideIdx + 1), false);
    $('#pcTogglePlay', dock).onclick = () => {
      if (tourProg >= 1 && guideIdx === activeSteps.length - 1) setGuideStep(0, true);
      else { tourPlaying = !tourPlaying; renderGuideDock(); }
    };
    $('#pcOverview', dock).onclick = () => {
      guideIdx = -1; tourPlaying = false;
      fitActiveRoute();
      renderGuideDock();
      syncTicketHighlight();
    };
  }

  function syncTicketHighlight() {
    $$('#ticket .leg').forEach((li, i) => li.classList.toggle('pc-cur-leg', i === guideIdx));
  }

  function setGuideStep(idx, autoPlay) {
    if (!activeSteps.length) return;
    guideIdx = Math.max(0, Math.min(activeSteps.length - 1, idx));
    tourProg = 0;
    tourPlaying = !!autoPlay;
    const st = activeSteps[guideIdx];
    if (st && st.pts && st.pts.length) fitPoints(st.pts, 0.56, 15.6);
    renderGuideDock();
    syncTicketHighlight();
    if (window.XZ_CUE) window.XZ_CUE(329.63 + guideIdx * 34, 1.1);
  }

  function fitActiveRoute() {
    const allPts = [];
    activeSteps.forEach(s => (s.pts || []).forEach(p => allPts.push(p)));
    if (allPts.length) fitPoints(allPts, 0.68, 15.0);
    else fitPoints(Object.values(NODES).map(n => [n.lat, n.lng]), 0.80, 12.6);
  }

  /* ---------- 10. 绑定单程规划 / 多站一日拼程 / 3 条主题精品线 / 定位 ---------- */
  function loadSingleRoute(fromId, toId, autoStart = false) {
    activeStops = [];
    if (!fromId || !toId || fromId === toId) {
      activeSteps = []; guideIdx = -1; tourPlaying = false;
      fitActiveRoute(); renderGuideDock(); return;
    }
    const p = X.path(fromId, toId);
    if (!p || !p.legs.length) return;
    let cur = fromId;
    activeSteps = p.legs.map(leg => {
      const det = getEdgeDetail(cur, leg.to, leg);
      const step = { from: cur, to: leg.to, mode: leg.mode, min: leg.min, ...det };
      cur = leg.to;
      return step;
    });
    guideIdx = -1; tourPlaying = false;
    fitActiveRoute();
    renderGuideDock();
    // 同步绑定左侧路引列表点击某一段 -> 直接聚焦该段站内引导
    setTimeout(() => {
      $$('#ticket .leg').forEach((li, i) => {
        li.style.cursor = 'pointer';
        li.title = '点击在地图中聚焦引导此段';
        li.onclick = () => setGuideStep(i, true);
      });
    }, 30);
    if (autoStart) setGuideStep(0, true);
  }

  function loadMultiRoute(startHub, stopIds, autoStart = false) {
    activeStops = stopIds.slice();
    const seq = startHub && startHub !== 'none' ? [startHub, ...stopIds] : stopIds.slice();
    activeSteps = [];
    for (let i = 0; i < seq.length - 1; i++) {
      const p = X.path(seq[i], seq[i + 1]);
      if (!p) continue;
      let cur = seq[i];
      p.legs.forEach(leg => {
        const det = getEdgeDetail(cur, leg.to, leg);
        activeSteps.push({ from: cur, to: leg.to, mode: leg.mode, min: leg.min, ...det });
        cur = leg.to;
      });
    }
    guideIdx = -1; tourPlaying = false;
    fitActiveRoute();
    renderGuideDock();
    if (autoStart && activeSteps.length) setGuideStep(0, true);
  }

  // 监听主站路引变化 & 一日拼程变化
  X.on('plan', ([f, t]) => loadSingleRoute(f, t, false));
  X.on('trip', list => {
    const bf = $('#bFrom')?.value || 'east';
    if (list && list.length) loadMultiRoute(bf, list, false);
  });

  // 地图顶部工具栏：底图切换 / 缩放 / 复位 / 我的位置 / 主题精品线一键载入
  $$('#pcBasemapToggle button').forEach(btn => {
    btn.onclick = () => {
      tileMode = btn.dataset.mode === 'street';
      $$('#pcBasemapToggle button').forEach(b => {
        const on = b === btn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
      });
    };
  });
  $('#pcZoomIn')?.addEventListener('click', () => { cam.tZoom = Math.min(16.0, cam.tZoom + 0.75); });
  $('#pcZoomOut')?.addEventListener('click', () => { cam.tZoom = Math.max(11.4, cam.tZoom - 0.75); });
  $('#pcResetView')?.addEventListener('click', () => { guideIdx = -1; tourPlaying = false; fitActiveRoute(); renderGuideDock(); });

  $('#pcLocateBtn')?.addEventListener('click', () => {
    const btn = $('#pcLocateBtn');
    const applyPos = (lat, lng, sim) => {
      userPos = { lat, lng, simulated: sim };
      // 找最近地标或枢纽并自动规划到当前终点
      let near = 'ps', bestD = 1e9;
      Object.values(NODES).forEach(nd => {
        const d = Math.hypot(nd.lat - lat, nd.lng - lng);
        if (d < bestD) { bestD = d; near = nd.id; }
      });
      const toSel = $('#to');
      const target = (toSel && toSel.value && toSel.value !== near) ? toSel.value : 'xmt';
      const fromSel = $('#from');
      if (fromSel && [...fromSel.options].some(o => o.value === near)) {
        fromSel.value = near;
        fromSel.dispatchEvent(new Event('change'));
      } else {
        loadSingleRoute(near, target, true);
      }
      cam.tLat = lat; cam.tLng = lng; cam.tZoom = 14.2;
      if (btn) btn.textContent = sim ? '◎ 已定位至彭城中心' : '◎ 已定位当前位置';
    };
    if (navigator.geolocation) {
      if (btn) btn.textContent = '◎ 定位中…';
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude: la, longitude: ln } = pos.coords;
          const inXuzhou = la > 34.10 && la < 34.45 && ln > 117.0 && ln < 117.45;
          if (inXuzhou) applyPos(la, ln, false);
          else applyPos(34.2654, 117.1828, true);
        },
        () => applyPos(34.2654, 117.1828, true),
        { timeout: 3500 }
      );
    } else {
      applyPos(34.2654, 117.1828, true);
    }
  });

  // 3 条官方精品主题线快捷按钮
  $$('#pcPresetRoutes button').forEach(btn => {
    btn.onclick = () => {
      const r = (window.ROUTES || []).find(x => x.id === btn.dataset.rid);
      if (!r) return;
      $$('#pcPresetRoutes button').forEach(b => b.classList.toggle('on', b === btn));
      loadMultiRoute('east', r.ids, true);
    };
  });

  // 暴漏全局接口供详情页「站内地图引导」直接调用！
  window.XZ_MAP = {
    guideTo(toId, fromId = 'east') {
      const fSel = $('#from'), tSel = $('#to');
      if (fSel && [...fSel.options].some(o => o.value === fromId)) fSel.value = fromId;
      if (tSel && [...tSel.options].some(o => o.value === toId)) {
        tSel.value = toId;
        tSel.dispatchEvent(new Event('change'));
      }
      // 切回地图引导主视图
      const tab = $('#goTabs button[data-gtab="plan"]');
      if (tab) tab.click();
      document.getElementById('go')?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      setTimeout(() => loadSingleRoute(fromId, toId, true), 380);
    },
    startTour() {
      if (activeSteps.length) setGuideStep(0, true);
    },
    loadMulti: loadMultiRoute
  };

  // 初始化默认加载「徐州东站 → 户部山古民居」真实路线
  setTimeout(() => {
    const f = $('#from')?.value || 'east';
    const t = $('#to')?.value || 'hbs';
    loadSingleRoute(f, t, false);
  }, 120);
})();
