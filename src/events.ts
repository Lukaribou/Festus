import {Guild, Message, TextChannel, GuildMember, RichEmbed, User } from "discord.js"
import Command from "./structs/Command"
import bot from "./Festus"
import { Config } from "./Config";
import { BASICEMOJIS } from "./utils/constants";
const confdb = require("../database/config.json")

export function onReady(): void {
    console.log(`Connecté avec succès ! Commandes :\n\t${stringifyMap(this.commands)}`)
    bot.user.setActivity("la colonie des sang-mêlés. V-2.0 ", {"type":"WATCHING"})
}

export async function onMemberJoin(u: GuildMember): Promise<void> {
    try {
        var jChan: TextChannel = await u.guild.channels.get(confdb.joinLeaveChan) as TextChannel
        jChan.send(`➡️ **Bienvenue <@${u.id}> ! J'espère que tu te plairas parmi nous !**`)
    } catch (e) {bot.users.get(bot.ownerId).send("**Erreur listener** \`guildMemberAdd\`:\n```" + e + "```")}
}

export async function onMemberLeave(u: GuildMember): Promise<void> {
    try {
        var rChan: TextChannel = await u.guild.channels.get(confdb.joinLeaveChan) as TextChannel
        rChan.send(`⬅️ **${u.user.username} vient de quitter le serveur.**`)
    } catch (e) {bot.users.get(bot.ownerId).send("**Erreur listener** \`guildMemberRemove\`:\n```" + e + "```")}
}

export function onMessageDelete(m: Message): void {
    var l: TextChannel = m.guild.channels.get(confdb.channelLogs) as TextChannel
    if(!l) return
    if(m.content.length < 1) return
    var em: RichEmbed = new RichEmbed()
    .setColor("#FFFF00")
    .setTitle("Message supprimé")
    .setAuthor(m.author.username, m.author.displayAvatarURL)
    .addField("Contenu :", m.content)
    .addField("Salon :", `<#${m.guild.channels.get(m.channel.id).id}>`, true)
    .setTimestamp()
    .setFooter(`[LOGS] ${bot.user.username}`, bot.user.displayAvatarURL)
    l.send(em)
}

export function onMessageEdit(oldM: Message, newM: Message): void {
    var l: TextChannel = newM.guild.channels.get(confdb.channelLogs) as TextChannel
    if(!l) return
    if(newM.content.length < 1) return
    var em: RichEmbed = new RichEmbed()
    .setColor("#FFA500")
    .setTitle("Message édité")
    .setAuthor(newM.author.username, newM.author.displayAvatarURL)
    .addField("Précédemment :", oldM.content, true)
    .addField("Maintenant :", newM.content, true)
    .addField("Salon :", `<#${newM.guild.channels.get(newM.channel.id).id}>`, true)
    .setTimestamp()
    .setFooter(`[LOGS] ${bot.user.username}`, bot.user.displayAvatarURL)
    l.send(em)
}

export async function onMessage(message: Message): Promise<void> {
    if(message.author.bot) return
    if(message.channel.type != "text") return

    const channel: TextChannel = message.channel as TextChannel;
    const guild: Guild = message.guild;

    if (confdb.silence && message.author.id != bot.ownerId && !guild.member(message.author).hasPermission("ADMINISTRATOR")) {message.delete(); return}
    
    let effectivePrefix: number = 0;

    bot.xpCollector.checkAndAdd(message.author)

    bot.prefixes = new Config().prefixes

    for (let prefix of this.prefixes) {
        if (message.content.startsWith(prefix)) {
            effectivePrefix = prefix.length;
        }
    }

    if (effectivePrefix == 0) return

    if (confdb.lock && message.author.id != bot.ownerId && !message.guild.member(message.author).hasPermission("ADMINISTRATOR")) {{channel.send(`${BASICEMOJIS.XEMOJI} ${BASICEMOJIS.WARNINGEMOJI} **Mode lock activé. Je ne réponds plus aux commandes des personnes non administrateures.**`).then((m: Message) => m.delete(5000).catch()); return}}

    const command: string = message.content.split(" ")[0].substring(effectivePrefix);

    const args: string[] = message.content.split(" ").slice(1);

    if (this.commands.has(command) || this.aliases.has(command)) {
        const comm: Command = this.commands.get(command) || this.aliases.get(command)
        await comm.execute({args: args, msg: message, author: message.author, guild: guild, channel: channel, bot: this}).then(() => {
            message.delete().catch()
        })
    }
}

function stringifyMap(map: Map<string, Command>): string {
    let str: string = "";

    for (const [commname, comm] of map) {
        str += `${commname}: ${comm.desc}\n\t`
    }
    return str;
}

export function onGuildBanAdd(g: Guild, u: User): void {
    g.owner.send(`**Message automatique en tant que propriétaire du serveur** [Membre banni.e dans \`${g.name}\`]: ${u.username} (ID: \`${u.id}\`)`)
}

export function onGuildBanRemove(g: Guild, u: User): void {
    g.owner.send(`**Message automatique en tant que propriétaire du serveur** [Membre débanni.e dans \`${g.name}\`]: ${u.username} (ID: \`${u.id}\`)`)
}

export async function onWSError(_: Error): Promise<void> {
    await bot.destroy()
    bot.run()
}

export function onGuildLeft(g: Guild): void {
    bot.users.get(bot.ownerId).send(`**⚠️⚠️ ${bot.user.username} a été retiré de ${g.name}⚠️⚠️**`)
}