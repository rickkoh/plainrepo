import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_: any, i: number) =>
    arr.slice(i * size, i * size + size),
  );

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

export function betterNumberFormat(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function mbToBytes(num: number): number {
  return num * 1_000_000;
}
