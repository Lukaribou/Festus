const confdb = require("../database/config.json")

export class Config {
    token: string = "Token"
    id: string = "id"
    ownerId: string = "id"
    prefixes: Array<string> = [confdb.prefix]
    name: string = "Festus"
    desc: string = "Bot Discord spécialement pour le serveur Colonie des sang-mêlés"
}