import { Festus } from "../Festus";
import { Guild } from "discord.js";

export class Verificator {
    private readonly _bot: Festus

    constructor(bot: Festus) {
        this._bot = bot
    }

    get bot(): Festus {
        return this._bot
    }

    public isIdOfMember(guild: Guild, identifiant: string): boolean {
        return this.bot.users.find(u => u.id == identifiant) != null
    }

    /**
     * @description Vérifie si l'identifiant donné est celui d'un rôle sur le serveur
     * @returns {boolean} Si l'identifiant donné est celui d'un rôle sur le serveur
     * @param {Message} msg Le serveur où le rôle est censé être
     * @param {string} identifiant L'identifiant à vérifier
     */
    public isRoleWithId(guild: Guild, identifiant: string): boolean {
        return guild.roles.has(identifiant)
    }

    /**
     * @description Vérifie si le serveur possède un rôle du même nom
     * @returns {boolean} Si le serveur possède un rôle du même nom
     * @param guild Le serveur où le rôle est censé être
     * @param nom  Le nom de rôle à vérifier
     * @param strict Choisir le mode : false = noms .toLowerCase()
     */
    public isRoleWithName(guild: Guild, nom: string, strict: boolean = false): boolean {
        if(strict) return guild.roles.find(r => r.name == nom) != null
        else return guild.roles.find(r => r.name.toLowerCase() == nom.toLowerCase()) != null
    }
}