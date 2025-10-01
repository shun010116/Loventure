// utils/rewardCalculator.ts

type UserGoalType = "check" | "count";
type UserResetType = "Daily" | "Weekly" | "One-time";

type CoupleGoalType = "shared-count" | "both-complete";
type CoupleResetType = "Daily" | "Weekly" | "One-time";

type QuestKind = "user" | "couple";

// tuning parameters
export const QUESTS_PER_WEEK = 14;
export const GOLD_EXP_RATIO = 0.6;
export const COUPLE_MULT = 1.5;
export const EVOLUTION_EXP_MULT = 1.05; // Lv20+
export const EVOLUTION_GOLD_MULT = 1.10; // Lv20+
export const MAX_LEVEL = 50;

export const diffMult: Record<1|2|3|4|5, number> = {
    1: 0.8,
    2: 1.0,
    3: 1.25,
    4: 1.55,
    5: 1.9,
};

// UserQuest Weight
export const userGoalWeight: Record<UserGoalType, number> = {
    check: 1.0,         // simple check
    count: 1.15,        // count up to targetValue
}

// CoupleQuest Weight
export const coupleGoalWeight: Record<CoupleGoalType, number> = {
    "shared-count": 1.25,   // sum of both partners' progress
    "both-complete": 1.35,  // both partners must complete
};

export const resetMult: Record<UserResetType | CoupleResetType, number> = {
    "One-time": 1.0,
    "Weekly": 1.0,
    "Daily": 0.9,
};

// util
function round5(n: number) { return Math.round(n / 5) * 5; }
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(n, hi)); }

// Level Curve
export function expToNextLevel(level: number) {
    if (level <= 0) level = 1;

    if (level <= 10) return 80 + 40 * 10 // 400

    if (level <= 30) {
        const lastSeg1 = 80 + 40 * 10; // 400
        const targetLv11 = lastSeg1 + 40; // 520
        const c = targetLv11 / Math.pow(11, 1.5);
        return Math.round(c * Math.pow(level, 1.5));
    }

    const lastSeg1 = 80 + 40 * 10; // 400
    const targetLv11 = lastSeg1 + 40; // 520
    const c = targetLv11 / Math.pow(11, 1.5);
    const lv30 = Math.round(c * Math.pow(30, 1.5));
    
    const targetLv31 = Math.round(lv30 * 1.05);
    const d = targetLv31 / Math.pow(31, 2.0);
    return Math.round(d * Math.pow(level, 2.0));
}

export function baselineExpPerQuest(level: number, questsPerWeek = QUESTS_PER_WEEK): number {
    return Math.ceil(expToNextLevel(level) / questsPerWeek);
}

// scale correction, i targetValue is large for count/shared-count quests, change to logarithmic scale
function sizeFactorForCount(targetValue: number): number {
    const v = Math.max(1, targetValue);
    // v=1 -> 1.0, v= 10 -> ~1.95, v=100 -> ~2.xx
    return 1 + Math.log10(v + 9);
}

// common finalization
function finalizeExpGold(level: number, rawExp: number, isCouple: boolean, isPostEvolution: boolean) {
    // level-scale based lower/upper limit
    const base = baselineExpPerQuest(level);
    const minExp = Math.max(20, Math.floor(base * 0.4));
    const maxExp = Math.ceil(base * 6.0);

    let exp = clamp(Math.round(rawExp), minExp, maxExp);

    // evolution bonus
    if (isPostEvolution) exp = Math.round(exp * EVOLUTION_EXP_MULT);

    // Gold
    let gold = exp * GOLD_EXP_RATIO;
    if (isPostEvolution) gold *= EVOLUTION_GOLD_MULT;
    gold = round5(gold);

    return {
        exp,
        gold,
        caps: { minExp, maxExp, base }
    };
}

// userQuest
export function computeUserQuestReward(input: {
    level: number;
    difficulty: 1|2|3|4|5;
    goalType: UserGoalType;         // 'check' | 'count'
    resetType: UserResetType;       // 'Daily' | 'Weekly' | 'One-time'
    targetValue?: number;           // for 'count' type
    evolved?: boolean;
}) {
    const {
        level,
        difficulty,
        goalType,
        resetType,
        targetValue = 1,
        evolved = level >= 20,
    } = input;

    let exp = baselineExpPerQuest(level);

    // apply weights
    exp *= diffMult[difficulty];
    exp *= userGoalWeight[goalType];
    exp *= resetMult[resetType];

    // size factor for count type
    if (goalType === "count") exp *= sizeFactorForCount(targetValue);

    // finalize + Gold calculation
    const { exp: finalExp, gold: finalGold, caps } = finalizeExpGold(level, exp, false, evolved);

    return {
        exp: finalExp,
        gold: finalGold,
        meta: {
            kind: "user" as QuestKind,
            baseline: caps.base,
            minExpCap: caps.minExp,
            maxExpCap: caps.maxExp,
            applied: { level, difficulty, goalType, resetType, targetValue, evolved }
        }
    };
}

// coupleQuest
export function computeCoupleQuestReward(input: {
    levelForCalc: number,           // average level
    goalType: CoupleGoalType;       // 'shared-count' | 'both-complete'
    resetType: CoupleResetType;     // 'Daily' | 'Weekly' | 'One-time'
    targetValue: number;
    evolved?: boolean;              // (avgLevel >= 20)
}) {
    const {
        levelForCalc,
        goalType,
        resetType,
        targetValue = 1,
        evolved = levelForCalc >= 20
    } = input;

    let exp = baselineExpPerQuest(levelForCalc);

    // 
    exp *= COUPLE_MULT;
    exp *= coupleGoalWeight[goalType];
    exp *= resetMult[resetType];
    exp *= sizeFactorForCount(targetValue);

    const { exp: finalExp, gold: finalGold, caps } = finalizeExpGold(levelForCalc, exp, true, evolved);

    return {
        exp: finalExp,
        gold: finalGold,
        meta: {
            kind: "couple" as QuestKind,
            baseline: caps.base,
            minExpCap: caps.minExp,
            maxExpCap: caps.maxExp,
            applied: { levelForCalc, goalType, resetType, targetValue, evolved }
        }
    };
}