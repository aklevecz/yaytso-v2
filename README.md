# **yaytso**
A decentralized faberge egg inspired creation tool powered by [IPFS](https://ipfs.com) and the [Ethereum blockchain](https://ethereum.org). Helping the blockchain naive & savy create their own wondrous NFTs since 2021

Have a ball, make an egg-- well as long as you have a wallet with some eth to spare-- with the web app here ->  [yaytso.art](https://yaytso.art) 

Take a looksy at the ERC-721 contract on the mainnet here: [0x155b65c62e2bf8214d1e3f60854df761b9aa92b3](https://etherscan.io/address/0x155b65c62e2bf8214d1e3f60854df761b9aa92b3)

See the new crytpo newb friendlier version. Make an account with your phone, make an egg, think about how much you love it, then decide whether you want to make it NFT official [v2.yaytso.art](https://v2.yaytso.art)

## **Premise**

NFTs are great, decentralized storage is great, but unfortunately the degree of the curve one must climb in order to understand either of such things, is also great. The power is play is potent, it provides opportunity for motivation that is intrinsically imbedded in new found interests. Providing people with such stepping stones into new frontiers of technology will foster their development from both ends, with a middle path emerging into the brave new world.

## **Testing/Developing Locally**
### **Testing `Yaytso.sol`**  
Install dependencies  
`npm i`  
Run hardhat test script  
`npx hardhat test`  
__   
### **Compiling the `Yaytso.sol`**  
Compile the contract using `hardhat`  
`npx hardhat compile`  
The compiled contract abi's will be created in `app/src/ethereum/` for the frontend to consume  
__  
### **Create a Firebase project**  
Firebase is being used here as a quick and dirty way to run a db to store egg IPFS hash references along with user auth. All Firebase code is encapsulated in such a way that it will be easy to migrate to another solution as this project grows  

In order to run the web2 auth and firestore mongodb you will need the `firebase-cli`. You can find the documentation [here](https://firebase.google.com/docs/cli). Currently you will also need a Firebase project setup to run the auth

Initialize your project using `firebase init` with Firestore and Emulators being the main requirements  

Once you are ready to develop locally, you will run the Firestore emulator using `firebase emulators:start`  
__
### **Running the Frontend React App**
From the project root, move into the app directory  
`cd app`  
Install dependencies  
`yarn`  
Run local dev server  
`yarn start`  
The app will be reachable at `http://localhost:3000`  
__  
### **Running local pinning service**  
Create an account at [NFT.storage](https://nft.storage). Navigate to `API Keys` and copy the default key or create a new one for eggs  

From the project root, move into the pinning server directory  
`cd pinning-service`  

Create an `.env` file or use and rename `.env_template` replacing `your_token_here` with your NFT.storage API key  
  
Currently the pinning service also makes calls to the Firestore db using admin functions upon successfully pinning content to IPFS. Go through the steps here to generate a private key, and download the `json` file. rename the file `firebase-admin.json` and place it in the `pinning-service` directory  

Ok, now finally install the dependencies  
`npm i`  

Run the server using either  
`npm run start-mac`  or `npm run start-win`  

## You are ready to make eggs now
