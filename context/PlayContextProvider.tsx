"use client";

import {
  useState,
  useContext,
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

const playContext = createContext<PlayContext | null>(null);

import { debounce } from "@/utils/utils";
import { playDefaultHtml } from "@/constants/html";

type ProviderProps = { children: React.ReactNode; id: string };

type PlayContext = {
  play: string;
  setPlay: Dispatch<SetStateAction<string>>;
};

const PlayContextProvider = ({ children, id }: ProviderProps) => {
  const [play, setPlay] = useState<string>(playDefaultHtml);

  const context = { play, setPlay };

  useEffect(() => {
    const storedCode = localStorage.getItem(`play-${id}`);

    if (!storedCode) {
      localStorage.setItem(`play-${id}`, playDefaultHtml);
      return;
    }

    setPlay(storedCode);

    const storageUpdateHandler = (e: StorageEvent) => {
      if (e.key !== `play-${id}`) return;
      const storedValue = localStorage.getItem(`play-${id}`);

      if (storedValue) setPlay(storedValue);
    };

    const debouncedStorageUpdateHandler = debounce(storageUpdateHandler, 500);

    window.addEventListener("storage", debouncedStorageUpdateHandler);

    return () =>
      window.removeEventListener("storage", debouncedStorageUpdateHandler);
  }, []);

  return (
    <playContext.Provider value={context}>{children}</playContext.Provider>
  );
};

export const usePlayContext = () => useContext(playContext)!;

export default PlayContextProvider;
