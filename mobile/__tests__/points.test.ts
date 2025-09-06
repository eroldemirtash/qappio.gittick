import { describe, it, expect } from 'vitest';
import { POINTS } from '../src/utils/points';

describe('Points System', () => {
  it('should have correct point values', () => {
    expect(POINTS.POST_QP).toBe(20);
    expect(POINTS.LIKE_QP).toBe(1);
    expect(POINTS.SHARE_QP).toBe(10);
  });

  it('should calculate total earnings correctly', () => {
    const posts = 5;
    const likes = 100;
    const shares = 10;

    const totalEarnings = 
      (posts * POINTS.POST_QP) + 
      (likes * POINTS.LIKE_QP) + 
      (shares * POINTS.SHARE_QP);

    expect(totalEarnings).toBe(200); // 100 + 100 + 100
  });
});
