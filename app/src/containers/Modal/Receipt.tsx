import Button from "../../components/Button";
import { useModalData, useModalToggle } from "../../contexts/ModalContext";
import { ipfsLink } from "../../utils";

export const Bold = ({ children }: { children: JSX.Element | string }) => (
  <span style={{ fontWeight: "bold" }}>{children}</span>
);
const RINKEBY_ETHERSCAN = "https://rinkeby.etherscan.io/tx";
const POLYSCAN_URL = "https://polygonscan.com/tx";

// TODO: type
export default function Receipt() {
  const { data } = useModalData();
  const { toggleModal } = useModalToggle();
  const { metaCID, svgCID, transactionHash, blockNumber, tokenId } = data;

  return (
    <>
      <div className="modal__block">
        <div className="mint__receipt">
          <div className="mint__receipt__id">{tokenId}</div>
          <div>
            <div>
              <Bold>Metadata</Bold>
            </div>
            <a className="mint__receipt__meta-cid" href={ipfsLink(metaCID)}>
              ipfs://{metaCID}
            </a>
          </div>
          <div>
            <div>
              <Bold>Tx</Bold>
            </div>
            <a
              className="mint__receipt__tx-hash"
              href={`${POLYSCAN_URL}/${transactionHash}`}
            >
              {transactionHash}
            </a>
          </div>
          <div>
            <div>
              <Bold>Block#</Bold>
            </div>
            <div className="mint__receipt__block-number">{blockNumber}</div>
          </div>
          <img className="mint__receipt__img" src={ipfsLink(svgCID)}></img>
        </div>
      </div>
      <div className="modal__button-container">
        <Button name="Ok" onClick={toggleModal} />
      </div>
    </>
  );
}
