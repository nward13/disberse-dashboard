import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

// Constants
// number of transactions to show in table
const TRANSACTIONS_PER_PAGE = 10;
// string contants for tx type matching and display in table
const FUNDS_ADDED_STRING = "Deposit";
const FUNDS_BURNED_STRING = "Withdrawal";
const FUNDS_TRANSFERRED_TO_STRING = "Transfer Recieved";
const FUNDS_TRANSFERRED_FROM_STRING = "Transfer Sent";
// etherscan prefixes
const ETHERSCAN_MAINNET = "https://etherscan.io/"
const ETHERSCAN_RINKEBY = "https://rinkeby.etherscan.io/"
const ETHERSCAN_ROPSTEN = "https://ropsten.etherscan.io/"
const ETHERSCAN_KOVAN = "https://kovan.etherscan.io/"
const TRANSACTION_PREFIX = "tx/"

class TransactionList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      transactionCount: null,
      transactions: [],
    }
  }

  componentDidMount = async () => {
    // prevent setting state on unmounted component
    this._isMounted = true;

    // get list of transactions impacting the user and update state with the list
    let transactions = await this.getTransactionList();
    if (this._isMounted) { 
      this.setState({transactions: transactions}) 
    };
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  getTransactionList = async (startBlock=null, endBlock=null) => {
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

    let transactions = []

    // add tx data for funds added txs
    for (let i = 0; i < fundsAddedEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsAddedEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const transaction = {
        transactionHash: fundsAddedEvents[i].transactionHash,
        type: FUNDS_ADDED_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.toBN(fundsAddedEvents[i].data),
      };

      transactions.push(transaction);
    }

    // add tx data for funds burned txs
    for (let i = 0; i < fundsBurnedEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsBurnedEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const transaction = {
        transactionHash: fundsBurnedEvents[i].transactionHash,
        type: FUNDS_BURNED_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.toBN(fundsBurnedEvents[i].data).neg(i),
      };

      transactions.push(transaction);
    }

    // add tx data for transfers to user
    for (let i = 0; i < fundsTransferredToEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsTransferredToEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const transaction = {
        transactionHash: fundsTransferredToEvents[i].transactionHash,
        type: FUNDS_TRANSFERRED_TO_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.toBN(fundsTransferredToEvents[i].data),
      };

      transactions.push(transaction);
    }

    // add tx data for transfers from user
    for (let i = 0; i < fundsTransferredFromEvents.length; i++) {
      const block = await this.props.web3.eth.getBlock(
        fundsTransferredFromEvents[i].blockHash
      );
      const dateTime = new Date(block.timestamp * 1000);

      const transaction = {
        transactionHash: fundsTransferredFromEvents[i].transactionHash,
        type: FUNDS_TRANSFERRED_FROM_STRING,
        timestamp: dateTime,
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
        value: this.props.web3.utils.toBN(fundsTransferredFromEvents[i].data).neg(i),
      };

      transactions.push(transaction);
    }

    return transactions;
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
  formatValue = (val) => (
    this.props.web3.utils.fromWei(val.toString(), 'ether') + ' DBT'
  );

  // return the total of the displayed values
  valueSum = (columnData) => {
    var sum = columnData.reduce((total, value) => total.add(value), 
      this.props.web3.utils.toBN(0)
    );
    // return "Total: " + this.props.web3.utils.fromWei(sum, 'ether');
    return "Total: " + this.formatValue(sum);
  }

  // return the url to view the transaction hash on etherscan on the active network
  getEtherscanPath = (transactionHash) => {
    switch (this.props.network) {
      case 'Mainnet':
        return ETHERSCAN_MAINNET + TRANSACTION_PREFIX + transactionHash;
      case 'Rinkeby':
        return ETHERSCAN_RINKEBY + TRANSACTION_PREFIX + transactionHash;
      case 'Ropsten':
        return ETHERSCAN_ROPSTEN + TRANSACTION_PREFIX + transactionHash;
      case 'Kovan':
        return ETHERSCAN_KOVAN + TRANSACTION_PREFIX + transactionHash;
      default:
        return ETHERSCAN_MAINNET; // just send them to the mainnet etherscan / page
    }
  }

  transactionDetails = (e, column, columnIndex, row) => {
    if (this.props.network === 'Private') {

      // private network, so no etherscan. Send to a default page with tx info
      this.props.history.push('/tx/' + row.transactionHash)
      
    } else {
      // send to the etherscan page for the tx hash on the active network
      window.open(this.getEtherscanPath(row.transactionHash));
    }
  }

  render() {
    
    // grab the transactions to display
    const displayTransactions = this.state.transactions;

    // Set columns for table displaying transactions
    const tableColumns = [{
      dataField: 'timestamp',
      text: 'timestamp',
      sort: true,
      formatter: this.formatTimestamp,
      columnAlign: 'center',
      footer: '',   // ugly hack to get final footer column to line up
      headerStyle: { width: '20%', textAlign: 'center' },
    }, {
      dataField: 'transactionHash',
      text: 'Transaction Hash',
      columnAlign: 'center',
      classes: 'clickable',
      footer: '',
      events: { onClick: this.transactionDetails, },
      headerStyle: { width: '35%', textAlign: 'center' },
    }, {
      dataField: 'type',
      text: 'Type',
      sort: true,
      columnAlign: 'center',
      footer: '',
      headerStyle: { width: '15%', textAlign: 'center' },
    }, {
      dataField: 'value',
      text: 'Value',
      sort: true,
      formatter: this.formatValue,
      columnAlign: 'center',
      footerAlign: 'center',
      footer: this.valueSum,
      headerStyle: { width: '20%', textAlign: 'center' },
    }]

    // sort by timestamp initially
    const defaultSorted = [{
      dataField: 'timestamp',
      order: 'desc'
    }];

    // display the total number of transaction entries
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        Showing { from } to { to } of { size } Transactions
      </span>
    );

    // declare settings for table pagination
    const paginationOptions = {
      sizePerPage: TRANSACTIONS_PER_PAGE,
      paginationSize:3,
      pageStartIndex: 1,// const tableColumns
      withFirstAndLast: true, // Hide the going to First and Last page button
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
        data={ displayTransactions } 
        columns={ tableColumns } 
        noDataIndication={ "No transactions yet." }
        pagination={ paginationFactory(paginationOptions) }
        defaultSorted={ defaultSorted }
      />
    )
  }
}

export default withRouter(TransactionList)
