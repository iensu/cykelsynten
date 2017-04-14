import { ul } from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import delay from 'xstream/extra/delay';
import Key from './key';

const baseStep = 3; // 0 = A, 3 = C
const noteDuration = 1000;
const numberOfKeys = 13;
const keySteps = Array.from(new Array(numberOfKeys), (_, idx) => idx);

export default function Keyboard(sources) {

  const keys = keySteps
        .map(step => isolate(Key)({
          DOM: sources.DOM,
          props: sources.playingNotes.map(notes => ({
            step: step + baseStep,
            isPressed: notes.includes(step + baseStep)
          }))
        }));

  const play$ = xs.merge(...keys.map(key => key.value));

  const stop$ = play$.compose(delay(noteDuration));

  const vdom$ = xs.combine(...keys.map(key => key.DOM))
        .map((keyDoms) => ul(keyDoms));

  return {
    DOM: vdom$,
    play: play$,
    stop: stop$
  };
}
