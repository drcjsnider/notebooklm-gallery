import ogs from "open-graph-scraper";

export interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export async function scrapeOpenGraph(url: string): Promise<{
  image?: string;
  metadata: OGMetadata;
}> {
  try {
    const { result } = await ogs({ url });

    return {
      image: result.ogImage?.[0]?.url,
      metadata: {
        title: result.ogTitle,
        description: result.ogDescription,
        image: result.ogImage?.[0]?.url,
        url: result.ogUrl,
        type: result.ogType,
        siteName: result.ogSiteName,
      },
    };
  } catch (error) {
    console.error("Failed to scrape OG metadata:", error);
    return {
      metadata: {
        url,
      },
    };
  }
}
