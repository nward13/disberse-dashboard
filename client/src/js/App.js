import React, { Component } from "react";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
import PaymentsContract from "../contracts/Payments.json";
import getWeb3 from "./utils/getWeb3";

// components
import Nav from './components/Nav';
import Blockie from './components/Blockie';
import TxList from './components/TxList';

import SendTx from './components/SendTx';

// styles
import "../css/App.css";

class App extends Component {
  state = { web3: null, accounts: ['0x0'], network: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
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
      } else {
        alert("The Payments contract is not deployed on the active network. Please switch network or deploy the contract.");
      }
      // const instance = new web3.eth.Contract(
      //   PaymentsContract.abi,
      //   deployedNetwork && deployedNetwork.address,
      // );

      // Set web3, accounts, network, and the econtract instance to state
      this.setState({ web3: web3, accounts: accounts, network: network, contract: instance });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    const ActiveAddress = (
      <div className="line">
        <Blockie address={this.state.accounts[0]} size={3} />
        <h4 className="address">
          <strong>Address: </strong> 
          {this.state.accounts[0]}
        </h4>
      </div>
    );

    const Network = (<h4><strong>Network:</strong> {this.state.network}</h4>);

    if (!this.state.web3) {
      return <div>Loading web3...</div>;
    }
    return (
      <div className="App">
        <Nav />
        {ActiveAddress}
        {Network}
        <TxList
          web3={this.state.web3}
          account={this.state.accounts[0]}
          contract={this.state.contract}
        />
        {/* <SendTx
          web3={this.state.web3}
          account={this.state.accounts[0]}
          contract={this.state.contract}
        /> */}
      </div>
    );
  }
}

export default App;
