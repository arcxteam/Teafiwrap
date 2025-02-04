# TeaFi Bot to getting candy 

![banner](image.png)

## How to do ?

- Register here using your wallet: [https://tea-fi.com/tea-party/](https://app.tea-fi.com/?ref=v6hrgs)
- Swap manual for WPOL (WMATIC) at least 50:50 POL</>WPOL
- This script running swap/wrap WPOL </> tWPOL
- This script auto pass daily check-in and collect point
- You can costum on **utils/swap.js** any unwrap or token and gwei too

## Requirements

- **Node.js**: have Node.js installed.
- **npm**: have npm installed.
- **Pm2** : have processing manager 2
- **POL Balance**: Ensure you have a **POL** balance for fees gas in polygon/matic network

## Setup

1. Clone this repository
   ```bash
   git clone https://github.com/arcxteam/teafiwrap.git
   cd Teafiwrap
   ```
2. Install Processing Manager 2 (if not yet)
   ```bash
   npm install -g pm2
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Fill your wallet privKey in `.env` format `PRIVATE_KEY=your_private_key`
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