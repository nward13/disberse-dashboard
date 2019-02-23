import React, { Component } from 'react';
import Blockie from './Blockie';

export default class ActiveAccount extends Component {

  render() {
    console.log("this.props.ethBalacne: ", this.props.ethBalance)
    console.log("this.props.contractBalacen: ", this.props.contractBalance)
    // put balances into Eth / full tokens (assuming 18 decimal place token)
    const ethBalanceInEth = this.props.web3.utils.fromWei(
      this.props.web3.utils.toBN(this.props.ethBalance), 
      'ether'
    );
    
    const contractBalanceInEth = this.props.web3.utils.fromWei(
      this.props.web3.utils.toBN(this.props.contractBalance), 
      'ether'
    );

    return(
      <div>
        <div className="line">
          <Blockie address={this.props.account} size={3} />
          <h4 className="address">
            <strong>Address: </strong> 
            {this.props.account}
          </h4>
        </div>
        <div className="balances">
          <h5>
            <strong>ETH balance: </strong>
            {ethBalanceInEth}
          </h5>
          <h5>
            <strong>Contract balance: </strong>
            {contractBalanceInEth}
          </h5>
        </div>
      </div>
    );

  }
}