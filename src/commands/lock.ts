import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import bot from "../Festus";
import { BASICEMOJIS } from "../utils/constants";
import { saveConfig } from "../utils/fonctions";
const confdb = require("../../database/config.json")

export default class LockCommand extends Command {
    name = "lock"
    usage = "lock"
    categorie = "Système"
    desc = "Empêche le bot de réagir à toute commande"
    ownerOnly = false

    async execute(args: CommandParams) {
        if(args.author.id != bot.ownerId && !args.guild.member(args.author).hasPermission("ADMINISTRATOR")) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Cette commande est réservée au propriétaire du bot et aux administrateurs du serveur**`); return}
        if(confdb.lock == false) {
            confdb.lock = true
            saveConfig()
            args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le bot ne réagit désormais plus aux commandes**`)
        } else {
            confdb.lock = false
            saveConfig()
            args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le bot réagit de nouveau aux commandes**`)
        }
        console.log(`${args.author.username} a mit le lock sur : ${confdb.lock}`)
    }
}