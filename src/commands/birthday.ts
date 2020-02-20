import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { Message, User } from "discord.js";
import { saveBirth } from "../utils/fonctions";
import bot from "../Festus";
export const bidb = require("../../database/birthdays.json")

export default class BirthdayCommand extends Command {
    name = "birthday"
    aliases = ["birth", "anniv"]
    categorie = "Autre"
    usage = "birth"
    desc = "Permet d'ajouter/modifier votre date de naissance au bot"
    ownerOnly = false

    async execute(args: CommandParams) {
        if(bidb[args.author.id]) {
            await args.channel.send(`${BASICEMOJIS.WARNINGEMOJI} Une date d'anniversaire est déjà enregistrée: \`${bidb[args.author.id].date}\`. Souhaitez-vous la supprimer ?`).then(async (m: Message) => {
                await m.react(BASICEMOJIS.OKEMOJI)
                await m.react(BASICEMOJIS.XEMOJI)
                await m.awaitReactions((_, u: User) => u.id == args.author.id, {max: 1, time: 60000, errors: ["time"]}).then(async r => {
                    if(r.first().emoji.name == BASICEMOJIS.OKEMOJI) {await m.edit(`${BASICEMOJIS.OKEMOJI} **Votre date d'anniversaire va être changée**`); getBirth()}
                    else if(r.first().emoji.name == BASICEMOJIS.XEMOJI) {await m.edit(`${BASICEMOJIS.XEMOJI} **Votre date d'anniversaire reste le \`${bidb[args.author.id].date}\`**`)}
                }).catch(() => {m.delete().catch(); return})
            })
        } else getBirth()

        async function getBirth(): Promise<void> {
            // Faire avec un awaitMessages avec la date en jour/mois
            var date: Array<string> = []
            var ok: boolean = false
            var msg: Message = await args.channel.send(`${BASICEMOJIS.RIGHTARROW} Donnez votre date d'anniversaire au format **jour/mois** (ex: 03/09):`) as Message
            while(!ok) {
                await args.channel.awaitMessages(m => m.author.id == args.author.id, {max: 1, time: 60000, errors: ["time"]}).then(async res => {
                    var cont: string = res.first().content.replace(" ", "")
                    if(!cont.match(/\//gm)) {msg.edit(`${BASICEMOJIS.XEMOJI} **Je ne détecte pas le \`/\` séparant le jour du mois**`); return}
                    if(cont.length > 5) {msg.edit(`${BASICEMOJIS.XEMOJI} **Longueur de \`${cont}\` > 5. Cette date n'est pas valide.**`); return}
                    if(cont.match(/[a-zA-Z]/gm)) {msg.edit(`${BASICEMOJIS.XEMOJI} **Caractère(s) non autorisé détecté.**`); return}
                    date = cont.split("/"), ok = true
                    res.first().delete()
                }).catch(() => {msg.delete().catch(); return})
            }
            if(date[0].length == 1) date[0] = '0' + date[0]
            if(date[1].length == 1) date[1] = '0' + date[1]
            await addBirth(args.author.id, date[0] + "/" + date[1])
            await args.channel.send(`${BASICEMOJIS.OKEMOJI} **Vous devriez recevoir un message privé dans très peu de temps *si il a la possibilité de vous en envoyer un*.**`)
            var m: string = `${BASICEMOJIS.OKEMOJI} **Votre date d'anniversaire est définie comme étant le \`${bidb[args.author.id].date}\`.\nMa vérification pour voir si nous sommes le jour d'un anniversaire se fait à 06h00 (heure française)**\n*Si ce n'est pas la date valide, merci de contacter <@${args.bot.ownerId}>*`
            args.author.send(m).catch(_ => {
                args.channel.send(m.replace(`<@${args.bot.ownerId}>`, `**${args.bot.users.get(args.bot.ownerId) ? args.bot.users.get(args.bot.ownerId).username : "mon créateur"}**`))
            })
        }

        async function addBirth(id: string, d: string): Promise<void> {
            bidb[id] = {
                date: d
            }
            saveBirth()
        }
    }
}