// utils/rewardCalculator.ts

export function calculateReward(
    difficulty: number,
    resetType: "Daily" | "Weekly" | "One-time",
) {
    const baseExp = 10;
    const baseCoin = 5;

    // 난이도 보정
    const difficultyFactor = 1 + 0.5 * Math.pow(difficulty - 1, 1.2);

    // 반복성 보정
    let resetFactor = 1.0;
    if (resetType === "Weekly") resetFactor = 1.5;
    if (resetType === "One-time") resetFactor = 2.0;

    // 최종 보상 계산
    const rewardExp = Math.round(baseExp * difficultyFactor * resetFactor);
    const rewardCoins = Math.round(baseCoin * difficultyFactor * resetFactor);

    return {
        rewardExp,
        rewardCoins,
    };
}