// @flow
/* eslint-disable indent */

type NoneEffect = {|
  type: 'NONE',
|}
type PromiseEffect<TAction, TPromiseResult> = {|
  type: 'PROMISE',
  factory: () => Promise<TPromiseResult>,
  successTagger: (result: TPromiseResult) => TAction,
  failTagger: (error: any) => TAction,
|}
type MappedEffect<TAction, TTaggedAction> = {|
  type: 'MAP',
  effect: Effect<TTaggedAction>,
  tagger: (action: TTaggedAction) => TAction,
|}
type BatchEffect<TAction> = {|
  type: 'BATCH',
  effects: Array<Effect<TAction>>,
|}

export type Effect<TAction> = PromiseEffect<TAction, *> | NoneEffect | MappedEffect<TAction, *> | BatchEffect<TAction>

export const none = (): Effect<*> => ({ type: 'NONE' })

export const promise = <TAction, TPromiseResult>(
  factory: () => Promise<TPromiseResult>,
  successTagger: (result: TPromiseResult) => TAction,
  failTagger: (error: any) => TAction,
): Effect<TAction> => ({
  type: 'PROMISE',
  factory,
  successTagger,
  failTagger,
})

export const map = <TAction, TTagAction>(
  effect: Effect<TAction>,
  tagger: (action: TAction) => TTagAction,
): Effect<TTagAction> => ({
  type: 'MAP',
  effect,
  tagger,
})

export const batch = <TAction>(effects: Array<Effect<TAction>>): Effect<TAction> => ({
  type: 'BATCH',
  effects,
})

export type Dispatch<TAction> = (action: TAction) => void
