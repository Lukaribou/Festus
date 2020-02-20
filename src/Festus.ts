/// <reference path="../node_modules/discord.js"
import {Client, Collection, TextChannel} from "discord.js"
import {readdir} from "fs"
import Command from "./structs/Command"
import {Config} from "./Config"
import * as Events from "./events"
import {Verificator} from "./utils/Verificator"
import XpCollector from "./structs/xpcollector"
import { isBirthday, littleDateInMyFormat } from "./utils/fonctions"
export const confdb = require("../database/config.json")
var schedule = require("node-schedule")

export class Festus extends Client {
    commands: Collection<string, Command> = new Collection()
    aliases: Collection<string, Command> = new Collection()
    prefixes: Array<string>
    name: string
    desc: string
    ownerId: string
    bot: Client
    config: Config

    verificator: Verificator
    xpCollector: XpCollector

    constructor(config: Config) {
        super({disableEveryone: true})
        this.name = config.name
        this.desc = config.desc
        this.ownerId = config.ownerId
        this.config = config
        this.prefixes = config.prefixes
        
        this.verificator = new Verificator(this)
        this.xpCollector = new XpCollector(this)
        this.run()
    }

    async run(): Promise<void> {
        await this.loadCommands()
        this.on("ready", Events.onReady)
        this.on("message", Events.onMessage)
        this.on("guildMemberAdd", Events.onMemberJoin)
        this.on("guildMemberRemove", Events.onMemberLeave)
        this.on("messageDelete", Events.onMessageDelete)
        this.on("messageUpdate", Events.onMessageEdit)
        this.on("guildBanAdd", Events.onGuildBanAdd)
        this.on("guildBanRemove", Events.onGuildBanRemove)
        this.on("error", Events.onWSError)
        this.on("guildDelete", Events.onGuildLeft)
        await this.login(this.config.token)
    }

    private loadCommands(): void {
        readdir(__dirname + "/commands", (err: NodeJS.ErrnoException, filenames: Array<string>) => {
            if (err) {
                console.error(err.message);
                return;
            }
            let jsfile = filenames.filter(f => f.split(".").pop() === "js")
            if (jsfile.length <= 0) return console.log("[LOGS] - 0 fichiers trouvés")

            jsfile.forEach((f, i) => {
                try {
                    if(f.endsWith(".map")) return
                    delete require.cache[require.resolve(`./commands/${f}`)]
                    let pull = new (require(`./commands/${f}`).default)()
                    bot.commands.set(pull.name, pull)
                    pull.aliases.forEach(alias => {
                        this.aliases.set(alias, pull)
                    })
                } catch(e) {
                    console.log(e)
                }
            })
        })
    }
}

var bot: Festus = new Festus(new Config())
export default bot

schedule.scheduleJob('0 6 * * *', () => { // sec min hour day month jour_lettres
    var b: Array<string> = isBirthday(littleDateInMyFormat(new Date(Date.now())))
    if(b) {
        var c: TextChannel = bot.guilds.first().channels.get(confdb.birthdayChannel) as TextChannel
        b.forEach(id => {
            if(c.guild.member(id)) c.send(`**🎉🎂 <@${id}> Joyeux anniversaire à toi ! 🎉🎂**`)
        })
    }
})