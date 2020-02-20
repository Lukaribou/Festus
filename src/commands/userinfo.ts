import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { RichEmbed, Role, PermissionString, User } from "discord.js";
import { removeArray, dateInMyFormat, dayMonthInLetters } from "../utils/fonctions"
import { BASICEMOJIS } from "../utils/constants";

export default class UserInfoCommand extends Command {
    name: string = "user-info"
    desc: string = "Affiche des informations sur une personne"
    usage: string = "ui <mention/id/rien>"
    categorie: string = "Informations"
    aliases: string[] = ["ui", "userinfo"]
    ownerOnly = false

    async execute(args: CommandParams) {
        let user: User = args.msg.mentions.users.first() || args.author
        if(args.bot.users.find(u => u.id == args.args[0]) !== null) user = args.bot.users.find(u => u.id == args.args[0])

        const member = args.guild.member(user);

        var mroles = await member.roles.map(roles => roles.name)
        mroles = removeArray(mroles, "@everyone")

        var tblMPerms: Array<string> = []
        var mperms: PermissionString[] = member.permissions.toArray()
        await mperms.forEach(element => {
            tblMPerms.push(uppercase(element))
        })

        var myinfo_embed = new RichEmbed()
            .setColor(member.highestRole.hexColor)
            .setThumbnail(user.avatarURL)
            .setAuthor(`Informations sur : ${user.tag}`, args.bot.user.avatarURL)
            .addField("Nickname:", `${member.nickname !== null ? `${member.nickname}` : 'None'}`, true)
            .addField("Identifiant :", `${user.id}`, true)
            .addField("Créé le :", `${dateInMyFormat(user.createdAt)} (${dayMonthInLetters(user.createdAt)[0] + " " + user.createdAt.getDate() + " " + dayMonthInLetters(user.createdAt)[1]})`, true)
            .addField("A rejoins le serveur le :", `${dateInMyFormat(member.joinedAt)} (${dayMonthInLetters(member.joinedAt)[0] + " " + member.joinedAt.getDate() + " " + dayMonthInLetters(member.joinedAt)[1]})`)
            .addField("Plus haut rôle :", member.highestRole.name, true)
            .addField("L'utilisateur est un bot ?", `${user.bot ? BASICEMOJIS.OKEMOJI : BASICEMOJIS.XEMOJI}`, true)
            .addField("Statut:", `${user.presence.status}`, true)
            .addField("Joue à:", `${user.presence.game ? user.presence.game.name : BASICEMOJIS.XEMOJI}`, true)
            .addField("Rôles:", `${mroles.length === 0 ? "Aucun 😕" : ("`" + mroles.sort(sortRole).reverse().join('`, `') + "`")}`, true)
            .addField("Permissions:", `${"`" + tblMPerms.sort().join("`, `") + "`"}`)
            .setFooter(`Demandé par : ${args.author.username}#${args.author.discriminator}`)
        args.channel.send(myinfo_embed)

        function uppercase(str: string): string {
            var array1 = str.split('_');
            var newarray1 = [];
            for (var x = 0; x < array1.length; x++) {
                newarray1.push(array1[x].charAt(0).toUpperCase() + array1[x].slice(1).toLowerCase());
            }
            return newarray1.join(' ');
        }

        function sortRole(r1: string, r2: string): number {
            var rf1: Role = args.guild.roles.find(roles => roles.name == r1)
            var rf2: Role = args.guild.roles.find(roles => roles.name == r2)
            return (rf1.position !== rf2.position) ? rf1.position - rf2.position : (rf1.id as unknown as number) - (rf2.id as unknown as number)
        }
    }
}