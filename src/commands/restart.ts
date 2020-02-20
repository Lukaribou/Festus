import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";

export default class RestartCommand extends Command {
    name: string = "restart"
    desc: string = "Redémarrer le bot"
    usage: string = "restart"
    categorie: string = "Système"
    ownerOnly: boolean = true

    async execute(args: CommandParams) {
        if(args.author.id != args.bot.ownerId) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Cette commande est réservée au propriétaire du bot**`); return }
        args.channel.send(`${BASICEMOJIS.OKEMOJI} **Arrêt du bot imminent...**`)
        console.log(new Date + " - Redémarrage après commande restart")
        await args.bot.destroy()
        await args.bot.login(args.bot.config.token)
        args.channel.send(`${BASICEMOJIS.OKEMOJI} **Redémarrage effectué avec succès !**`)
        console.log(new Date + " - Le redémarrage est un succès")
    }
}