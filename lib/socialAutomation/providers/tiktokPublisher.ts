import type { PlatformConnection, ProviderPublishResult, PublishRequest, PublisherProvider } from "@/lib/socialAutomation/types";

export const tiktokPublisher: PublisherProvider = {
  platform: "tiktok",
  defaultVideoFormat: "faq_quick_answer",
  buildOAuthUrl(state: string) {
    return `https://www.tiktok.com/v2/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY ?? "missing"}&response_type=code&scope=user.info.basic,video.publish&state=${state}`;
  },
  async fetchCreatorInfo(connection: PlatformConnection) {
    return { creatorId: connection.accountId ?? "tt_creator", displayName: connection.connectedUser ?? "KCW TikTok" };
  },
  async publish(request: PublishRequest, connection: PlatformConnection): Promise<ProviderPublishResult> {
    if (connection.auditRestricted || request.visibility === "public") {
      return {
        accepted: true,
        queuedAs: "draft_ready",
        message: "TikTok client in restricted mode; downgrade to private/draft compatible flow.",
      };
    }
    return { accepted: true, queuedAs: "pending_platform", platformPostId: `tt_${Date.now()}`, message: "TikTok Content Posting accepted." };
  },
};
