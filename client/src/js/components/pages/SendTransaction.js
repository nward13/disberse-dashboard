import React, { Component } from "react";

// Components
import AddFunds from "../forms/AddFunds";
import BurnFunds from "../forms/BurnFunds";
import TransferFunds from "../forms/TransferFunds";

export default class SendTransaction extends Component {
  
  constructor(props) {
    super(props);

    this.state = { 
      balance: 0,
      auth: false, 
    }
  }

  componentWillMount = async() => {
    const balance = await this.props.contract.methods.balances(this.props.account).call();
    const auth = await this.props.contract.methods.authorized(this.props.account).call();

    this.setState({ balance: balance, auth: auth });
  }


  render() {

    const AuthFunctions = () => {
      if (this.state.auth) {
        return (
          <div>
            <AddFunds 
              contract={this.props.contract}
              web3={this.props.web3}
              account={this.props.account}
            />
            <BurnFunds 
              contract={this.props.contract}
              web3={this.props.web3}
              account={this.props.account}
            />
          </div>
        );
      } else {
        return null;
      }
    }

    const UserFunctions = () => {
      if (this.state.balance > 0) {
        return (
          <div>
            <TransferFunds
              contract={this.props.contract}
              web3={this.props.web3}
              account={this.props.account}
            />
          </div>
        );
      } else {
        return (
          <div align="center">
            <br></br>
            <h4>You must make a deposit before you can transfer funds.</h4>
          </div>
        );
      }
    }
    
    return(
      <div align='left'>
        <AuthFunctions />
        <UserFunctions />
      </div>
    );
  }
}