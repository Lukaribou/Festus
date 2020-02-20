import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import { BASICEMOJIS } from "../utils/constants";
import { saveConfig } from "../utils/fonctions";
import { GuildChannel, TextChannel, Role } from "discord.js";
import bot from "../Festus";
const confdb = require("../../database/config.json")

export default class SetCommand extends Command {
    name = "configurer"
    aliases = ["config", "set"]
    categorie = "Système"
    desc = "Permet de modifier la configuration du bot"
    usage = "set <param. à config.> <nouvelle valeur/rien en cas réglage pour un salon>"
    ownerOnly = false

    async execute(args: CommandParams) {
        var toSet: string = args.args[0]
        if (!toSet) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Veuillez entrer l'élément à configurer. \`${args.bot.prefixes[0]}set list\` pour afficher les éléments configurables**`); return }
        if (args.guild.member(args.author).hasPermission("ADMINISTRATOR") || args.author.id == bot.ownerId) {
            switch (toSet) {
                case "prefix":
                    var new_prefix: string = args.args[1]
                    if (!new_prefix) { args.channel.send(`${BASICEMOJIS.XEMOJI} **Il faut entrer une nouvelle valeur pour le prefix**`) }
                    confdb.prefix = new_prefix
                    saveConfig()
                    args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le prefix a été redéfini comme étant \`${confdb.prefix}\`**`)
                    break
                case "logs":
                    var new_channel: GuildChannel = args.args[1] ? (args.guild.channels.find(chan => chan.id == args.args[1] || `<#${chan.id}>` == args.args[1])) : args.msg.channel as TextChannel
                    confdb.channelLogs = new_channel.id
                    saveConfig()
                    args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le salon des logs a été redéfini comme étant <#${confdb.channelLogs}>**`)
                    break
                case "firewall":
                    var nr: Role = args.guild.roles.get(args.args[1]);
                    if (!nr) {args.channel.send(`${BASICEMOJIS.XEMOJI} **Il semblerait que cet id ne corresponde à aucun rôle !**`);return}
                    confdb.firewallRole = nr.id;
                    saveConfig();
                    args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le rôle pour le firewall est maintenant \`${nr.name}\`**`);
                    break
                case "join_channel":
                    var nc: GuildChannel = args.args[1] ? (args.guild.channels.find(chan => chan.id == args.args[1] || `<#${chan.id}>` == args.args[1])) : args.msg.channel as TextChannel
                    confdb.joinLeaveChan = nc.id
                    saveConfig()
                    args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le salon des messages d'arrivées et de départs a été redéfini comme étant <#${confdb.joinLeaveChan}>**`)
                    break
                case "birth_channel":
                    var nc: GuildChannel = args.args[1] ? (args.guild.channels.find(chan => chan.id == args.args[1] || `<#${chan.id}>` == args.args[1])) : args.msg.channel as TextChannel
                    confdb.birthdayChannel = nc.id
                    saveConfig()
                    args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le salon des messages d'anniversaires a été redéfini comme étant <#${confdb.birthdayChannel}>**`)
                    break
                case "lvl":
                case "level":
                    var new_channel: GuildChannel = args.args[1] ? (args.guild.channels.find(chan => chan.id == args.args[1] || `<#${chan.id}>` == args.args[1])) : args.msg.channel as TextChannel
                    confdb.channelLvl = new_channel.id
                    saveConfig()
                    args.channel.send(`${BASICEMOJIS.OKEMOJI} **Le salon des niveaux a été redéfini comme étant <#${confdb.channelLvl}>**`)
                    break
                case "list":
                    args.channel.send("📜 **Voici la liste des paramètres modifiables :**\n\t•`join_channel <id/#salon/rien>`: Change le salon où sont affichés les messages d'arrivées et de départs\n\t•`firewall <id role>`: Change le rôle attribué au passage du firewall\n\t•`prefix <nouveau prefix>`: Change le prefix du bot\n\t•`logs <id/#salon/rien>`: Change le salon où sont envoyés les logs\n\t•`lvl <id/#salon/rien>`: Change le salon où sont envoyés les passages de niveaux\n\t•`birth_channel <id/#salon/rien>`: Change le salon où sont envoyés les messages d'anniversaires.")
                    break
            }
        } else args.channel.send(`${BASICEMOJIS.XEMOJI} **Vous devez posséder les permissions administrateur pour modifier un paramètre**`)
    }
}