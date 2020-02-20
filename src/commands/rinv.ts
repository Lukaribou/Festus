import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { Role } from "discord.js";

export default class RInvCommand extends Command {
    name = "r-inv"
    aliases = ["rinv", "rinventaire"]
    categorie = "Informations"
    desc = "Fait l'inventaire des rôles commençant par \"Enfant\" en fonction du nombre de personnes possédant les rôles"
    ownerOnly = false
    usage = "r-inv"

    async execute(args: CommandParams) {
        var invMessage: string = `\`Nom du rôle\` => \`Nombre de personnes l'ayant\`\n\n`
        var rolesOfGuild: Array<Role> = []
        args.guild.roles.forEach(r => {
            if(r.name.startsWith("Enfant")) rolesOfGuild.push(r)
        })
        rolesOfGuild = rolesOfGuild.sort((a, b) => a.members.size - b.members.size).reverse()
        rolesOfGuild.forEach(r => {
            var regex: RegExp = /\b(d['|e])\b/
            var arr: Array<String> = r.name.split(regex)
            invMessage += `${arr[0]} ${arr[1]}${arr[2].startsWith(" ") ? (" \`" + arr[2].trimStart()) : ("\`" + arr[2])}\` => \`${r.members.size}\` membre(s)\n`
        })
        args.channel.send(invMessage)
    }
}