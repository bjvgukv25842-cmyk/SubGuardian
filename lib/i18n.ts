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
      eyebrow: "Mock data and manual input",
      columns: {
        service: "Service",
        category: "Category",
        amount: "Amount",
        cycle: "Cycle",
        usage: "Usage",
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
        usageScore: "Usage Score",
        notes: "Notes"
      },
      addButton: "Add to Firewall Queue",
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
      allowAutoRenew: "Allow auto-renew for high-usage services"
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
    analysis: {
      title: "0G Compute Analysis",
      eyebrow: "AI renewal decision agent",
      analyzeButton: "Analyze with 0G Compute",
      risk: "Risk",
      budgetStatus: "Budget Status",
      tee: "TEE",
      verified: "verified",
      notVerified: "mock / not verified",
      riskSaving: "Risk score {score} | Saving {saving}",
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
      eyebrow: "模拟数据与手动输入",
      columns: {
        service: "服务",
        category: "类别",
        amount: "金额",
        cycle: "周期",
        usage: "使用率",
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
        usageScore: "使用评分",
        notes: "备注"
      },
      addButton: "加入防火墙队列",
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
      allowAutoRenew: "允许高使用率服务自动续费"
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
    analysis: {
      title: "0G Compute 分析",
      eyebrow: "AI 续费决策代理",
      analyzeButton: "使用 0G Compute 分析",
      risk: "风险",
      budgetStatus: "预算状态",
      tee: "TEE",
      verified: "已验证",
      notVerified: "模拟 / 未验证",
      riskSaving: "风险分 {score} | 可节省 {saving}",
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
  "No immediate savings action is required.": "当前无需立即执行节省成本的操作。"
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

  return text;
}
