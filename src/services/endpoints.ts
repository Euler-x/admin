const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  // Auth (same JWT system)
  AUTH: {
    SIGN_MESSAGE: `${API}/auth/sign-message`,
    CONNECT: `${API}/auth/connect`,
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
  },

  // Admin System
  SYSTEM: {
    HEALTH: `${API}/admin/system/health`,
    PIPELINE: `${API}/admin/system/pipeline`,
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
