import { db } from "..";
import { posts, feed_follows, feeds, users } from "../../../schema";
import { eq, desc } from "drizzle-orm";

export async function createPost(
  title: string | undefined,
  url: string,
  description: string | undefined,
  publishedAt: Date | null,
  feedId: string
) {
  // Skip if post with same URL exists
  const existing = await db.select().from(posts).where(eq(posts.url, url)).limit(1);
  if (existing && existing.length > 0) {
    return existing[0];
  }

  const [result] = await db.insert(posts).values({
    title,
    url,
    description,
    publishedAt,
    feedId,
  }).returning();

  return result;
}

export async function getPostsForUser(userId: string, limit = 2) {
  return await db
    .select({
      postId: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedName: feeds.name,
      feedUrl: feeds.url,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feed_follows, eq(feeds.id, feed_follows.feedId))
    .where(eq(feed_follows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}
