// =============================================================================
// Response types (from API serializer schemas)
// =============================================================================

export type CommercialTier = 'unsubscribed' | 'free' | 'starter' | 'pro' | 'growth' | 'scale' | 'ultra' | 'enterprise';

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

export interface AccountDomainAllowance {
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
  canAdd: boolean;
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
  domains?: AccountDomainAllowance;
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
  /** When false, this brand's emails carry no open-tracking pixel. */
  emailTrackOpens: boolean;
  /** When false, this brand's links are not rewritten for click tracking. */
  emailTrackClicks: boolean;
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
  fqdnChangeable: boolean;
  /** Company-derived candidate offered while the brand has no namespace; absent once reserved. */
  suggestedSubdomain?: string;
}

export interface PrepareBrandSubdomainRequest {
  /** Chosen subdomain label under the hosted apex; ignored once the brand owns a namespace. */
  subdomain?: string;
  /** Sender local part (defaults to `hello`). */
  localPart?: string;
}

export interface RenameHostedSenderRequest {
  subdomain: string;
  /** Current brandSubdomain.fqdn; prevents a stale request replacing another change. */
  expectedFqdn: string;
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

export interface AudienceReachFit {
  planId: number;
  slug: string;
  name: string;
  tierGroup: string;
  /** Recipients per 24 hours at the account's sending standing; null when unlimited. */
  dailyCap: number | null;
  /** Emails available within the month (what remains now, or a candidate's first month); null when unlimited. */
  capacity: number | null;
  /** Days until everyone has been reached once; null when the month cannot hold the send. */
  daysToReach: number | null;
  covers: boolean;
}

export interface AudienceReach {
  audience: number;
  cohort: string;
  current: AudienceReachFit | null;
  recommended: AudienceReachFit | null;
  covered: boolean;
  /** The one sentence every surface shows; null when covered. */
  summary: string | null;
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
  /** The persisted version: pass it back as an update's ifVersion or a send's templateIfVersion. */
  version: number;
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
  subdomainSharingAvailable?: boolean;
  sharedSubdomain?: { active: boolean; parentDomain: string | null; message: string | null };
  outstanding?: { code: 'dns_records' | 'provider_confirmation' | 'domain_review' | 'domain_permission';
    actionRequired: boolean; items: { domain: string; check: string }[]; message: string; nextCheckAt: string | null } | null;
  defaultFromDomain?: string;
  senderAuthorizationReason?: SenderAuthorizationReason;
  dnsSetupStatus?: 'unchecked' | 'incomplete' | 'ready' | 'verified';
  inboundSetup?: {
    method: 'none' | 'provider_forwarding' | 'mx';
    status: 'not_configured' | 'pending' | 'active' | 'attention';
    requiresInboxSelection?: boolean;
    inbox?: { id: number; address: string; displayName?: string | null; status: string } | null;
    providerForwarding?: {
      provider: string;
      forwardingAddress: string;
      probeSentAt?: string | null;
      verifiedAt?: string | null;
    } | null;
  };
  dnsRecords: Record<string, unknown>[] | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface SharedSubdomain {
  id: number;
  name: string;
  sendingDomainId: number;
  sendingDomainName: string;
  accountId: number;
  accountName: string;
  brandId: number;
  brandSid: string;
  brandName: string;
  active: boolean;
  revokedAt: string | null;
  dnsVerified: boolean;
}

export interface SubdomainSharingSummary {
  parent: { id: number; name: string };
  destinations: { accountId: number; accountName: string; brandId: number; brandSid: string; brandName: string }[];
  destinationsTruncated: boolean;
  subdomains: SharedSubdomain[];
  pagination: { page: number; totalPages: number; totalCount: number };
}

export interface Inbox {
  id: number;
  accountId: number;
  brandId: number;
  domainId: number;
  address: string;
  localPart: string;
  displayName: string | null;
  status: 'active' | 'disabled' | 'archived';
  replyAvailable: boolean;
  hosted: boolean;
  senderAddressEditable: boolean;
  sendingAddresses: string[];
  storage: Record<string, unknown>;
  retention: { days?: number };
  coexistence?: { available: boolean; selected: boolean; enabled: boolean; included: boolean; capacity: number };
  createdAt: string;
  updatedAt: string;
}

export interface InboxCreate {
  domainId: number;
  localPart: string;
  displayName?: string | null;
  forwardingProvider?: 'google_workspace' | 'microsoft_365' | 'zoho' | 'other';
}

export interface InboxUpdate {
  displayName?: string | null;
  status?: 'active' | 'archived';
  /** Onward copy to the existing provider, only for a verified Nitrosend MX setup. */
  coexistenceEnabled?: boolean;
}

export interface InboxCapacity {
  inboxes: {
    used: number;
    included: number | null;
    grandfathered: number;
    purchased: number;
    limit: number | null;
    creationLimit: number | null;
    remaining: number | null;
    overLimit: boolean;
  };
  domains: { used: number; limit: number | null; remaining: number | null; unlimited: boolean; canAdd: boolean };
  availableDomains: { id: number; name: string; receivingMethod: string; hosted: boolean }[];
  forwardingProviders: { key: string; label: string; guidance: string }[];
  offer: {
    planId: number;
    quantity: number;
    unitAmountCents: number;
    recurringTotalCents: number;
    currency: string;
    interval: string;
    available: boolean;
    manageUrl: string | null;
  } | null;
  subscription: {
    quantity: number;
    scheduledQuantity: number | null;
    changeAt: string | null;
    paidThroughAt: string | null;
    active: boolean;
    cancelAtPeriodEnd: boolean;
  } | null;
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
  /** Actual email Message-ID after provider acceptance; null until available. */
  rfcMessageId: string | null;
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
  reason: 'hard_bounce' | 'soft_bounce' | 'complaint' | 'manual' | 'admin' | 'unsubscribe' | 'verification' | 'marketing_withheld';
  scope: 'account_scoped' | 'brand_scoped';
  brandId: number | null;
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

export type WebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.bounced'
  | 'email.complained'
  | 'email.opened'
  | 'email.clicked'
  | 'email.failed'
  | 'email.received';

export interface Webhook {
  id: number;
  url: string;
  events: WebhookEventType[];
  enabled: boolean;
  /** `failing` while deliveries fail; an endpoint failing for 3 days is turned off. */
  status: 'active' | 'failing' | 'disabled';
  failingSince: string | null;
  /** Standard Webhooks signing secret (`whsec_…`). Masked unless revealed. */
  secret: string;
  lastDelivery: {
    id: number;
    eventType: WebhookEventType;
    status: WebhookDelivery['status'];
    attempts: number;
    lastResponseStatus: number | null;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookCreateParams {
  /** HTTPS URL that resolves only to public addresses. */
  url: string;
  events: WebhookEventType[];
}

export interface WebhookUpdateParams {
  url?: string;
  events?: WebhookEventType[];
  /** Turning a webhook off fails the deliveries it still owed. */
  enabled?: boolean;
}

/**
 * The JSON body Nitrosend POSTs to a webhook, exactly as received (its keys
 * are not camel-cased). Delivery events describe one of the brand's sends;
 * `email.received` carries mail that reached a brand inbox and, when it
 * answers a send, identifies that send the same way.
 */
export interface WebhookEvent {
  type: WebhookEventType;
  timestamp: string;
  data: {
    /** The id `messages.send` returned; null on test events. On `email.received`, the send it answers, or null. */
    message_id: number | null;
    /** The recipient; on `email.received`, the inbox address. */
    to: string;
    subject: string | null;
    /** The Idempotency-Key the message was sent with, when one was sent. */
    idempotency_key?: string;
    tags: Record<string, string>;
    /** Present and true on test events. */
    test?: true;
    /** email.sent */
    sent_at?: string;
    /** email.bounced */
    bounce?: { type: 'hard' | 'soft'; subtype: string | null };
    /** email.complained */
    complaint?: { feedback_type: string | null };
    /** email.clicked */
    url?: string;
    /** email.failed */
    failure?: { code: string; reason: string; category: string };
    /** email.received: the sender. */
    from?: string;
    /** email.received: plain-text body, at most 64 KiB. */
    text?: string | null;
    /** email.received: HTML body, at most 64 KiB. */
    html?: string | null;
    /** email.received: true when either body was cut to 64 KiB. */
    truncated?: boolean;
    /** email.received: true for automatic replies such as out-of-office notices. */
    auto_submitted?: boolean;
    /** email.received: recorded files, including unavailable ones. Check downloadable before fetching. */
    attachments?: {
      id: number;
      filename: string;
      content_type: string;
      size: number;
      /** True only for a clean scan verdict; this does not prove the bytes are stored. */
      scanned: boolean;
      /** Optional for deliveries queued before attachment availability was added. */
      scan_status?: 'pending' | 'clean' | 'infected' | 'failed' | 'not_scanned';
      downloadable?: boolean;
      /** Fetch with `acknowledge_unscanned=true` only when this is true. */
      download_requires_confirmation?: boolean;
      /** Present when unavailable; unknown reasons must also be treated as unavailable. */
      availability_reason?: string;
    }[];
    /** email.received: files omitted from the list by attachment limits; absent when none were omitted. */
    attachments_omitted?: number;
    /** email.received; null on test events. */
    conversation_id?: number | null;
    /** email.received; null on test events. */
    conversation_message_id?: number | null;
  };
}

export interface WebhookDelivery {
  id: number;
  /** Sent as `webhook-id` (`evt_<eventId>`), stable across retries. */
  eventId: string;
  eventType: WebhookEventType;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastResponseStatus: number | null;
  lastError: string | null;
  nextAttemptAt: string;
  payload: WebhookEvent;
  createdAt: string;
  updatedAt: string;
}

/** How an import stands against the account's standing row limit. */
export interface ImportGuardrail {
  tier: 'auto' | 'contact_us';
  status: 'ok' | 'contact_sales';
  /** The account standing the limit derives from. */
  standing: string;
  /** Row ceiling for the standing; null means no row ceiling. */
  maxRows: number | null;
}

/** Import limits for the account, derived from its deliverability standing. */
export interface ImportPolicy {
  standing: string;
  maxRows: number | null;
  maxFileSizeBytes: number;
  maxFileSizeMb: number;
  maxActiveImports: number;
  createRateLimitPerMinute: number;
  directUploadRateLimitPerMinute: number;
  writeModes: Array<'real' | 'shadow' | 'dry_run'>;
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
  warningRows: number;
  emailRows: { subscribed: number; unsubscribed: number; blocked: number } | null;
  rowCounters: { totalRows: number; processedRows: number; successRows: number; failedRows: number; warningRows: number; remainingRows: number; estimatedTotalRows: number | null };
  progress: { status: 'pending' | 'running' | 'complete' | 'failed'; pct: number | null; stages: Array<{ key: string; label: string; count: number; state: 'done' | 'active' | 'pending' | 'failed' }> };
  importErrors: unknown[][];
  importWarnings: unknown[][];
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
  emailTrackOpens?: boolean;
  emailTrackClicks?: boolean;
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
  /** Omit to preserve existing consent. True opts in; false opts out. Suppression still applies. */
  optIn?: boolean | null;
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

/**
 * A send names the exact draft it approves, so a stale caller cannot send a
 * newer one: the campaign's updatedAt and its template's version, as read.
 */
export interface SendCampaign {
  expectedCampaignUpdatedAt: string;
  templateIfVersion: number;
  /** Future delivery time (RFC 3339); omit to send now. */
  deliverAt?: string;
  /** Required when the persisted audience is all_contacts. */
  confirmSendToAll?: boolean;
}

export interface CreateFlow {
  name?: string;
  status?: string;
  trigger?: Record<string, unknown>;
  steps?: Record<string, unknown>[];
  /** Generated per call when omitted. Reuse a key only to retry the same create. */
  idempotencyKey?: string;
}

export type UpdateFlow = Omit<CreateFlow, 'idempotencyKey'>;

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

/**
 * Recipients for a test email. Omit `email` and `contactId` to use the brand's
 * saved test recipients. Tests go to the account's own people and verified
 * domains, plus up to 10 other addresses per 30 days.
 */
export interface SendTestParams {
  email?: string | string[];
  /** Sends to this contact, personalized with their data. */
  contactId?: number;
  /** Personalizes a test to `email` with this contact's data, without mailing the contact. */
  sampleContactId?: number;
  /** Generated per call when omitted. Reuse a key only to retry the same send. */
  idempotencyKey?: string;
}

export interface SendTestRecipientResult {
  email: string;
  success: boolean;
  status: 'delivered' | 'pending' | 'failed';
  code: string;
  /** Why this recipient's test was not sent. */
  error?: string;
  messageId?: number;
}

/** A refused recipient is reported in `results`; the others still get the test. */
export interface SendTestResult {
  sent: number;
  results: SendTestRecipientResult[];
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
  /** Email subject line; required for email unless `templateId` is set. */
  subject?: string;
  /**
   * Plain text. Required for SMS. For email, HTML here is escaped, and when
   * `html` is set this is the plain-text alternative.
   */
  body?: string;
  /** The email's HTML body. */
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
}

export interface BulkContactAction {
  actionType: 'add_to_list' | 'remove_from_list' | 'delete' | 'unsubscribe_email';
  ids: number[];
  listId?: number;
}

export interface BulkContactResult {
  affected: number;
  action: BulkContactAction['actionType'];
  listId?: number;
}

export interface CreateImport {
  signedId: string;
  resource?: 'contacts';
  parser?: 'default';
  /** Map CSV headers to fields, including email_status, email_opt_out and opt_in_at. Recognizable unsubscribes remain protected even when skipped. */
  columns?: Record<string, string | null> | string | null;
  options?: {
    listIds?: number[];
    emailAction?: 'unsubscribe' | 'block';
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
