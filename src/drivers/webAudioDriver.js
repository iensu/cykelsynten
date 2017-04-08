import Rx from 'rxjs/Rx';
import { adapt } from '@cycle/run/lib/adapt';
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
  return ([ note, oscillatorConfig ]) => {
    const oscillators = [oscillatorConfig].map(createOscillator(audioContext)).map(oscillator => {
      oscillator.frequency.value = note.value;
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 5);
      return oscillator;
    });
    return { id: note.value, oscillators };
  };
}

const WebAudioDriver = audioContext => (sink$) => {
  const instructions$ = Rx.Observable.from(sink$);

  const oscillator$ = instructions$.filter(x => x.type === 'oscillator').map(x => x.payload);
  const frequency$ = instructions$.filter(x => x.type === 'frequency').map(x => x.payload);

  const startNote$ = frequency$.filter(x => x.start);
  const stopNote$ = frequency$.filter(x => x.stop);
  const oscillators$ = startNote$.withLatestFrom(oscillator$);


  const runningOscillators$ = oscillators$
        .map(playSound(audioContext))
        .scan((idToOscillators, { id, oscillators }) => Object.assign(idToOscillators, { [id]: oscillators }), {})
        .do(log('runningOscillators'));

  stopNote$.withLatestFrom(runningOscillators$)
    .forEach(([note, oscillators ]) => {
      const oscs = oscillators[note.value];
      oscs.map(o => o.stop(audioContext.currentTime));
    });

  return adapt(oscillators$);
};


export function makeWebAudioDriver(audioContext = new AudioContext()) {
  return WebAudioDriver(audioContext);
}
