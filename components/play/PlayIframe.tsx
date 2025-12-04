"use client";

import { usePlayContext } from "@/context/PlayContextProvider";
import { cn } from "@/lib/utils";
import React from "react";

interface IframeProps extends React.HTMLAttributes<HTMLIFrameElement> {
  className?: string;
}

const PlayIframe = React.forwardRef<HTMLIFrameElement, IframeProps>(
  ({ className, ...props }, ref) => {
    const { play } = usePlayContext();

    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/tailwindcss-cdn@3.4.1/tailwindcss.js"></script>
        <script type="module">
          window.addEventListener('message', (event) => {
            const { type, value } = event.data;
            if (type === 'html') {
              document.body.innerHTML = value;
            }
          })
        </script>
      </head>
      <body>
        ${play}
      </body>
      </html>
    `;

    return (
      <iframe
        ref={ref}
        {...props}
        title="Iframe Preview"
        srcDoc={iframeContent}
        className={cn(
          className,
          "w-[400px] h-[300px] border-none pointer-events-none select-none touch-none bg-white"
        )}
      />
    );
  }
);

PlayIframe.displayName = "PlayIframe";

export default PlayIframe;
