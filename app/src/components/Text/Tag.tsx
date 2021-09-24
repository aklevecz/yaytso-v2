const TagText = ({
  children,
  fontSize = "2rem",
  padding = ".8rem",
}: {
  children: JSX.Element | string;
  fontSize?: string | number;
  padding?: number | string;
}) => (
  <div
    style={{
      background: "black",
      color: "white",
      padding,
      fontSize,
      fontWeight: "bold",
    }}
  >
    {children}
  </div>
);
export default TagText;
