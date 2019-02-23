import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Nav extends Component {

  render() {

    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-2">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link className="navbar-brand" to={"/"}>Disberse Dashboard</Link>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-2">
            <ul className="nav navbar-nav">
              <li><Link to={"/send/"}>Make a Transfer</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    );
    
  } 
}