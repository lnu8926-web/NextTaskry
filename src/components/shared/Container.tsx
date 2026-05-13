interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export default function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <section
      className={`w-full max-w-7xl px-10 mx-auto pb-25 pt-6 ${className || ""}`}
      {...props}
    >
      {children}
    </section>
  );
}
