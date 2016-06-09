import {createIOSSafeAudioContext} from '../Utils/Audio/iOS';
require('../Utils/audio-shim');
import { DEFAULTS } from '../Constants/Defaults';
import * as CanvasUtils from '../Utils/CanvasUtils';
import {WaveformStringType} from '../Constants/AppTypings';
import Looper from '../Utils/Looper/Looper'
import {getFrequencyFromNoteIndexInScale, Scale} from '../Utils/Audio/scales';
import Sine from './Audio/Sine';

interface IAnalysers {
	live: AnalyserNode;
	recording: AnalyserNode;
}

class Audio {

	public context: AudioContext;
	public voiceCount: number = DEFAULTS.VoiceCount;
	public recording: AudioBufferSourceNode;
	public looper: Looper;

	public scale: Scale;

	// Gains
	public masterVolume: GainNode;
	public thereminOutput: GainNode;
	// public oscillatorGains: GainNode[];
	public scuzzGain: GainNode;
	public recordingGain: GainNode;

	// Effects
	public compressor: DynamicsCompressorNode;
	public delay: DelayNode;
	public feedback: GainNode;
	// public filters: BiquadFilterNode[];

	// Analysers
	public analysers: IAnalysers;

	// Oscillators
	public oscillators: Sine[];
	public scuzz: OscillatorNode;

	private _frequencyMultiplier = 15;
	private _defaultCoordinates: CanvasUtils.Coordinate = {x: 0, y: 0};
	private _minFrequency = 0.8;

	constructor() {

		this.initAudioContext();
		this.createNodes();
		this.routeSounds();
		this.setupAnalysers();

		this.looper = new Looper(this.thereminOutput, this.recordingGain);

		this.scale = [261.6255653006, 275.62199471997, 290.36720431405, 294.32876096318, 310.07474405997, 326.6631048533, 331.11985608357, 348.83408706747, 367.49599295996, 387.15627241873, 392.4383479509, 413.43299207996, 435.55080647107, 441.49314144476, 465.11211608996, 489.99465727995, 516.20836322497, 523.2511306012];
	}

	public createNodes() {
		// Gains
		this.masterVolume = this.context.createGain();
		this.thereminOutput = this.context.createGain();
		// this.oscillatorGains = [];
		this.scuzzGain = this.context.createGain();
		this.recordingGain = this.context.createGain();

		// Effects
		this.compressor = this.context.createDynamicsCompressor();
		this.delay = this.context.createDelay();
		this.feedback = this.context.createGain();
		// this.filters = [];


		// Analysers
		this.analysers = {
			live: this.context.createAnalyser(),
			recording: this.context.createAnalyser(),
		}

		// Oscillators
		this.oscillators = [];
		this.scuzz = this.context.createOscillator();


		// AUDIO NODE SETUP
		for (let i: number = 0; i < this.voiceCount; i++) {
			this.oscillators.push(new Sine(this.context));
			// this.filters.push(this.context.createBiquadFilter());
			// this.oscillatorGains.push(this.context.createGain());
		}
	}

	initAudioContext(){
		this.context = createIOSSafeAudioContext(44100);
	}

	public NoteOn(noteIndex: number, volume: number, index: number): void {
		if (index < this.voiceCount) {

			const freq = getFrequencyFromNoteIndexInScale(noteIndex, this.scale);
			console.log('freq', freq)

			this.oscillators[index].frequency = freq;
			this.oscillators[index].output.gain.value = volume/100;
			this.oscillators[index].trigger();

		}
	}

	public NoteOff(index: number): void {
		if (index < this.voiceCount) {
			// this.oscillatorGains[index].gain.value = 0;
			this.oscillators[index].release();
		}
	}

	public StopAll(): void {
		for (let i: number = 0; i < this.voiceCount; i++) {
			this.NoteOff(i);
		}
	}

	// public SetWaveform(value: WaveformStringType): void {
	// 	this.oscillators.forEach((osc: OscillatorNode) => {
	// 		osc.type = value;
	// 	});
	// }

	// public SetFilterFrequency(y: number, id: number): void {
	// 	if (id < this.voiceCount) {
	// 		if (y === 0) y = this._minFrequency;
	// 		this.filters[id].frequency.value = (this.context.sampleRate / 2) * (y / 150);
	// 	}
	// }

	onRecordPress() {
		this.looper.onRecordPress();
	}

	onPlaybackPress() {
		this.looper.onPlaybackPress();
	}

	public StopPlayback(): void {
		this.recording.stop(0);
	}

	public Download(cb: Function): void {
		this.looper.exportWav((recording: Blob) => {
			//TODO: create a promise?
			setTimeout(cb(recording),0);
		});
	}

	private setupAnalysers(): void {
		if (this.analysers) {
			for (const analyser in this.analysers) {
				this.analysers[analyser].maxDecibels = DEFAULTS.Analyser.maxDecibels;
				this.analysers[analyser].minDecibels = DEFAULTS.Analyser.minDecibels;
				this.analysers[analyser].smoothingTimeConstant = DEFAULTS.Analyser.smoothingTimeConstant;
			}
		}
	}

	private routeSounds(): void {
		// this.oscillators.forEach((oscillator: OscillatorNode) => {
		// 	oscillator.type = 'square';
		// });
		// this.filters.forEach((filter: BiquadFilterNode) => {
		// 	filter.type = 'lowpass';
		// });

		// Set slider values
		this.delay.delayTime.value = DEFAULTS.Sliders.delay.value;
		this.feedback.gain.value = DEFAULTS.Sliders.feedback.value;
		this.scuzzGain.gain.value = DEFAULTS.Sliders.scuzz.value;

		// this.oscillatorGains.forEach((oscGain: GainNode) => {
		// 	oscGain.gain.value = 0;
		// });
		this.masterVolume.gain.value = 0.5;

		this.scuzz.frequency.value = 400;
		this.scuzz.type = DEFAULTS.Sliders.scuzz.waveform;

		// Connect the Scuzz
		this.scuzz.connect(this.scuzzGain);

		for (let i: number = 0; i < this.voiceCount; i++) {
			// this.scuzzGain.connect(this.oscillators[i].detune as any);
			this.oscillators[i].connect(this.compressor);
			// this.filters[i].connect(this.delay);
		}

		// this.delay.connect(this.feedback);
		// this.delay.connect(this.compressor);
		this.feedback.connect(this.delay);
		this.compressor.connect(this.thereminOutput);

		// THEREMIN ROUTE
		this.thereminOutput.connect(this.analysers.live);
		this.analysers.live.connect(this.masterVolume);

		this.recordingGain.connect(this.analysers.recording);
		this.analysers.recording.connect(this.masterVolume);

		//OUTPUT
		this.masterVolume.connect(this.context.destination);

		//Start oscillators
		this.scuzz.start(0);
		// this.oscillators.forEach((osc: OscillatorNode) => {
		// 	osc.start(0);
		// });
	}

}
export default Audio;
