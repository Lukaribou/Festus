import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import bot from "../Festus";
import { User, RichEmbed } from "discord.js";
import Player, { hasCharacter } from "../structs/Player";
import Character, { ICharacter, getRankInFr } from "../structs/Character";
import { dateInMyFormat } from "../utils/fonctions";
import { getItem } from "./buy";

export default class InfosCharacterCommand extends Command {
    name = "stats-joueur"
    usage = "jstats <id/mention/rien>"
    aliases = ["jstats", "profil"]
    desc = "Affiche les stats de votre personnage ou de la personne renseignée"
    ownerOnly = false
    categorie = "RolePlay"

    async execute(args: CommandParams) {
        //try {
        var cible: User = args.msg.mentions.users.first() || bot.users.get(args.args[0])
        if(!cible) cible = args.author
        if(!hasCharacter(cible)){args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous/La personne renseignée doit posséder un personnage !**`); return}
        var char: Character = new Character(new Player(cible))
        var charact: ICharacter = char.charact
        var perObjects: Array<string> = []
        char.getInventory().forEach(i => {perObjects.push(getItem(i).name)})
        var embed: RichEmbed = new RichEmbed()
        .setAuthor(cible.username, cible.avatarURL)
        .addField("Nom :", charact.name, true)
        .addField("Classe :", charact.classe, true)
        .addField("Niveau :", charact.level, true)
        .addField("Points d'expérience :", charact.xp, true)
        .addField("Vie :", charact.CONSTANTS_STATS.CONSTANT_HEALTH, true)
        .addField("Armure :", charact.CONSTANTS_STATS.CONSTANT_ARMOR, true)
        .addField("Chance :", charact.stats.chance, true)
        .addField("Arme :", `Nom : \`${charact.weapon.fr_name}\`\nrank : \`${getRankInFr(char.charact.weapon.rank)}\`\nDégâts : \`${charact.weapon.damages.min} - ${charact.weapon.damages.max}\``, true)
        .addField("Objets dans l'inventaire :", char.getInventory().length > 0 ? "`" + perObjects.join("`, `") + "`" : "Inventaire vide", true)
        .addField("Drachmes :", charact.inventory.money + ` (Dernière paye ${charact.inventory.lastpay == null ? ": Jamais" : `à ${dateInMyFormat(new Date(charact.inventory.lastpay))}`})`, true)
        .addField("Ratio :", (charact.CHARACT_STATS.losses == 0 ? "100%" : (charact.CHARACT_STATS.victories / charact.CHARACT_STATS.losses).toFixed(2)) + ` (\`${charact.CHARACT_STATS.victories}\` victoires pour \`${charact.CHARACT_STATS.losses}\` défaites)`, true)
        cible == args.author ? null : embed.setFooter("Demandé par " + args.author.tag)
        args.channel.send(embed)
        //} catch(e) {args.channel.send(`${BASICEMOJIS.XEMOJI} Erreur : **${e}**`); return}
    }
}