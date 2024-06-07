"use client";

import { ClassAttributes, ImgHTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";
import Image from "next/image";

type CodeTitleProps = ClassAttributes<HTMLImageElement> &
  ImgHTMLAttributes<HTMLImageElement> &
  ExtraProps;

const ImageInPost: React.FC<CodeTitleProps> = (props) => {
  const { node, alt, width, height, src, ...rest } = props;
  const parsedSrc = src ?? "/asset/blog/dynamic-routing/cover.jpg";
  const paredAlt = alt ?? "image";
  return (
    <span className="flex flex-col items-center justify-center">
      <Image
        width={768}
        height={500}
        alt={paredAlt}
        src={parsedSrc}
        {...rest}
        className="rounded-xl"
        quality={80}
        priority={true}
        unoptimized
      />
      {alt && (
        <span className="text-sm text-muted-foreground">{paredAlt}</span>
      )}
    </span>
  );
};

export default ImageInPost;
