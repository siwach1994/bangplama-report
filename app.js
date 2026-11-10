/* รายการรับแจ้ง · กลุ่มมดงาน — LIFF SPA (vanilla JS ไม่ต้อง build) */
(function () {
  'use strict';

  var CFG = window.APP_CONFIG || {};
  var DEMO = /[?&]demo=1\b/.test(location.search) || !CFG.LIFF_ID || !CFG.API_URL;
  var RETENTION = Number(CFG.RETENTION_DAYS) || 90;
  var GROUP_LABEL = CFG.GROUP_LABEL || 'กลุ่มมดงาน';

  // ---------- วันที่/ข้อความ ----------

  var TZ = 7 * 3600 * 1000;
  var DOW = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  var DOW_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  var MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var MON_LONG = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  function keyOf(ts) { return new Date(ts + TZ).toISOString().slice(0, 10); }
  function todayKey() { return keyOf(Date.now()); }
  function parts(key) { return key.split('-').map(Number); }
  function addDays(key, n) { var p = parts(key); return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10); }
  function dow(key) { var p = parts(key); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
  function thaiDate(key) { var p = parts(key); return DOW[dow(key)] + ' ' + p[2] + ' ' + MON[p[1] - 1] + ' ' + (p[0] + 543); }
  function shortDate(key) { var p = parts(key); return p[2] + ' ' + MON[p[1] - 1]; }
  function thaiMonth(key) { var p = parts(key); return MON_LONG[p[1] - 1] + ' ' + (p[0] + 543); }
  function nowHHMM() { return new Date(Date.now() + TZ).toISOString().slice(11, 16); }
  function isDateKey(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ''); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtPhone(p) {
    p = String(p || '');
    if (p.length === 10) return p.slice(0, 3) + '-' + p.slice(3, 6) + '-' + p.slice(6);
    if (p.length === 9 && p.indexOf('02') === 0) return p.slice(0, 2) + '-' + p.slice(2, 5) + '-' + p.slice(5);
    if (p.length === 9) return p.slice(0, 3) + '-' + p.slice(3, 6) + '-' + p.slice(6);
    return p;
  }
  function navUrl(c) { return 'https://www.google.com/maps/dir/?api=1&destination=' + c.lat + ',' + c.lng; }
  function hasCoords(c) { return c.lat != null && c.lng != null && c.lat !== ''; }

  // ---------- ไอคอน (เส้น) ----------

  var ICONS = {
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    nav: '<path d="m3 11 18-8-8 18-2-8-8-2z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    pinOff: '<path d="M5.4 7.4A7 7 0 0 0 5 10c0 4.8 7 11 7 11s1.9-1.7 3.7-4"/><path d="M8.6 3.9A7 7 0 0 1 19 10c0 1.4-.6 3-1.4 4.5"/><path d="m3 3 18 18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    square: '<rect x="4" y="4" width="16" height="16" rx="3"/>',
    checkSquare: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    auto: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    eyeOff: '<path d="m3 3 18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-3 4"/><path d="M6.6 6.6A13 13 0 0 0 2 12c1 2.5 5 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    map: '<path d="m9 4-6 3v13l6-3 6 3 6-3V4l-6 3-6-3z"/><path d="M9 4v13M15 7v13"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>'
  };
  function icon(name, size) {
    size = size || 20;
    return '<svg class="ic" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  var SOURCES = {
    keyword: { label: 'พิมพ์ได้รับแจ้ง', icon: 'keyboard' },
    phone_place: { label: 'เบอร์+สถานที่', icon: 'auto', auto: 'ระบบจับเองจากเบอร์และคำบอกสถานที่ ควรเหลือบดูว่าใช่รายการรับแจ้งจริง' },
    place_problem: { label: 'สถานที่+อาการ', icon: 'auto', auto: 'ระบบจับเองจากข้อความที่บอกทั้งสถานที่และอาการเสีย (ไม่มีเบอร์) ควรเหลือบดูว่าใช่รายการรับแจ้งจริง' },
    media_text: { label: 'ข้อความ+รูป/รายชื่อ', icon: 'auto', auto: 'ระบบจับเองจากข้อความบอกสถานที่หรืออาการเสียที่ส่งตามรูปหรือรายชื่อผู้ติดต่อ ควรเหลือบดูว่าใช่รายการรับแจ้งจริง' },
    photo_location: { label: 'รูป+พิกัด', icon: 'image' }
  };
  var PART_LABELS = {
    keyword: 'ข้อความ “ได้รับแจ้ง”', phone_place: 'ข้อความเบอร์+สถานที่', place_problem: 'ข้อความสถานที่+อาการ', media_text: 'ข้อความประกอบรูป/รายชื่อ',
    image: 'รูป', location: 'แชร์ตำแหน่ง', maplink: 'ลิงก์แผนที่', contact: 'รายชื่อผู้ติดต่อ (.vcf)'
  };
  var PART_ICONS = { text: 'message', image: 'image', location: 'pin', maplink: 'link', contact: 'user' };
  var AUDIT_LABELS = {
    tick: 'ติ๊กว่าดำเนินการแล้ว', untick: 'ยกเลิกการติ๊ก',
    hide: 'ซ่อน · ไม่ใช่รายการรับแจ้ง', unhide: 'คืนรายการ',
    start: 'รับงาน', work: 'บันทึกผลการปฏิบัติงาน', group: 'รวมเป็นงานเดียว', samejob: 'เคสซ้ำ · รวมเข้าเคสเดิม', repeat: 'ดับอีกรอบที่จุดเดิม', unrepeat: 'ยกเลิกดับอีกรอบ', ungroup: 'เอาออกจากงานรวม'
  };

  // หน้าบันทึกผลการปฏิบัติงาน (ยังไม่มี API จริง เปิดเฉพาะโหมดตัวอย่าง หรือเมื่อ config.js ตั้ง WORKLOG: true)
  var WORKLOG = DEMO || !!CFG.WORKLOG;
  // ช่องตามแบบฟอร์มที่ช่างพิมพ์ในกลุ่มอยู่แล้ว (เรียงตามเดิม) req = ต้องกรอกก่อนบันทึกว่าเสร็จ
  var WORK_FIELDS = [
    { k: 'date', label: 'วันที่', type: 'date', req: true },
    { k: 'outAt', label: 'เวลาไฟดับ', type: 'time', req: true },
    { k: 'device', label: 'รหัสอุปกรณ์ป้องกัน', ph: 'เช่น BAM02F-02', upper: true },
    { k: 'area', label: 'บริเวณ', ph: 'เช่น ไลน์แยกวัดมณีวรรณ', req: true },
    { k: 'trans', label: 'PEA หม้อแปลง', ph: 'ถ้ามี' },
    { k: 'fix', label: 'สาเหตุที่แก้ไข', ph: 'เช่น ฟิวส์แรงสูงขาด เฟส A', req: true, area: true },
    { k: 'cause', label: 'สาเหตุที่พบ', ph: 'เช่น ช็อตงู', req: true },
    { k: 'used', label: 'อุปกรณ์ที่ใช้', ph: 'เช่น ฟิวส์ 15A 1 เส้น' },
    { k: 'onAt', label: 'เวลาจ่ายไฟ', type: 'time', req: true },
    { k: 'by', label: 'นาย (ชื่อ ตำแหน่ง)', ph: 'เช่น วิศวะ ใจมั่น ผปร', req: true }
  ];
  // ข้อความที่ส่งเข้ากลุ่มขึ้นต้นด้วยคำนี้ ฝั่ง parser จะข้าม (ไม่ให้กลายเป็นรับแจ้งใหม่)
  var WORK_MARK = '📝 ผลปฏิบัติงาน';

  // ---------- API ----------

  function ApiError(msg, code) { this.message = msg; this.code = code; }

  var LiveApi = {
    call: function (action, payload) {
      var body = Object.assign({ action: action, idToken: liff.getIDToken() }, payload || {});
      return fetch(CFG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j.me) state.me = j.me; // เซิร์ฟเวอร์แนบชื่อผู้ใช้มาทุกคำตอบ
        if (j.ok) return j.data;
        if (j.code === 401) {
          liff.logout();
          liff.login({ redirectUri: location.href });
        }
        if (j.code === 403) {
          forgetDay();
          fatal(j.error);
          return new Promise(function () {}); // ไม่มีสิทธิ์ หยุดตรงนี้
        }
        throw new ApiError(j.error || 'เกิดข้อผิดพลาด', j.code);
      }, function () {
        throw new ApiError('เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', 0);
      });
    }
  };

  var Api = DEMO ? createDemoApi() : LiveApi;

  // ---------- state ----------

  var state = {
    screen: 'day',
    date: todayKey(),
    view: 'list',
    filter: 'all',
    groupFilter: '', // ชื่อกลุ่มที่เลือกดู ('' = ทุกกลุ่ม) ใช้เมื่อรับแจ้งจากหลายกลุ่ม
    day: null,
    dayError: null,
    hiddenOpen: false,
    me: { name: '' },
    caseData: null,
    galleryIdx: 0,
    days: null,
    searchQ: '',
    searchResults: null,
    sheetCaseId: null,
    pending: null,
    pendingBefore: null,
    loading: false
  };
  var loadSeq = 0;
  var lastLoadAt = 0;
  var map = null;
  var markerLayer = null;
  var photoCache = {};
  var photoPending = {};

  var app = document.getElementById('app');
  var overlay = document.getElementById('overlay');

  // ---------- router ----------

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var i = h.indexOf('/');
    return i < 0 ? { name: h || 'day', arg: '' } : { name: h.slice(0, i), arg: decodeURIComponent(h.slice(i + 1)) };
  }

  function route() {
    closeOverlay();
    var r = parseHash();
    if (r.name === 'case' && r.arg) return showCase(r.arg);
    if (r.name === 'history') return showHistory();
    if (r.name === 'pending') return showPending(isDateKey(r.arg) ? r.arg : addDays(todayKey(), 1));
    return showDay(isDateKey(r.arg) ? r.arg : state.date);
  }

  /** โหลดข้อมูลหน้าปัจจุบันใหม่โดยไม่ล้างหน้าจอ (ปุ่มรีเฟรช / กลับมาเปิดแอปอีกครั้ง) */
  function reloadCurrent() {
    if (state.screen === 'day') showDay(state.date, true);
    else if (state.screen === 'pending') showPending(state.pendingBefore, true);
    else if (state.screen === 'history') showHistory(true);
    else if (state.screen === 'case' && state.caseData) showCase(state.caseData.caseId, true);
  }

  function go(hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  }

  // ---------- หน้ารายการรายวัน ----------

  function showDay(date, silent) {
    var changed = state.date !== date || !state.day || state.day.date !== date;
    state.screen = 'day';
    state.date = date;
    if (!silent) {
      destroyMap();
      if (changed) {
        // แสดงรายการที่เคยโหลดไว้ในเครื่องก่อน ระหว่างรอข้อมูลล่าสุดจากเซิร์ฟเวอร์
        state.day = savedDay(date);
        state.hiddenOpen = false;
      }
      state.dayError = null;
      state.loading = true;
      renderDay();
      window.scrollTo(0, 0);
    } else {
      setLoading(true);
    }
    var fromCache = !!(state.day && state.day._local);
    var seq = ++loadSeq;
    lastLoadAt = Date.now();
    Api.call('day', { date: date }).then(function (d) {
      if (seq !== loadSeq) return;
      state.day = d;
      state.dayError = null;
      state.loading = false;
      setLoading(false);
      saveDay(d);
      setTimeout(loadLeaflet, 2500); // โหลดแผนที่รอไว้เงียบๆ กดแท็บแผนที่แล้วขึ้นเร็ว
      if ((silent || fromCache) && state.view === 'map' && map) refresh(); else { destroyMap(); renderDay(); }
      if (silent) toast('อัปเดตรายการล่าสุดแล้ว');
    }, function (e) {
      if (seq !== loadSeq) return;
      state.loading = false;
      setLoading(false);
      if (silent || fromCache) { toast(e.message, true); return; }
      state.dayError = e.message;
      renderDay();
    });
  }

  /** รายการของวันที่เลือก กรองตามกลุ่มที่เลือก (ถ้ามี) */
  function groupCases() {
    var list = state.day ? state.day.cases : [];
    return state.groupFilter ? list.filter(function (c) { return c.group === state.groupFilter; }) : list;
  }

  /** ชื่อกลุ่มที่มีรายการในวันนั้น เรียงตามจำนวน (มีกลุ่มเดียว = ไม่ต้องแสดงตัวกรอง) */
  function dayGroups() {
    var n = {};
    (state.day ? state.day.cases : []).forEach(function (c) { if (c.group) n[c.group] = (n[c.group] || 0) + 1; });
    return Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).map(function (g) { return { name: g, n: n[g] }; });
  }

  function counts() {
    var list = groupCases();
    var done = list.filter(function (c) { return c.done; }).length;
    return { total: list.length, done: done, todo: list.length - done };
  }

  function renderDay() {
    var today = todayKey();
    var html = demoFlag() +
      '<header class="topbar"><div class="topbar-text"><div class="topbar-sub">' + esc(GROUP_LABEL) + '</div>' +
      '<h1>รายการรับแจ้ง</h1></div>' +
      '<button class="icon-btn' + (state.loading ? ' spinning' : '') + '" data-action="refresh" aria-label="โหลดรายการล่าสุด">' + icon('refresh', 22) + '</button></header>' +
      '<div class="datebar hero">' +
      '<button class="icon-btn" data-action="prev-day" aria-label="วันก่อนหน้า">' + icon('chevL', 22) + '</button>' +
      (state.date === today
        ? '<div class="datebar-mid"><div class="datebar-date">' + thaiDate(state.date) + '</div>' +
          '<div class="datebar-range">วันนี้ · รับแจ้ง 00:00 – 23:59</div></div>'
        : '<button class="datebar-mid" data-action="today" aria-label="กลับไปวันนี้"><div class="datebar-date">' + thaiDate(state.date) + '</div>' +
          '<div class="datebar-range">รับแจ้ง 00:00 – 23:59 · <u>กลับไปวันนี้</u></div></button>') +
      '<button class="icon-btn" data-action="next-day" aria-label="วันถัดไป"' + (state.date >= today ? ' disabled' : '') + '>' + icon('chevR', 22) + '</button>' +
      '</div>' +
      '<main class="content has-nav overlap">' + summaryHtml() +
      '<div id="view">' + dayViewHtml() + '</div>' +
      '<p class="foot-note">เก็บจากข้อความ “ได้รับแจ้ง”, เบอร์+สถานที่ หรือรูป+พิกัด · เก็บข้อมูล ' + RETENTION + ' วัน</p>' +
      '</main>' + bottomNav(state.view === 'map' ? 'map' : 'list');
    app.innerHTML = html;
    if (state.view === 'map' && state.day) initMap();
    hydratePhotos(app);
  }

  function summaryHtml() {
    if (!state.day) {
      return '<section id="summary" class="card summary" aria-busy="true"><div class="skel" style="height:34px;width:60%"></div>' +
        '<div class="skel" style="height:8px;margin-top:12px"></div><div class="skel" style="height:14px;width:40%;margin-top:10px"></div></section>';
    }
    var n = counts();
    var pct = n.total ? Math.round(n.done / n.total * 100) : 0;
    var chip = n.total === 0 ? '<span class="status hidden">ยังไม่มีรายการ</span>'
      : n.todo === 0 ? '<span class="status done">' + icon('check', 14) + 'ครบทุกรายการ</span>'
        : '<span class="status todo">ยังไม่ติ๊ก ' + n.todo + ' รายการ</span>';
    return '<section id="summary" class="card summary summary-hero">' +
      ringHtml(pct, n.total) +
      '<div class="sum-text"><div class="summary-num"><span class="big">' + n.done + '</span><span class="of">/ ' + n.total + '</span></div>' +
      '<div class="lbl">ดำเนินการแล้ว</div><div class="sum-chips">' + chip + '</div></div></section>';
  }

  /** วงแหวนความคืบหน้า */
  function ringHtml(pct, total) {
    var r = 30, c = 2 * Math.PI * r;
    var off = c * (1 - pct / 100);
    return '<div class="ring" role="progressbar" aria-label="ดำเนินการแล้ว ' + pct + '%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
      '<svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#E6E8EE" stroke-width="8"/>' +
      '<circle cx="38" cy="38" r="' + r + '" fill="none" stroke="' + (total && pct === 100 ? '#0F766E' : 'url(#ringg)') + '" stroke-width="8" stroke-linecap="round" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 38 38)"/>' +
      '<defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F766E"/><stop offset="1" stop-color="#14A396"/></linearGradient></defs></svg>' +
      '<span class="ring-pct mono">' + pct + '%</span></div>';
  }

  /** แถบเมนูล่าง */
  function bottomNav(active) {
    var badge = state.day ? (state.day.carryoverCount || 0) +
      (state.date === todayKey() ? state.day.cases.filter(function (c) { return !c.done; }).length : 0) : 0;
    var item = function (key, label, ic, attrs, n) {
      return '<' + (attrs.href ? 'a href="' + attrs.href + '"' : 'button data-action="' + attrs.action + '"' + (attrs.view ? ' data-view="' + attrs.view + '"' : '')) +
        ' class="nav-item' + (active === key ? ' active' : '') + '"' + (active === key ? ' aria-current="page"' : '') + '>' +
        '<span class="nav-ic">' + icon(ic, 22) + (n ? '<span class="nav-badge">' + (n > 99 ? '99+' : n) + '</span>' : '') + '</span>' +
        '<span class="nav-label">' + label + '</span></' + (attrs.href ? 'a' : 'button') + '>';
    };
    var dayHref = '#/day/' + (state.date || todayKey());
    return '<nav class="bottom-nav" aria-label="เมนูหลัก">' +
      (state.screen === 'day' ? item('list', 'รายการ', 'list', { action: 'view', view: 'list' }) : item('list', 'รายการ', 'list', { href: dayHref })) +
      (state.screen === 'day' ? item('map', 'แผนที่', 'map', { action: 'view', view: 'map' }) : item('map', 'แผนที่', 'map', { action: 'goto-map' })) +
      item('pending', 'งานค้าง', 'alert', { href: '#/pending/' + addDays(todayKey(), 1) }, badge) +
      item('history', 'ย้อนหลัง', 'history', { href: '#/history' }) +
      '</nav>';
  }

  function dayViewHtml() {
    if (state.dayError) return errorHtml(state.dayError, 'reload-day');
    if (!state.day) return skeletonCards(3);
    if (state.view === 'map') return groupChipsHtml() + mapHtml();

    var html = groupChipsHtml();
    var n = counts();
    html += '<div class="chips" role="group" aria-label="กรองรายการ">' +
      filterChip('all', 'ทั้งหมด', n.total) + filterChip('todo', 'ยังไม่ติ๊ก', n.todo) + filterChip('done', 'ติ๊กแล้ว', n.done) +
      '</div>';
    if (state.day.carryoverCount > 0) {
      html += '<a class="banner warn" href="#/pending/' + state.date + '">' + icon('alert') + '<span>ค้างจากวันก่อน ' + state.day.carryoverCount + ' รายการ</span>' + icon('chevR') + '</a>';
    }
    var list = groupCases().filter(function (c) {
      return state.filter === 'all' || (state.filter === 'done' ? c.done : !c.done);
    });
    if (!state.day.cases.length) {
      html += emptyHtml(state.date === todayKey() ? 'วันนี้ยังไม่มีรายการรับแจ้ง' : 'วันนี้ไม่มีรายการรับแจ้ง',
        'รายการจะขึ้นเมื่อมีข้อความ “ได้รับแจ้ง”, เบอร์+สถานที่ หรือรูป+พิกัด ในกลุ่มรับแจ้ง');
    } else if (!list.length) {
      html += emptyHtml(state.filter === 'todo' ? 'ติ๊กครบทุกรายการแล้ว' : 'ยังไม่มีรายการที่ติ๊ก', '');
    } else {
      html += '<div class="case-list">' + list.map(caseCardHtml).join('') + '</div>';
    }
    html += hiddenSectionHtml();
    return html;
  }

  function filterChip(key, label, n) {
    return '<button class="filter-chip" data-action="filter" data-filter="' + key + '" aria-pressed="' + (state.filter === key) + '">' +
      label + ' <span class="n">' + n + '</span></button>';
  }

  /** แถบเลือกกลุ่ม (ใช้ทั้งหน้ารายการและแผนที่) แสดงเมื่อวันนั้นมีรายการจากมากกว่า 1 กลุ่ม */
  function groupChipsHtml() {
    var groups = dayGroups();
    if (state.groupFilter && !groups.some(function (g) { return g.name === state.groupFilter; })) state.groupFilter = '';
    if (groups.length < 2) return '';
    return '<div class="chips group-chips" role="group" aria-label="กรองตามกลุ่มที่แจ้ง">' +
      groupChip('', 'ทุกกลุ่ม', state.day.cases.length) +
      groups.map(function (g) { return groupChip(g.name, g.name, g.n); }).join('') + '</div>';
  }

  function groupChip(key, label, n) {
    return '<button class="filter-chip" data-action="group-filter" data-group="' + esc(key) + '" aria-pressed="' + (state.groupFilter === key) + '">' +
      esc(label) + ' <span class="n">' + n + '</span></button>';
  }

  function sourceBadges(c) {
    return '<div class="src-row">' + (c.sources || []).map(function (s) {
      var m = SOURCES[s];
      if (!m) return '';
      return '<span class="src' + (m.auto ? ' auto' : '') + '"' +
        (m.auto ? ' title="' + esc(m.auto) + '"' : '') + '>' +
        icon(m.icon, 14) + m.label + '</span>';
    }).join('') + '</div>';
  }

  function statusPill(c) {
    if (c.hidden) return '<span class="status hidden">ซ่อนแล้ว</span>';
    if (!c.done && c.workStatus === 'doing') return '<span class="status doing">กำลังทำ</span>';
    return c.done ? '<span class="status done">ดำเนินการแล้ว</span>' : '<span class="status todo">ยังไม่ติ๊ก</span>';
  }

  function infoChips(c) {
    var html = (c.phones || []).map(function (p) {
      return '<a class="chip phone" href="tel:' + esc(p) + '" aria-label="โทร ' + esc(fmtPhone(p)) + '">' + icon('phone', 16) + esc(fmtPhone(p)) + '</a>';
    }).join('');
    if (hasCoords(c)) {
      html += '<a class="chip geo" href="' + esc(navUrl(c)) + '" target="_blank" rel="noopener">' + icon('nav', 16) + 'มีพิกัด · นำทาง</a>';
    } else if (c.mapsUrl) {
      html += '<a class="chip geo" href="' + esc(c.mapsUrl) + '" target="_blank" rel="noopener">' + icon('link', 16) + 'ลิงก์แผนที่ (แปลงพิกัดไม่ได้)</a>';
    } else {
      html += '<span class="chip muted">' + icon('pinOff', 16) + 'ไม่มีพิกัด</span>';
    }
    return '<div class="info-chips">' + html + '</div>';
  }

  function thumbsHtml(c) {
    if (!c.photoFileIds || !c.photoFileIds.length) return '';
    return '<div class="thumbs">' + c.photoFileIds.map(function (id, i) {
      return '<button class="thumb" data-action="open-photo" data-file="' + esc(id) + '" aria-label="ดูรูปที่ ' + (i + 1) + ' เต็มจอ">' +
        '<img data-photo="' + esc(id) + '" data-size="thumb" alt=""></button>';
    }).join('') + '</div>';
  }

  function tickButton(c, big) {
    if (c.done) {
      return '<button class="tick-btn done' + (big ? ' big' : '') + '" data-action="tick" data-id="' + esc(c.caseId) + '" aria-pressed="true">' +
        icon('checkSquare', 22) + '<span>ดำเนินการแล้ว <small>· ' + esc(c.doneBy || '') + ' ' + esc(c.doneAt || '') + '</small></span></button>';
    }
    return '<button class="tick-btn todo' + (big ? ' big' : '') + '" data-action="tick" data-id="' + esc(c.caseId) + '" aria-pressed="false">' +
      icon('square', 22) + '<span>ติ๊กว่าดำเนินการแล้ว</span></button>';
  }

  function hideButton(c) {
    return '<button class="text-btn" data-action="hide" data-id="' + esc(c.caseId) + '">' + icon('eyeOff', 16) + 'ไม่ใช่รายการรับแจ้ง</button>';
  }

  function dupLine(c) {
    return c.dupCount > 0
      ? '<div class="dup-line">' + icon('copy', 15) + 'มีคนโพสต์ซ้ำ ' + c.dupCount + ' ครั้ง · รวมเข้าเคสนี้แล้ว</div>' : '';
  }

  function groupLine(c) {
    return c.groupSize > 0
      ? '<div class="dup-line group-line">' + icon('link', 15) + 'งานรวม ' + (c.groupSize + 1) + ' แจ้ง · ไฟดับวงกว้าง</div>' : '';
  }

  function caseCardHtml(c) {
    return '<article class="case ' + (c.done ? 'is-done' : 'is-todo') + '" aria-label="รายการ #' + c.seq + '">' +
      '<div class="case-head"><span class="case-time mono">' + esc(c.time) + '</span><span class="case-seq">#' + c.seq + '</span>' + statusPill(c) + '</div>' +
      sourceBadges(c) +
      '<a class="case-body" href="#/case/' + encodeURIComponent(c.caseId) + '"><h3>' + esc(c.title) + '</h3>' +
      (c.detail ? '<p>' + esc(c.detail) + '</p>' : '') + '</a>' +
      dupLine(c) + groupLine(c) + thumbsHtml(c) + infoChips(c) +
      '<div class="reporter">' + (c.group ? '<span class="grp-tag">' + esc(c.group) + '</span>' : '') +
      'แจ้งในกลุ่มโดย ' + esc(c.reporterName || 'ไม่ทราบชื่อ') + '</div>' +
      tickButton(c) + hideButton(c) +
      '</article>';
  }

  function hiddenSectionHtml() {
    var hidden = state.day.hiddenCases || [];
    if (!hidden.length) return '';
    var html = '<section class="hidden-sec"><button class="hidden-toggle" data-action="toggle-hidden" aria-expanded="' + state.hiddenOpen + '">' +
      icon('eyeOff', 18) + '<span>ซ่อนแล้ว ' + hidden.length + ' รายการ</span><span class="chev">' + icon('chevD', 18) + '</span></button>';
    if (state.hiddenOpen) {
      html += '<div class="hidden-list">' + hidden.map(function (c) {
        return '<div class="hidden-row"><span class="mono">' + esc(c.time) + '</span>' +
          '<div class="mid"><b>' + esc(c.title) + '</b><small>ซ่อนโดย ' + esc(c.hiddenBy) + ' ' + esc(c.hiddenAt) + '</small></div>' +
          '<button class="small-btn" data-action="unhide" data-id="' + esc(c.caseId) + '">' + icon('undo', 16) + 'คืนรายการ</button></div>';
      }).join('') + '</div>';
    }
    return html + '</section>';
  }

  // ---------- แผนที่ ----------

  function mapHtml() {
    var cases = groupCases();
    var withCoords = cases.filter(hasCoords);
    var noCoords = cases.length - withCoords.length;
    if (!cases.length) return emptyHtml('ไม่มีรายการให้แสดงบนแผนที่', '');
    return '<div class="map-wrap"><div id="map" class="map" role="application" aria-label="แผนที่จุดรับแจ้ง"></div>' +
      '<div class="map-legend"><div><span class="dot todo"></span>ยังไม่ติ๊ก</div><div><span class="dot done"></span>ดำเนินการแล้ว</div></div>' +
      (noCoords ? '<button class="map-nocoords" data-action="view" data-view="list">ไม่มีพิกัด ' + noCoords + ' จุด · ดูในรายการ</button>' : '') +
      '</div>' +
      (withCoords.length ? '' : '<p class="map-empty">รายการวันนี้ยังไม่มีพิกัด</p>');
  }

  // Leaflet โหลดเมื่อจะใช้แผนที่เท่านั้น เปิดหน้าแรกจึงไม่ต้องรอไฟล์แผนที่
  var leafletReady = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (!leafletReady) {
      leafletReady = new Promise(function (resolve, reject) {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.insertBefore(css, document.querySelector('link[href="styles.css"]'));
        var js = document.createElement('script');
        js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        js.onload = resolve;
        js.onerror = function () { leafletReady = null; reject(); };
        document.head.appendChild(js);
      });
    }
    return leafletReady;
  }

  function initMap() {
    var el = document.getElementById('map');
    if (!el || map) return;
    if (typeof L === 'undefined') {
      loadLeaflet().then(function () {
        if (document.getElementById('map') === el) initMap();
      }, function () {
        el.innerHTML = '<p class="map-empty">โหลดแผนที่ไม่สำเร็จ ลองกดรีเฟรช</p>';
      });
      return;
    }
    map = L.map(el, { zoomControl: false, attributionControl: true });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    refreshMarkers(true);
  }

  function refreshMarkers(fit) {
    if (!map || !markerLayer) return;
    markerLayer.clearLayers();
    var pts = [];
    groupCases().filter(hasCoords).forEach(function (c) {
      var m = L.marker([c.lat, c.lng], {
        icon: L.divIcon({
          className: '', iconSize: [34, 34], iconAnchor: [17, 34],
          html: '<div class="pin ' + (c.done ? 'done' : 'todo') + '"><span>' + c.seq + '</span></div>'
        }),
        title: '#' + c.seq + ' ' + c.title,
        keyboard: true
      });
      m.on('click', function () { openSheet(c.caseId); });
      markerLayer.addLayer(m);
      pts.push([c.lat, c.lng]);
    });
    if (fit) {
      if (pts.length > 1) map.fitBounds(pts, { padding: [48, 48], maxZoom: 16 });
      else if (pts.length === 1) map.setView(pts[0], 16);
      else map.setView([14.40, 100.14], 12);
    }
  }

  function destroyMap() {
    if (map) { map.remove(); map = null; markerLayer = null; }
  }

  function openSheet(id) {
    state.sheetCaseId = id;
    renderSheet();
  }

  function renderSheet() {
    var c = findCase(state.sheetCaseId);
    if (!c) return closeOverlay();
    var call = c.phones && c.phones[0]
      ? '<a class="btn call" href="tel:' + esc(c.phones[0]) + '">' + icon('phone', 18) + 'โทร</a>'
      : '<span class="btn" aria-disabled="true" style="color:var(--ink-3)">' + icon('phone', 18) + 'ไม่มีเบอร์</span>';
    overlay.innerHTML = '<div class="backdrop" data-action="close"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="รายการ #' + c.seq + '"><div class="sheet-handle"></div>' +
      '<div class="case-head"><span class="case-time mono">' + esc(c.time) + '</span><span class="case-seq">#' + c.seq + '</span>' + statusPill(c) + '</div>' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<div class="btn-row"><a class="btn geo" href="' + esc(navUrl(c)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + 'นำทาง</a>' + call + '</div>' +
      tickButton(c) +
      '<a class="more" href="#/case/' + encodeURIComponent(c.caseId) + '">ดูรายละเอียด' + icon('chevR', 18) + '</a></div>';
  }

  // ---------- รายละเอียดเคส ----------

  function showCase(id, silent) {
    destroyMap();
    state.screen = 'case';
    if (!silent) {
      state.caseData = null;
      state.galleryIdx = 0;
      renderCase(null);
      window.scrollTo(0, 0);
    }
    var seq = ++loadSeq;
    lastLoadAt = Date.now();
    Api.call('case', { id: id }).then(function (c) {
      if (seq !== loadSeq) return;
      state.caseData = c;
      renderCase(null);
    }, function (e) {
      if (seq !== loadSeq) return;
      renderCase(e.message);
    });
  }

  function renderCase(error) {
    var c = state.caseData;
    var back = '#/day/' + (c ? c.reportDate : state.date);
    var html = demoFlag() + '<header class="topbar solo"><a class="icon-btn" href="' + back + '" aria-label="กลับไปหน้ารายการ">' + icon('chevL', 22) + '</a>' +
      '<div class="topbar-text"><div class="topbar-sub">' + (c ? 'รายการ #' + c.seq + ' · ' + shortDate(c.reportDate) + ' ' + esc(c.time) : '&nbsp;') + '</div>' +
      '<h1>รายละเอียดรายการ</h1></div></header><main class="content">';
    if (error) {
      app.innerHTML = html + errorHtml(error, 'back') + '</main>';
      return;
    }
    if (!c) {
      app.innerHTML = html + '<div class="skel" style="aspect-ratio:4/3;border-radius:16px"></div>' + skeletonCards(1) + '</main>';
      return;
    }

    if (c.photoFileIds.length) {
      var cur = c.photoFileIds[Math.min(state.galleryIdx, c.photoFileIds.length - 1)];
      html += '<div class="gallery"><button class="gallery-main" data-action="open-photo" data-file="' + esc(cur) + '" aria-label="ดูรูปเต็มจอ">' +
        '<img data-photo="' + esc(cur) + '" data-size="full" alt="รูปจากผู้แจ้ง"></button>';
      if (c.photoFileIds.length > 1) {
        html += '<div class="thumbs">' + c.photoFileIds.map(function (id, i) {
          return '<button class="thumb" data-action="gallery" data-idx="' + i + '" aria-label="รูปที่ ' + (i + 1) + '"' +
            (i === state.galleryIdx ? ' aria-current="true"' : '') + '><img data-photo="' + esc(id) + '" data-size="thumb" alt=""></button>';
        }).join('') + '</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="no-photo">' + icon('image', 18) + 'ไม่มีรูปแนบ</div>';
    }

    var facts = [
      ['ที่มา', (c.sources || []).map(function (s) { return SOURCES[s] ? SOURCES[s].label : s; }).join(' + ')],
      ['พิกัด', hasCoords(c)
        ? '<a href="' + esc(navUrl(c)) + '" target="_blank" rel="noopener" class="mono">' + Number(c.lat).toFixed(5) + ', ' + Number(c.lng).toFixed(5) + '</a>'
        : c.mapsUrl ? '<a href="' + esc(c.mapsUrl) + '" target="_blank" rel="noopener">ลิงก์แผนที่ (แปลงพิกัดไม่ได้)</a>' : 'ไม่มีพิกัด', true],
      ['ที่อยู่', c.address],
      ['ที่อยู่โดยประมาณ', c.approxAddress],
      ['เบอร์', (c.phones || []).map(function (p) {
        return '<a href="tel:' + esc(p) + '" class="mono">' + esc(fmtPhone(p)) + '</a>';
      }).join(', ') || 'ไม่มี', true],
      ['กลุ่มที่แจ้ง', c.group],
      ['ผู้แจ้ง', c.reporterName],
      ['รับแจ้ง', thaiDate(c.reportDate) + ' ' + c.time + ' น.'],
      ['ลบอัตโนมัติ', thaiDate(c.deleteOn)]
    ];
    html += '<section class="card detail-card"><div class="case-head">' + sourceBadges(c).replace('class="src-row"', 'class="src-row" style="margin:0"') + statusPill(c) + '</div>' +
      '<h2>' + esc(c.title) + '</h2>' + (c.detail ? '<p class="desc">' + esc(c.detail) + '</p>' : '') + dupLine(c) +
      '<dl class="facts">' + facts.filter(function (f) { return f[1]; }).map(function (f) {
        return '<dt>' + f[0] + '</dt><dd>' + (f[2] ? f[1] : esc(f[1])) + '</dd>';
      }).join('') + '</dl>';

    var actions = [];
    if (hasCoords(c)) actions.push('<a class="btn geo" href="' + esc(navUrl(c)) + '" target="_blank" rel="noopener">' + icon('nav', 18) + 'นำทาง</a>');
    if (c.phones && c.phones[0]) actions.push('<a class="btn call" href="tel:' + esc(c.phones[0]) + '">' + icon('phone', 18) + 'โทร</a>');
    if (actions.length) html += '<div class="btn-row' + (actions.length === 1 ? ' one' : '') + '">' + actions.join('') + '</div>';
    html += '</section>';

    if (c.parts && c.parts.length) {
      html += '<section class="timeline"><h3>รวมจาก ' + c.parts.length + ' ข้อความในกลุ่ม</h3><ol>' + c.parts.map(function (p) {
        var label = PART_LABELS[p.type === 'text' ? p.kind : p.type] || p.type;
        return '<li><span class="t">' + esc(p.time) + '</span><span class="k">' + icon(PART_ICONS[p.type] || 'message', 16) + label +
          (p.dup ? ' · โพสต์ซ้ำ' : '') + '</span><span class="who">' + esc(p.name) + '</span></li>';
      }).join('') + '</ol></section>';
    }

    html += c.hidden
      ? '<button class="tick-btn done big" data-action="unhide" data-id="' + esc(c.caseId) + '">' + icon('undo', 22) + 'คืนรายการ (ซ่อนโดย ' + esc(c.hiddenBy) + ')</button>'
      : groupSection(c) + (c.groupMain ? '' : (WORKLOG ? workSection(c) : tickButton(c, true))) + hideButton(c);

    if (c.audit && c.audit.length) {
      html += '<h3 class="section-title">ประวัติ</h3><ul class="card audit">' + c.audit.map(function (a) {
        return '<li><span>' + esc(AUDIT_LABELS[a.action] || a.action) + ' · ' + esc(a.name) + '</span><span class="when">' + shortDate(a.date) + ' ' + esc(a.time) + '</span></li>';
      }).join('') + '</ul>';
    }

    app.innerHTML = html + '</main>';
    hydratePhotos(app);
  }

  // ---------- รวมหลายการแจ้งเป็นงานเดียว (ไฟดับวงกว้าง) ----------
  // ระบบเสนอเคสที่แจ้งห่างกันไม่เกิน 1 ชม. และอยู่ใกล้กัน (group.gs) ช่างเลือกแล้วกดรวม
  // กด "ไม่ใช่" = ไม่เสนอรายการชุดนั้นอีกในเครื่องนี้ (แจ้งใหม่ที่เข้ามาทีหลังยังเสนอได้)

  var GROUP_MARK = '🔗 รวม'; // ต้องตรงกับ WORK_MESSAGE_PREFIXES_ ใน parse.gs
  var groupBusy = false;

  function dismissedCandidates(id) {
    try { var a = JSON.parse(lsGet('rb_nogroup_' + id) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }

  // รับแจ้งหลายกลุ่ม: รายการในงานรวมอาจมาจากคนละกลุ่ม แสดงป้ายกลุ่มกำกับ
  function grpTag(m) { return m.group ? ' <span class="grp-tag">' + esc(m.group) + '</span>' : ''; }

  function miniRow(m, extra) {
    return '<li><a href="#/case/' + encodeURIComponent(m.caseId) + '"><span class="mono">' + esc(m.time) + '</span> <b>#' + m.seq + '</b> ' +
      esc(m.title || 'รายการรับแจ้ง') + grpTag(m) + '</a>' + (extra || '') + '</li>';
  }

  function groupSection(c) {
    if (c.groupMain) {
      var m = c.groupMain;
      return '<section class="card group-card is-member"><h3>' + icon('link', 18) + 'รวมอยู่ในงานหลัก</h3>' +
        '<ul class="group-list">' + miniRow(m) + '</ul>' +
        '<p class="work-hint">บันทึกผลที่งานหลักครั้งเดียว รายการนี้จะเสร็จตามไปด้วย</p>' +
        '<a class="btn primary group-go" href="#/case/' + encodeURIComponent(m.caseId) + '">เปิดงานหลัก #' + m.seq + '</a>' +
        '<button class="text-btn" data-action="group-remove" data-id="' + esc(c.caseId) + '"' + (groupBusy ? ' disabled' : '') + '>ไม่ใช่งานเดียวกัน · เอาออก</button></section>';
    }
    var html = '';
    var members = c.groupMembers || [];
    if (members.length) {
      html += '<section class="card group-card"><h3>' + icon('link', 18) + 'งานรวม ' + (members.length + 1) + ' แจ้ง</h3>' +
        '<p class="work-hint">รวมเข้ามาในงานนี้ บันทึกผลครั้งเดียวทุกรายการเสร็จพร้อมกัน</p><ul class="group-list">' +
        members.map(function (m) {
          return miniRow(m, '<button class="small-link" data-action="group-remove" data-id="' + esc(m.caseId) + '"' + (groupBusy ? ' disabled' : '') +
            ' aria-label="เอารายการ #' + m.seq + ' ออกจากงานรวม">เอาออก</button>');
        }).join('') + '</ul></section>';
    }
    var no = dismissedCandidates(c.caseId);
    var cand = (c.groupCandidates || []).filter(function (x) { return no.indexOf(x.caseId) < 0; });
    if (cand.length && !c.done) {
      html += '<section class="card group-card suggest" aria-labelledby="grp-t"><h3 id="grp-t">' + icon('alert', 18) +
        'มีแจ้งใกล้กันอีก ' + cand.length + ' รายการ</h3>' +
        '<p class="work-hint">แจ้งห่างกันไม่เกิน 1 ชม. และอยู่ใกล้กัน ถ้าเป็นไฟดับจุดเดียวกัน รวมเป็นงานเดียว แล้วบันทึกผลครั้งเดียว</p>' +
        '<ul class="group-list pick">' + cand.map(function (x) {
          return '<li><label class="group-pick"><input type="checkbox" data-gid="' + esc(x.caseId) + '" checked>' +
            '<span><span class="mono">' + esc(x.time) + '</span> <b>#' + x.seq + '</b> ' + esc(x.title || 'รายการรับแจ้ง') + grpTag(x) +
            '<small>แจ้งโดย ' + esc(x.reporterName || '-') + '</small></span></label></li>';
        }).join('') + '</ul><div class="btn-row"><button class="btn" data-action="group-dismiss">ไม่ใช่</button>' +
        '<button class="btn primary" data-action="group-join"' + (groupBusy ? ' disabled' : '') + '>' + (groupBusy ? 'กำลังรวม…' : 'รวมที่เลือก') + '</button></div></section>';
    }
    // ลงซ้ำ: สองคนรับเรื่องเดียวกัน อีกคนทำเสร็จไปแล้ว → ให้รายการนี้เสร็จตามเคสเดิม ไม่ต้องกรอกผลใหม่
    // ดับอีกรอบที่จุดเดิม: ยังเป็นงานค้าง ฟอร์มผลงานเติมข้อมูลจุดเดิมให้
    if (c.repeatFrom && !c.groupMain) {
      var rf = c.repeatFrom;
      html += '<section class="card group-card repeat-card"><h3>' + icon('alert', 18) + 'ดับอีกรอบที่จุดเดิม</h3>' +
        (rf.gone ? '<p class="work-hint">เคสเดิม #' + rf.seq + ' ถูกลบแล้ว</p>' : '<ul class="group-list">' + miniRow(rf) + '</ul>') +
        '<p class="work-hint">' + (rf.work ? 'ฟอร์มผลงานเติมรหัสอุปกรณ์ บริเวณ และหม้อแปลงจากเคส #' + rf.seq + ' ให้แล้ว' : 'เคส #' + rf.seq + ' ไม่มีบันทึกผล จึงไม่มีข้อมูลให้เติม') + '</p>' +
        (c.done ? '' : '<button class="text-btn" data-action="repeat-undo"' + (groupBusy ? ' disabled' : '') + '>ไม่ใช่ดับอีกรอบ · ยกเลิก</button>') + '</section>';
    }
    // ลงซ้ำ: เคสซ้ำ (อีกคนทำเสร็จไปแล้ว → เสร็จตาม) หรือ ดับอีกรอบ (งานใหม่ที่จุดเดิม → เติมฟอร์มให้)
    var same = c.sameJob || [];
    if (same.length && !c.done && !members.length && !c.repeatFrom) {
      html += '<details class="card group-card samejob"' + (groupBusy ? ' open' : '') + '><summary><span>' + icon('link', 18) +
        'แจ้งซ้ำกับเคสอื่น?</span><small>' + same.length + ' เคสในช่วง 3 ชม.</small></summary>' +
        '<p class="work-hint"><b>เคสซ้ำ</b> = เรื่องเดียวกัน รายการนี้เสร็จตามเคสนั้น ไม่ต้องบันทึกผล<br><b>ดับอีกรอบ</b> = แก้แล้วแต่ดับอีก ยังต้องไปทำ ฟอร์มเติมข้อมูลจุดเดิมให้</p>' +
        '<ul class="group-list">' + same.map(function (x) {
          var st = x.done ? '<span class="sj-st done">✅ เสร็จแล้ว</span>' : (x.workStatus === 'doing' ? '<span class="sj-st doing">🔧 กำลังทำ</span>' : '<span class="sj-st">ยังไม่ทำ</span>');
          var dis = groupBusy ? ' disabled' : '';
          return miniRow(x, '<div class="sj-act">' + st + '<span class="sj-btns">' +
            (x.done ? '<button class="btn small" data-action="repeat" data-id="' + esc(x.caseId) + '"' + dis + ' aria-label="ดับอีกรอบที่จุดเดียวกับเคส #' + x.seq + '">ดับอีกรอบ</button>' : '') +
            '<button class="btn small" data-action="samejob" data-id="' + esc(x.caseId) + '"' + dis + ' aria-label="เป็นเคสซ้ำกับเคส #' + x.seq + '">เคสซ้ำ</button></span></div>');
        }).join('') + '</ul></details>';
    }
    return html;
  }

  function groupAction(a, el) {
    var c = state.caseData;
    if (!c || groupBusy) return;
    if (a === 'group-dismiss') {
      var ids = dismissedCandidates(c.caseId).concat((c.groupCandidates || []).map(function (x) { return x.caseId; }));
      lsSet('rb_nogroup_' + c.caseId, JSON.stringify(ids.slice(-50)));
      renderCase(null);
      return;
    }
    if (a === 'group-join') {
      var pick = Array.prototype.map.call(document.querySelectorAll('[data-gid]:checked'), function (x) { return x.getAttribute('data-gid'); });
      if (!pick.length) { toast('ติ๊กเลือกรายการที่จะรวมก่อน', true); return; }
      var names = (c.groupCandidates || []).filter(function (x) { return pick.indexOf(x.caseId) >= 0; });
      groupCall('group', { caseId: c.caseId, ids: pick }, function (upd) {
        var all = upd.groupMembers || [];
        sendToGroup(GROUP_MARK + ' ' + (all.length + 1) + ' แจ้งเป็นงานเดียว · งานหลัก #' + upd.seq + ' ' + (upd.title || '') + groupNote(c) + '\n' +
          names.map(function (x) {
            return '+ #' + x.seq + ' ' + (x.title || '') + (x.group && x.group !== c.group ? ' (กลุ่ม' + x.group + ')' : '');
          }).join('\n')).then(function (ok) {
          if (!DEMO) toast(ok ? 'รวมแล้ว · แจ้งกลุ่มแล้ว' : 'รวมแล้ว แต่ส่งเข้ากลุ่มไม่ได้', !ok);
        });
      });
      return;
    }
    if (a === 'samejob') {
      var tid = el.getAttribute('data-id');
      var t = (c.sameJob || []).filter(function (x) { return x.caseId === tid; })[0];
      if (!t) return;
      confirmDialog({
        title: 'เคสซ้ำกับเคส #' + t.seq + '?',
        body: t.done ? 'รายการนี้จะเสร็จตามเคส #' + t.seq + ' ทันที ไม่ต้องบันทึกผลซ้ำ' : 'รายการนี้จะรวมเข้าเคส #' + t.seq + ' บันทึกผลที่เคสนั้นครั้งเดียว',
        ok: 'ใช่ เคสซ้ำ'
      }).then(function (yes) {
        if (!yes) return;
        groupCall('samejob', { caseId: c.caseId, targetId: tid }, function () {
          toast(t.done ? 'เรียบร้อย · เสร็จตามเคส #' + t.seq : 'รวมเข้าเคส #' + t.seq + ' แล้ว');
        });
      });
      return;
    }
    if (a === 'repeat' || a === 'repeat-undo') {
      var rid = a === 'repeat' ? el.getAttribute('data-id') : '';
      var rt = rid && (c.sameJob || []).filter(function (x) { return x.caseId === rid; })[0];
      if (a === 'repeat' && !rt) return;
      groupCall('repeat', { caseId: c.caseId, targetId: rid }, function () {
        // ฟอร์มที่ยังไม่ได้พิมพ์ ให้ตั้งค่าใหม่ (เติมข้อมูลจุดเดิม)
        if (state.work && state.work.caseId === c.caseId && !state.work.dirty) state.work = null;
        renderCase(null);
        toast(rt ? 'บันทึกว่าดับอีกรอบที่จุดเคส #' + rt.seq : 'ยกเลิกแล้ว');
      });
      return;
    }
    if (a === 'group-remove') {
      var id = el.getAttribute('data-id');
      confirmDialog({ title: 'เอาออกจากงานรวม?', body: 'รายการนี้จะกลับเป็นรายการเดี่ยว ต้องบันทึกผลแยก', ok: 'เอาออก', danger: true }).then(function (yes) {
        if (!yes) return;
        groupCall('ungroup', { caseId: id }, function () { toast('เอาออกแล้ว'); }, id === c.caseId);
      });
    }
  }

  /** เรียก API รวม/เอาออก แล้วแสดงข้อมูลงานหลักล่าสุดที่ API ส่งกลับ (ถ้าเอาตัวเองออก ให้โหลดเคสตัวเองใหม่) */
  function groupCall(action, payload, onOk, reloadSelf) {
    groupBusy = true;
    renderCase(null);
    var id = state.caseData.caseId;
    Api.call(action, payload).then(function (upd) {
      groupBusy = false;
      // รายการรายวัน/ค้นหาเปลี่ยน ให้โหลดใหม่เมื่อกลับไป (ผลค้นหาเก่ายังชี้ไปงานหลักเดิม)
      state.day = null; state.pending = null; state.searchResults = null; state.searchQ = '';
      if (state.screen !== 'case' || !state.caseData || state.caseData.caseId !== id) return;
      if (reloadSelf) showCase(id, true);
      else { state.caseData = upd; renderCase(null); }
      onOk(upd);
    }, function (e) {
      groupBusy = false;
      if (state.screen === 'case') renderCase(null);
      toast('ทำไม่สำเร็จ: ' + e.message, true);
    });
  }

  // ---------- บันทึกผลการปฏิบัติงาน ----------

  var WORKER_KEY = 'rb_worker';
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  /** ร่างของเคสที่เปิดอยู่ เก็บใน state + เครื่อง (รีเฟรชกลางทางแล้วไม่หาย) */
  var workSaving = {}; // caseId → true ระหว่างรอ API (กันกดซ้ำ แม้ออกไปหน้าอื่นแล้วกลับมา)

  function workDraft(c) {
    var w = state.work;
    // ยังไม่ได้พิมพ์อะไร → ตั้งค่าใหม่จากข้อมูลล่าสุดของเคสทุกครั้ง (ไม่ค้างค่าเก่าหลังโหลดใหม่)
    if (w && w.caseId === c.caseId && w.dirty) { w.saving = !!workSaving[c.caseId]; return w; }
    var saved = null;
    try { saved = JSON.parse(lsGet('rb_work_' + c.caseId) || 'null'); } catch (e) {}
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = null;
    var base = saved || c.work || {
      date: c.reportDate, outAt: c.time, by: lsGet(WORKER_KEY) || '',
      area: (c.title === 'แจ้งด้วยรูปและพิกัด' ? c.approxAddress || c.address : c.title) || ''
    };
    // ดับอีกรอบ: เติมรหัสอุปกรณ์/บริเวณ/หม้อแปลงจากเคสเดิม (เฉพาะฟอร์มใหม่ ไม่ทับที่กรอกไว้)
    var rw = !saved && !c.work && c.repeatFrom && c.repeatFrom.work;
    if (rw) ['device', 'area', 'trans'].forEach(function (k) { if (rw[k]) base[k] = rw[k]; });
    var v = {};
    WORK_FIELDS.forEach(function (f) { v[f.k] = String(base[f.k] == null ? '' : base[f.k]).slice(0, 300); });
    var keepOpen = w && w.caseId === c.caseId && w.open;
    state.work = { caseId: c.caseId, v: v, err: {}, dirty: !!saved, open: !!saved || keepOpen || c.workStatus === 'doing', saving: !!workSaving[c.caseId] };
    return state.work;
  }

  function thaiShortYear(key) {
    if (!isDateKey(key)) return key || '';
    var p = parts(key);
    return p[2] + ' ' + MON[p[1] - 1] + ((p[0] + 543) % 100);
  }
  function dotTime(t) { return String(t || '').replace(':', '.'); }

  function workValue(f, v) {
    var x = String(v[f.k] == null ? '' : v[f.k]).trim();
    if (f.type === 'date') return thaiShortYear(x);
    if (f.type === 'time') return dotTime(x);
    return f.upper ? x.toUpperCase() : x;
  }

  /** ข้อความเข้ากลุ่ม หน้าตาเหมือนแบบฟอร์มที่ช่างพิมพ์อยู่เดิม */
  function workMessage(c, v) {
    return WORK_MARK + ' เคส #' + c.seq + ' (' + shortDate(c.reportDate) + ')' + groupNote(c) + '\n' + WORK_FIELDS.map(function (f) {
      return f.label.replace(' (ชื่อ ตำแหน่ง)', '').replace('PEA หม้อแปลง', 'PEAหม้อแปลง') + ' ' + (workValue(f, v) || '-');
    }).join('\n');
  }

  /** เวลาไทยตอนนี้ HH:MM (ใช้เมื่อ API ไม่ส่ง workAt กลับมา) */
  function nowThaiTime() {
    var d = new Date(Date.now() + 7 * 3600000);
    return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
  }

  function fxText(text, o) { return Object.assign({ type: 'text', text: String(text || '-').slice(0, 300), size: 'sm', color: '#5A5F6B', wrap: true }, o || {}); }
  function fxRow(label, value, bold) {
    return {
      type: 'box', layout: 'baseline', spacing: 'sm', contents: [
        fxText(label, { flex: 2, color: '#7A7F8A', size: 'xs' }),
        fxText(value, { flex: 5, color: '#17181C', weight: bold ? 'bold' : 'regular' })
      ]
    };
  }

  /**
   * การ์ดสถานะงาน (หน้าตาเดียวกับการ์ดรับแจ้งของบอท) ส่งในนามช่างผ่าน liff.sendMessages ไม่กินโควตาบอท
   * kind: 'doing' = รับงาน · 'done' = งานเสร็จ (ใส่ผลปฏิบัติงานครบทุกช่อง ดูจากการ์ดได้โดยไม่ต้องเปิดเคส)
   * altText ขึ้นต้นด้วย WORK_MARK / '🔧 เคส #' เหมือนข้อความเดิม (การ์ดไม่ถูกอ่านเป็นรับแจ้งอยู่แล้ว)
   */
  function workFlex(c, kind, info) {
    var done = kind === 'done';
    var seq = c.seq;
    var title = String(c.title || 'รายการรับแจ้ง').slice(0, 80);
    var place = String(c.approxAddress || c.address || '').slice(0, 80);
    var body = [fxText(title, { size: 'md', weight: 'bold', color: '#17181C', maxLines: 3 })];
    if (place && title.indexOf(place) < 0) body.push(fxText(place, { maxLines: 2 }));
    // เบอร์เต็ม กดโทรได้ (ผู้ใช้สั่ง 10 พ.ย. 2569)
    (c.phones || []).slice(0, 3).forEach(function (p) {
      body.push(fxText('📞 ' + fmtPhone(p), { weight: 'bold', color: '#0B57A4', decoration: 'underline', action: { type: 'uri', label: 'โทร', uri: 'tel:' + p } }));
    });
    var meta = [fxRow('แจ้ง', shortDate(c.reportDate) + ' ' + (c.time || '') + ' น.' + (c.reporterName ? ' · ' + c.reporterName : ''))];
    if (c.group) meta.push(fxRow('กลุ่ม', c.group));
    if (c.groupSize > 1) meta.push(fxRow('รวมงาน', c.groupSize + ' แจ้ง'));
    if (c.repeatFrom) meta.push(fxRow('ดับซ้ำ', 'จุดเดิมเคส #' + c.repeatFrom.seq + ' (' + c.repeatFrom.time + ' น.)', true));
    meta.push(fxRow('รับงาน', (info.by || '-') + (info.startAt ? ' · ' + info.startAt + ' น.' : '')));
    if (done) meta.push(fxRow('เสร็จ', (info.doneBy || info.by || '-') + (info.doneAt ? ' · ' + info.doneAt + ' น.' : '')));
    body.push({ type: 'box', layout: 'vertical', margin: 'md', spacing: 'xs', contents: meta });
    if (done) {
      body.push({ type: 'separator', margin: 'md' });
      body.push(fxText('ผลการปฏิบัติงาน', { margin: 'md', weight: 'bold', color: '#17181C' }));
      body.push({
        type: 'box', layout: 'vertical', margin: 'sm', spacing: 'xs',
        contents: WORK_FIELDS.map(function (f) {
          return fxRow(f.label.replace(' (ชื่อ ตำแหน่ง)', ''), workValue(f, info.v) || '-', f.k === 'fix' || f.k === 'cause');
        })
      });
    }
    body.push({
      type: 'box', layout: 'horizontal', margin: 'md', contents: [
        fxText('สถานะ', { flex: 0 }),
        fxText(done ? '✅ เสร็จแล้ว' : '🔧 กำลังทำ', { align: 'end', weight: 'bold', color: done ? '#1B6E2E' : '#8A4B00' })
      ]
    });
    var head = done ? '✅ งานเสร็จ เคส #' + seq : '🔧 รับงานเคส #' + seq;
    var alt = done ? WORK_MARK + ' เคส #' + seq + ' · ' + title : '🔧 เคส #' + seq + ' ' + (info.by || '') + ' รับงานแล้ว · ' + title;
    var uri = CFG.LIFF_ID ? 'https://liff.line.me/' + CFG.LIFF_ID + '?case=' + encodeURIComponent(c.caseId) : '';
    var bubble = {
      type: 'bubble', size: done ? 'mega' : 'kilo',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#F2B705', paddingAll: '12px',
        contents: [{ type: 'text', text: head, color: '#1F1A00', weight: 'bold', size: 'md' }]
      },
      body: { type: 'box', layout: 'vertical', paddingAll: '12px', spacing: 'xs', contents: body }
    };
    if (uri) {
      bubble.footer = {
        type: 'box', layout: 'vertical', paddingAll: '10px', contents: [{
          type: 'button', style: 'primary', color: '#8A5A00', height: 'sm',
          action: { type: 'uri', label: done ? 'ดูเคส' : 'เปิดเคส / อัปเดตงาน', uri: uri }
        }]
      };
    }
    return { type: 'flex', altText: alt.slice(0, 390), contents: bubble };
  }

  /** ' · แจ้งในกลุ่ม X' ต่อท้ายบรรทัดแรกของข้อความเข้ากลุ่ม (รับแจ้งหลายกลุ่ม) ต้นข้อความคงเดิมให้ parser ข้ามได้ */
  function groupNote(c) {
    return c.group ? ' · แจ้งในกลุ่ม' + c.group : '';
  }

  function workSection(c) {
    var w = workDraft(c);
    var st = c.done ? 'done' : (c.workStatus === 'doing' ? 'doing' : 'todo');
    var steps = [['todo', 'ยังไม่ทำ'], ['doing', 'กำลังทำ'], ['done', 'เสร็จแล้ว']];
    var idx = { todo: 0, doing: 1, done: 2 }[st];
    var html = '<section class="card work-card" aria-labelledby="work-t"><h3 id="work-t">ผลการปฏิบัติงาน</h3>' +
      '<ol class="work-steps">' + steps.map(function (s, i) {
        return '<li class="' + (i < idx ? 'past' : i === idx ? 'now' : '') + '"' + (i === idx ? ' aria-current="step"' : '') + '>' +
          (i < idx ? icon('check', 14) : '') + s[1] + '</li>';
      }).join('') + '</ol>';

    // liff.sendMessages ส่งเข้าแชทที่เปิดหน้านี้ ไม่ใช่กลุ่มของเคส จึงเตือนให้เปิดจากกลุ่มที่แจ้ง
    if (c.group && st !== 'done') {
      html += '<p class="work-hint grp-warn">' + icon('message', 16) + '<span>ข้อความรับงาน/ผลงานจะส่งเข้าแชทที่เปิดหน้านี้อยู่ · เคสนี้แจ้งในกลุ่ม <b>' +
        esc(c.group) + '</b> ควรเปิดจากกลุ่มนั้น</span></p>';
    }
    if (st === 'doing') html += '<p class="work-note">' + icon('user', 16) + 'รับงานโดย ' + esc(c.workBy || '') + ' · ' + esc(c.workAt || '') + ' น.</p>';
    if (st === 'done') html += '<p class="work-note done">' + icon('checkCircle', 16) + 'เสร็จแล้ว · ' + esc(c.doneBy || '') + ' ' + esc(c.doneAt || '') + ' น.</p>';

    if (st === 'done' && !w.open) {
      if (c.work) {
        html += '<dl class="facts work-facts">' + WORK_FIELDS.map(function (f) {
          return '<dt>' + esc(f.label.replace(' (ชื่อ ตำแหน่ง)', '')) + '</dt><dd>' + (esc(workValue(f, c.work)) || '<span class="muted">-</span>') + '</dd>';
        }).join('') + '</dl>';
      } else {
        html += '<p class="work-empty">ติ๊กเสร็จแบบเดิม ยังไม่มีบันทึกผล</p>';
      }
      return html + '<div class="btn-row"><button class="btn" data-action="work-reopen">' + icon('undo', 18) + 'ยังไม่เสร็จ</button>' +
        '<button class="btn call" data-action="work-open">' + (c.work ? 'แก้ไขผล' : 'กรอกผล') + '</button></div></section>';
    }

    if (st === 'todo' && !w.open) {
      return html + '<button class="tick-btn todo big" data-action="work-start"' + (w.saving ? ' disabled' : '') + '>' + icon('user', 22) +
        '<span>' + (w.saving ? 'กำลังบันทึก…' : 'รับงาน · แจ้งกลุ่มว่ากำลังไป') + '</span></button>' +
        '<button class="text-btn work-skip" data-action="work-open">ทำเสร็จแล้ว กรอกผลเลย</button></section>';
    }

    html += '<p class="work-hint">กรอกหลังเข้าดำเนินการแล้ว · ช่องที่มี <b class="req">*</b> ต้องกรอก</p><div class="work-form">' +
      WORK_FIELDS.map(function (f) {
        var id = 'wf-' + f.k, val = esc(w.v[f.k] || ''), bad = w.err[f.k];
        var attrs = ' id="' + id + '" data-wf="' + f.k + '"' + (bad ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '') +
          (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + (f.upper ? ' class="upper" autocapitalize="characters"' : '') +
          (w.saving ? ' disabled' : '') + ' maxlength="300"';
        var input = f.area
          ? '<textarea rows="2"' + attrs + '>' + val + '</textarea>'
          : '<input type="' + (f.type || 'text') + '"' + attrs + ' value="' + val + '" autocomplete="off"' + (f.type ? '' : ' enterkeyhint="next"') + '>';
        return '<div class="wf' + (f.type ? ' half' : '') + '"><label for="' + id + '">' + esc(f.label) + (f.req ? ' <b class="req">*</b>' : '') + '</label>' +
          input + (bad ? '<span class="wf-err" id="' + id + '-e">' + esc(bad) + '</span>' : '') + (f.type || w.saving ? '' : chipsHtml(f, c, w.v[f.k])) + '</div>';
      }).join('') + '</div>';
    html += '<button class="tick-btn todo big" data-action="work-save"' + (w.saving ? ' disabled' : '') + '>' + icon('checkSquare', 22) +
      '<span>' + (w.saving ? 'กำลังบันทึก…' : 'บันทึกผล · เสร็จแล้ว') + '</span></button>';
    if (st !== 'doing' && !w.saving) html += '<button class="text-btn work-skip" data-action="work-cancel">ยกเลิก</button>';
    return html + '<p class="work-hint center">บันทึกแล้วจะส่งข้อความสรุปเข้ากลุ่มในชื่อคุณ</p></section>';
  }

  // ---- คำที่ใช้บ่อย: ของเครื่องนี้ (rb_hist_v1) ขึ้นก่อน ตามด้วยของทั้งทีมที่ API ส่งมาใน c.suggest ----
  var HIST_KEY = 'rb_hist_v1';
  var CHIP_MAX = 6;

  function localHist() {
    try {
      var h = JSON.parse(lsGet(HIST_KEY) || '{}');
      return h && typeof h === 'object' && !Array.isArray(h) ? h : {};
    } catch (e) { return {}; }
  }

  function rememberWork(v) {
    var h = localHist();
    WORK_FIELDS.forEach(function (f) {
      var x = v[f.k];
      if (f.type || !x || x.length > 120) return;
      var m = h[f.k] && typeof h[f.k] === 'object' ? h[f.k] : {};
      m[x] = (Number(m[x]) || 0) + 1;
      // เก็บแค่ 20 คำที่ใช้บ่อยสุดต่อช่อง
      var keep = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 20);
      h[f.k] = {};
      keep.forEach(function (s) { h[f.k][s] = m[s]; });
    });
    lsSet(HIST_KEY, JSON.stringify(h));
  }

  function chipValues(k, c, current) {
    var m = localHist()[k] || {};
    var mine = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
    var team = (c.suggest && c.suggest[k]) || [];
    var seen = {}, out = [];
    var cur = String(current || '').trim();
    mine.concat(team).forEach(function (s) {
      s = String(s || '').trim();
      if (!s || seen[s] || s === cur || out.length >= CHIP_MAX) return;
      seen[s] = true;
      out.push(s);
    });
    return out;
  }

  function chipsHtml(f, c, current) {
    var list = chipValues(f.k, c, current);
    if (!list.length) return '';
    return '<div class="wf-chips" role="group" aria-label="คำที่ใช้บ่อย ' + esc(f.label) + '">' + list.map(function (s) {
      return '<button type="button" class="wf-chip" data-action="wf-pick" data-k="' + f.k + '" data-v="' + esc(s) + '">' + esc(s) + '</button>';
    }).join('') + '</div>';
  }

  /** แตะคำที่ใช้บ่อย → ใส่ในช่องแทนค่าเดิม (แก้ต่อได้) */
  function pickChip(el) {
    var input = document.getElementById('wf-' + el.getAttribute('data-k'));
    if (!input || input.disabled) return;
    input.value = el.getAttribute('data-v');
    onWorkInput(input);
    var row = el.parentNode;
    Array.prototype.forEach.call(row.children, function (b) { b.removeAttribute('aria-pressed'); });
    el.setAttribute('aria-pressed', 'true');
  }

  function workValidate(v) {
    var err = {};
    WORK_FIELDS.forEach(function (f) {
      var x = String(v[f.k] == null ? '' : v[f.k]).trim();
      if (f.req && !x) err[f.k] = 'กรุณากรอก' + (f.k === 'by' ? 'ชื่อผู้ปฏิบัติงาน' : f.label);
      else if (x.length > 300) err[f.k] = 'ยาวเกินไป (ไม่เกิน 300 ตัวอักษร)';
    });
    return err;
  }

  /** ส่งข้อความเข้ากลุ่มในนามผู้ใช้ (liff.sendMessages ไม่กินโควตาบอท) · โหมดตัวอย่างแสดงหน้าตาข้อความแทน */
  /** แสดงการ์ด Flex แบบคร่าวๆ ในโหมดตัวอย่าง (รองรับเฉพาะ box/text/separator/button ที่ workFlex ใช้) */
  function flexPreview(n) {
    if (!n) return '';
    if (n.type === 'bubble') {
      return '<div class="fx-card"><div class="fx-head">' + flexPreview(n.header.contents[0]) + '</div>' +
        '<div class="fx-body">' + flexPreview(n.body) + '</div>' + (n.footer ? '<div class="fx-foot">' + flexPreview(n.footer) + '</div>' : '') + '</div>';
    }
    if (n.type === 'box') {
      return '<div class="fx-box fx-' + n.layout + '">' + n.contents.map(flexPreview).join('') + '</div>';
    }
    if (n.type === 'separator') return '<hr class="fx-sep">';
    if (n.type === 'button') return '<span class="fx-btn">' + esc(n.action.label) + '</span>';
    var st = 'flex:' + (n.flex === 0 ? '0 0 auto' : (n.flex == null ? 1 : n.flex) + ' 1 0') + ';color:' + (n.color || '#17181C') + ';' + (n.weight === 'bold' ? 'font-weight:700;' : '') +
      (n.align === 'end' ? 'text-align:right;' : '') + (n.decoration === 'underline' ? 'text-decoration:underline;' : '') + 'font-size:' + ({ xs: '13px', sm: '14px', md: '16px' }[n.size] || '15px');
    return '<span class="fx-text" style="' + st + '">' + esc(n.text) + '</span>';
  }

  /** ส่งการ์ดเข้ากลุ่ม ถ้าส่งการ์ดไม่ได้ (LINE รุ่นเก่า) ส่งเป็นข้อความ text แทน */
  function sendToGroup(text, flex) {
    if (DEMO) {
      overlay.innerHTML = '<div class="backdrop" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sg-t">' +
        '<div class="sheet-handle"></div><h3 id="sg-t">การ์ดที่จะส่งเข้ากลุ่ม</h3>' +
        '<p class="work-hint">โหมดตัวอย่างไม่ได้ส่งจริง · ของจริงจะส่งในชื่อคุณ</p>' +
        (flex ? flexPreview(flex.contents) : '<div class="chat-bubble">' + esc(text) + '</div>') +
        '<div class="btn-row one"><button class="btn primary" data-action="close">ปิด</button></div></div>';
      overlay.querySelector('.btn.primary').focus();
      return Promise.resolve(true);
    }
    if (!window.liff || !liff.isInClient || !liff.isInClient()) return Promise.resolve(false);
    var asText = function () { return liff.sendMessages([{ type: 'text', text: text }]); };
    var first = flex ? liff.sendMessages([flex]).catch(asText) : asText();
    return first.then(function () { return true; }, function () { return false; });
  }

  function afterSend(ok, done) {
    if (DEMO) return;
    if (ok) toast(done ? 'บันทึกผลและส่งเข้ากลุ่มแล้ว' : 'รับงานแล้ว · แจ้งกลุ่มแล้ว');
    else toast('บันทึกแล้ว แต่ส่งเข้ากลุ่มไม่ได้ · เปิดจากปุ่มในแชทกลุ่มเพื่อให้ส่งได้', true);
  }

  function onCase(id) { return state.screen === 'case' && state.caseData && state.caseData.caseId === id; }

  function workCall(c, payload, onOk) {
    var id = c.caseId;
    if (workSaving[id]) return;
    workSaving[id] = true;
    state.work.saving = true;
    renderCase(null);
    var settle = function () {
      delete workSaving[id];
      if (state.work && state.work.caseId === id) state.work.saving = false;
    };
    Api.call('work', Object.assign({ caseId: id }, payload)).then(function (upd) {
      settle();
      patchCase(id, snapshot(upd));
      if (state.caseData && state.caseData.caseId === id) {
        Object.assign(state.caseData, snapshot(upd));
        if (upd.audit) state.caseData.audit = upd.audit;
      }
      onOk(upd);
      if (onCase(id)) renderCase(null); else refresh();
    }, function (e) {
      settle();
      if (onCase(id)) renderCase(null);
      toast('บันทึกไม่สำเร็จ: ' + e.message + ' · ข้อมูลที่กรอกยังอยู่ ลองกดอีกครั้ง', true);
    });
  }

  function workAction(a) {
    var c = state.caseData;
    if (!c || !state.work || state.work.caseId !== c.caseId) return;
    var w = state.work;
    if (a === 'work-open') { w.open = true; renderCase(null); focusField(WORK_FIELDS[0].k); return; }
    if (a === 'work-cancel') {
      w.open = false; w.err = {};
      lsSet('rb_work_' + c.caseId, null);
      state.work = null;
      renderCase(null);
      return;
    }
    if (a === 'work-start') {
      workCall(c, { status: 'doing' }, function (upd) {
        var by = (upd && upd.workBy) || state.me.name || '';
        var card = workFlex(c, 'doing', { by: by, startAt: (upd && upd.workAt) || nowThaiTime() });
        sendToGroup('🔧 เคส #' + c.seq + ' ' + by + ' รับงานแล้ว' + groupNote(c) + '\n' + c.title, card).then(function (ok) { afterSend(ok, false); });
      });
      return;
    }
    if (a === 'work-reopen') {
      confirmDialog({ title: 'เปลี่ยนเป็นยังไม่เสร็จ?', body: 'รายการ #' + c.seq + ' จะกลับไปเป็น “กำลังทำ” และนับเป็นงานค้าง', ok: 'เปลี่ยน', danger: true })
        .then(function (yes) { if (yes) workCall(c, { status: 'doing' }, function () { if (state.work && state.work.caseId === c.caseId) state.work.open = true; }); });
      return;
    }
    if (a === 'work-save') {
      w.err = workValidate(w.v);
      var first = WORK_FIELDS.filter(function (f) { return w.err[f.k]; })[0];
      if (first) { renderCase(null); focusField(first.k); return; }
      var v = {};
      WORK_FIELDS.forEach(function (f) { v[f.k] = String(w.v[f.k] == null ? '' : w.v[f.k]).trim(); if (f.upper) v[f.k] = v[f.k].toUpperCase(); });
      lsSet(WORKER_KEY, v.by);
      rememberWork(v);
      // ใครรับงานและเมื่อไร ต้องจำไว้ก่อนบันทึก เพราะหลังบันทึก workBy/workAt จะเป็นของตอนเสร็จ
      var started = c.workStatus === 'doing' ? { by: c.workBy, at: c.workAt } : {};
      workCall(c, { status: 'done', work: v }, function (upd) {
        lsSet('rb_work_' + c.caseId, null);
        if (state.work && state.work.caseId === c.caseId) { state.work.open = false; state.work.dirty = false; state.work.v = v; }
        if (navigator.vibrate) navigator.vibrate(15);
        var doneBy = (upd && upd.workBy) || state.me.name || '';
        var doneAt = (upd && upd.workAt) || nowThaiTime();
        var card = workFlex(c, 'done', { v: v, by: started.by || doneBy, startAt: started.at || doneAt, doneBy: doneBy, doneAt: doneAt });
        sendToGroup(workMessage(c, v), card).then(function (ok) { afterSend(ok, true); });
      });
    }
  }

  function focusField(k) {
    var el = document.getElementById('wf-' + k);
    if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); }
  }

  function onWorkInput(el) {
    var w = state.work, k = el.getAttribute('data-wf');
    if (!w || w.saving) return;
    w.v[k] = el.value;
    w.dirty = true;
    if (w.err[k]) {
      delete w.err[k];
      el.removeAttribute('aria-invalid');
      var m = document.getElementById(el.id + '-e');
      if (m) m.remove();
    }
    lsSet('rb_work_' + w.caseId, JSON.stringify(w.v));
  }

  // ---------- ย้อนหลัง 90 วัน ----------

  var searchTimer = null;

  function showHistory(silent) {
    destroyMap();
    state.screen = 'history';
    if (!silent) {
      renderHistory();
      window.scrollTo(0, 0);
    }
    var seq = ++loadSeq;
    lastLoadAt = Date.now();
    Api.call('days').then(function (d) {
      if (seq !== loadSeq) return;
      state.days = d.days;
      renderHistory();
    }, function (e) {
      if (seq !== loadSeq) return;
      renderHistory(e.message);
    });
  }

  function renderHistory(error) {
    var focused = document.activeElement && document.activeElement.id === 'q';
    var html = demoFlag() + '<header class="topbar solo">' +
      '<div class="topbar-text"><div class="topbar-sub">' + esc(GROUP_LABEL) + '</div><h1>ย้อนหลัง ' + RETENTION + ' วัน</h1></div>' +
      '<button class="icon-btn" data-action="refresh" aria-label="โหลดรายการล่าสุด">' + icon('refresh', 22) + '</button></header>' +
      '<main class="content has-nav"><label class="search">' + icon('search') + '<span class="sr-only">ค้นหา</span>' +
      '<input id="q" type="search" placeholder="ค้นหาสถานที่ หรือเบอร์โทร" value="' + esc(state.searchQ) + '" autocomplete="off" enterkeyhint="search"></label>';

    if (state.searchQ.trim().length >= 2) {
      html += '<h2 class="month">ผลการค้นหา</h2>';
      if (!state.searchResults) html += skeletonCards(2);
      else if (!state.searchResults.length) html += emptyHtml('ไม่พบรายการที่ตรงกับ “' + esc(state.searchQ) + '”', 'ลองค้นด้วยชื่อหมู่บ้าน หมู่ที่ หรือเลขท้ายเบอร์ 4 ตัว');
      else html += '<div class="day-list">' + state.searchResults.map(function (c) {
        return '<a class="result-row" href="#/case/' + encodeURIComponent(c.groupOf || c.caseId) + '"><div class="mid"><b>' + esc(c.title) + '</b>' +
          '<small>' + shortDate(c.reportDate) + ' ' + esc(c.time) + ' · #' + c.seq + '</small></div>' + statusPill(c) + '</a>';
      }).join('') + '</div>';
    } else if (error) {
      html += errorHtml(error, 'reload-history');
    } else if (!state.days) {
      html += '<div class="card pending-card"><div class="skel" style="width:44px;height:44px"></div><div style="flex:1"><div class="skel" style="height:18px;width:60%"></div></div></div>' + skeletonCards(2);
    } else {
      var pending = state.days.reduce(function (s, d) { return s + d.count - d.doneCount; }, 0);
      html += pending
        ? '<a class="card pending-card todo" href="#/pending/' + addDays(todayKey(), 1) + '"><div class="ic-wrap">' + icon('alert', 22) + '</div><div style="flex:1"><b>' + pending + ' รายการยังไม่ติ๊ก</b><small>ใน ' + RETENTION + ' วันที่ผ่านมา · แตะเพื่อดูและติ๊ก</small></div>' + icon('chevR') + '</a>'
        : '<div class="card pending-card done"><div class="ic-wrap">' + icon('checkCircle', 22) + '</div><div><b>ติ๊กครบทุกรายการ</b><small>ใน ' + RETENTION + ' วันที่ผ่านมา · ' + state.days.length + ' วันที่มีรับแจ้ง</small></div></div>';
      if (!state.days.length) html += emptyHtml('ยังไม่มีรายการรับแจ้ง', '');
      var month = '';
      state.days.forEach(function (d, i) {
        var m = d.date.slice(0, 7);
        if (m !== month) {
          html += (month ? '</div>' : '') + '<h2 class="month">' + thaiMonth(d.date) + '</h2><div class="day-list">';
          month = m;
        }
        var left = d.count - d.doneCount;
        var pct = d.count ? Math.round(d.doneCount / d.count * 100) : 0;
        html += '<a class="day-row" href="#/day/' + d.date + '"><div class="day-num"><b>' + parts(d.date)[2] + '</b><span>' + DOW_SHORT[dow(d.date)] + '</span></div>' +
          '<div class="day-mid"><div class="d">' + thaiDate(d.date) + '</div><div class="progress small"><span style="width:' + pct + '%"></span></div></div>' +
          '<div class="day-right"><span class="n">' + d.count + ' จุด</span>' +
          (left ? '<span class="status todo">ค้าง ' + left + '</span>' : '<span class="status done">ครบ</span>') + '</div></a>';
        if (i === state.days.length - 1) html += '</div>';
      });
    }
    app.innerHTML = html + '</main>' + bottomNav('history');
    if (focused) {
      var q = document.getElementById('q');
      q.focus();
      q.setSelectionRange(q.value.length, q.value.length);
    }
  }

  function onSearchInput(value) {
    state.searchQ = value;
    state.searchResults = null;
    clearTimeout(searchTimer);
    if (value.trim().length < 2) { renderHistory(); return; }
    renderHistory();
    searchTimer = setTimeout(function () {
      var q = value;
      Api.call('search', { q: q }).then(function (d) {
        if (state.searchQ !== q || state.screen !== 'history') return;
        state.searchResults = d.cases;
        renderHistory();
      }, function (e) { toast(e.message, true); });
    }, 350);
  }

  // ---------- รายการที่ยังไม่ติ๊ก (รีเช็คงานค้าง) ----------

  function showPending(before, silent) {
    destroyMap();
    state.screen = 'pending';
    if (!silent || state.pendingBefore !== before) {
      state.pending = null;
      state.pendingBefore = before;
      renderPending();
      window.scrollTo(0, 0);
    }
    var seq = ++loadSeq;
    lastLoadAt = Date.now();
    Api.call('carryover', { before: before }).then(function (d) {
      if (seq !== loadSeq) return;
      state.pending = d.cases;
      renderPending();
    }, function (e) {
      if (seq !== loadSeq) return;
      if (silent && state.pending) { toast(e.message, true); return; }
      renderPending(e.message);
    });
  }

  function renderPending(error) {
    var includesToday = state.pendingBefore > todayKey();
    var list = (state.pending || []).filter(function (c) { return !c.hidden; });
    var left = list.filter(function (c) { return !c.done; }).length;
    var html = demoFlag() + '<header class="topbar solo">' +
      (includesToday ? '' : '<a class="icon-btn" href="#/day/' + state.pendingBefore + '" aria-label="กลับ">' + icon('chevL', 22) + '</a>') +
      '<div class="topbar-text"><div class="topbar-sub">' +
      (includesToday ? 'ทั้งหมดใน ' + RETENTION + ' วัน' : 'ก่อนวันที่ ' + shortDate(state.pendingBefore)) + '</div>' +
      '<h1>รายการที่ยังไม่ติ๊ก</h1></div>' +
      '<button class="icon-btn" data-action="refresh" aria-label="โหลดรายการล่าสุด">' + icon('refresh', 22) + '</button></header>' +
      '<main class="content has-nav">';
    if (error) {
      html += errorHtml(error, 'refresh');
    } else if (!state.pending) {
      html += skeletonCards(2);
    } else if (!list.length) {
      html += emptyHtml('ไม่มีงานค้าง', 'ทุกรายการรับแจ้งถูกติ๊กว่าดำเนินการแล้ว');
    } else {
      html += '<section class="card summary"><div class="summary-num"><span class="big" style="color:var(--todo-ink)">' + left + '</span>' +
        '<span class="lbl">รายการยังไม่ติ๊ก</span></div><div class="summary-foot"><span>ติ๊กได้จากหน้านี้เลย รายการที่ติ๊กแล้วจะหายไปเมื่อโหลดใหม่</span></div></section>';
      var date = '';
      list.forEach(function (c) {
        if (c.reportDate !== date) {
          date = c.reportDate;
          var n = list.filter(function (x) { return x.reportDate === date; }).length;
          html += '<h2 class="month"><a href="#/day/' + date + '">' + thaiDate(date) + '</a> · ' + n + ' รายการ</h2>';
        }
        html += '<div class="case-list">' + caseCardHtml(c) + '</div>';
      });
    }
    app.innerHTML = html + '</main>' + bottomNav(includesToday ? 'pending' : '');
    hydratePhotos(app);
  }

  // ---------- ติ๊ก / ซ่อน ----------

  function allCopies(id) {
    var out = [];
    if (state.day) {
      state.day.cases.concat(state.day.hiddenCases || []).forEach(function (c) { if (c.caseId === id) out.push(c); });
    }
    if (state.caseData && state.caseData.caseId === id) out.push(state.caseData);
    (state.searchResults || []).concat(state.pending || []).forEach(function (c) { if (c.caseId === id) out.push(c); });
    return out;
  }
  function findCase(id) { return allCopies(id)[0] || null; }

  function patchCase(id, patch) {
    allCopies(id).forEach(function (c) { Object.assign(c, patch); });
    if (state.day) {
      var all = state.day.cases.concat(state.day.hiddenCases || []).sort(function (a, b) { return a.seq - b.seq; });
      state.day.cases = all.filter(function (c) { return !c.hidden; });
      state.day.hiddenCases = all.filter(function (c) { return c.hidden; });
    }
  }

  function snapshot(c) {
    var s = {
      done: c.done, doneBy: c.doneBy, doneAt: c.doneAt, hidden: c.hidden, hiddenBy: c.hiddenBy, hiddenAt: c.hiddenAt,
      workStatus: c.workStatus || '', workBy: c.workBy || '', workAt: c.workAt || ''
    };
    // คำตอบของ tick/hide ไม่มีผลงานมาด้วย ห้ามล้างของเดิมทิ้ง
    if ('work' in c) s.work = c.work || null;
    return s;
  }

  function refresh() {
    if (state.screen === 'day') {
      if (state.view === 'map' && map) {
        var s = document.getElementById('summary');
        if (s) s.outerHTML = summaryHtml();
        refreshMarkers(false);
        if (state.sheetCaseId) renderSheet();
      } else {
        renderDay();
      }
    } else if (state.screen === 'case') {
      renderCase(null);
    } else if (state.screen === 'history') {
      renderHistory();
    } else if (state.screen === 'pending') {
      renderPending();
    }
  }

  function toggleTick(id) {
    var c = findCase(id);
    if (!c) return;
    var next = !c.done;
    var confirmFirst = next ? Promise.resolve(true) : confirmDialog({
      title: 'ยกเลิกการติ๊ก?',
      body: 'รายการ #' + c.seq + ' จะกลับไปเป็น “ยังไม่ติ๊ก”',
      ok: 'ยกเลิกการติ๊ก', danger: true
    });
    confirmFirst.then(function (yes) {
      if (!yes) return;
      var before = snapshot(c);
      if (next && navigator.vibrate) navigator.vibrate(15);
      patchCase(id, next ? { done: true, doneBy: state.me.name, doneAt: nowHHMM() } : { done: false, doneBy: '', doneAt: '' });
      refresh();
      Api.call('tick', { caseId: id, done: next }).then(function (upd) {
        patchCase(id, snapshot(upd));
        refresh();
      }, function (e) {
        patchCase(id, before);
        refresh();
        toast('บันทึกไม่สำเร็จ: ' + e.message, true);
      });
    });
  }

  /** ซ่อนทันทีแล้วให้กด "เลิกทำ" ใน toast แทนการถามยืนยันก่อน (เร็วกว่าตอนอยู่หน้างาน) */
  function setHidden(id, hidden) {
    var c = findCase(id);
    if (!c) return;
    var before = snapshot(c);
    patchCase(id, hidden ? { hidden: true, hiddenBy: state.me.name, hiddenAt: nowHHMM() } : { hidden: false, hiddenBy: '', hiddenAt: '' });
    refresh();
    if (hidden) {
      toast('ซ่อนรายการ #' + c.seq + ' แล้ว · ไม่นับในสรุป', false, { label: 'เลิกทำ', fn: function () { setHidden(id, false); } });
    } else {
      toast('คืนรายการ #' + c.seq + ' แล้ว');
    }
    Api.call('hide', { caseId: id, hidden: hidden }).then(function (upd) {
      patchCase(id, snapshot(upd));
      refresh();
    }, function (e) {
      patchCase(id, before);
      refresh();
      toast('บันทึกไม่สำเร็จ: ' + e.message, true);
    });
  }

  // ---------- รูป ----------

  function loadPhoto(id, size) {
    var key = id + '|' + size;
    if (photoCache[key]) return Promise.resolve(photoCache[key]);
    if (!photoPending[key]) {
      photoPending[key] = Api.call('photo', { fileId: id, size: size }).then(function (p) {
        photoCache[key] = 'data:' + p.mime + ';base64,' + p.data;
        delete photoPending[key];
        return photoCache[key];
      }, function (e) { delete photoPending[key]; throw e; });
    }
    return photoPending[key];
  }

  function hydratePhotos(root) {
    Array.prototype.forEach.call(root.querySelectorAll('img[data-photo]'), function (img) {
      var id = img.getAttribute('data-photo');
      var size = img.getAttribute('data-size') || 'thumb';
      var cached = photoCache[id + '|' + size] || (size === 'thumb' ? photoCache[id + '|full'] : null);
      if (cached) { img.src = cached; return; }
      img.classList.add('skel');
      loadPhoto(id, size).then(function (src) {
        img.classList.remove('skel');
        img.src = src;
      }, function () { img.classList.remove('skel'); img.alt = 'โหลดรูปไม่สำเร็จ'; });
    });
  }

  function openPhoto(id) {
    overlay.innerHTML = '<div class="lightbox" role="dialog" aria-modal="true" aria-label="รูปเต็มจอ" data-action="close">' +
      '<span class="loading">กำลังโหลดรูป…</span>' +
      '<button class="icon-btn" data-action="close" aria-label="ปิด">' + icon('x', 22) + '</button></div>';
    loadPhoto(id, 'full').then(function (src) {
      var box = overlay.querySelector('.lightbox');
      if (!box) return;
      box.querySelector('.loading').outerHTML = '<img src="' + src + '" alt="รูปจากผู้แจ้ง">';
    }, function (e) { closeOverlay(); toast(e.message, true); });
  }

  // ---------- overlay / ส่วนช่วย ----------

  var confirmResolve = null;

  function confirmDialog(o) {
    return new Promise(function (resolve) {
      confirmResolve = resolve;
      overlay.innerHTML = '<div class="backdrop" data-action="confirm-no"></div>' +
        '<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t"><h2 id="dlg-t">' + esc(o.title) + '</h2><p>' + esc(o.body) + '</p>' +
        '<div class="btn-row"><button class="btn" data-action="confirm-no">ไม่ใช่ตอนนี้</button>' +
        '<button class="btn ' + (o.danger ? 'danger' : 'primary') + '" data-action="confirm-yes">' + esc(o.ok) + '</button></div></div>';
      overlay.querySelector('[data-action="confirm-yes"]').focus();
    });
  }

  function closeOverlay() {
    overlay.innerHTML = '';
    state.sheetCaseId = null;
    if (confirmResolve) { var r = confirmResolve; confirmResolve = null; r(false); }
  }

  var toastTimer = null;
  function toast(msg, isError, action) {
    var el = document.getElementById('toast');
    if (el) el.remove();
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast' + (isError ? ' error' : '');
    el.setAttribute('role', isError ? 'alert' : 'status');
    el.innerHTML = icon(isError ? 'alert' : 'check', 18) + '<span>' + esc(msg) + '</span>' +
      (action ? '<button class="toast-action">' + esc(action.label) + '</button>' : '');
    if (action) {
      el.querySelector('.toast-action').addEventListener('click', function () {
        el.remove();
        action.fn();
      });
    }
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.remove(); }, isError || action ? 6000 : 2500);
  }

  function emptyHtml(title, sub) {
    return '<div class="empty">' + icon('inbox', 40) + '<b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
  }
  function errorHtml(msg, action) {
    return '<div class="empty">' + icon('alert', 40) + '<b>โหลดข้อมูลไม่สำเร็จ</b><span>' + esc(msg) + '</span>' +
      '<div style="margin-top:14px"><button class="btn" data-action="' + action + '">ลองใหม่</button></div></div>';
  }
  function skeletonCards(n) {
    var one = '<div class="card skel-card" aria-hidden="true"><div class="skel" style="height:16px;width:35%"></div>' +
      '<div class="skel" style="height:20px;width:85%"></div><div class="skel" style="height:14px;width:60%"></div>' +
      '<div class="skel" style="height:48px;border-radius:12px"></div></div>';
    return '<div class="case-list" aria-busy="true">' + new Array(n + 1).join(one) + '</div>';
  }
  function demoFlag() {
    return DEMO ? '<div class="demo-flag">โหมดตัวอย่าง · ข้อมูลสมมติ ไม่ได้เชื่อมกับกลุ่ม LINE จริง</div>' : '';
  }

  // ---------- event ----------

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');
    switch (a) {
      case 'prev-day': go('#/day/' + addDays(state.date, -1)); break;
      case 'next-day': if (state.date < todayKey()) go('#/day/' + addDays(state.date, 1)); break;
      case 'view':
        state.view = el.getAttribute('data-view');
        destroyMap();
        renderDay();
        break;
      case 'filter': state.filter = el.getAttribute('data-filter'); renderDay(); break;
      case 'group-filter':
        state.groupFilter = el.getAttribute('data-group') || '';
        if (state.view === 'map') destroyMap(); // วาดแผนที่ใหม่ หมุดตามกลุ่มที่เลือก
        renderDay();
        break;
      case 'toggle-hidden': state.hiddenOpen = !state.hiddenOpen; renderDay(); break;
      case 'tick': toggleTick(id); break;
      case 'hide': setHidden(id, true); break;
      case 'unhide': setHidden(id, false); break;
      case 'open-photo': e.preventDefault(); openPhoto(el.getAttribute('data-file')); break;
      case 'gallery': state.galleryIdx = Number(el.getAttribute('data-idx')); renderCase(null); break;
      case 'close': if (e.target === el || el.tagName === 'BUTTON') closeOverlay(); break;
      case 'confirm-yes': var r = confirmResolve; confirmResolve = null; overlay.innerHTML = ''; if (r) r(true); break;
      case 'confirm-no': closeOverlay(); break;
      case 'reload-day': showDay(state.date); break;
      case 'reload-history': showHistory(); break;
      case 'refresh': reloadCurrent(); break;
      case 'today': go('#/day/' + todayKey()); break;
      case 'goto-map': state.view = 'map'; go('#/day/' + state.date); break;
      case 'back': history.back(); break;
      case 'work-start': case 'work-open': case 'work-cancel': case 'work-save': case 'work-reopen': workAction(a); break;
      case 'wf-pick': pickChip(el); break;
      case 'group-join': case 'group-dismiss': case 'group-remove': case 'samejob': case 'repeat': case 'repeat-undo': groupAction(a, el); break;
    }
  });

  // กลับมาเปิดแอปหลังสลับไปทำอย่างอื่นเกิน 1 นาที → โหลดรายการล่าสุดเงียบๆ
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && lastLoadAt && Date.now() - lastLoadAt > 60000 && !overlay.innerHTML) {
      reloadCurrent();
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') onSearchInput(e.target.value);
    else if (e.target.hasAttribute('data-wf')) onWorkInput(e.target);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.innerHTML) closeOverlay();
  });

  window.addEventListener('hashchange', route);

  // ---------- เริ่มทำงาน ----------

  function initialDate() {
    var m = location.search.match(/[?&]date=(\d{4}-\d{2}-\d{2})/);
    return m && m[1] <= todayKey() ? m[1] : todayKey();
  }

  // ---------- เก็บรายการล่าสุดไว้ในเครื่อง (เปิดครั้งหน้าเห็นทันที) ----------
  var DAY_KEY = 'rb_day_v1';
  function savedDay(date) {
    if (DEMO) return null;
    try {
      var d = JSON.parse(localStorage.getItem(DAY_KEY) || 'null');
      if (!d || d.date !== date) return null;
      d._local = true;
      return d;
    } catch (e) { return null; }
  }
  function saveDay(d) {
    if (DEMO || d.date !== todayKey()) return;
    try { localStorage.setItem(DAY_KEY, JSON.stringify(d)); } catch (e) {}
  }
  function forgetDay() {
    try { localStorage.removeItem(DAY_KEY); } catch (e) {}
  }
  function setLoading(on) {
    var b = document.querySelector('[data-action="refresh"]');
    if (b) b.classList.toggle('spinning', on);
  }

  function fatal(msg) {
    app.innerHTML = '<div class="fatal">' + icon('alert', 40) + '<b>เปิดหน้ารายการไม่ได้</b><span>' + esc(msg) + '</span></div>';
  }

  function boot() {
    var ready = DEMO ? Promise.resolve() : liff.init({ liffId: CFG.LIFF_ID }).then(function () {
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: location.href });
        return new Promise(function () {}); // กำลัง redirect
      }
    });
    state.date = initialDate();
    // ระหว่างรอ LINE เข้าสู่ระบบ แสดงหน้ารายการไว้เลย: มีรายการเก่าในเครื่องก็แสดงรายการนั้น
    // ไม่มีก็แสดงโครงหน้ารอโหลด (ยังไม่เรียก API จนกว่า LIFF พร้อม)
    var h = parseHash();
    if (!DEMO && h.name === 'day' && (!h.arg || h.arg === state.date)) {
      state.day = savedDay(state.date);
      state.loading = true;
      renderDay();
    }
    ready.then(function () {
      // ชื่อผู้ใช้มากับคำตอบของ API ทุกครั้ง ไม่ต้องเรียก 'me' แยก (ประหยัดไป 1 รอบ)
      if (DEMO) Api.call('me').then(function (me) { state.me = me; });
      // ปุ่ม "เปิดเคส" จากการ์ดที่บอทตอบในกลุ่ม: ?case=<caseId>
      var cm = location.search.match(/[?&]case=([\w-]{1,40})/);
      if (!location.hash) history.replaceState(null, '', cm ? '#/case/' + cm[1] : '#/day/' + state.date);
      route();
    }, function (e) {
      fatal((e && e.message) || 'ลองเปิดใหม่จากลิงก์ในกลุ่ม LINE');
    });
  }

  boot();

  // =====================================================================
  // ข้อมูลตัวอย่าง (โหมดตัวอย่าง) — API ปลอมที่ตอบรูปแบบเดียวกับ Apps Script
  // =====================================================================

  function createDemoApi() {
    var today = todayKey();
    var cases = [];
    var audit = {};
    // ตัวอย่างรับแจ้งจาก 2 กลุ่ม (บอท 1 = มดงาน, บอท 2 = ระบบการรับแจ้ง 2)
    var DEMO_GROUPS = ['มดงาน', 'รับแจ้ง 2'];
    var NAMES = ['ซุบเปอร์แมน', 'หมู ม.5', 'ช่างเอก', 'พี่ต้อม', 'น้องแบงค์', 'ลุงชัย', 'แอดมินมดงาน'];
    var TITLES = [
      'หม้อแปลงมีเสียงดัง หน้าวัดไผ่กองดิน', 'ไฟดับทั้งซอย บ้านแหลม ม.4', 'สายไฟขาด ต้นไม้ล้มทับ ริมคลองบางปลาม้า',
      'มิเตอร์ไม่หมุน บ้านโพธิ์ ม.6', 'ไฟกระพริบ ชุมชนตลาดบางปลาม้า', 'เสาไฟเอียง ถนนสาย 3351',
      'ประกายไฟที่หัวเสา หน้าโรงเรียนวัดสาลี', 'ไฟตกทั้งหมู่บ้าน บ้านกระทุ่มทอง ม.2'
    ];
    var seqByDate = {};

    function add(date, time, o) {
      seqByDate[date] = (seqByDate[date] || 0) + 1;
      var c = Object.assign({
        caseId: date.replace(/-/g, '') + '-' + ('00' + seqByDate[date]).slice(-3),
        seq: seqByDate[date], reportDate: date, time: time, reporterName: NAMES[0], sources: ['keyword'],
        title: '', detail: '', phones: [], lat: null, lng: null, address: '', approxAddress: '', mapsUrl: '',
        photoFileIds: [], dupCount: 0, done: false, doneBy: '', doneAt: '', hidden: false, hiddenBy: '', hiddenAt: '',
        deleteOn: addDays(date, RETENTION + 1), parts: null, group: DEMO_GROUPS[0]
      }, o);
      if (!c.parts) c.parts = defaultParts(c);
      cases.push(c);
      audit[c.caseId] = [];
      if (c.done) audit[c.caseId].push({ action: 'tick', name: c.doneBy, time: c.doneAt, date: date });
      if (c.hidden) audit[c.caseId].push({ action: 'hide', name: c.hiddenBy, time: c.hiddenAt, date: date });
      return c;
    }

    function defaultParts(c) {
      var p = [];
      var plus = function (t, m) {
        var x = Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) + m;
        return ('0' + Math.floor(x / 60) % 24).slice(-2) + ':' + ('0' + x % 60).slice(-2);
      };
      c.photoFileIds.forEach(function (_, i) { p.push({ time: plus(c.time, i), type: 'image', kind: '', name: c.reporterName, dup: false }); });
      if (c.sources.indexOf('photo_location') >= 0) p.push({ time: plus(c.time, 1), type: 'location', kind: '', name: c.reporterName, dup: false });
      c.sources.forEach(function (s) {
        if (s !== 'photo_location') p.push({ time: plus(c.time, c.sources.length > 1 ? 4 : 0), type: 'text', kind: s, name: c.reporterName, dup: false });
      });
      if (c.contactPart) p.push({ time: plus(c.time, 1), type: 'contact', kind: '', name: c.reporterName, dup: false });
      for (var i = 0; i < c.dupCount; i++) p.push({ time: plus(c.time, 25), type: 'text', kind: 'phone_place', name: NAMES[4], dup: true });
      return p.sort(function (a, b) { return a.time < b.time ? -1 : 1; });
    }

    // วันนี้: ตัวอย่างจากข้อความจริงในกลุ่ม (เบอร์เป็นเบอร์สมมติ)
    add(today, '06:59', {
      sources: ['phone_place'], title: 'บ้านหงส์ ม 8หลังโรงบาลบางปลาม้า ไฟดับ', phones: ['0810000001'],
      reporterName: 'ซุบเปอร์แมน', done: true, doneBy: 'ช่างเอก', doneAt: '08:12'
    });
    add(today, '07:40', {
      sources: ['photo_location'], title: 'แจ้งด้วยรูปและพิกัด', lat: 14.4071, lng: 100.1386,
      address: 'ต.บางปลาม้า อ.บางปลาม้า สุพรรณบุรี', approxAddress: 'ถนนสาย 3351 ต.บางปลาม้า',
      photoFileIds: ['demo-pole', 'demo-wire'], reporterName: 'หมู ม.5', group: DEMO_GROUPS[1]
    });
    add(today, '09:15', {
      sources: ['keyword'], title: 'หนองแขยง วัดดอน ม 8 ไผ่กองดิน ไฟดับ', detail: 'ต้องนั่งเรือเข้า',
      phones: ['0810000002'], lat: 14.4188, lng: 100.1259, dupCount: 1, reporterName: 'พี่ต้อม',
      done: true, doneBy: 'ลุงชัย', doneAt: '11:40', workStatus: 'done', workBy: 'ลุงชัย', workAt: '09:40',
      work: { date: today, outAt: '09:05', device: 'BAM02F-02', area: 'ไลน์แยกวัดดอน ม.8', trans: '', fix: 'ฟิวส์แรงสูงขาด เฟส A',
        cause: 'ช็อตงู', used: 'ฟิวส์ 15A 1 เส้น', onAt: '11:35', by: 'ชัย ตัวอย่าง ผปร' }
    });
    add(today, '10:05', {
      sources: ['place_problem'], title: 'ไฟดับ ซอยวัดมณีวรรณ ม.3', reporterName: 'แอดมินมดงาน',
      workStatus: 'doing', workBy: 'ช่างเอก', workAt: '10:20'
    });
    // แจ้งซ้ำจุดเดียวกับ #4 (ไฟดับทั้งซอย) ใช้ลองเสนอรวมเป็นงานเดียว
    add(today, '10:28', {
      sources: ['place_problem'], title: 'ซอยวัดมณีวรรณ ไฟไม่มาทั้งซอยครับ', reporterName: 'น้องแบงค์', group: DEMO_GROUPS[1]
    });
    add(today, '10:32', {
      sources: ['photo_location', 'phone_place'], title: 'สาลีหมู่1ซอย 1 (ศาลา) มิเตอร์ใหม่',
      detail: 'ต่อตรงไว้นะครับ เค้าจะมีเรือมารับครับ', phones: ['0920000003'], lat: 14.3932, lng: 100.1517,
      photoFileIds: ['demo-meter'], reporterName: 'น้องแบงค์', done: true, doneBy: 'ช่างเอก', doneAt: '13:05'
    });
    add(today, '11:56', {
      sources: ['media_text'], title: 'มิเตอร์ไฟทางชำรุดข้างโรงเรียนวัดลาดหอย ดับมา 3 วันครับ',
      detail: 'ผู้ติดต่อ: คุณสมศรี ใจดี', phones: ['0810000010'], contactPart: true,
      photoFileIds: ['demo-pole', 'demo-wire', 'demo-meter'], reporterName: 'พี่ต้อม', group: DEMO_GROUPS[1]
    });
    add(today, '13:05', {
      sources: ['phone_place'], title: 'รับแจ้งไฟช็อตและมีประกายไฟที่หัวเสา บ้านกระทุ่มทอง คุณจุก',
      phones: ['0970000004'], reporterName: 'ซุบเปอร์แมน'
    });
    add(today, '14:20', {
      sources: ['photo_location'], title: 'แจ้งด้วยรูปและพิกัด', lat: 14.4102, lng: 100.1440,
      photoFileIds: ['demo-team'], reporterName: 'หมู ม.5',
      hidden: true, hiddenBy: 'ช่างเอก', hiddenAt: '14:31'
    });

    // วันก่อนหน้า
    var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(42);
    [[1, 6, 2], [2, 2, 0], [3, 3, 1], [4, 4, 0], [6, 1, 0], [7, 5, 0], [9, 2, 0], [12, 3, 0], [13, 1, 0], [15, 4, 0],
      [18, 2, 0], [21, 3, 0], [24, 1, 0], [27, 2, 0], [31, 3, 0], [34, 1, 0], [38, 2, 0], [45, 4, 0], [52, 1, 0],
      [60, 2, 0], [67, 3, 0], [75, 1, 0], [83, 2, 0]].forEach(function (d) {
      var date = addDays(today, -d[0]);
      for (var i = 0; i < d[1]; i++) {
        var h = 7 + Math.floor(rnd() * 11);
        var time = ('0' + h).slice(-2) + ':' + ('0' + Math.floor(rnd() * 60)).slice(-2);
        var withCoords = rnd() > 0.4;
        var src = withCoords && rnd() > 0.5 ? ['photo_location'] : [rnd() > 0.5 ? 'keyword' : 'phone_place'];
        var done = i >= d[2];
        add(date, time, {
          sources: src,
          title: src[0] === 'photo_location' ? 'แจ้งด้วยรูปและพิกัด' : TITLES[Math.floor(rnd() * TITLES.length)],
          phones: src[0] === 'photo_location' ? [] : ['08100000' + ('0' + Math.floor(rnd() * 90 + 10)).slice(-2)],
          lat: withCoords ? 14.38 + rnd() * 0.05 : null, lng: withCoords ? 100.11 + rnd() * 0.06 : null,
          photoFileIds: src[0] === 'photo_location' ? ['demo-pole'] : [],
          reporterName: NAMES[Math.floor(rnd() * NAMES.length)],
          done: done, doneBy: done ? NAMES[2] : '', doneAt: done ? '16:30' : '',
          group: DEMO_GROUPS[rnd() > 0.7 ? 1 : 0]
        });
      }
    });
    cases.sort(function (a, b) { return a.reportDate === b.reportDate ? a.seq - b.seq : (a.reportDate < b.reportDate ? -1 : 1); });

    // งานรวมแบบย่อของ group.gs (เทียบชื่อสถานที่ + พิกัด ≤ 1 กม. + ห่างไม่เกิน 1 ชม.)
    function ginfo() {
      var by = {}, of = {}, size = {};
      cases.forEach(function (c) { by[c.caseId] = c; });
      cases.forEach(function (c) { if (c.groupId && c.groupId !== c.caseId && by[c.groupId]) { of[c.caseId] = c.groupId; size[c.groupId] = (size[c.groupId] || 0) + 1; } });
      return { by: by, of: of, size: size };
    }
    function toks(t) {
      var s = String(t || '').replace(/[\s.\-–,/()]+/g, ''), out = [];
      ['หมู่บ้าน', 'บ้าน', 'ซอย', 'วัด', 'โรงเรียน', 'ชุมชน', 'ตลาด', 'ถนน', 'คลอง', 'สะพาน'].forEach(function (w) {
        for (var i = s.indexOf(w); i >= 0; i = s.indexOf(w, i + w.length)) {
          var n = s.slice(i + w.length, i + w.length + 4);
          if (n.length === 4 && /^[\u0E01-\u0E2E]/.test(n) && n.indexOf('ไฟ') !== 0) out.push(w.replace('หมู่บ้าน', 'บ้าน') + n);
        }
      });
      return out;
    }
    function ts(c) { return Date.parse(c.reportDate + 'T' + c.time + ':00+07:00'); }
    function near(a, b) {
      if (a.lat != null && b.lat != null && Math.abs(a.lat - b.lat) < 0.009 && Math.abs(a.lng - b.lng) < 0.009) return true;
      var tb = toks(b.title + b.detail);
      return toks(a.title + a.detail).some(function (t) { return tb.indexOf(t) >= 0; });
    }
    function mini(c) { return { caseId: c.caseId, seq: c.seq, reportDate: c.reportDate, time: c.time, title: c.title, reporterName: c.reporterName, group: c.group || '' }; }
    function members(id, g) { return cases.filter(function (x) { return g.of[x.caseId] === id; }); }
    function candidates(c, g) {
      if (c.hidden || c.done || g.of[c.caseId]) return [];
      var base = [c].concat(members(c.caseId, g));
      return cases.filter(function (x) {
        if (base.indexOf(x) >= 0 || x.hidden || x.done || g.of[x.caseId] || g.size[x.caseId]) return false;
        return base.some(function (b) { return Math.abs(ts(x) - ts(b)) <= 3600000 && near(b, x); });
      });
    }
    function sameJob(c, g) {
      if (c.hidden || c.done || g.of[c.caseId] || g.size[c.caseId]) return [];
      var cand = candidates(c, g);
      return cases.filter(function (x) {
        return x !== c && !x.hidden && !g.of[x.caseId] && cand.indexOf(x) < 0 && Math.abs(ts(x) - ts(c)) <= 3 * 3600000;
      }).sort(function (a, b) {
        if (!!a.done !== !!b.done) return a.done ? -1 : 1;
        return Math.abs(ts(a) - ts(c)) - Math.abs(ts(b) - ts(c));
      }).slice(0, 15).map(function (x) { return Object.assign(mini(x), { done: !!x.done, workStatus: x.workStatus || '', doneBy: x.doneBy || '' }); });
    }
    function sync(main) {
      var g = ginfo();
      members(main.caseId, g).forEach(function (m) { m.done = main.done; m.doneBy = main.doneBy; m.doneAt = main.doneAt; m.workStatus = main.workStatus; });
    }
    function caseFull(c) {
      var g = ginfo(), mainId = g.of[c.caseId];
      return Object.assign(dto(c), {
        parts: c.parts, audit: audit[c.caseId].slice(), suggest: demoSuggest(),
        groupMain: mainId ? mini(g.by[mainId]) : null,
        groupMembers: mainId ? [] : members(c.caseId, g).map(mini),
        groupCandidates: mainId ? [] : candidates(c, g).map(mini),
        sameJob: c.repeatOf ? [] : sameJob(c, g),
        repeatFrom: c.repeatOf && find(c.repeatOf) ? (function (t) {
          return Object.assign(mini(t), { work: t.work ? { device: t.work.device || '', area: t.work.area || '', trans: t.work.trans || '' } : null });
        })(find(c.repeatOf)) : null
      });
    }
    function top(list) { var g = ginfo(); return list.filter(function (c) { return !g.of[c.caseId]; }); }
    function dto(c) {
      var o = Object.assign({}, c); delete o.parts;
      var g = ginfo(); o.groupOf = g.of[c.caseId] || ''; o.groupSize = g.size[c.caseId] || 0;
      return o;
    }
    // คำที่ทีมใช้บ่อย (ของจริงนับจากผลงานในชีต 90 วัน) เรียงจากบ่อยสุด
    var SUGGEST_SEED = {
      device: ['BAM02F-02', 'BAM01F-01', 'BAM03R-01'],
      area: ['ไลน์แยกวัดมณีวรรณ', 'ไลน์แยกวัดดอน ม.8'],
      trans: [],
      fix: ['ฟิวส์แรงสูงขาด เฟส A', 'ฟิวส์แรงต่ำขาด', 'เปลี่ยนฟิวส์ใหม่', 'ตัดกิ่งไม้ ต่อสายใหม่'],
      cause: ['ช็อตงู', 'กิ่งไม้พาดสาย', 'นกเกาะ', 'โหลดเกิน'],
      used: ['ฟิวส์ 15A 1 เส้น', 'ฟิวส์ 10A 1 เส้น', 'ไม่ใช้อุปกรณ์'],
      by: ['ช่างเอก ผปร', 'ชัย ตัวอย่าง ผปร']
    };
    function demoSuggest() {
      var s = JSON.parse(JSON.stringify(SUGGEST_SEED));
      cases.forEach(function (c) {
        if (!c.work) return;
        Object.keys(s).forEach(function (k) { var x = c.work[k]; if (x && s[k].indexOf(x) < 0) s[k].push(x); });
      });
      return s;
    }
    function find(id) { return cases.filter(function (c) { return c.caseId === id; })[0]; }
    function carry(before) {
      return top(cases).filter(function (c) { return !c.hidden && !c.done && c.reportDate < before; });
    }

    var handlers = {
      me: function () { return { name: 'ผู้ทดสอบ' }; },
      day: function (p) {
        var list = top(cases).filter(function (c) { return c.reportDate === p.date; });
        var vis = list.filter(function (c) { return !c.hidden; });
        return {
          date: p.date, cases: vis.map(dto), hiddenCases: list.filter(function (c) { return c.hidden; }).map(dto),
          summary: { total: vis.length, done: vis.filter(function (c) { return c.done; }).length },
          carryoverCount: carry(p.date).length
        };
      },
      carryover: function (p) { var l = carry(p.before); return { before: p.before, count: l.length, cases: l.map(dto) }; },
      days: function () {
        var by = {};
        top(cases).forEach(function (c) {
          if (c.hidden) return;
          var d = by[c.reportDate] || (by[c.reportDate] = { date: c.reportDate, count: 0, doneCount: 0 });
          d.count++;
          if (c.done) d.doneCount++;
        });
        return { days: Object.keys(by).sort().reverse().map(function (k) { return by[k]; }), retentionDays: RETENTION };
      },
      'case': function (p) {
        var c = find(p.id);
        if (!c) throw new ApiError('ไม่พบรายการนี้ อาจถูกลบไปแล้ว', 404);
        return caseFull(c);
      },
      search: function (p) {
        var q = p.q.toLowerCase().replace(/\s+/g, '');
        var digits = p.q.replace(/\D/g, '');
        return {
          q: p.q, cases: cases.filter(function (c) {
            if (digits.length >= 4 && c.phones.some(function (x) { return x.indexOf(digits) >= 0; })) return true;
            return (c.title + c.detail + c.address).toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0;
          }).slice().reverse().slice(0, 50).map(dto)
        };
      },
      photo: function (p) {
        return { mime: 'image/svg+xml', data: btoa(unescape(encodeURIComponent(demoPhoto(p.fileId)))) };
      },
      tick: function (p) {
        var c = find(p.caseId);
        c.done = p.done; c.doneBy = p.done ? 'ผู้ทดสอบ' : ''; c.doneAt = p.done ? nowHHMM() : '';
        audit[c.caseId].push({ action: p.done ? 'tick' : 'untick', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        sync(c);
        return dto(c);
      },
      work: function (p) {
        var c = find(p.caseId);
        if (!c) throw new ApiError('ไม่พบรายการนี้ อาจถูกลบไปแล้ว', 404);
        var t = nowHHMM();
        if (p.status === 'doing') {
          c.workStatus = 'doing'; c.done = false; c.doneBy = ''; c.doneAt = '';
          if (!c.workBy) { c.workBy = 'ผู้ทดสอบ'; c.workAt = t; }
          audit[c.caseId].push({ action: 'start', name: 'ผู้ทดสอบ', time: t, date: todayKey() });
        } else {
          c.workStatus = 'done'; c.work = p.work; c.done = true; c.doneBy = 'ผู้ทดสอบ'; c.doneAt = t;
          audit[c.caseId].push({ action: 'work', name: 'ผู้ทดสอบ', time: t, date: todayKey() });
        }
        sync(c);
        return Object.assign(dto(c), { audit: audit[c.caseId].slice() });
      },
      group: function (p) {
        var main = find(p.caseId), g = ginfo();
        if (!main || g.of[main.caseId]) throw new ApiError('รายการนี้อยู่ในงานอื่นแล้ว', 400);
        main.groupId = main.caseId;
        p.ids.forEach(function (id) {
          var m = find(id);
          if (!m || m.hidden || g.of[id] || g.size[id]) throw new ApiError('บางรายการรวมไม่ได้ ลองโหลดใหม่', 400);
          m.groupId = main.caseId; m.done = main.done; m.doneBy = main.doneBy; m.doneAt = main.doneAt; m.workStatus = main.workStatus;
          audit[id].push({ action: 'group', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        });
        audit[main.caseId].push({ action: 'group', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        return caseFull(main);
      },
      repeat: function (p) {
        var c = find(p.caseId);
        if (p.targetId) {
          var t = find(p.targetId);
          if (!t || !t.done || c.done) throw new ApiError('เลือกได้เฉพาะเคสที่เสร็จแล้ว', 400);
          c.repeatOf = t.caseId;
        } else c.repeatOf = '';
        audit[c.caseId].push({ action: p.targetId ? 'repeat' : 'unrepeat', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        return caseFull(c);
      },
      samejob: function (p) {
        var c = find(p.caseId), t = find(p.targetId), g = ginfo();
        if (!c || !t || c.done || g.of[c.caseId] || g.size[c.caseId] || g.of[t.caseId]) throw new ApiError('รวมไม่ได้ ลองโหลดใหม่', 400);
        t.groupId = t.caseId; c.groupId = t.caseId;
        c.done = t.done; c.doneBy = t.doneBy; c.doneAt = t.doneAt; c.workStatus = t.workStatus;
        audit[c.caseId].push({ action: 'group', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        audit[t.caseId].push({ action: 'group', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        return caseFull(c);
      },
      ungroup: function (p) {
        var c = find(p.caseId), g = ginfo(), mainId = g.of[p.caseId];
        if (!mainId) throw new ApiError('รายการนี้ไม่ได้อยู่ในงานรวม', 400);
        c.groupId = '';
        c.done = false; c.doneBy = ''; c.doneAt = ''; c.workStatus = '';
        if (g.size[mainId] === 1) find(mainId).groupId = '';
        audit[c.caseId].push({ action: 'ungroup', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        return caseFull(find(mainId));
      },
      hide: function (p) {
        var c = find(p.caseId);
        c.hidden = p.hidden; c.hiddenBy = p.hidden ? 'ผู้ทดสอบ' : ''; c.hiddenAt = p.hidden ? nowHHMM() : '';
        audit[c.caseId].push({ action: p.hidden ? 'hide' : 'unhide', name: 'ผู้ทดสอบ', time: nowHHMM(), date: todayKey() });
        return dto(c);
      }
    };

    return {
      call: function (action, payload) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            try { resolve(JSON.parse(JSON.stringify(handlers[action](payload || {})))); } catch (e) { reject(e); }
          }, action === 'photo' ? 250 : 350);
        });
      }
    };
  }

  /** ภาพตัวอย่างวาดด้วย SVG (เสาไฟ/สายไฟ/มิเตอร์) */
  function demoPhoto(id) {
    var sky = { 'demo-pole': ['#9CC3E6', '#E8F1F8'], 'demo-wire': ['#B9C7D6', '#EEF2F6'], 'demo-meter': ['#C9D8C5', '#F1F5EF'], 'demo-team': ['#E7C9A9', '#F7EEE4'] }[id] || ['#C5CBD6', '#EEF0F4'];
    var body;
    if (id === 'demo-meter') {
      body = '<rect x="250" y="120" width="140" height="190" rx="12" fill="#F4F4F2" stroke="#7A7F89" stroke-width="6"/>' +
        '<circle cx="320" cy="190" r="44" fill="#fff" stroke="#7A7F89" stroke-width="5"/><path d="M320 190l26-18" stroke="#B42318" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="276" y="250" width="88" height="24" rx="4" fill="#3A3E47"/>';
    } else if (id === 'demo-team') {
      body = '<rect x="0" y="330" width="640" height="150" fill="#9C8B6E"/><rect x="180" y="250" width="220" height="90" rx="14" fill="#F2F2F2"/>' +
        '<rect x="300" y="210" width="90" height="60" rx="10" fill="#DADDE2"/><circle cx="230" cy="345" r="26" fill="#2B2D33"/><circle cx="360" cy="345" r="26" fill="#2B2D33"/>';
    } else {
      body = '<rect x="0" y="360" width="640" height="120" fill="#7DA35B"/>' +
        '<rect x="300" y="70" width="22" height="300" fill="#8B8F98"/><rect x="230" y="96" width="160" height="14" rx="4" fill="#6E727B"/>' +
        '<path d="M0 120 Q160 160 240 104 M390 104 Q500 150 640 110" stroke="#2B2D33" stroke-width="4" fill="none"/>' +
        (id === 'demo-wire'
          ? '<path d="M390 110 Q430 200 470 330" stroke="#2B2D33" stroke-width="4" fill="none"/><circle cx="470" cy="330" r="16" fill="#FFB020" opacity=".9"/>'
          : '<rect x="262" y="150" width="98" height="80" rx="8" fill="#5D6470"/><circle cx="350" cy="140" r="14" fill="#FFB020" opacity=".9"/>');
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + sky[0] + '"/><stop offset="1" stop-color="' + sky[1] + '"/></linearGradient></defs>' +
      '<rect width="640" height="480" fill="url(#g)"/>' + body + '</svg>';
  }
})();
