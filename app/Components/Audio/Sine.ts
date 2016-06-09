import ToneTS from './ToneTs';
import ADSR from './ADSR';

class Sine extends ToneTS {

	public input: GainNode;
	public output: GainNode;
	public frequency: number = 440;
	public ADSR: ADSR;

	private osc: OscillatorNode;
	private Attack: number;
	private Decay: number;
	private Sustain: number;
	private Release: number;


	constructor(ctx){
		super(ctx);
		this.input = this.ctx.createGain();
		this.output = this.ctx.createGain();
	}

	public trigger() {
		this.setup();
		let now = this.ctx.currentTime;
		this.osc.start();
		this.osc.stop(now + this.Attack + this.Decay + this.Sustain + this.Release);

		this.ADSR.trigger(now, this.output.gain.value, this.Attack, this.Decay, this.Sustain, this.Release);
	}

	public release() {

	}

	private setup() {
		// this.Attack = 0.01 + (Math.random()*0.06);
		// this.Decay = 0.3 + (Math.random()*0.8);
		// this.Sustain = 0.15 + (Math.random()*0.1);
		// this.Release = 0.1 + (Math.random()*0.1);

		this.Attack = 0.01;
		this.Decay = 0.2;
		this.Sustain = 1;
		this.Release = 0.01;

		this.osc = this.ctx.createOscillator();
		this.osc.type = "triangle";
		this.osc.frequency.value = this.frequency;

		this.ADSR = new ADSR(this.ctx);

		this.osc.connect(this.ADSR.gainNode);
		this.ADSR.gainNode.connect(this.output);
	}



}

export default Sine;
