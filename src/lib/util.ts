import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContentFolder } from "@/interface/folder";

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeAfterHyphen = (string: string) => {
  return string.split("-").map(capitalize).join("-");
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

export const sortFoldersAndFiles = (
  items: ContentFolder[]
): ContentFolder[] => {
  return items.sort((a, b) => {
    if (
      (a.children?.length && b.children?.length) ||
      (!a.children?.length && !b.children?.length)
    ) {
      return a.name.localeCompare(b.name);
    }
    if (a.children?.length && !b.children?.length) {
      return -1;
    }
    return 1;
  });
};
