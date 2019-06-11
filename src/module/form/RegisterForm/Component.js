import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { Form, Icon, Input, Button } from 'antd' // eslint-disable-line
import ReCAPTCHA from 'react-google-recaptcha' // eslint-disable-line
import {
  RECAPTCHA_KEY,
  MIN_LENGTH_PASSWORD
} from '@/config/constant'

import './style.scss'

const FormItem = Form.Item // eslint-disable-line

class C extends BaseComponent {
  handleSubmit (e) {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Register - received values of form: ', values)
        this.props.register(values.username, values.password)
      }
    })
  }

  constructor (props) {
    super(props)

    this.step1Container = React.createRef()
    this.step2Container = React.createRef()
  }

  compareToFirstPassword (rule, value, callback) {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!') // eslint-disable-line
      callback()
    }
  }

  validateToNextPassword (rule, value, callback) {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPassword'], { force: true })
    }
    if (value && value.length < MIN_LENGTH_PASSWORD) {
      callback(`The Password must be at least ${MIN_LENGTH_PASSWORD} characters.`) // eslint-disable-line
    }
    callback()
  }

  getInputProps () {
    const { getFieldDecorator } = this.props.form

    const firstName_fn = getFieldDecorator('firstName', { // eslint-disable-line
      rules: [{ required: true, message: 'Please input your first name' }],
      initialValue: ''
    })
    const firstName_el = ( // eslint-disable-line
      <Input size="large"
        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        placeholder="First name"/>
    )

    const lastName_fn = getFieldDecorator('lastName', { // eslint-disable-line
      rules: [{ required: true, message: 'Please input your last name' }],
      initialValue: ''
    })
    const lastName_el = ( // eslint-disable-line
      <Input size="large"
        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        placeholder="Last name"/>
    )

    const username_fn = getFieldDecorator('username', { // eslint-disable-line
      rules: [{ required: true, message: 'Please input your username' }],
      initialValue: ''
    })
    const username_el = ( // eslint-disable-line
      <Input size="large"
        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        placeholder="Username"/>
    )

    const email_fn = getFieldDecorator('email', { // eslint-disable-line
      rules: [{
        required: true, message: 'Please input your email'
      }, {
        type: 'email', message: 'The input is not valid E-mail!'
      }]
    })
    const email_el = ( // eslint-disable-line
      <Input size="large"
        prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        placeholder="Email"/>
    )

    const pwd_fn = getFieldDecorator('password', { // eslint-disable-line
      rules: [{
        required: true, message: 'Please input a Password'
      }, {
        validator: this.validateToNextPassword.bind(this)
      }]
    })
    const pwd_el = ( // eslint-disable-line
      <Input size="large"
        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        type="password" placeholder="Password"/>
    )

    const pwdConfirm_fn = getFieldDecorator('passwordConfirm', { // eslint-disable-line
      rules: [{
        required: true, message: 'Please input your password again'
      }, {
        validator: this.compareToFirstPassword.bind(this)
      }]
    })
    const pwdConfirm_el = ( // eslint-disable-line
      <Input size="large"
        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
        type="password" placeholder="Password confirm"/>
    )

    const country_fn = getFieldDecorator('country', { // eslint-disable-line
      rules: [{ required: true, message: 'Please select your country' }],
      initialValue: ''
    })
    const country_el = ( // eslint-disable-line
      <Input size="large"
        placeholder="Country"/>
    )

    const recaptcha_fn = getFieldDecorator('recaptcha', { // eslint-disable-line
      rules: [{ required: true }]
    })
    const recaptcha_el = ( // eslint-disable-line
      <ReCAPTCHA
        ref={(el) => { this.captcha = el }}
        sitekey={RECAPTCHA_KEY}
      />
    )

    return {
      firstName: firstName_fn(firstName_el),
      lastName: lastName_fn(lastName_el),
      userName: username_fn(username_el),
      email: email_fn(email_el),
      pwd: pwd_fn(pwd_el),
      pwdConfirm: pwdConfirm_fn(pwdConfirm_el),
      recaptcha: recaptcha_fn(recaptcha_el),
      country: country_fn(country_el)
    }
  }

  ord_render () { // eslint-disable-line
    const { getFieldDecorator } = this.props.form // eslint-disable-line
    const p = this.getInputProps()

    // TODO: terms of service checkbox

    // TODO: react-motion animate slide left

    return (
      <div className="c_registerContainer">

        <h2>
                    Become a Contributor
        </h2>

        <p>
                    As a member you can sign up for bounties on EBP, <br/>
                    you do not need to be a member to join events.
        </p>

        <Form onSubmit={this.handleSubmit.bind(this)} className="d_registerForm">
          <div ref={this.step1Container} className={this.props.step === 1 ? '' : 'hide'}>
            <FormItem>
              {p.firstName}
            </FormItem>
            <FormItem>
              {p.lastName}
            </FormItem>
            <FormItem>
              {p.userName}
            </FormItem>
            <FormItem>
              {p.email}
            </FormItem>
            <FormItem>
              {p.pwd}
            </FormItem>
            <FormItem>
              {p.pwdConfirm}
            </FormItem>
            <FormItem>
              {p.recaptcha}
            </FormItem>
            <FormItem>
              <Button loading={this.props.loading} type="ebp" htmlType="button" className="d_btn" onClick={this.registerStep1.bind(this)}>
                                Continue
              </Button>
            </FormItem>
          </div>
          <div ref={this.step2Container} className={this.props.step === 2 ? '' : 'hide'}>
            <FormItem>
              {p.country}
            </FormItem>
          </div>
        </Form>
      </div>
    )
  }

  async registerStep1 () {
    this.props.changeStep(2)
  }
}

export default Form.create()(C)
