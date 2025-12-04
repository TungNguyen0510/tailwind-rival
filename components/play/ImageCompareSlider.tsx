"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  useReactCompareSliderRef,
} from "react-compare-slider";
import PlayIframe from "@/components/play/PlayIframe";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useKeyHold from "@/hooks/useKeyHold";

const CustomHandle = ({
  portrait,
  position,
}: {
  portrait: boolean;
  position: number;
}) => {
  const distance = portrait ? position * 3 : position * 4;

  return (
    <div
      className={cn(
        portrait
          ? "w-full h-[2px] cursor-ns-resize"
          : "w-[2px] h-full cursor-ew-resize",
        portrait
          ? distance === 300 || distance === 0
            ? "hidden"
            : ""
          : distance === 400 || distance === 0
            ? "hidden"
            : "",
        "bg-red-600 relative"
      )}
    >
      <span
        className={cn(
          portrait
            ? " bottom-0 -right-4 translate-y-1/2"
            : "-bottom-6 left-0 -translate-x-1/2",
          "absolute bg-red-600 rounded-md px-1"
        )}
      >
        {Math.floor(distance)}
      </span>
    </div>
  );
};

const ImageCompareSlider = ({
  isDiff,
  publicUrl,
}: {
  isDiff: boolean;
  publicUrl: string;
}) => {
  const sliderRef = useReactCompareSliderRef();

  const [position, setPosition] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [isPointerLeave, setIsPointerLeave] = useState(false);
  const isShiftHeld = useKeyHold("Shift");

  useEffect(() => {
    sliderRef.current?.setPosition(100);
    setTimeout(() => setIsPointerLeave(true), 0);
  }, []);

  useEffect(() => {
    if (!isPointerLeave) {
      setPortrait(isShiftHeld);
    }
  }, [isShiftHeld]);

  const handlePositionChange = useCallback(
    (position: number) => {
      setIsPointerLeave(false);
      setPosition(position);
    },
    [portrait]
  );

  return (
    <div className="relative w-[400px] h-[300px]">
      <ReactCompareSlider
        ref={sliderRef}
        onPositionChange={handlePositionChange}
        onPointerLeave={() =>
          setTimeout(() => {
            sliderRef.current?.setPosition(100);
            setIsPointerLeave(true);
          }, 100)
        }
        changePositionOnHover={true}
        portrait={portrait}
        transition="0.3s ease-in-out"
        itemOne={
          <div
            className={cn(
              isDiff ? "mix-blend-difference" : "mix-blend-normal",
              "relative w-full h-full"
            )}
          >
            <div className="relative w-full h-full">
              <PlayIframe
                key="PlayIframe Preview"
                className={cn("absolute inset-0 w-full h-full")}
              />

              <ReactCompareSliderImage
                src={publicUrl}
                alt="Image target"
                className={cn(
                  "absolute inset-0 w-full h-full",
                  isPointerLeave ? "opacity-0" : "opacity-10!",
                  "transition-all fade-in-25 fade-out-25"
                )}
              />
            </div>
          </div>
        }
        itemTwo={
          <ReactCompareSliderImage
            src={publicUrl}
            alt="Image two"
            className={cn("")}
          />
        }
        handle={<CustomHandle portrait={portrait} position={position} />}
        className="w-[400px] h-[300px] select-none touch-none transition-all fade-in-35 overflow-visible!"
      />
    </div>
  );
};

export default ImageCompareSlider;
