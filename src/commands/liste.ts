import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";

export default class ListeCommand extends Command {
    name = "liste"
    desc = "Affiche la liste demandée"
    aliases = ["list"]
    categorie = "Informations"
    usage = "liste <liste demandée>"
    ownerOnly = false

    async execute(args: CommandParams) {
        var toList: string = args.args[0]
        if (!toList) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Veuillez entrer la liste à afficher. \`${args.bot.prefixes[0]}liste list\` pour afficher les listes disponibles.**`); return }
        switch(toList) {
            case "membres":
            case "members":
                var list = args.guild.members.map(m => `\`${m.user.username}\` => ${m.id}`).sort().join("\n")
                args.channel.send(list)    
            break
            case "roles":
                var list = args.guild.members.map(m => `\`${m.user.username}\` => ${m.id}`).sort().join("\n")
                args.channel.send(list)
                var roles = args.guild.roles.map(roles => `\`${roles.name}\` => ${roles.id}`).sort().join("\n").replace("@everyone", "everyone")
                args.channel.send("**__Nom du rôle => identifiant du rôle__** \n\n" + roles)
            break
            case "list":
                args.channel.send("📜 **Voici les listes disponibles :**\n\t•`membres/members`: La liste des membres du serveur\n\t•`roles`: La liste des rôles du serveur")
            break
        }
    }
}