import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { Message } from "discord.js";
import { createCharacter, hasCharacter } from "../structs/Player";
import { confdb } from "../Festus";

const timeError = `${BASICEMOJIS.XEMOJI} **Temps imparti écoulé ! Annulation...**`

export default class CreateCharacterCommand extends Command {
    name = "creer-personnage"
    desc = "Permet de créer son personnage pour la catégorie \"RolePlay\" du bot."
    categorie = "RolePlay"
    usage = "cp => Suivre les instructions"
    aliases = ["cp"]
    ownerOnly = false

    async execute(args: CommandParams) {
        var ok: boolean = false, del = false
        if (hasCharacter(args.author)) {
            await args.channel.send(`${BASICEMOJIS.WARNINGEMOJI} **Vous possédez déjà un personnage ! Voulez-vous vraiment écraser celui-ci et en créer un nouveau ?**`).then(async (m: Message) => {
                while (!ok && !del) {
                    await m.react(BASICEMOJIS.OKEMOJI)
                    await m.react(BASICEMOJIS.XEMOJI)
                    await m.awaitReactions((_, user) => user.id == args.author.id, { max: 1, time: 60000, errors: ["time"] }).then(async col => {
                        if (col.first().emoji.name == BASICEMOJIS.OKEMOJI) { await m.edit(`${BASICEMOJIS.OKEMOJI} **Votre ancien personnage sera écraser. (Si vous annulez la création de votre nouveau personnage, l'ancien ne sera pas détruit)**`); ok = true }
                        else if (col.first().emoji.name == BASICEMOJIS.XEMOJI) { await m.edit(`${BASICEMOJIS.XEMOJI} **Annulation...**`); del = true }
                    }).catch(() => { m.edit(timeError); return })
                    m.clearReactions()
                }
            })
        }
        if (del) return
        ok = false
        //TODO: Vérifier si il a déjà un personnage et demander avant de le supprimer
        var per: any = { name: null, classe: null }
        await args.channel.send(`${BASICEMOJIS.OKEMOJI} **Nous allons commencer à créer votre personnage ensemble. Rentrez \`annuler\` à tout moment pour arrêter.** <@${args.author.id}>`)
        var msg: Message = await args.channel.send(`${BASICEMOJIS.RIGHTARROW} **(1/3) Donnez un \`nom\` à votre personnage (0 ponctuation, 0 chiffres, longueur supérieure à 2): *Gardez ce message, il vous donnera les instructions à suivre.***`) as Message
        while (!ok && !del) {
            await args.channel.awaitMessages(m => m.author.id == args.author.id, { max: 1, time: 60000, errors: ['time'] }).then(res => {
                if (res.first().content.match(/[0-9]+/gm)) { msg.edit(`${BASICEMOJIS.XEMOJI} **Il semblerait que le nom comporte des chiffres !**`); return }
                if (res.first().content.length < 3) { msg.edit(`${BASICEMOJIS.XEMOJI} **Le nom du personnage doit être \`supérieur à 2 caractères\` !**`); return }
                if (res.first().content.match(/[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]+/gm)) { msg.edit(`${BASICEMOJIS.XEMOJI} **Le nom ne doit comporter \`aucune ponctuation\` !**`); return }
                if (res.first().content == "annuler") { msg.edit(`${BASICEMOJIS.RIGHTARROW} **Annulation...**`); del = true; return }
                per.name = res.first().content, ok = true
                res.first().delete()
            }).catch(() => { msg.edit(timeError); del = true; return })
        }
        if (del) return
        ok = false
        await msg.edit(`${BASICEMOJIS.OKEMOJI} **(2/3)Bien, votre nom sera \`${per.name}\`\n${BASICEMOJIS.RIGHTARROW} Maintenant vous allez choisir votre classe.\n\`\`\`⚔ Hoplite : +PV, -Dégâts\n🏹 Archer : ~PV, ~Dégâts\n🗡 Assassin : -PV, +Dégâts\`\`\`Choisissez votre classe en utilisant les réactions ci-dessous !** ${BASICEMOJIS.XEMOJI} *Pour annuler*`)
        while (!ok && !del) {
            await msg.react("⚔")
            await msg.react("🏹")
            await msg.react("🗡")
            await msg.react(BASICEMOJIS.XEMOJI)
            await msg.awaitReactions((_, user) => user.id == args.author.id, { max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                switch (collected.first().emoji.name) {
                    case "⚔":
                        per.classe = "HOPLITE"
                        ok = true
                        break
                    case "🏹":
                        per.classe = "ARCHER"
                        ok = true
                        break
                    case "🗡":
                        per.classe = "ASSASSIN"
                        ok = true
                        break
                    case BASICEMOJIS.XEMOJI:
                        del = true
                        await msg.edit(`${BASICEMOJIS.RIGHTARROW} **Annulation...**`)
                        break
                    default:
                        await msg.clearReactions()
                }
            }).catch(() => { msg.edit(timeError); del = true; return })
            if (del) return
            await msg.clearReactions()
            await msg.edit(`${BASICEMOJIS.RIGHTARROW} **(3/3)Nom : \`${per.name}\`, classe : \`${per.classe}\`.\nConfirmer ?**`)
            ok = false
            while (!ok && !del) {
                await msg.react(BASICEMOJIS.OKEMOJI)
                await msg.react(BASICEMOJIS.XEMOJI)
                await msg.awaitReactions((_, user) => user.id == args.author.id, { max: 1, time: 60000, errors: ["time"] }).then(async res => {
                    if (res.first().emoji.name == BASICEMOJIS.OKEMOJI) ok = true
                    else if (res.first().emoji.name == BASICEMOJIS.XEMOJI) { await msg.edit(`${BASICEMOJIS.RIGHTARROW} **Annulation**`); del = true }
                }).catch(() => { msg.edit(timeError); del = true; return })
                await msg.clearReactions()
            }
            if (del) return
            await createCharacter(args.author, per).then(() => {
                msg.edit(`${BASICEMOJIS.OKEMOJI} **Votre personnage a bien été créé !**`)
            }).catch(e => {
                console.log(e)
                msg.edit(`${BASICEMOJIS.XEMOJI} ${BASICEMOJIS.WARNINGEMOJI} **Une erreur est survenue. Envoyez un message à <@${confdb.ownerId}> pour lui signaler (et avoir l'erreur si vous le souhaitez).**`)
            })
        }
    }
}