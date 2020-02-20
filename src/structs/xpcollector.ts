import { Festus } from "../Festus";
import { saveXp, random } from "../utils/fonctions";
import { User, RichEmbed, TextChannel } from "discord.js";
const xpdb = require("../../database/xp.json")
const confdb = require("../../database/config.json")

export default class XpCollector {
    private readonly _bot: Festus
    private _cooldown: Set<any>
    constructor(bot: Festus) {
        this._bot = bot
        this._cooldown = new Set()
    }

    get cooldown(): Set<any> {return this._cooldown}
    get bot(): Festus {return this._bot}

    /**
     * Ajoute l'xp à la personne si il respècte les conditions
     * @param author L'auteur du message
     */
    checkAndAdd(author: User): void {
        if(this.cooldown.has(author.id)) return
        else {
            addXp(author.id)
            this.cooldown.add(author.id)
            var embed: boolean | RichEmbed = nextLvl(author)
            if(embed) {
                try {
                    var chanLvl: TextChannel = this.bot.channels.find(c => c.id == confdb.channelLvl) as TextChannel
                    chanLvl.send(author, embed as RichEmbed)
                } catch (e) {
                    author.send(embed)
                    throw new Error("Le salon pour l'xp n'est pas défini ou invalide !")
                }
            }
        }
        setTimeout(() => {
            this.cooldown.delete(author.id)
        }, 5000)
    }
}

/**
 * @description Ajoute de l'xp à une personne (sans passer par la vérification des conditions)
 * @param userId L'id de l'utilisateur à qui ajouter l'xp
 */
export function addXp(userId: string): void {
    if(!xpdb[userId]) {
        xpdb[userId] = {
            xp: random(10, 20),
            level: 1
        }
    } else xpdb[userId].xp += random(10, 20)
    saveXp()
}

/**
 * @description Renvoie un embed de passage de niveau (et augmente le niveau dans la db) si la personne est valide au passage
 * @param user L'utilisateur concerné par le possible passage de niveau
 */
export function nextLvl(user: User): RichEmbed | boolean {
    var nextLvl: number = xpdb[user.id].level * (xpdb[user.id].level / 2) * 100
    if(nextLvl <= xpdb[user.id].xp) {
        xpdb[user.id].level++
        saveXp()
        return new RichEmbed()
        .setTitle("Passage au niveau supérieur !")
        .setAuthor(user.tag, user.displayAvatarURL)
        .setDescription(`Bien joué ! Tu passes au niveau \`${xpdb[user.id].level}\` ! 🎉\nProchain niveau à ${xpdb[user.id].level * (xpdb[user.id].level / 2) * 100}xp ! 📌`)
    } else return false
}