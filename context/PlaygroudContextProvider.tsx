"use client";

import {
  useState,
  useContext,
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

const playgroundContext = createContext<PlaygroundContext | null>(null);

import { debounce } from "@/utils/utils";
import { playgroundDefaultHtml } from "@/constants/html";

type ProviderProps = { children: React.ReactNode };

type PlaygroundContext = {
  playground: string;
  setPlayground: Dispatch<SetStateAction<string>>;
};

const PlaygroundContextProvider = ({ children }: ProviderProps) => {
  const [playground, setPlayground] = useState<string>(playgroundDefaultHtml);

  const context = { playground, setPlayground };

  useEffect(() => {
    const storedCode = localStorage.getItem(`playground`);

    if (!storedCode) {
      localStorage.setItem(`playground`, playgroundDefaultHtml);
      return;
    }

    setPlayground(storedCode);

    const storageUpdateHandler = (e: StorageEvent) => {
      if (e.key !== `playground`) return;
      const storedValue = localStorage.getItem(`playground`);

      if (storedValue) setPlayground(storedValue);
    };

    const debouncedStorageUpdateHandler = debounce(storageUpdateHandler, 500);

    window.addEventListener("storage", debouncedStorageUpdateHandler);

    return () =>
      window.removeEventListener("storage", debouncedStorageUpdateHandler);
  }, []);

  return (
    <playgroundContext.Provider value={context}>
      {children}
    </playgroundContext.Provider>
  );
};

export const usePlaygroundContext = () => useContext(playgroundContext)!;

export default PlaygroundContextProvider;
