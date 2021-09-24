import Button from "../../components/Button";
import { useModalData, useModalToggle } from "../../contexts/ModalContext";
import { ipfsLink } from "../../utils";

const ListItemContainer = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => (
  <div
    style={{
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      margin: 10
    }}
  >
    {children}
  </div>
);

const ListItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <ListItemContainer>
      <div style={{ borderBottom: "1px solid black" }}>{label}</div>
      <div>{value}</div>
    </ListItemContainer>
  );
};

const ListLink = ({
  label,
  value,
  url,
}: {
  label: string;
  value: string;
  url: string;
}) => {
  return (
    <ListItemContainer>
      <div style={{ borderBottom: "1px solid black" }}>{label}</div>
      <a href={url}>{value}</a>
    </ListItemContainer>
  );
};

export default function EggInfo() {
  const { toggleModal } = useModalToggle();

  const { data } = useModalData();
  const { name, description, metaCID, svgCID } = data.metadata;
  return (
    <div>
      <div className="modal__title">Egg Info</div>
      <div style={{ display: "grid", gridTemplateColumns: "50% 1fr", alignItems: "center", padding: "10px 10px 35px" }}>
        <div>
          <ListItem label={"Name"} value={name} />
          <ListItem label={"Description"} value={description} />
          <ListLink
            label={"Metadata"}
            value={`ipfs://${metaCID}`}
            url={ipfsLink(metaCID)}
          />
        </div>
        <div>
          <img src={ipfsLink(svgCID)} />
        </div>
      </div>
      <div className="modal__button-container">
        <Button name="Ok" onClick={toggleModal} />
      </div>
    </div>
  );
}
