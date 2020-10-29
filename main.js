const { app, BrowserWindow } = require('electron');

let mainWindow;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width  : 500,
		height : 600,
		title  : 'ImageShrink'
	});

	// mainWindow.loadURL(`file://${__dirname}/app/index.html`);
	mainWindow.loadFile('./app/index.html');
}

app.on('ready', createMainWindow);
