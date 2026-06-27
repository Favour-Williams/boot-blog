import { XMLParser } from "fast-xml-parser";
export async function fetchFeed(feedURL: string){
    let req = await fetch(feedURL, {
        headers:{
            "User-Agent": "gator",
        }
    })
    let res = await req.text()
    let parserobj = new XMLParser({processEntities:false})
    let parserstr =  parserobj.parse(res)

    if(!("channel" in parserstr.rss)){
        throw Error("field does not exist")
    }

    if(!("title" in parserstr.rss.channel)){
        throw Error("field does not exist")
    }
    if(!("link" in parserstr.rss.channel)){
        throw Error("field does not exist")
    }
    if(!("description" in parserstr.rss.channel)){
        throw Error("field does not exist")
    }
    let items =  new Array()
    let channel = parserstr.rss.channel
    let rawItems: any[] = []
    if ("item" in channel) {
        if (Array.isArray(channel.item)) {
            rawItems = channel.item
        } else if (typeof channel.item === "object" && channel.item !== null) {
            rawItems = [channel.item]
        }
    }

    for (let rawItem of rawItems) {
        let title = rawItem.title
        let link = rawItem.link
        let description = rawItem.description
        let pubDate = rawItem.pubDate

        if (!title || !link || !description || !pubDate) {
            continue
        }

        items.push({
            title,
            link,
            description,
            pubDate
        })
    }
    let  channelobj = {
        "channel":{
            "title": channel.title,
            "link": channel.link,
            "description": channel.description,
            "item": items
        }
    }

    return channelobj

}