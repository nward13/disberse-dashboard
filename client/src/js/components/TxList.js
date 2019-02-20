import React, { Component } from 'react';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import BootstrapTable from 'react-bootstrap-table-next';

// TODO: 
// paginate transactions table
// total value for all txs on page
// make table look a little prettier
// make table resize better
// make a page for sending transactions to the contract

const FUNDS_ADDED_STRING = "Deposit";
const FUNDS_BURNED_STRING = "Withdrawal";
const FUNDS_TRANSFERRED_TO_STRING = "Transfer Recieved";
const FUNDS_TRANSFERRED_FROM_STRING = "Transfer Sent";

export default class TxList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      txCount: null,
      txs: [],
      reverseOrder: false,
    }
  }

  componentWillMount = async () => {
    // get the transactions object and update the state
    let txs = await this.getTxList();
    this.setState({txs:txs});
  }

  getTxList = async (startBlock=null, endBlock=null) => {
    // default to searching entire blockchain history
    if (!endBlock) {
      endBlock = 'latest';
    }
    if (!startBlock) {
      startBlock = 1;
    }

    // get event signatures
    const fundsAddedSignature = this.getEventSignature("FundsAdded");
    const fundsBurnedSignature = this.getEventSignature("FundsBurned");
    const fundsTransferredSignature = this.getEventSignature("FundsTransferred");

    // pad active address to match event emission values
    const accountAsBytes32 = this.props.web3.utils.padLeft(this.props.account, 64).toLowerCase();

    // determine the filters for each event type
    const fundsAddedTopics = [fundsAddedSignature, accountAsBytes32];
    const fundsBurnedTopics = [fundsBurnedSignature, accountAsBytes32];
    const fundsTransferredToTopics = [fundsTransferredSignature, null, accountAsBytes32];
    const fundsTransferredFromTopics = [fundsTransferredSignature, accountAsBytes32]

    // get events emitted from each transaction type
    const fundsAddedEvents = await this.props.web3.eth.getPastLogs({
      fromBlock: startBlock, 
      toBlock: endBlock, 
      address: this.props.contract.options.address,
      topics: fundsAddedTopics
    });
    const fundsBurnedEvents = await this.props.web3.eth.getPastLogs({
      fromBlock: startBlock, 
      toBlock: endBlock, 
      address: this.props.contract.options.address,
      topics: fundsBurnedTopics
    });
    const fundsTransferredToEvents = await this.props.web3.eth.getPastLogs({
      fromBlock: startBlock, 
      toBlock: endBlock, 
      address: this.props.contract.options.address,
      topics: fundsTransferredToTopics
    });
    const fundsTransferredFromEvents = await this.props.web3.eth.getPastLogs({
      fromBlock: startBlock, 
      toBlock: endBlock, 
      address: this.props.contract.options.address,
      topics: fundsTransferredFromTopics
    });

    let txs = []

    // add tx data for funds added txs
    for (let i = 0; i < fundsAddedEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsAddedEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const tx = {
        transactionHash: fundsAddedEvents[i].transactionHash,
        type: FUNDS_ADDED_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.fromWei(
          this.props.web3.utils.toBN(fundsAddedEvents[i].data),
          'ether'
        )
      };

      txs.push(tx);
    }

    // add tx data for funds burned txs
    for (let i = 0; i < fundsBurnedEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsBurnedEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const tx = {
        transactionHash: fundsBurnedEvents[i].transactionHash,
        type: FUNDS_BURNED_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.fromWei(
          this.props.web3.utils.toBN(fundsBurnedEvents[i].data).neg(i),
          'ether'
        )
      };

      txs.push(tx);
    }

    // add tx data for transfers to user
    for (let i = 0; i < fundsTransferredToEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsTransferredToEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const tx = {
        transactionHash: fundsTransferredToEvents[i].transactionHash,
        type: FUNDS_TRANSFERRED_TO_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.fromWei(
          this.props.web3.utils.toBN(fundsTransferredToEvents[i].data),
          'ether'
        )
      };

      txs.push(tx);
    }

    // add tx data for transfers from user
    for (let i = 0; i < fundsTransferredFromEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsTransferredFromEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const tx = {
        transactionHash: fundsTransferredFromEvents[i].transactionHash,
        type: FUNDS_TRANSFERRED_FROM_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.fromWei(
          this.props.web3.utils.toBN(fundsTransferredFromEvents[i].data).neg(i),
          'ether'
        )
      };

      txs.push(tx);
    }

    return txs;
  }

  // get the event signature from the contract json
  getEventSignature = (eventName) => {
    const eventObject = this.props.web3.utils._.find(
      this.props.contract._jsonInterface, 
      o => o.name === eventName && o.type === 'event',
    );
    return eventObject.signature;
  }

  formatTimestamp = (val) => {
    // console.log("cel: ", cell)
    // console.log("row: ", row)
    // console.log("index: ", index)
    return val.toLocaleDateString() + ' ' + val.toLocaleTimeString();
    
  }


  render() {
    
    const displayTxs = this.state.txs;

    // Order the transactions according to timestamp
    // if (this.state.reverseOrder) {
    //   displayTxs.sort(function(a, b) {
    //     return b.timestamp - a.timestamp;
    //   });
    // } else {
    //   displayTxs.sort(function(a, b) {
    //     return a.timestamp - b.timestamp;
    //   })
    // }

    console.log("displayTxs: ", displayTxs)

    // Set columns for table displaying transactions
    const tableColumns = [{
      dataField: 'timestamp',
      text: 'timestamp',
      sort: true,
      formatter: this.formatTimestamp,
      headerAlign: 'center',
      columnAlign: 'center',
    }, {
      dataField: 'transactionHash',
      text: 'Transaction Hash',
      headerAlign: 'center',
      columnAlign: 'center',
    }, {
      dataField: 'type',
      text: 'Type',
      sort: true,
      headerAlign: 'center',
      columnAlign: 'center',
    }, {
      dataField: 'value',
      text: 'Value',
      sort: true,
      headerAlign: 'center',
      columnAlign: 'center',
    }]

    
    
    return(
      <BootstrapTable keyField='transactionHash' data={ displayTxs } columns={ tableColumns } />
      // <BootstrapTable
      //   data={displayTxs}
      //   options={{ noDataText:'No transactions yet.' }}
      //   bordered={true}
      //   striped hover condensed>
      //   <TableHeaderColumn dataField='date'>Date</TableHeaderColumn>
      //   <TableHeaderColumn dataField='time'>Time</TableHeaderColumn>
      //   <TableHeaderColumn isKey={true} dataField='transactionHash'>Transaction hash</TableHeaderColumn>
      //   <TableHeaderColumn dataField='type'>Transaction Type</TableHeaderColumn>
      //   <TableHeaderColumn dataField='value'>Value</TableHeaderColumn>
      // </BootstrapTable>
    )
  }
}