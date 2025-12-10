"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { getQuickTailwindClasses } from "@/lib/tailwind-intellisense";
import { getTailwindColor, hexToRgb } from "@/lib/tailwind-colors";
import { getTailwindDocumentation } from "@/lib/tailwind-docs";
import { validateArbitraryValue, detectConflicts } from "@/lib/tailwind-arbitrary";

interface MonacoEditorProps {
  value?: string;
  theme?: "vs-dark" | "light" | "vs";
  language?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
  height?: string;
  options?: Record<string, unknown>;
}

let isMonacoInitialized = false;

/**
 * Enhanced Monaco Editor with Tailwind CSS autocomplete
 * Features:
 * - Tailwind class suggestions (200+ common classes)
 * - Color decorators for inline color preview
 * - Smooth scrolling and animations
 * - Smart bracket matching and indentation
 */
const MonacoEditor = ({
  value = "",
  theme = "vs-dark",
  language = "html",
  onChange,
  className,
  height,
  options = {},
}: MonacoEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initEditor = async () => {
      const monaco = await import("monaco-editor");

      if (!isMounted || !containerRef.current) return;

      monacoRef.current = monaco;

      /**
       * Validation function for Tailwind classes
       * 
       * This function:
       * 1. Finds all class attributes in the HTML
       * 2. Detects conflicts (multiple classes affecting same CSS property)
       * 3. Validates arbitrary values (e.g., bg-[#color], w-[100px])
       * 4. Creates warning/error markers in the editor
       */
      const validateTailwindClasses = (model: any) => {
        if (!model) return;

        const markers: any[] = [];
        const text = model.getValue();

        // Regex to find class="..." attributes in HTML
        const classRegex = /class\s*=\s*["']([^"']*)["']/g;

        let match;
        while ((match = classRegex.exec(text)) !== null) {
          const classValue = match[1];
          const classStart = match.index + match[0].indexOf(classValue);
          const classes = classValue.split(/\s+/).filter(Boolean);

          // Detect conflicts (e.g., multiple bg colors, multiple widths)
          const conflicts = detectConflicts(classes);

          // Create warning markers for each conflict
          for (const conflict of conflicts) {
            // Mark each conflicting class individually
            for (const conflictClass of conflict.classes) {
              const classIndex = classValue.split(/\s+/).findIndex(c => c === conflictClass);
              if (classIndex === -1) continue;

              // Calculate position of this specific class
              const precedingClasses = classValue.split(/\s+/).slice(0, classIndex).join(' ');
              const classOffset = precedingClasses ? precedingClasses.length + 1 : 0;
              const absoluteStart = classStart + classOffset;
              const absoluteEnd = absoluteStart + conflictClass.length;

              const startPos = model.getPositionAt(absoluteStart);
              const endPos = model.getPositionAt(absoluteEnd);

              markers.push({
                severity: monaco.MarkerSeverity.Warning,
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column,
                message: `${conflict.reason}: ${conflict.classes.join(', ')}`,
                source: 'Tailwind CSS',
                tags: [1], // Unnecessary tag
              });
            }
          }

          // Validate arbitrary values (e.g., bg-[#ff0000], w-[100px])
          let currentPos = 0;
          for (const className of classes) {
            const classIndex = classValue.indexOf(className, currentPos);
            const validation = validateArbitraryValue(className);

            // Create error marker if arbitrary value is invalid
            if (!validation.valid && validation.message) {
              const startPos = model.getPositionAt(classStart + classIndex);
              const endPos = model.getPositionAt(classStart + classIndex + className.length);

              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column,
                message: validation.message,
                source: 'Tailwind CSS',
              });
            }

            currentPos = classIndex + className.length;
          }
        }

        // Set markers in editor
        monaco.editor.setModelMarkers(model, 'tailwind', markers);
      };

      if (!isMonacoInitialized) {
        // Setup web workers
        window.MonacoEnvironment = {
          getWorker(_, label) {
            switch (label) {
              case "editorWorkerService":
                return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url));
              case "css":
              case "less":
              case "scss":
                return new Worker(new URL("monaco-editor/esm/vs/language/css/css.worker", import.meta.url));
              case "handlebars":
              case "html":
              case "razor":
                return new Worker(new URL("monaco-editor/esm/vs/language/html/html.worker", import.meta.url));
              case "json":
                return new Worker(new URL("monaco-editor/esm/vs/language/json/json.worker", import.meta.url));
              case "javascript":
              case "typescript":
                return new Worker(new URL("monaco-editor/esm/vs/language/typescript/ts.worker", import.meta.url));
              default:
                throw new Error(`Unknown label ${label}`);
            }
          },
        };

        // Load Tailwind classes from @tailwindcss/browser@4 approach
        let tailwindClassesCache: string[] = [];

        getQuickTailwindClasses().then(classes => {
          tailwindClassesCache = classes;
        });

        // Register Tailwind color provider for inline color decorators
        monaco.languages.registerColorProvider("html", {
          provideDocumentColors: (model) => {
            const colors: any[] = [];
            const text = model.getValue();

            // Find all class attributes and extract Tailwind color classes
            const classRegex = /class\s*=\s*["']([^"']*)["']/g;
            let match;

            while ((match = classRegex.exec(text)) !== null) {
              const classValue = match[1];
              const classStart = match.index + match[0].indexOf(classValue);

              // Split classes and check each one
              const classes = classValue.split(/\s+/);
              let currentPos = classStart;

              for (const className of classes) {
                const colorHex = getTailwindColor(className);

                if (colorHex && colorHex !== 'transparent' && colorHex !== 'currentColor') {
                  const rgb = hexToRgb(colorHex);

                  if (rgb) {
                    const startPos = model.getPositionAt(currentPos);
                    const endPos = model.getPositionAt(currentPos + className.length);

                    colors.push({
                      color: {
                        red: rgb.r / 255,
                        green: rgb.g / 255,
                        blue: rgb.b / 255,
                        alpha: 1,
                      },
                      range: {
                        startLineNumber: startPos.lineNumber,
                        startColumn: startPos.column,
                        endLineNumber: endPos.lineNumber,
                        endColumn: endPos.column,
                      },
                    });
                  }
                }

                // Move position forward (class + space)
                currentPos += className.length + 1;
              }
            }

            return colors;
          },

          provideColorPresentations: (model, colorInfo) => {
            const color = colorInfo.color;
            const red = Math.round(color.red * 255);
            const green = Math.round(color.green * 255);
            const blue = Math.round(color.blue * 255);
            const hex = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

            // Get the current text to determine the prefix (bg-, text-, border-, etc.)
            const range = colorInfo.range;
            const text = model.getValueInRange(range);
            const prefix = text.match(/^(bg|text|border|ring|shadow)-/)?.[1] || 'bg';

            return [
              {
                label: `${prefix}-[${hex}]`,
              },
            ];
          },
        });

        // Register Tailwind hover provider for documentation
        monaco.languages.registerHoverProvider("html", {
          provideHover: (model, position) => {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const line = model.getLineContent(position.lineNumber);
            const beforeWord = line.substring(0, position.column - 1);

            // Check if we're inside a class attribute
            const classMatch = beforeWord.match(/class\s*=\s*["']([^"']*)$/);
            if (!classMatch) return null;

            // Get the class name at cursor
            const className = word.word;

            // Get documentation
            const doc = getTailwindDocumentation(className);
            if (!doc) return null;

            // Get color if it's a color class
            const colorHex = getTailwindColor(className);

            let contents = [
              { value: `**${className}**` },
              { value: doc.description },
            ];

            if (doc.css) {
              contents.push({ value: `\`\`\`css\n${doc.css}\n\`\`\`` });
            }

            if (colorHex && colorHex !== 'transparent' && colorHex !== 'currentColor') {
              const rgb = hexToRgb(colorHex);
              if (rgb) {
                contents.push({
                  value: `**Color:** ${colorHex} <span style="display:inline-block;width:12px;height:12px;background:${colorHex};border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span>`
                });
              }
            }

            contents.push({ value: `*Category: ${doc.category}*` });

            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
              ),
              contents: contents,
            };
          },
        });

        // Register Tailwind CSS autocomplete provider
        monaco.languages.registerCompletionItemProvider("html", {
          triggerCharacters: ['"', "'", " ", "="],
          provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

            // Check if we're inside a class attribute
            const classMatch = textUntilPosition.match(/class\s*=\s*["']([^"']*)$/);
            if (!classMatch) {
              return { suggestions: [] };
            }

            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            };

            // Get current word to filter suggestions
            const currentWord = word.word.toLowerCase();

            // Get Tailwind documentation for enhanced suggestions
            const getTailwindDocs = (className: string) => {
              try {
                return getTailwindDocumentation(className);
              } catch {
                return null;
              }
            };

            // Filter and create suggestions from dynamic Tailwind classes
            const suggestions = tailwindClassesCache
              .filter(className =>
                className.toLowerCase().startsWith(currentWord) ||
                (currentWord && className.toLowerCase().includes(currentWord))
              )
              .slice(0, 100) // Limit to 100 suggestions for performance
              .map((className) => {
                const doc = getTailwindDocs(className);
                const colorHex = getTailwindColor(className);

                // Build documentation with CSS preview
                let documentation = doc ? `${doc.description}\n\n` : '';

                if (doc?.css) {
                  documentation += `\`\`\`css\n${doc.css}\n\`\`\`\n\n`;
                }

                if (colorHex && colorHex !== 'transparent' && colorHex !== 'currentColor') {
                  documentation += `**Color:** ${colorHex}\n\n`;
                }

                if (doc?.category) {
                  documentation += `*Category: ${doc.category}*`;
                }

                // Calculate sort priority
                let sortPrefix = '9'; // Default low priority

                if (className === currentWord) {
                  sortPrefix = '0'; // Exact match - highest
                } else if (className.toLowerCase().startsWith(currentWord.toLowerCase())) {
                  sortPrefix = '1'; // Starts with - high
                } else if (currentWord && className.toLowerCase().includes(currentWord.toLowerCase())) {
                  sortPrefix = '5'; // Contains - medium
                }

                // Boost common utilities
                if (['flex', 'grid', 'block', 'hidden', 'relative', 'absolute'].includes(className)) {
                  sortPrefix = '0' + sortPrefix;
                }

                return {
                  label: className,
                  kind: monaco.languages.CompletionItemKind.Class,
                  detail: doc ? doc.category : 'Tailwind CSS v4',
                  documentation: {
                    value: documentation || `Tailwind CSS utility class: ${className}`,
                    isTrusted: true,
                  },
                  insertText: className,
                  range: range,
                  sortText: `${sortPrefix}${className}`,
                };
              });

            return { suggestions };
          },
        });

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
        value,
        language,
        theme,
        ...enhancedOptions,
        ...options,
      } as any);

      editorRef.current = editor;

      // Validate on content change
      editor.onDidChangeModelContent(() => {
        onChange?.(editor.getValue());
        validateTailwindClasses(editor.getModel());
      });

      // Initial validation
      validateTailwindClasses(editor.getModel());

      setIsLoading(false);
    };

    initEditor();

    return () => {
      isMounted = false;
      editorRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
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
