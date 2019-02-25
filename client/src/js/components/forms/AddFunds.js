import React, { Component } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

export default class AddFunds extends Component {

  // send addFunds tx to contract with params from form.
  // todo: form validation
  addFunds = async(event) => {
    event.preventDefault();
    await this.props.contract.methods.addFunds(
      this.userAdd.value, 
      this.props.web3.utils.toWei(this.amountAdd.value, 'ether')
    ).send({from: this.props.account});
  }

  render() {
    return (
      <Container>
        <h3>Add User Funds</h3>
        <Form className="form-horizontal">
          <Form.Group>
            <Form.Label htmlFor="recipient">Recipient Address</Form.Label>
            <Form.Control 
              type="text"
              ref={(input) => { this.userAdd=input; }}
              size="sm"
              placeholder="0x0000000000000000000000000000000000000000"
              maxLength="42"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="amount">Amount (DBT)</Form.Label>
            <Form.Control
              type="number" 
              ref={(input) => { this.amountAdd=input; }} 
              placeholder = "10"
            />
          </Form.Group>
          <Button variant="primary" type="submit" onClick={this.addFunds}>
            Add Funds
          </Button>
        </Form>
      </Container>
    );
  }
}
