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
  testEmailRecipients: string[];
  onboardingState: Record<string, unknown>;
  onboarding: { steps: Record<string, unknown>; progress: number };
  domainVerified: boolean;
  canSend: boolean;
  subscribedContactsCount: number;
  usingSandbox: boolean;
  sandboxEmail: string | null;
  capabilities: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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

export interface Domain {
  id: number;
  brandId: number;
  name: string;
  provider: string;
  status: 'pending' | 'verified' | 'failed';
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
  sentAt: string | null;
  createdAt: string;
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
  templateId?: number;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface MessageListParams extends ListParams {
  channel?: 'email' | 'sms';
  status?: 'queued' | 'sent' | 'failed';
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
