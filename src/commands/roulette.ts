import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import Character from "../structs/Character";
import Player, { hasCharacter } from "../structs/Player";
import { random } from "../utils/fonctions";

export default class RouletteCommand extends Command {
    name = "roulette"
    usage = "roulette <mise>"
    categorie = "RolePlay"
    desc = "Jeu de hasard. Vous avez 50% de chance de doubler la mise, 50% de chance de la perdre."
    ownerOnly = false

    async execute(args: CommandParams) {
        if(!args.args[0] || isNaN(parseInt(args.args[0]))) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Veuillez entrer une mise valide !**`); return}
        var mise = parseInt(args.args[0])
        if(!hasCharacter(args.author)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage !**`)}
        var author = new Character(new Player(args.author))
        if(author.getMoney() < mise) {args.channel.send(`${BASICEMOJIS} **Vous ne possédez pas assez d'argent pour miser \`${mise}\` drachmes (Vous en possédez \`${author.getMoney()}\` !**`)}
        if(random(0, 100) >= 50) {args.channel.send(`🤑 **Vous venez de remporter \`${mise}\` drachmes !**`);author.addMoney(mise)}
        else {args.channel.send(`💸 **Vous venez de perdre \`${mise}\` drachmes !**`);author.remMoney(mise)}
    }
}