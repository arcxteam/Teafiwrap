import { ethers } from "ethers";
import log from './logger.js';
import dotenv from "dotenv";
import ora from 'ora';
import axios from 'axios'; // Tambahkan axios untuk fetch gas price
dotenv.config();

// Constants
const CONTRACT_ADDRESS = "0x1Cd0cd01c8C902AdAb3430ae04b9ea32CB309CF1"; // tWPOL Contract Address
const RPC_URL = "https://polygon-rpc.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MIN = 0.00001;
const MAX = 0.001000;

// ABI 
const ABI = [
    "function wrap(uint256 amount, address recipient) external",
    "function balanceOf(address account) external view returns (uint256)"
];

// Fungsi untuk mendapatkan gas price yang dioptimalkan
async function getOptimizedGasPrice() {
    try {
        const gasStationUrl = "https://gasstation.polygon.technology/v2";
        const response = await axios.get(gasStationUrl);
        
        const fastestMaxFee = response.data.fastest.maxFee;
        const baseGas = ethers.parseUnits(fastestMaxFee.toFixed(9), "gwei");
        const bufferedGas = baseGas * 145n / 100n; // Tambah buffer 45%
        
        const dynamicMaxGas = Math.max(
            ethers.parseUnits((fastestMaxFee * 1.5).toFixed(9), "gwei"),
            ethers.parseUnits("50", "gwei") // Minimal 50 Gwei
        );
        
        const finalGasPrice = bufferedGas > dynamicMaxGas ? bufferedGas : dynamicMaxGas;
        
        log.info("⛽ Optimized Gas:", `${ethers.formatUnits(finalGasPrice, 9)} Gwei`);
        return finalGasPrice.toString();
        
    } catch (error) {
        const fallbackGas = ethers.parseUnits("50", "gwei") + 
                          BigInt(Math.floor(Math.random() * 5e9)); // Fallback 50-55 Gwei
        log.warn("⚠️ Using fallback gas:", `${ethers.formatUnits(fallbackGas, 9)} Gwei`);
        return fallbackGas.toString();
    }
}

async function sendWrapTransaction() {
    if (!PRIVATE_KEY) {
        log.error("❌ PRIVATE_KEY is missing. Set it in a .env file.");
        return;
    }

    let spinner;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    try {
        // Cek saldo WPOL
        const balance = await contract.balanceOf(wallet.address);
        if (balance < ethers.parseEther(MIN.toString())) {
            log.error(`❌ Not enough WPOL balance. Current balance: ${ethers.formatEther(balance)} WPOL`);
            return;
        }

        const randomAmount = (Math.random() * (MAX - MIN) + MIN).toFixed(8);
        const amountToSend = ethers.parseEther(randomAmount.toString());

        log.info(`🔹 Wrapping ${randomAmount} WPOL to tWPOL...`);
        
        // Gunakan fungsi optimasi gas
        const gasPrice = await getOptimizedGasPrice();

        // Mengirim transaksi wrapping
        const tx = await contract.wrap(amountToSend, wallet.address, {
            gasPrice: gasPrice
        });

        log.info(`📜 Transaction Sent at hash: ${tx.hash}`);
        spinner = ora(' Waiting for confirmation...').start();

        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Transaction confirmation timeout")), 90 * 1000)
        );

        const receipt = await Promise.race([tx.wait(), timeout]);
        spinner.succeed(` Transaction confirmed in block: ${receipt.blockNumber}`);
        
        // Delay 25 detik sebelum transaksi berikutnya
        log.info('⏳ Waiting for 25 seconds before the next wrap...');
        await new Promise(resolve => setTimeout(resolve, 25000)); // 25 detik

        return { 
            txHash: tx.hash, 
            address: wallet.address, 
            amount: amountToSend.toString() 
        };
    } catch (error) {
        if (spinner) {
            spinner.fail(` Transaction failed: ${error.message}`);
        } else {
            log.error("❌ Error sending transaction:", error.message);
        }

        return { 
            txHash: null, 
            address: wallet.address, 
            amount: null 
        };
    }
}

export default sendWrapTransaction;