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

const shorten = (str) => {
  return str.substr(0,8) + '..' + str.substr(-6)
}

const weiToCoin = (wei) => {
  return (Number(web3.utils.fromWei(wei.toString()))).toFixed(4)
}

export default class extends LoggedInPage {
  state = {
    seed: "",
    proof: "",
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
          <h3 className="text-center">Manual Evaluator</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>

            <Row>
              <Col span={6}>
                Wallet
              </Col>
              <Col span={18}>
                {this.props.wallet}
              </Col>
            </Row>

            <Row>
              <Col span={6}>
                Balance
              </Col>
              <Col span={18}>
                {weiToCoin(this.props.balance)} Coin
              </Col>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Seed
              </Col>
              <Col span={18}>
                <Input className="maxWidth"
                  defaultValue={0}
                  value={this.state.seed}
                  onChange={this.seedChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Proof
              </Col>
              <Col span={18}>
                <Input.TextArea className="maxWidth"
                  value={this.state.proof}
                  onChange={this.proofChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={3}></Col>
              <Col span={18}>
                <Button onClick={() => this.commit()} type="primary" className="btn-margin-top submit-button maxWidth">Commit</Button>
              </Col>
              <Col span={3}></Col>
            </Row>

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={24}>
                <Button onClick={() => this.verify()} type="primary" className="btn-margin-top submit-button maxWidth">Verify</Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/manual"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Manual</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  seedChange(e) {
    this.setState({
      seed: e.target.value
    })
  }

  iterationChange(iteration) {
    this.setState({
      iteration: iteration
    })
  }

  proofChange(e) {
    this.setState({
      proof: e.target.value
    })
  }
  
  commit() {
    this.props.commit(this.state.seed, this.state.proof);
  }

  verify() {
    this.props.verify(this.state.seed, this.state.proof);
  }
}
