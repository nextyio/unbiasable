import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import Footer from '@/module/layout/Footer/Container' // eslint-disable-line
import Tx from 'ethereumjs-tx' // eslint-disable-line
import { Link } from 'react-router-dom' // eslint-disable-line
import web3 from 'web3'

import './style.scss'

import { Col, Row, Icon, InputNumber, Breadcrumb, Button } from 'antd' // eslint-disable-line

const weiToEther = (wei) => {
  return Number(web3.utils.fromWei(wei.toString())).toFixed(4)
}

export default class extends LoggedInPage {
  componentDidMount () {
    this.loadData()
  }

  loadData () {
    // this.props.getBalance()
    // this.props.getTokenBalance(this.props.currentAddress)
    // this.props.getDepositedBalance()
    // this.props.getStatus()
    // this.props.getCoinbase()
    // this.props.getAllowance()
  }

  getStatus (status) {
    switch (status) {
      case 0: return 'Ready'
      case 1: return 'Active'
      case 2: return 'Inactive'
      case 3: return 'Withdrawn'
      case 127: return 'Penalized'
      default: return 'Unknown'
    }
  }

  ord_renderContent () { // eslint-disable-line
    return (
      <div className="">
        <div className="ebp-header-divider">

        </div>
        <div className="ebp-page">
          <h3 className="text-center">NTF Deposit</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3" style={{ 'textAlign': 'left' }}>
            <Row>
              <Col span={6}>
                            Balance:
              </Col>
              <Col span={6}>
                {weiToEther(this.props.balance)} NTF
              </Col>
            </Row>
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Holding:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {weiToEther(this.props.myNtfBalance)} NTF
              </Col>
            </Row>
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Deposited:
              </Col>
              <Col span={6}>
                {weiToEther(this.props.myNtfDeposited)} NTF
              </Col>
            </Row>
            <hr />
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Status:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {this.props.isLocking ? 'locked' : 'not locked'}
              </Col>
            </Row>
            {this.props.isLocking &&
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                UnlockTime:
              </Col>
              <Col xs={24} sm={24} md={24} lg={0} xl={0}/>
              <Col span={18}>
                {this.props.myUnlockTime}
              </Col>
            </Row>}

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                            Reward Balance:
              </Col>
              <Col span={6}>
                {weiToEther(this.props.myRewardBalance)} NTY
              </Col>
              <Col span={6}>
                <Button onClick={this.claim.bind(this)} type="primary" className="btn-margin-top submit-button">Claim reward</Button>
              </Col>
            </Row>
            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Amount(NTF):
              </Col>
              <Col span={6}>

                <InputNumber
                  defaultValue={0}
                  value={this.state.depositAmount}
                  onChange={this.onDepositAmountChange.bind(this)}
                />
              </Col>
              <Col span={6}>
                <Button onClick={this.deposit.bind(this)} type="primary" className="btn-margin-top submit-button">Deposit</Button>
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                  Amount(NTF):
              </Col>
              <Col span={6}>

                <InputNumber
                  defaultValue={0}
                  value={this.state.withdrawAmount}
                  onChange={this.onWithdrawAmountChange.bind(this)}
                />
              </Col>

              <Col span={6}>
                <Button onClick={this.withdraw.bind(this)} type="primary" className="btn-margin-top submit-button">Withdraw</Button>
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
        <Breadcrumb.Item><Link to="/userdata"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>User's control</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  onDepositAmountChange (value) {
    this.setState({
      depositAmount: value
    })
  }

  onWithdrawAmountChange (value) {
    this.setState({
      withdrawAmount: value
    })
  }

  async deposit () {
    await this.props.approve(this.state.depositAmount * 1e18)
    await this.props.deposit(this.state.depositAmount * 1e18)
  }

  async withdraw () {
    await this.props.withdraw(this.state.withdrawAmount * 1e18)
  }

  async claim () {
    await this.props.claim()
  }
}
