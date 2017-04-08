import { ul } from '@cycle/dom';
import isolate from '@cycle/isolate';
import Rx from 'rxjs/Rx';
import Key from './key';

const baseStep = 3; // 0 = A, 3 = C

export default function Keyboard(sources) {

  const keys = Array.from(new Array(13), (_, idx) => idx)
        .map(step => isolate(Key)({
          DOM: sources.DOM,
          props: Rx.Observable.of({ step: step + baseStep })
        }));

  const value$ = Rx.Observable.merge(...keys.map(key => key.value));

  const vdoms = keys.map(key => key.DOM)
  const vdom$ = Rx.Observable.combineLatest(...vdoms)
        .map((keyDoms) => ul(keyDoms));

  return {
    DOM: vdom$,
    value: value$
  };
}
