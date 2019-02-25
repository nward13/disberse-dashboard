# Disberse Dashboard  
  
A basic example Dapp using React and Ethereum smart contracts to create a simulated payments dashboard. The basic idea is that users / aid organizations deposit fiat currency off chain, then an authorized user of the contract mints an equivalent amount of funds to the user in the Payments Contract. The funds can be transferred around on-chain until the equivalent fiat funds are withdrawn. Then, the authorized user can burn the on-chain funds.

## Requirements  
MetaMask or another web3-enabled browser
  
## How to use it  
The contracts are available on local test instances as well as on the Rinkeby test network. The fronted is available via a local dev server or on [IPFS](https://ipfs.io/).  

**IPFS Hash for the Frontend:** [QmVQ4H8XZcXU3erJjwJMZDcUFXgMPZ8LNgtVhgrY6m2ZxA](https://gateway.pinata.cloud/ipfs/QmVQ4H8XZcXU3erJjwJMZDcUFXgMPZ8LNgtVhgrY6m2ZxA/)  
**Contract Address on Rinkeby:** [0x584aEF3404B15B45ACeEe7426EB8e9D24754c11b](https://rinkeby.etherscan.io/address/0x584aef3404b15b45aceee7426eb8e9d24754c11b)  
  
The fastest way to try out the project is to go to the IPFS url above and connect MetaMask to the Rinkeby network. You won't have any funds, but the Rinkeby version of the contract allows anyone to become an "authorized user" and mint funds to test the contract with. You can use the Etherscan link above and go to the "Write Contract" tab, then call the "authorizeMe()" function to gain authorization. From there, you can use the "Make a Transfer" functions in the Dapp.

Note: There's a bug in the frontend integration with IPFS (something to do with the way IPFS serves the root directory path). So, you'll need to click the "Disberse Dashboard" link on the Navbar to load the entire homepage.  

## Running it Locally  
The following commands allow you to run a local ganache instance, deploy the contracts to this local testchain, and run a local dev server to serve the frontend. These pieces are somewhat modular, so you can use them as you choose. You can deploy the contract locally and interact with it via the truffle console without the frontend. Alternatively, you can run the frontend locally and connect it to the Rinkeby instance of the contract.  
  
## Deploying the contract  
- `git clone and cd into the project directory`  
From the project root:  
- `npm install`  
- `ganache-cli`  
In a separate terminal:  
- `truffle migrate --compile-all --reset`  
  This will deploy the contract to a ganache instance running on port 8545.  
## Serving the frontend locally  
- `cd client && npm install`  
- `npm run start`  
This will serve the frontend on [localhost:3000]. Import the seed phrase from the ganache-cli accounts into MetaMask, then connect MetaMask to "Localhost 8545". The first address in the HD path will be an authorized user and can mint funds to any other users via the "Make a Transfer" page. Other users can make transfers on the same page and see their transaction history on the dashboard page.  
 
## Where is the code  
The code for the project is made up of two parts. The smart contracts, contract tests, and deployment scripts are in the root directory. The main contract is /contracts/Payments.sol, and the tests for this contract are in /test/payments.js. A flattened version of the contract can be found on Rinkeby at the above address.  
The frontend is located in the client directory, with the majority of the interesting code being in /client/src/js/App.js and /client/src/js/components/. If you don't want to run a local ganache instance or deploy the contracts locally, the frontend can be run locally without the local testchain and used with the contract on Rinkeby. Simply run `npm install && npm start` from the client directory and connect MetaMask to the Rinkeby network.