/**
 * Instantiate contracts
 */

import { ethers } from "ethers";
import abiLayer from "./liquidityLayer.json"
import abiERC from "./erc20.json"

const contractAddress = "0xdEB0F354CC542Cb6d4E86836850505782E3Df3C0";
const usdcAddress = "0x5425890298aed601595a70AB815c96711a31Bc65";

export const fetchContract = async(signer) => {
    const contract = new ethers.Contract(contractAddress, abiLayer, signer);
    return contract;
}

export const fetchERCContract = async(signer) => {
    const contract = new ethers.Contract(usdcAddress, abiERC, signer);
    return contract;
}