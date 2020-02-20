import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Player, { hasCharacter } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";
import Character from "../structs/Character";
import bot from "../Festus";
import { RichEmbed } from "discord.js";
const itemsdb = require("../../database/shopitems.json")

export default class BuyCommand extends Command {
    name = "buy"
    usage = "buy <objet/rien>"
    desc = `Permet d'acheter un objet du marché (${BASICEMOJIS.WARNINGEMOJI} ne permet pas d'acheter une arme !)`
    categorie = "RolePlay"
    ownerOnly = false

    async execute(args: CommandParams) {
        if(!hasCharacter(args.author)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour pouvoir acheter un objet.**`); return}
        var per: Character = new Character(new Player(args.author))
        if(!args.args[0]){ 
            var em: RichEmbed = new RichEmbed()
            .setAuthor("Marché aux objets", bot.user.displayAvatarURL)
            .setDescription(`Le code est à utiliser pour acheter l'objet. Exemple avec le pass Iris (Code = \`pass_iris\`) : \`${bot.prefixes[0]}buy pass_iris\` `)
            .setThumbnail("https://www.jours-de-marche.fr/assets/img/logo-jours-de-marche.png")
            await Object.values(itemsdb).forEach(async i => {
                var item: Item = <Item>i
                await em.addField(`${item.name} :`, `Code : \`${item.db_name}\` | Prix : \`${item.price}\`\nDescription : ${item.description}`, true)
            })
            args.channel.send(em)
        } else {
            var item: Item = getItem(args.args.join("_"))
            if(!item){args.channel.send(`${BASICEMOJIS.XEMOJI} **Objet inexistant dans le marché ! ${BASICEMOJIS.WARNINGEMOJI} \`${bot.prefixes[0]}buy\` pour afficher les objets disponibles.**`); return}
            if(per.getMoney() < item.price) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous n'avez pas assez d'argent pour acheter l'objet \`${item.name}\` !**`); return}
            if(item.only_one && per.hasInInventory(item.db_name)) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Cet objet est limité à 1 unité par personne et vous le posséder déjà !**`); return}
            per.remMoney(item.price)
            per.addInInventory(item.db_name).then(() => args.channel.send(`${BASICEMOJIS.OKEMOJI} **L'objet \`${item.name}\` a bien été ajouté à votre inventaire. Il vous reste \`${per.getMoney()}\` drachmes.**`))
        }
    }
}

/**
 * @description Renvoie l'objet si il existe
 * @param name Le nom de l'objet
 */
export function getItem(name: string): Item {
    return itemsdb[name]
}

/**
 * @description Vérifie si l'objet est présent dans la base de données
 * @param name Le nom de l'objet
 */
export function existItem(name: string): boolean {
   return itemsdb[name] != undefined
}

export interface Item {
    name: string,
    price: number,
    db_name: string,
    only_one: boolean,
    description: string
}