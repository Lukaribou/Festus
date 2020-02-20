import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { GuildMember, RichEmbed } from "discord.js";
import bot from "../Festus";
import { BASICEMOJIS } from "../utils/constants";
const xpdb = require("../../database/xp.json")

export default class RankCommand extends Command {
    name = "rank"
    usage = "rank <mention/id/rien>"
    categorie = "Autre"
    desc = "Affiche l'xp et le niveau d'une personne"
    ownerOnly = false

    async execute(args: CommandParams) {
        try {
            var user: GuildMember
            if(args.msg.mentions.users.first()) user = args.guild.member(args.msg.mentions.users.first())
            else if(bot.verificator.isIdOfMember(args.guild, args[0])) user = args.guild.member(args[0])
            else user = args.guild.member(args.author)

            if(!xpdb[user.id]) {args.channel.send(BASICEMOJIS.XEMOJI + " La personne mentionnée n'apparait pas dans la base de données. Il est possible que son xp soit de `0`")}
            var xpembed = new RichEmbed()
            .setAuthor(user.displayName, user.user.avatarURL)
            .setColor(user.displayHexColor)
            .setTitle(`Voici l'xp de ${user.displayName}`)
            .setThumbnail(user.user.displayAvatarURL)
            .addField("Niveau :", xpdb[user.id].level, true)
            .addField("Position dans le classement :", this.findInTop(args, user), true)
            .addField("XP :", xpdb[user.id].xp + "/" + xpdb[user.id].level * (xpdb[user.id].level / 2) * 100, true)
            .setFooter("ID utilisateur : " + user.id + " || Demandé par : " + args.author.tag)
            args.channel.send(xpembed)
        } catch (e) {
            args.channel.send(`Une erreur est survenue : \`\`\`${e}\`\`\``)
        }
    }

    private findInTop(args: CommandParams, user: GuildMember): string {
        var mgm: number = args.guild.memberCount - args.guild.members.filter(m => m.user.bot).size
        var compteur: number = 0
        var xptop: Array<any> = new Array(mgm)
        args.guild.members.filter(m => !m.user.bot).forEach(xpmember => {
            try {
                xptop[compteur] = [xpmember.user.username, xpdb[xpmember.id].xp, xpdb[xpmember.id].level, xpmember.user.id]
            } catch {
                xptop[compteur] = [xpmember.user.username, 0, 0, xpmember.user.id]
            }
            compteur++
        })
        xptop.sort(this.sortFunction).reverse()
        var pos: number = xptop.findIndex(tblUser => tblUser[3] == user.id)
        return `${pos + 1}/${xptop.length}`
    }

    private sortFunction(a, b): number {
        if (a[1] == b[1]) return 0
        else return (a[1] < b[1]) ? -1 : 1
    }
}