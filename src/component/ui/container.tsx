type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto max-w-3xl">{children}</div>;
};

export default Container;
