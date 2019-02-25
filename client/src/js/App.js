// Utils
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PaymentsContract from "../contracts/Payments.json";
import getWeb3 from "./utils/getWeb3";

// Components
import Nav from './components/layout/Nav';
import ActiveAccount from './components/layout/ActiveAccount';
import TransactionList from './components/pages/TransactionList';
import SendTransaction from './components/pages/SendTransaction';
import TransactionInfo from "./components/pages/TransactionInfo.js";

// styles
import "../css/App.css";

// contract deployment on rinkeby
const RINKEBY_CONTRACT_ADDRESS= '0x584aef3404b15b45aceee7426eb8e9d24754c11b';

export default class App extends Component {
  
  state = { 
    web3: null, 
    account: '0x0', 
    ethBalance: 0,
    contractBalance: 0,
    network: null, 
    contract: null 
  };


  // todo: fix memory leak and unset account change listener in componentWillUnmount
  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts
      const account = (await web3.eth.getAccounts())[0];
      
      // determine active network
      let network;
      const networkId = await web3.eth.net.getId();
      switch(networkId) {
        case 1:
          network = 'Mainnet';
          break;
        case 3:
          network = 'Ropsten';
          break;
        case 4:
          network = 'Rinkeby';
          break;
        case 42:
          network = 'Kovan';
          break;
        default:
          network = 'Private';
      }

      // get contract instance
      const deployedNetwork = PaymentsContract.networks[networkId];
      let instance;

      // if active network is local testchain and contract is deployed on it
      if (network == 'Private' && deployedNetwork !== undefined) {

        // get web3 contract instance on local testnet
        const contractInstance = this.getContractInstance(
          web3,
          PaymentsContract.abi, 
          deployedNetwork.address
        );

       // Set web3, account, network, and the contract instance to state
        this.setState({ 
          web3: web3,
          network: network, 
          account: account, 
          contract: contractInstance,
        });
        
        // update the user's ethBalance and contractBalance in state
        await this.updateBalances();

        // set a listener for a change in the active account
        this.setAccountChangeListener();

      } else if (network == 'Rinkeby') {
        // if active network is Rinkeby, we have hardcoded address for 
        // contract instance

        // get web3 instance of the contract
        const contractInstance = this.getContractInstance(
          web3, 
          PaymentsContract.abi, 
          RINKEBY_CONTRACT_ADDRESS
        );
          
        // Set web3, account, network, and the contract instance to state
        this.setState({ 
          web3: web3,
          network: network, 
          account: account, 
          contract: contractInstance,
        });

        // update the user's ethBalance and contractBalance in state
        await this.updateBalances();

        // set a listener for a change in the active account
        this.setAccountChangeListener();

      } else {
        alert("The Payments contract is not deployed on the active network. Please switch networks or deploy the contract on the current network.");
      }

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getContractInstance = (web3, abi, deployedAddress) => {
    // return a web3 contract instance at the designated address
    return new web3.eth.Contract(abi, deployedAddress);

  }

  setAccountChangeListener = async () => {
    // poll for metamask account changing
    setInterval(async() => {
      const activeAccount = (await this.state.web3.eth.getAccounts())[0];
      if (activeAccount !== this.state.account) {
        this.setState({ account: activeAccount });
        await this.updateBalances();
      }
    }, 100);
  }

  updateBalances = async () => {

    const ethBalance = await this.state.web3.eth.getBalance(this.state.account);

    // balance in our contract
    const contractBalance = await this.state.contract.methods.balances(
      this.state.account
    ).call();
    
    // update state with both balances
    this.setState({
      ethBalance: ethBalance,
      contractBalance: contractBalance,
    });
  }

  render() {

    // display active network
    const Network = (<h4><strong>Network:</strong> {this.state.network}</h4>);

    // main page with that displays user transaction history
    const TransactionListPage = () => (
      <TransactionList
        web3={this.state.web3}
        account={this.state.account}
        contract={this.state.contract}
        network={this.state.network}
      />
    );

    // page for interactiong with the contract 
    const SendPage = () => ( 
      <SendTransaction
        web3={this.state.web3}
        account={this.state.account}
        contract={this.state.contract}
      /> 
    );

    // if on Rinkeby, transaction hashes link to etherscan. If on local
    // testchain, show our own transaction info page
    const TransactionInfoPage = ({ match }) => (
      <TransactionInfo 
        web3={this.state.web3}
        transactionHash={match.params.transactionHash}
        contractAbi={this.state.contract._jsonInterface}
      />
    );

    if (!this.state.web3) {
      return <div>Loading web3...</div>;
    }
    return (
      <Router>
        <div className="App">
          <Nav />
          {Network}
          <ActiveAccount
            web3={this.state.web3}
            account={this.state.account}
            ethBalance={this.state.ethBalance}
            contractBalance={this.state.contractBalance}
          />
          <Route path="/" exact={true} component={TransactionListPage} />
          <Route path="/send/" component={SendPage} />
          <Route path="/tx/:transactionHash" component={TransactionInfoPage} />
        </div>
      </Router>
    );
  }
}
