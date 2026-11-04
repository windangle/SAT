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
        company: 'Agent Company',
        companyTitle: 'Agent Company',
        chairmanDesk: "Chairman's desk",
        ceaLabel: 'CEA · Chief Executive Agent',
        ceaNote: 'The Chairman talks only to the CEA. The CEA confirms requirements, designs positions, dispatches to positions, reviews the final output, and submits it for the Chairman\'s acceptance. Final delivery is complete only after the Chairman approves it.',
        decisions: 'Awaiting your decision',
        requirement: 'Requirement',
        position: 'Position / JD',
        deliverable: 'Delivery acceptance',
        approve: 'Approve',
        reject: 'Reject',
        orgChart: 'Organisation',
        positions: 'Positions',
        pms: 'PM & project portfolio',
        leader: 'Leader',
        capabilities: 'capability entries',
        headcount: 'headcount',
        load: 'load',
        active: 'active',
        proposed: 'proposed',
        events: 'Company activity',
        project: 'Project',
        projectView: 'Project view',
        projects: 'Projects',
        noProjects: 'No project bound to this workspace yet.',
        status: 'Status',
        goal: 'Goal',
        deliverableLabel: 'Deliverable',
        ceaReview: 'CEA review',
        chairmanDecision: 'Chairman decision',
        accepted: 'accepted',
        pendingAcceptance: 'pending acceptance',
        briefPlaceholder: 'Give the CEA a task (strategic or very specific)…',
        brief: 'Brief the CEA',
        briefHint: 'The CEA restates its understanding and waits for your confirmation before dispatching.',
        noCompanyChannel: 'Open any conversation to load the company state.',
        refresh: 'Refresh',
        ceaRole: 'CEA · Role card',
        identity: 'Identity',
        mission: 'Mission',
        capabilities: 'Capabilities',
        requirements: 'Requirements',
        habits: 'Work habits',
        authority: 'Delegated authority',
        forbidden: 'Never do',
        acceptance: 'Acceptance',
        departments: 'Departments',
        planned: 'planned / to hire',
        routing: 'Project / task routing',
        routingProject: 'Project = workspace',
        routingTask: 'Task = session',
        existingTarget: 'existing',
        newTarget: 'new',
        routeHint: 'Change routing: /company route <decision> | <workspace or 新:name> | <session or 新:title>',
        inventory: 'Workspace / session inventory',
        provision: 'Pending provisioning',
        myProjects: 'My projects',
        myDecisions: 'Needs your decision',
        allProjects: 'All',
        runningProjects: 'Running',
        acceptingProjects: 'Awaiting acceptance',
        acceptedProjects: 'Accepted',
        noDecisions: 'Nothing needs your decision right now.',
        projectTasks: 'Work items',
        projectPositions: 'Positions',
        hqLabel: 'CEA HQ',
        hqUnbound: 'HQ not bound — the current session acts as CEA',
        hqBind: 'Set this session as CEA HQ',
        charter: 'Governance charter (settled)',
        orgSecondary: 'Organisation, workload & activity (secondary)',
        showLess: 'Collapse',
        showMore: 'Expand',
        knowledgeExport: 'Export knowledge',
        exported: 'Exported',
        decided: 'Decided',
        projectProgress: 'Progress',
        awaitingAcceptance: 'Awaiting your acceptance',
        needsRoute: 'Needs project/task routing',
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
        ceaRole: 'CEA · Role card',
        identity: 'Identity',
        mission: 'Mission',
        capabilities: 'Capabilities',
        requirements: 'Requirements',
        habits: 'Work habits',
        authority: 'Delegated authority',
        forbidden: 'Never do',
        acceptance: 'Acceptance',
        departments: 'Departments',
        planned: 'planned / to hire',
        routing: 'Project / task routing',
        routingProject: 'Project = workspace',
        routingTask: 'Task = session',
        existingTarget: 'existing',
        newTarget: 'new',
        routeHint: 'Change routing: /company route <decision> | <workspace or 新:name> | <session or 新:title>',
        inventory: 'Workspace / session inventory',
        provision: 'Pending provisioning',
        myProjects: 'My projects',
        myDecisions: 'Needs your decision',
        allProjects: 'All',
        runningProjects: 'Running',
        acceptingProjects: 'Awaiting acceptance',
        acceptedProjects: 'Accepted',
        noDecisions: 'Nothing needs your decision right now.',
        projectTasks: 'Work items',
        projectPositions: 'Positions',
        hqLabel: 'CEA HQ',
        hqUnbound: 'HQ not bound — the current session acts as CEA',
        hqBind: 'Set this session as CEA HQ',
        charter: 'Governance charter (settled)',
        orgSecondary: 'Organisation, workload & activity (secondary)',
        showLess: 'Collapse',
        showMore: 'Expand',
        knowledgeExport: 'Export knowledge',
        exported: 'Exported',
        decided: 'Decided',
        projectProgress: 'Progress',
        awaitingAcceptance: 'Awaiting your acceptance',
        needsRoute: 'Needs project/task routing',
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
        company: 'Agent公司',
        companyTitle: 'Agent公司',
        chairmanDesk: '董事长待办',
        ceaLabel: 'CEA · 首席执行 Agent',
        ceaNote: '董事长只与 CEA 对接。CEA 理解并确认需求、设计岗位、按任务派到岗位、对最终产出审核负责，再交付董事长验收；成果必须董事长审核通过才算完成。',
        decisions: '待你拍板',
        requirement: '需求确认',
        position: '岗位 / JD',
        deliverable: '成果验收',
        approve: '批准',
        reject: '驳回',
        orgChart: '组织架构',
        positions: '岗位',
        pms: 'PM 与项目组合',
        leader: 'Leader',
        capabilities: '条能力',
        headcount: '在岗',
        load: '负载',
        active: '在编',
        proposed: '待批',
        events: '公司动态',
        project: '项目',
        projectView: '项目视图',
        projects: '项目',
        noProjects: '本工作区还没有项目。',
        status: '状态',
        goal: '目标',
        deliverableLabel: '成果',
        ceaReview: 'CEA 终审',
        chairmanDecision: '董事长验收',
        accepted: '已验收',
        pendingAcceptance: '待验收',
        briefPlaceholder: '给 CEA 派一个任务（大方向或很具体都行）…',
        brief: '给 CEA 派任务',
        briefHint: 'CEA 会先复述理解并等你确认，确认后才派工。',
        noCompanyChannel: '打开任意会话后即可看到公司状态。',
        refresh: '刷新',
        ceaRole: 'CEA · 岗位说明书',
        identity: '身份',
        mission: '使命',
        capabilities: '能力',
        requirements: '要求',
        habits: '工作习惯',
        authority: '代拍板权',
        forbidden: '不可为',
        acceptance: '验收标准',
        departments: '部门',
        planned: '待招（虚框）',
        routing: '项目 / 任务定位',
        routingProject: '项目 = 工作区',
        routingTask: '任务 = 会话',
        existingTarget: '存量',
        newTarget: '新建',
        routeHint: '改选：/company route <决策> | <工作区或 新:名称> | <会话或 新:标题>',
        inventory: '工作区 / 会话台账',
        provision: '待补建',
        myProjects: '我的项目',
        myDecisions: '需要我决策',
        allProjects: '全部',
        runningProjects: '进行中',
        acceptingProjects: '待验收',
        acceptedProjects: '已验收',
        noDecisions: '当前没有需要你决策的事情。',
        projectTasks: '工单',
        projectPositions: '参与岗位',
        hqLabel: 'CEA 总部',
        hqUnbound: '尚未绑定总部会话，当前会话代行 CEA',
        hqBind: '把当前会话设为董事长办公室',
        charter: '治理章程（已拍板）',
        orgSecondary: '组织结构 · 工作负载 · 公司动态（次要）',
        showLess: '收起',
        showMore: '展开',
        knowledgeExport: '导出知识',
        exported: '已导出',
        decided: '已拍板',
        projectProgress: '进展',
        awaitingAcceptance: '待你验收',
        needsRoute: '待项目/任务定位',
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
        ceaRole: 'CEA · 岗位说明书',
        identity: '身份',
        mission: '使命',
        capabilities: '能力',
        requirements: '要求',
        habits: '工作习惯',
        authority: '代拍板权',
        forbidden: '不可为',
        acceptance: '验收标准',
        departments: '部门',
        planned: '待招（虚框）',
        routing: '项目 / 任务定位',
        routingProject: '项目 = 工作区',
        routingTask: '任务 = 会话',
        existingTarget: '存量',
        newTarget: '新建',
        routeHint: '改选：/company route <决策> | <工作区或 新:名称> | <会话或 新:标题>',
        inventory: '工作区 / 会话台账',
        provision: '待补建',
        myProjects: '我的项目',
        myDecisions: '需要我决策',
        allProjects: '全部',
        runningProjects: '进行中',
        acceptingProjects: '待验收',
        acceptedProjects: '已验收',
        noDecisions: '当前没有需要你决策的事情。',
        projectTasks: '工单',
        projectPositions: '参与岗位',
        hqLabel: 'CEA 总部',
        hqUnbound: '尚未绑定总部会话，当前会话代行 CEA',
        hqBind: '把当前会话设为董事长办公室',
        charter: '治理章程（已拍板）',
        orgSecondary: '组织结构 · 工作负载 · 公司动态（次要）',
        showLess: '收起',
        showMore: '展开',
        knowledgeExport: '导出知识',
        exported: '已导出',
        decided: '已拍板',
        projectProgress: '进展',
        awaitingAcceptance: '待你验收',
        needsRoute: '待项目/任务定位',
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
      .sat-co { display: flex; flex-direction: column; height: 100%; min-height: 0; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); }
      .sat-co, .sat-co * { box-sizing: border-box; }
      .sat-co-head { padding: 18px 22px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .sat-co-title { font-size: 17px; font-weight: 600; }
      .sat-co-sub { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 3px; }
      .sat-co-cea { margin-top: 10px; padding: 10px 12px; border-radius: 9px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); font-size: 12px; line-height: 1.6; }
      .sat-co-body { flex: 1; min-height: 0; overflow: auto; padding: 4px 22px 120px; }
      .sat-co-sect { margin-top: 18px; }
      .sat-co-h { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
      .sat-co-count { font-size: 10px; background: var(--dsw-alias-bg-layer-2); border-radius: 999px; padding: 1px 7px; }
      .sat-co-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
      .sat-co-card { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 11px 13px; min-width: 0; }
      .sat-co-card.warn { border-color: var(--dsw-alias-state-warn-primary); }
      .sat-co-card-title { font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
      .sat-co-meta { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 5px; line-height: 1.6; overflow-wrap: anywhere; }
      .sat-co-chip { display: inline-block; font-size: 10px; border-radius: 4px; padding: 0 6px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); margin-right: 5px; }
      .sat-co-chip[data-tone="warn"] { color: var(--dsw-alias-state-warn-primary); }
      .sat-co-chip[data-tone="ok"] { color: var(--dsw-alias-state-success-primary); }
      .sat-co-acts { display: flex; gap: 7px; margin-top: 10px; }
      .sat-co-textarea { width: 100%; resize: vertical; min-height: 58px; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 8px 10px; font-size: 12px; color: var(--dsw-alias-label-primary); font-family: inherit; outline: none; }
      .sat-co-textarea:focus { border-color: var(--dsw-alias-brand-primary); }
      .sat-co-row { display: flex; gap: 8px; align-items: flex-start; }
      .sat-co-ev { font-size: 11px; color: var(--dsw-alias-label-secondary); padding: 5px 9px; border-left: 2px solid var(--dsw-alias-border-l2); margin-bottom: 5px; overflow-wrap: anywhere; }
      .sat-co-role { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
      .sat-co-role-box { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 11px 13px; }
      .sat-co-role-h { font-size: 11px; font-weight: 600; color: var(--dsw-alias-label-secondary); margin-bottom: 6px; }
      .sat-co-role-li { font-size: 11px; line-height: 1.65; color: var(--dsw-alias-label-primary); margin-bottom: 3px; overflow-wrap: anywhere; }
      .sat-co-role-li b { font-weight: 600; }
      .sat-co-dept { margin-bottom: 12px; }
      .sat-co-dept-h { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
      .sat-co-dept-m { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-bottom: 7px; overflow-wrap: anywhere; }
      .sat-co-route { margin-top: 9px; padding: 9px 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); border: 1px dashed var(--dsw-alias-border-l2); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
      .sat-co-route-h { font-weight: 600; margin-bottom: 3px; }
      .sat-co-input { width: 100%; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; padding: 5px 8px; font-size: 11px; color: var(--dsw-alias-label-primary); font-family: inherit; outline: none; margin-top: 6px; }
      .sat-co-hero { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
      .sat-co-stat { flex: 1 1 120px; min-width: 120px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 10px 13px; }
      .sat-co-stat-n { font-size: 22px; font-weight: 650; line-height: 1.1; }
      .sat-co-stat-l { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 3px; }
      .sat-co-stat[data-tone="warn"] .sat-co-stat-n { color: var(--dsw-alias-state-warn-primary); }
      .sat-co-stat[data-tone="ok"] .sat-co-stat-n { color: var(--dsw-alias-state-success-primary); }
      .sat-co-primary { margin-top: 18px; }
      .sat-co-primary-h { font-size: 14px; font-weight: 650; margin-bottom: 9px; display: flex; align-items: center; gap: 8px; }
      .sat-co-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
      .sat-co-tab { font-size: 11px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); cursor: pointer; }
      .sat-co-tab[data-on="1"] { background: var(--dsw-alias-brand-primary); color: #fff; border-color: var(--dsw-alias-brand-primary); }
      .sat-co-proj { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 13px 15px; min-width: 0; }
      .sat-co-proj[data-tone="warn"] { border-color: var(--dsw-alias-state-warn-primary); }
      .sat-co-proj-h { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
      .sat-co-proj-t { font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
      .sat-co-proj-g { font-size: 12px; color: var(--dsw-alias-label-secondary); margin-top: 6px; line-height: 1.6; overflow-wrap: anywhere; }
      .sat-co-proj-kv { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 5px; line-height: 1.6; overflow-wrap: anywhere; }
      .sat-co-proj-kv b { color: var(--dsw-alias-label-primary); font-weight: 600; }
      .sat-co-bar { height: 5px; border-radius: 3px; background: var(--dsw-alias-bg-layer-2); margin-top: 9px; overflow: hidden; }
      .sat-co-bar > i { display: block; height: 100%; background: var(--dsw-alias-brand-primary); }
      .sat-co-fold { margin-top: 22px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 12px; }
      .sat-co-fold-btn { width: 100%; text-align: left; background: transparent; border: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; padding: 8px 0; cursor: pointer; font-family: inherit; }
      .sat-co-fold-btn:hover { color: var(--dsw-alias-label-primary); }
      .sat-co-charter { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 9px; }
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

    /** The company is profile-wide, so the global panel needs a live session
     *  to run the /company command against. We take the first running session
     *  from the shared session snapshot. */
    function useCompanyAnchor(useSessions) {
      return useSessions((state) => {
        const byId = state.byId || {};
        const ids = Object.keys(byId);
        return ids.find((id) => byId[id] && byId[id].running) || ids[0] || null;
      });
    }

    /** Shared company state + command runner for the two company views. */
    function useCompanyState(ctx, sessionId) {
      const [state, setState] = React.useState(null);
      const [error, setError] = React.useState(null);
      const [busy, setBusy] = React.useState(false);

      const call = React.useCallback(async (line) => {
        const commands = ctx && ctx.remote && ctx.remote.commands;
        if (!commands || !sessionId) return null;
        const controller = new AbortController();
        try {
          const raw = await commands.execute(sessionId, line, [], controller.signal);
          return extractText(raw);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason));
          return null;
        }
      }, [ctx, sessionId]);

      const reload = React.useCallback(async () => {
        const text = await call('/company state');
        if (!text) return;
        try {
          const parsed = JSON.parse(text);
          setState(parsed);
          setError(null);
        } catch {
          setError('The Host returned an unreadable company snapshot.');
        }
      }, [call]);

      React.useEffect(() => {
        reload();
        const timer = setInterval(reload, 15000);
        return () => clearInterval(timer);
      }, [reload]);

      const run = React.useCallback(async (line) => {
        setBusy(true);
        await call(line);
        setBusy(false);
        await reload();
      }, [call, reload]);

      return { state, error, busy, reload, run };
    }

    const DECISION_LABEL = { requirement: 'requirement', position: 'position', deliverable: 'deliverable' };

    function DecisionCard({ decision, t, busy, onDecide }) {
      const kindLabel = t(DECISION_LABEL[decision.kind] || 'requirement');
      const routing = decision.routing;
      const [projectSpec, setProjectSpec] = React.useState('');
      const [taskSpec, setTaskSpec] = React.useState('');

      const target = (label, node, key) => node
        ? h('div', null, label + ' · ' +
            (node.mode === 'existing' ? t('existingTarget') : t('newTarget')) + '：' + (node.title || node[key] || '—'))
        : null;

      return h('div', { className: 'sat-co-card warn' },
        h('div', { className: 'sat-co-card-title' }, decision.subject),
        h('div', { className: 'sat-co-meta' },
          h('span', { className: 'sat-co-chip', 'data-tone': 'warn' }, kindLabel),
          h('span', { className: 'sat-co-chip' }, decision.status),
          h('span', { className: 'sat-co-chip' }, decision.createdAt)),
        h('div', { className: 'sat-co-meta' }, decision.detail),
        routing && decision.kind === 'requirement'
          ? h('div', { className: 'sat-co-route' }, [
              h('div', { className: 'sat-co-route-h' }, t('routing')),
              target(t('routingProject'), routing.project, 'workspaceId'),
              target(t('routingTask'), routing.task, 'sessionId'),
              h('div', null, (routing.reason || '')),
              h('input', { className: 'sat-co-input', value: projectSpec,
                placeholder: t('routingProject') + '（留空=不改）', onChange: (e) => setProjectSpec(e.target.value) }),
              h('input', { className: 'sat-co-input', value: taskSpec,
                placeholder: t('routingTask') + '（留空=不改）', onChange: (e) => setTaskSpec(e.target.value) }),
              (projectSpec.trim() || taskSpec.trim())
                ? h('button', { type: 'button', className: 'sat-btn', disabled: busy,
                    onClick: () => onDecide('/company route ' + decision.id + ' | ' +
                      (projectSpec.trim() || (routing.project.mode === 'new' ? '新:' + routing.project.title : routing.project.workspaceId)) + ' | ' +
                      (taskSpec.trim() || (routing.task.mode === 'new' ? '新:' + routing.task.title : routing.task.sessionId))) }, t('routing') + ' ✓')
                : null,
              h('div', { className: 'sat-co-meta' }, t('routeHint')),
            ])
          : null,
        h('div', { className: 'sat-co-acts' },
          h('button', { type: 'button', className: 'sat-btn sat-btn-primary', disabled: busy,
            onClick: () => onDecide('/company approve ' + decision.id) }, t('approve')),
          h('button', { type: 'button', className: 'sat-btn sat-btn-danger', disabled: busy,
            onClick: () => onDecide('/company reject ' + decision.id) }, t('reject'))));
    }

    function PositionCard({ position, t }) {
      const caps = (position.leader && position.leader.capabilities) || [];
      const jd = position.jd || {};
      return h('div', { className: 'sat-co-card' },
        h('div', { className: 'sat-co-card-title' }, position.name),
        h('div', { className: 'sat-co-meta' },
          h('span', { className: 'sat-co-chip', 'data-tone': position.status === 'active' ? 'ok' : 'warn' },
            position.status === 'active' ? t('active') : t('planned')),
          h('span', { className: 'sat-co-chip' }, t('leader') + ': ' + ((position.leader && position.leader.name) || '—')),
          h('span', { className: 'sat-co-chip' }, t('headcount') + ' ' + position.headcount),
          h('span', { className: 'sat-co-chip' }, t('load') + ' ' + position.load)),
        h('div', { className: 'sat-co-meta' }, jd.mission || ''),
        h('div', { className: 'sat-co-meta' }, t('capabilities') + ': ' + caps.length + (caps.length ? ' · ' + caps.map((c) => c.skill).join(' / ') : '')),
      );
    }

    /** Sidebar icon for the company overview (owner props: size, active). */
    function CompanyIcon({ size, active }) {
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true,
        style: { display: 'block', color: active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)' },
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
        h('path', { d: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 10h.01M12 10h.01M16 10h.01' }),
      );
    }

    /** A collapsible secondary section (org / load / activity). */
    function Fold({ title, defaultOpen, children }) {
      const [open, setOpen] = React.useState(Boolean(defaultOpen));
      return h('div', { className: 'sat-co-fold' }, [
        h('button', { type: 'button', className: 'sat-co-fold-btn', onClick: () => setOpen(!open) },
          (open ? '▾ ' : '▸ ') + title),
        open ? h('div', null, children) : null,
      ]);
    }

    function Stat({ n, label, tone }) {
      return h('div', { className: 'sat-co-stat', 'data-tone': tone || '' }, [
        h('div', { className: 'sat-co-stat-n' }, String(n)),
        h('div', { className: 'sat-co-stat-l' }, label),
      ]);
    }

    /** Project status → display tone. */
    function projectTone(project) {
      if (project.chairmanDecision === 'accepted') return 'ok';
      if (project.status === 'acceptance' || project.status === 'confirming') return 'warn';
      return '';
    }

    function projectStatusText(project, t) {
      if (project.chairmanDecision === 'accepted') return t('acceptedProjects');
      if (project.status === 'acceptance') return t('awaitingAcceptance');
      if (project.status === 'confirming') return t('needsRoute');
      return t('runningProjects');
    }

    /** Rich project card: this is what the Chairman came to see. */
    function ProjectCard({ project, positions, t, onDecide }) {
      const tone = projectTone(project);
      const items = project.workItems || [];
      const routed = project.routing;
      const pm = project.pmId || '—';
      return h('div', { className: 'sat-co-proj', 'data-tone': tone }, [
        h('div', { className: 'sat-co-proj-h' }, [
          h('div', { className: 'sat-co-proj-t' }, project.title),
          h('span', { className: 'sat-co-chip', 'data-tone': tone === 'warn' ? 'warn' : (tone === 'ok' ? 'ok' : '') },
            projectStatusText(project, t)),
        ]),
        h('div', { className: 'sat-co-proj-g' }, project.goal || ''),
        h('div', { className: 'sat-co-proj-kv' }, [
          h('b', null, t('status')), '：' + (project.status || '') + '　',
          h('b', null, 'PM'), '：' + pm + '　',
          h('b', null, t('projectProgress')), '：' + items.length + ' ' + t('projectTasks'),
        ]),
        items.length ? h('div', { className: 'sat-co-bar' }, [
          h('i', { style: { width: (project.chairmanDecision === 'accepted' ? 100 :
            project.status === 'acceptance' ? 85 : Math.min(70, 20 + items.length * 15)) + '%' } }),
        ]) : null,
        items.length ? h('div', { className: 'sat-co-proj-kv' }, items.map((x) => '· ' + x).join('  ')) : null,
        routed ? h('div', { className: 'sat-co-proj-kv' },
          t('routingProject') + '：' + (routed.project?.title || '—') + '　' +
          t('routingTask') + '：' + (routed.task?.title || '—')) : null,
        project.provisioning ? h('div', { className: 'sat-co-proj-kv' },
          '⚠ ' + t('provision') + '：' + (project.provisioning.workspace || project.provisioning.session || '')) : null,
        project.deliverable ? h('div', { className: 'sat-co-proj-kv' },
          h('b', null, t('deliverableLabel')), '：' + project.deliverable) : null,
        project.ceaReview ? h('div', { className: 'sat-co-proj-kv' },
          h('b', null, t('ceaReview')), '：' + project.ceaReview) : null,
        project.chairmanDecision ? h('div', { className: 'sat-co-proj-kv' },
          h('b', null, t('chairmanDecision')), '：' + project.chairmanDecision) : null,
        (project.positionIds || []).length
          ? h('div', { className: 'sat-co-proj-kv' },
              h('b', null, t('projectPositions')), '：' + (project.positionIds || [])
                .map((id) => (positions.find((p) => p.id === id) || {}).name || id).join(' / '))
          : null,
      ]);
    }

    /** Global company overview: projects and decisions first, org second. */
    function CompanyPanel({ useSessions }) {
      const ctx = CONTEXT_REF.current;
      const t = translate || makeTranslator();
      const sessionId = useCompanyAnchor(useSessions);
      const company = useCompanyState(ctx, sessionId);
      const [draft, setDraft] = React.useState('');
      const [filter, setFilter] = React.useState('all');
      const state = company.state || {};
      const current = state._current || {};
      const decisions = (state.decisions || []).filter((d) => d.status === 'pending');
      const positions = state.positions || [];
      const pms = state.pms || [];
      const projects = state.projects || [];
      const events = state.events || [];
      const departments = state.departments || [];
      const inventory = state.inventory || { workspaces: [], sessions: [], byWorkspace: {} };
      const cea = state.company && state.company.cea;
      const charter = (state.company && state.company.charter) || [];
      const hq = (state.company && state.company.headquarters) || {};
      const exportInfo = state.company && state.company.lastKnowledgeExport;

      const brief = () => {
        const text = draft.trim();
        if (!text) return;
        setDraft('');
        company.run('/company brief ' + text);
      };

      const counts = {
        decisions: decisions.length,
        running: projects.filter((p) => p.status === 'executing' || p.status === 'confirming').length,
        accepting: projects.filter((p) => p.status === 'acceptance').length,
        accepted: projects.filter((p) => p.chairmanDecision === 'accepted').length,
      };

      const FILTERS = [
        { id: 'all', label: t('allProjects'), match: () => true },
        { id: 'running', label: t('runningProjects'), match: (p) => p.status === 'executing' || p.status === 'confirming' },
        { id: 'accepting', label: t('acceptingProjects'), match: (p) => p.status === 'acceptance' },
        { id: 'accepted', label: t('acceptedProjects'), match: (p) => p.chairmanDecision === 'accepted' },
      ];
      const visibleProjects = projects.filter(FILTERS.find((f) => f.id === filter).match);

      // ---- primary: what the Chairman came for ----
      const head = h('div', { className: 'sat-co-head' }, [
        h('div', { className: 'sat-co-title' }, (state.company && state.company.name) || t('companyTitle')),
        h('div', { className: 'sat-co-sub' },
          t('chairmanDesk') + ' · ' + (state.company && state.company.chairman ? state.company.chairman : '') +
          ' · ' + (hq.bound ? t('hqLabel') + '：' + (hq.title || hq.workspaceId) : t('hqUnbound'))),
        h('div', { className: 'sat-co-hero' }, [
          h(Stat, { n: counts.decisions, label: t('myDecisions'), tone: 'warn' }),
          h(Stat, { n: counts.running, label: t('runningProjects') }),
          h(Stat, { n: counts.accepting, label: t('acceptingProjects'), tone: 'warn' }),
          h(Stat, { n: counts.accepted, label: t('acceptedProjects'), tone: 'ok' }),
        ]),
        !hq.bound && current.workspaceId
          ? h('button', { type: 'button', className: 'sat-btn', disabled: company.busy,
              onClick: () => company.run('/company hq ' + current.workspaceId + ' | ' + (current.sessionId || '') + ' | 董事长办公室') },
              t('hqBind'))
          : null,
      ]);

      const decisionSection = h('div', { className: 'sat-co-primary' }, [
        h('div', { className: 'sat-co-primary-h' }, [
          t('myDecisions'), h('span', { className: 'sat-co-count' }, String(decisions.length))]),
        decisions.length
          ? h('div', { className: 'sat-co-grid' }, decisions.map((d) =>
              h(DecisionCard, { key: d.id, decision: d, t, busy: company.busy, onDecide: company.run })))
          : h('div', { className: 'sat-empty' }, t('noDecisions')),
      ]);

      const projectSection = h('div', { className: 'sat-co-primary' }, [
        h('div', { className: 'sat-co-primary-h' }, [
          t('myProjects'), h('span', { className: 'sat-co-count' }, String(projects.length))]),
        h('div', { className: 'sat-co-tabs' }, FILTERS.map((f) =>
          h('button', { type: 'button', key: f.id, className: 'sat-co-tab',
            'data-on': filter === f.id ? '1' : '0', onClick: () => setFilter(f.id) }, f.label))),
        visibleProjects.length
          ? h('div', { className: 'sat-co-grid' }, visibleProjects.map((pr) =>
              h(ProjectCard, { key: pr.id, project: pr, positions, t, onDecide: company.run })))
          : h('div', { className: 'sat-empty' }, t('empty')),
      ]);

      const briefSection = h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, [t('brief'), h('span', { className: 'sat-co-count' }, 'CEA')]),
        h('div', { className: 'sat-co-row' }, [
          h('textarea', {
            className: 'sat-co-textarea', value: draft, placeholder: t('briefPlaceholder'),
            onChange: (e) => setDraft(e.target.value),
            onKeyDown: (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); brief(); } },
          }),
          h('button', { type: 'button', className: 'sat-btn sat-btn-primary', disabled: company.busy || !sessionId, onClick: brief }, t('brief')),
        ]),
        h('div', { className: 'sat-co-meta' }, t('briefHint')),
      ]);

      // ---- secondary: org / load / activity, collapsed by default ----
      const roleBox = (title, items) => h('div', { className: 'sat-co-role-box' }, [
        h('div', { className: 'sat-co-role-h' }, title),
      ].concat((items || []).map((item) =>
        h('div', { className: 'sat-co-role-li' },
          typeof item === 'string' ? item : h('span', null, h('b', null, (item.name || item.scope || '') + '：'), item.detail || item.limit || '')))));

      const charterSection = h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, t('charter')),
        h('div', { className: 'sat-co-charter' }, charter.map((c) =>
          h('div', { className: 'sat-co-card', key: c.id }, [
            h('div', { className: 'sat-co-card-title' }, c.decision),
            h('div', { className: 'sat-co-meta' }, t('decided') + ' · ' + c.decidedAt),
            h('div', { className: 'sat-co-meta' }, c.rationale),
          ]))),
      ]);

      const deptSection = departments.length ? h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, [t('departments'), h('span', { className: 'sat-co-count' }, String(departments.length))]),
        departments.map((dept) => h('div', { className: 'sat-co-dept', key: dept.id }, [
          h('div', { className: 'sat-co-dept-h' }, dept.name + ' · ' + (dept.positionIds || []).length + ' ' + t('positions')),
          h('div', { className: 'sat-co-dept-m' }, dept.mission || ''),
          h('div', { className: 'sat-co-grid' }, positions.filter((p) => (dept.positionIds || []).includes(p.id))
            .map((p) => h(PositionCard, { key: p.id, position: p, t }))),
        ])),
      ]) : null;

      const inventorySection = h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, [t('inventory'), h('span', { className: 'sat-co-count' }, String((inventory.workspaces || []).length))]),
        h('div', { className: 'sat-co-grid' }, (inventory.workspaces || []).map((w) =>
          h('div', { className: 'sat-co-card', key: w.id }, [
            h('div', { className: 'sat-co-card-title' }, w.title || w.id),
            h('div', { className: 'sat-co-meta' }, w.path || ''),
            h('div', { className: 'sat-co-meta' }, ((inventory.byWorkspace || {})[w.id] || []).map((x) => '· ' + (x.title || x.id)).join('  ')),
          ]))),
      ]);

      const pmSection = h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, [t('pms'), h('span', { className: 'sat-co-count' }, String(pms.length))]),
        h('div', { className: 'sat-co-grid' }, pms.map((pm) =>
          h('div', { className: 'sat-co-card', key: pm.id }, [
            h('div', { className: 'sat-co-card-title' }, pm.name),
            h('div', { className: 'sat-co-meta' }, pm.class),
            h('div', { className: 'sat-co-meta' }, (pm.knowledge || []).map((k) => '· ' + k.topic).join('  ')),
          ]))),
      ]);

      const eventSection = h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, [t('events'),
          h('button', { type: 'button', className: 'sat-btn', onClick: company.reload }, t('refresh')),
          h('button', { type: 'button', className: 'sat-btn', disabled: company.busy,
            onClick: () => company.run('/company export') }, t('knowledgeExport'))]),
        exportInfo ? h('div', { className: 'sat-co-meta' }, t('exported') + '：' + exportInfo.file) : null,
        events.slice(0, 12).map((e, i) =>
          h('div', { className: 'sat-co-ev', key: i }, e.at + ' · ' + e.text)),
      ]);

      const roleSection = cea ? h('div', { className: 'sat-co-sect' }, [
        h('div', { className: 'sat-co-h' }, t('ceaRole')),
        h('div', { className: 'sat-co-meta' }, t('identity') + '：' + (cea.identity || '')),
        h('div', { className: 'sat-co-meta' }, t('mission') + '：' + (cea.mission || '')),
        h('div', { className: 'sat-co-role' }, [
          roleBox(t('capabilities'), cea.capabilities),
          roleBox(t('requirements'), cea.requirements),
          roleBox(t('habits'), cea.habits),
          roleBox(t('authority'), cea.delegatedAuthority),
          roleBox(t('forbidden'), cea.forbidden),
          roleBox(t('acceptance'), [cea.acceptance]),
        ]),
      ]) : null;

      const secondary = h('div', { className: 'sat-co-secondary' }, [
        h(Fold, { title: t('orgSecondary') }, [
          charterSection, deptSection, roleSection, pmSection, inventorySection, eventSection,
        ]),
      ]);

      const notices = [
        company.error ? h('div', { className: 'sat-notice', 'data-tone': 'warn', key: 'err' }, company.error) : null,
        !sessionId ? h('div', { className: 'sat-notice', 'data-tone': 'warn', key: 'no-session' }, t('noCompanyChannel')) : null,
      ];

      const body = h('div', { className: 'sat-co-body' }, notices.concat([
        decisionSection, projectSection, briefSection, secondary,
      ]));

      return h('div', { className: 'sat-co' }, [h('style', null, css), head, body]);
    }

    /** Per-workspace project view: inside each conversation, filtered to that project. */
    function ProjectView({ sessionId, useSessions }) {
      const ctx = CONTEXT_REF.current;
      const t = translate || makeTranslator();
      const company = useCompanyState(ctx, sessionId);
      const state = company.state || {};
      const current = state._current || {};
      const workspaceId = current.workspaceId || '';
      const projects = state.projects || [];
      const normalize = (value) => String(value || '').replace(/\s+/g, '').toLowerCase();
      const keys = [workspaceId, current.workspaceTitle].map(normalize).filter(Boolean);
      const mine = keys.length
        ? projects.filter((p) => keys.includes(normalize(p.workspaceId)))
        : projects.filter((p) => !p.workspaceId);

      const head = h('div', { className: 'sat-co-head' }, [
        h('div', { className: 'sat-co-title' }, t('projectView')),
        h('div', { className: 'sat-co-sub' }, (current.workspaceTitle || '') + (workspaceId ? ' · ' + workspaceId : '')),
      ]);

      const cards = mine.length
        ? h('div', { className: 'sat-co-grid' }, mine.map((pr) =>
            h('div', { className: 'sat-co-card', key: pr.id }, [
              h('div', { className: 'sat-co-card-title' }, pr.title),
              h('div', { className: 'sat-co-meta' }, t('status') + ': ' + pr.status),
              h('div', { className: 'sat-co-meta' }, t('goal') + ': ' + (pr.goal || '')),
              (pr.workItems || []).length
                ? h('div', { className: 'sat-co-meta' }, (pr.workItems || []).map((w) => '· ' + w).join('  '))
                : null,
              pr.deliverable ? h('div', { className: 'sat-co-meta' }, t('deliverableLabel') + ': ' + pr.deliverable) : null,
              pr.ceaReview ? h('div', { className: 'sat-co-meta' }, t('ceaReview') + ': ' + pr.ceaReview) : null,
              h('div', { className: 'sat-co-meta' },
                h('span', {
                  className: 'sat-co-chip',
                  'data-tone': pr.chairmanDecision === 'accepted' ? 'ok' : 'warn',
                }, pr.chairmanDecision === 'accepted' ? t('accepted') : t('pendingAcceptance'))),
            ])))
        : h('div', { className: 'sat-empty' }, t('noProjects'));

      const body = h('div', { className: 'sat-co-body' }, [
        company.error ? h('div', { className: 'sat-notice', 'data-tone': 'warn' }, company.error) : null,
        cards,
      ]);

      return h('div', { className: 'sat-co' }, [h('style', null, css), head, body]);
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

        // The dictionary has to be registered *synchronously*: ctx.effect is
        // deferred, and ctx.locale.bind() requires the namespace to exist at
        // the moment it is called. A deferred registration would leave the
        // panel bound to its built-in fallback, so switching the Harness
        // language would do nothing. The disposer still belongs to the fiber.
        let unregister = () => {};
        try {
          unregister = ctx.locale.register(NS, { en: DICT.en, zh: DICT.zh });
        } catch {
          try { unregister = ctx.locale.register(NS, 'en', DICT.en); } catch { /* no dictionary */ }
        }
        ctx.effect(() => unregister, 'super-agent-team.locale()');
        try {
          const bound = ctx.locale.bind(NS);
          if (typeof bound === 'function') translate = bound;
        } catch { /* keep the built-in dictionary */ }

        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: VIEW_ID,
          order: 20,
          label: () => {
            // A translation failure must never drop the whole slot entry.
            try { return translate ? translate('viewLabel') : 'Team'; } catch { return 'Team'; }
          },
        }, TeamView));

        // Global company overview: the entry above the workspace list.
        // sidebar.panellist + a keyed `main` panel — the same pattern as
        // personal-workbench, but bound to the profile-wide company state.
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'super-agent-company',
          order: 5,
          label: () => {
            try { return translate ? translate('company') : 'Company'; } catch { return 'Company'; }
          },
        }, CompanyIcon));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'super-agent-company',
        }, CompanyPanel));

        // Per-workspace project view.
        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: 'super-agent-company-project',
          order: 21,
          label: () => {
            try { return translate ? translate('projectView') : 'Project'; } catch { return 'Project'; }
          },
        }, ProjectView));
      },
    };
  },
});
