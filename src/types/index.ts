// ── Enums ──────────────────────────────────────────────────
export type WalletType = "connected" | "generated";
export type StrategyType = "conservative" | "moderate" | "aggressive" | "custom";
export type RiskProfile = "low" | "medium" | "high";
export type SignalDirection = "buy" | "sell" | "hold";
export type SignalStatus = "new" | "executing" | "filled" | "expired" | "cancelled";
export type OrderType = "market" | "limit";
export type ExecutionStatus = "pending" | "filled" | "partially_filled" | "closed" | "cancelled" | "failed";
export type TransactionCategory = "deposit" | "execution" | "subscription" | "reward";
export type TransactionStatus = "pending" | "confirmed" | "failed";
export type SubscriptionStatus = "inactive" | "pending_payment" | "active" | "expiring_soon" | "expired" | "cancelled";
export type PaymentStatus = "waiting" | "confirming" | "confirmed" | "sending" | "partially_paid" | "finished" | "failed" | "refunded" | "expired";
export type PlanStatus = "active" | "inactive" | "archived";
export type BillingCycle = "monthly" | "quarterly" | "yearly";
export type AmbassadorRank =
  | "associate"
  | "bronze_leader"
  | "silver_leader"
  | "gold_leader"
  | "platinum_leader"
  | "diamond_leader"
  | "elite_diamond"
  | "black_diamond"
  | "crown_ambassador"
  | "grand_crown";
export type AmbassadorStatus = "active" | "suspended" | "under_review";
export type ActivityEventType =
  | "registered"
  | "rank_changed"
  | "commission_calculated"
  | "commission_paid"
  | "bonus_awarded"
  | "bonus_paid"
  | "payout_created"
  | "payout_status_changed"
  | "payout_cancelled"
  | "referral_joined"
  | "travel_awarded"
  | "travel_status_changed"
  | "training_completed"
  | "training_removed"
  | "status_changed"
  | "admin_note_added"
  | "pool_calculated";
export type BonusType =
  | "rank_advancement"
  | "performance_milestone"
  | "fast_start"
  | "loyalty_retention"
  | "leadership_pool"
  | "generational_override";
export type CommissionStatus = "pending" | "paid" | "cancelled";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "cancelled";
export type TravelStatus = "qualifying" | "qualified" | "awarded" | "expired";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type ContentCategory = "crypto_basics" | "ai_trading" | "risk_management" | "automated_trading" | "platform_guide";
export type ContentType = "video" | "article" | "pdf";

// ── Auth ───────────────────────────────────────────────────
export interface User {
  id: string;
  wallet_address_hash: string;
  wallet_type: WalletType;
  is_admin: boolean;
  is_active: boolean;
  email: string | null;
  email_verified: boolean;
  telegram_configured: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface SignMessageResponse {
  message: string;
  wallet_address: string;
}

// ── Strategies ─────────────────────────────────────────────
export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  strategy_type: StrategyType;
  risk_profile: RiskProfile;
  leverage_limit: number;
  max_positions: number;
  allocation_pct: number;
  max_drawdown_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStrategyUpdate {
  name?: string;
  risk_profile?: RiskProfile;
  leverage_limit?: number;
  max_positions?: number;
  allocation_pct?: number;
  max_drawdown_percent?: number;
  is_active?: boolean;
}

// ── Signals ────────────────────────────────────────────────
export interface Signal {
  id: string;
  strategy_id: string | null;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  risk_reward_ratio: number | null;
  indicators: Record<string, unknown> | null;
  status: SignalStatus;
  exchange: string;
  expires_at: string | null;
  created_at: string;
}

export interface SignalDetail extends Signal {
  model_responses: Record<string, unknown> | null;
  executions: Execution[];
}

// ── Executions ─────────────────────────────────────────────
export type Exchange = "hyperliquid" | "bybit";

export interface Execution {
  id: string;
  signal_id: string | null;
  bybit_signal_id: string | null;
  user_id: string;
  strategy_id: string;
  order_type: OrderType;
  direction: SignalDirection;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  leverage: number;
  pnl: number | null;
  tx_hash: string | null;
  exchange_order_id: string | null;
  exchange: Exchange;
  user_email: string | null;
  error_message: string | null;
  status: ExecutionStatus;
  executed_at: string | null;
  created_at: string;
}

// ── Transactions ───────────────────────────────────────────
export interface Transaction {
  id: string;
  user_id: string;
  category: TransactionCategory;
  amount: number;
  asset: string;
  status: TransactionStatus;
  verification_link: string | null;
  tx_hash: string | null;
  description: string | null;
  created_at: string;
}

// ── Billing ────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  price_usd: number;
  billing_cycle: BillingCycle;
  features: Record<string, unknown>;
  max_strategies: number;
  max_allocation: number;
  ate_access: boolean;
  trial_days: number;
  status: PlanStatus;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  grace_until: string | null;
  nowpayments_invoice_id: string | null;
  plan: Plan | null;
  user_email: string | null;
  created_at: string;
}

