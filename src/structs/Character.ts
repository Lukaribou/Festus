import Player from "./Player";
import { ARCHERS_DEFAULT_PROPS, ASSASSINS_DEFAULT_PROPS, HOPLITES_DEFAULT_PROPS, CLASSE_RP, BASICEMOJIS } from "../utils/constants"
import { savePlayers } from "../utils/fonctions";
import { existItem } from "../commands/buy";

export const playersdb = require("../../database/players.json")

export interface ICharacter {
    name: string,
    classe: CLASSE_RP,
    weapon: Weapon,
    inventory: {
        money: number,
        lastpay: Date | null
        objects: Array<string>
    },
    level: number,
    stats: {
        health: number,
        armor: number,
        chance: number
    },
    xp: number,
    CONSTANTS_STATS: {
        CONSTANT_HEALTH: number,
        CONSTANT_ARMOR: number
    },
    CHARACT_STATS: {
        victories: number,
        losses: number
    }
}

export default class Character {
    player: Player;
    charInDb: any;
    charact: ICharacter;

    constructor(player: Player) {
        this.player = player
        this.charInDb = playersdb[this.player.user.id].character
        this.setupChar(this.charInDb)
    }

    private setupChar(db: any): void {
        this.charact = {
            name: db.name,
            classe: db.classe.toUpperCase(),
            weapon: this.getWeapon(db.weaponName),
            inventory: {
                money: db.inventory.money,
                lastpay: db.inventory.lastpay,
                objects: db.inventory.objects
            },
            level: db.level,
            xp: db.xp,
            stats: {
                health: this.getHealthConst(db.classe, db.level),
                armor: this.getArmorConst(db.classe, db.level),
                chance: this.getProp(db.classe, "chance")
            },
            CONSTANTS_STATS: {
                CONSTANT_HEALTH: this.getHealthConst(db.classe, db.level),
                CONSTANT_ARMOR: this.getArmorConst(db.classe, db.level)
            },
            CHARACT_STATS: {
                victories: db.CHARACT_STATS.victories,
                losses: db.CHARACT_STATS.losses
            }    
        }
    }

    private getGoodProps(classe: string): object {
        switch (classe) {
            case "ASSASSIN":
                return ASSASSINS_DEFAULT_PROPS
            case "ARCHER":
                return ARCHERS_DEFAULT_PROPS
            case "HOPLITE":
                return HOPLITES_DEFAULT_PROPS
        }
    }

    private getProp(classe: string, desiree: string): any {
        var props: object = this.getGoodProps(classe)
        return props[desiree]
    }

    private getHealthConst(classe: string, level: number): number {
        var he: number = 0
        for (var i = 1; i < level; i++) he += 10
        return this.getProp(classe, "health") + he
    }

    private getArmorConst(classe: string, level: number): number {
        var ar: number = 0
        for (var i = 1; i < level; i++) ar += 0.1
        return this.getProp(classe, "armor") + ar
    }

    public gotDamages(degatsAmount: number): void {
        this.charact.stats.health -= degatsAmount
    }

    /**
     * Renvoie true si la vie de la personne est <= à 0
     */
    public isDead(): boolean {
        return this.charact.stats.health <= 0
    }

    /**
     * @description Renvoie les noms des objets que possède la personne
     */
    public getInventory(): string[] {
        return this.charact.inventory.objects
    }

    /**
     * @description Ajoute la somme à l'utilisateur
     * @param somme Le montant à rajouter
     */
    public addMoney(somme: number): void {
        this.charInDb.inventory.money += somme
        savePlayers()
    }

    /**
     * @description Retire la somme donnée ⚠ Ne regarde pas si la personne a suffisament pour ne pas se retrouver money < 0
     * @param somme Le montant à retirer
     */
    public remMoney(somme: number): void {
        this.charInDb.inventory.money -= somme
        savePlayers()
    }

    /**
     * @description Renvoie l'argent que possède la personne
     */
    public getMoney(): number {
        return this.charInDb.inventory.money
    }

    /**
     * @description Renvoie l'arme (en objet) correspondant au nom donné
     * @param weaponName Le nom de l'arme (nom anglais)
     */
    private getWeapon(weaponName: string): Weapon {
        return weapdb[weaponName]
    }

    /**
     * @description Ajoute 1 victoire à la personne
     */
    public addVictory(): void {
        this.charInDb.CHARACT_STATS.victories++
        savePlayers()
        this.charact.CHARACT_STATS.victories++
    }

    /**
     * @description Ajoute 1 défaite à la personne
     */
    public addLose(): void {
        this.charInDb.CHARACT_STATS.losses++
        savePlayers()
        this.charact.CHARACT_STATS.losses++
    }

    /**
     * @description Rajoute x XP à la personne
     * @param xp Le nombre d'XP à rajouter
     */
    public addXp(xp: number): void {
        this.charInDb.xp += xp
        savePlayers()
        this.toLevelUp()
    }

    /**
     * @description Renvoie true si le personnage possède déjà l'objet dans son inventaire
     * @param obj Le nom de l'objet à vérifier
     */
    public hasInInventory(obj: string): boolean {
        return this.charact.inventory.objects.includes(obj)
    }

    /**
     * @description Ajoute l'objet à l'inventaire de la personne
     * @param obj Le nom de l'objet (nom dans la bdd)
     */
    public addInInventory(obj: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (existItem(obj)) {
                this.charInDb.inventory.objects.push(obj)
                savePlayers()
                resolve(true)
            } else reject(`NONEXISTANT ITEM : ${obj}`)
        })
    }

    /**
     * @description Vérifie si le personnage a assez d'xp pour passer au niveau supérieur et procède si oui
     */
    public toLevelUp(): void {
        if (this.charact.xp >= this.charact.level * (this.charact.level / 2) * 93) {
            try {
                this.charInDb.level++
                this.addMoney(this.charact.level * 10)
                this.player.user.send(`${BASICEMOJIS.TADAEMOJI} **${this.charact.name} vient de passer au niveau supérieur ! Vous gagnez \`${this.charact.level * 10}\` drachmes !**`)
            } catch (_) {return}
        }
    }
}

export interface Weapon {
    name: string,
    fr_name: string,
    damages: {
        min: number,
        max: number
    },
    classe: string,
    rank: number,
    price: number
}

export const weapdb = require("../../database/weapons.json")

/**
 * @description Retourne le rank de l'arme du personnage en français
 */
export function getRankInFr(rank: number): string {
    switch (rank) {
        case 1:
            return "Bois"
        case 2:
            return "Fer"
        case 3:
            return "Or impérial"
        case 4:
            return "Bronze céleste"
        case 5:
            return "Fer stygien"
        case 6:
            return "Primitif"
    }
}