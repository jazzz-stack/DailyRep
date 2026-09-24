import {describe, it, expect} from '@jest/globals';
import {validateReps, validateWeight, formatDuration, formatRest} from '../src/utils/workoutSessionUtils';

describe('workoutSessionUtils', () => {
  describe('validateReps', () => {
    it('should accept valid reps', () => {
      const result = validateReps('10');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty reps', () => {
      const result = validateReps('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Reps is required');
    });

    it('should reject non-numeric reps', () => {
      const result = validateReps('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Reps must be a valid number');
    });

    it('should reject zero reps', () => {
      const result = validateReps('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Reps must be positive');
    });

    it('should reject negative reps', () => {
      const result = validateReps('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Reps must be positive');
    });

    it('should reject decimal reps', () => {
      const result = validateReps('10.5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Reps must be a whole number');
    });

    it('should trim whitespace', () => {
      const result = validateReps('  10  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateWeight', () => {
    it('should accept valid weight', () => {
      const result = validateWeight('50.5');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept zero weight (bodyweight exercise)', () => {
      const result = validateWeight('0');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty weight', () => {
      const result = validateWeight('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Weight is required');
    });

    it('should reject non-numeric weight', () => {
      const result = validateWeight('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Weight must be a valid number');
    });

    it('should reject negative weight', () => {
      const result = validateWeight('-10');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Weight cannot be negative');
    });

    it('should trim whitespace', () => {
      const result = validateWeight('  50.5  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to MM:SS format', () => {
      const result = formatDuration(125);
      expect(result).toBe('2:05');
    });

    it('should handle zero seconds', () => {
      const result = formatDuration(0);
      expect(result).toBe('0:00');
    });

    it('should pad single digit seconds', () => {
      const result = formatDuration(65);
      expect(result).toBe('1:05');
    });

    it('should handle large durations', () => {
      const result = formatDuration(3665);
      expect(result).toBe('61:05');
    });
  });

  describe('formatRest', () => {
    it('should format seconds to MM:SS with zero padding', () => {
      const result = formatRest(125);
      expect(result).toBe('02:05');
    });

    it('should format single digit minutes', () => {
      const result = formatRest(65);
      expect(result).toBe('01:05');
    });

    it('should pad both minutes and seconds', () => {
      const result = formatRest(35);
      expect(result).toBe('00:35');
    });

    it('should handle zero', () => {
      const result = formatRest(0);
      expect(result).toBe('00:00');
    });
  });
});
