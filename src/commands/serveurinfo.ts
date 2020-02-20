import Command from "../structs/Command"
import CommandParams from "../structs/CommandParams";
import { RichEmbed } from "discord.js";

export default class ServeurInfoCommand extends Command {
    name: string = "serveur-info"
    categorie: string = "Informations"
    aliases: string[] = ["si", "serveurinfo"]
    usage: string = "si"
    desc: string = "Affiche des informations sur le serveur"
    ownerOnly: boolean = false

    async execute(args: CommandParams) {
        let online = args.guild.members.filter(member => member.user.presence.status !== "offline")

        var embed: RichEmbed = new RichEmbed()
        .setAuthor(`Informations sur : ${args.guild.name}`, args.bot.user.avatarURL)
        .setThumbnail(args.guild.iconURL)
        .setFooter(`Serveur créé le : ${args.guild.createdAt.getDate()}.${args.guild.createdAt.getMonth()}.${args.guild.createdAt.getFullYear()}`)
        .addField("Identifiant :", args.guild.id, true)
        .addField("Propriétaire :", args.guild.owner + ` (ID : \`${args.guild.ownerID}\`)`, true)
        .addField("Région : ", args.guild.region, true)
        .addField("Salons : ", args.guild.channels.size, true)
        .addField("Rôles :", args.guild.roles.size, true)
        .addField("Membres : ", args.guild.memberCount + ` dont \`${args.guild.memberCount - args.guild.members.filter(m => m.user.bot).size}\` humains | Humains en ligne : \`${online.size - online.filter(us => us.user.bot).size}\` (${((online.size - online.filter(u => u.user.bot).size) * 100 / args.guild.memberCount).toFixed(2)}%)`, true)
        .addField("Emojis :", `${args.guild.emojis.size === 0 ? "Le serveur n'a pas d'émojis" : args.guild.emojis.map(e => e.toString()).join(" | ")}`, true)
        args.channel.send(embed)
    }
}