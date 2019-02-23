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

export default class App extends Component {
  
  state = { web3: null, account: '0x0', network: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts
      const accounts = await web3.eth.getAccounts();

      // determine active network
      let network;
      const networkId = await web3.eth.net.getId();
      switch(networkId) {
        case '1':
          network = 'Mainnet';
          break;
        case '3':
          network = 'Ropsten';
          break;
        case '4':
          network = 'Rinkeby';
          break;
        case '42':
          network = 'Kovan';
          break;
        default:
          network = 'Private';
      }

      // get contract instance
      const deployedNetwork = PaymentsContract.networks[networkId];
      let instance;
      if (deployedNetwork !== undefined) {
        instance = new web3.eth.Contract(
          PaymentsContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        console.log("contract: ", instance);
    
        // Set web3, account, network, and the contract instance to state
        this.setState({ web3: web3, account: accounts[0], network: network, contract: instance });

        // poll for metamask account changing
        setInterval(async() => {
          const activeAccount = (await web3.eth.getAccounts())[0];
          if (activeAccount !== this.state.account) {
            this.setState({ account: activeAccount });
          }
        }, 100);

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

  render() {
    // const ActiveAddress = (
    //   <div className="line">
    //     <Blockie address={this.state.accounts[0]} size={3} />
    //     <h4 className="address">
    //       <strong>Address: </strong> 
    //       {this.state.accounts[0]}
    //     </h4>
    //   </div>
    // );

    const Network = (<h4><strong>Network:</strong> {this.state.network}</h4>);

    const TransactionListPage = () => (
      <TransactionList
        web3={this.state.web3}
        account={this.state.account}
        contract={this.state.contract}
        network={this.state.network}
      />
    );

    const SendPage = () => ( 
      <SendTransaction
        web3={this.state.web3}
        account={this.state.account}
        contract={this.state.contract}
      /> 
    );

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
            contract={this.state.contract}
          />
          <Route path="/" exact={true} component={TransactionListPage} />
          <Route path="/send/" component={SendPage} />
          <Route path="/tx/:transactionHash" component={TransactionInfoPage} />
        </div>
      </Router>
    );
  }
}
