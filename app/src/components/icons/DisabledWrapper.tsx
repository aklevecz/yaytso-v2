export default function DisabledWrapper({
  children,
}: {
  children: JSX.Element;
}) {
  return (
    <div
      style={{
        width: 90,
        height: 50,
        background: "black",
        // borderRadius: 100,
        padding: 10,
        boxSizing: "border-box",
        opacity: 0.2,
        margin: "10px auto",
      }}
    >
      {children}
    </div>
  );
}
