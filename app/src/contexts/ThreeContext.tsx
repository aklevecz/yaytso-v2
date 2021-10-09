import { useEffect, useRef, useState } from "react";
import { createContext, useContext, useReducer } from "react";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { useCallback } from "react";

import yaytso from "../assets/yaytso2.gltf";
import { usePattern } from "./PatternContext";
import { CanvasTexture } from "three";
import { getFullContainerHeight } from "./utils";
import { fetchYaytso, subscribeToYaytso } from "./services";
import { ipfsLink } from "../utils";
import { YaytsoMetaWeb2 } from "./types";

type LoadedObject = THREE.Mesh | THREE.Group | GLTF;

type Entity = {
  object: LoadedObject;
  name: string;
  pattern?: CanvasTexture;
};

type Action =
  | {
      type: "INIT";
      renderer: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      domElement: HTMLElement;
      controls: OrbitControls;
    }
  | { type: "ADD_ENITITIES"; entities: Entity[] }
  | {
      type: "UPDATE_ENTITY";
      name: string;
      key: "object" | "name" | "pattern";
      value: any;
    };

type Dispatch = (action: Action) => void;

type State = {
  previousRAF: number | undefined;
  renderer: THREE.WebGLRenderer | undefined;
  scene: THREE.Scene | undefined;
  domElement: HTMLElement | undefined;
  camera: THREE.PerspectiveCamera | undefined;
  controls: OrbitControls | undefined;
  player: any;
  entities: Array<Entity>;
  sceneLoaded: boolean;
  something: Array<any> | undefined;
};

const initialState = {
  previousRAF: undefined,
  renderer: undefined,
  scene: undefined,
  camera: undefined,
  controls: undefined,
  domElement: undefined,
  player: undefined,
  entities: [],
  sceneLoaded: false,
  something: [],
};

const ThreeContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      loadGLTF: (path: string, scene: THREE.Scene, scale?: number) => void;
    }
  | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        renderer: action.renderer,
        scene: action.scene,
        camera: action.camera,
        sceneLoaded: true,
        controls: action.controls,
      };
    case "ADD_ENITITIES":
      const newEntities = action.entities.map((entity: Entity) => entity.name);
      const entityState = state.entities.filter(
        (entity: Entity) => !newEntities.includes(entity.name)
      );
      return {
        ...state,
        entities: [...entityState, ...action.entities],
      };
    case "UPDATE_ENTITY":
      const entity = state.entities.find(
        (entity: Entity) => entity.name === action.name
      );
      if (!entity) {
        return state;
      }
      entity[action.key] = action.value;
      return { ...state, entities: [...state.entities, entity] };
    default:
      return state;
  }
};

const ThreeProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadGLTF = useCallback(
    (path: string, scene: THREE.Scene, scale = 1) => {
      const loader = new GLTFLoader();
      console.log("trying to load egg");
      loader.load(path, (object: GLTF) => {
        // object.scene.scale.set(0.1, 0.1, 0.1);
        object.scene.scale.set(scale, scale, scale);
        object.scene.position.y -= 0.0;
        const model = (object as GLTF).scene;
        model.traverse((o: any) => {
          if (o.isMesh) {
            const egg = o;
            const eggMaterial = egg.material as THREE.MeshBasicMaterial;
            eggMaterial.needsUpdate = true;
          }
        });
        // This could be removed and they could just be loaded first
        scene.add(object.scene);
        console.log("egg is loaded");
        dispatch({
          type: "ADD_ENITITIES",
          entities: [{ object, name: "egg" }],
        });
      });
    },
    [dispatch]
  );

  // useEffect(() => {
  //   if (!state.scene) {
  //     return;
  //   }
  //   loadGLTF(yaytso, state.scene);
  // }, [state.scene, loadGLTF]);

  const value = { state, dispatch, loadGLTF };
  return (
    <ThreeContext.Provider value={value}>{children}</ThreeContext.Provider>
  );
};

export { ThreeContext, ThreeProvider };

