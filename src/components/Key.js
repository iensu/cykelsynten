import {li, button} from '@cycle/dom';
import xs from 'xstream';
import {classnames} from '../utils';

const NOTE_STRINGS = [
  'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'
];

export default function Key(sources) {
  const key$ = sources.DOM.select('.key');
  const props$ = sources.props.remember();

  const down$ = xs.merge(key$.events('mousedown'), key$.events('touchstart'));
  const up$ = xs.merge(key$.events('mouseup'), key$.events('touchend'));

  const start$ = down$
        .map(() => props$.map(({ note }) => note).take(1))
        .flatten();
  const stop$ = up$
        .map(() => props$.map(({ note }) => note).take(1))
        .flatten();

  const vdom$ = props$.map(({ note, isPressed }) => {
    const key = NOTE_STRINGS[note % 12];
    const classes = classnames({
      '.sharp': key.match(/[b#]$/),
      '.pressed': isPressed
    });

    return li(classes, button('.key', key));
  });

  return {
    DOM: vdom$,
    start: start$,
    stop: stop$
  };
}
