"use client";

import { Moon, Sun, Eclipse } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/component/ui/button";
import clsx from "clsx";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const handleToggle = () => {
    if (currentTheme === "light") {
      setTheme("dark");
    } else if (currentTheme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle}>
      <Sun
        className={clsx(
          `h-[1.2rem] w-[1.2rem] rotate-0 transition dark:-rotate-90 duration-300 dark:scale-0`,
          currentTheme === "system" ? "scale-0" : "scale-100"
        )}
      />
      <Moon
        className={clsx(
          `absolute h-[1.2rem] w-[1.2rem] rotate-180 scale-0 transition duration-300 dark:rotate-0`,
          currentTheme === "system"
            ? "dark:scale-0 -rotate-180"
            : "dark:scale-100 dark:rotate-0"
        )}
      />
      <Eclipse
        className={clsx(
          `absolute h-[1.2rem] w-[1.2rem] transition duration-300`,
          currentTheme === "light"
            ? "scale-0 rotate-180"
            : "scale-100 rotate-0",
          currentTheme === "dark"
            ? "dark:scale-0 rotate-180"
            : "dark:scale-100 rotate-0"
        )}
      />
    </Button>
  );
}
