import React, { Component } from 'react';
import logo from './logo.svg';
import DWTLogo from './icon-dwt.svg';
import DynamsoftLogo from './logo-dynamsoft-white-159X39.svg';
import './App.css';
import DWT from './DynamsoftSDK';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { bShowDWT: false }
  }
  showDWT() {
    this.setState({ bShowDWT: true });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <a href="https://www.dynamsoft.com/Products/WebTWAIN_Overview.aspx" target="_blank" rel="noopener noreferrer" ><img src={DWTLogo} className="dwt-logo" alt="Dynamic Web TWAIN Logo" /></a>
          <div style={{ width: "10px" }}></div>
          <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" ><img src={logo} className="App-logo" alt="logo" /></a>
          <div style={{ width: "18%" }}></div>
          <a href="https://www.dynamsoft.com" target="_blank" rel="noopener noreferrer" ><img src={DynamsoftLogo} className="ds-logo" alt="Dynamsoft Logo" /></a>
        </header>
        <main className="App-main">
          {this.state.bShowDWT
            ? <DWT />
            : <button onClick={() => this.showDWT()} >Let's get started!</button>
          }
        </main>
        <footer>
          {this.state.bShowDWT
            ? (<div>

            </div>)
            : ""
          }
        </footer>
      </div>
    );
  }
}

export default App;

