import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { GuildChannel, Message, TextChannel, MessageReaction, RichEmbed } from "discord.js";
import { BASICEMOJIS } from "../utils/constants";
import Character from "../structs/Character";
import Player, { hasCharacter } from "../structs/Player";
import { isRPCategory } from "../utils/fonctions";

export default class IrisMsgCommand extends Command {
    name = "message iris"
    desc = "Vous crée un passage pour communiquer avec un autre endroit."
    categorie = "RolePlay"
    aliases = ["msg-iris", "iris"]
    usage = "iris <salon>"
    ownerOnly = false

    async execute(args: CommandParams) {
        var dest: GuildChannel = args.guild.channels.find(c => c.name == args.args[0].toLowerCase())
        if (!dest) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Il semblerait qu'Iris n'ait pas trouvé cet endroit... Vérifie bien le nom.**`); return }
        if (!isRPCategory(dest.parentID)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Cette zone est inaccessible à Iris...**`); return}
        if (!hasCharacter(args.author)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour utiliser cette commande !**`); return }
        var pAuthor = new Character(new Player(args.author))
        if (!pAuthor.hasInInventory("pass-iris")) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Il semblerait que tu n'ais pas le \`pass-iris\` en ta possession... Achète le et reviens me voir après.**`); return }
        var pass: boolean = true, xmsg: Message
        try {
            if (args.guild.channels.find(c => c.name == `iris-${pAuthor.charact.name.toLowerCase()}`)) {
                await args.msg.reply(`**Il semblerait qu'une connexion Iris soit déjà en cours pour vous. Souhaitez-vous continuer et la supprimer ?**`).then(async msg => {
                    xmsg = msg as Message
                    await xmsg.react(BASICEMOJIS.OKEMOJI)
                    await xmsg.react(BASICEMOJIS.XEMOJI)
                    await xmsg.awaitReactions((_, user) => user.id == args.author.id, { max: 1, time: 30000, errors: ['time'] }).then(collected => {
                        var reaction: MessageReaction = collected.first()
                        if (reaction.emoji.name == BASICEMOJIS.OKEMOJI) args.guild.channels.find(c => c.name.toLowerCase() == `iris-${pAuthor.charact.name.toLowerCase()}`).delete("[AUTO-SUPPRESSION] - Salon RolePlay Iris")
                        else if (reaction.emoji.name == BASICEMOJIS.XEMOJI) { xmsg.edit(`${BASICEMOJIS.OKEMOJI} **Connexion annulée !**`); return pass = false }
                    })
                }).catch(() => { xmsg.edit(`${BASICEMOJIS.XEMOJI} **Temps imparti écoulé !**`); pass = false })
            }
            if (pass) {
                var d: any = []
                dest.permissionOverwrites.forEach(e => d.push(e))
                if (!args.guild.me.hasPermission("MANAGE_CHANNELS")) { args.author.send(`${BASICEMOJIS.XEMOJI} **Je ne possède pas la permission \`MANAGE_CHANNELS\`.**`); return }
                var ch = await args.guild.createChannel(`iris-${pAuthor.charact.name.toLowerCase()}`, {
                    type: "text",
                    permissionOverwrites: [
                        {
                            id: args.author,
                            allow: 68672
                        },
                    ].concat(d)
                })
                ch = ch as TextChannel
                ch.send(`<@${args.author.id}> **Connexion Iris établie avec <#${dest.id}>**`)
                var desti: TextChannel = dest as TextChannel
                var em: RichEmbed = new RichEmbed()
                    .setTitle("🌈 **Ouverture d'un canal Iris** 🌈")
                    .setColor("#FF00FA")
                    .setDescription(`${pAuthor.charact.name} a ouvert un canal Iris avec votre localisation ! <#${ch.id}> vous permettra de communiquer !`)
                desti.send(em)

                ch.awaitMessages(() => null, { time: 3600000, errors: ['time'] }).catch(_ => {
                    let x = ch as TextChannel
                    x.send(`Iris : Cela fait 1h que le canal est ouverte, puis-je le fermer ?`).then(async m => {
                        var xm = m as Message
                        await xm.react(BASICEMOJIS.OKEMOJI)
                        await xm.react(BASICEMOJIS.XEMOJI)
                        await xm.awaitReactions((_, user) => user.id == args.author.id, { max: 1, errors: ['time'] }).then(collected => {
                            var reaction: MessageReaction = collected.first()
                            if (reaction.emoji.name == BASICEMOJIS.OKEMOJI) { ch.delete(); return }
                            else if (reaction.emoji.name == BASICEMOJIS.XEMOJI) { xm.edit(`Iris : Très bien, vous contacterez un administrateur pour fermer la communication manuellement.`); return }
                        }).catch(() => { args.guild.owner.send(`Le salon Iris <#${ch.id}> a été ouvert et la question pour la suppression n'a pas obtenue de réponse dans le temps imparti.`); return })
                    })
                })
            }
        } catch (e) { args.author.send(`${BASICEMOJIS.XEMOJI} **Une erreur est survenue :** \`${e}\``); return }
    }
}