import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Player, { hasCharacter } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";
import Character, { Weapon } from "../structs/Character";
import { random } from "../utils/fonctions";
import { RichEmbed, Message, ReactionCollector } from "discord.js";

export default class CombatCommand extends Command {
    usage = "combat <mention>"
    name = "combat"
    desc = "Organise un combat contre la personne mentionnée"
    ownerOnly = false
    categorie = "RolePlay"

    async execute(args: CommandParams) {
        var adv = args.msg.mentions.users.first()
        if (!adv) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez mentionner une personne à combattre**`); return }
        if (adv == args.author) { args.channel.send(`${BASICEMOJIS.XEMOJI} **La personne mentionnée ne doit pas être vous même**`); return }
        if (!hasCharacter(args.author)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez avoir un personnage pour combattre**`); return }
        if (!hasCharacter(adv)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **La personne mentionnée doit avoir un personnage**`); return }

        var cAuthor: Character = new Character(new Player(args.author))
        var cMentionne: Character = new Character(new Player(adv))

        var compteurTour: number = 0
        var toursArray: Map<number, Array<string>> = new Map()
        var winner: Character
        var loser: Character

        while (!cAuthor.isDead() && !cMentionne.isDead()) {
            compteurTour++
            var actionsArray: Array<string> = new Array()

            if (damagesOk(cAuthor.charact.stats.chance)) {
                var armorGet: boolean = armorGetSomeDamages(cMentionne.charact.stats.armor)
                cMentionne.gotDamages(armorGet ? damageBtw(cAuthor.charact.weapon) : (damageBtw(cAuthor.charact.weapon) / 2))
                actionsArray.push(armorGet ? `**${cAuthor.charact.name}** attaque **${cMentionne.charact.name}** et transperce son armure. (\`${cMentionne.charact.stats.health}/${cMentionne.charact.CONSTANTS_STATS.CONSTANT_HEALTH}\`)` : `**${cAuthor.charact.name}** attaque **${cMentionne.charact.name}** mais son armure encaisse des dégâts. (\`${cMentionne.charact.stats.health}/${cMentionne.charact.CONSTANTS_STATS.CONSTANT_HEALTH}\`)`)
            } else actionsArray.push(`**${cAuthor.charact.name}** attaque mais **${cMentionne.charact.name}** se protège et bloque son attaque.`)

            if (!cMentionne.isDead()) {
                if (damagesOk(cMentionne.charact.stats.chance)) {
                    var armorGet: boolean = armorGetSomeDamages(cAuthor.charact.stats.armor)
                    cAuthor.gotDamages(armorGet ? damageBtw(cMentionne.charact.weapon) : (damageBtw(cMentionne.charact.weapon) / 2))
                    actionsArray.push(armorGet ? `**${cMentionne.charact.name}** attaque **${cAuthor.charact.name}** et transperce son armure. (\`${cAuthor.charact.stats.health}/${cAuthor.charact.CONSTANTS_STATS.CONSTANT_HEALTH}\`)` : `**${cMentionne.charact.name}** attaque **${cAuthor.charact.name}** mais son armure encaisse des dégâts. (\`${cAuthor.charact.stats.health}/${cAuthor.charact.CONSTANTS_STATS.CONSTANT_HEALTH}\`)`)
                } else actionsArray.push(`**${cMentionne.charact.name}** attaque mais **${cAuthor.charact.name}** se protège et bloque son attaque.`)
            } else {
                actionsArray.push(`**${cMentionne.charact.name}** est KO. **${cAuthor.charact.name}** l'emporte !`)
                winner = cAuthor
                loser = cMentionne
            }

            if (cAuthor.isDead()) {
                actionsArray.push(`**${cAuthor.charact.name}** est KO. **${cMentionne.charact.name}** l'emporte !`)
                winner = cMentionne
                loser = cAuthor
            }

            await toursArray.set(compteurTour, actionsArray)
        }

        winner.addVictory()
        loser.addLose()

        var str: string = ""
        if (toursArray.size < 4) {
            for (const act of toursArray) {
                str += `\`Tour n°${act[0]}\`\n\t${act[1].join("\n\t")}\n\n`
            }
        } else {
            for (const act of toursArray) {
                if (act[0] == 1 || act[0] == 2 || act[0] == toursArray.size - 1 || act[0] == toursArray.size - 0) {
                    if(act[0] == toursArray.size - 1) {
                        str += "**`---------`**\n\n"
                    }
                    str += `\`Tour n°${act[0]}\`\n\n\t${act[1].join("\n\t")}\n\n`
                }
            }
        }

        // [0] = money; [1] = xp
        var winGain = [random(30, 50), random(75, 100)]
        var losGain = [random(5, 15), random(20, 35)]


        winner.addMoney(winGain[0])
        loser.addMoney(losGain[0])

        winner.addXp(winGain[1])
        loser.addXp(losGain[1])

        var eb: RichEmbed = new RichEmbed()
        .addField("👑 Vainqueur :", `${winner.charact.name} (\`${winner.player.user.username}\`)\nRécompenses :\nXP : **${winGain[1]}**\nArgent : **${winGain[0]}**`, true)
        .addField("🤧 Perdant :", `${loser.charact.name} (\`${loser.player.user.username}\`)\nRécompenses :\nXP : **${losGain[1]}**\nArgent : **${losGain[0]}**`, true)

        args.channel.send(str).then(() => args.channel.send(eb).then(async msg => {
            var win = winner.charact
            var los = loser.charact
            var analysticEmbed: RichEmbed = new RichEmbed()
            .setThumbnail("https://png.pngtree.com/png-vector/20190217/ourlarge/pngtree-vector-pie-chart-icon-png-image_555579.jpg")
            .addField("Nombre de tours joués :", toursArray.size, true)
            .addField("👑 - " + winner.player.user.username + " :", `Nom: ${win.name}\nClasse: ${win.classe}\nNiveau: ${win.level} \`(XP: ${win.xp})\`\nArme: ${win.weapon.fr_name}\nDégâts: (\`${win.weapon.damages.min}\` => \`${win.weapon.damages.max}\`)\nVictoires/Défaites: \`${win.CHARACT_STATS.victories}/${win.CHARACT_STATS.losses}\``)
            .addField("🤧 - " + loser.player.user.username + " :", `Nom: ${los.name}\nClasse: ${los.classe}\nNiveau: ${los.level} \`(XP: ${los.xp})\`\nArme: ${los.weapon.fr_name}\nDégâts: (\`${los.weapon.damages.min}\` => \`${los.weapon.damages.max}\`)\nVictoires/Défaites: \`${los.CHARACT_STATS.victories}/${los.CHARACT_STATS.losses}\``)
            msg = msg as Message
            await msg.react("📊")
            var reactManager: ReactionCollector = msg.createReactionCollector((_, user) => user.id == cAuthor.player.user.id || user.id == cMentionne.player.user.id)

            reactManager.on("collect", async reaction => {
                msg = msg as Message
                if(reaction.emoji.name == "📊") {
                    msg.edit(analysticEmbed)
                    await msg.clearReactions()
                    msg.react("🔙")
                } else if(reaction.emoji.name == "🔙") {
                    msg.edit(eb)
                    await msg.clearReactions()
                    msg.react("📊")
                }
            })          
        }))
    }
}

/**
 * @description Renvoie un nombre aléatoire entre le mini et le maxi de points de dégâts de l'arme
 * @param weapon L'arme de l'attaquant
 */
function damageBtw(weapon: Weapon): number {
    return random(weapon.damages.min, weapon.damages.max)
}

/**
 * @description Détermine si l'attaque fait des dégâts ou pas
 * @param attaqChance La chance qu'a l'attaquant de toucher sa cible
 */
function damagesOk(attaqChance: number): boolean {
    return attaqChance + 2 >= random(0, 20)
}

/**
 * @description Détermine si l'armure encaisse la moitié des dégâts ou non
 * @param defenseArmor L'armure du défenseur
 */
function armorGetSomeDamages(defenseArmor: number) {
    return random(0, 20) < defenseArmor
}