import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

// TODO: 
// paginate transactions table
// total value for all txs on page
// make table look a little prettier
// make table resize better
// view transactions on etherscan (if on Rinkeby) or go to a page that prints the tx json
// deploy to rinkeby / IPFS
// video walkthrough

// TODO:
// seth send $contract_address "foo(uint)" <value>
  // if value > max uint32, returns:
  // seth---to-hexdata: error: invalid hexdata: `0xCannot parse uint256
  // Caused by:
  // number too large to fit in target type'
// Looks like an issue in mod.rs, max uint value for "tokenizing" is u32
// can't pass just as hedata either

// Constants
const TXS_PER_PAGE = 10;    // number of tranasactions to show in table
// string contrants for tx type matching and display in table
const FUNDS_ADDED_STRING = "Deposit";
const FUNDS_BURNED_STRING = "Withdrawal";
const FUNDS_TRANSFERRED_TO_STRING = "Transfer Recieved";
const FUNDS_TRANSFERRED_FROM_STRING = "Transfer Sent";
// etherscan prefixes
const ETHERSCAN_MAINNET = "https://etherscan.io/"
const ETHERSCAN_RINKEBY = "https://rinkeby.etherscan.io/"
const ETHERSCAN_ROPSTEN = "https://ropsten.etherscan.io/"
const ETHERSCAN_KOVAN = "https://kovan.etherscan.io/"
const TX_PREFIX = "tx/"

export default class TxList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      txCount: null,
      txs: [],
    }
  }

  componentWillMount = async () => {
    // get list of transactions impacting the user and update state with the list
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

    // get event signatures for each type of transaction
    const fundsAddedSignature = this.getEventSignature("FundsAdded");
    const fundsBurnedSignature = this.getEventSignature("FundsBurned");
    const fundsTransferredSignature = this.getEventSignature("FundsTransferred");

    // pad active address to match event emission values
    const accountAsBytes32 = this.props.web3.utils.padLeft(
      this.props.account, 
      64
    ).toLowerCase();

    // determine the filters for each event type (transfers are broken up into
    // transfers received by the user and transfers sent by the user)
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
        // value: this.props.web3.utils.fromWei(
        //   this.props.web3.utils.toBN(fundsAddedEvents[i].data),
        //   'ether'
        // )
        value: this.props.web3.utils.toBN(fundsAddedEvents[i].data),
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
        // value: this.props.web3.utils.fromWei(
        //   this.props.web3.utils.toBN(fundsBurnedEvents[i].data).neg(i),
        //   'ether'
        // )
        value: this.props.web3.utils.toBN(fundsBurnedEvents[i].data).neg(i),
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
        // value: this.props.web3.utils.fromWei(
        //   this.props.web3.utils.toBN(fundsTransferredToEvents[i].data),
        //   'ether'
        // )
        value: this.props.web3.utils.toBN(fundsTransferredToEvents[i].data),
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
        // value: this.props.web3.utils.fromWei(
        //   this.props.web3.utils.toBN(fundsTransferredFromEvents[i].data).neg(i),
        //   'ether'
        // )
        value: this.props.web3.utils.toBN(fundsTransferredFromEvents[i].data).neg(i),
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

  // format timestamp as date string + time string
  formatTimestamp = (val) => (
    val.toLocaleDateString() + ' ' + val.toLocaleTimeString()
  );

  // format "value" column as ether values rather than wei
  valuesToEth = (val) => (
    this.props.web3.utils.fromWei(val, 'ether')
  );

  // return the total of the displayed values
  valueSum = (columnData) => {
    console.log("value sum footer called")
    console.log("columnData: ", columnData)
    var sum = columnData.reduce((total, value) => total.add(value), 
      this.props.web3.utils.toBN(0)
    );
    return "Total: " + this.props.web3.utils.fromWei(sum, 'ether');
  }

  getEtherscanPath = (txHash) => {
    switch (this.props.network) {
      case 'Mainnet':
        return ETHERSCAN_MAINNET + TX_PREFIX + txHash;
      case 'Rinkeby':
        return ETHERSCAN_RINKEBY + TX_PREFIX + txHash;
      case 'Ropsten':
        return ETHERSCAN_ROPSTEN + TX_PREFIX + txHash;
      case 'Kovan':
        return ETHERSCAN_KOVAN + TX_PREFIX + txHash;
      default:
        return ETHERSCAN_MAINNET; // just send
    }
  }

  transactionDetails = (e, column, columnIndex, row) => {
    console.log("tx hash: ", row.transactionHash);
    console.log("etherscan path: ", this.getEtherscanPath(row.transactionHash))
    // if we're on private network, send to a tx info page
    // else, send to repective etherscan
  }

  render() {
    
    // grab the transactions to display
    const displayTxs = this.state.txs;

    console.log("displayTxs: ", displayTxs)

    // Set columns for table displaying transactions
    const tableColumns = [{
      dataField: 'timestamp',
      text: 'timestamp',
      sort: true,
      formatter: this.formatTimestamp,
      headerAlign: 'center',
      columnAlign: 'center',
      footer: ''
    }, {
      dataField: 'transactionHash',
      text: 'Transaction Hash',
      headerAlign: 'center',
      columnAlign: 'center',
      events: { onClick: this.transactionDetails, },
      classes: 'clickable',
      footer: '',
    }, {
      dataField: 'type',
      text: 'Type',
      sort: true,
      headerAlign: 'center',
      columnAlign: 'center',
      footer: '',
    }, {
      dataField: 'value',
      text: 'Value',
      sort: true,
      formatter: this.valuesToEth,
      headerAlign: 'center',
      columnAlign: 'center',
      footerAlign: 'center',
      footer: this.valueSum
    }]

    // display the total number of transaction entries
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { from } to { to } of { size } Transactions
      </span>
    );

    // declare settings for table pagination
    const paginationOptions = {
      sizePerPage: TXS_PER_PAGE,
      pageStartIndex: 1,// const tableColumns
      hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
      hideSizePerPage: true,
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Prev page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true,
      paginationTotalRenderer: customTotal,
    };

    return(
      <BootstrapTable 
        hover 
        condensed
        keyField='transactionHash' 
        data={ displayTxs } 
        columns={ tableColumns } 
        noDataIndication={ "No transactions yet." }
        pagination={ paginationFactory(paginationOptions) }
      />
    )
  }
}