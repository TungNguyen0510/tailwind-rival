"use client";

import MonacoEditor from "@/components/ui/MonacoEditor";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import useKeyHold from "@/hooks/useKeyHold";
import { usePlaygroundContext } from "@/context/PlaygroudContextProvider";
import { Spinner } from "@/components/ui/spinner";

const PlaygroundEditor = () => {
  const { theme } = useTheme();
  const { playground, setPlayground, isHydrated } = usePlaygroundContext();

  const isCtrlHeld = useKeyHold("Ctrl");
  const isShiftHeld = useKeyHold("Shift");

  const changeHandler = (value: string | undefined) => {
    // Block writes until hydration to avoid overwriting storage with defaults.
    if (!isHydrated) return;

    const nextValue = value ?? "";
    localStorage.setItem(`playground`, nextValue);
    setPlayground(nextValue);
  };

  if (!isHydrated) {
    // Delay mounting Monaco until storage hydration completes to avoid default flash/overwrite.
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-1 px-4 border-b bg-accent">
          <div className="flex gap-3 items-center">
            <span className="font-medium">Editor</span>
          </div>
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          <Spinner className="size-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-1 px-4 border-b bg-accent">
        <div className="flex gap-3 items-center">
          <span className="font-medium">Editor</span>
          <div className="flex gap-2">
            <span
              className={cn(
                isCtrlHeld ? "translate-y-1" : "translate-y-0",
                "font-extrabold text-xs bg-muted px-1 rounded-sm pointer-events-none select-none"
              )}
            >
              CTRL
            </span>

            <span
              className={cn(
                isShiftHeld ? "translate-y-1" : "translate-y-0",
                "font-extrabold text-xs bg-muted px-1 rounded-sm pointer-events-none select-none"
              )}
            >
              SHIFT
            </span>
          </div>
        </div>
        <span className="text-sm">{playground.length} characters</span>
      </div>

      <MonacoEditor
        value={playground}
        theme={theme === "dark" ? "vs-dark" : "light"}
        language="html"
        onChange={changeHandler}
        className="w-full max-h-[calc(100vh-48px-40px-32px)] max-[1240px]:max-h-[calc(100vh-48px-40px-32px-56px)]"
        options={{
          autoClosingQuotes: "always",
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: "on",
          autoIndent: "full",
          smoothScrolling: true,
          wordWrap: "on",
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          formatOnPaste: true,
          formatOnType: true,
          fontSize: 18,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};

export default PlaygroundEditor;
