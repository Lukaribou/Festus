import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Player, { hasPlayer } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";

export default class AchievementsCommand extends Command {
    name = "achievements"
    aliases = ["avt"]
    usage = "avt"
    categorie = "RolePlay"
    ownerOnly = false
    desc = "Affiche la liste de vos succès"

    async execute(args: CommandParams) {
        if(!hasPlayer(args.author)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour accéder à cette commande !**`); return}
        var pl: Player = new Player(args.author)
        var str: string = `**__Liste des succès de ${args.author.username} :__**\n`
        for(const ach in pl.achievements) {
            str += `\n\t**${pl.achievements[ach].title} :** ${pl.achievements[ach].desc}`
        }
        args.channel.send(str)
    }
}

export interface Achievement {
    title: string,
    description: string
}