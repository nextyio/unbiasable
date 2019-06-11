import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import web3 from 'web3'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { DECIMALS } from '@/constant'

import './style.scss'

import { Col, Row, Icon, Button, Breadcrumb, Table, Input, InputNumber } from 'antd' // eslint-disable-line

var BigNumber = require('big-number');

const weiToNUSD = (wei) => {
  return Number(wei / (10 ** (DECIMALS.nusd))).toFixed(4)
}

const weiToMNTY = (wei) => {
  return (Number(web3.utils.fromWei(wei.toString())) / 1000000).toFixed(4)
}

export default class extends LoggedInPage {
  state = {
    data: [],
    copied: false,
    amount: 0,
    price: 0
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
          <h3 className="text-center">User's Info</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>

            <Row>
              <Col span={6}>
                Wallet:
              </Col>
              <Col span={6}>
                {this.props.wallet}
              </Col>
            </Row>

            <Row>
              <Col span={6}>
                Balance:
              </Col>
              <Col span={6}>
                {weiToMNTY(this.props.balance)} MNTY
              </Col>
            </Row>

            <Row>
              <Col span={2}>
                Amount
              </Col>
              <Col span={1}/>
              <Col span={8}>
                <InputNumber className="maxWidth"
                  defaultValue={0}
                  value={this.state.transferAmount}
                  onChange={this.transferAmountChange.bind(this)}
                />
              </Col>
              <Col span={1}/>
              <Col span={2}>
                to
              </Col>
              <Col span={1}/>
              <Col span={8}>
                <Input className="maxWidth"
                  defaultValue={0}
                  value={this.state.toWallet}
                  onChange={this.toWalletChange.bind(this)}
                />
              </Col>
              <Col span={1}/>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            <Row>
              <Col span={2}>
                Amount
              </Col>
              <Col span={1}/>
              <Col span={8}>
                <Input className="maxWidth"
                  defaultValue={0}
                  value={this.state.amount}
                  onChange={this.amountChange.bind(this)}
                />
              </Col>
              <Col span={1}/>
              <Col span={2}>
                Price
              </Col>
              <Col span={1}/>
              <Col span={8}>
                <Input className="maxWidth"
                  defaultValue={0}
                  value={this.state.price}
                  onChange={this.priceChange.bind(this)}
                />
              </Col>
              <Col span={1}/>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={2}>
                Id
              </Col>
              <Col span={1}/>
              <Col span={8}>
                <InputNumber className="maxWidth"
                  defaultValue={0}
                  value={this.state.id}
                  onChange={this.idChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={0}/>
              <Col span={12}>
                <Button onClick={() => this.remove(false)} type="primary" className="btn-margin-top submit-button maxWidth">Selling Order Remove</Button>
              </Col>
              <Col span={0}/>
              <Col span={12}>
                <Button onClick={() => this.remove(true)} type="primary" className="btn-margin-top submit-button maxWidth">Buying Order Remove</Button>
              </Col>
              <Col span={0}/>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={24}>
                <Button onClick={() => this.props.reload()} type="primary" className="btn-margin-top submit-button maxWidth">Reload</Button>
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
        <Breadcrumb.Item><Link to="/unbiasable"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>unbiasable</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

remove(_orderType) {
  return this.props.remove(_orderType, this.state.id)
}

  onCopy = () => {
    this.setState({copied: true});
  };


idChange(e) {
    this.setState({
        id: e.target.value
    })
}

toWalletChange(e) {
    this.setState({
        toWallet: e.target.value
    })
}

transferAmountChange(amount) {
    this.setState({
        transferAmount: amount
    })
}

amountChange(e) {
    this.setState({
        amount: e.target.value
    })
}

priceChange(e) {
    this.setState({
        price: e.target.value
    })
}
}
