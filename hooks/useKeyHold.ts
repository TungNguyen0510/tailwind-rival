import { useState, useEffect } from "react";

const useKeyHold = (targetKey: string) => {
  const [isHeld, setIsHeld] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey || (targetKey === "Ctrl" && event.ctrlKey)) {
        setIsHeld(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === targetKey || targetKey === "Ctrl") {
        setIsHeld(event.ctrlKey);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [targetKey]);

  return isHeld;
};

export default useKeyHold;
