import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Player, { hasCharacter } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";
import Character, { Weapon, weapdb, getRankInFr } from "../structs/Character";
import { RichEmbed } from "discord.js";
import bot from "../Festus";
import { savePlayers } from "../utils/fonctions";

export default class UpWeaponCommand extends Command {
    name = "acheter-arme"
    categorie = "RolePlay"
    desc = "Permet d'acheter une nouvelle arme (de votre classe)."
    aliases = ["buya", "upa"]
    usage = "upa <arme/rien>"
    ownerOnly = false

    async execute(args: CommandParams) {
        if (!hasCharacter(args.author)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour acheter une nouvelle arme !**`); return }
        var per: Character = new Character(new Player(args.author))
        if (!args.args[0]) {
            var shopByClass: Map<string, Array<Weapon>> = new Map()
            Object.values(weapdb).forEach(w => { //Ajoute les armes par classe
                var weap: Weapon = <Weapon>w
                if (!shopByClass.has(weap.classe.toUpperCase())) shopByClass.set(weap.classe.toUpperCase(), [weap])
                else shopByClass.set(weap.classe.toUpperCase(), shopByClass.get(weap.classe.toUpperCase()).concat([weap]).sort((a, b) => {
                    return a.price - b.price // sort() en fonction du prix (croissant)
                }))
            })
            var perClasseShop = shopByClass.get(per.charact.classe.toUpperCase())
            var em: RichEmbed = new RichEmbed()
                .setAuthor(`Marché des armes d'${per.charact.classe}`, bot.user.displayAvatarURL)
                .setDescription(`Le code est à utiliser pour acheter la nouvelle arme`)
                .setThumbnail("https://cdn.pixabay.com/photo/2018/07/05/17/07/blacksmith-3518750_960_720.png")
            perClasseShop.forEach(w => {
                var weap: Weapon = <Weapon>w
                em.addField(`${weap.fr_name} : `, `Code : \`${weap.name}\` | Prix : \`${weap.price}\` | Rang : \`${getRankInFr(weap.rank)}\`\nDégâts (min => max) : \`${weap.damages.min}\` => \`${weap.damages.max}\``, true)
            })
            args.channel.send(em)
        } else {
            var weap = this.getWeapon(args.args.join("_"))
            if (!weap) { args.channel.send(`${BASICEMOJIS.XEMOJI} **L'arme demandée n'existe pas !**`); return }
            if (weap.rank - per.charact.weapon.rank > 2) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous ne pouvez pas sauter plus de deux rangs !**`); return }
            if (per.charact.weapon.name == weap.name) { args.channel.send(`${BASICEMOJIS.XEMOJI} **L'arme choisie est celle que vous possédez actuellement !**`); return }
            if (per.getMoney() < weap.price) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous ne possédez pas assez de drachmes pour acheter cette arme !**`); return }
            per.charInDb.weaponName = weap.name
            per.remMoney(weap.price)
            args.channel.send(`${BASICEMOJIS.OKEMOJI} **Vous venez de changer d'arme ! Il vous reste \`${per.getMoney()}\` drachmes**`)
        }
    }

    public getWeapon(name): Weapon {
        return weapdb[name]
    }
}