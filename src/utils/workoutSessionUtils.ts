export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateReps(reps: string): ValidationResult {
  const trimmed = reps.trim();

  if (!trimmed) {
    return {isValid: false, error: 'Reps is required'};
  }

  const num = Number(trimmed);

  if (!Number.isFinite(num)) {
    return {isValid: false, error: 'Reps must be a valid number'};
  }

  if (num <= 0) {
    return {isValid: false, error: 'Reps must be positive'};
  }

  if (!Number.isInteger(num)) {
    return {isValid: false, error: 'Reps must be a whole number'};
  }

  return {isValid: true};
}

export function validateWeight(weight: string): ValidationResult {
  const trimmed = weight.trim();

  if (!trimmed) {
    return {isValid: false, error: 'Weight is required'};
  }

  const num = Number(trimmed);

  if (!Number.isFinite(num)) {
    return {isValid: false, error: 'Weight must be a valid number'};
  }

  if (num < 0) {
    return {isValid: false, error: 'Weight cannot be negative'};
  }

  return {isValid: true};
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatRest(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}
