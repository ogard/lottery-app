// @flow
/* eslint-disable indent */

import * as Effects from './effects'
import * as Symbol from './symbol'

// INFO: random values in range: Math.floor(Math.random() * (max - min + 1)) + min;

export const getUniqueRandomSymbols = <Action>(count: number, tagger: (symbols: Array<Symbol.Value>) => Action) =>
  Effects.promise(
    () =>
      new Promise((resolve, _reject) => {
        let rArr = []
        while (rArr.length < count) {
          const randomSymbol = Symbol.values[Math.floor(Math.random() * Symbol.values.length) + 1]
          if (rArr.indexOf(randomSymbol) > -1) continue
          rArr[rArr.length] = randomSymbol
        }
        resolve(rArr)
      }),
    tagger,
    () => {
      throw new Error('never')
    },
  )

export const generate = <Action>(
  timer: number,
  existingSymbols: Array<Symbol.Value>,
  tagger: (uniqueSymbol: Symbol.Value) => Effects.Effect<Action>,
) =>
  Effects.promise(
    () =>
      new Promise((resolve, _reject) => {
        const validArray = Symbol.values.reduce((acc, x) => {
          if (existingSymbols.includes(x)) {
            return acc
          }
          return [...acc].concat(x)
        }, [])
        setTimeout(() => {
          resolve(validArray[Math.floor(Math.random() * validArray.length)])
        }, timer)
      }),
    tagger,
    () => {
      throw new Error('never')
    },
  )
