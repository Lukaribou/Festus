import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { random } from "../utils/fonctions";

export default class RollCommand extends Command {
    name = "roll"
    usage = "roll <max>"
    categorie = "Autre"
    aliases = ["random", "aléatoire"]
    desc = "Renvoie un nombre aléatoire entre 0 et le nombre renseigné"
    ownerOnly = false

    async execute(args: CommandParams) {
        var nbr: number = parseInt(args.args[0])
        if(!isNaN(nbr) && nbr > 0) args.channel.send(`🎲 Le nombre tiré est \`${random(0, nbr)}\``)
        else args.channel.send(`${BASICEMOJIS.XEMOJI} **La valeur rentrée n'est pas un nombre, est négative ou nulle !**`)
    }
}