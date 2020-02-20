import { User } from "discord.js";
import { playersdb } from "./Character";
import { savePlayers } from "../utils/fonctions";
import { getDefaultWeaponName, CLASSE_RP } from "../utils/constants";
import { MythomagicCard } from "../commands/mythomagic";

export default class Player {
    user: User;
    achievements: any;

    constructor(user: User) {
        this.user = user,
        this.achievements = playersdb[this.user.id].achievements
    }

    public addMythomagic(card: MythomagicCard): void {
        if(playersdb[this.user.id].mythomagic.cards[card.name]) playersdb[this.user.id].mythomagic.cards[card.name].count++
        else playersdb[this.user.id].mythomagic.cards[card.name] = {
            count: 1
        }
        savePlayers()
    }

    public upMythomagic(user: User, card: MythomagicCard): void {
        playersdb.mythomagic.lastgain = {
            date: Date.now(),
            userId: user.id,
            cardName: card.name
        }
        savePlayers()
    }

    public hasMythomagic(name: string): boolean {
        return playersdb[this.user.id].mythomagic.cards[name]
    }

    public hasAchievement(title: string): boolean {
        return playersdb[this.user.id].achievements[title]
    }

    public addAchievement(title: string, description: string): void {
        playersdb[this.user.id].achievements[title] = {
            title: title,
            desc: description
        }
        savePlayers()
    }
}

export function hasCharacter(user: User): boolean {
    if(!hasPlayer(user)) return false
    else if (playersdb[user.id].character) return true
    else return false
}

export function hasPlayer(user: User): boolean {
    if (playersdb[user.id]) return true
    else return false
}

export interface ICreateCharacter {
    name: string,
    classe: CLASSE_RP,
    weaponName: string,
    level: number,
    xp: number,
    inventory: {
        money: number,
        lastpay: null,
        objects: Array<string>
    },
    CHARACT_STATS: {
        victories: number,
        losses: number
    }
}

/**
 * @description Crée le personnage à l'utilisateur. ATTENTION : Ne fait pas de vérifications !
 * @param user L'utilisateur à qui créer le personnage
 * @param params Les infos à mettre
 */
export function createCharacter(user: User, params: ICreateCharacter): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            if (!hasPlayer(user)) {
                playersdb[user.id] = {
                    character: {},
                    achievements: {},
                    mythomagic: {
                        cards:{}
                    }
                }
                savePlayers()
            }
            playersdb[user.id].character = {
                name: params.name,
                classe: params.classe,
                weaponName: getDefaultWeaponName(params.classe),
                level: 1,
                xp: 0,
                inventory: {
                    money: 50,
                    lastpay: null,
                    objects: [],
                },
                CHARACT_STATS: {
                    victories: 0,
                    losses: 0
                }
            }
            savePlayers()
            resolve()
        } catch (e) { reject(e) }
    })
}