export type Language = "en" | "zh";

export const translations = {
  en: {
    languageToggle: {
      label: "Language",
      english: "EN",
      chinese: "中文"
    },
    header: {
      subtitle: "AI Subscription Firewall for Web3 Users",
      mock: "Mock",
      live: "Live"
    },
    wallet: {
      wrongChain: "Wrong chain",
      switchTo0G: "Switch to 0G",
      disconnect: "Disconnect",
      connecting: "Connecting...",
      connectWallet: "Connect Wallet"
    },
    home: {
      alertTitle: "Renewal firewall mode:",
      alertBody:
        "SubGuardian analyzes recurring AI/Web3 spend before renewal, stores encrypted memory on 0G Storage, and records user-authorized decisions on 0G Chain.",
      operationalNotes: {
        noContract: "Deploy the contract and set NEXT_PUBLIC_CONTRACT_ADDRESS to activate live chain writes.",
        noStorage: "Upload encrypted subscription memory before recording the analysis hash.",
        ready: "Ready for a verifiable 0G demo flow."
      }
    },
    overview: {
      monthlyTotal: "Monthly Total",
      budgetLimit: "Budget Limit",
      potentialSavings: "Potential Savings",
      riskLevel: "Risk Level"
    },
    subscription: {
      title: "Subscription Firewall Queue",
      eyebrow: "Demo queue and imported records",
      columns: {
        service: "Service",
        category: "Category",
        amount: "Amount",
        cycle: "Cycle",
        usage: "Ledger signal",
        nextRenewal: "Next Renewal",
        aiDecision: "AI Decision"
      },
      formTitle: "Add Subscription",
      fields: {
        serviceName: "Service Name",
        category: "Category",
        amount: "Amount",
        currency: "Currency",
        cycle: "Cycle",
        nextRenewal: "Next Renewal",
        usageScore: "Legacy usage score",
        notes: "Notes"
      },
      addButton: "Add demo record",
      errors: {
        serviceRequired: "Service name is required.",
        amountPositive: "Amount must be greater than zero."
      }
    },
    policy: {
      title: "Renewal Policy",
      eyebrow: "Firewall rules",
      monthlyBudget: "Monthly Budget",
      priceIncreaseLimit: "Price Increase Limit %",
      manualApprovalAbove: "Manual Approval Above",
      defaultAction: "Default Action",
      allowAutoRenew: "Allow auto-renew for high-usage services",
      trustedServices: "Trusted Services",
      blockedServices: "Blocked Services",
      autoApproveBelow: "Auto-approve Below",
      requireApprovalForUnknown: "Require approval for unknown services",
      maxSingleSpend: "Max Single Spend",
      renewalCooldownDays: "Renewal Cooldown Days"
    },
    demoLog: {
      title: "Demo Log",
      eyebrow: "3-minute proof trail",
      waiting: "Waiting for action",
      items: {
        wallet: "Wallet connected",
        subscription: "Subscription added",
        storage: "Encrypted profile uploaded to 0G Storage",
        compute: "AI analysis completed by 0G Compute",
        chain: "Decision recorded on 0G Chain"
      }
    },
    agentFirewall: {
      title: "Simulated Agent Spend Request",
      eyebrow: "Pre-spend authorization simulator",
      body:
        "This form simulates an AI agent, payment rail, or API gateway calling SubGuardian before spending. In production, these fields are supplied automatically by agent runtime logs, payment receipts, API usage, and subscription systems.",
      fields: {
        agentId: "Agent ID",
        serviceName: "Service Name",
        amount: "Amount",
        currency: "Currency",
        category: "Category",
        billingCycle: "Billing Cycle",
        reason: "Reason"
      },
      reasonPlaceholder: "Why does the agent need this paid renewal or API spend?",
      checkButton: "Check Spend Request",
      resultTitle: "Pre-spend authorization result",
      riskScore: "Risk score",
      approvalRequired: "Approval required",
      estimatedSaving: "Estimated saving",
      authorizationDecision: "Authorization",
      usageSignal: "Usage signal",
      usageSignalSource: "inferred from recent activity",
      budgetPressure: "Budget pressure",
      nextAction: "Next action",
      analysisHash: "Analysis hash",
      traceId: "Trace ID",
      openProof: "Open Proof",
      empty:
        "Submit the simulated request to see whether SubGuardian would allow, pause, reject, or ask the user before any payment, renewal, or paid API call happens.",
      errors: {
        requestFailed: "Agent spend check failed."
      },
      yes: "yes",
      no: "no"
    },
    agentPositioning: {
      title: "How agents integrate",
      bullets: [
        "AI agents request SubGuardian before calling paid APIs, buying tools, or renewing subscriptions.",
        "SubGuardian checks budget, approval thresholds, historical usage signals, and policy.",
        "The API returns allow / pause / reject / ask_user.",
        "The result can generate proof and be recorded to 0G Storage / 0G Chain."
      ],
      codeTitle: "API example",
      latestCheck: "Latest agent check",
      to: "to"
    },
    analysis: {
      title: "0G Compute Analysis",
      eyebrow: "AI renewal decision agent",
      analyzeButton: "Analyze with 0G Compute",
      risk: "Risk",
      renewalRisk: "Renewal risk",
      budgetStatus: "Budget Status",
      budgetPressure: "Budget pressure",
      preSpendResult: "Pre-spend authorization result",
      preSpendBody:
        "Agent spending is checked before renewal, paid API usage, or tool purchase. Budget pressure, renewal risk, estimated savings, and next action are computed for each service.",
      tee: "TEE",
      verified: "verified",
      notVerified: "mock / not verified",
      riskSaving: "Risk score {score} | Saving {saving}",
      estimatedSaving: "Estimated saving",
      approval: "Approval",
      approvalRequired: "required",
      approvalNotRequired: "not required",
      nextAction: "Next action",
      nextActions: "Next actions",
      traceId: "Trace ID",
      empty: "Run the analysis to turn subscription records and policy into verifiable renewal recommendations."
    },
    storage: {
      title: "0G Storage",
      eyebrow: "Encrypted subscription memory",
      uploadButton: "Upload Encrypted Profile",
      encrypted: "AES-GCM encrypted",
      mockMode: "Mock Mode",
      liveMode: "Live 0G Mode",
      storageRootHash: "Storage Root Hash",
      payloadSize: "Payload Size",
      algorithm: "Algorithm",
      bytes: "bytes",
      empty: "Upload happens only after client/API encryption, so raw subscription data is not stored in plaintext."
    },
    chain: {
      title: "0G Chain Registry",
      eyebrow: "Verifiable renewal decisions",
      contractAddress: "Contract Address",
      latestStorageRoot: "Latest Storage Root",
      analysisHash: "Analysis Hash",
      addSubscription: "Add Subscription",
      recordAnalysis: "Record Analysis",
      recordDecision: "Record Decision",
      onChainSubscriptionId: "On-chain Subscription ID",
      decisionToRecord: "Decision to Record",
      latestTransactionHash: "Latest Transaction Hash",
      openExplorer: "Open in 0G Explorer",
      explorerBase: "Explorer base",
      placeholders: {
        contractAddress: "Set NEXT_PUBLIC_CONTRACT_ADDRESS after deployment",
        storageRoot: "Upload encrypted profile first",
        analysisHash: "Run analysis first",
        txHash: "No transaction yet"
      }
    },
    proof: {
      back: "Back to Dashboard",
      eyebrow: "SubGuardian proof receipt",
      title: "AI Agent Spending Firewall Authorization",
      body:
        "This receipt records the pre-spend check an AI agent must pass before renewing a subscription, calling a paid API, or buying tool credits.",
      fields: {
        agentId: "Agent ID",
        serviceName: "Service name",
        amount: "Amount",
        decision: "Decision",
        riskScore: "Risk score",
        requiresApproval: "Requires user approval",
        reason: "Reason",
        policySummary: "Policy summary",
        analysisHash: "Analysis hash",
        storageRootHash: "Storage root hash",
        chainTxHash: "0G Chain transaction hash",
        mockChainCommitment: "Mock chain commitment",
        chainStatus: "Chain status",
        explorerLink: "0G Explorer link",
        createdTime: "Created time",
        traceId: "Trace ID",
        proofId: "Proof ID"
      },
      noExplorer: "No explorer link available.",
      mockChainNotice:
        "This Agent proof is in deterministic mock mode. The hash below is a local commitment, not a submitted 0G Chain transaction, so 0G Explorer will not find it.",
      chainRecorded: "Recorded on 0G Chain",
      notRecorded: "Not recorded on 0G Chain",
      missing: "No local proof was found for this ID. Run an Agent Spending Firewall check from the dashboard, then open the proof again."
    },
    errors: {
      analyzeRequestFailed: "Analyze request failed.",
      storageUploadRequestFailed: "Storage upload request failed.",
      noSubscription: "No subscription is available to record.",
      missingContract: "Set NEXT_PUBLIC_CONTRACT_ADDRESS before writing to 0G Chain.",
      addSubscriptionTxFailed: "Add subscription transaction failed.",
      addSubscriptionFirst: "Add a subscription on-chain first.",
      runAnalysisFirst: "Run AI analysis first.",
      runAnalysisBeforeDecision: "Run AI analysis before recording a decision.",
      recordAnalysisTxFailed: "Record analysis transaction failed.",
      recordDecisionTxFailed: "Record decision transaction failed."
    },
    values: {
      pending: "pending",
      decision: {
        allow: "allow",
        renew: "renew",
        pause: "pause",
        reject: "reject",
        ask_user: "ask user"
      },
      decisionOption: {
        renew: "Renew",
        pause: "Pause",
        reject: "Reject",
        ask_user: "Ask user"
      },
      riskLevel: {
        low: "LOW",
        medium: "MEDIUM",
        high: "HIGH"
      },
      budgetStatus: {
        under_budget: "under budget",
        near_limit: "near limit",
        over_budget: "over budget"
      },
      authorizationDecision: {
        allow: "allow",
        pause: "pause",
        reject: "reject",
        ask_user: "ask user"
      },
      usageSignal: {
        high: "high",
        medium: "medium",
        low: "low",
        unknown: "unknown / higher risk",
        high_usage: "high usage",
        medium_usage: "medium usage",
        low_usage: "low usage",
        unknown_usage: "unknown usage / high risk"
      },
      billingCycle: {
        monthly: "monthly",
        yearly: "yearly"
      },
      category: {
        "AI Tool": "AI Tool",
        "Web3 Infra": "Web3 Infra",
        SaaS: "SaaS",
        API: "API",
        Other: "Other"
      }
    }
  },
  zh: {
    languageToggle: {
      label: "语言切换",
      english: "EN",
      chinese: "中文"
    },
    header: {
      subtitle: "面向 Web3 用户的 AI 订阅防火墙",
      mock: "模拟",
      live: "实时"
    },
    wallet: {
      wrongChain: "链不匹配",
      switchTo0G: "切换到 0G",
      disconnect: "断开连接",
      connecting: "连接中...",
      connectWallet: "连接钱包"
    },
    home: {
      alertTitle: "续费防火墙模式：",
      alertBody:
        "SubGuardian 会在续费前分析周期性 AI/Web3 支出，将加密记忆存入 0G Storage，并把用户授权的决策记录到 0G Chain。",
      operationalNotes: {
        noContract: "部署合约并设置 NEXT_PUBLIC_CONTRACT_ADDRESS 后即可启用真实链上写入。",
        noStorage: "记录分析哈希前，请先上传加密订阅记忆。",
        ready: "已准备好进行可验证的 0G 演示流程。"
      }
    },
    overview: {
      monthlyTotal: "月度总额",
      budgetLimit: "预算上限",
      potentialSavings: "潜在节省",
      riskLevel: "风险等级"
    },
    subscription: {
      title: "订阅防火墙队列",
      eyebrow: "演示队列与导入记录",
      columns: {
        service: "服务",
        category: "类别",
        amount: "金额",
        cycle: "周期",
        usage: "账本信号",
        nextRenewal: "下次续费",
        aiDecision: "AI 决策"
      },
      formTitle: "新增订阅",
      fields: {
        serviceName: "服务名称",
        category: "类别",
        amount: "金额",
        currency: "币种",
        cycle: "周期",
        nextRenewal: "下次续费",
        usageScore: "旧版使用评分",
        notes: "备注"
      },
      addButton: "添加演示记录",
      errors: {
        serviceRequired: "服务名称不能为空。",
        amountPositive: "金额必须大于 0。"
      }
    },
    policy: {
      title: "续费策略",
      eyebrow: "防火墙规则",
      monthlyBudget: "月度预算",
      priceIncreaseLimit: "涨价上限 %",
      manualApprovalAbove: "超过该金额需人工确认",
      defaultAction: "默认动作",
      allowAutoRenew: "允许高使用率服务自动续费",
      trustedServices: "可信服务",
      blockedServices: "阻止服务",
      autoApproveBelow: "低于该金额自动允许",
      requireApprovalForUnknown: "未知服务需要审批",
      maxSingleSpend: "单笔支出上限",
      renewalCooldownDays: "续费冷却天数"
    },
    demoLog: {
      title: "演示日志",
      eyebrow: "3 分钟验证轨迹",
      waiting: "等待操作",
      items: {
        wallet: "钱包已连接",
        subscription: "订阅已添加",
        storage: "加密档案已上传至 0G Storage",
        compute: "0G Compute 已完成 AI 分析",
        chain: "决策已记录到 0G Chain"
      }
    },
    agentFirewall: {
      title: "模拟 Agent 花费请求",
      eyebrow: "花费前授权模拟器",
      body:
        "这个表单用于模拟 AI Agent、支付系统或 API 网关在真正花钱前调用 SubGuardian。生产环境中，这些字段会由 Agent 请求、用量日志、支付记录和订阅系统自动提供，而不是由用户手动填写。",
      fields: {
        agentId: "Agent ID",
        serviceName: "服务名称",
        amount: "金额",
        currency: "币种",
        category: "类别",
        billingCycle: "计费周期",
        reason: "花费原因"
      },
      reasonPlaceholder: "这个 Agent 为什么需要这次续费、付费 API 或工具支出？",
      checkButton: "检查花费请求",
      resultTitle: "花费前授权结果",
      riskScore: "风险分",
      approvalRequired: "需要审批",
      estimatedSaving: "预计可节省",
      authorizationDecision: "授权结果",
      usageSignal: "使用信号",
      usageSignalSource: "根据近期活动推断",
      budgetPressure: "预算压力",
      nextAction: "下一步动作",
      analysisHash: "分析哈希",
      traceId: "追踪 ID",
      openProof: "打开授权证明",
      empty:
        "提交这条模拟请求，查看 SubGuardian 会在付款、续费或付费 API 调用前返回 allow、pause、reject 还是 ask_user。",
      errors: {
        requestFailed: "Agent 花费检查失败。"
      },
      yes: "是",
      no: "否"
    },
    agentPositioning: {
      title: "生产环境如何接入？",
      bullets: [
        "AI Agent 在调用付费 API、购买工具、续费订阅前，先请求 SubGuardian。",
        "SubGuardian 根据预算、审批阈值、历史使用信号和策略判断是否允许。",
        "接口返回 allow / pause / reject / ask_user。",
        "结果可以生成 proof，并记录到 0G Storage / 0G Chain。"
      ],
      codeTitle: "API 示例",
      latestCheck: "最近一次 Agent 检查",
      to: "到"
    },
    analysis: {
      title: "0G Compute 分析",
      eyebrow: "AI 续费决策代理",
      analyzeButton: "使用 0G Compute 分析",
      risk: "风险",
      renewalRisk: "续费风险",
      budgetStatus: "预算状态",
      budgetPressure: "预算压力",
      preSpendResult: "花费前授权结果",
      preSpendBody: "Agent 的续费、付费 API 调用或工具购买都会在花费前被检查，并为每个服务计算预算压力、续费风险、预计节省和下一步动作。",
      tee: "TEE",
      verified: "已验证",
      notVerified: "模拟 / 未验证",
      riskSaving: "风险分 {score} | 可节省 {saving}",
      estimatedSaving: "预计可节省",
      approval: "审批",
      approvalRequired: "需要",
      approvalNotRequired: "不需要",
      nextAction: "下一步动作",
      nextActions: "下一步动作",
      traceId: "追踪 ID",
      empty: "运行分析后，订阅记录和策略会生成可验证的续费建议。"
    },
    storage: {
      title: "0G Storage",
      eyebrow: "加密订阅记忆",
      uploadButton: "上传加密档案",
      encrypted: "AES-GCM 已加密",
      mockMode: "模拟模式",
      liveMode: "实时 0G 模式",
      storageRootHash: "存储根哈希",
      payloadSize: "载荷大小",
      algorithm: "算法",
      bytes: "字节",
      empty: "上传会在客户端/API 加密后进行，因此原始订阅数据不会以明文存储。"
    },
    chain: {
      title: "0G Chain 注册表",
      eyebrow: "可验证的续费决策",
      contractAddress: "合约地址",
      latestStorageRoot: "最新存储根",
      analysisHash: "分析哈希",
      addSubscription: "添加订阅",
      recordAnalysis: "记录分析",
      recordDecision: "记录决策",
      onChainSubscriptionId: "链上订阅 ID",
      decisionToRecord: "待记录决策",
      latestTransactionHash: "最新交易哈希",
      openExplorer: "在 0G Explorer 中打开",
      explorerBase: "浏览器基础地址",
      placeholders: {
        contractAddress: "部署后设置 NEXT_PUBLIC_CONTRACT_ADDRESS",
        storageRoot: "请先上传加密档案",
        analysisHash: "请先运行分析",
        txHash: "暂无交易"
      }
    },
    proof: {
      back: "返回 Dashboard",
      eyebrow: "SubGuardian 授权证明",
      title: "AI Agent 花费防火墙授权",
      body: "这份收据记录了 AI Agent 在续费订阅、调用付费 API 或购买工具点数前必须通过的花费前检查。",
      fields: {
        agentId: "Agent ID",
        serviceName: "服务名称",
        amount: "金额",
        decision: "决策",
        riskScore: "风险分",
        requiresApproval: "需要用户审批",
        reason: "原因",
        policySummary: "策略摘要",
        analysisHash: "分析哈希",
        storageRootHash: "存储根哈希",
        chainTxHash: "0G Chain 交易哈希",
        mockChainCommitment: "模拟链上承诺哈希",
        chainStatus: "链上状态",
        explorerLink: "0G Explorer 链接",
        createdTime: "创建时间",
        traceId: "追踪 ID",
        proofId: "证明 ID"
      },
      noExplorer: "暂无 Explorer 链接。",
      mockChainNotice: "当前 Agent 证明处于确定性模拟模式。下方哈希只是本地承诺，不是真正提交到 0G Chain 的交易，所以 0G Explorer 查不到它。",
      chainRecorded: "已记录到 0G Chain",
      notRecorded: "未记录到 0G Chain",
      missing: "没有找到这个 ID 对应的本地证明。请先在 Dashboard 运行一次 Agent 花费防火墙检查，再打开证明页。"
    },
    errors: {
      analyzeRequestFailed: "分析请求失败。",
      storageUploadRequestFailed: "存储上传请求失败。",
      noSubscription: "没有可记录的订阅。",
      missingContract: "写入 0G Chain 前请先设置 NEXT_PUBLIC_CONTRACT_ADDRESS。",
      addSubscriptionTxFailed: "添加订阅交易失败。",
      addSubscriptionFirst: "请先在链上添加订阅。",
      runAnalysisFirst: "请先运行 AI 分析。",
      runAnalysisBeforeDecision: "记录决策前请先运行 AI 分析。",
      recordAnalysisTxFailed: "记录分析交易失败。",
      recordDecisionTxFailed: "记录决策交易失败。"
    },
    values: {
      pending: "待处理",
      decision: {
        allow: "允许",
        renew: "续费",
        pause: "暂停",
        reject: "拒绝",
        ask_user: "人工确认"
      },
      decisionOption: {
        renew: "续费",
        pause: "暂停",
        reject: "拒绝",
        ask_user: "询问用户"
      },
      riskLevel: {
        low: "低",
        medium: "中",
        high: "高"
      },
      budgetStatus: {
        under_budget: "低于预算",
        near_limit: "接近上限",
        over_budget: "超出预算"
      },
      authorizationDecision: {
        allow: "allow",
        pause: "pause",
        reject: "reject",
        ask_user: "ask_user"
      },
      usageSignal: {
        high: "高",
        medium: "中",
        low: "低",
        unknown: "未知 / 风险较高",
        high_usage: "高使用",
        medium_usage: "中等使用",
        low_usage: "低使用",
        unknown_usage: "未知使用 / 高风险"
      },
      billingCycle: {
        monthly: "月付",
        yearly: "年付"
      },
      category: {
        "AI Tool": "AI 工具",
        "Web3 Infra": "Web3 基础设施",
        SaaS: "SaaS",
        API: "API",
        Other: "其他"
      }
    }
  }
} as const;

