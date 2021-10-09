import { useState } from "react";
import { SketchPicker } from "react-color";
import Button from "../../components/Button";
import { useDraw } from "../../contexts/PatternContext";

const BLUE_COLOR = "#6483c9";
const RED_COLOR = "#ff4364";

export default function DrawingTools() {
  const [showTools, setShowTools] = useState(false);
  const { lineWidth, updateLineWidth, color, updateColor, clearDrawing } =
    useDraw();

  const toggleTools = () => setShowTools(!showTools);

  return (
    <div style={{ display: "flex" }}>
      {showTools ? (
        <>
          <SketchPicker
            color={color}
            onChange={(color) => updateColor(color.rgb)}
          />
          <div style={{ padding: 5 }}>
            {[5, 10, 15, 20, 30].map((brush) => (
              <div
                key={brush}
                style={{
                  margin: "10px auto",
                  width: brush + 10,
                  height: brush + 10,
                  background: lineWidth === brush ? "red" : "black",
                  borderRadius: "50%",
                }}
                onClick={() => updateLineWidth(brush)}
              />
            ))}
            <Button
              background={BLUE_COLOR}
              size="xs"
              name="Clear"
              onClick={clearDrawing}
            />
            <Button
              background={RED_COLOR}
              margin="10px auto"
              size="xs"
              name="Hide"
              onClick={toggleTools}
            />
          </div>
        </>
      ) : (
        <div style={{ margin: "10px auto" }}>
          <Button size="flex" name="Show Tools" onClick={toggleTools} />
        </div>
      )}
    </div>
  );
}
