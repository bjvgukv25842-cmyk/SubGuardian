import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const privateKey = process.env.PRIVATE_KEY?.trim();
const chainId = Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID || 16661);
const rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc.0g.ai";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    zeroGMainnet: {
      url: rpcUrl,
      chainId,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
