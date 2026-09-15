// =============================================================================
// Response types (from API serializer schemas)
// =============================================================================

export type CommercialTier = 'unsubscribed' | 'free' | 'pro' | 'ultra' | 'enterprise';

export interface AccountAccess {
  source: 'owner' | 'membership' | 'platform_admin' | 'delegated' | 'management_credential' | 'api_key' | 'shopify';
  delegated: boolean;
  managerAccountId?: number;
  managerAccountName?: string | null;
  managementGrantId?: number;
  permissionSet?: 'operator_v1';
  credentialType?: 'management';
}

export interface AccountBrandAllowance {
  used: number;
  limit: number;
  remaining: number | null;
  unlimited: boolean;
  canCreate: boolean;
}

export interface AccountResourceUsage {
  used: number;
  allowance: number | null;
  remaining: number | null;
  overageRate: number;
  mode: 'budget' | 'monthly' | 'unlimited';
  budget: number | null;
  budgetUsed: number;
}

export interface AccountBilling {
  accessPolicy: 'free_allowed' | 'paid_required' | null;
  brands: AccountBrandAllowance;
  funding: Record<string, unknown>;
  providerRoute: Record<string, unknown>;
  planName?: string | null;
  plan?: Record<string, unknown> | null;
  spendCapMonthlyCents?: number | null;
  comped?: boolean;
  overage?: Record<string, unknown>;
  resources?: {
    email: AccountResourceUsage;
    sms: AccountResourceUsage;
    ai: AccountResourceUsage;
  };
  entitlements?: Record<string, unknown>;
  lifetime?: {
    emailSent: number;
    smsSent: number;
    aiUsed: number;
  };
}

export interface AccountTeamSummary {
  seatLimit: number;
  seatCount: number;
  memberCount: number;
  inviteCount: number;
  currentRole: 'member' | 'admin' | 'owner' | null;
  canManageTeam: boolean;
}

