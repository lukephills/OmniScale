
import ToneTs from './ToneTs';

class ADSR extends ToneTs {

	public gainNode: GainNode;

	constructor(ctx: AudioContext) {
		super(ctx);
		this.ctx = ctx;
		this.gainNode = this.ctx.createGain();
		this.gainNode.gain.value = 0.001;
	}


	trigger(time,g,a,d,s,r) {

		this.gainNode.gain.setValueAtTime(0.001, time);
		this.gainNode.gain.linearRampToValueAtTime(g, time + a);
		this.gainNode.gain.linearRampToValueAtTime(s*g, time + a + d);
		this.gainNode.gain.linearRampToValueAtTime(0.001, time + a + d + r);
	};
}

export default ADSR;