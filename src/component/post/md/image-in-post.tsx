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
  const parsedAlt = alt ?? "image";

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div className="relative w-full">
        <Image
          alt={parsedAlt}
          src={parsedSrc}
          {...rest}
          onClick={() => window.open(src)}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto max-h-[50vh] object-contain rounded-xl cursor-pointer hover:shadow-xl transition-shadow"
          priority
        />
        {alt && (
          <span className="text-sm text-muted-foreground text-center mt-2 block truncate w-full">
            {parsedAlt}
          </span>
        )}
      </div>
    </div>
  );
};

export default ImageInPost;
