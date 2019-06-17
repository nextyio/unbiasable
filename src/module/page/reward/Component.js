import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import { Link } from 'react-router-dom' // eslint-disable-line

import './style.scss'

import { Col, Row, Icon, Breadcrumb, Slider } from 'antd' // eslint-disable-line

function formatter(value) {
  return `${value}%`;
}

export default class extends LoggedInPage {
  state = {
    numbers: [50, 100, 100, 100, 100],
    rewards: [50, 0, 0, 0, 0],
  }

  async componentDidMount() {
    // this.reload()
  }

  createSliders() {
    let content = [];
    for (let i = 0; i < this.state.numbers.length; ++i) {
      content.push(
        <Row>
          <Col span={22}>
            <Slider
              tipFormatter={formatter}
              onChange={this.sliderChange.bind(this, {i})}
              value={this.state.numbers[i]}
            />
          </Col>
          <Col span={2}>
            {this.state.rewards[i]}%
          </Col>
        </Row>
      );
    }
    return content;
  }

  ord_renderContent () { // eslint-disable-line
    return (
      <div className="">
        <div className="ebp-header-divider">
        </div>

        <div className="ebp-page">
          <h3 className="text-center">Reward Calculator</h3>
          <div className="ant-col-md-18 ant-col-md-offset-3 text-alert" style={{ 'textAlign': 'left' }}>

            {this.createSliders()}

          </div>
        </div>
      </div>
    )
  }

  ord_renderBreadcrumb () { // eslint-disable-line
    return (
      <Breadcrumb style={{ 'marginLeft': '16px', 'marginTop': '16px', float: 'right' }}>
        <Breadcrumb.Item><Link to="/reward"><Icon type="home" /> Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Reward</Breadcrumb.Item>
      </Breadcrumb>
    )
  }

  sliderChange(e, value) {
    console.log(e.i, value);
    console.log(this.state.numbers);
    const { numbers } = this.state
    numbers[e.i] = value;
    this.setState({
      numbers: numbers
    })
  }

}
