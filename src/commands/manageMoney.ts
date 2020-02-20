import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import bot, { confdb } from "../Festus";
import { BASICEMOJIS } from "../utils/constants";
import Player, { hasCharacter } from "../structs/Player";
import { User, Message } from "discord.js";
import Character from "../structs/Character";

export default class ManageMoneyCommand extends Command {
    name = "gérer-argent"
    categorie = "RolePlay"
    aliases = ["ga"]
    usage = "ga <id/mention> <somme (négatif pour retirer)>"
    desc = "Permet de rajouter ou retirer de l'argent à n'importe quel personnage"
    ownerOnly = true

    async execute(args: CommandParams) {
        if (args.author.id != confdb.ownerId) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Cette commande est réservée au propriétaire du bot !**`); return }
        var mention: User = args.msg.mentions.users.first() || bot.users.find(u => u.id == args.args[0])
        if (!mention) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez mentionner quelqu'un ou donner son identifiant !**`); return }
        if (!hasCharacter(mention)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **La personne mentionnée n'a pas de personnage !**`); return }
        if (!args.args[1]) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez rentrer une somme à ajouter/retirer !**`); return }
        var somme: number = parseInt(args.args[1])
        if (isNaN(somme)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **\`${args.args[1]}\` n'est pas un nombre !**`); return }
        var pers: Character = new Character(new Player(mention))
        if (somme < 0 && pers.getMoney() + somme < 0) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Le seuil d'argent ne doit pas être négatif !**`); return }
        args.channel.send(`${BASICEMOJIS.WARNINGEMOJI} **Souhaitez vous vraiment ${somme < 0 ? "retirer" : "ajouter"} \`${Math.abs(somme)}\` drachmes à \`${pers.charact.name + ` (${mention.username})`}\` ?** Son solde sera de : \`${pers.getMoney() + somme}\` drachmes.`).then(async (msg: Message) => {
            await msg.react(BASICEMOJIS.OKEMOJI)
            await msg.react(BASICEMOJIS.XEMOJI)
            await msg.awaitReactions((_, user) => user.id == args.author.id, { max: 1, time: 30000, errors: ["time"] }).then(col => {
                if (col.first().emoji.name == BASICEMOJIS.OKEMOJI) {
                    pers.addMoney(somme)
                    msg.edit(`${BASICEMOJIS.OKEMOJI} **${somme < 0 ? "Retrait" : "Ajout"} accepté !**`)
                } else if (col.first().emoji.name == BASICEMOJIS.XEMOJI) {msg.edit(`${BASICEMOJIS.XEMOJI} **${somme < 0 ? "Retrait" : "Ajout"} annulé !**`)}
            }).catch(() => { msg.edit(msg.content + `\n${BASICEMOJIS.XEMOJI} **Temps imparti écoulé !**`); return })
            await msg.clearReactions()
        })
    }
}