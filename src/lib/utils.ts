import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasDefinedProps<T extends object>(
  obj: Partial<T>,
  ...propNames: (keyof T)[]
): obj is Required<Pick<T, typeof propNames[number]>> {
  return propNames.every(prop => obj[prop] !== undefined);
}

export const validateName = (newName: string): boolean => {
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(newName);
};