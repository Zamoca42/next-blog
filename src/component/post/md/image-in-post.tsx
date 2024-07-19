"use client";

import { ClassAttributes, ImgHTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";
import Image from "next/image";

type ImageInPostProps = ClassAttributes<HTMLImageElement> &
  ImgHTMLAttributes<HTMLImageElement> &
  ExtraProps;

const ImageInPost: React.FC<ImageInPostProps> = (props) => {
  const { node, alt, width, height, src, ...rest } = props;
  const parsedSrc = src ?? "/asset/blog/dynamic-routing/cover.jpg";
  const paredAlt = alt ?? "image";
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        alt={paredAlt}
        src={parsedSrc}
        {...rest}
        onClick={() => window.open(src)}
        width={1440}
        height={630}
        style={{
          borderRadius: "1rem",
          cursor: "pointer",
          transition: "transform 0.3s ease-in-out",
        }}
        priority
      />
      {alt && (
        <span className="text-sm text-muted-foreground text-center truncate w-full">
          {paredAlt}
        </span>
      )}
    </div>
  );
};

export default ImageInPost;
