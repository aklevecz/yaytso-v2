type Props = {
  children: JSX.Element;
};
export default function IconWrapper({ children }: Props) {
  return (
    <div
      style={{
        flex: "0 0 25%",
        width: 30,
        height: 30,
        paddingRight: 5,
      }}
    >
      {children}
    </div>
  );
}
