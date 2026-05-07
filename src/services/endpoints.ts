const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API}/auth/login`,
    REFRESH: `${API}/auth/refresh`,
    ME: `${API}/auth/me`,
  },

  // Admin Users
  USERS: {
    LIST: `${API}/admin/users`,
    GET: (id: string) => `${API}/admin/users/${id}`,
    UPDATE: (id: string) => `${API}/admin/users/${id}`,
    TOGGLE_ADMIN: (id: string) => `${API}/admin/users/${id}/toggle-admin`,
    TOGGLE_ACTIVE: (id: string) => `${API}/admin/users/${id}/toggle-active`,
  },

  // Admin Plans
  PLANS: {
    LIST: `${API}/admin/plans`,
    CREATE: `${API}/admin/plans`,
    UPDATE: (id: string) => `${API}/admin/plans/${id}`,
    DELETE: (id: string) => `${API}/admin/plans/${id}`,
  },

  // Admin Content
  CONTENT: {
    LIST: `${API}/admin/content`,
    CREATE: `${API}/admin/content`,
    UPDATE: (id: string) => `${API}/admin/content/${id}`,
    DELETE: (id: string) => `${API}/admin/content/${id}`,
  },

  // Admin Tickets
  TICKETS: {
    LIST: `${API}/admin/tickets`,
    GET: (id: string) => `${API}/admin/tickets/${id}`,
    UPDATE_STATUS: (id: string) => `${API}/admin/tickets/${id}/status`,
    REPLY: (id: string) => `${API}/admin/tickets/${id}/reply`,
  },

  // Admin Trading
  TRADING: {
    STATUS: `${API}/admin/trading/status`,
    HALT: `${API}/admin/trading/halt`,
    RESUME: `${API}/admin/trading/resume`,
  },

  // Admin Audit Logs
  AUDIT_LOGS: {
    LIST: `${API}/admin/audit-logs`,
    GET: (id: string) => `${API}/admin/audit-logs/${id}`,
  },

  // Admin Executions
  EXECUTIONS: {
    LIST: `${API}/admin/executions`,
    GET: (id: string) => `${API}/admin/executions/${id}`,
    CLOSE: (id: string) => `${API}/admin/executions/${id}/close`,
  },

  // Admin Transactions
  TRANSACTIONS: {
    LIST: `${API}/admin/transactions`,
    GET: (id: string) => `${API}/admin/transactions/${id}`,
  },

  // Admin Signals
  SIGNALS: {
    LIST: `${API}/admin/signals`,
    GET: (id: string) => `${API}/admin/signals/${id}`,
    CANCEL: (id: string) => `${API}/admin/signals/${id}/cancel`,
  },

  BYBIT_SIGNALS: {
    LIST: `${API}/admin/bybit-signals`,
    GET: (id: string) => `${API}/admin/bybit-signals/${id}`,
    CANCEL: (id: string) => `${API}/admin/bybit-signals/${id}/cancel`,
  },

  BINANCE_SIGNALS: {
    LIST: `${API}/admin/binance-signals`,
    GET: (id: string) => `${API}/admin/binance-signals/${id}`,
    CANCEL: (id: string) => `${API}/admin/binance-signals/${id}/cancel`,
  },

  // Admin Strategies
  STRATEGIES: {
    LIST: `${API}/admin/strategies`,
    GET: (id: string) => `${API}/admin/strategies/${id}`,
    UPDATE: (id: string) => `${API}/admin/strategies/${id}`,
    DEACTIVATE: (id: string) => `${API}/admin/strategies/${id}/deactivate`,
    DELETE: (id: string) => `${API}/admin/strategies/${id}`,
  },

  // Admin Subscriptions
  SUBSCRIPTIONS: {
    LIST: `${API}/admin/subscriptions`,
    CREATE: `${API}/admin/subscriptions`,
    OVERRIDE: (id: string) => `${API}/admin/subscriptions/${id}`,
    CANCEL: (id: string) => `${API}/admin/subscriptions/${id}`,
  },

  // Admin Ambassadors
  AMBASSADORS: {
    LIST: `${API}/admin/ambassadors`,
    GET: (id: string) => `${API}/admin/ambassadors/${id}`,
    UPDATE: (id: string) => `${API}/admin/ambassadors/${id}`,
    PROMOTE: (id: string) => `${API}/admin/ambassadors/${id}/promote`,
    EVALUATE_RANK: (id: string) => `${API}/admin/ambassadors/${id}/evaluate-rank`,
    EVALUATE_ALL: `${API}/admin/ambassadors/evaluate-all`,
    CREATE_BONUS: (id: string) => `${API}/admin/ambassadors/${id}/bonus`,
    UPDATE_BONUS: (id: string, bonusId: string) => `${API}/admin/ambassadors/${id}/bonuses/${bonusId}`,
    PAYOUT: (id: string) => `${API}/admin/ambassadors/${id}/payout`,
    CANCEL_PAYOUT: (id: string, payoutId: string) => `${API}/admin/ambassadors/${id}/payouts/${payoutId}`,
    TRAVEL_LIST: (id: string) => `${API}/admin/ambassadors/${id}/travel`,
    TRAVEL_UPDATE: (id: string, incentiveId: string) => `${API}/admin/ambassadors/${id}/travel/${incentiveId}`,
    TRAINING_LIST: (id: string) => `${API}/admin/ambassadors/${id}/training`,
    TRAINING_COMPLETE: (id: string, module: string) => `${API}/admin/ambassadors/${id}/training/${module}/complete`,
    TRAINING_REMOVE: (id: string, module: string) => `${API}/admin/ambassadors/${id}/training/${module}`,
    ACTIVITY: (id: string) => `${API}/admin/ambassadors/${id}/activity`,
    DOWNLINE: (id: string) => `${API}/admin/ambassadors/${id}/downline`,
    COMMISSIONS: (id: string) => `${API}/admin/ambassadors/${id}/commissions`,
    UPDATE_COMMISSION: (id: string, commissionId: string) => `${API}/admin/ambassadors/${id}/commissions/${commissionId}`,
    PAYOUTS_LIST: (id: string) => `${API}/admin/ambassadors/${id}/payouts`,
    PAYOUTS: `${API}/admin/ambassadors/payouts`,
    PAYOUT_DETAIL: (payoutId: string) => `${API}/admin/ambassadors/payouts/${payoutId}`,
    UPDATE_PAYOUT: (payoutId: string) => `${API}/admin/ambassadors/payouts/${payoutId}`,
    BULK_UPDATE_PAYOUTS: `${API}/admin/ambassadors/payouts/bulk-update`,
    BULK_APPROVE_COMMISSIONS: `${API}/admin/ambassadors/commissions/bulk-approve`,
    GLOBAL_ACTIVITY: `${API}/admin/ambassadors/activity`,
    GLOBAL_COMMISSIONS: `${API}/admin/ambassadors/commissions`,
    GLOBAL_BONUSES: `${API}/admin/ambassadors/bonuses`,
    GLOBAL_TRAVEL: `${API}/admin/ambassadors/travel`,
    GLOBAL_TRAINING: `${API}/admin/ambassadors/training`,
    AMBASSADOR_ANALYTICS: `${API}/admin/ambassadors/analytics`,
    RECALCULATE: `${API}/admin/ambassadors/commissions/recalculate`,
    RUN_CYCLE: `${API}/admin/ambassadors/cycle/run`,
    POOL: `${API}/admin/ambassadors/pool`,
    CALCULATE_POOL: `${API}/admin/ambassadors/pool/calculate`,
  },

  // Admin Analytics (extended)
  ANALYTICS: {
    REVENUE: `${API}/admin/analytics/revenue`,
    USERS: `${API}/admin/analytics/users`,
    EXECUTIONS: `${API}/admin/analytics/executions`,
    DASHBOARD: `${API}/admin/analytics/dashboard`,
    TRADING: `${API}/admin/analytics/trading`,
    SIGNALS: `${API}/admin/analytics/signals`,
    USERS_CHART: `${API}/admin/analytics/users-chart`,
    REVENUE_CHART: `${API}/admin/analytics/revenue-chart`,
    PERFORMANCE: `${API}/admin/analytics/performance`,
  },

  // Admin System
  SETTINGS: {
    LIST: `${API}/admin/settings`,
    SET: (key: string) => `${API}/admin/settings/${key}`,
  },

  SYSTEM: {
    HEALTH: `${API}/admin/system/health`,
    PIPELINE: `${API}/admin/system/pipeline`,
    LOGS: (service: string) => `${API}/admin/system/logs/${service}`,
    TASKS: `${API}/admin/system/tasks`,
    TOGGLE_TASK: (name: string) => `${API}/admin/system/tasks/${name}`,
    SERVICES: `${API}/admin/system/services`,
  },

  // Admin Payments
  PAYMENTS: {
    LIST: `${API}/admin/payments`,
    GET: (id: string) => `${API}/admin/payments/${id}`,
  },

  // Admin Config
  CONFIG: {
    LIST: `${API}/admin/config`,
    GET: (key: string) => `${API}/admin/config/${key}`,
    SET: (key: string) => `${API}/admin/config/${key}`,
    DELETE: (key: string) => `${API}/admin/config/${key}`,
  },
} as const;
