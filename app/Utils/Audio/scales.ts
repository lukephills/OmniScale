import {
	uniq,
	getIteration,
	getIndexFromArray,
} from '../array';

//--------------//
///   SCALES   ///
//--------------//

export type Scale = number[];

/**
 * Takes a Scale and a root frequency and returns an updated scale beginning at the root
 * @param scale: Scale
 * @param root: number
 * @returns {Scale}
 */
export function scaleFromRoot(scale: Scale, root: number): Scale {
	const multi: number = root/scale[0];
	let newScale: Scale = [];
	for (let i = 0, len = scale.length; i < len; i++) {
		// for each frequency times by multiplier and round to 4 decimal places
		newScale[i] = +(scale[i] * multi).toFixed(4);
	}
	return newScale;
}


/**
 * Takes a Scale and an array of root frequencies and returns a singular Scale with frequencies from scales combined and ordered lowest to highest
 * @param scale
 * @param root
 * @returns {any}
 */
export function scaleFromRoots(scale: Scale, roots: number[]): Scale {
	const newScales: Scale[] = [];
	for (let i = 0, l = roots.length; i < l; i++){
		newScales[i] = scaleFromRoot(scale, roots[i]);
	}
	return combineScales(newScales);
}


/**
 * Takes an array of Scales and combines and orders them lowest to highest removing duplicates
 * @param array
 */
export function combineScales(array: Scale[]): Scale {
	return uniq([].concat(...array).sort((a, b) => a - b));
}


/**
 * gets the frequency from the scale and note position
 * @param scale
 * @param noteIndex - 0 would be the 1st note in the scale, 11 would be the 12th note in the scale.
 * @returns {number}
 */
export function getFrequencyFromNoteIndexInScale(noteIndex: number, scale: Scale): number {
	let note = scale[getIndexFromArray(noteIndex,  scale)];
	let octave = getIteration(noteIndex, scale.length);
	return getFrequencyFromNoteAndOctave(note, octave);
}

export function getFrequencyFromNoteAndOctave(root: number, octave: number): number {
	return root * (Math.pow(2, octave));
}