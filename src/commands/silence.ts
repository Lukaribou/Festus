import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import bot from "../Festus";
import { BASICEMOJIS } from "../utils/constants";
import { saveConfig } from "../utils/fonctions";
const confdb = require("../../database/config.json")

export default class LockCommand extends Command {
    name = "silence"
    usage = "silence"
    categorie = "Modération"
    desc = "Empêche toutes les personnes non administrateurs de parler."
    ownerOnly = false

    async execute(args: CommandParams) {
        if(args.author.id != bot.ownerId && !args.guild.member(args.author).hasPermission("ADMINISTRATOR")) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Cette commande est réservée aux administrateurs du serveur**`); return}
        confdb.silence = !confdb.silence
        saveConfig()
        args.channel.send(`${BASICEMOJIS.OKEMOJI} **Mode silence ${confdb.silence ? "actif" : "inactif"}**`)
        console.log(`${args.author.username} a ${confdb.silence ? "activé" : "désactivé"} le mode silence.`)
    }
}