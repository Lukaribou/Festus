import { RichEmbed, TextChannel, Guild } from "discord.js";
import { writeFile } from "fs";
import { playersdb } from "../structs/Character";
const xpdb = require("../../database/xp.json")
const confdb = require("../../database/config.json")
import {bidb} from "../commands/birthday"

/**
 * @description Renvoie un nombre aléatoire entre min et max
 * @param min La valeur minimale
 * @param max La valeur maximale
 */
export function random(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * @description Envoie l'objet dans le salon logs du serveur
 * @param guild Le serveur de l'event
 * @param toLogs La string ou l'embed à envoyer dans le salon logs
 */
export function sendToLogs(guild: Guild, toLogs: string | RichEmbed): void {
    var logs: TextChannel
    try {
        logs = guild.channels.find(channels => channels.id == confdb.channelLogs) as TextChannel
    } catch (e) {
        logs = null
    }
    if (logs == null) return
    logs.send(toLogs)
}

/**
 * @description Envoie l'objet dans le salon des niveaux du serveur
 * @param guild Le serveur de l'event
 * @param toLvl La string ou l'embed à envoyer dans le salon des niveaux
 */
export function sendToLvl(guild: Guild, toLvl: string | RichEmbed): void {
    var lvl: TextChannel
    try {
        lvl = guild.channels.find(channels => channels.id == confdb.channelLvl) as TextChannel
    } catch (e) {
        lvl = null
    }
    if (lvl == null) return
    lvl.send(toLvl)
}

/**
 * @description Renvoie la date au format "hh:mm:ss le jj:mm::yyyy"
 * @param date La date à formatter
 */
export function dateInMyFormat(date: Date): string {
    var mois = ('0' + (date.getMonth() + 1)).slice(-2);
    var jours = ('0' + date.getDate()).slice(-2);
    var heures = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var secondes = ('0' + date.getSeconds()).slice(-2);
    return `${heures}:${minutes}:${secondes} le ${jours}/${mois}/${date.getFullYear()}`;
}

export function littleDateInMyFormat(date: Date): string {
    var mois = ('0' + (date.getMonth() + 1)).slice(-2);
    var jours = ('0' + date.getDate()).slice(-2);
    return `${jours}/${mois}`
}

export function timeInMyFormat(date: Date): string {
    var heures = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var secondes = ('0' + date.getSeconds()).slice(-2);
    return `${heures}/${minutes}/${secondes}`
}

/**
 * @description Renvoie un tableau avec arr = [jour, mois] avec le jour et le mois en lettres et en fr
 * @param date La date en question
 */
export function dayMonthInLetters(date: Date): Array<string> {
    var dayNames: Array<string> = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    var monthNames: Array<string> = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    var arr: Array<string> = [dayNames[date.getDay() - 1], monthNames[date.getMonth()]]
    return arr
}

/**
 * @description Renvoie un objet contenant les millisecondes converties en minutes et en secondes
 * @param ms Les millisecondes à convertir en secondes
 */
export function convertMsToS_M(ms: number) {
    var milliseconds = (ms % 1000) / 100,
    seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60),
    hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return {hours: hours, minutes: minutes, secondes: seconds, millisecondes: milliseconds}
}

/**
 * @description Retire un élément du tableau
 * @param arr Le tableau où retirer la valeur
 * @param value La valeur à retirer du tableau
 */
export function removeArray(arr: Array<any>, value: any): Array<any> {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

/**
 * @description Enregistre la base de donnée config.json
 */
export function saveConfig(): void {
    writeFile("./database/config.json", JSON.stringify(confdb), (err) => {
        if (err) console.log(err)
    })
}

/**
 * @description Enregistre la base de donnée xp.json
 */
export function saveXp(): void {
    writeFile("./database/xp.json", JSON.stringify(xpdb), (err) => {
        if (err) console.log(err)
    })
}

export function saveBirth(): void {
    writeFile("./database/birthdays.json", JSON.stringify(bidb), (err) => {
        if (err) console.log(err)
    })
}

/**
 * @description Enregistre la base de donnée players.json
 */
export function savePlayers(): void {
    writeFile("./database/players.json", JSON.stringify(playersdb), (err) => {
        if (err) console.log(err)
    })
}

export function isRPCategory(id: string): boolean {
    return confdb.categoriesRP.includes(id)
}

export function isBirthday(date: string): Array<string> {
    var birth = []
    Object.entries(bidb).forEach((b: unknown) => {
        console.log(b)
        if(b[1].date == date) birth.push(b[0])
    })
    return birth.length == 0 ? null : birth
}