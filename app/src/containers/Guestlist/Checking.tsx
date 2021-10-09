import DotTyping from "../../components/Loading/DotTyping";

export default function Checking() {
  return (
    <div
      style={{
        position: "absolute",
        width: 300,
        height: 300,
        top: "50%",
        left: "50%",
        marginLeft: -150,
        marginTop: -150,
        background: "red",
        display: "flex",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "2rem",
        fontWeight: "bold",
        color: "white",
        borderRadius: 40,
        zIndex: 1,
      }}
    >
      <div>
        <div style={{ padding: "10px 20px" }}>
          Checking if you were the first...
        </div>
        <DotTyping />
      </div>
    </div>
  );
}
