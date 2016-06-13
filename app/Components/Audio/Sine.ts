import ToneTS from './ToneTs';
import ADSR from './ADSR';
import {getOvertones} from '../../Utils/Audio/scales';

class Sine extends ToneTS {

	public input: GainNode;
	public output: GainNode;
	public frequency: number = 440;
	public ADSR: ADSR;

	private osc: OscillatorNode;
	private attack: number;
	private Decay: number;
	private Sustain: number;
	private release: number;
	private overtoneOscs;
	private overtoneGains;


	constructor(ctx){
		super(ctx);
		this.input = this.ctx.createGain();
		this.output = this.ctx.createGain();
	}

	public trigger() {
		this.setup();
		let now = this.ctx.currentTime;
		this.osc.start();
		this.osc.stop(now + this.attack + this.release);

		this.ADSR.trigger(now, 1, this.attack, this.release);

		setTimeout(() => {
			this.discard();
		}, (this.attack + this.release)*1000)
	}

	private discard() {
		this.osc = null;
		this.overtoneGains.forEach((o, i) => {
			o = null;
			this.overtoneGains[i] = null;
		})
		this.ADSR = null;
	}


	private setup() {
		// this.Attack = 0.01 + (Math.random()*0.06);
		// this.Decay = 0.3 + (Math.random()*0.8);
		// this.Sustain = 0.15 + (Math.random()*0.1);
		// this.Release = 0.1 + (Math.random()*0.1);

		this.attack = 0.005;
		// this.Decay = 1.5;
		// this.Sustain = 0;
		this.release = 2;

		this.osc = this.ctx.createOscillator();
		this.ADSR = new ADSR(this.ctx);

		this.overtoneOscs = []
		this.overtoneGains = []
		const overtones: number[] = getOvertones(this.frequency, 2)

		overtones.forEach((tone, i) => {
			this.overtoneOscs[i] = this.ctx.createOscillator();
			this.overtoneOscs[i].type = 'square';
			this.overtoneOscs[i].frequency.value = tone;
			this.overtoneGains[i] = this.ctx.createGain();
			this.overtoneGains[i].gain.value = 1/(i+0.1);
			this.overtoneOscs[i].connect(this.overtoneGains[i]);
			this.overtoneGains[i].connect(this.ADSR.gainNode);
		})

		// console.log(overtones);
		
		this.osc.type = "triangle";
		// this.osc.type = "sine";
		this.osc.frequency.value = this.frequency;
		// this.osc2.frequency.value = [0];



		this.osc.connect(this.ADSR.gainNode);
		this.ADSR.gainNode.connect(this.output);
	}



}

export default Sine;
