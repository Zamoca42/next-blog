"use client";

import clsx from "clsx";
import { ClassAttributes, HTMLAttributes, useState } from "react";
import { ExtraProps } from "react-markdown";

type CodeBlockProps = ClassAttributes<HTMLPreElement> &
  HTMLAttributes<HTMLPreElement> &
  ExtraProps;

const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  const { node, className, children, ...rest } = props;
  const match = className?.startsWith("language-");
  const [copied, setCopied] = useState(false);
  
  const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const preElement = event.currentTarget.previousElementSibling;
    if (preElement) {
      const codeElement = preElement.querySelector("code");
      if (codeElement) {
        const codeText = codeElement.textContent || "";
        navigator.clipboard.writeText(codeText).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // 2초 후에 "Copied!" 상태를 원래대로 되돌림
        });
      }
    }
  };

  return match ? (
    <>
      <pre className={clsx(className, "scrollbar-hide")} {...rest}>
        {children}
      </pre>
      <button className="remark-code-copy-button" onClick={handleCopyClick}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </>
  ) : (
    <pre className={className} {...rest}>
      {children}
    </pre>
  );
};

export default CodeBlock;
