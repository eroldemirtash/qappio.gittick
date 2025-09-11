import { describe, it, expect } from 'vitest';
import { POINTS, calculateEarnedPoints, formatPoints } from '@/src/utils/points';

describe('Points Utils', () => {
  describe('POINTS constants', () => {
    it('should have correct point values', () => {
      expect(POINTS.POST_QP).toBe(20);
      expect(POINTS.LIKE_QP).toBe(1);
      expect(POINTS.SHARE_QP).toBe(10);
    });
  });

  describe('calculateEarnedPoints', () => {
    it('should calculate single post points', () => {
      const points = calculateEarnedPoints('POST_QP', 1);
      expect(points).toBe(20);
    });

    it('should calculate multiple like points', () => {
      const points = calculateEarnedPoints('LIKE_QP', 5);
      expect(points).toBe(5);
    });

    it('should calculate share points', () => {
      const points = calculateEarnedPoints('SHARE_QP', 3);
      expect(points).toBe(30);
    });

    it('should default to count 1', () => {
      const points = calculateEarnedPoints('POST_QP');
      expect(points).toBe(20);
    });
  });

  describe('formatPoints', () => {
    it('should format points correctly', () => {
      expect(formatPoints(100)).toBe('100 QP');
      expect(formatPoints(0)).toBe('0 QP');
      expect(formatPoints(1500)).toBe('1500 QP');
    });
  });
});
