"use client";
import Image from "next/image";
import { useState } from "react";

export function EnlargedImage(props) {
  const [enlargedImage, setEnlargedImage] = useState<boolean>(false);

  return (
    <>
      {/* Image Grid */}
      <div className="flex space-x-2">
        <div
          className="relative cursor-pointer"
          onClick={() => setEnlargedImage(true)}
        >
          <Image alt={props.alt} {...props} className="rounded-lg" />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-neutral-900/90 flex justify-center items-center z-50"
          onClick={() => setEnlargedImage(false)}
        >
          <Image
            src={props.src}
            alt={props.alt}
            height={props.height * 2}
            width={props.width * 2}
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </>
  );
}
