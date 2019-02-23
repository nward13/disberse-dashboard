import React, { Component } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

// components
import AddFunds from "./AddFunds";
import BurnFunds from "./BurnFunds";
import TransferFunds from "./TransferFunds";

// class SendForm extends Component {

//   render() {
//     return (
//       <Container>
//     <h3>{this.props.heading}</h3>
//     <Form className="form-horizontal">
//       <Form.Group>
//         <Form.Label htmlFor="recipient">User</Form.Label>
//         <Form.Control 
//           type="text"
//           // ref={(input) => { this.userAdd=input; }}
//           value={this.props.valuesObj.user}
//           onChange={this.props.userOnChangeHandler} 
//           size="sm"
//           placeholder="0x0000000000000000000000000000000000000000"
//           maxLength="42"
//         />
//       </Form.Group>
//       <Form.Group>
//         <Form.Label htmlFor="amount">Amount (in full tokens)</Form.Label>
//         <Form.Control
//           type="number" 
//           // ref={(input) => { this.amountAdd=input; }} 
//           value={this.props.valuesObj.amt}
//           onChange={this.props.amtOnChangeHandler}
//           placeholder = "10"
//         />
//       </Form.Group>
//       <input type="submit" value="Send" onClick={this.props.onClickHandler} />
//       {/* <Button variant="primary" type="submit" onClick={onClickFunction}>
//         Submit
//       </Button> */}
//     </Form>
//   </Container>
//     ); 
//   }
// }

