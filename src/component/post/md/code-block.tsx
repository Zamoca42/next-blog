import clsx from "clsx";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";

type CodeBlockProps = ClassAttributes<HTMLPreElement> &
  HTMLAttributes<HTMLPreElement> &
  ExtraProps;

const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  const { node, className, children, ...rest } = props;
  const match = className?.startsWith("language-");

  return match ? (
    <pre className={clsx(className, "scrollbar-hide")} {...rest}>
      {children}
    </pre>
  ) : (
    <pre className={className} {...rest}>
      {children}
    </pre>
  );
};

export default CodeBlock;
