import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { TextChannel } from "discord.js";

export default class FicheCommand extends Command {
    name = "fiche"
    usage = "fiche <prenom/nom>"
    desc = "Renvoie la fiche du personnage demandé. (Donner le prénom ou le nom)"
    ownerOnly = false
    categorie = "Autre"

    async execute(args: CommandParams) {
        try {
            var nomRecherche = args.args.join(" ").toLowerCase()
            var msgChannel = args.channel, trouvee = 0, resultats = []
            if (!nomRecherche || nomRecherche.length < 3) {msgChannel.send("Vous devez entrer une chaine de caractères de 3 caractères minimum !"); return}
            var fiche_salon: Array<TextChannel> = args.guild.channels.filter(channels => channels.name == "fiches-rp" || channels.name == "anciennes-fiches").array() as Array<TextChannel>
            for (let current of fiche_salon) {
                await current.fetchMessages({ limit: 100 }).then(messages => {
                    messages.forEach(message => {
                        if (message.content.toLowerCase().includes(nomRecherche)) return resultats.push(message.content) && trouvee++
                    })
                })
            }
            if (trouvee === 0) {msgChannel.send("Aucun résultat trouvé 😕" + "```css\nSi vous etes sur que votre recherche existe, il est possible qu'elle ne soit pas atteignable pour le bot 😕😕```"); return}
            if (trouvee > 5) {msgChannel.send("La recherche pour \`" + nomRecherche + "\` a plus de 5 résultats, ceux-ci ne seront pas affichés."); return}
            msgChannel.send("Voici le(s) résultat(s) pour : " + `\`${nomRecherche}\`\n`)
            resultats.forEach(fiche => {
                msgChannel.send("```" + fiche + "```")
            })
        } catch (error) {
            args.channel.send("Une erreur est survenue : " + "```" + error + "```")
        }
    }
}