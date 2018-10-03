// @flow

import * as React from 'react'
import * as Effects from './effects'
import * as Symbol from './symbol'
import * as SymbolGenearator from './generateRandomSymbol'
import '../assets/style/main.css'

type SymbolModel = { type: 'Generating' } | { type: 'Generated', value: Symbol.Value }

export type Model = {
  symbol1: ?SymbolModel,
  symbol2: ?SymbolModel,
  symbol3: ?SymbolModel,
  symbol4: ?SymbolModel,
  symbol5: ?SymbolModel,
  symbol6: ?SymbolModel,
  lotteryInProgress: boolean,
  userSymbols: Array<Symbol.Value>,
  lastWinningCombination: Array<Symbol.Value>,
}

export type Action =
  | { type: 'GenerateUserSymbols' }
  | { type: 'NewUserSymbols', userSymbols: Array<Symbol.Value> }
  | { type: 'StartLottery' }
  | { type: 'NewSymbol1', value: Symbol.Value }
  | { type: 'NewSymbol2', value: Symbol.Value }
  | { type: 'NewSymbol3', value: Symbol.Value }
  | { type: 'NewSymbol4', value: Symbol.Value }
  | { type: 'NewSymbol5', value: Symbol.Value }
  | { type: 'NewSymbol6', value: Symbol.Value }

export const init = (): [Model, Effects.Effect<Action>] => [
  {
    symbol1: null,
    symbol2: null,
    symbol3: null,
    symbol4: null,
    symbol5: null,
    symbol6: null,
    lotteryInProgress: false,
    userSymbols: [],
    lastWinningCombination: [],
  },
  SymbolGenearator.getUniqueRandomSymbols(6, userSymbols => ({ type: 'NewUserSymbols', userSymbols })),
]

const extractExistingSymbols = (model: Model): Array<Symbol.Value> => {
  let rArr = []
  Object.keys(model).forEach(key => {
    if (model[key] != null) {
      if (model[key]['type'] === 'Generated') {
        rArr.push(model[key]['value'])
      }
    }
  })
  return rArr
}

const sortAsc = (a, b) => a - b

export const update = (model: Model, action: Action): [Model, Effects.Effect<Action>] => {
  switch (action.type) {
    case 'GenerateUserSymbols':
      return [
        {
          symbol1: null,
          symbol2: null,
          symbol3: null,
          symbol4: null,
          symbol5: null,
          symbol6: null,
          lotteryInProgress: false,
          userSymbols: [],
          lastWinningCombination: [],
        },
        SymbolGenearator.getUniqueRandomSymbols(6, userSymbols => ({ type: 'NewUserSymbols', userSymbols })),
      ]
    case 'NewUserSymbols':
      return [{ ...model, userSymbols: action.userSymbols }, Effects.none()]
    case 'StartLottery':
      return [
        {
          ...model,
          symbol1: { type: 'Generating' },
          symbol2: null,
          symbol3: null,
          symbol4: null,
          symbol5: null,
          symbol6: null,
          lotteryInProgress: true,
          lastWinningCombination: [],
        },
        SymbolGenearator.generate(2000, [], value => ({ type: 'NewSymbol1', value })),
      ]
    case 'NewSymbol1': {
      const newModel = {
        ...model,
        symbol1: { type: 'Generated', value: action.value },
        symbol2: { type: 'Generating' },
      }
      return [
        newModel,
        SymbolGenearator.generate(2000, extractExistingSymbols(newModel), value => ({ type: 'NewSymbol2', value })),
      ]
    }
    case 'NewSymbol2': {
      const newModel = {
        ...model,
        symbol2: { type: 'Generated', value: action.value },
        symbol3: { type: 'Generating' },
      }
      return [
        newModel,
        SymbolGenearator.generate(2000, extractExistingSymbols(newModel), value => ({ type: 'NewSymbol3', value })),
      ]
    }
    case 'NewSymbol3': {
      const newModel = {
        ...model,
        symbol3: { type: 'Generated', value: action.value },
        symbol4: { type: 'Generating' },
      }
      return [
        newModel,
        SymbolGenearator.generate(2000, extractExistingSymbols(newModel), value => ({ type: 'NewSymbol4', value })),
      ]
    }
    case 'NewSymbol4': {
      const newModel = {
        ...model,
        symbol4: { type: 'Generated', value: action.value },
        symbol5: { type: 'Generating' },
      }
      return [
        newModel,
        SymbolGenearator.generate(2000, extractExistingSymbols(newModel), value => ({ type: 'NewSymbol5', value })),
      ]
    }
    case 'NewSymbol5': {
      const newModel = {
        ...model,
        symbol5: { type: 'Generated', value: action.value },
        symbol6: { type: 'Generating' },
      }
      return [
        newModel,
        SymbolGenearator.generate(2000, extractExistingSymbols(newModel), value => ({ type: 'NewSymbol6', value })),
      ]
    }
    case 'NewSymbol6': {
      const newModel = {
        ...model,
        lotteryInProgress: false,
        symbol6: { type: 'Generated', value: action.value },
      }
      return [{ ...newModel, lastWinningCombination: extractExistingSymbols(newModel).sort(sortAsc) }, Effects.none()]
    }
    default:
      return assertNever(action.type)
  }
}

const drawSymbol = (model: ?SymbolModel): React$Element<any> => {
  if (model != null) {
    switch (model.type) {
      case 'Generating':
        return <div className="symbol">...</div>
      case 'Generated':
        return <div className="symbol">{model.value}</div>

      default:
        return assertNever(model.type)
    }
  }
  return (
    <div className="symbol">
      <p>?</p>
    </div>
  )
}

const drawUserSymbols = (arr: Array<Symbol.Value>): React$Element<any> =>
  arr.length > 0 ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {arr.sort(sortAsc).map((x, i) => (
        <div style={{ marginRight: 10 }} key={i.toString()}>
          {x}
        </div>
      ))}
    </div>
  ) : (
    <p>Generating</p>
  )

type Props = {
  model: Model,
  dispatch: Effects.Dispatch<Action>,
}
export const View = ({ model, dispatch }: Props) => (
  <div>
    <div style={{ display: 'flex' }}>
      <p style={{ marginRight: 15 }}>Your lucky numbers:</p>
      {drawUserSymbols(model.userSymbols)}
      <button
        className="actionButton"
        disabled={model.lotteryInProgress}
        onClick={() => dispatch({ type: 'GenerateUserSymbols' })}
      >
        Get new ones
      </button>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
      <div style={{ marginRight: 15 }}>{drawSymbol(model.symbol1)}</div>
      <div style={{ marginRight: 15 }}>{drawSymbol(model.symbol2)}</div>
      <div style={{ marginRight: 15 }}>{drawSymbol(model.symbol3)}</div>
      <div style={{ marginRight: 15 }}>{drawSymbol(model.symbol4)}</div>
      <div style={{ marginRight: 15 }}>{drawSymbol(model.symbol5)}</div>
      <div style={{ marginRight: 15 }}>{drawSymbol(model.symbol6)}</div>
    </div>
    <button
      style={{ marginRight: 15 }}
      className="actionButton"
      disabled={model.lotteryInProgress}
      onClick={() => dispatch({ type: 'StartLottery' })}
    >
      {model.lastWinningCombination.length > 0 ? 'Play again' : 'Start lottery'}
    </button>
    {model.lastWinningCombination.length > 0 ? (
      <p>{`Winning combination: ${model.lastWinningCombination.toString()}`}</p>
    ) : null}
  </div>
)
