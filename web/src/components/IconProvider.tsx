import React from "react";
import { IconContext } from "react-icons";
import { useTheme } from "@/components/ThemeProvider"

interface IconProviderProps {
  children: React.ReactNode
}

export function IconProvider({ children }: IconProviderProps) {
  const { theme } = useTheme();
  return (
    <IconContext.Provider value={{ color: theme === "dark" ? "white" : "black" }}>
      {children}
    </IconContext.Provider>
  )
}

