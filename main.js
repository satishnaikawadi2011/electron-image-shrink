const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozJPEG = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV == 'development';
const isWindows = process.platform == 'win32';
const isMac = process.platform == 'darwin';

let mainWindow;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width           :
			isDev ? 800 :
			500,
		height          : 600,
		title           : 'ImageShrink',
		resizable       : isDev,
		webPreferences  : {
			nodeIntegration : true
		},
		backgroundColor : 'white'
	});

	// mainWindow.loadURL(`file://${__dirname}/app/index.html`);
	mainWindow.loadFile('./app/index.html');
}

function createAboutWindow() {
	aboutWindow = new BrowserWindow({
		width     : 300,
		height    : 300,
		title     : 'About ImageShrink',
		resizable : false
	});
	aboutWindow.loadFile('./app/about.html');
}

app.on('ready', () => {
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);
	// globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
	// globalShortcut.register(

	// 		isMac ? 'Command+Alt+I' :
	// 		'Ctrl+Alt+I',
	// 	() => mainWindow.toggleDevTools()
	// );
	mainWindow.on('ready', () => (mainWindow = null));
});

const menu = [
	...(
		isMac ? [
			{
				label   : app.name,
				submenu : [
					{
						label : 'About',
						click : createAboutWindow
					}
				]
			}
		] :
		[]),
	{
		role : 'fileMenu'
		// label   : 'File',
		// submenu : [
		// 	{
		// 		label       : 'Quit',
		// 		accelerator : 'CmdOrCtrl+W',
		// 		click       : () => app.quit()
		// 	}
		// ]
	},
	...(
		!isMac ? [
			{
				label   : 'Help',
				submenu : [
					{
						label : 'About',
						click : createAboutWindow
					}
				]
			}
		] :
		[]),
	...(
		isDev ? [
			{
				label   : 'Developer',
				submenu : [
					{ role: 'reload' },
					{ role: 'forcereload' },
					{ type: 'separator' },
					{ role: 'toggledevtools' }
				]
			}
		] :
		[])
];

ipcMain.on('image:minimize', (e, data) => {
	data.dest = path.join(os.homedir(), 'imageshrink');
	// console.log(data);
	shrinkImage(data);
});

async function shrinkImage({ imgPath, quality, dest }) {
	try {
		const pngQuality = quality / 100;
		const files = await imagemin(
			[
				slash(imgPath)
			],
			{
				destination : dest,
				plugins     : [
					imageminMozJPEG({ quality }),
					imageminPngquant({
						quality : [
							pngQuality,
							pngQuality
						]
					})
				]
			}
		);
		// console.log(files);
		log.info(files);
		shell.openPath(dest);

		mainWindow.webContents.send('image:done');
	} catch (error) {
		console.log(error);
		log.error(error);
	}
}

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length == 0) {
		createMainWindow();
	}
});
