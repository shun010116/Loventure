// utils/checkLevelUp.ts

function getRequiredExpForLevel(level: number): number {
    return 50 * level * level;
}

function getEvolutionStage(level: number): number {
    if (level >= 30) return 3;
    if (level >= 20) return 2;
    if (level >= 10) return 1;
    return 0;
}

export function applyLevelUp(character: any) {
    let requiredExp = getRequiredExpForLevel(character.level);

    while (character.exp >= requiredExp) {
        character.level += 1;
        character.exp -= requiredExp;
        requiredExp = getRequiredExpForLevel(character.level);
    }

    character.evolutionStage = getEvolutionStage(character.level);

    return character;
}