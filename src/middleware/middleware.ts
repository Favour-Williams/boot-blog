import { CommandHandler } from "src/commands/commands";
import { User } from "src/commands/feed";
import { readConfig } from "src/config";
import { getUserByName } from "src/lib/db/queries/users";

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn: middlewareLoggedIn = (handler: UserCommandHandler): CommandHandler => {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("Error: You must be logged in to run this command.");
    }

    const user = await getUserByName(config.currentUserName);

    if (!user) {
      throw new Error("Current user not found");
    }

    return handler(cmdName, user, ...args);
  };
};