import { ethers } from "ethers";
import log from './logger.js'
import dotenv from "dotenv";
import ora from 'ora';
dotenv.config();

// Constants
const WRAP_CONTRACT_ADDRESS = "0x1Cd0cd01c8C902AdAb3430ae04b9ea32CB309CF1"; // Kontrak tWPOL
const RPC_URL = "https://polygon-rpc.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MIN = 0.00001; // Minimal jumlah yang akan diproses
const MAX = 0.001000; // Maksimal jumlah yang akan diproses

// ABI untuk wrapping WPOL ke tWPOL
const WRAP_ABI = [
    "function wrap(uint256 amount) external" // Fungsi untuk wrapping WPOL ke tWPOL
];

async function sendWrapTransaction() {
    if (!PRIVATE_KEY) {
        log.error("❌ PRIVATE_KEY is missing. Set it in a .env file.");
        return;
    }

    let spinner;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(WRAP_CONTRACT_ADDRESS, WRAP_ABI, wallet);

    try {
        // Tentukan jumlah WPOL yang akan di-wrap
        const randomAmount = (Math.random() * (MAX - MIN) + MIN).toFixed(8);
        const amountToWrap = ethers.parseUnits(randomAmount.toString(), 18); // Pastikan menggunakan unit yang benar (18 desimal untuk token)

        log.info(`🔹 Wrapping ${randomAmount} WPOL to tWPOL...`);

        // Cek fee data
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice ? feeData.gasPrice * 125n / 100n : undefined; // Menggunakan fee yang lebih tinggi untuk transaksi yang lebih cepat

        // Kirim transaksi wrap
        const tx = await contract.wrap(amountToWrap, {
            gasPrice,
        });

        log.info(`📜 Transaction Sent at hash: ${tx.hash}`);
        spinner = ora(' Waiting for confirmation...').start();

        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Transaction confirmation timeout")), 90 * 1000)
        );

        // Tunggu hingga transaksi terkonfirmasi
        const receipt = await Promise.race([tx.wait(), timeout]);
        spinner.succeed(` Transaction confirmed in block: ${receipt.blockNumber}`);

        return { txHash: tx.hash, address: wallet.address, amount: amountToWrap.toString() };
    } catch (error) {
        if (spinner) {
            spinner.fail(` Transaction failed: ${error.message}`);
        } else {
            log.error("❌ Error sending transaction:", error.message);
        }

        return { txHash: null, address: wallet.address, amount: null };
    }
}

export default sendWrapTransaction;