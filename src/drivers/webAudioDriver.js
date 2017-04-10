import { adapt } from '@cycle/run/lib/adapt';
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import pairwise from 'xstream/extra/pairwise'
import { toHertz } from '../utils';

function createOscillator(audioContext, note) {
  return (config) => {
    const gainNode = createGain(audioContext)(config);
    const oscillator = audioContext.createOscillator();

    oscillator.type = config.waveform;
    oscillator.detune.value = config.detune;
    oscillator.frequency.value = toHertz(440)(note);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return oscillator;
  };
}

function createGain(audioContext) {
  return ({ gain }) => {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    return gainNode;
  }
}

function setupOscillators(audioContext) {
  return ([ notes, oscillatorSettings ]) => {
    return notes.value
      .map(note => {
        const oscillators = Object.keys(oscillatorSettings)
              .map(key => oscillatorSettings[key])
              .map(createOscillator(audioContext, note))

        return { note, oscillators };
      })
      .reduce((result, { note, oscillators }) => Object.assign({}, result, {
        [note]: oscillators
      }), {});
  };
}

const tryStop = (oscillator) => {
  try {
    oscillator.stop();
  } catch (e) {
    if (e.code !== 11) throw e; // 11 = Oscillator not started!
    oscillator.start();
    oscillator.stop();
  }
}

const WebAudioDriver = audioContext => (instructions$) => {
  const oscillatorSettings$ = instructions$
        .filter(x => x.type === 'oscillator')
        .map(x => x.payload)
        .fold((oscillators, oscillator) => Object.assign({}, oscillators, {
          [oscillator.label]: oscillator
        }));

  const notes$ = instructions$
        .filter(x => x.type === 'notes')
        .map(x => x.payload)

  const oscillators$ = notes$
        .compose(sampleCombine(oscillatorSettings$))
        .map(setupOscillators(audioContext))

  oscillators$
    .compose(pairwise)
    .subscribe({
      next: ([prevOscillators, currOscillators]) => {
        const currNotes = Object.keys(currOscillators);
        const prevNotes = Object.keys(prevOscillators);
        const toStart = currNotes.filter(n => !prevNotes.includes(n));
        const toStop = prevNotes.filter(n => !currNotes.includes(n));
        console.log(toStart, toStop)

        toStop.forEach(note => prevOscillators[note].map(tryStop));
        toStart.forEach(note => currOscillators[note].map(o => {
          o.start();
          o.stop(audioContext.currentTime + 3);
        }))
      },
      error: e => console.log(e.code)
    });

  return {
    notes: notes$.map(n => n.value),
    oscillatorSettings: oscillatorSettings$
  }
};


export function makeWebAudioDriver(audioContext = new AudioContext()) {
  return WebAudioDriver(audioContext);
}
