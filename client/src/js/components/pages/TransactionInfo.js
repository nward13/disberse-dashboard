import React, { Component } from 'react';
const abiDecoder = require('abi-decoder');

export default class TransactionInfo extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      transaction: {},
    }
  }

  componentWillMount = async () => {
    
    // add our contract abi to the abi decoder so we can try to decode input data
    abiDecoder.addABI(this.props.contractAbi);

    // grab the transaction of interest
    const transaction = await this.props.web3.eth.getTransaction(
      this.props.transactionHash
    );

    this.setState({ transaction: transaction })
  }
  
  render() {
    
    const transaction = this.state.transaction;

    let valueInEth;
    let gasPriceInGwei;
    let inputData;

    // avoid evaluating before state is set
    if (Object.keys(transaction).length > 0) {

      // get transaction value into common units
      valueInEth = this.props.web3.utils.fromWei(
        transaction.value.toString(),
        'ether'
      );

      // get gas price into common units
      gasPriceInGwei = this.props.web3.utils.fromWei(
        transaction.gasPrice.toString(),
        'gwei'
      );

      // If empty input data (i.e. a straight eth transfer to an EOA), just 
      // display the input data. If there's more data and it might be a call 
      // to the contract, try to decode it and display in json format
      // TODO: this will get tripped up and return undefined if the tx 
      // has input data that is not a call to the Payments contract
      if (transaction.input === '0x') {
        inputData = transaction.input
      } else {
        inputData = <pre id='json'>{JSON.stringify(abiDecoder.decodeMethod(transaction.input), null, '\t')}</pre>
      }
      
    }

    return (
      <div align='left' className="transactionInfo">
        <h3>Transaction Data</h3>
        <ul>
          <li><strong>Hash: </strong> {transaction.hash}</li>
          <li><strong>Block Hash: </strong> {transaction.blockHash}</li>
          <li><strong>Block Number: </strong> {transaction.blockNumber}</li>
          <li><strong>Nonce: </strong> {transaction.nonce}</li>
          <li><strong>From: </strong> {transaction.from}</li>
          <li><strong>To: </strong> {transaction.to}</li>
          <li><strong>Value: </strong> {valueInEth} Eth</li>
          <li><strong>Gas: </strong> {transaction.gas}</li>
          <li><strong>Gas Price: </strong> {gasPriceInGwei} gwei</li>
          <li><strong>Input Data: </strong> {inputData}</li>
        </ul>
      </div>
    );
  }
}