export enum BASICEMOJIS {
    OKEMOJI = "✅",
    XEMOJI = "❌",
    WARNINGEMOJI = "⚠",
    RIGHTARROW = "➡",
    TADAEMOJI = "🎉"
}

export enum ARCHERS_DEFAULT_PROPS {
    "health" = 220,
    "armor" = 5,
    "chance" = 10,
    "defaultWeapon" = "wood_bow"
}

export enum HOPLITES_DEFAULT_PROPS {
    "health" = 300,
    "armor" = 10,
    "chance" = 7,
    "defaultWeapon" = "wood_sword"
}

export enum ASSASSINS_DEFAULT_PROPS {
    "health" = 170,
    "armor" = 5,
    "chance" = 12,
    "defaultWeapon" = "dague_rouillee"
}

export function getDefaultWeaponName(classe: string): string {
    classe = classe.toUpperCase()
    switch(classe) {
        case "ASSASSIN":
            return ASSASSINS_DEFAULT_PROPS.defaultWeapon
        case "ARCHER":
            return ARCHERS_DEFAULT_PROPS.defaultWeapon
        case "HOPLITE":
            return HOPLITES_DEFAULT_PROPS.defaultWeapon
    }
}

export type CLASSE_RP = ("ASSASSIN" | "ARCHER" | "HOPLITE")