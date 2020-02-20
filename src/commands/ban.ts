import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { RichEmbed } from "discord.js";
import { sendToLogs } from "../utils/fonctions";

export default class BanCommand extends Command {
    name: string = "ban"
    desc: string = "Bannir quelqu'un du serveur"
    usage: string = "ban <mention/id> <raison>"
    ownerOnly: boolean = false
    categorie: string = "Modération"

    async execute(args: CommandParams) {
        if(!args.msg.guild.member(args.author).hasPermission(["ADMINISTRATOR", "BAN_MEMBERS"])) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous n'avez pas la permission de bannir quelqu'un !**`); return}
        if(!args.guild.me.hasPermission(["ADMINISTRATOR", "BAN_MEMBERS"])) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Je n'ai pas la permission de bannir quelqu'un !**`); return}
    
        let banM = args.msg.mentions.users.first() || args.guild.members.get(args.args[0])
        if(!banM) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Il faut mentionner la personne ou donner son identifiant**`); return}
        if(!args.guild.member(banM).bannable || args.guild.member(banM).user.bot) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Je ne peux pas bannir cette personne !**`); return}

        var raison = args.args.slice(1).join(" ")
        if(!raison) raison = "Aucune raison donnée."

        banM.send("Vous avez été banni(e) de `" + args.guild.name + "` pour la/les raison(s) suivante(s) : "+ raison).then(() => args.guild.member(banM).ban(raison)).then(() => args.channel.send(`${BASICEMOJIS.OKEMOJI} **${banM} a été banni(e) !**`))
        let banEmbed: RichEmbed = new RichEmbed()
        .setAuthor("[MODERATION] - Bannissement", args.bot.user.avatarURL)
        .addField("Membre :", `\`${args.guild.member(banM).user.tag}\` (ID : ${args.guild.member(banM).user.id})`, true)
        .addField("Modérateur :", args.author.tag, true)
        .addField("Raison :", raison, true)
        .setTimestamp()
        sendToLogs(args.guild, banEmbed)
    }
}