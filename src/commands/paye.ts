import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Player, { hasCharacter } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";
import Character from "../structs/Character";
import { savePlayers, convertMsToS_M } from "../utils/fonctions";

export default class PayeCommand extends Command {
    name = "paye"
    categorie = "RolePlay"
    desc = "Collecte votre paye journalière"
    usage = "paye"
    ownerOnly = false

    async execute(args: CommandParams) {
        if(!hasCharacter(args.author)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour récupérer une paye !**`); return}
        var author = new Character(new Player(args.author))
        if(author.charact.inventory.lastpay == null || Math.floor((Date.now() - (author.charact.inventory.lastpay as any))) >= 86400000) { // 86400000ms = 24h
            author.addMoney(200 + (author.charact.level * 10))
            author.charInDb.inventory.lastpay = Date.now()
            savePlayers()
            args.channel.send(`${BASICEMOJIS.OKEMOJI} **\`${200 + (author.charact.level * 10)}\` drachmes ont été ajoutées à votre compte ! Revenez dans \`24h\` !**`)
        } else {
            var delay = convertMsToS_M(86400000 - (Date.now() - (author.charact.inventory.lastpay as any)))
            args.channel.send(`${BASICEMOJIS.XEMOJI} **Veuillez patienter encore \`${delay.hours != 0 ? delay.hours + " heures " : ""}${delay.hours != 0 ? delay.minutes + " minutes et " : ""}${delay.secondes} secondes\` avant de pouvoir récupérer votre paye !**`)
        }
    }
}