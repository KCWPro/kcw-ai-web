import { instagramPublisher } from "@/lib/socialAutomation/providers/instagramPublisher";
import { tiktokPublisher } from "@/lib/socialAutomation/providers/tiktokPublisher";
import { youtubePublisher } from "@/lib/socialAutomation/providers/youtubePublisher";
import type { PublisherProvider, SocialPlatform } from "@/lib/socialAutomation/types";

const registry: Record<SocialPlatform, PublisherProvider> = {
  tiktok: tiktokPublisher,
  instagram_reels: instagramPublisher,
  youtube_shorts: youtubePublisher,
};

export function getPublisher(platform: SocialPlatform): PublisherProvider {
  return registry[platform];
}
