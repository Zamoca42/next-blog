type Props = {
  children?: React.ReactNode;
};

export function PostTitle({ children }: Props) {
  return (
    <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left text-pretty">
      {children}
    </h1>
  );
}
