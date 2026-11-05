window.__ModuleLoader__.load({
  id: '@local/personal-workbench',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // Ignore Enter/Escape/arrow keys fired by an active IME composition
    // (e.g. confirming pinyin candidates); keyCode 229 covers older browsers.
    function isComposing(e) {
      const nat = e.nativeEvent || e;
      return nat.isComposing === true || nat.keyCode === 229;
    }

    const PANEL_ID = 'personal-workbench';
    const STORE_KEY = 'personal-workbench:v1';
    const NS = '@local/personal-workbench';

    // The UI dictionary. It is registered with the Harness locale service so
    // the panel follows the application language, and mirrored into
    // locale/en.json and locale/zh.json as exported resources.
    const DICT = {
      en: {
        'panel.title': 'Personal Workbench',
        'panel.subtitle': 'The board and the links live in this browser',
        'tab.board': 'Task board',
        'tab.links': 'Office links',
        'col.todo': 'To do',
        'col.doing': 'In progress',
        'col.verify': 'To verify',
        'col.done': 'Done',
        'priority.urgent': 'Urgent',
        'priority.high': 'High',
        'priority.normal': 'Normal',
        'priority.low': 'Low',
        'task.newPlaceholder': 'New task…',
        'task.add': 'Add',
        'task.moveTo': 'Move to {column}',
        'modal.title': 'Task details',
        'modal.close': 'Close',
        'modal.name': 'Title',
        'modal.priority': 'Priority',
        'modal.status': 'Status',
        'modal.tags': 'Tags',
        'modal.description': 'Description',
        'modal.updatedAt': 'Updated at {time}',
        'modal.delete': 'Delete',
        'modal.cancel': 'Cancel',
        'modal.save': 'Save',
        'progress.title': 'Progress notes',
        'progress.placeholder': 'Note a progress update…',
        'progress.submit': 'Add',
        'progress.edit': 'Edit',
        'progress.delete': 'Delete',
        'progress.editedAt': '{time} (edited)',
        'tags.addPlaceholder': 'Add a tag…',
        'tags.inputPlaceholder': 'Type a tag, press Enter…',
        'tags.remove': 'Remove tag {tag}',
        'tags.exists': 'Existing',
        'tags.create': 'New tag',
        'links.addPlaceholder': 'Add a link (name or URL)',
        'links.add': 'Add',
        'links.edit': 'Edit',
        'links.remove': 'Remove',
        'links.editAria': 'Edit link',
        'links.removeAria': 'Remove link',
        'notice.duplicateAdd': 'This address is already in the list: {url}',
        'notice.duplicateEdit': 'Another link already uses this address: {url}',
        'notice.dismiss': 'Dismiss',
        'seed.task1': 'Tidy up the quarterly OKR',
        'seed.task2': 'Review the DSH plugin design',
        'seed.task3': 'Reply to the customer feedback email',
        'seed.task4': 'Submit the expense claim',
        'seed.tag1': 'Planning',
        'seed.tag2': 'Engineering',
        'seed.tag3': 'Daily',
        'seed.tag4': 'Admin',
        'seed.link1': 'WeCom',
        'seed.link2': 'KM knowledge platform',
        'seed.link3': 'KM Q&A',
        'seed.link4': 'Mailbox',
        'seed.link5': 'OA approvals',
        'seed.link6': 'TAPD projects',
      },
      zh: {
        'panel.title': '个人工作台',
        'panel.subtitle': '看板与导航保存在本机浏览器',
        'tab.board': '任务看板',
        'tab.links': '办公导航',
        'col.todo': '待办',
        'col.doing': '进行中',
        'col.verify': '待验证',
        'col.done': '已完成',
        'priority.urgent': '紧急',
        'priority.high': '高',
        'priority.normal': '普通',
        'priority.low': '低',
        'task.newPlaceholder': '新任务…',
        'task.add': '添加',
        'task.moveTo': '移到 {column}',
        'modal.title': '任务详情',
        'modal.close': '关闭',
        'modal.name': '标题',
        'modal.priority': '优先级',
        'modal.status': '状态',
        'modal.tags': '标签',
        'modal.description': '任务详情',
        'modal.updatedAt': '更新于 {time}',
        'modal.delete': '删除',
        'modal.cancel': '取消',
        'modal.save': '保存',
        'progress.title': '任务进展',
        'progress.placeholder': '记录一条进展…',
        'progress.submit': '提交',
        'progress.edit': '编辑',
        'progress.delete': '删除',
        'progress.editedAt': '{time} 修改过',
        'tags.addPlaceholder': '添加标签…',
        'tags.inputPlaceholder': '输入标签，回车确认…',
        'tags.remove': '删除标签 {tag}',
        'tags.exists': '已有标签',
        'tags.create': '新建标签',
        'links.addPlaceholder': '添加导航（名称或 URL）',
        'links.add': '添加',
        'links.edit': '编辑',
        'links.remove': '移除',
        'links.editAria': '编辑导航',
        'links.removeAria': '移除导航',
        'notice.duplicateAdd': '这个地址已经在列表里了：{url}',
        'notice.duplicateEdit': '这个地址已经被别的导航占用了：{url}',
        'notice.dismiss': '知道了',
        'seed.task1': '整理季度 OKR 进展',
        'seed.task2': '评审 DSH 插件方案',
        'seed.task3': '回复客户反馈邮件',
        'seed.task4': '报销单提交',
        'seed.tag1': '规划',
        'seed.tag2': '研发',
        'seed.tag3': '日常',
        'seed.tag4': '行政',
        'seed.link1': '企业微信',
        'seed.link2': 'KM 知识平台',
        'seed.link3': '乐问',
        'seed.link4': '邮箱',
        'seed.link5': 'OA 审批',
        'seed.link6': 'TAPD 项目',
      },
    };

    // The locale service is injected; these are the fallbacks used when the
    // service is unavailable or a namespace cannot be bound.
    let localeApi = null;
    let translate = (key, params) => {
      const table = DICT[lang()] || DICT.en;
      let text = table[key] !== undefined ? table[key] : (DICT.en[key] !== undefined ? DICT.en[key] : key);
      return params ? interpolate(text, params) : text;
    };

    function interpolate(text, params) {
      let out = String(text);
      for (const [name, value] of Object.entries(params || {})) {
        out = out.split('{' + name + '}').join(String(value));
      }
      return out;
    }

    /** The active application language, 'zh' or anything else treated as 'en'. */
    function lang() {
      try {
        const active = localeApi && localeApi.locale.getLocale().active;
        return typeof active === 'string' && active.toLowerCase().startsWith('zh') ? 'zh' : 'en';
      } catch (e) {
        return 'en';
      }
    }

    /** A locale-aware timestamp format. */
    function formatTime(ts) {
      const locale = lang() === 'zh' ? 'zh-CN' : 'en-US';
      try {
        return new Date(ts).toLocaleString(locale);
      } catch (e) {
        return new Date(ts).toISOString();
      }
    }

    const COLUMNS = [
      { id: 'todo', label: 'col.todo' },
      { id: 'doing', label: 'col.doing' },
      { id: 'verify', label: 'col.verify' },
      { id: 'done', label: 'col.done' },
    ];

    const PRIORITIES = [
      { id: 'urgent', label: 'priority.urgent', color: 'var(--dsw-alias-state-error-primary)' },
      { id: 'high', label: 'priority.high', color: 'var(--dsw-alias-state-warn-primary)' },
      { id: 'normal', label: 'priority.normal', color: 'var(--dsw-alias-brand-primary)' },
      { id: 'low', label: 'priority.low', color: 'var(--dsw-alias-state-idle-primary)' },
    ];
    const PRIORITY_OF = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[2];

    /** The seed content for a fresh profile, in the active language. */
    function defaultState() {
      const t = (key) => translate(key);
      const now = Date.now();
      return {
        tasks: [
          { id: 't1', title: t('seed.task1'), col: 'todo', tags: [t('seed.tag1')], priority: 'normal', desc: '', progressNotes: [], updatedAt: now },
          { id: 't2', title: t('seed.task2'), col: 'doing', tags: [t('seed.tag2')], priority: 'high', desc: '', progressNotes: [], updatedAt: now },
          { id: 't3', title: t('seed.task3'), col: 'doing', tags: [t('seed.tag3')], priority: 'normal', desc: '', progressNotes: [], updatedAt: now },
          { id: 't4', title: t('seed.task4'), col: 'done', tags: [t('seed.tag4')], priority: 'low', desc: '', progressNotes: [], updatedAt: now },
        ],
        links: [
          { name: t('seed.link1'), url: 'https://github.com' },
          { name: t('seed.link2'), url: 'https://developer.mozilla.org' },
          { name: t('seed.link3'), url: 'https://stackoverflow.com' },
          { name: t('seed.link4'), url: 'https://mail.google.com' },
          { name: t('seed.link5'), url: 'https://calendar.google.com' },
          { name: t('seed.link6'), url: 'https://www.notion.so' },
        ],
      };
    }

    function normalizeTask(t) {
      return {
        ...t,
        tags: Array.isArray(t.tags) ? t.tags : (t.tag ? [t.tag] : []),
        progressNotes: Array.isArray(t.progressNotes) ? t.progressNotes : [],
      };
    }

    const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 };
    function sortTasks(list) {
      return list.slice().sort((a, b) =>
        (PRIORITY_ORDER[PRIORITY_OF(a.priority).id] - PRIORITY_ORDER[PRIORITY_OF(b.priority).id])
        || ((b.updatedAt || 0) - (a.updatedAt || 0)));
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          return { ...s, tasks: (s.tasks || []).map(normalizeTask) };
        }
      } catch (e) { /* ignore */ }
      return defaultState();
    }

    function saveState(state) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    }

    /**
     * Split one input into tag names. A comma separates tags, so the
     * separator must not survive into a stored name, and an empty piece is
     * not a tag.
     */
    function parseTags(raw) {
      return String(raw ?? '')
        .split(',')
        .map((piece) => piece.trim())
        .filter((piece) => piece.length > 0);
    }

    const css = `
      .pwb-root { display: flex; flex-direction: column; height: 100%; min-height: 0;
        color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); }
      .pwb-header { display: flex; align-items: baseline; gap: 12px; padding: 20px 24px 12px; }
      .pwb-title { font-size: 18px; font-weight: 600; }
      .pwb-sub { font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .pwb-tabs { display: flex; gap: 4px; padding: 0 24px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .pwb-tab { appearance: none; border: none; background: transparent; cursor: pointer;
        padding: 8px 14px; font-size: 13px; color: var(--dsw-alias-label-secondary);
        border-bottom: 2px solid transparent; font-family: inherit; }
      .pwb-tab[data-active="true"] { color: var(--dsw-alias-label-primary); font-weight: 600;
        border-bottom-color: var(--dsw-alias-brand-primary); }
      .pwb-notice { display: flex; align-items: center; gap: 10px; margin: 0 24px 4px;
        padding: 8px 12px; font-size: 12px; border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2);
        color: var(--dsw-alias-label-primary); }
      .pwb-notice[data-tone="warn"] { border-color: var(--dsw-alias-state-warn-primary);
        color: var(--dsw-alias-state-warn-primary); }
      .pwb-notice-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
      .pwb-notice-close { appearance: none; border: none; background: transparent; cursor: pointer;
        color: inherit; font-size: 14px; line-height: 1; padding: 2px 4px; border-radius: 6px;
        font-family: inherit; }
      .pwb-notice-close:hover { background: var(--dsw-alias-bg-layer-2); }
      .pwb-body { flex: 1; min-height: 0; overflow: auto; padding: 20px 24px; }
      .pwb-root, .pwb-root *, .pwb-root *::before, .pwb-root *::after { box-sizing: border-box; }
      .pwb-board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
      .pwb-col { min-width: 0; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; min-height: 220px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
      .pwb-col-head { display: flex; align-items: center; justify-content: space-between;
        font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
      .pwb-count { font-size: 11px; background: var(--dsw-alias-bg-layer-2);
        border-radius: 999px; padding: 1px 8px; }
      .pwb-card { min-width: 0; overflow-wrap: anywhere; background: var(--dsw-alias-bg-layer-2);
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px; padding: 10px 12px; cursor: grab; text-align: left; width: 100%;
        font-family: inherit; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        transition: border-color 120ms ease, box-shadow 120ms ease; }
      .pwb-card:hover { border-color: var(--dsw-alias-brand-primary);
        box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
      .pwb-card-title { font-size: 13px; line-height: 1.4; }
      .pwb-card-foot { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
      .pwb-tag { font-size: 11px; color: var(--dsw-alias-label-secondary);
        background: var(--dsw-alias-bg-layer-1); border-radius: 4px; padding: 1px 6px; }
      .pwb-priority { display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
        color: var(--dsw-alias-label-secondary); }
      .pwb-priority-dot { width: 7px; height: 7px; border-radius: 50%; }
      .pwb-move { appearance: none; border: none; background: transparent; cursor: pointer;
        color: var(--dsw-alias-brand-primary); font-size: 12px; padding: 2px 4px; font-family: inherit;
        margin-left: auto; }
      .pwb-add { display: flex; gap: 8px; margin-top: 4px; }
      .pwb-input { flex: 1; width: 100%; box-sizing: border-box; background: var(--dsw-alias-bg-base);
        border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 6px 10px;
        font-size: 12px; color: var(--dsw-alias-label-primary); outline: none; font-family: inherit; }
      .pwb-input:focus { border-color: var(--dsw-alias-brand-primary); }
      .pwb-btn { appearance: none; border: 1px solid var(--dsw-alias-border-l2); cursor: pointer;
        background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);
        border-radius: 8px; padding: 6px 12px; font-size: 12px; font-family: inherit; }
      .pwb-btn-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base); }
      .pwb-btn-ghost { border-color: transparent; background: transparent;
        color: var(--dsw-alias-label-secondary); }
      .pwb-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
      .pwb-link { position: relative; display: flex; align-items: center; gap: 10px; text-decoration: none;
        background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 10px; padding: 14px 16px; color: var(--dsw-alias-label-primary);
        cursor: grab; transition: border-color 120ms ease, box-shadow 120ms ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
      .pwb-link:hover { border-color: var(--dsw-alias-brand-primary);
        box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
      .pwb-link[data-dragging="true"] { opacity: 0.5; }
      .pwb-link[data-over="true"] { border-color: var(--dsw-alias-brand-primary);
        box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary); }
      .pwb-link[data-drop="before"] { box-shadow: inset 0 3px 0 0 var(--dsw-alias-brand-primary),
        0 0 0 1px var(--dsw-alias-brand-primary); }
      .pwb-link[data-drop="after"] { box-shadow: inset 0 -3px 0 0 var(--dsw-alias-brand-primary),
        0 0 0 1px var(--dsw-alias-brand-primary); }
      .pwb-link.editing { cursor: default; }
      .pwb-link-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-brand-primary); }
      .pwb-link-name { font-size: 13px; font-weight: 500; }
      .pwb-link-url { font-size: 11px; color: var(--dsw-alias-label-secondary);
        max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pwb-icon-btn { appearance: none; border: none; background: transparent; cursor: pointer;
        color: var(--dsw-alias-label-secondary); padding: 4px; border-radius: 6px;
        display: inline-flex; align-items: center; }
      .pwb-icon-btn:hover { color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2); }
      .pwb-link-edit { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .pwb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 60;
        display: flex; align-items: center; justify-content: center; }
      .pwb-modal { width: min(560px, calc(100vw - 48px)); max-height: calc(100vh - 96px); overflow: auto;
        background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 14px; padding: 20px 22px; box-shadow: 0 16px 48px rgba(0,0,0,0.25); }
      .pwb-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
      .pwb-modal-title { font-size: 15px; font-weight: 600; }
      .pwb-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
      .pwb-field-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .pwb-row { display: flex; gap: 10px; }
      .pwb-row > .pwb-field { flex: 1; }
      .pwb-select { background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px; padding: 6px 10px; font-size: 12px; color: var(--dsw-alias-label-primary);
        outline: none; font-family: inherit; }
      .pwb-modal-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
      .pwb-time { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .pwb-tags-box { display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
        background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px; padding: 5px 8px; cursor: text; }
      .pwb-tags-box:focus-within { border-color: var(--dsw-alias-brand-primary); }
      .pwb-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
        background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px; padding: 2px 4px 2px 8px; color: var(--dsw-alias-label-primary); }
      .pwb-chip-x { appearance: none; border: none; background: transparent; cursor: pointer;
        color: var(--dsw-alias-label-secondary); padding: 0 3px; font-size: 12px; line-height: 1;
        border-radius: 999px; }
      .pwb-chip-x:hover { color: var(--dsw-alias-state-error-primary); }
      .pwb-tags-box input { flex: 1; min-width: 90px; border: none; outline: none; background: transparent;
        font-size: 12px; color: var(--dsw-alias-label-primary); font-family: inherit; padding: 2px 4px; }
      .pwb-suggest { position: relative; }
      .pwb-suggest-list { position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 5;
        background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); overflow: hidden; }
      .pwb-suggest-item { display: flex; align-items: center; justify-content: space-between;
        width: 100%; appearance: none; border: none; background: transparent; cursor: pointer;
        padding: 7px 12px; font-size: 12px; color: var(--dsw-alias-label-primary);
        text-align: left; font-family: inherit; }
      .pwb-suggest-item:hover, .pwb-suggest-item[data-active="true"] { background: var(--dsw-alias-bg-layer-2); }
      .pwb-suggest-create { color: var(--dsw-alias-brand-primary); }
      .pwb-note { background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px; padding: 9px 12px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      .pwb-note-text { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
      .pwb-note-foot { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
      .pwb-note-time { font-size: 11px; color: var(--dsw-alias-label-secondary); flex: 1; }
      .pwb-note-action { appearance: none; border: none; background: transparent; cursor: pointer;
        font-size: 11px; color: var(--dsw-alias-label-secondary); padding: 1px 4px; font-family: inherit; }
      .pwb-note-action:hover { color: var(--dsw-alias-brand-primary); }
      .pwb-note-edit { display: flex; flex-direction: column; gap: 8px; }
    `;

    function Icon() {
      return h('svg', { viewBox: '0 0 20 20', width: 18, height: 18, 'aria-hidden': true,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.4,
        strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: 2.5, y: 3, width: 15, height: 14, rx: 2.5 }),
        h('path', { d: 'M7.5 3v14M12.5 3v9' }));
    }

    function PencilIcon() {
      return h('svg', { viewBox: '0 0 20 20', width: 14, height: 14, 'aria-hidden': true,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.4,
        strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M13.8 3.2l3 3L7 16H4v-3l9.8-9.8z' }));
    }

    function TrashIcon() {
      return h('svg', { viewBox: '0 0 20 20', width: 14, height: 14, 'aria-hidden': true,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.4,
        strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10' }));
    }

    function CloseIcon() {
      return h('svg', { viewBox: '0 0 20 20', width: 16, height: 16, 'aria-hidden': true,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.4,
        strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M5 5l10 10M15 5L5 15' }));
    }

    function TagsField({ tags, allTags, onChange }) {
      const [text, setText] = React.useState('');
      const [active, setActive] = React.useState(0);
      const selected = new Set(tags);
      const candidates = allTags
        .filter((t) => !selected.has(t) && t.toLowerCase().includes(text.trim().toLowerCase()))
        .slice(0, 6);
      const exactNew = text.trim() && !selected.has(text.trim())
        && !allTags.some((t) => t.toLowerCase() === text.trim().toLowerCase());
      const options = candidates.map((t) => ({ tag: t, exists: true }));
      if (exactNew) options.push({ tag: text.trim(), exists: false });
      const showList = text.trim().length > 0 && options.length > 0;

      // A comma separates tag names, so "a,b," is two names and never keeps
      // the separator. Empty names are dropped.
      const add = (raw) => {
        const pieces = parseTags(raw);
        if (!pieces.length) return;
        const next = [...tags];
        for (const piece of pieces) {
          if (!next.includes(piece)) next.push(piece);
        }
        onChange(next);
        setText('');
        setActive(0);
      };
      const remove = (tag) => onChange(tags.filter((t) => t !== tag));

      return h('div', { className: 'pwb-suggest' },
        h('div', { className: 'pwb-tags-box', onClick: (e) => { if (e.target === e.currentTarget) e.currentTarget.querySelector('input').focus(); } },
          tags.map((t) => h('span', { className: 'pwb-chip', key: t }, t,
            h('button', { className: 'pwb-chip-x', 'aria-label': translate('tags.remove', { tag: t }),
              onClick: () => remove(t) }, '×'))),
          h('input', { value: text, placeholder: tags.length ? translate('tags.addPlaceholder') : translate('tags.inputPlaceholder'),
            onChange: (e) => { setText(e.target.value); setActive(0); },
            onKeyDown: (e) => {
              if (isComposing(e)) return;
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                if (showList && options[active]) add(options[active].tag);
                else if (text.trim()) add(text);
              } else if (e.key === 'Backspace' && !text && tags.length) {
                remove(tags[tags.length - 1]);
              } else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === 'Escape') { setText(''); }
            } })),
        showList && h('div', { className: 'pwb-suggest-list' },
          options.map((o, i) => h('button', { className: 'pwb-suggest-item', key: o.tag,
            'data-active': i === active,
            onMouseDown: (e) => { e.preventDefault(); add(o.tag); } },
            h('span', null, o.tag),
            h('span', { className: o.exists ? 'pwb-time' : 'pwb-suggest-create' },
              o.exists ? translate('tags.exists') : translate('tags.create'))))));
    }

    function ProgressNotes({ notes, onChange }) {
      const [text, setText] = React.useState('');
      const [editingId, setEditingId] = React.useState(null);
      const [editDraft, setEditDraft] = React.useState('');
      const submit = () => {
        const t = text.trim();
        if (!t) return;
        onChange([{ id: 'n' + Date.now(), text: t, createdAt: Date.now(), editedAt: null },
          ...notes].sort((a, b) => b.createdAt - a.createdAt));
        setText('');
      };
      const saveEdit = () => {
        const t = editDraft.trim();
        if (!t) { setEditingId(null); return; }
        onChange(notes.map((n) => (n.id === editingId ? { ...n, text: t, editedAt: Date.now() } : n)));
        setEditingId(null);
      };
      const sorted = notes.slice().sort((a, b) => b.createdAt - a.createdAt);
      return h('div', { className: 'pwb-field' },
        h('label', { className: 'pwb-field-label' }, translate('progress.title')),
        h('div', { className: 'pwb-add' },
          h('input', { className: 'pwb-input', placeholder: translate('progress.placeholder'),
            value: text, onChange: (e) => setText(e.target.value),
            onKeyDown: (e) => { if (!isComposing(e) && e.key === 'Enter') submit(); } }),
          h('button', { className: 'pwb-btn pwb-btn-primary', onClick: submit }, translate('progress.submit'))),
        sorted.length > 0 && h('div', { style: { marginTop: '10px' } },
          sorted.map((n) => editingId === n.id
            ? h('div', { className: 'pwb-note', key: n.id },
                h('div', { className: 'pwb-note-edit' },
                  h('textarea', { className: 'pwb-input pwb-textarea', autoFocus: true,
                    value: editDraft, onChange: (e) => setEditDraft(e.target.value),
                    onKeyDown: (e) => { if (isComposing(e)) return;
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit();
                      if (e.key === 'Escape') setEditingId(null); } }),
                  h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
                    h('button', { className: 'pwb-btn', onClick: () => setEditingId(null) }, translate('modal.cancel')),
                    h('button', { className: 'pwb-btn pwb-btn-primary', onClick: saveEdit }, translate('modal.save')))))
            : h('div', { className: 'pwb-note', key: n.id },
                h('div', { className: 'pwb-note-text' }, n.text),
                h('div', { className: 'pwb-note-foot' },
                  h('span', { className: 'pwb-note-time' },
                    formatTime(n.createdAt) + (n.editedAt ? ' · ' + translate('progress.editedAt', { time: formatTime(n.editedAt) }) : '')),
                  h('button', { className: 'pwb-note-action',
                    onClick: () => { setEditingId(n.id); setEditDraft(n.text); } }, translate('progress.edit')),
                  h('button', { className: 'pwb-note-action',
                    onClick: () => onChange(notes.filter((x) => x.id !== n.id)) }, translate('progress.delete')))))));
    }

    function TaskModal({ task, allTags, onSave, onClose, onDelete }) {
      const [draft, setDraft] = React.useState(() => normalizeTask(task));
      React.useEffect(() => {
        const onKey = (e) => { if (!isComposing(e) && e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [onClose]);
      const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
      return h('div', { className: 'pwb-overlay', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
        h('div', { className: 'pwb-modal', role: 'dialog', 'aria-modal': true },
          h('div', { className: 'pwb-modal-head' },
            h('span', { className: 'pwb-modal-title' }, translate('modal.title')),
            h('button', { className: 'pwb-icon-btn', onClick: onClose, 'aria-label': translate('modal.close') }, h(CloseIcon))),
          h('div', { className: 'pwb-field' },
            h('label', { className: 'pwb-field-label' }, translate('modal.name')),
            h('input', { className: 'pwb-input', value: draft.title,
              onChange: (e) => set({ title: e.target.value }) })),
          h('div', { className: 'pwb-row' },
            h('div', { className: 'pwb-field' },
              h('label', { className: 'pwb-field-label' }, translate('modal.priority')),
              h('select', { className: 'pwb-select', value: PRIORITY_OF(draft.priority).id,
                onChange: (e) => set({ priority: e.target.value }) },
                PRIORITIES.map((p) => h('option', { key: p.id, value: p.id }, translate(p.label))))),
            h('div', { className: 'pwb-field' },
              h('label', { className: 'pwb-field-label' }, translate('modal.status')),
              h('select', { className: 'pwb-select', value: draft.col,
                onChange: (e) => set({ col: e.target.value }) },
                COLUMNS.map((c) => h('option', { key: c.id, value: c.id }, translate(c.label)))))),
          h('div', { className: 'pwb-field' },
            h('label', { className: 'pwb-field-label' }, translate('modal.tags')),
            h(TagsField, { tags: draft.tags, allTags,
              onChange: (tags) => set({ tags }) })),
          h('div', { className: 'pwb-field' },
            h('label', { className: 'pwb-field-label' }, translate('modal.description')),
            h('textarea', { className: 'pwb-input pwb-textarea', value: draft.desc || '',
              onChange: (e) => set({ desc: e.target.value }) })),
          h(ProgressNotes, { notes: draft.progressNotes,
            onChange: (progressNotes) => set({ progressNotes }) }),
          h('div', { className: 'pwb-modal-foot' },
            h('span', { className: 'pwb-time' },
              translate('modal.updatedAt', { time: formatTime(task.updatedAt || Date.now()) })),
            h('span', { style: { display: 'flex', gap: '8px' } },
              h('button', { className: 'pwb-btn pwb-btn-ghost',
                onClick: () => { onDelete(task.id); onClose(); } }, translate('modal.delete')),
              h('button', { className: 'pwb-btn', onClick: onClose }, translate('modal.cancel')),
              h('button', { className: 'pwb-btn pwb-btn-primary',
                onClick: () => { onSave(draft); onClose(); } }, translate('modal.save'))))));
    }

    function Board({ tasks, onMove, onAdd, onOpen }) {
      const [draft, setDraft] = React.useState('');
      return h('div', { className: 'pwb-board' }, COLUMNS.map((col) => {
        const items = sortTasks(tasks.filter((t) => t.col === col.id));
        return h('div', { className: 'pwb-col', key: col.id,
          onDragOver: (e) => e.preventDefault(),
          onDrop: (e) => { e.preventDefault(); onMove(e.dataTransfer.getData('text/plain'), col.id); } },
          h('div', { className: 'pwb-col-head' },
            h('span', null, translate(col.label)),
            h('span', { className: 'pwb-count' }, String(items.length))),
          items.map((t) => h(Card, { key: t.id, task: t, onOpen, onMove })),
          col.id === 'todo' && h('div', { className: 'pwb-add' },
            h('input', { className: 'pwb-input', placeholder: translate('task.newPlaceholder'), value: draft,
              onChange: (e) => setDraft(e.target.value),
              onKeyDown: (e) => { if (isComposing(e)) return;
                if (e.key === 'Enter' && draft.trim()) { onAdd(draft.trim()); setDraft(''); } } }),
            h('button', { className: 'pwb-btn', onClick: () => { if (draft.trim()) { onAdd(draft.trim()); setDraft(''); } } }, translate('task.add'))),
        );
      }));
    }

    function Card({ task, onOpen, onMove }) {
      const idx = COLUMNS.findIndex((c) => c.id === task.col);
      const next = COLUMNS[(idx + 1) % COLUMNS.length];
      const pr = PRIORITY_OF(task.priority);
      return h('div', { className: 'pwb-card', draggable: true,
        onClick: () => onOpen(task.id),
        onDragStart: (e) => e.dataTransfer.setData('text/plain', task.id) },
        h('div', { className: 'pwb-card-title' }, task.title),
        h('div', { className: 'pwb-card-foot' },
          h('span', { className: 'pwb-priority' },
            h('span', { className: 'pwb-priority-dot', style: { background: pr.color } }), translate(pr.label)),
          task.tags.slice(0, 2).map((t) => h('span', { className: 'pwb-tag', key: t }, t)),
          task.tags.length > 2 ? h('span', { className: 'pwb-tag' }, '+' + (task.tags.length - 2)) : null,
          h('button', { className: 'pwb-move', title: translate('task.moveTo', { column: translate(next.label) }),
            onClick: (e) => { e.stopPropagation(); onMove(task.id, next.col); } }, '→')));
    }

    function LinkCard({ link, onSave, onRemove, onReorder, dragging, setDragging, over, setOver, dropPos, setDropPos, onDuplicate }) {
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState({ name: link.name, url: link.url });
      const commit = () => {
        const name = draft.name.trim() || link.name;
        let url = draft.url.trim() || link.url;
        if (!/^https?:\/\//.test(url)) url = 'https://' + url;
        // A rejected save keeps the editor open so the reason stays visible.
        const result = onSave({ prevUrl: link.url, name, url });
        if (result && result.ok === false) {
          if (onDuplicate) onDuplicate(result);
          return;
        }
        setEditing(false);
      };
      if (editing) {
        return h('div', { className: 'pwb-link editing' },
          h('div', { className: 'pwb-link-edit' },
            h('input', { className: 'pwb-input', value: draft.name, autoFocus: true,
              onChange: (e) => setDraft((d) => ({ ...d, name: e.target.value })),
              onKeyDown: (e) => { if (isComposing(e)) return;
                if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); } }),
            h('input', { className: 'pwb-input', value: draft.url,
              onChange: (e) => setDraft((d) => ({ ...d, url: e.target.value })),
              onKeyDown: (e) => { if (isComposing(e)) return;
                if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); } }),
            h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
              h('button', { className: 'pwb-btn', onClick: () => setEditing(false) }, translate('modal.cancel')),
              h('button', { className: 'pwb-btn pwb-btn-primary', onClick: commit }, translate('modal.save')))));
      }
      return h('div', { className: 'pwb-link', draggable: true,
        'data-dragging': dragging === true, 'data-over': over === true,
        'data-drop': over === true ? dropPos : undefined,
        onDragStart: (e) => {
          if (editing) { e.preventDefault(); return; }
          e.dataTransfer.setData('application/x-pwb-link', link.url);
          e.dataTransfer.effectAllowed = 'move';
          setDragging(true);
        },
        onDragEnd: () => { setDragging(false); setOver(null); setDropPos(null); },
        onDragOver: (e) => {
          if (editing) return;
          e.preventDefault();
          // Which half of the card the pointer is over decides whether the
          // card lands before or after it, so the gesture always means what
          // the drop indicator shows.
          let before = true;
          try {
            const rect = e.currentTarget.getBoundingClientRect();
            before = e.clientY < rect.top + rect.height / 2;
          } catch (err) { /* keep the default */ }
          const pos = before ? 'before' : 'after';
          if (over !== link.url || dropPos !== pos) { setOver(link.url); setDropPos(pos); }
        },
        onDragLeave: () => { if (over === link.url) setOver(null); },
        onDrop: (e) => {
          e.preventDefault();
          const from = e.dataTransfer.getData('application/x-pwb-link');
          const pos = dropPos || 'before';
          setOver(null);
          setDropPos(null);
          if (from && from !== link.url) onReorder(from, link.url, pos);
        } },
        h('span', { className: 'pwb-link-dot' }),
        h('a', { href: link.url, target: '_blank', rel: 'noreferrer', draggable: false,
          style: { color: 'inherit', textDecoration: 'none', flex: 1, minWidth: 0 } },
          h('div', { className: 'pwb-link-name' }, link.name),
          h('div', { className: 'pwb-link-url' }, link.url)),
        h('button', { className: 'pwb-icon-btn', title: translate('links.edit'), 'aria-label': translate('links.editAria'),
          onClick: () => { setDraft({ name: link.name, url: link.url }); setEditing(true); } }, h(PencilIcon)),
        h('button', { className: 'pwb-icon-btn', title: translate('links.remove'), 'aria-label': translate('links.removeAria'),
          onClick: () => onRemove(link.url) }, h(TrashIcon)));
    }

    function Links({ links, onAdd, onRemove, onSave, onReorder, onDuplicate }) {
      const [draft, setDraft] = React.useState('');
      const [dragging, setDragging] = React.useState(null);
      const [over, setOver] = React.useState(null);
      const [dropPos, setDropPos] = React.useState(null);
      const submit = () => {
        const text = draft.trim();
        if (!text) return;
        // A rejected add keeps the text so the user can correct it.
        const result = onAdd(text);
        if (result && result.ok === false) { onDuplicate(result); return; }
        setDraft('');
      };
      return h('div', null,
        h('div', { className: 'pwb-links' }, links.map((l) =>
          h(LinkCard, { key: l.url, link: l, onSave, onRemove, onReorder, onDuplicate,
            dragging: dragging === l.url, setDragging,
            over: over === l.url, setOver,
            dropPos, setDropPos }))),
        h('div', { className: 'pwb-add', style: { marginTop: '16px', maxWidth: '420px' } },
          h('input', { className: 'pwb-input', placeholder: translate('links.addPlaceholder'), value: draft,
            onChange: (e) => setDraft(e.target.value),
            onKeyDown: (e) => { if (isComposing(e)) return;
              if (e.key === 'Enter' && draft.trim()) submit(); } }),
          h('button', { className: 'pwb-btn', onClick: submit }, translate('links.add'))));
    }

    function Workbench() {
      const [tab, setTab] = React.useState('board');
      const [state, setState] = React.useState(loadState);
      const [openTaskId, setOpenTaskId] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const noticeTimer = React.useRef(null);

      // Re-render when the application language changes so every label
      // follows the Harness locale setting.
      const [, bump] = React.useReducer((n) => n + 1, 0);
      React.useEffect(() => {
        if (!localeApi || !localeApi.locale || typeof localeApi.locale.subscribe !== 'function') return undefined;
        return localeApi.locale.subscribe(() => bump(1));
      }, []);

      React.useEffect(() => () => {
        if (noticeTimer.current) clearTimeout(noticeTimer.current);
      }, []);

      const openTask = state.tasks.find((t) => t.id === openTaskId) || null;
      const allTags = Array.from(new Set(state.tasks.flatMap((t) => t.tags))).sort();

      const showNotice = (text, tone) => {
        setNotice({ text, tone: tone || 'warn' });
        if (noticeTimer.current) clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setNotice(null), 8000);
      };
      const onDuplicate = (result) => {
        const key = result.reason === 'edit' ? 'notice.duplicateEdit' : 'notice.duplicateAdd';
        showNotice(translate(key, { url: result.url }), 'warn');
      };

      const update = (fn) => setState((s) => { const n = fn(s); saveState(n); return n; });
      const onMove = (id, col) => update((s) => ({ ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, col, updatedAt: Date.now() } : t)) }));
      const onAdd = (title) => update((s) => ({ ...s,
        tasks: [...s.tasks, { id: 't' + Date.now(), title, col: 'todo', tags: [], priority: 'normal', desc: '', progressNotes: [], updatedAt: Date.now() }] }));
      const onSaveTask = (next) => update((s) => ({ ...s,
        tasks: s.tasks.map((t) => (t.id === next.id ? { ...t, ...next, updatedAt: Date.now() } : t)) }));
      const onDeleteTask = (id) => update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

      const onAddLink = (raw) => {
        let name = raw, url = raw;
        const m = raw.match(/^(.*?)\s*[|,，]\s*(https?:\/\/\S+)$/);
        if (m) { name = m[1]; url = m[2]; }
        else if (/^https?:\/\//.test(raw)) { try { name = new URL(raw).hostname; } catch (e) { /* keep */ } }
        else { url = 'https://' + raw; }
        if (state.links.some((l) => l.url === url)) {
          return { ok: false, reason: 'add', url };
        }
        update((s) => ({ ...s, links: [...s.links, { name, url }] }));
        return { ok: true };
      };
      const onRemoveLink = (url) => update((s) => ({ ...s, links: s.links.filter((l) => l.url !== url) }));
      const onSaveLink = (next) => {
        if (next.url !== next.prevUrl && state.links.some((l) => l.url === next.url)) {
          return { ok: false, reason: 'edit', url: next.url };
        }
        update((s) => ({ ...s, links: s.links.map((l) => (l.url === next.prevUrl ? { name: next.name, url: next.url } : l)) }));
        return { ok: true };
      };
      /**
       * Move one link before or after another. The drop position is the half
       * of the target card the pointer was over, so the same gesture always
       * means the same thing.
       */
      const onReorderLink = (fromUrl, toUrl, position) => update((s) => {
        const from = s.links.findIndex((l) => l.url === fromUrl);
        const to = s.links.findIndex((l) => l.url === toUrl);
        if (from < 0 || to < 0 || from === to) return s;
        const links = s.links.slice();
        const [moved] = links.splice(from, 1);
        // After the removal the target sits one slot earlier when it was
        // behind the moved link.
        const targetIndex = to > from ? to - 1 : to;
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        links.splice(insertIndex, 0, moved);
        return { ...s, links };
      });

      return h('div', { className: 'pwb-root' },
        h('style', null, css),
        h('div', { className: 'pwb-header' },
          h('span', { className: 'pwb-title' }, translate('panel.title')),
          h('span', { className: 'pwb-sub' }, translate('panel.subtitle'))),
        notice && h('div', { className: 'pwb-notice', 'data-tone': notice.tone, role: 'status' },
          h('span', { className: 'pwb-notice-text' }, notice.text),
          h('button', { className: 'pwb-notice-close', onClick: () => setNotice(null),
            'aria-label': translate('notice.dismiss') }, '×')),
        h('div', { className: 'pwb-tabs' },
          h('button', { className: 'pwb-tab', 'data-active': tab === 'board', onClick: () => setTab('board') }, translate('tab.board')),
          h('button', { className: 'pwb-tab', 'data-active': tab === 'links', onClick: () => setTab('links') }, translate('tab.links'))),
        h('div', { className: 'pwb-body' },
          tab === 'board'
            ? h(Board, { tasks: state.tasks, onMove, onAdd, onOpen: setOpenTaskId })
            : h(Links, { links: state.links, onAdd: onAddLink, onRemove: onRemoveLink,
                onSave: onSaveLink, onReorder: onReorderLink, onDuplicate })),
        openTask && h(TaskModal, { task: openTask, allTags,
          onSave: onSaveTask, onDelete: onDeleteTask, onClose: () => setOpenTaskId(null) }));
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        localeApi = ctx;
        // Register the dictionary with the locale service so the panel
        // follows the Harness language setting. The registration must happen
        // before `bind`, and `ctx.effect` defers its callback, so it is
        // registered directly and its disposer is owned by the fiber.
        try {
          const disposeLocale = ctx.locale.register(NS, DICT);
          if (typeof disposeLocale === 'function') {
            ctx.effect(() => disposeLocale, 'personal-workbench.locale()');
          }
        } catch (e) { /* the built-in dictionary stays in use */ }
        try {
          const bound = ctx.locale.bind(NS);
          if (typeof bound === 'function') translate = bound;
        } catch (e) { /* keep the built-in translator */ }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 10,
          label: () => { try { return translate('panel.title'); } catch (e) { return 'Personal Workbench'; } },
        }, Icon));
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PANEL_ID,
        }, Workbench));
      },
    };
  },
});
