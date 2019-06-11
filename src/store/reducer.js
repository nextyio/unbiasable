import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import task from './redux/task'
import user from './redux/user'
import unbiasable from './redux/unbiasable'
import contracts from './redux/contracts'
import community from './redux/community'

const default_state = { // eslint-disable-line
  init: false
}

const appReducer = (state = default_state, action) => {
  switch (action.type) {

  }

  return state
}

export default combineReducers({
  app: appReducer,
  router: routerReducer,
  task: task.getReducer(),
  contracts: contracts.getReducer(),
  user: user.getReducer(),
  unbiasable: unbiasable.getReducer(),
  community: community.getReducer()
})
