import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Player, { hasCharacter } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";
import Character from "../structs/Character";
import { getItem } from "./buy";

export default class DisplayItemsCommand extends Command {
    name = "afficher-objets"
    aliases = ["aobj"]
    usage = "aobj"
    categorie = "RolePlay"
    desc = "Affiche vos objets et leurs descriptions"
    ownerOnly = false

    async execute(args: CommandParams) {
        if(!hasCharacter(args.author)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour cette commande !**`); return}
        var per: Character = new Character(new Player(args.author))
        var str: string = `**__Liste des objets de ${per.charact.name} :__**\n`
        await per.getInventory().forEach(o => {
            var x = getItem(o)
            str += `\n**${x.name} :** \n\t\`Utilité :\`${x.description}\n\t\`Code :\` ${x.db_name}`
        })
        args.channel.send(str)
    }
}