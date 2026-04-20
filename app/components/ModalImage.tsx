"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function ModalImage(props) {
  const [modalImage, setModalImage] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    alt,
    src,
    width = 500, // default width
    height = 500, // default height
    style,
    ...rest
  } = props;

  const modal = modalImage && mounted && (
    <div
      className="fixed inset-0 bg-neutral-900/90 flex justify-center items-center z-50"
      onClick={() => setModalImage(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Escape" && setModalImage(false)}
      aria-label="Close image"
    >
      <Image
        src={src}
        alt={alt}
        width={width * 2}
        height={height * 2}
        className="rounded-lg h-[50vh] w-auto"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  return (
    <>
      <Image
        onClick={() => setModalImage(true)}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-sm relative cursor-pointer"
        style={{ width: "auto", height: "auto", ...style }}
        {...rest}
      />
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
