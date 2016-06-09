import * as CanvasUtils from '../Utils/CanvasUtils';
import MultiTouch from './MultiTouch';
import Audio from './Audio';
import {IdentifierIndexMap, isCordovaIOS} from '../Utils/utils';
import {getItemFromArrayPool} from '../Utils/array';
// import styles from '../Styles/styles.css';



class App {

	public audio: Audio;
	public canvas: HTMLCanvasElement;
	private touches: IdentifierIndexMap;
	private _DrawAnimationFrame: number;
	public pixelRatio: number = CanvasUtils.getPixelRatio();
	public colors: string[] = [
		'rgb(198,199,192)', //grey
		'rgb(215,251,247)', //light blue
		'rgb(248,204,228)', //pink
		'rgb(222,250,214)', //green
		'rgb(181,195,229)', //purple
		'rgb(252,224,204)', //peach
		'rgb(194,227,252)', //blue
		'rgb(250,230,176)', //yellow
	];

	public lines: number = 48;
	private activeTouches: any = {};




	init() {
		console.log('INITIALIZED APP');
		this.canvas = CanvasUtils.createCanvas(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.canvas);

		this.handleResize = this.handleResize.bind(this);

		window.addEventListener('resize', this.handleResize);

		this.draw();

		this.audio = new Audio();

		this.touches = new IdentifierIndexMap();
		new MultiTouch({
			onMouseDown: this.onMouseDown.bind(this),
			onMouseUp: this.onMouseUp.bind(this),
			onMouseMove: this.onMouseMove.bind(this),
		});
		
	}

	handleResize() {
		CanvasUtils.canvasResize(this.canvas, window.innerWidth, window.innerHeight);
		this.draw();
	}

	draw() {
		// this._DrawAnimationFrame = requestAnimationFrame(this.draw.bind(this));
		console.log('DRAW');

		const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
		const w: number = this.canvas.width / this.pixelRatio;
		const h: number = this.canvas.height / this.pixelRatio;
		const {colors, lines} = this;
		const lineWidth = w/lines;

		ctx.clearRect(0, 0, w, h);

		// COLOURS

		// DRAW THE LINES
		for (let i = 0; i < lines; i++) {
			ctx.fillStyle = getItemFromArrayPool(i, colors);
			ctx.fillRect(lineWidth * i, 0, lineWidth + 1, h); // +1 is for overlap to avoid nasty small white lines
		}
	}


	onMouseDown(e, id) {
		const index = this.touches.Add(id);
		const pos = CanvasUtils.getCoordinateFromEventAsPercentageWithinElement(e, this.canvas);
		const noteIndex = this.getNoteIndexFromPosition(pos.x);

		// store the current noteIndex in activeTouches
		this.activeTouches[id] = noteIndex;

		console.log('note', noteIndex)

		// Play the note
		this.audio.NoteOn(noteIndex, pos.y, index);
	}

	onMouseUp(e, id) {
		const index = this.touches.GetIndexFromIdentifier(id);

		// delete this noteIndex from active touches
		delete this.activeTouches[id];

		// Stop the note
		this.audio.NoteOff(index);
	}
	onMouseMove(e, id) {

		const index = this.touches.GetIndexFromIdentifier(id);
		const pos = CanvasUtils.getCoordinateFromEventAsPercentageWithinElement(e, this.canvas);
		const noteIndex = this.getNoteIndexFromPosition(pos.x);



		// If noteIndex hasn't changed return
		if (this.activeTouches[id] === noteIndex) return;

		// Has changed, update the current noteIndex in activeTouches
		this.activeTouches[id] = noteIndex;

		console.log('note', noteIndex)

		// Play the note
		this.audio.NoteOn(noteIndex, pos.y, index);
	}

	//TODO: move to utils?
	getNoteIndexFromPosition(x): number {
		return Math.floor(x/(100 / this.lines))
	}

}

export default App;