// ── Ambassador ─────────────────────────────────────────────
export interface Ambassador {
  id: string;
  user_id: string;
  email: string | null;
  masked_email: string | null;
  rank: AmbassadorRank;
  status: AmbassadorStatus;
  admin_notes: string | null;
  referral_code: string;
  par_count: number;
  tav_count: number;
  total_referrals: number;
  rewards_earned: number;
  payout_address: string | null;
  rank_achieved_at: string | null;
  fast_start_claimed: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  ambassador_id: string;
  event_type: ActivityEventType;
  description: string;
  amount: number | null;
  related_id: string | null;
  actor: string;
  created_at: string;
}

export interface DownlineNode {
  ambassador_id: string;
  user_id: string;
  masked_email: string | null;
  rank: AmbassadorRank;
  par_count: number;
  tav_count: number;
  depth: number;
  direct_referral_count: number;
}

export interface DownlineResponse {
  ambassador_id: string;
  total_nodes: number;
  nodes_by_level: Record<number, DownlineNode[]>;
}

export interface RankDistributionItem {
  rank: AmbassadorRank;
  count: number;
}

export interface TopEarnerItem {
  ambassador_id: string;
  masked_email: string | null;
  rank: AmbassadorRank;
  commission_amount: number;
}

export interface AmbassadorAnalytics {
  month: number;
  year: number;
  rank_distribution: RankDistributionItem[];
  total_commissions_this_month: number;
  total_bonuses_this_month: number;
  new_ambassadors_this_month: number;
  new_referrals_this_month: number;
  pool_amount_this_month: number;
  pending_payouts_count: number;
  pending_payouts_amount: number;
  top_earners: TopEarnerItem[];
}

export interface AdminCommission extends AmbassadorCommission {
  ambassador_id: string;
  masked_email: string | null;
  rank: AmbassadorRank | null;
}

export interface AdminBonus extends AmbassadorBonus {
  ambassador_id: string;
  masked_email: string | null;
  rank: AmbassadorRank | null;
}

export interface AdminTravel extends TravelIncentive {
  ambassador_id: string;
  masked_email: string | null;
  rank: AmbassadorRank | null;
}

export interface AdminPayout extends AmbassadorPayout {
  masked_email: string | null;
  rank: AmbassadorRank | null;
  commission_ids: string[] | null;
  bonus_ids: string[] | null;
}

export interface TrainingCompletion {
  id: string;
  ambassador_id: string;
  masked_email: string | null;
  rank: AmbassadorRank | null;
  module_name: string;
  completed_at: string;
  notes: string | null;
}

export interface AmbassadorCommission {
  id: string;
  month: number;
  year: number;
  active_referral_count: number;
  tav_count: number;
  commission_amount: number;
  level_breakdown: Record<string, number> | null;
  generational_override: number;
  status: CommissionStatus;
  paid_at: string | null;
  created_at: string;
}

export interface AmbassadorBonus {
  id: string;
  bonus_type: BonusType;
  amount: number;
  period: string | null;
  description: string | null;
  status: CommissionStatus;
  paid_at: string | null;
  created_at: string;
}

