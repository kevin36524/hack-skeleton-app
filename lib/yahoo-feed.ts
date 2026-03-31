const YAHOO_GQL = "https://nexus-gateway-prod.media.yahoo.com/";

const QUERY = `
query ForYouStreamData($limit: Int!, $useNwApi: Boolean!, $licenseCheckInput: LicenseCheckInput!, $carmotClientContext: CarmotClientContext!, $thumbnailImageTags: [MysterioTransformsInput]!, $providerLogoImageTags: [MysterioTransformsInput]!) {
  foryou(limit: $limit) {
    pageInfo { endCursor hasNextPage __typename }
    edges {
      node {
        uuid category categoryGroup
        content @skip(if: $useNwApi) {
          uuid
          licensedCarmotData(licenseCheckInput: $licenseCheckInput) {
            carmotData(clientContext: $carmotClientContext) {
              categoryLabel
              clickThroughUrl { url __typename }
              openWebCommentMetrics(openWebCommentMetricInput: {company: YAHOO}) {
                metrics { commentCount __typename }
                __typename
              }
              provider {
                displayName
                imageByType(type: "logo") {
                  url
                  carmotMysterioImages(transformInputs: $providerLogoImageTags) { url __typename }
                  __typename
                }
                __typename
              }
              pubDate summary
              thumbnail {
                url
                carmotMysterioImages(transformInputs: $thumbnailImageTags) { height width url __typename }
                __typename
              }
              title
              readingMeta { wpm200 __typename }
              uuid __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`.trim();

const VARIABLES = {
  useNwApi: false,
  limit: 14,
  licenseCheckInput: { device: "desktop", region: "US", site: "frontpage", skipLicenseChecks: false },
  carmotClientContext: { device: "desktop", lang: "en-US", region: "US", site: "frontpage" },
  thumbnailImageTags: [
    { formatType: "WEBP", operationOrder: ["smart_crop"], smartCropGravity: "faces", smartCropH: 556, smartCropW: 1114 },
    { formatType: "WEBP", operationOrder: ["smart_crop"], smartCropGravity: "faces", smartCropH: 360, smartCropW: 720 },
    { formatType: "WEBP", operationOrder: ["smart_crop"], smartCropGravity: "faces", smartCropH: 260, smartCropW: 260 },
  ],
  providerLogoImageTags: [{ formatType: "WEBP", operationOrder: ["smart_crop"], smartCropH: 80, smartCropW: 80 }],
};

export interface FeedStory {
  uuid: string;
  title: string;
  category: string;
  provider: string;
  providerLogoUrl: string | null;
  /** 1114×556 wide crop */
  thumbnailWideUrl: string | null;
  /** 720×360 medium crop */
  thumbnailMediumUrl: string | null;
  /** 260×260 square crop */
  thumbnailSquareUrl: string | null;
  clickThroughUrl: string;
  commentCount: number;
  /** reading time in minutes */
  readTimeMin: number;
  pubDate: string;
  summary: string;
}

export interface FeedData {
  stories: FeedStory[];
  endCursor: string;
  hasNextPage: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEdge(edge: any): FeedStory | null {
  try {
    const node = edge?.node;
    const data = node?.content?.licensedCarmotData?.carmotData;
    if (!data) return null;

    const images: { height: number; width: number; url: string }[] =
      data.thumbnail?.carmotMysterioImages ?? [];

    const wide = images.find((i) => i.width === 1114)?.url ?? data.thumbnail?.url ?? null;
    const medium = images.find((i) => i.width === 720)?.url ?? data.thumbnail?.url ?? null;
    const square = images.find((i) => i.width === 260)?.url ?? data.thumbnail?.url ?? null;

    const wpm200: number = data.readingMeta?.wpm200 ?? 0;

    return {
      uuid: node.uuid,
      title: data.title ?? "",
      category: data.categoryLabel ?? node.category ?? "",
      provider: data.provider?.displayName ?? "",
      providerLogoUrl:
        data.provider?.imageByType?.carmotMysterioImages?.[0]?.url ??
        data.provider?.imageByType?.url ??
        null,
      thumbnailWideUrl: wide,
      thumbnailMediumUrl: medium,
      thumbnailSquareUrl: square,
      clickThroughUrl: data.clickThroughUrl?.url ?? "",
      commentCount: data.openWebCommentMetrics?.metrics?.commentCount ?? 0,
      readTimeMin: wpm200 > 0 ? Math.ceil(wpm200 / 60) : 0,
      pubDate: data.pubDate ?? "",
      summary: data.summary ?? "",
    };
  } catch {
    return null;
  }
}

export async function getFeed(cursor?: string): Promise<FeedData> {
  const res = await fetch(YAHOO_GQL, {
    method: "POST",
    headers: {
      accept: "application/graphql-response+json,application/json;q=0.9",
      "content-type": "application/json",
      origin: "https://www.yahoo.com",
      referer: "https://www.yahoo.com/?feature=supernovaForYou_ssr",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      "x-yahoo-cg-client-name": "news",
    },
    body: JSON.stringify({
      operationName: "ForYouStreamData",
      variables: { ...VARIABLES, ...(cursor ? { cursor } : {}) },
      extensions: { clientLibrary: { name: "@apollo/client", version: "4.1.6" } },
      query: QUERY,
    }),
    // Cache for 5 minutes in Next.js fetch cache
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Yahoo API returned ${res.status}`);
  }

  const json = await res.json();
  const foryou = json?.data?.foryou;

  const stories = ((foryou?.edges ?? []) as unknown[])
    .map(mapEdge)
    .filter((s): s is FeedStory => s !== null);

  return {
    stories,
    endCursor: foryou?.pageInfo?.endCursor ?? "",
    hasNextPage: foryou?.pageInfo?.hasNextPage ?? false,
  };
}
