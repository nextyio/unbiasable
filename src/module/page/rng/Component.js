import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import { Link } from 'react-router-dom' // eslint-disable-line
import web3 from 'web3'
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
    entropy: "",
    duration: 0,
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
                Entropy
              </Col>
              <Col span={18}>
                <Input className="maxWidth"
                  defaultValue={0}
                  value={this.state.entropy}
                  onChange={this.entropyChange.bind(this)}
                />
              </Col>
            </Row>

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                T (blocks)
              </Col>
              <Col span={6}>
                <InputNumber className="maxWidth"
                  defaultValue={0}
                  value={this.state.duration}
                  onChange={this.durationChange.bind(this)}
                />
              </Col>
              <Col span={6}/>
              <Col span={6}>
                <Button onClick={() => this.challenge()} type="primary" className="btn-margin-top submit-button maxWidth">Challenge</Button>
              </Col>
            </Row>

            { this.props.seed &&
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                  Seed
                </Col>
                <Col span={14}>
                  {shorten(this.props.seed)}
                </Col>
                <Col span={4}>
                  <CopyToClipboard text={this.props.seed.substr(2)}>
                    <Button className="maxWidth">Copy</Button>
                  </CopyToClipboard>
                </Col>
              </Row>
            }

            { this.props.iteration > 0 &&
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                  Iteration
                </Col>
                <Col span={6}>
                  {this.props.iteration}
                </Col>
                <Col span={8}>
                </Col>
                <Col span={4}>
                  <CopyToClipboard text={this.props.iteration}>
                    <Button className="maxWidth">Copy</Button>
                  </CopyToClipboard>
                </Col>
              </Row>
            }

            <div className="ebp-header-divider dashboard-rate-margin">
            </div>

            {
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                  State
                </Col>
                <Col span={18}>
                  {this.props.state}
                </Col>
              </Row>
            }

            {
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                  Commit Count
                </Col>
                <Col span={18}>
                  {this.props.commitCount}
                </Col>
              </Row>
            }

            {
              <Row style={{ 'marginTop': '15px' }}>
                <Col span={6}>
                  Valid Proof Hash
                </Col>
                <Col span={18}>
                  <Input.TextArea className="maxWidth"
                    value={this.props.validProofHash}
                  />
                </Col>
              </Row>
            }

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={24}>
                <Button onClick={() => this.reload()} type="primary" className="btn-margin-top submit-button maxWidth">Reload</Button>
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

  entropyChange(e) {
    this.setState({
      entropy: e.target.value
    })
  }

  durationChange(duration) {
    this.setState({
      duration: duration
    })
  }

  challenge() {
    this.props.challenge(this.state.entropy, this.state.duration);
  }

  reload() {
    this.props.reload(this.state.entropy);
  }
}
