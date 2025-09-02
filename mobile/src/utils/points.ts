export const POINTS = {
  POST_QP: 20,
  LIKE_QP: 1,
  SHARE_QP: 10,
} as const;

export type PointType = keyof typeof POINTS;

export function calculateEarnedPoints(type: PointType, count: number = 1): number {
  return POINTS[type] * count;
}

export function formatPoints(points: number): string {
  return `${points} QP`;
}
