import { Language } from "./i18n";

export const productCopy = {
  en: {
    common: {
      appTagline: "Wallet spending control SaaS",
      live0GChain: "Live 0G Chain",
      storageComputeLabeled: "Storage/Compute labeled by config",
      siweSession: "SIWE session",
      realWalletData: "Real wallet data",
      limitedRpcFallback: "Limited RPC fallback",
      loading: "Loading...",
      refresh: "Refresh",
      manage: "Manage",
      review: "Review",
      open: "Open",
      audit: "Audit",
      proof: "Proof",
      notSet: "not set"
    },
    nav: {
      overview: "Overview",
      policies: "Policies",
      subscriptions: "Subscriptions",
      approvals: "Approvals",
      wallet: "Wallet",
      audit: "Audit",
      developers: "Developers",
      settings: "Settings"
    },
    home: {
      title: "Web3 wallet autopay control",
      body:
        "Connect your wallet, sign in, review recurring approvals, set spending policies, and require agents or merchants to ask SubGuardian before spending. SubGuardian is not a custodian and does not store private keys.",
      badges: {
        chain: "Live 0G Chain audit supported",
        mock: "Mock Storage/Compute labeled when fallback",
        eoa: "EOA limits documented honestly"
      },
      openDashboard: "Open Dashboard",
      developerDemo: "Developer Demo",
      signInTitle: "Sign in with wallet",
      signInBody:
        "Connect Wallet only exposes an address. Sign-In with Ethereum creates a server session so user-level APIs can enforce wallet ownership.",
      features: [
        {
          title: "Wallet dashboard",
          body: "Overview, wallet scan, approvals, recurring spend, risk alerts, and monthly spend summary."
        },
        {
          title: "Policy engine",
          body: "Budgets, single-spend caps, daily/weekly/monthly limits, whitelists, blacklists, and emergency pause."
        },
        {
          title: "Pre-spend API",
          body: "Merchants and agents call authorization before payment; ask_user requests enter the dashboard."
        },
        {
          title: "Audit trail",
          body: "Proofs include analysis hash, storage root, policy hash, optional chain txHash, signer, and live/mock labels."
        }
      ]
    },
    walletAuth: {
      signIn: "Sign in",
      signing: "Signing...",
      sessionActive: "Session active",
      adding: "Adding...",
      addZeroG: "Add 0G Mainnet to MetaMask",
      nonceFailed: "Failed to create login challenge.",
      verifyFailed: "Failed to verify wallet login.",
      signInFailed: "Failed to sign in with wallet.",
      addNetworkFailed: "Failed to add 0G Mainnet to MetaMask."
    },
    dashboard: {
      loadingTitle: "Loading wallet dashboard",
      loadingBody: "Connect wallet and sign the login message if this keeps waiting.",
      sessionRequired: "Wallet session required",
      openProductEntry: "Open product entry",
      loadFailed: "Failed to load dashboard.",
      eyebrow: "Wallet Overview",
      boundary:
        "SubGuardian is a pre-spend authorization layer. It does not custody assets and cannot automatically stop every EOA transaction you sign yourself.",
      metrics: {
        monthlyAllowedSpend: "Monthly allowed spend",
        pendingApprovals: "Pending approvals",
        highRiskApprovals: "High-risk approvals",
        auditRecords: "Audit records"
      },
      riskAlerts: "Risk alerts",
      activePolicies: "Active Spending Policies",
      pendingSpendRequests: "Pending Spend Requests",
      noPendingApprovals: "No pending approvals. Merchant and agent requests that need the user will appear here.",
      detectedSubscriptions: "Detected Subscriptions / Recurring Approvals",
      noSubscriptions: "No recurring approval patterns indexed yet. Scan wallet data to update this section.",
      recentDecisions: "Recent Decisions",
      riskPrefix: "Risk",
      noDecisions: "No pre-spend decisions yet."
    },
    policy: {
      eyebrow: "Policy Dashboard",
      title: "Spending policy",
      body:
        "Policies are stored server-side for your signed-in wallet. Agent and merchant APIs evaluate this record instead of trusting front-end wallet fields.",
      loadFailed: "Failed to load policy.",
      saveFailed: "Failed to save policy.",
      saved: "Policy saved.",
      fields: {
        monthlyBudget: "Monthly budget",
        singleSpendCap: "Single spend cap",
        manualApprovalAbove: "Manual approval above",
        autoAllowBelow: "Auto-allow below",
        dailyLimit: "Daily limit",
        weeklyLimit: "Weekly limit",
        monthlyLimit: "Monthly limit",
        unknownServiceDefault: "Unknown service default",
        policyDefault: "Policy default",
        whitelist: "Auto-allow whitelist",
        blacklist: "Block blacklist"
      },
      save: "Save policy",
      saving: "Saving...",
      enablePause: "Emergency pause all",
      disablePause: "Disable emergency pause",
      stateTitle: "Policy state",
      pauseEnabled: "Emergency pause enabled",
      normalAuthorization: "Normal authorization",
      stateBody:
        "Agent-specific and merchant-specific policy maps are stored in the policy object and evaluated by the API. The UI exposes the global controls first.",
      smartAccountNote:
        "Smart account / Safe guard enforcement is a planned on-chain module. For EOAs, SubGuardian provides pre-spend API control, alerts, and revoke guidance."
    },
    listPages: {
      subscriptions: {
        eyebrow: "Recurring spend detection",
        title: "Subscriptions",
        body: "Detected recurring approvals are clustered from wallet approval and transaction signals when available. Fallback data is clearly labeled.",
        spender: "spender",
        empty: "No recurring spend patterns indexed yet. Use Wallet Scan first."
      },
      approvals: {
        eyebrow: "ask_user workflow",
        title: "Pending Approvals",
        body:
          "Merchant and agent requests that require human approval appear here. Approve or reject changes the stored decision; integrations should re-check before spending.",
        approve: "Approve",
        reject: "Reject",
        spender: "spender",
        empty: "No pending spend requests."
      },
      wallet: {
        eyebrow: "Approvals and revoke guidance",
        title: "Wallet",
        body: "SubGuardian never stores private keys. Revokes must be signed by your wallet; this page indexes approvals and flags risk.",
        scan: "Scan wallet",
        walletLabel: "Wallet",
        balance: "Balance",
        approval: "approval",
        spender: "spender",
        allowance: "allowance",
        revokeNote:
          "Revoke requires a user-signed token approval transaction setting allowance to 0. SubGuardian can guide or initiate that transaction; it cannot sign for you.",
        empty: "No ERC20 approvals indexed. Configure SUBGUARDIAN_KNOWN_APPROVALS or connect an indexer for full history."
      },
      audit: {
        eyebrow: "Proof and 0G records",
        title: "Audit",
        body: "API proof, chain record, storage root, and compute mode are shown separately so mock/live states are never blurred.",
        recentProofs: "Recent API Proofs",
        chainRecords: "0G Chain Records",
        explorer: "Explorer",
        empty: "No wallet-signed 0G Chain records saved yet."
      },
      loadFailed: "Failed to load dashboard data."
    },
    developers: {
      eyebrow: "Merchant / Agent Integration",
      title: "Developer portal",
      body:
        "Register an agent or merchant, create API keys, and call the pre-spend authorization API before initiating payment. Webhook signatures are documented and reserved in the data model.",
      signInError: "Sign in to manage merchant keys.",
      createMerchantFailed: "Failed to create merchant.",
      createKeyFailed: "Failed to create API key.",
      newKey: "New API key",
      keyWarning: "This is shown once. The server stores only a hash.",
      register: "Register merchant",
      name: "Name",
      agentId: "Agent ID",
      webhookUrl: "Webhook URL",
      createMerchant: "Create merchant",
      registered: "Registered integrations",
      createApiKey: "Create API key",
      noMerchants: "No merchant integrations yet."
    },
    settings: {
      eyebrow: "Settings",
      title: "Production readiness",
      body: "Runtime labels are explicit. Mock fallback is never presented as live infrastructure.",
      chainStatus: "Live contract configured",
      chainBody: "Wallet-signed chain records can be linked to decision proofs. API proof alone does not imply an on-chain write.",
      mockFallback: "Mock fallback",
      liveEncryptedUpload: "Live encrypted upload",
      storageBody: "Sensitive policy and decision snapshots are encrypted before upload. A dedicated server signer is required for live storage.",
      liveVerifyTee: "Live verify_tee",
      computeBody: "Live compute requests include verify_tee: true and keep credentials server-side.",
      apiTitle: "API authentication",
      globalApiKeySet: "Global API key set",
      localDevFallback: "Local dev fallback",
      apiBody: "Production merchant calls must use merchant API keys or a configured server API key.",
      boundaryTitle: "Wallet control boundary",
      boundaryBody:
        "For ordinary EOA wallets, SubGuardian cannot block transactions the user signs directly. It controls integrated agents and merchants through the authorization API, provides alerts and revoke guidance, and can be extended with Safe/account-abstraction guards.",
      manageIntegrations: "Manage developer integrations"
    }
  },
  zh: {
    common: {
      appTagline: "钱包支出控制 SaaS",
      live0GChain: "0G Chain 实时记录",
      storageComputeLabeled: "Storage/Compute 按配置标识",
      siweSession: "钱包签名会话",
      realWalletData: "真实钱包数据",
      limitedRpcFallback: "受限 RPC 回退",
      loading: "加载中...",
      refresh: "刷新",
      manage: "管理",
      review: "审核",
      open: "打开",
      audit: "审计",
      proof: "证明",
      notSet: "未设置"
    },
    nav: {
      overview: "总览",
      policies: "策略",
      subscriptions: "订阅",
      approvals: "审批",
      wallet: "钱包",
      audit: "审计",
      developers: "开发者",
      settings: "设置"
    },
    home: {
      title: "Web3 钱包自动扣费控制",
      body:
        "连接钱包并签名登录后，你可以查看周期性授权、设置支出策略，并要求 Agent 或商户在付款前先请求 SubGuardian 授权。SubGuardian 不托管资产，也不保存私钥。",
      badges: {
        chain: "支持实时 0G Chain 审计",
        mock: "Storage/Compute 回退时明确标为模拟",
        eoa: "诚实说明 EOA 控制边界"
      },
      openDashboard: "打开控制台",
      developerDemo: "开发者 Demo",
      signInTitle: "使用钱包登录",
      signInBody: "Connect Wallet 只暴露地址。以太坊签名登录会创建服务端会话，让用户级 API 能校验钱包所有权。",
      features: [
        {
          title: "钱包控制台",
          body: "总览、钱包扫描、授权、周期性支出、风险提醒和月度支出摘要。"
        },
        {
          title: "策略引擎",
          body: "预算、单笔上限、日/周/月限额、白名单、黑名单和紧急暂停。"
        },
        {
          title: "花费前 API",
          body: "商户和 Agent 付款前调用授权接口；ask_user 请求进入用户控制台。"
        },
        {
          title: "审计轨迹",
          body: "证明包含分析哈希、存储根、策略哈希、可选链上 txHash、签名钱包和 live/mock 标识。"
        }
      ]
    },
    walletAuth: {
      signIn: "签名登录",
      signing: "签名中...",
      sessionActive: "会话已生效",
      adding: "添加中...",
      addZeroG: "添加 0G Mainnet 到 MetaMask",
      nonceFailed: "创建登录挑战失败。",
      verifyFailed: "验证钱包登录失败。",
      signInFailed: "钱包签名登录失败。",
      addNetworkFailed: "添加 0G Mainnet 到 MetaMask 失败。"
    },
    dashboard: {
      loadingTitle: "正在加载钱包控制台",
      loadingBody: "如果一直等待，请先连接钱包并签署登录消息。",
      sessionRequired: "需要钱包会话",
      openProductEntry: "打开产品入口",
      loadFailed: "加载控制台失败。",
      eyebrow: "钱包总览",
      boundary: "SubGuardian 是花费前授权层。它不托管资产，也不能自动阻止你自己用 EOA 钱包签署的每一笔交易。",
      metrics: {
        monthlyAllowedSpend: "月度已允许支出",
        pendingApprovals: "待审批请求",
        highRiskApprovals: "高风险授权",
        auditRecords: "审计记录"
      },
      riskAlerts: "风险提醒",
      activePolicies: "当前支出策略",
      pendingSpendRequests: "待处理花费请求",
      noPendingApprovals: "暂无待审批请求。需要用户确认的商户和 Agent 请求会出现在这里。",
      detectedSubscriptions: "检测到的订阅 / 周期性授权",
      noSubscriptions: "尚未索引到周期性授权模式。请扫描钱包数据来更新此区域。",
      recentDecisions: "最近决策",
      riskPrefix: "风险",
      noDecisions: "暂无花费前决策。"
    },
    policy: {
      eyebrow: "策略控制台",
      title: "支出策略",
      body: "策略会按你的签名钱包保存在服务端。Agent 和商户 API 会评估这份记录，而不是信任前端传入的钱包字段。",
      loadFailed: "加载策略失败。",
      saveFailed: "保存策略失败。",
      saved: "策略已保存。",
      fields: {
        monthlyBudget: "月度预算",
        singleSpendCap: "单笔支出上限",
        manualApprovalAbove: "超过该金额需人工审批",
        autoAllowBelow: "低于该金额自动允许",
        dailyLimit: "每日限额",
        weeklyLimit: "每周限额",
        monthlyLimit: "每月限额",
        unknownServiceDefault: "未知服务默认策略",
        policyDefault: "策略默认动作",
        whitelist: "自动允许白名单",
        blacklist: "阻止黑名单"
      },
      save: "保存策略",
      saving: "保存中...",
      enablePause: "紧急暂停全部支出",
      disablePause: "关闭紧急暂停",
      stateTitle: "策略状态",
      pauseEnabled: "紧急暂停已开启",
      normalAuthorization: "正常授权",
      stateBody: "Agent-specific 和 merchant-specific 策略映射保存在 policy 对象中，并由 API 评估。当前 UI 先暴露全局控制项。",
      smartAccountNote: "智能账户 / Safe guard 执行属于计划中的链上模块。对于 EOA，SubGuardian 提供花费前 API 控制、提醒和撤销指引。"
    },
    listPages: {
      subscriptions: {
        eyebrow: "周期性支出识别",
        title: "订阅",
        body: "在可用时，系统会根据钱包授权和交易信号聚类周期性授权。回退数据会被明确标识。",
        spender: "支出方",
        empty: "尚未索引到周期性支出模式。请先使用钱包扫描。"
      },
      approvals: {
        eyebrow: "ask_user 流程",
        title: "待审批",
        body: "需要人工确认的商户和 Agent 请求会出现在这里。批准或拒绝会更新已存储决策，集成方应在付款前重新检查。",
        approve: "批准",
        reject: "拒绝",
        spender: "支出方",
        empty: "暂无待处理花费请求。"
      },
      wallet: {
        eyebrow: "授权与撤销指引",
        title: "钱包",
        body: "SubGuardian 从不保存私钥。撤销必须由你的钱包签名；本页会索引授权并标记风险。",
        scan: "扫描钱包",
        walletLabel: "钱包",
        balance: "余额",
        approval: "授权",
        spender: "支出方",
        allowance: "授权额度",
        revokeNote: "撤销需要用户签署一笔将 allowance 设为 0 的 token approval 交易。SubGuardian 可以指引或发起该交易，但不能替你签名。",
        empty: "尚未索引到 ERC20 授权。可配置 SUBGUARDIAN_KNOWN_APPROVALS 或接入 indexer 获取完整历史。"
      },
      audit: {
        eyebrow: "证明与 0G 记录",
        title: "审计",
        body: "API proof、链上记录、存储根和计算模式会分开展示，避免混淆 mock/live 状态。",
        recentProofs: "最近 API 证明",
        chainRecords: "0G Chain 记录",
        explorer: "浏览器",
        empty: "暂无用户钱包签名的 0G Chain 记录。"
      },
      loadFailed: "加载控制台数据失败。"
    },
    developers: {
      eyebrow: "商户 / Agent 集成",
      title: "开发者门户",
      body: "注册 Agent 或商户、创建 API key，并在发起付款前调用花费前授权 API。Webhook 签名已在数据模型中预留并在文档中说明。",
      signInError: "请先登录以管理商户密钥。",
      createMerchantFailed: "创建商户失败。",
      createKeyFailed: "创建 API key 失败。",
      newKey: "新的 API key",
      keyWarning: "该密钥只显示一次。服务端只保存哈希。",
      register: "注册商户",
      name: "名称",
      agentId: "Agent ID",
      webhookUrl: "Webhook URL",
      createMerchant: "创建商户",
      registered: "已注册集成",
      createApiKey: "创建 API key",
      noMerchants: "暂无商户集成。"
    },
    settings: {
      eyebrow: "设置",
      title: "生产就绪状态",
      body: "运行模式标签会明确展示。Mock fallback 不会被说成 live 基础设施。",
      chainStatus: "实时合约已配置",
      chainBody: "用户钱包签名的链上记录可以关联到决策证明。仅有 API proof 不代表已经写链。",
      mockFallback: "模拟回退",
      liveEncryptedUpload: "实时加密上传",
      storageBody: "敏感策略和决策快照会先加密再上传。实时 storage 需要专用服务端签名钱包。",
      liveVerifyTee: "实时 verify_tee",
      computeBody: "实时 compute 请求包含 verify_tee: true，并且凭证只保存在服务端。",
      apiTitle: "API 鉴权",
      globalApiKeySet: "已设置全局 API key",
      localDevFallback: "本地开发回退",
      apiBody: "生产环境中的商户调用必须使用 merchant API key 或已配置的服务端 API key。",
      boundaryTitle: "钱包控制边界",
      boundaryBody:
        "对于普通 EOA 钱包，SubGuardian 不能阻止用户自己签名的交易。它通过授权 API 控制已接入的 Agent 和商户，提供提醒和撤销指引，并可扩展到 Safe/account-abstraction guard。",
      manageIntegrations: "管理开发者集成"
    }
  }
} as const;

export type ProductCopy = (typeof productCopy)[Language];

export function getProductCopy(language: Language) {
  return productCopy[language];
}
