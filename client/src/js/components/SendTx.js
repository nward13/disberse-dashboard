import React, { Component } from 'react';
import { Form, FormGroup, Label } from 'react-bootstrap';

class SendTx extends Component {
  constructor(props) {
    super(props);

    this.state = { balance: 0 }
  }

  componentWillMount = async() => {
    const balance = await this.props.contract.methods.balances(this.props.account);
    console.log("balance: ", balance);
    this.setState({ balance: balance })
  }



  render() {
    const transferForm = (
      <h3>Make a Transfer</h3>
    );
    return(
      <div className="form sendTx" style={{border:"thin solid black"}}>
        {this.state.balance > 0
          ? <h3>Sorry, you have a zero balance.</h3>
          : {transferForm}
        }
      </div>
    )
  }
}

export default SendTx