import { adapt } from '@cycle/run/lib/adapt';
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { log } from '../utils';

function createOscillator(audioContext) {
  return ({ gain, waveform, detune }) => {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNode.connect(audioContext.destination);

    const oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.detune.value = detune;
    oscillator.connect(gainNode);

    return oscillator;
  };
}

function playSound(audioContext) {
  return ([ note, oscillatorConfigs ]) => {
    const oscillators = Object.keys(oscillatorConfigs)
          .map(key => oscillatorConfigs[key])
          .map(createOscillator(audioContext)).map(oscillator => {
            oscillator.frequency.value = note.value;
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2);

            return oscillator;
          });

    return { id: note.value, oscillators };
  };
}

const WebAudioDriver = audioContext => (instructions$) => {
  const oscillators$ = instructions$.filter(x => x.type === 'oscillator').map(x => x.payload)
        .fold((oscillators, oscillator) => Object.assign({}, oscillators, {
          [oscillator.label]: oscillator
        }), {})
  const frequency$ = instructions$.filter(x => x.type === 'frequency').map(x => x.payload);

  const startNote$ = frequency$.filter(x => x.start);
  const stopNote$ = frequency$.filter(x => x.stop);

  const runningOscillators$ = startNote$.compose(sampleCombine(oscillators$))
        .map(playSound(audioContext))
        .fold((idToOscillators, { id, oscillators }) => Object.assign(idToOscillators, { [id]: oscillators }), {});

  stopNote$.compose(sampleCombine(runningOscillators$))
    .subscribe({
      next: ([note, oscillators ]) => {
        const oscs = oscillators[note.value];
        oscs.map(o => o.stop(audioContext.currentTime));
      }
    });

  return adapt(oscillators$);
};


export function makeWebAudioDriver(audioContext = new AudioContext()) {
  return WebAudioDriver(audioContext);
}
