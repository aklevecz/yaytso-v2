import { useInView } from "react-intersection-observer";
import Small from "../../components/Egg/Small";
import { YaytsoMetaWeb2 } from "../../contexts/types";

export default function EggItem({ gltfCID, legacy }: any) {
  const { ref, inView, entry } = useInView({
    threshold: 0,
  });
  return (
    <div ref={ref}>
      {inView && (
        <Small
          metadata={{} as YaytsoMetaWeb2}
          gltfCid={gltfCID}
          legacy={legacy}
        />
      )}
    </div>
  );
}