export interface AmbassadorPayout {
  id: string;
  ambassador_id: string;
  total_amount: number;
  status: PayoutStatus;
  payout_address: string | null;
  admin_notes: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface TravelIncentive {
  id: string;
  destination: string;
  rank_required: AmbassadorRank;
  qualification_start: string;
  qualification_end: string | null;
  status: TravelStatus;
  awarded_at: string | null;
  admin_notes: string | null;
}

export interface LeadershipPool {
  id: string;
  month: number;
  year: number;
  total_pool_amount: number;
  eligible_ambassador_count: number;
  per_ambassador_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

// ── Support ────────────────────────────────────────────────
export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export interface TicketDetail extends SupportTicket {
  messages: SupportMessage[];
}

// ── Learning ───────────────────────────────────────────────
export interface LearningContent {
  id: string;
  title: string;
  description: string | null;
  category: ContentCategory;
  file_path: string | null;
  content_type: ContentType;
  content_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

// ── Admin-Specific Types ──────────────────────────────────
export interface AdminUserDetail extends User {
  strategy_count: number;
  execution_count: number;
  subscription_count: number;
  transaction_count: number;
}

export interface AdminUserUpdate {
  email?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface TradingStatus {
  halted: boolean;
  reason: string | null;
  halted_by: string | null;
  strategies_halted: number;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ConfigEntry {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
}

export interface RevenueAnalytics {
  total_revenue_usd: number;
  active_subscriptions: number;
  total_users: number;
  revenue_by_plan: Array<{ plan_name: string; subscriptions: number; revenue_usd: number }>;
  period_revenue_usd: number | null;
}

export interface UserAnalytics {
  total_users: number;
  new_users_period: number;
  active_users: number;
  admin_users: number;
}

export interface ExecutionAnalytics {
  total_executions: number;
  pending: number;
  filled: number;
  failed: number;
  total_pnl: number;
}

export interface PlanCreate {
  name: string;
  price_usd: number;
  billing_cycle: BillingCycle;
  features: Record<string, unknown>;
  max_strategies: number;
  max_allocation: number;
  ate_access: boolean;
  trial_days: number;
}

export interface PlanUpdate {
  name?: string;
  price_usd?: number;
  billing_cycle?: BillingCycle;
  features?: Record<string, unknown>;
  max_strategies?: number;
  max_allocation?: number;
  ate_access?: boolean;
  trial_days?: number;
  status?: PlanStatus;
}

export interface ContentCreate {
  title: string;
  description?: string;
  category: ContentCategory;
  content_type: ContentType;
  content_url?: string;
  file_path?: string;
  display_order?: number;
  is_published?: boolean;
}

export interface ContentUpdate {
  title?: string;
  description?: string;
  category?: ContentCategory;
  content_type?: ContentType;
  content_url?: string;
  file_path?: string;
  display_order?: number;
  is_published?: boolean;
}

export interface SubscriptionGrant {
  user_id: string;
  plan_id: string;
  status?: SubscriptionStatus;
  expires_at?: string;
}

export interface SubscriptionOverride {
  status: SubscriptionStatus;
  expires_at?: string;
  grace_until?: string;
}

export interface AmbassadorUpdate {
  status?: AmbassadorStatus;
  admin_notes?: string;
  payout_address?: string;
  rank_achieved_at?: string;
}

export interface UpdateCommissionRequest {
  status?: CommissionStatus;
  commission_amount?: number;
  admin_notes?: string;
}

export interface UpdateBonusRequest {
  status?: CommissionStatus;
  amount?: number;
  description?: string;
}

export interface ConfigUpdate {
  value: Record<string, unknown>;
  description?: string;
}

// ── Common ─────────────────────────────────────────────────
export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  detail: string;
  request_id?: string;
}

// ── Dashboard Analytics ───────────────────────────────────
export interface DashboardAnalytics {
  total_users: number;
  new_users_24h: number;
  new_users_7d: number;
  total_revenue_usd: number;
  revenue_30d: number;
  active_subscriptions: number;
  total_executions: number;
  executions_24h: number;
  filled_executions: number;
  failed_executions: number;
  total_pnl: number;
  pnl_today: number;
  win_rate: number;
  active_strategies: number;
  active_signals: number;
  open_tickets: number;
}

// ── Trading Analytics ─────────────────────────────────────
export interface TradingAnalytics {
  win_rate: number;
  loss_rate: number;
  total_trades: number;
  avg_pnl: number;
  best_trade: number;
  worst_trade: number;
  gross_profit: number;
  gross_loss: number;
  pnl_by_day: Array<{ date: string; pnl: number; trades_count: number }>;
  executions_by_day: Array<{ date: string; filled: number; failed: number; total: number }>;
  by_symbol: Array<{ symbol: string; trades: number; wins: number; losses: number; total_pnl: number; avg_pnl: number }>;
  by_direction: {
    buy: { trades: number; wins: number; pnl: number };
    sell: { trades: number; wins: number; pnl: number };
  };
  by_strategy_type: Array<{ strategy_type: string; trades: number; wins: number; total_pnl: number }>;
}

// ── Signal Analytics ──────────────────────────────────────
export interface SignalAnalytics {
  total_signals: number;
  by_status: { new: number; executing: number; filled: number; expired: number; cancelled: number };
  accuracy_rate: number;
  avg_confidence: number;
  avg_rr_ratio: number;
  by_symbol: Array<{ symbol: string; total: number; filled: number; expired: number; avg_confidence: number }>;
  signals_by_day: Array<{ date: string; count: number; filled: number; expired: number }>;
}

// ── User Growth Chart ─────────────────────────────────────
export interface UserGrowthPoint {
  date: string;
  new_users: number;
  cumulative_total: number;
}

// ── Revenue Chart ─────────────────────────────────────────
export interface RevenueChartPoint {
  date: string;
  revenue_usd: number;
  payments_count: number;
}

// ── Performance Analytics (comprehensive) ─────────────────
export interface ExchangeStats {
  exchange: string;
  trades: number;
  wins: number;
  losses: number;
  total_pnl: number;
  avg_pnl: number;
  volume: number;
}

export interface SignalFunnel {
  generated: number;
  executed: number;
  filled: number;
  profitable: number;
  conversion_rate: number;
  profitability_rate: number;
}

export interface RecentTrade {
  id: string;
  symbol: string;
  direction: string;
  exchange: string;
  pnl: number | null;
  status: string;
  entry_price: number;
  exit_price: number | null;
  leverage: number;
  created_at: string;
}

export interface PerformanceAnalytics {
  total_trades: number;
  win_rate: number;
  loss_rate: number;
  total_pnl: number;
  avg_pnl: number;
  profit_factor: number;
  sharpe_ratio: number;
  max_drawdown: number;
  best_trade: number;
  worst_trade: number;
  trade_volume: number;
  active_users: number;
  pnl_by_day: Array<{ date: string; pnl: number; trades_count: number }>;
  cumulative_pnl_by_day: Array<{ date: string; cumulative_pnl: number }>;
  executions_by_day: Array<{ date: string; filled: number; failed: number; total: number }>;
  by_exchange: ExchangeStats[];
  by_direction: {
    buy: { trades: number; wins: number; pnl: number };
    sell: { trades: number; wins: number; pnl: number };
  };
  by_symbol: Array<{ symbol: string; trades: number; wins: number; losses: number; total_pnl: number; avg_pnl: number }>;
  by_strategy_type: Array<{ strategy_type: string; trades: number; wins: number; total_pnl: number }>;
  signal_funnel: SignalFunnel;
  recent_trades: RecentTrade[];
}

// ── System Health ─────────────────────────────────────────
export interface SystemHealth {
  database: string;
  timestamp: string;
  version: string;
  uptime_info: { server_started: string };
}

export interface PipelineStatus {
  last_signal_at: string | null;
  last_execution_at: string | null;
  total_signals_today: number;
  total_executions_today: number;
  active_strategies: number;
  pending_executions: number;
}

// ── Payments ──────────────────────────────────────────────
export interface Payment {
  id: string;
  subscription_id: string;
  user_id: string;
  user_email: string | null;
  plan_name: string | null;
  amount_usd: number;
  amount_crypto: number | null;
  crypto_currency: string | null;
  nowpayments_payment_id: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}
