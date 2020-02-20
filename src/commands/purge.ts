import Command from "../structs/Command"
import CommandParams from "../structs/CommandParams"
import { BASICEMOJIS } from "../utils/constants";
import { Collection, Message, MessageEmbed, RichEmbed } from "discord.js";
import { sendToLogs } from "../utils/fonctions";

export default class PurgeCommand extends Command {
    name: string = "purge"
    desc: string = "Supprimer x messages dans le salon"
    usage: string = "purge <nbr de messages à supprimer>"
    categorie: string = "Modération"
    ownerOnly: boolean = false

    async execute(args: CommandParams) {
        var temp = args
        if(!args.guild.member(args.author).hasPermission(["MANAGE_MESSAGES", "ADMINISTRATOR"])) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous n'avez pas la permission de supprimer des messages !**`); return}
        if(!args.guild.me.hasPermission(["ADMINISTRATOR", "MANAGE_MESSAGES"])) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Je n'ai pas la permission de supprimer des messages !**`); return}
        const deleteCount: number = parseInt(args.args[0])
        if(deleteCount < 1 || deleteCount > 99 || !deleteCount || isNaN(deleteCount)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Le nombre de message a supprimer doit être un __nombre__ supérieur à 0 et inférieur à 100**`); return}
        //const fetched: Collection<string, Message> = await args.channel.fetchMessages()
        args.channel.bulkDelete(deleteCount).then(messages => {
            temp.channel.send(`\`${messages.size} messages\` **ont été supprimés**`)
            var embed: RichEmbed = new RichEmbed()
            .setAuthor("[MODERATION] - Purge", args.bot.user.avatarURL)
            .addField("Modérateur :", args.author.tag, true)
            .addField("Demande de suppression de :", deleteCount, true)
            .addField("Suppression finale : ", messages.size)
            .setTimestamp()
            sendToLogs(temp.guild, embed)
        }).catch(e => temp.channel.send(`**Erreur :** \`${e}\``))
    }
}