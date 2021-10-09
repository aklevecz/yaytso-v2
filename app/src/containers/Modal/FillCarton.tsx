import { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import DotTyping from "../../components/Loading/DotTyping";
import {
  CARTON_ADDRESS,
  useCartonContract,
  useYaytsoContract,
} from "../../contexts/ContractContext";
import { useModalData, useModalToggle } from "../../contexts/ModalContext";
import { claimUrl, ipfsLink } from "../../utils";

import QRCodeStyling from "qr-code-styling";
import TransactionProcessing, {
  TxStatus,
} from "../../components/TransactionProcessing";
import { batchFetchNFTs } from "../../contexts/services";

import posterTemplate from "../../assets/poster_template.png";
import { YaytsoMetaWeb2 } from "../../contexts/types";
import Small from "../../components/Egg/Small";

const PickYaytso = ({
  ok,
  pickYaytso,
  yaytsoIds,
  yaytsos,
}: {
  ok: () => void;
  pickYaytso: (id: number) => void;
  yaytsoIds: number[];
  yaytsos: any[];
}) => {
  const yaytsosLoaded = yaytsos.length > 0;
  return (
    <>
      <div className="modal__title">Your Available Yaytsos</div>
      <div className="modal__block">
        {!yaytsosLoaded && (
          <div style={{ margin: "50px 20px" }}>
            {/* <DotTyping /> */}
            You do not have any NFT eggs
          </div>
        )}
        <div
          className="yaytsoId__container"
          style={{ display: yaytsosLoaded ? "flex" : "none" }}
        >
          {yaytsos.map((yaytso) => (
            <div key={yaytso.patternHash} onClick={() => pickYaytso(yaytso.id)}>
              <div style={{ position: "absolute" }}>{yaytso.id}</div>
              <img src={ipfsLink(yaytso.svgCID)} />
            </div>
          ))}
        </div>
      </div>
      <div className="modal__button-container">
        <Button name="Nevermind" onClick={ok} />
      </div>
    </>
  );
};

enum Views {
  PickYaytso,
  ApproveYaytso,
  FillCarton,
  CreateSignature,
  CreateQR,
}

const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  data: "meepo",
  dotsOptions: {
    color: "#000000",
    type: "rounded",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 0,
  },
});

