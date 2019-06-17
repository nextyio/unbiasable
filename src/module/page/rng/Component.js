import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import { Link } from 'react-router-dom' // eslint-disable-line
import web3 from 'web3'
//import solc from 'solc'
import {CopyToClipboard} from 'react-copy-to-clipboard';

import './style.scss'

import { Col, Row, Icon, Button, Breadcrumb, Table, Input, InputNumber } from 'antd' // eslint-disable-line

const shorten = (str) => {
  return str.substr(0,8) + '..' + str.substr(-6)
}

const weiToCoin = (wei) => {
  return (Number(web3.utils.fromWei(wei.toString()))).toFixed(4)
}

export default class extends LoggedInPage {
  state = {
    code: "address(0x0).transfer(0);",
  }

  async componentDidMount() {
    // this.reload()
  }

  ord_renderContent () { // eslint-disable-line
    return (
      <div className="">
        <div className="ebp-header-divider">
        </div>

        <div className="ebp-page">
          <h3 className="text-center">Random Number Generator</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>

            <Row>
              <Col span={4}>
                Wallet
              </Col>
              <Col span={20}>
                {this.props.wallet}
              </Col>
            </Row>

            <Row>
              <Col span={4}>
                Balance
              </Col>
              <Col span={20}>
                {weiToCoin(this.props.balance)} Coin
              </Col>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            {
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={4}>
                  Code
                </Col>
                <Col span={20}>
                  <Input.TextArea className="maxWidth"
                    autosize={{minRows: 8}}
                    value={this.state.code}
                    onChange={this.codeChange.bind(this)}
                  />
                </Col>
              </Row>
            }

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={24}>
                <Button onClick={() => this.send()} type="primary" className="btn-margin-top submit-button maxWidth">Send</Button>
              </Col>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>
          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/rng"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>RNG</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  codeChange(duration) {
    this.setState({
      code: code
    })
  }

  send() {
    this.props.send(this.state.code);
  }
}
