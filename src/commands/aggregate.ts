import {fetchFeed} from "../lib/rss"


export async function handleURL(cmdName: string, ...args: string[]){
    let result = await fetchFeed("https://www.wagslane.dev/index.xml")
    console.log(JSON.stringify(result, null, 2))
}