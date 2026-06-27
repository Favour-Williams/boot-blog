import {setUser, readConfig} from "../config";
import {createUser, deleteAllUsers, getUserByName, getUsers} from "../lib/db/queries/users";
import { User } from "./feed";

export async function handlerLogin(cmdName: string, user: User, ...args: string[]){
    if(args.length === 0){
        throw new Error("Username is required for login command");
    }
    
    const username = args[0];
    const foundUser = await getUserByName(username);
    if(!foundUser){
        throw new Error(`User ${username} not found. Please register first.`);
    }
    setUser(username);
    console.log(`User ${username} logged in successfully.`);
}

export async function handlerRegister(cmdName: string, ...args: string[]){
    if(args.length === 0){
        throw new Error("Username is required for register command");
    }
    const username = args[0];
  
        const existingUser = await getUserByName(username);
        if(existingUser){
            throw new Error(`User ${username} already exists. Please choose a different username.`);
        }
        else{
            const newUser = await createUser(username);
            setUser(newUser.name);
            console.log(`User ${newUser.name} registered and logged in successfully.`);
        }
  
}

export async function handlerDeleteAllUsers(cmdName: string, ...args: string[]){
    await deleteAllUsers();
    console.log("All users have been deleted.");
}


export async function handlerListUsers(cmdName: string, ...args: string[]){
   const users = await getUsers();
    const currentUser = readConfig().currentUserName || "";
    users.forEach(user => {
        const suffix = user.name === currentUser ? " (current)" : "";
        console.log(`* ${user.name}${suffix}`);
    });

}


