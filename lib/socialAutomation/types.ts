import type { LanguageMode, Platform, Topic, VideoFormat } from "@/lib/contentOps/types";

export type SocialPlatform = Extract<Platform, "tiktok" | "instagram_reels" | "youtube_shorts">;
export type ControlMode = "manual_review" | "auto_draft" | "controlled_auto_publish";
export type ConnectionState = "not_connected" | "auth_url_ready" | "connected" | "token_expired" | "restricted" | "degraded";
export type PublishCapability = "manual_only" | "draft_only" | "private_only" | "restricted" | "public_ready";
export type QueueStatus = "queued" | "draft_ready" | "waiting_manual_review" | "publish_attempted" | "published" | "failed" | "downgraded";

export type PlatformConnection = {
  platform: SocialPlatform;
  state: ConnectionState;
  oauthProvider: "official_oauth";
  scopes: string[];
  scopeStatus: "ok" | "missing";
  tokenExpiresAt: string | null;
  refreshable: boolean;
  auditRestricted: boolean;
  connectedUser: string | null;
  lastSyncedAt: string | null;
  accountId: string | null;
  authConfigured: boolean;
  hasToken: boolean;
  authRequired: boolean;
  publishCapability: PublishCapability;
  capabilityReason: string;
};

export type OAuthStateRecord = {
  platform: SocialPlatform;
  state: string;
  nonce: string;
  redirectUri: string;
  createdAt: string;
  expiresAt: string;
};

export type TokenHealth = {
  platform: SocialPlatform;
  status: "valid" | "expiring_soon" | "expired" | "missing";
  canRefresh: boolean;
  expiresInMinutes: number | null;
};

export type TopicPlan = {
  id: string;
  title: string;
  angle: string;
  targetPlatform: SocialPlatform;
  targetLanguage: LanguageMode;
  viralScore: number;
  leadScore: number;
  realismScore: number;
  aiSmellRisk: number;
  duplicationRisk: number;
  recommendedCTA: string;
  monetizationLabel: "lead_capture" | "education_only" | "affiliate";
  requiredAssets: string[];
  sourceTopicId: Topic["id"];
};

export type ScriptAutomationPack = {
  topicPlanId: string;
  hooks: [string, string, string];
  shortScript: string;
  standardScript: string;
  extendedScript: string;
  caption: string;
  hashtags: string[];
  pinnedComment: string;
  cta: string;
  enVersion: string;
  zhVersion: string;
  enAudioZhSubtitleTip: string;
  zhAudioEnSubtitleTip: string;
};

export type VideoTemplate = "talking_head" | "b_roll_subtitle" | "faq_quick_answer" | "before_after";

export type VideoProductionTask = {
  id: string;
  topicPlanId: string;
  script: string;
  subtitleText: string;
  voiceoverText: string;
  assetReferences: string[];
  template: VideoTemplate;
  output: {
    aspectRatio: "9:16";
    coverText: string;
    postPackage: {
      finalScript: string;
      subtitleFile: string;
      subtitleManifest: string[];
      caption: string;
      hashtags: string[];
      pinnedComment: string;
      cta: string;
      assetManifest: string[];
      publishPayload: PublishRequest;
    };
  };
};

export type PublishRequest = {
  platform: SocialPlatform;
  title: string;
  description: string;
  hashtags: string[];
  visibility: "public" | "private" | "draft" | "unlisted";
  mediaUrl: string;
  isShortsReady: boolean;
};

export type PublishQueueItem = {
  id: string;
  platform: SocialPlatform;
  status: QueueStatus;
  topicPlanId: string;
  scriptPackId: string;
  language: LanguageMode;
  cta: string;
  publishCapability: PublishCapability;
  payload: PublishRequest;
  downgradedReason?: string;
  error?: string;
  needsManualReview: boolean;
  createdAt: string;
};

export type NormalizedAnalytics = {
  postId: string;
  platform: SocialPlatform;
  language: LanguageMode;
  hookVariant: string;
  ctaType: string;
  monetizationLabel: string;
  views: number;
  watchTime: number;
  retention: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  follows: number;
  profileVisits: number;
  dmSignals: number;
  leadSignals: number;
  source: "imported" | "mocked" | "normalized" | "simulated/internal seed";
};

export type FiveDayAutoReview = {
  goalMet: boolean;
  weakMetrics: string[];
  rootCauses: string[];
  nextCycleStrategy: string;
  recommendedAction: string;
  recommendation: "repeat" | "stop" | "expand";
};

export type ReplyDraft = {
  id: string;
  channel: "comment" | "dm";
  messageType: string;
  inquiry: string;
  draft: string;
  leadIntent: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  suggestedNextStep: string;
  escalateToHuman: boolean;
  autoSendAllowed: boolean;
};

export type DegradedState = {
  platformNotConnected: SocialPlatform[];
  tokenExpired: SocialPlatform[];
  auditRestricted: SocialPlatform[];
  publishDowngraded: SocialPlatform[];
  analyticsUnavailable: SocialPlatform[];
};

export type SocialAutomationSnapshot = {
  mode: ControlMode;
  connections: PlatformConnection[];
  queue: PublishQueueItem[];
  todayPlan: TopicPlan[];
  scripts: ScriptAutomationPack[];
  videoTasks: VideoProductionTask[];
  replyQueue: ReplyDraft[];
  analytics: NormalizedAnalytics[];
  fiveDayReview: FiveDayAutoReview;
  degraded: DegradedState;
};

export type ProviderPublishResult = {
  accepted: boolean;
  platformPostId?: string;
  queuedAs: QueueStatus;
  message: string;
};

export type PublisherProvider = {
  platform: SocialPlatform;
  buildOAuthUrl(state: string): string;
  fetchCreatorInfo(connection: PlatformConnection): Promise<{ creatorId: string; displayName: string }>;
  publish(request: PublishRequest, connection: PlatformConnection): Promise<ProviderPublishResult>;
  defaultVideoFormat: VideoFormat;
};
