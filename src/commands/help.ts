import Command from "../structs/Command"
import CommandParams from "../structs/CommandParams"
import bot from "../Festus"
import {RichEmbed, Collection, Message, MessageReaction, User} from "discord.js"
import { BASICEMOJIS } from "../utils/constants";

export default class HelpCommand extends Command {
    name: string = "help"
    desc: string = "Afficher l'aide"
    usage: string = "help <commande/rien>"
    categorie: string = "Informations"
    ownerOnly: boolean = false

    async execute(args: CommandParams) {
        var symbols: Map<string, string> = this.setMapEmoji(new Map())

        if(args.args.length == 0) {
            var categories: string[] = []
            var categArray: Map<string, RichEmbed> = new Map()
            let helpEmbed: RichEmbed = new RichEmbed()
            .setAuthor(`${bot.user.username} => ${bot.commands.size} commandes disponibles`, bot.user.avatarURL)

            await bot.commands.forEach(cmd => {
                if(!categories.includes(cmd.categorie)) {
                    if(cmd.categorie !== null) categories.push(cmd.categorie)
                }
            })

            await categories.forEach(cat => {
                var comm: Collection<string, Command> = bot.commands.filter((cmd) => cmd.categorie == cat)
                helpEmbed.addField(`${symbols.has(cat) ? symbols.get(cat) : "❓"} ${cat} (${comm.size})`, comm.map((cmd) => `\`${cmd.name}\``).join(" • "))
                var thisCatEmbed: RichEmbed = new RichEmbed()
                .setAuthor(`Aide catégorie : ${cat} (${comm.size})`, bot.user.avatarURL)
                .setDescription(`${comm.map((commande) => `${commande.ownerOnly ? ("🔐 **" + commande.name) : ("• **" + commande.name)}** (Utilisation : \`${bot.prefixes[0] + commande.usage}\`) => ${commande.desc}`).join("\n")}`)
                .setFooter("📋 Retour au menu principal - 📤 Détruire le message d'aide")
                
                categArray.set(cat, thisCatEmbed)
            })

            helpEmbed.setFooter("📋 Retour au menu principal - 📤 Détruire le message d'aide")

            var sended: Message = await args.channel.send(helpEmbed) as Message
            await this.reactToMsg(sended, symbols)

            const reactionManager = sended.createReactionCollector((_, user) => user.id == args.author.id)

            reactionManager.on("collect", async (reaction: MessageReaction) => {
                try {
                    var val: boolean = await this.changeHelp(reaction, sended, categArray, helpEmbed)
                    if(val) await this.reactToMsg(sended, symbols)
                    else return
                }catch(_) {}
            })
        }

        if (args.bot.commands.has(args.args[0]) || args.bot.aliases.has(args.args[0])) {
            const command: Command = args.bot.commands.get(args.args[0]) || args.bot.aliases.get(args.args[0])
            var embed: RichEmbed = new RichEmbed()
            .setAuthor(`Aide sur la commande : ${command.name}`, bot.user.avatarURL)
            .setDescription("`Description :` " + command.desc)
            .setColor("#00FF00")
            .addField("Utilisation : ", bot.prefixes[0] + command.usage, true)
            .addField("Catégorie : ", `${symbols.has(command.categorie) ? symbols.get(command.categorie) : "❓"} ${command.categorie}`, true)
            .addField("Alias ?", command.aliases.length == 0 ? BASICEMOJIS.XEMOJI : ("`" + command.aliases.join("`, `") + "`"), true)
            .addField("Propriétaire du bot seulement : ", command.ownerOnly ? BASICEMOJIS.OKEMOJI : BASICEMOJIS.XEMOJI, true)
            args.channel.send(embed)
        }
    }

    /**
     * @description Configurer la map en assignant un émoji à une catégorie
     * @param map La map à configurer
     */
    private setMapEmoji(map: Map<string, string>): Map<string, string> {
        var namesArray: Array<string> = ["Informations", "Modération", "Système", "RolePlay", "Autre"]
        var emojisArray: Array<string> = ["ℹ", "👮", "🔧", "⚔", "🗂"]

        for(var i: number = 0; i < namesArray.length; i++) map.set(namesArray[i], emojisArray[i])

        return map
    }

    private changeHelp(reaction: MessageReaction, msg: Message, categArray: Map<string, RichEmbed>, basicEmbed: RichEmbed): boolean {
        var reac: string = reaction.emoji.name
        var dispo: boolean = true
        try {
            switch(reac) {
                case "ℹ":
                    msg.edit(categArray.get("Informations"))
                break
                case "👮":
                    msg.edit(categArray.get("Modération"))
                break
                case "🔧":
                    msg.edit(categArray.get("Système"))   
                break
                case "⚔":
                    msg.edit(categArray.get("RolePlay"))   
                break
                case "🗂":
                    msg.edit(categArray.get("Autre"))   
                break
                case "📋":
                    msg.edit(basicEmbed)
                break
                case "📤":
                    msg.delete()
                    dispo = false
                break
            }
        } catch (_) {dispo = false}
        return dispo
    }

    /**
     * @description Ajoute les réactions de la map
     * @param msg Le message où procéder
     * @param map La map avec les émojis en fonction de la catégorie
     */
    private async reactToMsg(msg: Message, map: Map<string, string>): Promise<void> {
        await msg.reactions.forEach(reac => {
            reac.users.filter(r => r.id != bot.user.id).forEach(async (u: User) => {
                await reac.remove(u).catch()
            })
        })
        for(var el of map.values()) {
            await msg.react(el).catch()
        }
        await msg.react("📋").catch()
        await msg.react("📤").catch()
    }
}