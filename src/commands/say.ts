import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { dateInMyFormat, isRPCategory } from "../utils/fonctions";

export default class SayCommand extends Command {
    name = "say"
    usage = "say <message>"
    desc = "Affiche votre message comme si c'était lui qui parlait"
    ownerOnly = false
    categorie = "Autre"

    async execute(args: CommandParams) {
        var botMessage: string = args.args.join(" ")
        try {
            if (isRPCategory(args.channel.parentID) && !args.guild.member(args.author).hasPermission("ADMINISTRATOR" || "MANAGE_MESSAGES")) { args.author.send(`${BASICEMOJIS.XEMOJI} **La commande \`say\` ne peut plus être utilisée dans les salons RP par quelqu'un ne possédant par certaines permissions.**`); return }
            if (!botMessage) { args.author.send(`${BASICEMOJIS.XEMOJI} **Un message comportant \`plus que le nom de la commande\`est requis !**`); return }
        } catch (_) { }
        console.log(`Commande say utilisée dans ${args.channel.name} par ${args.author.tag} à ${dateInMyFormat(args.msg.createdAt)} pour dire : \n\t"${botMessage}"`)
        if (botMessage.includes("@everyone")) { args.msg.reply(`${BASICEMOJIS.XEMOJI} Bien essayé pour le everyone.`); return }
        args.channel.send(botMessage)
    }
}