import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { RichEmbed, Message } from "discord.js";
import bot from "../Festus";
const xpdb = require("../../database/xp.json")

export default class TopCommand extends Command {
    name = "top"
    categorie = "Autre"
    usage = "top"
    aliases = ["topxp"]
    desc = "Affiche le classement des utilisateurs en fonction de leur xp"
    ownerOnly = false

    async execute(args: CommandParams) {
        var mgm: number = args.guild.memberCount - args.guild.members.filter(m => m.user.bot).size
        var compteur: number = 0
        var xptop: Array<any> = new Array(mgm)
        args.guild.members.filter(m => !m.user.bot).forEach(xpmem => {
            try {
                xptop[compteur] = [xpmem.user.username, xpdb[xpmem.id].xp, xpdb[xpmem.id].level]
            } catch {
                xptop[compteur] = [xpmem.user.username, 0, 0]
            }
            compteur++
        })
        xptop.sort(this.sortFunction).reverse()

        var topArray: Array<any> = new Array()
        var tourscompt: number = 0, limite: number = 0

        while(tourscompt != mgm) {
            var topEmbed: RichEmbed = new RichEmbed()
            .setTitle("**__Classement des joueurs par XP__**")
            .setThumbnail(bot.user.displayAvatarURL)
            var tbl: Array<Array<any>>= [[]]
            limite = tourscompt
            for(var j: number = tourscompt; j < (limite + 10); j++) {
                if(xptop[j] != undefined) {
                    for(var k: number = 0; k < 3; k++) {
                        tbl = [xptop[j][0], xptop[j][1], xptop[j][2]]
                    }
                    topEmbed.addField(`Position n° ${j + 1} :`, `**${tbl[0]}** - Niveau ${tbl[2]} (${tbl[1]} XP)`)
                    tourscompt++
                }
            }
            topArray.push(topEmbed)
        }

        let page: number = 1

        topArray[page - 1].setFooter(`Page ${page}/${topArray.length} - Classement demandé par ${args.author.tag}`) && args.channel.send(topArray[page - 1]).then(msg=> {
            this.rereact(msg as Message, 3)

            const backwardsFilter = (reaction, user) => reaction.emoji.name == "⬅" && user.id == args.author.id
            const stopFilter = (reaction, user) => reaction.emoji.name == '⏹' && user.id == args.author.id
            const forwardsFilter = (reaction, user) => reaction.emoji.name == '➡' && user.id == args.author.id
        
            const backward = (msg as Message).createReactionCollector(backwardsFilter, { time: 60000 }) // 1 minute
            const stop = (msg as Message).createReactionCollector(stopFilter, { time: 60000 })
            const forward = (msg as Message).createReactionCollector(forwardsFilter, { time: 60000 })
        
            backward.on('collect', async () => {
                page--
                msg = msg as Message
                await (topArray[page - 1]).setFooter(`Page ${page}/${topArray.length} - Classement demandé par ${args.author.tag}`)
                msg.edit(topArray[page - 1]).then(() => {
                    page == 1 ? this.rereact(msg as Message, 3) : this.rereact(msg as Message, 1)
                })
            })

            stop.on('collect', () => {
                (msg as Message).delete()
            })

            forward.on('collect', async () => {
                page++
                msg = msg as Message
                await (topArray[page - 1]).setFooter(`Page ${page}/${topArray.length} - Classement demandé par ${args.author.tag}`)
                msg.edit(topArray[page - 1]).then(() => {
                    page == topArray.length ? this.rereact(msg as Message, 2) : this.rereact(msg as Message, 1)
                })
            })
        })
    }
    
    private sortFunction(a, b): number {
        if(a[1] == b[1]) return 0
        else return (a[1] < b[1]) ? -1 : 1
    }

    private rereact(msg: Message, parametre: number): void {
        msg.clearReactions().then(() => {
            if(parametre == 1) {
                msg.react("⬅").then(() => {
                    msg.react("⏹").then(() => {
                        msg.react("➡")
                    })
                })
            } else if(parametre == 2) {
                msg.react("⬅").then(() => {
                    msg.react("⏹").then(() => {
                        msg.react("🛑")
                    })
                })
            } else {
                msg.react("🛑").then(() => {
                    msg.react("⏹").then(() => {
                        msg.react("➡")
                    })
                })
            }
        })
    }
}