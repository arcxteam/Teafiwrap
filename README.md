# A Completed Guides - TeaFi Bot for Getting as Interactive TX/id 

![banner](image.png)
![IMG_1996](https://github.com/user-attachments/assets/9882ccf6-bbcc-4c96-a93e-a89b7c63021f)

## How to do ?

- Register here using your wallet: [https://tea-fi.com/tea-party/](https://app.tea-fi.com/?ref=bv65t2)
- Swap manual on web for **`WPOL (WMATIC)`** at least 50:50 **`POL</>WPOL`**
- This script running swap/wrap **`WPOL </> tWPOL`**
- This script auto pass daily check-in and collect point
- This script use gas/gwei based-on API Polygon
- This script have delay/looping with 20000ms
- You can costum on **`utils/swap.js`** any unwrap or token

## Requirements

- **Node.js**: have Node.js installed.
- **npm**: have npm installed.
- **Pm2** : have processing manager 2
- **POL Balance**: Ensure you have a **POL** balance for **gas fees** in polygon mainnet
- How much need POL balance? whatever, I thought starting `5 POL`

## Setup

1. Clone this repository
   ```bash
   git clone https://github.com/arcxteam/teafiwrap.git
   cd Teafiwrap
   ```
2. Install processing manager 2 (if not yet)
   ```bash
   npm install -g pm2
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Fill your wallet privKey in `.env` format **PRIVATE_KEY=your_private_key**
    ```bash
    cp .env-example .env && nano .env
    ```
5. Run at first time
    ```bash
    npm run start
    ```
6.  Run at second time for PM2
    ```bash
    pm2 start main.js --name Teafiwrap
    ```

   ![success](image-1.png)
   <img src="https://github.com/user-attachments/assets/e03148c6-848a-4e83-bd38-941ca923bfc8" alt="IMG_1997" width="770"/>

## Usefull Command Logs

- Status logs
   ```bash
   pm2 logs Teafiwrap
   ```
- Status stop/delete
   ```bash
   pm2 stop Teafiwrap
   ```

   ```bash
   pm2 delete Teafiwrap
   ```
- Status monitor
   ```bash
   pm2 monit or list
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).
