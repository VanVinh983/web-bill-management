/**
 * Number formatting utilities for price inputs
 */

/**
 * Format number to xxx.xxx format (e.g., 1000000 -> 1.000.000)
 */
export function formatNumberInput(value: number | string): string {
  // Handle empty string or null/undefined
  if (value === '' || value === null || value === undefined) return '';
  
  // Handle string '0' or number 0
  if (value === '0' || value === 0) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
  
  if (isNaN(numValue)) return '';
  
  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse formatted string to number (e.g., "1.000.000" -> 1000000)
 */
export function parseNumberInput(value: string): number {
  if (!value) return 0;
  
  const cleaned = value.replace(/\./g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Handle input change for formatted number inputs
 */
export function handleNumberInputChange(
  value: string,
  onChange: (value: string) => void
): void {
  // Remove all dots first
  const cleaned = value.replace(/\./g, '');
  
  // Allow empty string (user is clearing the field)
  if (cleaned === '') {
    onChange('');
    return;
  }
  
  // Allow '0' explicitly
  if (cleaned === '0') {
    onChange('0');
    return;
  }
  
  // Only allow digits for other values
  if (!/^\d+$/.test(cleaned)) {
    return;
  }
  
  // Update with cleaned value (will be formatted on display)
  onChange(cleaned);
}

