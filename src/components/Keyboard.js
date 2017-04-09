import { ul } from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import Key from './key';

const baseStep = 3; // 0 = A, 3 = C

export default function Keyboard(sources) {

  const keys = Array.from(new Array(13), (_, idx) => idx)
        .map(step => isolate(Key)({
          DOM: sources.DOM,
          props: xs.of({ step: step + baseStep })
        }));

  const value$ = xs.merge(...keys.map(key => key.value));

  const vdom$ = xs.combine(...keys.map(key => key.DOM))
        .map((keyDoms) => ul(keyDoms));

  return {
    DOM: vdom$,
    value: value$
  };
}
