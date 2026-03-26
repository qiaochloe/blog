"use client";
import Images from "./Images";

export function PuzzlethonMap() {
  const images = [
    {
      src: "/puzzlethon-2024/puzzlethon-empty-map.png",
      alt: "The empty Puzzlethon map",
    },
    {
      src: "/puzzlethon-2024/puzzlethon-half-map.png",
      alt: "Half of the Puzzlethon map",
    },
    {
      src: "/puzzlethon-2024/puzzlethon-complete-map.png",
      alt: "The complete Puzzlethon map",
    },
  ];

  return <Images images={images} />;
}

export function PuzzlethonHinting() {
  const images = [
    {
      src: "/puzzlethon-2024/puzzlethon-hinting-mobile.png",
      alt: "The hinting page on mobile",
      width: 200,
    },
    {
      src: "/puzzlethon-2024/puzzlethon-hinting-desktop.png",
      alt: "The hinting page on desktop",
      width: 400,
    },
  ];

  return <Images images={images} />;
}

export function PuzzlethonCarberry() {
  const images = [
    {
      src: "/puzzlethon-2024/puzzlethon-carberry-not-completed.png",
      alt: "The Carberry puzzle, not completed",
    },
    {
      src: "/puzzlethon-2024/puzzlethon-carberry-completed.png",
      alt: "The Carberry puzzle, completed",
    },
  ];

  return <Images images={images} />;
}