class SendTx extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      balance: 0,
      auth: false, 
      // addFundsValues: { user: '0x', amt: 0 },
      // burnFundsValues: { user: '0x', amt: 0 },
      // transferFundsValues: { user: '0x', amt: 0 },
    }

    // this.addFundsAmtOnChangeHandler = this.addFundsAmtOnChangeHandler.bind(this)
    // this.addFundsUserOnChangeHandler = this.addFundsUserOnChangeHandler.bind(this)
    // this.addFunds = this.addFunds.bind(this)
  }

  componentWillMount = async() => {
    const balance = await this.props.contract.methods.balances(this.props.account).call();
    const auth = await this.props.contract.methods.authorized(this.props.account).call();

    this.setState({ balance: balance, auth: auth });
  }

  // addFundsUserOnChangeHandler = (event) => {
  //   console.log("addFundsUserOnChangeHandler called")
  //   console.log("event.target.value: ", event.target.value)
  //   this.setState({
  //     addFundsUser: event.target.value
  //   })
  // }

  // addFundsAmtOnChangeHandler = (event) => {
  //   console.log("addFundsAmtOnChangeHandler called")
  //   this.setState({
  //     addFundsAmt: event.target.value
  //   })
  // }

  // addFunds = async(event) => {
  //   event.preventDefault();
  //   console.log("addFunds user: ", this.state.addFundsUser);
  //   console.log("addFunds amount: ", this.state.addFundsAmt);
  //   await this.props.contract.methods.addFunds(
  //     this.user.value, 
  //     this.props.web3.utils.toWei(this.amount.value, 'ether')
  //   ).send({from: this.props.account});
  // }

  // burnFunds = async(event) => {
  //   event.preventDefault();
  //   console.log("burnFunds user: ", this.user.value)
  //   console.log("burnFunds amount: ", this.amount.value)
  //   await this.props.contract.methods.burnFunds(
  //     this.user.value,
  //     this.props.web3.utils.toWei(this.amount.value, 'ether')
  //   ).send({from:this.props.account});
  // }

  // transferFunds = async(event) => {
  //   event.preventDefault();
  //   console.log("transferFunds user: ", this.user.value)
  //   console.log("transferFunds amount: ", this.amount.value)
  //   await this.props.contract.methods.transferFunds(
  //     this.user.value,
  //     this.props.web3.utils.toWei(this.amount.value, 'ether')
  //   ).send({from:this.props.account});
  // }



  render() {

    // const SendForm = (
    //   heading,
    //   valuesObj, 
    //   userOnChangeHandler, 
    //   amtOnChangeHandler, 
    //   onClickHandler) => {
    //   return (
    //     // {/* <div className="form"> */}
    //     // {/* <Row><Col sm={true}><h4>Add User Funds</h4></Col></Row> */}
    //   <Container>
    //     {/* <h3>{label}</h3> */}
    //     {heading}
    //     <Form className="form-horizontal">
    //       <Form.Group>
    //         <Form.Label htmlFor="recipient">User</Form.Label>
    //         <Form.Control 
    //           type="text"
    //           // ref={(input) => { this.userAdd=input; }}
    //           value={valuesObj.user}
    //           onChange={userOnChangeHandler} 
    //           size="sm"
    //           placeholder="0x0000000000000000000000000000000000000000"
    //           maxLength="42"
    //         />
    //       </Form.Group>
    //       <Form.Group>
    //         <Form.Label htmlFor="amount">Amount (in full tokens)</Form.Label>
    //         <Form.Control
    //           type="number" 
    //           // ref={(input) => { this.amountAdd=input; }} 
    //           value={valuesObj.amt}
    //           onChange={amtOnChangeHandler}
    //           placeholder = "10"
    //         />
    //       </Form.Group>
    //       <input type="submit" value="Send" onClick={onClickHandler} />
    //       {/* <Button variant="primary" type="submit" onClick={onClickFunction}>
    //         Submit
    //       </Button> */}
    //     </Form>
    //   </Container>
    // );
    // }

// TODO: just hardcode three different forms

    // const AuthFunctions = () => {
    //   if (this.state.auth) {
    //     return (
    //       <div>
    //         <SendForm 
    //           heading="Add User Funds"
    //           valuesObj={this.state.addFundsValues}
    //           userOnChangeHandler={this.addFundsUserOnChangeHandler}
    //           amtOnChangeHandler={this.addFundsAmtOnChangeHandler}
    //           onClickHandler={this.addFunds}
    //         />
    //         {/* {SendForm(
    //           "Add User Funds", 
    //           this.state.addFunds,
    //           this.addFundsUserOnChangeHandler, 
    //           this.addFundsAmtOnChangeHandler, 
    //           this.addFunds
    //         )} */}
    //         {/* {SendForm("Burn User Funds", this.burnFunds)} */}
    //       </div>
    //     );

    //   } else {
    //     return null;
    //   }
    // }
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
            <h4>You must make a deposit before you can transfer funds.</h4>
          </div>
        );
      }
    }
    
    // const AuthFunctions = () => {
    //   if (this.state.auth) {
    //     return (
    //         // {/* <div className="form"> */}
    //         // {/* <Row><Col sm={true}><h4>Add User Funds</h4></Col></Row> */}
    //       <Container>
    //         <h3>Add User Funds</h3>
    //         <Form className="form-horizontal">
    //             <Form.Group>
    //                 <Form.Label htmlFor="recipient">Recipient</Form.Label>
    //                 <Form.Control 
    //                   type="text"
    //                   ref={(input) => { this.recipient=input; }} 
    //                   size="sm"
    //                   placeholder="0x0000000000000000000000000000000000000000"
    //                   maxLength="42"
    //                 />
    //             </Form.Group>
    //             <Form.Group>
    //               <Form.Label htmlFor="amount">Amount (in full tokens)</Form.Label>
    //               <Form.Control
    //                 type="number" 
    //                 ref={(input) => { this.amount=input; }} 
    //                 placeholder = "10"
    //               />
    //             </Form.Group>
    //             {/* <input type="submit" value="Send" onClick={this.addFunds} /> */}
    //             <Button variant="primary" type="submit" onClick={this.addFunds}>
    //               Submit
    //             </Button>
    //         </Form>
    //       </Container>
    //     );
    //   }
    //   return null;
    // };

    return(
      // <div className="form sendTx" style={{border:"thin solid black"}}>
      //   {this.state.balance > 0
      //     ? <h3>Sorry, you have a zero balance.</h3>
      //     : {transferForm}
      //   }
      // </div>
      // auth ? {authFunctions}
      // if (auth) { authFunctions }
      
      // <div style={{display: 'flex', justifyContent: 'flex-end'}}>
      <div align='left'>
        <AuthFunctions />
        <UserFunctions />
      </div>
    );
  }
}

export default SendTx