import React, { Component } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

export default class BurnFunds extends Component {

  // send burnFunds tx to contract with params from form.
  // todo: form validation
  burnFunds = async(event) => {
    event.preventDefault();
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
            <Form.Label htmlFor="amount">Amount (DBT)</Form.Label>
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
