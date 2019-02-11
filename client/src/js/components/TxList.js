import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import getTxList from '../utils/getTxList';

class TxList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      txCount: null,
      txs: [],
    }
  }

  componentWillMount = async () => {
    // get the transactions array and update the state
    let txs = await getTxList(this.props.web3, this.props.account);
    this.setState({txs:txs});
  }

  // converts table values from wei to ether
  valueFormatter(cell, row, web3) {
    return web3.utils.fromWei(cell, 'ether');
  }

  render() {
    return(
      <BootstrapTable
        data={this.state.txs}
        options={{ noDataText:'No transactions yet.' }}
        bordered={true}
        striped hover condensed>
        <TableHeaderColumn isKey={true} dataField='hash'>Transaction hash</TableHeaderColumn>
        <TableHeaderColumn 
          dataField='value' 
          dataFormat={ this.valueFormatter }
          formatExtraData={ this.props.web3 }
        >Ether Value</TableHeaderColumn>
      </BootstrapTable>
    )
  }
}

export default TxList;