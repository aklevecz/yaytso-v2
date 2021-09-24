export class Web3WindowApi {
  ethereum: any;
  address: string | undefined;
  isAvailable: boolean = false;
  chainId: number | undefined;

  constructor() {
    if (typeof window.ethereum !== "undefined") {
      this._init();
    } else {
      console.error("No metamask is present");
    }
  }

  async _init() {
    this.ethereum = window.ethereum;
    this.isAvailable = true;
  }

  requestAccount() {
    return this.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (accounts: string[]) => {
        this.address = accounts[0];
        return {
          address: this.address,
          chainId: this.chainId,
        };
      });
  }

  onNetworkChange(action: any) {
    this.ethereum.on("chainChanged", (chainId: number) => {
      action();
    });
  }

  // REFACTOR
  onAccountChange(action: any, fail: any) {
    this.ethereum.on("accountsChanged", (accounts: any) => {
      console.log("account change", accounts);
      try {
        // action();
        console.log("reload");
        window.location.reload();
      } catch (e) {
        console.log(e);
        fail();
      }
    });
  }

  onDisconnect(action: any) {
    this.ethereum.on("disconnect", () => {
      console.log("there is an issue connecting to the network");
    });
  }
}
