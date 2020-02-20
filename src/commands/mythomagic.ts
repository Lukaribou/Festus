import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import Character, { playersdb } from "../structs/Character";
import Player, { hasCharacter } from "../structs/Player";
import { BASICEMOJIS } from "../utils/constants";
import { convertMsToS_M, random } from "../utils/fonctions";
import { Attachment } from "discord.js";

export default class Mythomagic extends Command {
    name = "mythomagic"
    categorie = "RolePlay"
    aliases = ["mytho"]
    usage = "mytho <list/rien>"
    desc = "Permet de gagner une carte de Mythomagic. Commun à tous les joueurs."
    ownerOnly = false

    async execute(args: CommandParams) {
        if (!hasCharacter(args.author)) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder un personnage pour récupérer une carte Mythomagic !**`); return }
        if (args.args[0] && args.args[0].match(/list(e)*/gmi)) {
            var str: string = `**__Liste des cartes Mythomagic de ${args.author.username} :__**\n`
            var total: number = 0
            for (const name in playersdb[args.author.id].mythomagic.cards) {
                str += `\n\t**${playersdb.mythomagic.cards[name].charact}:** \`${playersdb[args.author.id].mythomagic.cards[name].count}\` unités`
                total += playersdb[args.author.id].mythomagic.cards[name].count
            }
            str += "\n\nTotal de : `" + total + "` cartes."
            args.channel.send(str)
        } else {
            if (Math.floor((Date.now() - (playersdb.mythomagic.lastgain.date as any))) >= 3000000) { // 3000000ms = 50m
                var cardArr: Array<MythomagicCard> = []
                await Object.values(playersdb.mythomagic.cards).forEach(async (c: MythomagicCard) => cardArr.push(c))
                var rand: number = random(0, 300)
                var cArr: MythomagicCard[] = cardArr.filter(c => c.inter.min <= rand && c.inter.max > rand)
                var c: MythomagicCard = cArr[random(0, cArr.length - 1)]
                const img = new Attachment(this.getLinkOfCard(c.name))
                var per: Character = new Character(new Player(args.author))
                per.addMoney(c.value)
                per.addXp(parseInt((c.value / 2.3).toFixed(0)))
                per.player.addMythomagic(c)
                per.player.upMythomagic(args.author, c)
                await args.channel.send(`${BASICEMOJIS.TADAEMOJI} **Vous avez obtenu \`${c.charact}\` ! Vous empôchez \`${c.value}\` drachmes et \`${(c.value / 2.3).toFixed(0)}\` points d'expérience !**`, img).catch(() => args.channel.send(`Image introuvable. Vous avez obtenu(e) : ${c.charact}`))
                if(per.player.hasMythomagic("bianca") && per.player.hasMythomagic("nico") && !per.player.hasAchievement("Fratrie")) {
                    per.player.addAchievement("Fratrie", "Posséder les cartes `Nico Di Angelo` et `Bianca Di Angelo`")
                    args.channel.send(BASICEMOJIS.TADAEMOJI + " **Vous avez obtenu le succès `Fratrie` !**")
                }
            } else {
                var delay = convertMsToS_M(3000000 - (Date.now() - (playersdb.mythomagic.lastgain.date as any)))
                args.channel.send(`${BASICEMOJIS.XEMOJI} **\`${args.bot.users.get(playersdb.mythomagic.lastgain.userId).username}\` a obtenu la carte \`${getCard(playersdb.mythomagic.lastgain.cardName).charact}\` récemment. Reviens dans \`${delay.minutes == 0 ? "" : delay.minutes + " minutes et"} ${delay.secondes} secondes\` pour tenter ta chance !**`)
            }
        }
    }

    public getLinkOfCard(name: string): string {
        return `./resources/Mythomagic/${name}.jpg`
    }
}

export function getCard(name: string): MythomagicCard {
    return playersdb.mythomagic.cards[name]
}

export interface MythomagicCard {
    name: string,
    charact: string,
    value: number,
    link: string,
    inter: {
        min: number,
        max: number
    }
}