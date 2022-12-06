import App from './app.js';

const config = window['config'] || {};
const app = new App(config);
app.initialize();
console.log('App Initialized');