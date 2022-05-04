type Props = {
  onNetworkChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  network: string;
};

export default function SelectNetwork({ onNetworkChange, network }: Props) {
  return (
    <div className="select__container">
      <select onChange={onNetworkChange} name="networks" value={network}>
        <option value="rinkeby">Rinkeby</option>
        <option value="mainnet">Mainnet</option>
        <option value="matic">Polygon</option>
      </select>
    </div>
  );
}
