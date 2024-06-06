"use client";

import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";

type CodeTitleProps = ClassAttributes<HTMLDivElement> &
  HTMLAttributes<HTMLDivElement> &
  ExtraProps & { "data-language"?: string };

const CodeTitle: React.FC<CodeTitleProps> = (props) => {
  const {
    node,
    className,
    children,
    title,
    "data-language": language,
    ...rest
  } = props;
  const match = className === "remark-code-container";

  return match ? (
    <section className={className} title={title} {...rest}>
      <div className="flex flex-row items-center justify-between px-4 pt-1">
        <div></div>
        <div className="remark-code-title">{title}</div>
        <div className="remark-code-language">{language}</div>
      </div>
      {children}
    </section>
  ) : (
    <div className={className} {...rest}>
      {children}
    </div>
  );
};

export default CodeTitle;
