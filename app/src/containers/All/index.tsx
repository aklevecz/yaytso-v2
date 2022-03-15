import { useEffect, useState } from "react";
import { fetchAllYaytsos } from "../../contexts/services";
import EggItem from "./EggItem";

export default function All() {
  const [yaytsos, setYaytsos] = useState<any>([]);

  useEffect(() => {
    fetchAllYaytsos().then((snapshots) => {
      const eggs: any = [];
      snapshots.forEach((snap) => {
        eggs.push(snap.data());
      });
      setYaytsos(eggs);
    });
  }, []);
  return (
    <div>
      {yaytsos.map((yaytso: any) => {
        return (
          <div key={yaytso.gltfCID} style={{ width: 200, height: 200 }}>
            <EggItem gltfCID={yaytso.gltfCID} legacy={yaytso.legacy} />
            <button
              onClick={() => {
                fetch(`http://localhost:8080/ipfs/${yaytso.gltfCID}`)
                  .then((r) => r.text())
                  .then((text) => {
                    var element = document.createElement("a");
                    element.setAttribute(
                      "href",
                      "data:text/plain;charset=utf-8," +
                        encodeURIComponent(text)
                    );
                    element.setAttribute("download", "shrimp.gltf");

                    element.style.display = "none";
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                  });
              }}
            >
              download
            </button>
          </div>
        );
      })}
    </div>
  );
}
