"use client";
import Images from "./Images";

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
