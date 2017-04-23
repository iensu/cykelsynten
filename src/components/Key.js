import {li, button} from '@cycle/dom';
import {classnames} from '../utils';

const NOTE_STRINGS = [
  'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'
];

export default function Key(sources) {
  const props$ = sources.props.remember();
  const value$ = sources.DOM.select('.key').events('click')
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
    value: value$
  };
}
