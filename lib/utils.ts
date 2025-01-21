import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processIncrements(
  string: string,
  processFunction: (prefix: string) => void,
): void {
  let currentPrefix = '';
  let segment = '';

  string.split('').forEach((char) => {
    if (char === '.') {
      if (segment) {
        currentPrefix += `.${segment}`;
        processFunction(currentPrefix); // Call the processing function
        segment = ''; // Reset segment for the next part
      }
    } else {
      segment += char; // Build the segment
    }
  });

  // Add the final segment if it exists
  if (segment) {
    currentPrefix += `.${segment}`;
    processFunction(currentPrefix);
  }
}
