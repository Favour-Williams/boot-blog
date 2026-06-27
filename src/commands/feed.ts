import { createFeed, createFeedFollow, getFeeds, deleteFeedFollow } from "../lib/db/queries/feeds";
import { users, feeds, feed_follows} from "src/schema";
import { db } from "src/lib/db";
import { eq } from "drizzle-orm";

export async function addFeed(
    cmdName: string,
    user: User,
    ...args: string[]
) {
    if (args.length < 2) {
        throw new Error("addfeed requires a name and URL");
    }

    const [name, url] = args;

    const feed = await createFeed(
        name,
        url,
        user.id
    );

    await createFeedFollow(
        feed.id,
        user.id
    );

    printFeed(feed, user);
}

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export function printFeed(feed: Feed, user: User) {
    console.log("Feed:");
    console.log(`  ID:        ${feed.id}`);
    console.log(`  Name:      ${feed.name}`);
    console.log(`  URL:       ${feed.url}`);
    console.log(`  User ID:   ${feed.userId}`);
    console.log(`  Created:   ${feed.createdAt}`);
    console.log("");
    console.log("User:");
    console.log(`  ID:        ${user.id}`);
    console.log(`  Name:      ${user.name}`);
}


export async function handlerFeeds(
    cmdName: string,
    user: User,
    ...args: string[]
) {
    const feeds = await getFeeds();

    for (const feed of feeds) {
        console.log(`Name: ${feed.feedName}`);
        console.log(`URL: ${feed.feedUrl}`);
        console.log(`User: ${feed.userName}`);
        console.log("-------------------");
    }
}


export async function getFeedByUrl(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}

export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      feedFollowId: feed_follows.id,
      feedName: feeds.name,
      userName: users.name,
      createdAt: feed_follows.createdAt,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.userId, userId));
}

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length < 1) {
    throw new Error("URL is required");
  }

  const feed = await getFeedByUrl(args[0]);

  if (!feed) {
    throw new Error("Feed not found");
  }

  const follow = await createFeedFollow(
    feed.id,
    user.id
  );

  console.log(`Feed: ${follow.feedName}`);
  console.log(`User: ${follow.userName}`);
}

export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  const follows = await getFeedFollowsForUser(
    user.id
  );

  for (const follow of follows) {
    console.log(follow.feedName);
  }
}

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length < 1) {
    throw new Error("URL is required");
  }

  const feedUrl = args[0];
  const deleted = await deleteFeedFollow(user.id, feedUrl);

  if (deleted) {
    console.log(`Successfully unfollowed feed: ${feedUrl}`);
  } else {
    throw new Error("Feed follow not found");
  }
}