import Command from "../structs/Command"
import CommandParams from "../structs/CommandParams"
import {BASICEMOJIS} from "../utils/constants"

export default class ShutdownCommand extends Command {
    name: string = "shutdown"
    desc: string = "Couper le bot"
    usage: string = "shutdown"
    ownerOnly: boolean = true
    categorie: string = "Système"

    async execute(args: CommandParams) {
        if(args.author.id != args.bot.ownerId) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Cette commande est réservée au propriétaire du bot**`); return }
        args.channel.send(`${BASICEMOJIS.OKEMOJI} **Arrêt du bot imminent...**`)
        console.log(new Date + " - Arrêt après commande shutdown")
        args.bot.destroy()
    }
}