// =============================================================================
// Response types (from API serializer schemas)
// =============================================================================

export interface Account {
  id: number;
  name: string | null;
  website: string | null;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  comped: boolean;
  accountTier: string;
  spendCapMonthlyCents: number | null;
  emailBudgetUsed: number;
  emailBudgetLimit: number;
  smsBudgetUsed: number;
  smsBudgetLimit: number;
  aiActionsUsed: number;
  aiActionsLimit: number;
  brands: Brand[];
  createdAt: string;
  updatedAt: string;
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
  styleNotes: string | null;
  tone: string | null;
  companyDescription: string | null;
  industry: string | null;
  exampleCopy: string[];
  defaultHeader: Record<string, unknown> | null;
  defaultFooter: Record<string, unknown> | null;
  defaultTheme: Record<string, unknown> | null;
  physicalAddress: string | null;
  companyName: string | null;
  sourceUrl: string | null;
  lastScrapedAt: string | null;
  links: Record<string, unknown>[];
  logo: string | null;
  complete: boolean;
  emailFromName: string | null;
  emailFromEmail: string | null;
  emailReplyTo: string | null;
  effectiveFromEmail: string | null;
  effectiveReplyTo: string | null;
  effectiveSendingDomain: string | null;
  effectiveSourceEmail: string | null;
  senderConfigured: boolean;
  testEmailRecipients: string[];
  onboardingState: Record<string, unknown>;
  onboarding: { steps: Record<string, unknown>; progress: number };
  domainVerified: boolean;
  canSend: boolean;
  brandSubdomain: BrandSubdomain | null;
  subscribedContactsCount: number;
  capabilities: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BrandSubdomain {
  namespaceStatus: 'active' | 'replacement_pending' | 'retiring' | 'retired';
  status:
    | 'not_prepared'
    | 'allocated'
    | 'provisioning_dns'
    | 'provisioning_provider'
    | 'pending_verification'
    | 'ready'
    | 'retiring'
    | 'retired'
    | 'failed_retryable'
    | 'failed_terminal';
  ready: boolean;
  selected?: boolean;
  preparationRequired: boolean;
  fromEmail?: string;
  fqdn: string;
  apex: string;
  localPart: string;
  localPartEditable: boolean;
  fqdnChangeable: false;
  provisioningRequestedAt?: string;
  readyAt?: string;
  nextRetryAt?: string;
  failureCode?: string;
}

export interface BrandSubdomainPreparationResponse {
  status: 'provisioning' | 'ready';
  brandSubdomain: BrandSubdomain;
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
  bio?: string;
  website?: string;
  avatar?: string;
  banner?: string;
}

export interface CreateBrand {
  companyName?: string;
  brandColor?: string;
  textColor?: string;
  bgColor?: string;
  fontHeading?: string;
  fontBody?: string;
  styleNotes?: string;
  tone?: string;
  companyDescription?: string;
  industry?: string;
  physicalAddress?: string;
  emailFromName?: string;
  emailFromEmail?: string;
  emailReplyTo?: string;
  testEmailRecipients?: string[];
  exampleCopy?: string[];
  links?: Record<string, unknown>[];
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

export interface UpdateBrand {
  brandColor?: string;
  textColor?: string;
  bgColor?: string;
  fontHeading?: string;
  fontBody?: string;
  styleNotes?: string;
  tone?: string;
  companyDescription?: string;
  industry?: string;
  physicalAddress?: string;
  companyName?: string;
  emailFromName?: string;
  emailFromEmail?: string;
  emailReplyTo?: string;
  senderIdentityId?: number;
  senderLocalPart?: string;
  testEmailRecipients?: string[];
  exampleCopy?: string[];
  links?: Record<string, unknown>[];
  defaultHeader?: Record<string, unknown>;
  defaultFooter?: Record<string, unknown>;
  defaultTheme?: Record<string, unknown>;
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
