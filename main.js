import axios from "axios";
import { ethers } from "ethers";
import sendWrapTransaction from './utils/swap.js';
import { formatUnits } from "ethers";
import log from './utils/logger.js';
import banner from './utils/banner.js';

const TOKEN_ADDRESS = {
    POL: "0x0000000000000000000000000000000000000000",
    WPOL: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    tWPOL: "0x1Cd0cd01c8C902AdAb3430ae04b9ea32CB309CF1",
    NETWORK_ID: 137,
    TYPE: 2
};

// 1. FUNGSI CHECK-IN
async function getPoints(address) {
    log.info(`🔃 Trying to check current points...`);
    try {
        const response = await axios.get(`https://api.tea-fi.com/points/${address}`);
        log.info("📊 Total Points:", response?.data?.pointsAmount || 0);
    } catch (error) {
        log.error("❌ Error When Checking Points:", error.response?.data || error.message);
    }
}

async function checkInStatus(address) {
    try {
        const response = await axios.get(`https://api.tea-fi.com/wallet/check-in/current?address=${address}`);
        log.info("📅 Last CheckIn:", response?.data?.lastCheckIn || `Never check in`);
        return response?.data?.lastCheckIn;
    } catch (error) {
        log.error("❌ Failed to Check latest checkIn:", error.response?.data || error.message);
    }
}

async function checkIn(address) {
    try {
        const response = await axios.post(`https://api.tea-fi.com/wallet/check-in?address=${address}`, {});
        log.info("✅ Check-In Successfully:", response.data);
    } catch (error) {
        log.error("❌ Failed to Check-In:", error.response?.data || error.message);
    }
}

async function checkInUser(address) {
    if (!address) {
        log.error("❌ Invalid address for check-in");
        return;
    }
    
    log.info(`📢 Trying to check latest checkin user...`);
    const lastCheckIn = await checkInStatus(address);
    const lastDate = new Date(lastCheckIn).getUTCDate();
    const now = new Date().getUTCDate();
    if (lastDate !== now || !lastCheckIn) {
        log.info(`🔃 Trying to checkin...`);
        await checkIn(address);
    } else {
        log.info(`✅ Already checkin today...`);
    }
}

// 2. FUNGSI UNTUK MELAPORKAN TRANSAKSI KE TEAFI API
async function sendTransactionReport(txHash, address, amount, gasFee) {
    try {
        log.info(`🚀 Sending transaction report to TeaFi API...`);

        const fromTokenSymbol = "WPOL"; // Adjust if necessary
        const toTokenSymbol = "tWPOL"; // Adjust if necessary

        const payload = {
            hash: txHash,
            blockchainId: TOKEN_ADDRESS.NETWORK_ID,
            type: TOKEN_ADDRESS.TYPE,
            walletAddress: address,
            fromTokenAddress: TOKEN_ADDRESS.WPOL,
            toTokenAddress: TOKEN_ADDRESS.tWPOL,
            fromTokenSymbol,
            toTokenSymbol,
            fromAmount: amount,
            toAmount: amount,
            gasFeeTokenAddress: TOKEN_ADDRESS.WPOL,
            gasFeeTokenSymbol: fromTokenSymbol,
            gasFeeAmount: gasFee
        };

        const response = await axios.post("https://api.tea-fi.com/transaction", payload);
        log.info("✅ Transaction Report Successfully Sent:", response?.data);
    } catch (error) {
        log.error("❌ Failed to send transaction report to TeaFi API:", error.response?.data || error.message);
    }
}

// 3. FUNGSI UNTUK MENDAPATKAN GAS QUOTE
async function getGasQuote() {
    try {
        const gasStationUrl = "https://gasstation.polygon.technology/v2";
        const response = await axios.get(gasStationUrl);
        
        const fastGas = ethers.parseUnits(response.data.fast.maxFee.toFixed(9), "gwei");
        const boostedGas = fastGas * 130n / 100n;
        
        const maxGas = ethers.parseUnits("35", "gwei");
        const gasInNativeToken = boostedGas > maxGas ? maxGas : boostedGas;
        
        log.info("⛽ Using Polygon Gas Station:", `${formatUnits(gasInNativeToken, 9)} Gwei`);
        return gasInNativeToken.toString();
    } catch (error) {
        log.error("❌ Error fetching gas:", error.message);
        return ethers.parseUnits("35", "gwei").toString();
    }
}

// 4. MAIN LOOP
(async () => {
    log.info(banner);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    let counter = 0;
    while (true) {
        try {
            console.clear();
            counter++;
            log.info(`=💊==By:ZLKCYBER===MODIFY:Oxgr3y-CUANNODE==💊=`);
            log.info(`🔃 Processing Transaction ${counter}\n`);

            const gasFee = await getGasQuote();

            // Panggil fungsi untuk wrapping WPOL ke tWPOL
            const { address, txHash, amount } = await sendWrapTransaction(gasFee);

            if (address && txHash) {
                await checkInUser(address);
                await sendTransactionReport(txHash, address, amount, gasFee); // Kirim laporan transaksi
            }

            log.info(`=💊==========BANG UDAH BANG===========💊=`);
            await new Promise(resolve => setTimeout(resolve, 25000));
        } catch (error) {
            log.error("💀 Critical Error in Main Loop:", error.message);
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
})();