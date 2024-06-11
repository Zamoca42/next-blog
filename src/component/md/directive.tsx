"use client";

import { ClassAttributes, DetailsHTMLAttributes, ReactNode } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { ExtraProps } from "react-markdown";

export type DirectiveProps = {
  children: ReactNode;
  title: string;
};

type DirectiveDetailsProps = ClassAttributes<HTMLDetailsElement> &
  DetailsHTMLAttributes<HTMLDetailsElement> &
  ExtraProps;

const InfoDirective: React.FC<DirectiveProps> = (props) => {
  const { children, title } = props;
  return (
    <section className="bg-secondary rounded-xl p-4 my-8">
      <div className="flex space-x-2 items-center text-accent-foreground font-semibold">
        <Info />
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
};

const DirectiveDetails: React.FC<DirectiveDetailsProps> = (props) => {
  const { children, title, ...rest } = props;
  return (
    <details className="bg-secondary rounded-xl p-4 my-8" {...rest}>
      <summary className="flex space-x-2 items-center text-accent-foreground font-semibold">
        <span className="icon-wrapper">
          <ChevronRight className="icon-closed" />
          <ChevronDown className="icon-open" />
        </span>
        <span>{title}</span>
      </summary>
      {children}
    </details>
  );
};

export { InfoDirective, DirectiveDetails };