export type Translation = (typeof translations)[Language];

const zhDisplayText: Record<string, string> = {
  "Daily coding, research, product writing. Strong renewal candidate.": "日常编码、研究和产品写作都会用到，是强续费候选。",
  "Rarely used this month; keep only if design sprint is active.": "本月很少使用；只有在设计冲刺进行中才建议保留。",
  "Primary IDE and code assistant.": "主要 IDE 和代码助手。",
  "Useful for docs, but overlaps with other AI tools.": "对文档有帮助，但与其他 AI 工具有重叠。",
  "Prototype API no longer used in production.": "原型 API 已不再用于生产环境。",
  "High usage and clear workflow value. Renewal is justified under the current policy.":
    "使用率高且对工作流价值明确，按当前策略续费是合理的。",
  "Low usage with material monthly cost. Treat this as a renewal firewall block.":
    "使用率低且月成本较高，应作为续费防火墙拦截项处理。",
  "Usage is too low for automatic renewal. Pause and revisit if the service becomes active again.":
    "使用率过低，不适合自动续费。建议暂停，等服务重新活跃后再评估。",
  "Moderate value or policy threshold hit. Human confirmation is required before renewal.":
    "价值中等或触发策略阈值，续费前需要人工确认。",
  "No critical issue detected, so the policy default action is applied.": "未发现关键问题，因此应用策略中的默认动作。",
  "Upload the encrypted subscription profile to 0G Storage.": "将加密订阅档案上传到 0G Storage。",
  "Record the AI analysis hash and selected renewal decision on 0G Chain.": "将 AI 分析哈希和选定的续费决策记录到 0G Chain。",
  "No immediate savings action is required.": "当前无需立即执行节省成本的操作。",
  "Upload the encrypted spending profile to 0G Storage.": "将加密花费档案上传到 0G Storage。",
  "Record the AI analysis hash and selected authorization decision on 0G Chain.": "将 AI 分析哈希和选定的授权决策记录到 0G Chain。",
  "Allow the renewal and record the analysis hash for audit.": "允许续费，并记录分析哈希用于审计。",
  "Block the renewal unless the user creates a new policy exception.": "阻止续费，除非用户创建新的策略例外。",
  "Hold the agent payment and ask the user whether this tool is still needed.": "暂停 Agent 支付，并询问用户这个工具是否仍然需要。",
  "Request user approval before any wallet, API, or renewal spend.": "在任何钱包、API 或续费支出前请求用户审批。",
  "Allow the renewal under policy default.": "按策略默认值允许续费。",
  "Pause and ask the user to confirm this spend.": "暂停并请求用户确认这笔支出。",
  "Allow the agent to continue the renewal and keep the proof hash for audit.": "允许 Agent 继续续费，并保留证明哈希用于审计。",
  "Block the agent payment and ask the user to create a new exception if the spend is still needed.": "阻止 Agent 支付；如果仍需支出，请用户创建新的例外。",
  "Hold the agent payment and request explicit user approval before any wallet or API spend.": "暂停 Agent 支付，并在任何钱包或 API 支出前请求用户明确审批。",
  "Pause the renewal and re-check usage before the next billing cycle.": "暂停续费，并在下个计费周期前重新检查使用情况。",
  "Request explicit user approval before spending.": "支出前请求用户明确审批。",
  "Loaded from URL parameters.": "从 URL 参数读取。",
  "Policy loaded from URL parameters.": "从 URL 参数读取的策略。"
};

