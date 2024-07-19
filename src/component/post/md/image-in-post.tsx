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
        width={0}
        height={0}
        sizes="100vw"
        className="w-full h-auto rounded-xl cursor-pointer hover:shadow-xl"
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
