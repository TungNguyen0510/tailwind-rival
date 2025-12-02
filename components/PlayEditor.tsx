"use client";

import { usePlayContext } from "@/context/PlayContextProvider";
import MonacoEditor from "@monaco-editor/react";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import useKeyHold from "@/hooks/useKeyHold";

const Editor = ({ id }: { id: string }) => {
  const { theme } = useTheme();
  const { play, setPlay } = usePlayContext();

  const isCtrlHeld = useKeyHold("Ctrl");
  const isShiftHeld = useKeyHold("Shift");

  const changeHandler = (value: string | undefined) => {
    value = value ?? "";
    localStorage.setItem(`play-${id}`, value);
    setPlay(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-1 px-4 border-b bg-card/50">
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
        <span className="text-sm">{play.length} characters</span>
      </div>

      <MonacoEditor
        value={play}
        theme={theme === "dark" ? "vs-dark" : "light"}
        language="html"
        onChange={changeHandler}
        className="w-full max-h-[calc(100vh-48px-40px-32px-52px)] max-[1240px]:max-h-[calc(100vh-48px-40px-32px-56px)]"
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

export default Editor;
