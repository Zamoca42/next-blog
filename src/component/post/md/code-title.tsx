"use client";

import { ClassAttributes, HTMLAttributes, useState } from "react";
import { ExtraProps } from "react-markdown";
import { Check, Clipboard } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const codeText =
      event.currentTarget
        .closest("section")
        ?.querySelector("pre")
        ?.querySelector("code")?.textContent ?? "";
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayLanguage = language?.startsWith("diff-")
    ? language.split("-")[1]
    : language;

  return match ? (
    <section className={className} title={title} {...rest}>
      <div className="flex flex-row items-center justify-between pt-1">
        <button
          className="remark-code-copy-button ml-3"
          onClick={handleCopyClick}
          aria-label="copy"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </button>
        <div className="remark-code-title">{title}</div>
        <div className="remark-code-language mr-3">{displayLanguage}</div>
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
