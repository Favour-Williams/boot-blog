
import { registerCommand, runCommand, CommandsRegistry, CommandHandler } from "./commands/commands";
import { handlerDeleteAllUsers, handlerLogin, handlerRegister, handlerListUsers } from "./commands/users";
import {handleURL} from "./commands/aggregate"
import { addFeed, handlerFeeds, handlerFollow, handlerFollowing, handlerUnfollow, handlerBrowse } from "./commands/feed";


import {middlewareLoggedIn} from "./middleware/middleware"



async function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", middlewareLoggedIn(handlerLogin));
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerDeleteAllUsers);
    registerCommand(registry, "users", handlerListUsers);
    registerCommand(registry, "agg", handleURL);
    registerCommand(registry, "addfeed", middlewareLoggedIn(addFeed));
    registerCommand(registry, "feeds", middlewareLoggedIn(handlerFeeds));
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));
    const commands = process.argv;
    if(commands.length < 3){
        console.error("No command provided. Usage: npm start <command> [args]");
        process.exit(1);
    }
   
    try {
    await runCommand(registry, commands[2], ...commands.slice(3));
  } catch (error: any) {
    console.error(error.message || error);
    process.exit(1);
  }
  process.exit(0);
}

main();
//"postgres", psql "postgres://postgres:postgres@localhost:5432/gator"