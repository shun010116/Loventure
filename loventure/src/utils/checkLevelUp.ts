// utils/checkLevelUp.ts
import { expToNextLevel, MAX_LEVEL } from "./rewardCalculator";

const EVOLVE_LEVELS = [20];
function getEvolutionStage(level: number): number {
    let s = 0;
    for (const L of EVOLVE_LEVELS) if (level >= L) s++;
    return s;
}

export type LevelUpResult = {
    character: any;
    evolved: boolean;
    prevLevel: number;
    newLevel: number;
    prevStage: number;
    newStage: number;
}

export function applyLevelUp(character: any): LevelUpResult {
    const prevLevel = character.level ?? 1;
    const prevStage = character.evolutionStage;

    let requiredExp = expToNextLevel(character.level);
    while (character.level < MAX_LEVEL && character.exp >= requiredExp) {
            character.level += 1;
            character.exp -= requiredExp;
            requiredExp = expToNextLevel(character.level);
        }
    if (character.level >= MAX_LEVEL) {
        character.level = MAX_LEVEL;
        character.exp = 0;
    }

    character.evolutionStage = getEvolutionStage(character.level);
    
    const newLevel = character.level;
    const newStage = character.evolutionStage;

    return {
        character,
        evolved: newStage > prevStage,
        prevLevel,
        newLevel,
        prevStage,
        newStage,
    };
}