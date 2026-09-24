import {
  getWeekStart,
  getWeekEnd,
  getWeekStartByOffset,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatRelativeDate,
  isInCurrentWeek,
  formatWeekLabel,
  getLastNWeeks,
} from '../src/utils/dateUtils';

describe('dateUtils', () => {
  const testDate = new Date('2024-09-24'); // Tuesday
  const mondayOfWeek = new Date('2024-09-23'); // Monday

  describe('getWeekStart', () => {
    it('should return Monday of current week', () => {
      const weekStart = getWeekStart(testDate);
      expect(weekStart.getDay()).toBe(1); // Monday
    });

    it('should handle Sunday correctly', () => {
      const sunday = new Date('2024-09-22'); // Sunday
      const weekStart = getWeekStart(sunday);
      expect(weekStart.getDay()).toBe(1); // Monday of same week
    });
  });

  describe('getWeekEnd', () => {
    it('should return Sunday of current week', () => {
      const weekEnd = getWeekEnd(testDate);
      expect(weekEnd.getDay()).toBe(0); // Sunday
    });

    it('should be 6 days after getWeekStart', () => {
      const weekStart = getWeekStart(testDate);
      const weekEnd = getWeekEnd(testDate);
      const diff = (weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(6);
    });
  });

  describe('getWeekStartByOffset', () => {
    it('should get current week at offset 0', () => {
      const current = getWeekStartByOffset(0);
      const today = getWeekStart(new Date());
      expect(current.getDate()).toBe(today.getDate());
    });

    it('should get previous week at offset -1', () => {
      const previous = getWeekStartByOffset(-1);
      const current = getWeekStartByOffset(0);
      const diff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(7);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const formatted = formatDate(new Date('2024-09-24'));
      expect(formatted).toMatch(/Sep 24, 2024/);
    });

    it('should accept string dates', () => {
      const formatted = formatDate('2024-09-24');
      expect(formatted).toMatch(/Sep 24, 2024/);
    });
  });

  describe('formatDateShort', () => {
    it('should format date without year', () => {
      const formatted = formatDateShort(new Date('2024-09-24'));
      expect(formatted).toMatch(/Sep 24/);
    });
  });

  describe('formatDateTime', () => {
    it('should include both date and time', () => {
      const formatted = formatDateTime(new Date('2024-09-24T14:30:00'));
      expect(formatted).toContain('Sep 24, 2024');
      expect(formatted).toContain('at');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "Today" for today', () => {
      const today = new Date();
      const formatted = formatRelativeDate(today);
      expect(formatted).toBe('Today');
    });

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatted = formatRelativeDate(yesterday);
      expect(formatted).toBe('Yesterday');
    });

    it('should return days ago for recent dates', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const formatted = formatRelativeDate(threeDaysAgo);
      expect(formatted).toContain('3 days ago');
    });

    it('should return date for older dates', () => {
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      const formatted = formatRelativeDate(lastMonth);
      expect(formatted).not.toBe('Today');
      expect(formatted).not.toBe('Yesterday');
    });
  });

  describe('isInCurrentWeek', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isInCurrentWeek(today)).toBe(true);
    });

    it('should return true for other days in week', () => {
      const today = new Date();
      const daysInWeek = new Date();
      daysInWeek.setDate(today.getDate() - 2);
      expect(isInCurrentWeek(daysInWeek)).toBe(true);
    });

    it('should return false for last week', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 8);
      expect(isInCurrentWeek(lastWeek)).toBe(false);
    });
  });

  describe('formatWeekLabel', () => {
    it('should format week range correctly', () => {
      const label = formatWeekLabel(mondayOfWeek);
      expect(label).toContain('Sep');
    });

    it('should handle same month weeks', () => {
      const monday = new Date('2024-09-02');
      const label = formatWeekLabel(monday);
      expect(label).toContain('–');
    });
  });

  describe('getLastNWeeks', () => {
    it('should return correct number of weeks', () => {
      const weeks = getLastNWeeks(4);
      expect(weeks.length).toBe(4);
    });

    it('should have start and end dates', () => {
      const weeks = getLastNWeeks(1);
      expect(weeks[0]).toHaveProperty('start');
      expect(weeks[0]).toHaveProperty('end');
      expect(weeks[0]).toHaveProperty('label');
    });

    it('should have weeks in correct order', () => {
      const weeks = getLastNWeeks(2);
      expect(weeks[0].start.getTime()).toBeLessThan(weeks[1].start.getTime());
    });
  });
});
