import 'babel-polyfill';
import 'normalize.css';
import App from './Components/app';


const startApp = () => {
	// Prevent touch scroll event on document //
	// document.addEventListener('touchmove', function(e){e.preventDefault()}, false);
	const app = new App();
	app.init();

}


// const deviceReady = () => {
// 	setTimeout(() => {
// 		navigator.splashscreen.hide();
// 		startApp();
// 	}, 2000);
// }

// if (window.cordova) {
// 	document.addEventListener('deviceready', deviceReady, false);
// } else {
	startApp();
// }