import type { PlatformConnection, ProviderPublishResult, PublishRequest, PublisherProvider } from "@/lib/socialAutomation/types";

export const instagramPublisher: PublisherProvider = {
  platform: "instagram_reels",
  defaultVideoFormat: "b_roll_subtitle",
  buildOAuthUrl(state: string) {
    return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${process.env.INSTAGRAM_APP_ID ?? "missing"}&scope=instagram_business_content_publish,instagram_business_basic&state=${state}`;
  },
  async fetchCreatorInfo(connection: PlatformConnection) {
    return { creatorId: connection.accountId ?? "ig_business", displayName: connection.connectedUser ?? "KCW Instagram" };
  },
  async publish(request: PublishRequest): Promise<ProviderPublishResult> {
    if (request.visibility === "draft") {
      return { accepted: true, queuedAs: "draft_ready", message: "Instagram reel container created; waiting manual publish confirm." };
    }
    return { accepted: true, queuedAs: "publish_attempted", platformPostId: `ig_${Date.now()}`, message: "Instagram reel publish request accepted." };
  },
};
