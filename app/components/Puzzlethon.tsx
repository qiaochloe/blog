"use client";
import Image from "next/image";
import { useState } from "react";

type Img = {
  src: string;
  alt: string;
  height?: number;
  width?: number;
};

function Images({ images }: { images: Img[] }) {
  const [enlargedImage, setEnlargedImage] = useState<Img | null>(null);

  return (
    <>
      {/* Image Grid */}
      <div className="flex space-x-2">
        {images.map((img) => (
          <div
            key={img.src}
            className="relative cursor-pointer"
            onClick={() => setEnlargedImage(img)}
          >
            <Image
              src={img.src}
              alt={img.alt}
              height={img.height ?? 200}
              width={img.width ?? 200}
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-neutral-900/90 flex justify-center items-center z-50"
          onClick={() => setEnlargedImage(null)}
        >
          <Image
            src={enlargedImage.src}
            alt={enlargedImage.alt}
            height={enlargedImage.height ? enlargedImage.height * 2 : 500}
            width={enlargedImage.width ? enlargedImage.width * 2 : 500}
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </>
  );
}

export function PuzzlethonMap() {
  const images = [
    {
      src: "/2024-puzzlethon/puzzlethon-empty-map.png",
      alt: "The empty Puzzlethon map",
    },
    {
      src: "/2024-puzzlethon/puzzlethon-half-map.png",
      alt: "Half of the Puzzlethon map",
    },
    {
      src: "/2024-puzzlethon/puzzlethon-complete-map.png",
      alt: "The complete Puzzlethon map",
    },
  ];

  return <Images images={images} />;
}

export function PuzzlethonHinting() {
  const images = [
    {
      src: "/2024-puzzlethon/puzzlethon-hinting-mobile.png",
      alt: "The hinting page on mobile",
      width: 200,
    },
    {
      src: "/2024-puzzlethon/puzzlethon-hinting-desktop.png",
      alt: "The hinting page on desktop",
      width: 400,
    },
  ];

  return <Images images={images} />;
}

export function PuzzlethonCarberry() {
  const images = [
    {
      src: "/2024-puzzlethon/puzzlethon-carberry-not-completed.png",
      alt: "The Carberry puzzle, not completed",
    },
    {
      src: "/2024-puzzlethon/puzzlethon-carberry-completed.png",
      alt: "The Carberry puzzle, completed",
    },
  ];

  return <Images images={images} />;
}
