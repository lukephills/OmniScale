export const MOUSE_ID = -999;

export interface MultiTouchCallbacks {
	onMouseDown(event, id): void;
	onMouseUp(event, id): void;
	onMouseMove(event, id): void;
	// onTouchDown(event, id): void;
	// onTouchUp(event, id): void;
	// onTouchMove(event, id): void;
}

class MultiTouch {

	public callbacks: MultiTouchCallbacks;
	private _pointers;

	constructor(callbacks: MultiTouchCallbacks) {
		this.callbacks = callbacks;
		this._pointers = {};
		
		// Bind listeners
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);

		window.addEventListener('mousedown', this.onMouseDown);
	}

	onMouseDown(e){
		window.addEventListener('mouseup', this.onMouseUp);
		window.addEventListener('mousemove', this.onMouseMove);

		// save the pointer
		this._pointers[MOUSE_ID] = true;

		if (this.callbacks.onMouseDown) {
			// console.log('down')
			this.callbacks.onMouseDown(e, MOUSE_ID);
		}
	}

	onMouseUp(e) {
		e.preventDefault();
		// if this pointer exists
		if (this._pointers[MOUSE_ID]) {
			if (this.callbacks.onMouseUp){
				this.callbacks.onMouseUp(e, MOUSE_ID);
			}
			delete this._pointers[MOUSE_ID];
		}
		
		window.removeEventListener('mouseup', this.onMouseUp)
		window.removeEventListener('mousemove', this.onMouseMove)
	}

	onMouseMove(e) {
		e.preventDefault();

		// if this pointer is down
		if (this._pointers[MOUSE_ID]) {
			if (this.callbacks.onMouseMove) {
				this.callbacks.onMouseMove(e, MOUSE_ID);
			}
		}
	}
}

export default MultiTouch;