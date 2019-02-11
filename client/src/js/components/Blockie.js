// Borrowed from Austin Griffith and Dapparatus. Thanks, Austin!
// https://libraries.io/npm/dapparatus/1.0.65

import React, { Component } from 'react';
import Blockies from 'react-blockies';

class Blockie extends Component {
  render() {
    let address = this.props.address
    if(address && typeof address == "string"){
      address = address.toLowerCase()
    } else {
      address = "0x0000000000000000000000000000000000000000"
    }

    return (
      <Blockies
        seed={address}
        scale={this.props.size}
      />
    )
  }
}

export default Blockie;