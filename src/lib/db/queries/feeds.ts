import { db } from "..";
import { feeds, users, feed_follows }  from "../../../schema";

import { eq, and } from "drizzle-orm";


export async function createFeed(name: string, url:string, user_id:string) {
  const [result] = await db.insert(feeds).values({ name: name, url:url, userId:user_id }).returning();
  return result;
}


export async function getFeeds() {
    return await db
        .select({
            feedId: feeds.id,
            feedName: feeds.name,
            feedUrl: feeds.url,
            userName: users.name,
        })
        .from(feeds)
        .innerJoin(users, eq(feeds.userId, users.id));
}


export async function createFeedFollow(
  feedId: string,
  userId: string
) {
  const [newFeedFollow] = await db
    .insert(feed_follows)
    .values({
      feedId,
      userId,
    })
    .returning();

  const [result] = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedId: feed_follows.feedId,
      userId: feed_follows.userId,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.id, newFeedFollow.id));

  return result;
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const feed = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, feedUrl));

  if (!feed || feed.length === 0) {
    throw new Error("Feed not found");
  }

  const result = await db
    .delete(feed_follows)
    .where(and(eq(feed_follows.userId, userId), eq(feed_follows.feedId, feed[0].id)))
    .returning();

  return result.length > 0;
}