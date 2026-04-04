import type { PlatformConnection, ProviderPublishResult, PublishRequest, PublisherProvider } from "@/lib/socialAutomation/types";

export const youtubePublisher: PublisherProvider = {
  platform: "youtube_shorts",
  defaultVideoFormat: "talking_head",
  buildOAuthUrl(state: string) {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.YOUTUBE_CLIENT_ID ?? "missing"}&scope=https://www.googleapis.com/auth/youtube.upload&state=${state}`;
  },
  async fetchCreatorInfo(connection: PlatformConnection) {
    return { creatorId: connection.accountId ?? "yt_channel", displayName: connection.connectedUser ?? "KCW YouTube" };
  },
  async publish(request: PublishRequest): Promise<ProviderPublishResult> {
    return {
      accepted: true,
      queuedAs: request.visibility === "public" ? "publish_attempted" : "draft_ready",
      platformPostId: `yt_${Date.now()}`,
      message: request.isShortsReady ? "YouTube upload accepted with shorts metadata." : "Upload accepted.",
    };
  },
};
