"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface MonacoEditorProps {
  value?: string;
  theme?: "vs-dark" | "light" | "vs";
  language?: string;
  onChange?: (value: string | undefined) => void;
  /**
   * Fired once the editor is fully initialized. Useful for parents that want to
   * defer sending the actual value until Monaco is ready.
   */
  onReady?: () => void;
  className?: string;
  height?: string;
  options?: Record<string, unknown>;
}

let isMonacoInitialized = false;

const MonacoEditor = ({
  value = "",
  theme = "vs-dark",
  language = "html",
  onChange,
  onReady,
  className,
  height,
  options = {},
}: MonacoEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const latestValueRef = useRef<string | undefined>(value);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initEditor = async () => {
      const monaco = await import("monaco-editor");

      if (!isMounted || !containerRef.current) return;

      monacoRef.current = monaco;

      if (!isMonacoInitialized) {
        // Setup web workers including Tailwind CSS worker
        window.MonacoEnvironment = {
          getWorker(_, label) {
            switch (label) {
              case "editorWorkerService":
                return new Worker(
                  new URL(
                    "monaco-editor/esm/vs/editor/editor.worker",
                    import.meta.url
                  )
                );
              case "css":
              case "less":
              case "scss":
                return new Worker(
                  new URL(
                    "monaco-editor/esm/vs/language/css/css.worker",
                    import.meta.url
                  )
                );
              case "handlebars":
              case "html":
              case "razor":
                return new Worker(
                  new URL(
                    "monaco-editor/esm/vs/language/html/html.worker",
                    import.meta.url
                  )
                );
              case "json":
                return new Worker(
                  new URL(
                    "monaco-editor/esm/vs/language/json/json.worker",
                    import.meta.url
                  )
                );
              case "javascript":
              case "typescript":
                return new Worker(
                  new URL(
                    "monaco-editor/esm/vs/language/typescript/ts.worker",
                    import.meta.url
                  )
                );
              case "tailwindcss":
                return new Worker(
                  new URL(
                    "@tungnn1/monaco-tailwindcss/tailwindcss.worker",
                    import.meta.url
                  )
                );
              default:
                throw new Error(`Unknown label ${label}`);
            }
          },
        };

        // Configure monaco-tailwindcss for Tailwind CSS IntelliSense
        const { configureMonacoTailwindcss } = await import(
          "@tungnn1/monaco-tailwindcss"
        );
        configureMonacoTailwindcss(monaco);

        isMonacoInitialized = true;
      }

      // Enhanced editor options for smooth UX
      const enhancedOptions = {
        // Auto-completion
        autoClosingQuotes: "always",
        autoClosingBrackets: "always",
        autoIndent: "full",
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: "on",

        // IntelliSense
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true,
        },
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: "currentDocument",
        parameterHints: { enabled: true },
        suggestSelection: "first",
        tabCompletion: "on",

        // Color decorators for inline color preview
        colorDecorators: true,
        colorDecoratorsActivatedOn: "clickAndHover",
        colorDecoratorsLimit: 500,

        // Smooth appearance
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        cursorStyle: "line",
        fontLigatures: true,
        renderWhitespace: "none",
        renderLineHighlight: "all",

        // Word wrapping
        wordWrap: "on",
        wrappingStrategy: "advanced",

        // Minimap
        minimap: { enabled: false },

        // Scrollbar
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          useShadows: false,
        },

        // Formatting
        formatOnPaste: true,
        formatOnType: true,

        // Line numbers
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        folding: true,
        foldingStrategy: "auto",

        // Bracket matching
        matchBrackets: "always",
        bracketPairColorization: { enabled: true },

        // Misc
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 8, bottom: 8 },
        linkedEditing: true,
        contextmenu: true,
        mouseWheelZoom: true,

        // Hover
        hover: {
          enabled: true,
          delay: 300,
          sticky: true,
        },

        // Indent guides
        guides: {
          bracketPairs: true,
          indentation: true,
          highlightActiveIndentation: true,
        },
      };

      const editor = monaco.editor.create(containerRef.current, {
        // Use freshest known value to avoid stale defaults when parent state
        // updates before Monaco finishes loading.
        value: latestValueRef.current ?? "",
        language,
        theme,
        ...enhancedOptions,
        ...options,
      } as any);

      editorRef.current = editor;

      // Handle content changes
      editor.onDidChangeModelContent(() => {
        onChange?.(editor.getValue());
      });

      setIsLoading(false);
      onReady?.();
    };

    initEditor();

    return () => {
      isMounted = false;
      editorRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    latestValueRef.current = value;

    if (!editorRef.current || value === undefined) return;

    const currentValue = editorRef.current.getValue();
    if (currentValue !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: height || "100%" }}
    >
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Spinner className="size-6" />
        </div>
      )}
    </div>
  );
};

export default MonacoEditor;
