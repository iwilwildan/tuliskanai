import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAscii(inputString: string) {
  //remove non ascii character
  const asciiString = inputString.replace(/[^\x20-\x7E]/g, '');
  return asciiString;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
