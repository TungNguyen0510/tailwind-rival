import { useEffect } from "react";

export function useDisableRightClick() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handler);

    return () => {
      document.removeEventListener("contextmenu", handler);
    };
  }, []);
}
