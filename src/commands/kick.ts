import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { RichEmbed } from "discord.js";
import { sendToLogs } from "../utils/fonctions";

export default class BanCommand extends Command {
    name: string = "kick"
    desc: string = "Exclure quelqu'un du serveur"
    usage: string = "kick <mention/id> <raison>"
    ownerOnly: boolean = false
    categorie: string = "Modération"

    async execute(args: CommandParams) {
        if(!args.msg.guild.member(args.author).hasPermission(["ADMINISTRATOR", "KICK_MEMBERS"])) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous n'avez pas la permission d'exclure quelqu'un !**`); return}
        if(!args.guild.me.hasPermission(["ADMINISTRATOR", "KICK_MEMBERS"])) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Je n'ai pas la permission d'exclure quelqu'un !**`); return}
    
        let kickM = args.msg.mentions.users.first() || args.guild.members.get(args.args[0])
        if(!kickM) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Il faut mentionner la personne ou donner son identifiant**`); return}
        if(kickM.id == args.author.id || !args.guild.member(kickM).kickable || args.guild.member(kickM).user.bot) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Je ne peux pas exclure cette personne !**`); return}

        var raison = args.args.slice(1).join(" ")
        if(!raison) raison = "Aucune raison donnée."

        kickM.send("Vous avez été exclu(e) de `" + args.guild.name + "` pour la/les raison(s) suivante(s) : "+ raison).then(() => args.guild.member(kickM).kick(raison)).then(() => args.channel.send(`${BASICEMOJIS.OKEMOJI} **${kickM} a été exclu(e) !**`))
        let banEmbed: RichEmbed = new RichEmbed()
        .setAuthor("[MODERATION] - Exclusion", args.bot.user.avatarURL)
        .addField("Membre :", `\`${args.guild.member(kickM).user.tag}\` (ID : ${args.guild.member(kickM).user.id})`, true)
        .addField("Modérateur :", args.author.tag, true)
        .addField("Raison :", raison, true)
        .setTimestamp()
        sendToLogs(args.guild, banEmbed)
    }
}