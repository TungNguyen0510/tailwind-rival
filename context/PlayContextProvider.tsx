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
  /**
   * Indicates initial value is loaded from localStorage/defaults so consumers
   * can avoid writing stale defaults back.
   */
  isHydrated: boolean;
};

const PlayContextProvider = ({ children, id }: ProviderProps) => {
  const [play, setPlay] = useState<string>(playDefaultHtml);
  const [isHydrated, setIsHydrated] = useState(false);

  const context = { play, setPlay, isHydrated };

  useEffect(() => {
    const storedCode = localStorage.getItem(`play-${id}`);
    const initialCode = storedCode ?? playDefaultHtml;

    if (!storedCode) {
      localStorage.setItem(`play-${id}`, playDefaultHtml);
    }

    setPlay(initialCode);
    setIsHydrated(true);

    const storageUpdateHandler = (e: StorageEvent) => {
      if (e.key !== `play-${id}`) return;
      const storedValue = localStorage.getItem(`play-${id}`);

      if (storedValue) setPlay(storedValue);
    };

    const debouncedStorageUpdateHandler = debounce(storageUpdateHandler, 500);

    window.addEventListener("storage", debouncedStorageUpdateHandler);

    return () =>
      window.removeEventListener("storage", debouncedStorageUpdateHandler);
  }, [id]);

  return (
    <playContext.Provider value={context}>{children}</playContext.Provider>
  );
};

export const usePlayContext = () => useContext(playContext)!;

export default PlayContextProvider;
