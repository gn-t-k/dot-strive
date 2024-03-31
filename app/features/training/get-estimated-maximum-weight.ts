type GetEstimatedMaximumWeight = (props: {
  weight: number;
  repetition: number;
}) => number;
export const getEstimatedMaximumWeight: GetEstimatedMaximumWeight = (set) => {
  const { weight, repetition } = set;

  if (repetition < 1) {
    return 0;
  }

  // 1回から12回の場合
  const coefficients = [
    1, 0.95, 0.93, 0.9, 0.87, 0.85, 0.83, 0.8, 0.77, 0.75, 0.7, 0.67,
  ] as const;
  if (1 <= repetition && repetition <= 12) {
    const coefficient = coefficients[repetition - 1] ?? 1;
    return quantizeToQuarter(weight / coefficient);
  }

  // 13回以上の場合
  return quantizeToQuarter(
    (100 * weight) / (48.8 + 53.8 * Math.pow(Math.E, -0.075 * repetition)),
  );
};

type QuantizeToQuarter = (value: number) => number;
const quantizeToQuarter: QuantizeToQuarter = (value) => {
  return Math.round(value / 0.25) * 0.25;
};
