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
    media_text: { label: 'ข้อความ+รูป/รายชื่อ', icon: 'auto', auto: 'ระบบจับเองจากข้อความบอกสถานที่หรืออาการเสียที่ส่งตามรูปหรือรายชื่อผู้ติดต่อ ควรเหลือบดูว่าใช่รายการรับแจ้งจริง' },
    photo_location: { label: 'รูป+พิกัด', icon: 'image' }
  };
  var PART_LABELS = {
    keyword: 'ข้อความ “ได้รับแจ้ง”', phone_place: 'ข้อความเบอร์+สถานที่', media_text: 'ข้อความประกอบรูป/รายชื่อ',
    image: 'รูป', location: 'แชร์ตำแหน่ง', maplink: 'ลิงก์แผนที่', contact: 'รายชื่อผู้ติดต่อ (.vcf)'
  };
  var PART_ICONS = { text: 'message', image: 'image', location: 'pin', maplink: 'link', contact: 'user' };
  var AUDIT_LABELS = {
    tick: 'ติ๊กว่าดำเนินการแล้ว', untick: 'ยกเลิกการติ๊ก',
    hide: 'ซ่อน · ไม่ใช่รายการรับแจ้ง', unhide: 'คืนรายการ'
  };

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

  function counts() {
    var list = state.day ? state.day.cases : [];
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
    var badge = state.day ? (state.day.carryoverCount || 0) + (state.date === todayKey() ? counts().todo : 0) : 0;
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
    if (state.view === 'map') return mapHtml();

    var n = counts();
    var html = '<div class="chips" role="group" aria-label="กรองรายการ">' +
      filterChip('all', 'ทั้งหมด', n.total) + filterChip('todo', 'ยังไม่ติ๊ก', n.todo) + filterChip('done', 'ติ๊กแล้ว', n.done) +
      '</div>';
    if (state.day.carryoverCount > 0) {
      html += '<a class="banner warn" href="#/pending/' + state.date + '">' + icon('alert') + '<span>ค้างจากวันก่อน ' + state.day.carryoverCount + ' รายการ</span>' + icon('chevR') + '</a>';
    }
    var list = state.day.cases.filter(function (c) {
      return state.filter === 'all' || (state.filter === 'done' ? c.done : !c.done);
    });
    if (!state.day.cases.length) {
      html += emptyHtml(state.date === todayKey() ? 'วันนี้ยังไม่มีรายการรับแจ้ง' : 'วันนี้ไม่มีรายการรับแจ้ง',
        'รายการจะขึ้นเมื่อมีข้อความ “ได้รับแจ้ง”, เบอร์+สถานที่ หรือรูป+พิกัด ในกลุ่มมดงาน');
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

  function caseCardHtml(c) {
    return '<article class="case ' + (c.done ? 'is-done' : 'is-todo') + '" aria-label="รายการ #' + c.seq + '">' +
      '<div class="case-head"><span class="case-time mono">' + esc(c.time) + '</span><span class="case-seq">#' + c.seq + '</span>' + statusPill(c) + '</div>' +
      sourceBadges(c) +
      '<a class="case-body" href="#/case/' + encodeURIComponent(c.caseId) + '"><h3>' + esc(c.title) + '</h3>' +
      (c.detail ? '<p>' + esc(c.detail) + '</p>' : '') + '</a>' +
      dupLine(c) + thumbsHtml(c) + infoChips(c) +
      '<div class="reporter">แจ้งในกลุ่มโดย ' + esc(c.reporterName || 'ไม่ทราบชื่อ') + '</div>' +
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
    var withCoords = state.day.cases.filter(hasCoords);
    var noCoords = state.day.cases.length - withCoords.length;
    if (!state.day.cases.length) return emptyHtml('ไม่มีรายการให้แสดงบนแผนที่', '');
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
    state.day.cases.filter(hasCoords).forEach(function (c) {
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
      : tickButton(c, true) + hideButton(c);

    if (c.audit && c.audit.length) {
      html += '<h3 class="section-title">ประวัติการติ๊ก/ซ่อน</h3><ul class="card audit">' + c.audit.map(function (a) {
        return '<li><span>' + esc(AUDIT_LABELS[a.action] || a.action) + ' · ' + esc(a.name) + '</span><span class="when">' + shortDate(a.date) + ' ' + esc(a.time) + '</span></li>';
      }).join('') + '</ul>';
    }

    app.innerHTML = html + '</main>';
    hydratePhotos(app);
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
        return '<a class="result-row" href="#/case/' + encodeURIComponent(c.caseId) + '"><div class="mid"><b>' + esc(c.title) + '</b>' +
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
    return { done: c.done, doneBy: c.doneBy, doneAt: c.doneAt, hidden: c.hidden, hiddenBy: c.hiddenBy, hiddenAt: c.hiddenAt };
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
      if (!location.hash) history.replaceState(null, '', '#/day/' + state.date);
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
        deleteOn: addDays(date, RETENTION + 1), parts: null
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
      photoFileIds: ['demo-pole', 'demo-wire'], reporterName: 'หมู ม.5'
    });
    add(today, '09:15', {
      sources: ['keyword'], title: 'หนองแขยง วัดดอน ม 8 ไผ่กองดิน ไฟดับ', detail: 'ต้องนั่งเรือเข้า',
      phones: ['0810000002'], lat: 14.4188, lng: 100.1259, dupCount: 1, reporterName: 'พี่ต้อม',
      done: true, doneBy: 'ลุงชัย', doneAt: '11:40'
    });
    add(today, '10:32', {
      sources: ['photo_location', 'phone_place'], title: 'สาลีหมู่1ซอย 1 (ศาลา) มิเตอร์ใหม่',
      detail: 'ต่อตรงไว้นะครับ เค้าจะมีเรือมารับครับ', phones: ['0920000003'], lat: 14.3932, lng: 100.1517,
      photoFileIds: ['demo-meter'], reporterName: 'น้องแบงค์', done: true, doneBy: 'ช่างเอก', doneAt: '13:05'
    });
    add(today, '11:56', {
      sources: ['media_text'], title: 'มิเตอร์ไฟทางชำรุดข้างโรงเรียนวัดลาดหอย ดับมา 3 วันครับ',
      detail: 'ผู้ติดต่อ: คุณสมศรี ใจดี', phones: ['0810000010'], contactPart: true,
      photoFileIds: ['demo-pole', 'demo-wire', 'demo-meter'], reporterName: 'พี่ต้อม'
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
          done: done, doneBy: done ? NAMES[2] : '', doneAt: done ? '16:30' : ''
        });
      }
    });
    cases.sort(function (a, b) { return a.reportDate === b.reportDate ? a.seq - b.seq : (a.reportDate < b.reportDate ? -1 : 1); });

    function dto(c) { var o = Object.assign({}, c); delete o.parts; return o; }
    function find(id) { return cases.filter(function (c) { return c.caseId === id; })[0]; }
    function carry(before) {
      return cases.filter(function (c) { return !c.hidden && !c.done && c.reportDate < before; });
    }

    var handlers = {
      me: function () { return { name: 'ผู้ทดสอบ' }; },
      day: function (p) {
        var list = cases.filter(function (c) { return c.reportDate === p.date; });
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
        cases.forEach(function (c) {
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
        return Object.assign(dto(c), { parts: c.parts, audit: audit[c.caseId].slice() });
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
        return dto(c);
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
