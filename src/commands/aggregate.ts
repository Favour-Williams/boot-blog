import { fetchFeed } from "../lib/rss";
import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";
import { createPost } from "../lib/db/queries/posts";

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error("Invalid duration format. Use format like '1s', '1m', '1h', or '500ms'");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      throw new Error("Invalid time unit");
  }
}

async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds to fetch");
    return;
  }

  console.log(`Fetching feed: ${feed.name} (${feed.url})`);

  try {
    const feedData = await fetchFeed(feed.url);
    const items = feedData.channel.item || [];

    for (const item of items) {
      const title = item.title;
      const link = item.link;
      const description = item.description;
      const pubDate = item.pubDate;

      let publishedAt: Date | null = null;
      if (pubDate) {
        const parsed = new Date(pubDate);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed;
        }
      }

      try {
        await createPost(title, link, description, publishedAt, feed.id);
      } catch (err) {
        console.error("Error creating post:", err);
      }
    }

    await markFeedFetched(feed.id);
    console.log(`Saved ${items.length} posts for feed ${feed.name}`);
  } catch (error) {
    console.error(`Error fetching feed ${feed.url}:`, error);
  }
}

export async function handleURL(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("time_between_reqs argument is required (e.g., '1m', '30s')");
  }

  const timeBetweenRequests = parseDuration(args[0]);
  const durationStr = args[0];

  console.log(`Collecting feeds every ${durationStr}`);

  // Run immediately first
  await scrapeFeeds().catch((error) => {
    console.error("Error in scrapeFeeds:", error);
  });

  // Set up interval for subsequent runs
  const interval = setInterval(() => {
    scrapeFeeds().catch((error) => {
      console.error("Error in scrapeFeeds:", error);
    });
  }, timeBetweenRequests);

  // Handle Ctrl+C gracefully
  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("\nShutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}