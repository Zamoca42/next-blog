import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const delay = (ms: number) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(ms);
    }, ms)
  );
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
