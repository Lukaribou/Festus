import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { Role, RichEmbed } from "discord.js";
import { dateInMyFormat } from "../utils/fonctions";

export default class RoleInfoCommand extends Command {
    name = "role-info"
    categorie = "Informations"
    aliases = ["ri", "roleinfo"]
    usage = "ri <identifiant du rôle>"
    desc = "Affiche des informations sur le rôle demandé"
    ownerOnly = false

    async execute(args: CommandParams) {
        if(!args.args[0]) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Veuillez entrer un identifiant de rôle ou son nom.**`); return}
        var role: Role
        if(args.bot.verificator.isRoleWithId(args.guild, args.args[0])) {
            role = args.guild.roles.get(args.args[0])
        } else if(args.bot.verificator.isRoleWithName(args.guild, args.args.join(" "))) {
            role = args.guild.roles.find(r => r.name.toLowerCase() == args.args.join(" ").toLowerCase())
        } else { args.channel.send(`${BASICEMOJIS.XEMOJI} **Le texte rentré n'est ni l'identifiant d'un rôle ni son nom ou n'est pas l'un de ce serveur.**`); return }
        var embed: RichEmbed = new RichEmbed()
        .setAuthor(`Informations sur le rôle : ${role.name}`, args.guild.iconURL)
        .setColor(role.hexColor)
        .addField("Nom :", role.name, true)
        .addField("Identifiant :", role.id, true)
        .addField("Membres avec ce rôle :", `${role.members.size} (\`${((role.members.size * 100) / args.guild.memberCount).toFixed(2)}%\`)`, true)
        .addField("Créé le :", dateInMyFormat(role.createdAt), true)
        .addField("Code hex. de la couleur :", role.hexColor, true)
        .addField("Distance au plus haut :", args.guild.roles.size - role.calculatedPosition, true)
        .addField("Mentionnable :", role.mentionable ? BASICEMOJIS.OKEMOJI : BASICEMOJIS.XEMOJI, true)
        .addField("Afficher les membres séparément :", role.hoist ? BASICEMOJIS.OKEMOJI : BASICEMOJIS.XEMOJI, true)
        args.channel.send(embed)
    }
}