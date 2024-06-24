import { ReactNode, createElement } from "react";

export const AppProvider = ({
  contexts,
  children,
}: {
  contexts: { component: React.ComponentType<any>; props?: any }[];
  children: ReactNode;
}) =>
  contexts.reduce(
    (prev, { component, props }) => createElement(component, props, prev),
    children
  );
