window.__ModuleLoader__.load({
  id: '@local/super-agent-team',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = '@local/super-agent-team';
    const VIEW_ID = 'super-agent-team';

    // The Client context and the active translator are filled in by `apply`
    // and read by the registered component.
    const CONTEXT_REF = { current: null };
    let translate = null;

    const DICT = {
      en: {
        viewLabel: 'Team',
        title: 'SuperAgentTeam',
        subtitle: 'Router · Work Items · Hard gates · Watchdog',
        members: 'Roster',
        gates: 'Hard gates',
        packages: 'Work packages',
        completionAll: 'All items',
        completionAny: 'Any one item',
        completionManual: 'A human closes it',
        progress: '{done} of {total} done',
        closePackage: 'Close it',
        awaitingHuman: 'waiting for a human',
        workItems: 'Work board',
        ledger: 'Router ledger',
        completions: 'Recently completed',
        alerts: 'Watchdog alerts',
        intakeTitle: 'Dispatch work',
        intakePlaceholder: 'Describe the work for the Router…',
        dispatch: 'Dispatch',
        approve: 'Allow',
        reject: 'Deny',
        pending: 'Pending',
        inProgress: 'In progress',
        completed: 'Done',
        empty: 'Nothing here yet.',
        noTeam: 'No Team roster on this Session yet. Spawn a teammate to start the board.',
        channelUnavailable: 'The Host control channel is unavailable in this page; the board below is read-only.',
        channelError: 'The Host control channel failed.',
        owner: 'Owner',
        blocked: 'Blocked',
        none: 'unowned',
        stats: '{members} members · {running} running · {gates} open gates',
        gatePending: 'pending',
        gateApproved: 'approved',
        gateRejected: 'rejected',
        routingTo: '→ {target}',
        escalated: 'escalated to the Lead',
        refresh: 'Refresh',
        lastSync: 'Synced {time}',
      },
      zh: {
        viewLabel: '团队',
        title: 'SuperAgentTeam 超级智能体团队',
        subtitle: '调度 · 工单 · 硬闸 · 看门狗',
        members: '成员名册',
        gates: '人工硬闸',
        packages: '工作包',
        completionAll: '全票通过',
        completionAny: '任一完成',
        completionManual: '人工确认',
        progress: '{done}/{total} 已完成',
        closePackage: '人工确认并关闭',
        awaitingHuman: '等待人工确认',
        workItems: '工作看板',
        ledger: '调度流水',
        completions: '最近完成',
        alerts: '看门狗告警',
        intakeTitle: '派活',
        intakePlaceholder: '描述要交给调度器的工作…',
        dispatch: '派发',
        approve: '批准',
        reject: '否决',
        pending: '待处理',
        inProgress: '进行中',
        completed: '已完成',
        empty: '暂无内容。',
        noTeam: '本会话还没有团队名册。先创建一位队友即可开始派活。',
        channelUnavailable: '当前页面无法连接 Host 控制通道，下面的看板为只读。',
        channelError: 'Host 控制通道调用失败。',
        owner: '负责人',
        blocked: '被阻塞',
        none: '未认领',
        stats: '{members} 名成员 · {running} 名在跑 · {gates} 个待审批硬闸',
        gatePending: '待审批',
        gateApproved: '已批准',
        gateRejected: '已否决',
        routingTo: '→ {target}',
        escalated: '已升级给 Lead 判定',
        refresh: '刷新',
        lastSync: '同步于 {time}',
      },
    };

    const css = `
      .sat-root { display: flex; flex-direction: column; height: 100%; min-height: 0;
        color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base);
        font-size: 13px; }
      .sat-root, .sat-root *, .sat-root *::before, .sat-root *::after { box-sizing: border-box; }
      .sat-header { display: flex; align-items: center; gap: 12px; padding: 18px 22px 10px; }
      .sat-title { font-size: 16px; font-weight: 600; letter-spacing: .01em; }
      .sat-sub { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .sat-stats { margin-left: auto; font-size: 12px; color: var(--dsw-alias-label-secondary);
        font-variant-numeric: tabular-nums; }
      .sat-body { flex: 1; min-height: 0; overflow: auto; padding: 4px 22px 120px; }
      .sat-section { margin-top: 20px; }
      .sat-section-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
        font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
      .sat-count { font-size: 11px; color: var(--dsw-alias-label-secondary);
        background: var(--dsw-alias-bg-layer-2); border-radius: 999px; padding: 0 7px; }
      .sat-card { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px; padding: 12px 14px; }
      .sat-roster { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
      .sat-member { display: flex; align-items: flex-start; gap: 9px; min-width: 0;
        background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px; padding: 10px 12px; }
      .sat-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex: none;
        background: var(--dsw-alias-state-idle-primary); }
      .sat-dot[data-state="running"], .sat-dot[data-state="provisioning"] { background: var(--dsw-alias-brand-primary); }
      .sat-dot[data-state="failed"] { background: var(--dsw-alias-state-error-primary); }
      .sat-member-main { min-width: 0; flex: 1; }
      .sat-member-name { font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; }
      .sat-badge { font-size: 10px; font-weight: 500; color: var(--dsw-alias-label-secondary);
        background: var(--dsw-alias-bg-layer-2); border-radius: 4px; padding: 0 5px; }
      .sat-member-desc { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 3px;
        overflow-wrap: anywhere; }
      .sat-member-status { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 3px; }
      .sat-package { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; }
      .sat-package-head { display: flex; align-items: center; gap: 10px; }
      .sat-package-goal { font-size: 13px; font-weight: 600; flex: 1; min-width: 0; overflow-wrap: anywhere; }
      .sat-package-policy { font-size: 10px; color: var(--dsw-alias-label-secondary);
        background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px; padding: 1px 8px; white-space: nowrap; }
      .sat-package-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px;
        font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .sat-package-items { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
      .sat-package-item { display: flex; align-items: center; gap: 8px; font-size: 12px;
        padding: 5px 9px; border-radius: 7px; background: var(--dsw-alias-bg-layer-2);
        border: 1px solid var(--dsw-alias-border-l1); }
      .sat-package-item[data-status="completed"] { color: var(--dsw-alias-label-secondary); }
      .sat-package-item-dot { width: 7px; height: 7px; border-radius: 50%; flex: none;
        background: var(--dsw-alias-state-idle-primary); }
      .sat-package-item-dot[data-status="in_progress"] { background: var(--dsw-alias-brand-primary); }
      .sat-package-item-dot[data-status="completed"] { background: var(--dsw-alias-state-success-primary); }
      .sat-board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .sat-col { min-width: 0; background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 10px;
        display: flex; flex-direction: column; gap: 8px; }
      .sat-col-head { display: flex; align-items: center; justify-content: space-between;
        font-size: 11px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
      .sat-item { background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px; padding: 8px 10px; min-width: 0; }
      .sat-item-title { font-size: 12px; font-weight: 500; line-height: 1.45; overflow-wrap: anywhere; }
      .sat-item-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;
        font-size: 10px; color: var(--dsw-alias-label-secondary); }
      .sat-chip { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 4px; padding: 0 5px; }
      .sat-chip[data-tone="warn"] { color: var(--dsw-alias-state-warn-primary); }
      .sat-chip[data-tone="error"] { color: var(--dsw-alias-state-error-primary); }
      .sat-chip[data-tone="success"] { color: var(--dsw-alias-state-success-primary); }
      .sat-gate { display: flex; align-items: center; gap: 10px; background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 10px 12px; }
      .sat-gate-main { flex: 1; min-width: 0; }
      .sat-gate-title { font-size: 13px; font-weight: 500; overflow-wrap: anywhere; }
      .sat-gate-meta { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 3px; }
      .sat-btn { appearance: none; border: 1px solid var(--dsw-alias-border-l2); cursor: pointer;
        background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);
        border-radius: 8px; padding: 5px 12px; font-size: 12px; font-family: inherit; white-space: nowrap; }
      .sat-btn:hover { border-color: var(--dsw-alias-brand-primary); }
      .sat-btn:disabled { opacity: .5; cursor: default; }
      .sat-btn-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base); }
      .sat-btn-danger { color: var(--dsw-alias-state-error-primary); }
      .sat-intake { display: flex; gap: 8px; align-items: flex-start; }
      .sat-textarea { flex: 1; resize: vertical; min-height: 62px; background: var(--dsw-alias-bg-base);
        border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 8px 10px;
        font-size: 12px; color: var(--dsw-alias-label-primary); font-family: inherit; outline: none; }
      .sat-textarea:focus { border-color: var(--dsw-alias-brand-primary); }
      .sat-ledger { display: flex; flex-direction: column; gap: 6px; }
      .sat-route { display: flex; gap: 10px; align-items: baseline; font-size: 12px;
        background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px; padding: 7px 10px; }
      .sat-route-time { font-size: 11px; color: var(--dsw-alias-label-secondary);
        font-variant-numeric: tabular-nums; flex: none; }
      .sat-route-subject { flex: 1; min-width: 0; overflow-wrap: anywhere; }
      .sat-route-reason { font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .sat-notice { display: flex; align-items: flex-start; gap: 8px; font-size: 12px;
        border-radius: 8px; padding: 9px 11px; background: var(--dsw-alias-bg-layer-1);
        border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); }
      .sat-notice[data-tone="warn"] { border-color: var(--dsw-alias-state-warn-primary); }
      .sat-empty { font-size: 12px; color: var(--dsw-alias-label-secondary); padding: 6px 2px; }
      .sat-toolbar { display: flex; align-items: center; gap: 10px; }
      .sat-sync { font-size: 11px; color: var(--dsw-alias-label-secondary); }
    `;

    /** Pull the text payload out of whatever envelope the Remote returns. */
    function extractText(raw) {
      let node = raw;
      for (let i = 0; i < 8; i += 1) {
        if (node === null || node === undefined) return '';
        if (typeof node === 'string') return node;
        if (typeof node.text === 'string') return node.text;
        if (node.value && typeof node.value === 'object') { node = node.value; continue; }
        if (node.result && typeof node.result === 'object') { node = node.result; continue; }
        if (node.output && typeof node.output === 'object') { node = node.output; continue; }
        if (node.data && typeof node.data === 'object') { node = node.data; continue; }
        break;
      }
      return typeof raw === 'string' ? raw : '';
    }

    function Dot({ state }) {
      return h('span', { className: 'sat-dot', 'data-state': state });
    }

    function MemberCard({ member, t }) {
      return h('div', { className: 'sat-member' },
        h(Dot, { state: member.status }),
        h('div', { className: 'sat-member-main' },
          h('div', { className: 'sat-member-name' },
            member.name,
            member.role === 'lead' ? h('span', { className: 'sat-badge' }, 'lead') : null),
          member.description ? h('div', { className: 'sat-member-desc' }, member.description) : null,
          h('div', { className: 'sat-member-status' },
            member.status,
            member.model ? ' · ' + member.model : '')));
    }

    function WorkItem({ task, t }) {
      const meta = [];
      meta.push(h('span', { className: 'sat-chip' }, t('owner') + ': ' + (task.owner || t('none'))));      if (task.blockedBy && task.blockedBy.length) {
        meta.push(h('span', { className: 'sat-chip', 'data-tone': 'warn' },
          t('blocked') + ': ' + task.blockedBy.join(', ')));
      }
      if (task.gate) {
        meta.push(h('span', { className: 'sat-chip', 'data-tone': 'warn' }, 'gate:' + task.gate));
      }
      if (task.writeScopes && task.writeScopes.length) {
        meta.push(h('span', { className: 'sat-chip' }, task.writeScopes.join(', ')));
      }
      if (task.writeScopeWarnings && task.writeScopeWarnings.length) {
        task.writeScopeWarnings.forEach((warning, index) => {
          meta.push(h('span', { className: 'sat-chip', key: 'w' + index, 'data-tone': 'warn' }, warning));
        });
      }
      return h('div', { className: 'sat-item' },
        h('div', { className: 'sat-item-title' }, task.displaySubject || task.subject),
        meta.length ? h('div', { className: 'sat-item-meta' }, meta) : null);
    }

    const POLICY_LABEL = { all: 'completionAll', any: 'completionAny', manual: 'completionManual' };

    /** One Work Package: the goal, its policy, and the items it was split into. */
    function PackageCard({ pkg, tasks, t, busy, onClose }) {
      const children = (pkg.children || [])
        .map((id) => tasks.find((task) => task.id === id))
        .filter(Boolean);
      const awaiting = pkg.status === 'awaiting-human';
      return h('div', { className: 'sat-package' },
        h('div', { className: 'sat-package-head' },
          h('span', { className: 'sat-package-goal' }, pkg.goal),
          h('span', { className: 'sat-package-policy' }, t(POLICY_LABEL[pkg.completion] || 'completionAll')),
          pkg.status === 'completed'
            ? h('span', { className: 'sat-chip', 'data-tone': 'success' }, t('completed'))
            : null),
        h('div', { className: 'sat-package-meta' },
          h('span', null, t('progress', { done: pkg.done, total: pkg.total })),
          awaiting ? h('span', { className: 'sat-chip', 'data-tone': 'warn' }, t('awaitingHuman')) : null),
        children.length
          ? h('div', { className: 'sat-package-items' }, children.map((child) => h('div', {
              className: 'sat-package-item', key: child.id, 'data-status': child.status,
            },
            h('span', { className: 'sat-package-item-dot', 'data-status': child.status }),
            h('span', { style: { flex: '1', minWidth: '0', overflowWrap: 'anywhere' } }, child.displaySubject || child.subject),
            h('span', { className: 'sat-chip' }, child.owner || t('none')))))
          : null,
        awaiting
          ? h('div', { style: { marginTop: '10px' } },
              h('button', { type: 'button', className: 'sat-btn sat-btn-primary', disabled: busy,
                onClick: () => onClose(pkg.id) }, t('closePackage')))
          : null);
    }

    function Board({ tasks, t }) {
      const columns = [
        { id: 'pending', label: t('pending'), status: 'pending' },
        { id: 'in_progress', label: t('inProgress'), status: 'in_progress' },
        { id: 'completed', label: t('completed'), status: 'completed' },
      ];
      return h('div', { className: 'sat-board' }, columns.map((column) => {
        const items = tasks.filter((task) => task.status === column.status);
        return h('div', { className: 'sat-col', key: column.id },
          h('div', { className: 'sat-col-head' },
            h('span', null, column.label),
            h('span', { className: 'sat-count' }, String(items.length))),
          items.length
            ? items.map((task) => h(WorkItem, { key: task.id, task, t }))
            : h('div', { className: 'sat-empty' }, t('empty')));
      }));
    }

    function GateRow({ gate, onDecide, busy, t }) {
      const tone = gate.status === 'approved' ? 'success' : gate.status === 'rejected' ? 'error' : 'warn';
      return h('div', { className: 'sat-gate' },
        h('div', { className: 'sat-gate-main' },
          h('div', { className: 'sat-gate-title' }, gate.subject),
          h('div', { className: 'sat-gate-meta' },
            'gate:' + gate.kind + ' · ',
            h('span', { className: 'sat-chip', 'data-tone': tone }, t('gate' + gate.status.charAt(0).toUpperCase() + gate.status.slice(1))))),
        gate.status === 'pending'
          ? h('span', null,
              h('button', { type: 'button', className: 'sat-btn sat-btn-primary', disabled: busy,
                onClick: () => onDecide(gate.id, 'approve') }, t('approve')),
              ' ',
              h('button', { type: 'button', className: 'sat-btn sat-btn-danger', disabled: busy,
                onClick: () => onDecide(gate.id, 'reject') }, t('reject')))
          : null);
    }

    function RouteRow({ route, t }) {
      const time = new Date(route.time).toLocaleTimeString();
      const target = route.stage === 'escalated'
        ? t('escalated')
        : (route.target ? t('routingTo', { target: route.target }) : route.target || '');
      return h('div', { className: 'sat-route' },
        h('span', { className: 'sat-route-time' }, time),
        h('span', { className: 'sat-route-subject' }, route.subject),
        h('span', { className: 'sat-route-reason' }, target),
        route.reason ? h('span', { className: 'sat-route-reason' }, '· ' + route.reason) : null);
    }

    /** How often the panel asks the Host for a snapshot while work is moving. */
    const POLL_FAST_MS = 8000;
    /** How often it asks when the board is quiet and nothing is unsettled. */
    const POLL_SLOW_MS = 30000;

    /**
     * A stable fingerprint of the board's live parts.
     *
     * The roster and the task list arrive through the Session projection, so
     * their fingerprint says whether the board moved since the last poll —
     * without asking the Host at all.
     */
    function boardSignature(team) {
      if (!team) return '';
      const members = (team.members || [])
        .map((member) => `${member.id}:${member.status || member.phase || ''}`)
        .sort()
        .join(',');
      const tasks = (team.tasks || [])
        .map((task) => `${task.id}:${task.revision}:${task.status}`)
        .sort()
        .join(',');
      return `${members}|${tasks}`;
    }

    /**
     * Whether the Host still owes the panel something: a gate waiting for a
     * human, a package nobody closed, or a member still working. While any
     * of those hold, the poll stays on the fast cadence.
     */
    function hasUnsettledWork(state) {
      if (!state) return true;
      const gates = Array.isArray(state.gates) ? state.gates : [];
      const packages = Array.isArray(state.packages) ? state.packages : [];
      const members = Array.isArray(state.members) ? state.members : [];
      if (gates.some((gate) => gate.status === 'pending')) return true;
      if (packages.some((pkg) => pkg.status !== 'completed')) return true;
      if (members.some((member) => member.status === 'running')) return true;
      return false;
    }

    /** One recently completed Work Item: when, what, and who finished it. */
    function CompletionRow({ completion, task, t }) {
      const subject = (task && (task.displaySubject || task.subject)) || completion.subject || '';
      const time = completion.at ? new Date(completion.at).toLocaleTimeString() : '';
      return h('div', { className: 'sat-route' },
        h('span', { className: 'sat-route-time' }, time),
        h('span', { className: 'sat-route-subject' }, subject),
        h('span', { className: 'sat-chip' }, completion.owner || t('none')));
    }

    /**
     * The Host control surface of one Team, read through the `super-team`
     * command. The board itself comes from the shared Session projection, so
     * it stays live even when this channel is unavailable.
     */
    function useHostState(ctx, sessionId, enabled, signature) {
      const [state, setState] = React.useState(null);
      const [error, setError] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [syncedAt, setSyncedAt] = React.useState(null);

      const commands = React.useMemo(() => {
        // The Harness client services are a nested namespace: injecting
        // `remote` yields that namespace, and reading a leaf of it resolves
        // the leaf path `remote.commands`, which must be declared too.
        const namespace = ctx.remote;
        const found = namespace && namespace.commands;
        return found && typeof found.execute === 'function' ? found : null;
      }, [ctx]);

      const run = React.useCallback(async (line) => {
        if (!commands || !sessionId) return null;
        const controller = new AbortController();
        try {
          const raw = await commands.execute(sessionId, line, [], controller.signal);
          const text = extractText(raw);
          setError(null);
          return text;
        } catch (reason) {
          console.error('[super-agent-team] command failed for', line, reason);
          setError(reason instanceof Error ? reason.message : String(reason));
          return null;
        }
      }, [commands, sessionId]);

      const reload = React.useCallback(async () => {
        const text = await run('/super-team state');
        if (text === null) return;
        try {
          setState(JSON.parse(text));
          setSyncedAt(Date.now());
        } catch {
          setError(`The Host returned an unreadable board snapshot: ${String(text).slice(0, 200)}`);
        }
      }, [run]);

      // The board's live parts come through the Session projection, so the
      // poll only has to run when that projection moved, or when the Host
      // still owes us something. When neither holds, it backs off.
      const stateRef = React.useRef(null);
      const signatureRef = React.useRef('');
      const polledSignatureRef = React.useRef('');
      React.useEffect(() => { stateRef.current = state; }, [state]);
      React.useEffect(() => { signatureRef.current = signature; }, [signature]);

      React.useEffect(() => {
        if (!enabled) return undefined;
        let timer = null;
        let stopped = false;

        const tick = async () => {
          if (stopped) return;
          await reload();
          if (stopped) return;
          const changed = polledSignatureRef.current !== signatureRef.current;
          polledSignatureRef.current = signatureRef.current;
          const unsettled = hasUnsettledWork(stateRef.current);
          timer = setTimeout(tick, changed || unsettled ? POLL_FAST_MS : POLL_SLOW_MS);
        };

        // The panel must show the Host snapshot as soon as it opens, and a
        // session switch must pull it again straight away. A board that moved
        // restarts the cycle on the fast cadence too, so a change is never
        // left waiting out a backoff.
        polledSignatureRef.current = signatureRef.current;
        reload();
        timer = setTimeout(tick, POLL_FAST_MS);
        return () => {
          stopped = true;
          if (timer !== null) clearTimeout(timer);
        };
      }, [enabled, sessionId, signature, reload]);

      const decide = React.useCallback(async (taskId, decision) => {
        setBusy(true);
        await run('/super-team ' + decision + ' ' + taskId);
        setBusy(false);
        await reload();
      }, [run, reload]);

      const closePackage = React.useCallback(async (packageId) => {
        setBusy(true);
        await run('/super-team complete ' + packageId);
        setBusy(false);
        await reload();
      }, [run, reload]);

      const dispatch = React.useCallback(async (text) => {
        setBusy(true);
        await run('/super-team intake ' + text);
        setBusy(false);
        await reload();
      }, [run, reload]);

      return { state, error, busy, syncedAt, reload, decide, dispatch, closePackage, connected: Boolean(commands) };
    }

    /**
     * Roster rows for the panel.
     *
     * The Host snapshot carries the authoritative roster — live status,
     * description, model. The Session projection is the fallback when the
     * Host channel is unavailable, and it uses a different vocabulary:
     * `phase` instead of `status`, and no description or model at all.
     */
    function mapMembers(remoteState, team) {
      if (remoteState && remoteState.members) return remoteState.members;
      if (!team || !team.members) return [];
      return team.members.map((member) => ({
        name: member.name,
        role: member.role,
        status: member.phase === 'failed' ? 'failed'
          : member.phase === 'provisioning' ? 'provisioning' : 'idle',
        description: '',
        model: '',
        diagnostics: member.error ? [member.error] : [],
      }));
    }

    /** Work Items for the panel, with the same source precedence. */
    function mapTasks(remoteState, team) {
      if (remoteState && remoteState.tasks) return remoteState.tasks;
      if (!team || !team.tasks) return [];
      return team.tasks.map((task) => ({
        id: task.id,
        revision: task.revision,
        subject: task.subject,
        description: task.description,
        status: task.status,
        owner: task.ownerName || null,
        blockedBy: task.blockedBy || [],
        ready: task.ready,
        writeScopes: task.writeScopes || [],
        writeScopeWarnings: task.writeScopeWarnings || [],
        gate: null,
      }));
    }

    function TeamView({ sessionId, useSession, useSessions }) {
      const t = translate || makeTranslator();
      const [draft, setDraft] = React.useState('');

      const leadSessionId = useSession((snapshot) => snapshot.subagent && snapshot.subagent.address
        ? snapshot.subagent.address.parentSessionId
        : undefined) || sessionId;

      const team = useSessions((state) => state.projectionsBySession[leadSessionId]
        ? state.projectionsBySession[leadSessionId].values.agentTeam
        : undefined);

      // The projection is the live signal: its fingerprint says whether the
      // board moved, so the panel does not have to poll the Host to find out.
      const signature = React.useMemo(() => boardSignature(team), [team]);

      const host = useHostState(CONTEXT_REF.current, leadSessionId, true, signature);
      const remoteState = host.state;

      const members = mapMembers(remoteState, team);
      const tasks = mapTasks(remoteState, team);
      const gates = remoteState && remoteState.gates ? remoteState.gates : [];
      const packages = remoteState && remoteState.packages ? remoteState.packages : [];

      // A package and its items are shown in the package section, so the
      // board below carries only the work that stands on its own.
      const packaged = new Set(packages.flatMap((pkg) => pkg.children || []));
      const standalone = tasks.filter((task) => !task.isPackage && !packaged.has(task.id));
      const routes = remoteState && remoteState.routes ? remoteState.routes : [];
      const alerts = remoteState && remoteState.alerts ? remoteState.alerts : [];
      // `completions` is newer than some Hosts: when it is missing the
      // section is simply not rendered, and when it is empty it shows the
      // empty state.
      const completions = remoteState && Array.isArray(remoteState.completions)
        ? remoteState.completions
        : null;

      const running = members.filter((member) => member.status === 'running').length;
      const openGates = gates.filter((gate) => gate.status === 'pending').length;

      const submit = () => {
        const text = draft.trim();
        if (!text) return;
        setDraft('');
        host.dispatch(text);
      };

      return h('div', { className: 'sat-root' },
        h('style', null, css),
        h('div', { className: 'sat-header' },
          h('div', null,
            h('div', { className: 'sat-title' }, t('title')),
            h('div', { className: 'sat-sub' }, t('subtitle'))),
          h('div', { className: 'sat-stats' },
            t('stats', { members: members.length, running, gates: openGates }))),
        h('div', { className: 'sat-body' },
          host.error
            ? h('div', { className: 'sat-notice', 'data-tone': 'warn' }, host.error)
            : (host.connected ? null : h('div', { className: 'sat-notice', 'data-tone': 'warn' }, t('channelUnavailable'))),

          h('section', { className: 'sat-section' },
            h('div', { className: 'sat-section-head' }, t('intakeTitle')),
            h('div', { className: 'sat-intake' },
              h('textarea', { className: 'sat-textarea', value: draft, placeholder: t('intakePlaceholder'),
                onChange: (event) => setDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); submit(); }
                } }),
              h('button', { type: 'button', className: 'sat-btn sat-btn-primary', disabled: host.busy || !host.connected,
                onClick: submit }, t('dispatch')))),

          h('section', { className: 'sat-section' },
            h('div', { className: 'sat-section-head' },
              t('members'),
              members.length ? h('span', { className: 'sat-count' }, String(members.length)) : null),
            members.length
              ? h('div', { className: 'sat-roster' }, members.map((member) => h(MemberCard, { key: member.name, member, t })))
              : h('div', { className: 'sat-empty' }, t('noTeam'))),

          gates.length
            ? h('section', { className: 'sat-section' },
                h('div', { className: 'sat-section-head' },
                  t('gates'),
                  h('span', { className: 'sat-count' }, String(gates.length))),
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                  gates.map((gate) => h(GateRow, { key: gate.id, gate, busy: host.busy, onDecide: host.decide, t }))))
            : null,

          packages.length
            ? h('section', { className: 'sat-section' },
                h('div', { className: 'sat-section-head' },
                  t('packages'),
                  h('span', { className: 'sat-count' }, String(packages.length))),
                packages.map((pkg) => h(PackageCard, { key: pkg.id, pkg, tasks, t,
                  busy: host.busy, onClose: host.closePackage })))
            : null,

          h('section', { className: 'sat-section' },
            h('div', { className: 'sat-section-head' }, t('workItems')),
            standalone.length
              ? h(Board, { tasks: standalone, t })
              : h('div', { className: 'sat-empty' }, t('empty'))),

          alerts.length
            ? h('section', { className: 'sat-section' },
                h('div', { className: 'sat-section-head' }, t('alerts')),
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                  alerts.map((alert, index) => h('div', { className: 'sat-notice', key: index },
                    alert.kind + ' · ' + (alert.member || alert.owner || alert.taskId || '') + ' · ' + (alert.detail || '')))))
            : null,

          routes.length
            ? h('section', { className: 'sat-section' },
                h('div', { className: 'sat-section-head' },
                  t('ledger'),
                  h('span', { className: 'sat-count' }, String(routes.length))),
                h('div', { className: 'sat-ledger' }, routes.map((route, index) => h(RouteRow, { key: index, route, t }))))
            : null,

          completions
            ? h('section', { className: 'sat-section' },
                h('div', { className: 'sat-section-head' },
                  t('completions'),
                  completions.length ? h('span', { className: 'sat-count' }, String(completions.length)) : null),
                completions.length
                  ? h('div', { className: 'sat-ledger' },
                      completions.slice(0, 20).map((completion, index) => h(CompletionRow, {
                        key: completion.taskId || index,
                        completion,
                        task: tasks.find((task) => task.id === completion.taskId),
                        t,
                      })))
                  : h('div', { className: 'sat-empty' }, t('empty')))
            : null,

          h('section', { className: 'sat-section' },
            h('div', { className: 'sat-toolbar' },
              h('button', { type: 'button', className: 'sat-btn', onClick: host.reload }, t('refresh')),
              host.syncedAt
                ? h('span', { className: 'sat-sync' }, t('lastSync', { time: new Date(host.syncedAt).toLocaleTimeString() }))
                : null))));
    }

    /** Locale bridge: prefer the registered dictionary, fall back to English. */
    function makeTranslator() {
      let dictionary = DICT.en;
      const translate = (key, params) => {
        let text = dictionary[key] !== undefined ? dictionary[key] : (DICT.en[key] !== undefined ? DICT.en[key] : key);
        if (params) {
          for (const [name, value] of Object.entries(params)) {
            text = text.split('{' + name + '}').join(String(value));
          }
        }
        return text;
      };
      translate.setLocale = (locale) => { dictionary = DICT[locale] || DICT.en; };
      return translate;
    }

    // The Client context is provided by the slot owner, not by a global.

    return {
      inject: ['slots', 'locale', 'remote', 'remote.commands'],
      apply(ctx) {
        CONTEXT_REF.current = ctx;

        // Register the dictionary, then prefer the framework's bound
        // translator so the panel follows the active locale.
        try {
          ctx.effect(() => ctx.locale.register(NS, { en: DICT.en, zh: DICT.zh }), 'super-agent-team.locale()');
        } catch {
          try { ctx.effect(() => ctx.locale.register(NS, 'en', DICT.en), 'super-agent-team.localeEn()'); } catch { /* no dictionary */ }
        }
        try {
          const bound = ctx.locale.bind(NS);
          if (typeof bound === 'function') translate = bound;
        } catch { /* keep the built-in dictionary */ }

        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: VIEW_ID,
          order: 20,
          label: () => (translate ? translate('viewLabel') : 'Team'),
        }, TeamView));
      },
    };
  },
});
