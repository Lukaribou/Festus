import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import Player, { hasCharacter } from "../structs/Player";
import bot from "../Festus";
import Character from "../structs/Character";

export default class GiveCommand extends Command {
    name = "give"
    usage = "give <mention/id> <somme>"
    categorie = "RolePlay"
    desc = "Verse la somme d'argent à une autre personne."
    ownerOnly = false
    
    async execute(args: CommandParams) {
        var receveur = args.msg.mentions.users.first() || bot.users.get(args.args[0])
        if(!receveur){args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez renseigner un utilisateur à qui verser la somme !**`); return}
        if(!hasCharacter(receveur)){args.channel.send(`${BASICEMOJIS.XEMOJI} **La personne renseignée doit posséder un personnage !**`); return}
        if(!hasCharacter(args.author)){args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage !**`); return}
        var somme = parseInt(args.args[1])
        if(!somme || isNaN(somme)){args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez rentrer une somme valide !**`); return}
        if(somme < 0){args.channel.send(`${BASICEMOJIS.XEMOJI} **La somme à transférer doit être positive !**`); return}
        if(args.author == receveur){args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous ne pouvez pas vous transférer de l'argent à vous même !**`); return}
        var donnant = new Character(new Player(args.author))
        if(donnant.getMoney() < somme){args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous ne pouvez pas donner plus d'argent que vous n'en avez !**`); return}
        var recevant = new Character(new Player(receveur))

        recevant.addMoney(somme)
        donnant.remMoney(somme)
        args.channel.send(`${BASICEMOJIS.OKEMOJI} **Transfert effectué avec succès !**`)
    }
}