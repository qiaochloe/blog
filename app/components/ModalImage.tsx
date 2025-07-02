"use client";
import Image from "next/image";
import { useState } from "react";

export function ModalImage(props) {
  const [modalImage, setModalImage] = useState<boolean>(false);

  const {
    alt,
    src,
    width = 500, // default width
    height = 500, // default height
    ...rest
  } = props;

  return (
    <>
      <Image
        onClick={() => setModalImage(true)}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-sm relative cursor-pointer"
        {...rest}
      />

      {/* Fullscreen Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-neutral-900/90 flex justify-center items-center z-50"
          onClick={() => setModalImage(false)}
        >
          <Image
            src={src}
            alt={alt}
            width={width * 2}
            height={height * 2}
            className="rounded-lg h-[50vh] w-auto"
          />
        </div>
      )}
    </>
  );
}