export function localizeDisplayText(text: string | undefined, language: Language) {
  if (!text || language === "en") {
    return text || "";
  }

  const exact = zhDisplayText[text];
  if (exact) {
    return exact;
  }

  const summaryMatch = text.match(
    /^SubGuardian found (\d+) subscriptions that should be paused, rejected, or manually reviewed before renewal\.$/
  );
  if (summaryMatch) {
    return `SubGuardian 发现 ${summaryMatch[1]} 个订阅应在续费前暂停、拒绝或人工复核。`;
  }

  const savingsMatch = text.match(/^Potential monthly savings: ([\d.]+) USDT\.$/);
  if (savingsMatch) {
    return `潜在月度节省：${savingsMatch[1]} USDT。`;
  }

  const preSpendPassed = text.match(
    /^Pre-spend authorization passed\. Usage signal is strong, budget pressure is (.+), and the ([\d.]+) ([A-Z]+) renewal can proceed under policy\.$/
  );
  if (preSpendPassed) {
    return `花费前授权已通过。使用信号较强，预算压力为${translateLooseStatus(preSpendPassed[1])}，这笔 ${preSpendPassed[2]} ${preSpendPassed[3]} 的续费可按策略继续。`;
  }

  const askUser = text.match(/^Pre-spend authorization needs explicit user approval before the agent can spend\. (.+)\.$/);
  if (askUser) {
    return `花费前授权需要用户明确审批，Agent 才能支出。${translateSignalList(askUser[1])}。`;
  }

  const blocked = text.match(/^Pre-spend authorization blocked\. (.+) makes this renewal unsafe without a new policy exception\.$/);
  if (blocked) {
    return `花费前授权已阻止。${translateSignalList(blocked[1])}，没有新的策略例外时，这次续费不安全。`;
  }

  const paused = text.match(/^Low usage and budget pressure\. This renewal should be paused unless the user explicitly approves it\. Signals: (.+)\.$/);
  if (paused) {
    return `使用率偏低且存在预算压力。除非用户明确批准，否则这次续费应暂停。信号：${translateSignalList(paused[1])}。`;
  }

  const preSpendSummary = text.match(
    /^Pre-spend authorization result: SubGuardian found (\d+) renewals that an AI agent should pause, block, or manually confirm before spending\.$/
  );
  if (preSpendSummary) {
    return `花费前授权结果：SubGuardian 发现 ${preSpendSummary[1]} 个续费项应在 Agent 支出前暂停、阻止或人工确认。`;
  }

  const policySummary = text.match(/^Monthly budget: ([\d.]+) ([A-Z]+), manual approval above ([\d.]+) ([A-Z]+)$/);
  if (policySummary) {
    return `月度预算：${policySummary[1]} ${policySummary[2]}，超过 ${policySummary[3]} ${policySummary[4]} 需人工审批`;
  }

  return text;
}

function translateSignalList(value: string) {
  return value
    .replace(/low usage/g, "使用率低")
    .replace(/over budget pressure/g, "预算超额压力")
    .replace(/near limit pressure/g, "接近预算上限")
    .replace(/under budget pressure/g, "低于预算")
    .replace(/manual approval threshold hit/g, "触发人工审批阈值")
    .replace(/unclear business reason/g, "业务原因不清晰")
    .replace(/Policy requires a human checkpoint/g, "策略要求人工检查点")
    .replace(/The request is too risky/g, "请求风险过高")
    .replace(/policy checkpoint/g, "策略检查点");
}

function translateLooseStatus(value: string) {
  return value
    .replace(/over budget/g, "超出预算")
    .replace(/near limit/g, "接近预算上限")
    .replace(/under budget/g, "低于预算");
}
