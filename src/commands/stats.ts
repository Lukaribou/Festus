import Command from "../structs/Command";
import CommandParams from "../structs/CommandParams";
import bot from "../Festus"
import { RichEmbed, version } from "discord.js";
const moment = require("moment");
const m = require("moment-duration-format");
let os = require('os')
let cpuStat = require("cpu-stat")
const ms = require("ms")

export default class StatsCommand extends Command {
    name = "stats"
    categorie = "Informations"
    desc = "Affiche des informations sur le bot et la machine"
    usage = "stats"
    aliases = []
    ownerOnly = false

    async execute(args: CommandParams) {
        cpuStat.usagePercent(function (err, percent, seconds) {
            if (err) {
                return console.log(err);
            }
            const duration = moment.duration(bot.uptime).format(" D [days], H [hrs], m [mins], s [secs]")
            const embedStats: RichEmbed = new RichEmbed()
                .setAuthor(bot.user.username, bot.user.displayAvatarURL)
                .setThumbnail(bot.user.displayAvatarURL)
                .setTitle("**Informations machine**")
                .setColor("#008800")
                .setTimestamp()
                .addField("• Temps de fonctionnement :", `${duration}`, true)
                .addField("• Utilisateurs :", `${bot.users.size.toLocaleString()}`, true)
                .addField("• Salons :", `${bot.channels.size.toLocaleString()}`, true)
                .addField("• Version Discord.js :", `v${version}`, true)
                .addField("• Version Node :", `${process.version}`, true)
                if (args.author.id == bot.ownerId) {
                    embedStats.addField("• Utilisation de la mémoire :", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
                    embedStats.addField("• CPU :", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``, true)
                    embedStats.addField("• Utilisation CPU :", `\`${percent.toFixed(2)}%\``, true)
                    embedStats.addField("• Architecture :", `\`${os.arch()}\``, true)
                    embedStats.addField("• Platforme :", `\`\`${os.platform()}\`\``, true)
                }
                embedStats.addField("• Latence API :", `${Math.round(bot.ping)}ms`, true)
                args.channel.send(embedStats)
            })
        }
    }