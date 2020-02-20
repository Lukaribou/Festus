import CommandParams from "./CommandParams"

export default abstract class Command {
    abstract name: string
    abstract desc: string
    abstract usage: string
    abstract categorie: string
    abstract ownerOnly: boolean
    aliases: Array<string> = []
    abstract async execute(args: CommandParams): Promise<void>
}