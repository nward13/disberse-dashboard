import React, { Component } from 'react';
import Blockie from './Blockie';

export default class ActiveAccount extends Component {

  constructor(props) {
    super(props);

    this.state = {
      ethBalance: null,
      contractBalance: [],
    }
  }

  componentWillMount = async () => {
    
    // get the eth balance for the active address 
    let ethBalance = this.props.web3.utils.fromWei(
      await this.props.web3.eth.getBalance(this.props.account),
      'ether'
    );

    // get the balance of the active address in the payments contract
    let contractBalance = this.props.web3.utils.fromWei(
      await this.props.contract.methods.balances(this.props.account).call(),
      'ether'
    );

    // set the state with the new balances
    this.setState({ethBalance: ethBalance, contractBalance: contractBalance});
  }

  render() {

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
            {this.state.ethBalance}
          </h5>
          <h5>
            <strong>Contract balance: </strong>
            {this.state.contractBalance}
          </h5>
        </div>
      </div>
    );

  }
}