// This could probably be moved to the provider
// TODO: Maybe make scene loaded explicit state
export const useThreeScene = () => {
  let previousRAF = useRef(0);
  let frame = useRef(0);
  let stop = useRef(false);
  const context = useContext(ThreeContext);
  if (context === undefined) {
    throw new Error("Three Context error in ThreeScene hook");
  }

  const { dispatch, state } = context;

  const initScene = useCallback(
    (container: HTMLDivElement, encoding?: boolean, square = false) => {
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      const { width } = container.getBoundingClientRect();
      console.log(container.offsetWidth);
      console.log(width);
      // REFACTOR
      let height = width;
      if (!square) {
        const heightScalar = encoding ? 1 : 0.87;
        height = getFullContainerHeight() * heightScalar;
      }

      const windowAspect = width / height;
      renderer.setSize(width * 0.8, height * 0.8);
      renderer.setClearColor(0xffffff, 0);
      renderer.setPixelRatio(window.devicePixelRatio);
      // WTF is with this shit
      if (encoding) renderer.outputEncoding = THREE.sRGBEncoding;
      const domElement = renderer.domElement;
      console.log(domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, windowAspect, 0.1, 1000);
      if (square) {
        camera.position.z = 0.17;
      } else {
        camera.position.z = 0.3;
      }

      const controls = new OrbitControls(camera, domElement);
      controls.autoRotate = true;
      controls.update();

      const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.3);
      scene.add(hemi);

      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);

      // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.6);
      // scene.add(hemiLight);

      // const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      // scene.add(ambientLight);

      dispatch({ type: "INIT", renderer, scene, camera, domElement, controls });

      container.appendChild(domElement);

      return () => {
        domElement.remove();
        stop.current = true;
      };
    },
    [dispatch]
  );

  const step = (timeElapsed: number) => {
    const timeElapsedS = Math.min(1.0, 30, timeElapsed * 0.001);
    if (state.player) {
      state.player.update(timeElapsedS);
    }
  };

  const RAF = () => {
    frame.current = requestAnimationFrame((t) => {
      if (state.renderer === undefined) {
        return console.log("no renderer");
      }
      if (state.scene === undefined) {
        return console.log("no scene");
      }
      if (state.camera === undefined) {
        return console.log("no camera");
      }
      if (state.sceneLoaded) {
        const _previousRAF = previousRAF.current ? previousRAF.current : t;
        step(t - _previousRAF);
        state.renderer.render(state.scene, state.camera);
        state.controls && state.controls.update();
        previousRAF.current = _previousRAF;
        // setPreviousRAF(_previousRAF);
      }
      // RAF()
      !stop.current && setTimeout(() => RAF(), 1);
    });
  };

  useEffect(() => {
    if (state.renderer) {
      RAF();
    }

    return () => {
      cancelAnimationFrame(frame.current);
    };
    //eslint-disable-next-line
  }, [state.renderer]);

  return { initScene, RAF, scene: state.scene };
};

export const useThreePatternUpdater = () => {
  const pattern = usePattern();
  const context = useContext(ThreeContext);
  if (context === undefined) {
    throw new Error("Three Context error in ThreeScene hook");
  }
  const { state, loadGLTF } = context;

  const loadBlankYaytso = () => state.scene && loadGLTF(yaytso, state.scene);

  useEffect(() => {
    const object = state.entities.find(
      (entity: Entity) => entity.name === "egg"
    );
    if (!object) {
      return console.log("egg is either not loaded or missing");
    }
    const model = (object.object as GLTF).scene;
    model.traverse((o: any) => {
      if (o.isMesh) {
        const egg = o;
        const eggMaterial = egg.material as THREE.MeshBasicMaterial;
        if (pattern) {
          eggMaterial.map = pattern;
          // eggMaterial.color = new THREE.Color(1, 1, 1);
        } else {
          eggMaterial.map = null;
        }
        eggMaterial.needsUpdate = true;
      }
    });
    // const egg = (object.object as GLTF).scene.children[0] as THREE.Mesh;
    // const eggMaterial = egg.material as THREE.MeshBasicMaterial;
    // if (pattern) {
    //   eggMaterial.map = pattern;
    //   eggMaterial.color = new THREE.Color(1, 1, 1);
    // } else {
    //   eggMaterial.map = null;
    // }
    // eggMaterial.needsUpdate = true;
  }, [pattern, state.entities]);

  useEffect(() => {
    loadBlankYaytso();
  }, [state.scene]);
};

// THIS IS THE SVG CID
export const useFetchedYaytso = (metaCID: string) => {
  const context = useContext(ThreeContext);
  const [metadata, setMetadata] = useState<YaytsoMetaWeb2 | null>(null);
  if (context === undefined) {
    throw new Error("Three Context error in ThreeScene hook");
  }
  const { state, loadGLTF } = context;

  // This probably does not belong here
  useEffect(() => {
    console.log(metaCID);
    const unsub = subscribeToYaytso(metaCID, (metadata) => {
      setMetadata(metadata);
    });

    return () => {
      unsub();
    };
  }, []);

  console.log(metadata, metaCID);

  useEffect(() => {
    if (state.scene && metadata) {
      const gltfUrl = ipfsLink(metadata.gltfCID);
      console.log(metadata);
      loadGLTF(gltfUrl, state.scene, 0.7);
    }
  }, [state.scene, metadata]);

  return { metadata, entities: state.entities };
};

export const useGltfCid = (cid: string) => {
  const context = useContext(ThreeContext);
  const [loaded, setLoaded] = useState(false);
  console.log(cid);
  if (context === undefined) {
    throw new Error("Three Context error in ThreeScene hook");
  }
  const { state, loadGLTF } = context;

  useEffect(() => {
    console.log(state.scene);
    if (state.scene) {
      const gltfUrl = ipfsLink(cid);
      loadGLTF(gltfUrl, state.scene, 0.7);
      console.log("hi");
      setLoaded(true);
    }
  }, [state.scene, cid]);
  console.log(loaded);
  return { loaded, entities: state.entities };
};
