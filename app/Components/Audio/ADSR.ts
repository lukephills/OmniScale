
import ToneTs from './ToneTs';

class ADSR extends ToneTs {

	public gainNode: GainNode;

	constructor(ctx: AudioContext) {
		super(ctx);
		this.ctx = ctx;
		this.gainNode = this.ctx.createGain();
		this.gainNode.gain.value = 0.001;
	}


	trigger(time, g = 1, a = 0.01, r = 0.01) {
		this.gainNode.gain.setValueAtTime(0.001, time);
		this.gainNode.gain.exponentialRampToValueAtTime(g, time + a);
		this.gainNode.gain.exponentialRampToValueAtTime(0.001, time + a + r);
	};

}

export default ADSR;