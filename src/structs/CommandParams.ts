import {Client, Guild, User, Message, TextChannel} from "discord.js"
import {Festus} from "../Festus"

export default interface CommandParams {
    args: string[]
    msg: Message
    author: User
    guild: Guild
    channel: TextChannel
    bot: Festus
}