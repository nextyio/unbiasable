import React from 'react' // eslint-disable-line
import LoggedInPage from '../LoggedInPage'
import { Link } from 'react-router-dom' // eslint-disable-line

import './style.scss'

import { Col, Row, Icon, Breadcrumb, Slider, Input } from 'antd' // eslint-disable-line

function formatter(value) {
  return `${value}%`;
}

export default class extends LoggedInPage {
  state = {
    r: 1/2,
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
        <Row key={"slider_"+i}>
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

            <Row style={{ 'marginTop': '15px' }}>
              <Col span={6}>
                Reduction Rate:
              </Col>
              <Col span={6}>
                <Input className="maxWidth"
                  value={this.state.r}
                  onChange={this.rChange.bind(this)}
                />
              </Col>
            </Row>

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

  rChange(e) {
    this.setState({
      r: e.target.value
    })
  }

  sliderChange(e, value) {
    const { numbers, rewards } = this.state
    numbers[e.i] = value;
    // populate an array
    let evaluators = [];
    for (let i = 0; i < numbers.length; ++i) {
      evaluators.push({
        index: i,
        number: numbers[i],
        reward: 0,
      })
    }
    // sort the array
    evaluators = evaluators.sort((a, b) => a.number - b.number)
    // calculate the rewards
    const r = this.state.r;
    let rr = 1;
    for (let i = 0; i < evaluators.length; ++i) {
      let j = i + 1;
      if (j < evaluators.length) {
        evaluators[i].delta = evaluators[j].number - evaluators[i].number;
      } else {
        evaluators[i].delta = 100 - evaluators[i].number;
      }
      for (let k = 0; k <= i; ++k) {
        evaluators[k].reward += evaluators[i].delta * rr;
      }
      rr *= r;
    }
    for (let i = 0; i < evaluators.length; ++i) {
      rewards[evaluators[i].index] = evaluators[i].reward.toFixed(2);
    }
    // update the state
    this.setState({
      numbers: numbers,
      rewards: rewards,
    })
  }

}