export default function FillCarton() {
  const { data } = useModalData();

  const [view, setView] = useState(Views.PickYaytso);
  const { toggleModal, open, closeModal } = useModalToggle();
  const {
    getOwnersYaytsos,
    getYaytsoURI,
    approveYaytsoForCarton,
    checkCartonIsApproved,
    txState,
    reset,
  } = useYaytsoContract();

  // Maybe have a different hook  for this particular process
  const {
    fillBox,
    signMessage,
    getBoxData,
    txState: cartonTxState,
    reset: cartonTxReset,
  } = useCartonContract();
  const [yaytsoIds, setYaytsoIds] = useState([]);
  const [yaytsos, setYaytsos] = useState<YaytsoMetaWeb2[]>([]);
  const [pickedYaytso, setPickedYaytso] = useState<any>({
    id: 0,
    img: "",
    name: "",
  });

  const [carton, setCarton] = useState({ boxId: 0, nonce: 0 });
  const [huntKey, setHuntKey] = useState("");

  const [loading, setLoading] = useState(
    // true
    data.skip ? Boolean(data.skip) : true
  );
  const qrRef = useRef<HTMLDivElement | null>(null);

  const { cartonId } = data;
  useEffect(() => {
    open &&
      getOwnersYaytsos().then(({ yaytsoIds, error }) => {
        if (error) {
          closeModal();
          return alert("must connect wlalet");
        }
        if (yaytsoIds.length === 0) setLoading(false);
        batchFetchNFTs(yaytsoIds).then((nfts: any) => {
          setYaytsos(nfts);
          setLoading(false);
        });
        // setYaytsoIds(ids);
      });
    if (!open) {
      setView(Views.PickYaytso);
    }
    // {
    //   yaytsoIds.forEach((id: number) => {
    //     getYaytsoURI(id).then(async (uri: string) => {
    //       const metadata = await fetch(
    //         ipfsLink(uri.replace("ipfs://", ""))
    //       ).then((r) => r.json());
    //       setImg(ipfsLink(metadata.image.replace("ipfs://", "")));
    //     });
    //   });
    // });
  }, [open]);

  // TODO: pickYaytso needs to be integrated with this skip logic
  useEffect(() => {
    if (data.skip && data.skip === "SIGNATURE") {
      getBoxData(data.cartonId).then((box) => {
        setCarton({ boxId: parseInt(box.id), nonce: parseInt(box.nonce) });
        setPickedYaytso({
          id: data.yaytso.id,
          img: ipfsLink(data.yaytso.image.replace("ipfs://", "")),
          gltf: ipfsLink(data.yaytso.animation_url.replace("ipfs://", "")),
          legacy: data.yaytso.legacy,
          name: data.yaytso.name,
        });
        setView(Views.CreateSignature);
        // setView(Views.CreateQR);
        setLoading(false);
      });
    }
  }, [data]);

  const nextView = () => {
    setView(view + 1);
  };

  const pickYaytso = (id: number) => {
    setLoading(true);
    getYaytsoURI(id).then((response) => {
      fetch(`${ipfsLink(response.replace("ipfs://", ""))}`)
        .then((r) => r.json())
        .then((meta) => {
          // const meta = { name: id };
          console.log(meta);
          setPickedYaytso({
            id,
            name: meta.name,
            img: ipfsLink(meta.image.replace("ipfs://", "")),
            gltf: meta.animation_url.replace("ipfs://", ""),
          });
          checkCartonIsApproved(id).then((address) => {
            if (address === CARTON_ADDRESS) {
              setView(Views.FillCarton);
              // setView(Views.ApproveYaytso);
            } else {
              setView(Views.ApproveYaytso);
            }
            setLoading(false);
          });
        });
    });
    // setPickedYaytso(id);
    // setView(Views.ConfirmYaytso);
  };

  const fillCarton = () => {
    fillBox(cartonId, pickedYaytso.id).then(({ boxId, nonce }) => {
      setCarton({ boxId, nonce });
      setView(Views.CreateSignature);
    });
  };

  const createSignature = () => {
    signMessage(carton.boxId, carton.nonce).then(({ signedMessage }) => {
      setHuntKey(signedMessage);
      setView(Views.CreateQR);
    });
  };

  // TODO: abstract
  const downloadQRCode = () => {
    // qrCode.download({ extension: "png" });
    const canvas = document.getElementById("poster") as HTMLCanvasElement;
    const image = canvas.toDataURL();
    const aLink = document.createElement("a");
    aLink.download = "yaytso_poster.png";
    aLink.href = image;
    aLink.click();
  };

  // TODO: abstract
  useEffect(() => {
    if (view === Views.CreateQR && qrRef.current && txState === 0) {
      console.log(claimUrl(huntKey, carton.boxId, carton.nonce));
      qrCode.update({
        image: pickedYaytso.img,
        data: claimUrl(huntKey, carton.boxId, carton.nonce),
      });

      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.id = "poster";
      const ctx = canvas.getContext("2d")!;
      const posterImg = new Image();
      posterImg.setAttribute("crossOrigin", "anonymous");
      posterImg.onload = () => {
        const width = posterImg.width * 1;
        const height = posterImg.height * 1;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(posterImg, 0, 0, width, height);

        qrCode.getRawData().then((blob) => {
          const qrImage = new Image();
          qrImage.setAttribute("crossOrigin", "anonymous");
          qrImage.onload = () => {
            ctx.drawImage(
              qrImage,
              width / 2.5,
              height - height * 0.25,
              width * 0.2,
              width * 0.2
            );
          };
          qrImage.src = URL.createObjectURL(blob);

          const eggImg = new Image();
          eggImg.setAttribute("crossOrigin", "anonymous");
          eggImg.onload = () => {
            ctx.drawImage(
              eggImg,
              width / 2.5,
              height / 2.6,
              width * 0.2,
              width * 0.2
            );
          };
          eggImg.src = pickedYaytso.img;
        });
      };
      posterImg.src = posterTemplate;
      qrRef.current.appendChild(canvas);
    }
  }, [view, cartonTxState]);

  if (txState || cartonTxState) {
    const tState = txState ? txState : cartonTxState;
    const sharedReset = txState ? reset : cartonTxReset;
    return (
      <TransactionProcessing
        status={(tState - 1) as unknown as TxStatus}
        next={() => {
          sharedReset();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="modal__block" style={{ height: 300 }}>
        <DotTyping />
      </div>
    );
  }
  return (
    <div>
      {view === Views.PickYaytso && (
        <PickYaytso
          yaytsoIds={yaytsoIds}
          yaytsos={yaytsos}
          ok={() => {
            // reset();
            // nextView();
            // reset();
            toggleModal();
          }}
          pickYaytso={pickYaytso}
        />
      )}
      {view === Views.ApproveYaytso && (
        <div>
          <div
            className="modal__title"
            style={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {pickedYaytso.name}
          </div>
          <div className="modal__block">
            Approve the Carton contract to transfer your yaytso
          </div>
          <div className="modal__block">
            {/* <img style={{ background: "#e5e4e4" }} src={pickedYaytso.img} /> */}
            <Small gltfCid={pickedYaytso.gltf} legacy={pickedYaytso.id <= 42} />
          </div>
          <div className="modal__button-container">
            <Button
              name="Approve"
              onClick={() => {
                approveYaytsoForCarton(pickedYaytso.id, nextView);
              }}
            />
          </div>
        </div>
      )}
      {view === Views.FillCarton && (
        <div>
          <div className="modal__title">
            Fill carton with{" "}
            <span style={{ color: "red" }}>{pickedYaytso.name}</span>
          </div>
          <div className="modal__block">
            {/* <img style={{ background: "#e5e4e4" }} src={pickedYaytso.img} /> */}
            <Small gltfCid={pickedYaytso.gltf} legacy={pickedYaytso.id <= 42} />
          </div>
          <div className="modal__button-container">
            <Button name="Fill Carton" onClick={fillCarton} />
          </div>
        </div>
      )}
      {view === Views.CreateSignature && (
        <div>
          <div className="modal__title">Create Signature</div>
          <div className="modal__block">
            In order to make your QR code with the secret message, you must sign
            with your wallet!
          </div>
          <div className="modal__button-container">
            <Button name="Sign" onClick={createSignature} />
          </div>
        </div>
      )}
      {view === Views.CreateQR && (
        <div id="chicken">
          <div className="modal__title">Your Poster</div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: 20,
            }}
            ref={qrRef}
          />
          <Button
            name="Download"
            onClick={downloadQRCode}
            margin="auto"
            display="block"
          />
        </div>
      )}
    </div>
  );
}
