type Props = {
  children: JSX.Element[];
};
export default function InnerButtonContainer({ children }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}
