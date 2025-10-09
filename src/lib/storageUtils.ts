/**
 * Utility functions for localStorage storage management
 */

export interface StorageInfo {
  usedBytes: number;
  usedKB: number;
  usedMB: number;
  quotaBytes: number;
  quotaMB: number;
  percentageUsed: number;
}

/**
 * Calculate the total size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Calculate size of key + value
      // Each character is typically 2 bytes in UTF-16
      total += (key.length + localStorage.getItem(key)!.length) * 2;
    }
  }
  
  return total;
}

/**
 * Get detailed storage information
 * Note: Most browsers allocate 5-10MB for localStorage
 * We'll use 5MB as a conservative estimate
 */
export function getStorageInfo(): StorageInfo {
  const usedBytes = getLocalStorageSize();
  const usedKB = usedBytes / 1024;
  const usedMB = usedKB / 1024;
  
  // Most browsers provide 5-10MB for localStorage
  // Using 5MB (5 * 1024 * 1024 bytes) as conservative estimate
  const quotaBytes = 5 * 1024 * 1024;
  const quotaMB = 5;
  
  const percentageUsed = (usedBytes / quotaBytes) * 100;
  
  return {
    usedBytes,
    usedKB,
    usedMB,
    quotaBytes,
    quotaMB,
    percentageUsed,
  };
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

