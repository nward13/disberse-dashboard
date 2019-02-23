import React, { Component } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

export default class BurnFunds extends Component {
  burnFunds = async(event) => {
    event.preventDefault();
    console.log("burnFunds user: ", this.userBurn.value)
    console.log("burnFunds amount: ", this.amountBurn.value)
    await this.props.contract.methods.burnFunds(
      this.userBurn.value,
      this.props.web3.utils.toWei(this.amountBurn.value, 'ether')
    ).send({from:this.props.account});
  }
  
  render() {
    return (
      <Container>
        <h3>Burn User Funds</h3>
        <Form className="form-horizontal">
          <Form.Group>
            <Form.Label htmlFor="user">User Address</Form.Label>
            <Form.Control 
              type="text"
              ref={(input) => { this.userBurn=input; }}
              size="sm"
              placeholder="0x0000000000000000000000000000000000000000"
              maxLength="42"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="amount">Amount (in full tokens)</Form.Label>
            <Form.Control
              type="number" 
              ref={(input) => { this.amountBurn=input; }} 
              placeholder = "10"
            />
          </Form.Group>
          <Button variant="primary" type="submit" onClick={this.burnFunds}>
            Burn Funds
          </Button>
        </Form>
      </Container>
    );
  }
}