export interface Account {
  id: number;
  name: string | null;
  avatar: string | null;
  banner: string | null;
  commercialTier: CommercialTier;
  safeModeEnabled: boolean;
  access: AccountAccess | null;
  billing?: AccountBilling;
  team?: AccountTeamSummary;
  brands: Brand[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandLink {
  url?: string;
  icon?: string;
  title?: string;
}

export interface BrandByoRouting {
  mismatch: boolean;
  provider: string | null;
  bypassingDomains: string[];
  message: string | null;
}

export interface Brand {
  id: number;
  sid: string;
  accountId: number;
  brandColor: string | null;
  textColor: string | null;
  bgColor: string | null;
  fontHeading: string | null;
  fontBody: string | null;
  headingSize: number | null;
  bodySize: number | null;
  radius: number | null;
  spacingDensity: 'compact' | 'normal' | 'spacious' | null;
  companyDescription: string | null;
  defaultHeader: Record<string, unknown> | null;
  defaultFooter: Record<string, unknown> | null;
  defaultTheme: Record<string, unknown> | null;
  physicalAddress: string | null;
  companyName: string | null;
  sourceUrl: string | null;
  lastScrapedAt: string | null;
  links: BrandLink[] | null;
  logo: string | null;
  complete: boolean;
  emailFromName: string | null;
  emailFromEmail: string | null;
  emailReplyTo: string | null;
  emailViewOnline: boolean;
  fromEmailDomainStatus: 'blank' | 'verified' | 'unverified';
  effectiveFromEmail: string | null;
  effectiveReplyTo: string | null;
  effectiveSendingDomain: string | null;
  effectiveSourceEmail: string | null;
  senderConfigured: boolean;
  testEmailRecipients: string[];
  brandDocument: string | null;
  onboardingState: Record<string, unknown>;
  onboarding: {
    steps: Record<string, unknown>;
    progress: { completed: number; total: number };
  };
  domainVerified: boolean;
  canSend: boolean;
  byoRouting: BrandByoRouting;
  brandSubdomain: BrandSubdomain | null;
  subscribedContactsCount: number;
  logoUrl: string | null;
  screenshotUrl: string | null;
  capabilities: Record<string, unknown>;
  smsProvisioned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandSubdomain {
  namespaceStatus: 'unreserved' | 'active' | 'replacement_pending' | 'retiring' | 'retired';
  status:
    | 'brand_identity_required'
    | 'brand_identity_review_required'
    | 'namespace_reservation_required'
    | 'not_materialized'
    | 'root_unavailable'
    | 'ready'
    | 'unavailable';
  ready: boolean;
  selected?: boolean;
  preparationRequired: boolean;
  fromEmail?: string;
  fqdn?: string;
  apex?: string;
  localPart?: string;
  localPartEditable?: boolean;
  fqdnChangeable: false;
  /** Company-derived candidate offered while the brand has no namespace; absent once reserved. */
  suggestedSubdomain?: string;
}

export interface PrepareBrandSubdomainRequest {
  /** Chosen subdomain label under the hosted apex; ignored once the brand owns a namespace. */
  subdomain?: string;
  /** Sender local part (defaults to `hello`). */
  localPart?: string;
}

export interface BrandSubdomainPreparationResponse {
  status: 'ready' | 'unavailable';
  brandSubdomain: BrandSubdomain;
}

export interface HostedSenderAvailability {
  subdomain: string;
  fqdn: string | null;
  available: boolean;
  reason: 'taken' | 'unsafe' | 'reserved' | 'local_part_invalid' | null;
  localPart: string | null;
  fromEmail: string | null;
}

export interface Contact {
  id: number;
  brandId: number;
  uuid: string;
  firstName: string | null;
  lastName: string | null;
  source: string | null;
  countryCode: string | null;
  data: Record<string, unknown>;
  subscribedPhone: boolean;
  subscribedEmail: boolean;
  listIds: number[];
  lastInteractedAt: string | null;
  channels: Channel[];
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: number;
  kind: 'email' | 'phone';
  value: string;
  subscribed: boolean;
  verified: boolean;
  sentCount: number;
  failCount: number;
  optInAt: string | null;
  optOutAt: string | null;
  data: Record<string, unknown>;
  contactId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: number;
  accountId: number;
  brandId: number;
  status: 'draft' | 'scheduled' | 'live' | 'paused' | 'completed' | 'cancelled' | 'archived';
  approvalState: 'pending_review' | 'approved' | 'rejected';
  channel: 'email' | 'sms';
  name: string | null;
  data: Record<string, unknown>;
  scheduledAt: string | null;
  sentCount: number;
  editable: boolean;
  trigger: FlowTrigger;
  template: Template;
  templates: Template[];
  createdAt: string;
  updatedAt: string;
}

export interface Flow {
  id: number;
  accountId: number;
  brandId: number;
  status: 'draft' | 'live' | 'paused' | 'archived' | 'cancelled';
  approvalState: 'pending_review' | 'approved' | 'rejected';
  name: string | null;
  goal: string | null;
  trigger: Record<string, unknown>;
  steps: Record<string, unknown>[];
  sentCount: number;
  templates: Template[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  name: string | null;
  flowId: number | null;
  actionId: number | null;
  subject: string | null;
  body: string | null;
  preheader: string | null;
  fromName: string | null;
  fromEmail: string | null;
  replyTo: string | null;
  design: Record<string, unknown> | null;
  variables: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSummary {
  id: number;
  name: string | null;
  subject: string | null;
  preheader: string | null;
  flowId: number | null;
  sectionCount: number;
  sectionTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowTrigger {
  id: number;
  flowId: number;
  audienceType: CampaignAudienceType | null;
  segmentId: number | null;
  resourceType: string | null;
  resourceId: number | null;
  name: string | null;
  event: string;
  data: Record<string, unknown>;
  contactListId: number | null;
  contactListIds: number[];
  triggeredCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CampaignAudienceType = 'lists' | 'segment' | 'all_contacts';

export interface CampaignTriggerAttributes {
  event?: string;
  audience_type?: CampaignAudienceType | null;
  contact_list_id?: number | null;
  contact_list_ids?: number[];
  segment_id?: number | null;
  data?: Record<string, unknown>;
}

export interface Segment {
  id: number;
  accountId: number;
  brandId: number;
  name: string | null;
  filters: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

export type SenderAuthorizationReason =
  | 'missing_sender_domain'
  | 'sandbox_domain'
  | 'exact_inbox'
  | 'shared_domain_requires_exact_inbox'
  | 'shared_domain_not_verified'
  | 'platform_domain'
  | 'sender_domain_not_authorized'
  | 'sending_domain'
  | 'unaligned_apex_supported'
  | 'author_identity_not_verified'
  | 'author_domain_unaligned'
  | 'author_domain'
  | 'sender_domain_mismatch';

export interface Domain {
  id: number;
  brandId: number;
  name: string;
  provider: string;
  status: 'pending' | 'verified';
  defaultFromDomain?: string;
  senderAuthorizationReason?: SenderAuthorizationReason;
  dnsSetupStatus?: 'unchecked' | 'incomplete' | 'ready' | 'verified';
  dnsRecords: Record<string, unknown>[] | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface Event {
  id: number;
  event: string;
  amount: number | null;
  data: Record<string, unknown>;
  resourceUid: string | null;
  resourceName: string | null;
  resourceUrl: string | null;
  idempotencyKey: string | null;
  test: boolean;
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  utmCampaign: string | null;
  chainDepth: number;
  generated: boolean;
  contactId: number;
  accountId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactList {
  id: number;
  brandId: number;
  name: string;
  contactsCount: number;
  segmentId: number | null;
  stale: boolean;
  lastPopulatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  brandId: number;
  channel: 'email' | 'sms';
  to: string;
  subject: string | null;
  status: 'queued' | 'sent' | 'failed';
  providerId: string | null;
  flowId: number | null;
  sourceType: 'campaign' | 'flow' | 'test' | null;
  sourceName: string | null;
  statusReasonCode: string | null;
  statusReason: string | null;
  statusReasonCategory: 'content_review' | 'account' | 'internal' | 'recipient' | 'provider' | 'rate_limit' | 'delivery' | null;
  failureCode: string | null;
  failureReason: string | null;
  failureCategory: 'content_review' | 'account' | 'internal' | 'recipient' | 'provider' | 'delivery' | null;
  sentAt: string | null;
  createdAt: string;
}

export interface Suppression {
  id: number;
  email: string;
  reason: 'hard_bounce' | 'soft_bounce' | 'complaint' | 'manual' | 'admin';
  scope: 'account_scoped';
  active: boolean;
  contactId: number | null;
  sourceProvider: string | null;
  sourceEventId: string | null;
  providerDiagnostic: string | null;
  bounceType: 'hard' | 'soft' | null;
  bounceSubtype: string | null;
  complaintFeedbackType: string | null;
  eventOccurredAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportGuardrail {
  tier: 'auto' | 'hold_sends' | 'contact_us';
  status: 'ok' | 'requires_review' | 'contact_sales';
  contactUsCeiling: number;
  sendsHeld: boolean;
}

export interface ImportPolicy {
  maxFileSizeBytes: number;
  maxFileSizeMb: number;
  autoMaxRows: number;
  contactUsMaxRows: number;
  maxActiveImports: number;
  createRateLimitPerMinute: number;
  directUploadRateLimitPerMinute: number;
}

export interface ImportSpec {
  resource: 'contacts';
  parser: 'default';
  ui: Record<string, unknown>;
  requiredRules: Record<string, unknown>;
  fields: Record<string, unknown>[];
  guardrails: ImportPolicy;
}

export interface Import {
  id: number;
  resource: 'contacts';
  parser: 'default';
  status: 'pending' | 'processing' | 'failed' | 'canceled' | 'complete' | 'contact_us';
  totalRows: number | null;
  successRows: number | null;
  failedRows: number | null;
  rowsProcessed: number;
  progressPct: number | null;
  importErrors: unknown[][];
  columns: Record<string, unknown> | null;
  options: Record<string, unknown> | null;
  assignedListIds: number[];
  assignedLists: Array<{ id: number; name: string }>;
  guardrail: ImportGuardrail;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface DirectUploadCreate {
  purpose?: 'import' | 'image' | 'media_asset';
  blob: {
    filename: string;
    byteSize: number;
    checksum: string;
    contentType?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface DirectUpload {
  signedId: string;
  filename?: string;
  byteSize?: number;
  contentType?: string | null;
  directUpload: {
    url: string;
    headers?: Record<string, string>;
  };
}

export interface ImageAsset {
  mediaKind: 'image';
  mediaUrl: string;
  imageUrl: string;
  signedId: string;
  filename: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
}

// =============================================================================
// Request types (from controller strong params)
// =============================================================================

export interface UpdateAccount {
  name?: string;
  avatar?: string;
  banner?: string;
  safeModeEnabled?: boolean;
}

export interface CreateBrand {
  name?: string;
  companyName?: string;
  brandColor?: string;
  textColor?: string;
  bgColor?: string;
  fontHeading?: string;
  fontBody?: string;
  headingSize?: number;
  bodySize?: number;
  radius?: number;
  spacingDensity?: 'compact' | 'normal' | 'spacious';
  companyDescription?: string;
  physicalAddress?: string;
  logo?: string;
  brandDocument?: string;
  emailFromName?: string;
  emailFromEmail?: string;
  emailReplyTo?: string;
  emailViewOnline?: boolean;
  testEmailRecipients?: string[];
  links?: BrandLink[];
  defaultHeader?: Record<string, unknown>;
  defaultFooter?: Record<string, unknown>;
  defaultTheme?: Record<string, unknown>;
}

export interface CreateContact {
  firstName?: string;
  lastName?: string;
  source?: string;
  countryCode?: string;
  listIds?: number[];
  email?: string;
  phone?: string;
  data?: Record<string, unknown>;
}

export type UpdateContact = CreateContact;

export interface CreateCampaign {
  name?: string;
  channel?: 'email' | 'sms';
}

export interface UpdateCampaign {
  name?: string;
  status?: string;
  channel?: 'email' | 'sms';
  scheduledAt?: string;
  triggerAttributes?: CampaignTriggerAttributes;
  templateAttributes?: Record<string, unknown>;
}

export interface SendCampaign {
  confirmSendToAll?: boolean;
  triggerAttributes?: CampaignTriggerAttributes;
  templateAttributes?: Record<string, unknown>;
}

export interface CreateFlow {
  name?: string;
  status?: string;
  trigger?: Record<string, unknown>;
  steps?: Record<string, unknown>[];
}

export type UpdateFlow = CreateFlow;

export interface UpdateTemplate {
  name?: string;
  subject?: string;
  body?: string;
  preheader?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  design?: Record<string, unknown>;
}

export interface SendTestParams {
  contactId?: number;
  email?: string[];
}

export interface PreviewParams {
  document: Record<string, unknown>;
}

export interface UpdateBrand extends CreateBrand {
  senderIdentityId?: number;
  senderLocalPart?: string;
}

export interface CreateDomain {
  name: string;
}

export interface CreateEvent {
  event: string;
  contactEmail?: string;
  contactId?: number;
  idempotencyKey: string;
  amount?: number;
  resourceUid?: string;
  resourceName?: string;
  resourceUrl?: string;
  test?: boolean;
  data?: Record<string, unknown>;
  utmSource?: string;
  utmMedium?: string;
  utmTerm?: string;
  utmContent?: string;
  utmCampaign?: string;
}

export interface CreateSegment {
  name?: string;
  filters?: Record<string, unknown>[];
}

export type UpdateSegment = CreateSegment;

export interface CreateList {
  name: string;
  segmentId?: number;
  contactIds?: number[];
}

export type UpdateList = CreateList;

export interface CreateMessage {
  channel: 'email' | 'sms';
  to: string;
  subject?: string;
  body?: string;
  html?: string;
  templateId?: number;
  contactId?: number;
  from?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  tags?: Record<string, string | number | boolean>;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface CreateImport {
  signedId: string;
  resource?: 'contacts';
  parser?: 'default';
  columns?: Record<string, string> | string;
  options?: {
    listIds?: number[];
    [key: string]: unknown;
  } | string;
}

export interface IngestImage {
  imageData?: string;
  imageUrl?: string;
  signedId?: string;
  filename?: string;
  contentType?: string;
}

export interface MessageListParams extends ListParams {
  sourceType?: 'all' | 'campaign' | 'flow' | 'transactional' | 'test';
  flowId?: number;
  campaignId?: number;
  date?: string;
  channel?: 'email' | 'sms';
  status?: 'queued' | 'sent' | 'failed';
}

export interface SuppressionListParams extends ListParams {
  id?: number;
  email?: string;
  reason?: Suppression['reason'];
  sourceProvider?: string;
  active?: boolean;
}

export interface ImportListParams extends ListParams {
  resource?: 'contacts';
}

// =============================================================================
// Query param types
// =============================================================================

export interface ListParams {
  page?: number;
  limit?: number;
}

export interface ContactListParams extends ListParams {
  search?: string;
  listId?: number;
}

export interface EventListParams extends ListParams {
  event?: string;
  contactId?: number;
  amount?: number;
  resourceUid?: string;
  resourceName?: string;
  resourceUrl?: string;
  test?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmTerm?: string;
  utmContent?: string;
  utmCampaign?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface DomainListParams extends ListParams {}
