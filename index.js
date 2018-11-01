/* eslint-disable no-underscore-dangle, indent */

import React from 'react'
import { render } from 'react-dom'
import { createStore, compose } from 'redux'
import { install as loopInstall, loop, Effects } from 'redux-loop'
import { Provider, connect } from 'react-redux'
import * as Main from './src/Main.js'

const isReduxAction = action =>
  action.type != null && (action.type.indexOf('@@redux/') === 0 || action.type === '@@INIT')

const toReduxLoopEffect = effect => {
  switch (effect.type) {
    case 'NONE':
      return Effects.none()
    case 'PROMISE': {
      const factory = () =>
        effect.factory().then(result => effect.successTagger(result), error => effect.failTagger(error))

      return Effects.promise(factory)
    }
    case 'MAP': {
      return Effects.lift(toReduxLoopEffect(effect.effect), effect.tagger)
    }
    case 'BATCH': {
      return Effects.batch(effect.effects.map(batchedEffect => toReduxLoopEffect(batchedEffect)))
    }
  }
}

const toReduxLoop = reduction => {
  const [newState, effects] = reduction
  return loop(newState, toReduxLoopEffect(effects))
}

const install = init => createStore => (update, initialState, enhancer) => {
  initialState = initialState || toReduxLoop(init())
  const reducer = (state, action) => {
    if (isReduxAction(action)) return state
    return toReduxLoop(update(state, action))
  }

  const loopEnhancer = loopInstall()
  return loopEnhancer(createStore)(reducer, initialState, enhancer)
}

let store

let storeFactory

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // version <= 2.11
        serialize: {
          options: true,
        },
        // version >= 2.12
        serializeAction: true,
        serializeState: true,
      })
    : compose
  storeFactory = composeEnhancers(install(Main.init))(createStore)
} else {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  storeFactory = composeEnhancers(install(Main.init))(createStore)
}

store = storeFactory(Main.update)

const renderApp = View => {
  const ConnectedView = connect(appState => ({ model: appState }))(View)

  render(
    <Provider store={store}>
      <ConnectedView />
    </Provider>,
    document.getElementById('root'),
  )
}

renderApp(Main.View)
