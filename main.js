'use strict';

// Import parts of electron to use
const {app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray} = require('electron');
const path = require('path')
const url = require('url')

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let appIcon = null;
let trayMenu = null;
let shortcutCommand = "CommandOrControl+Shift+T";
let randomizeStartTime = false;
let primaryStartTime = 38;
let chorusStarts = [
  38, 48, 70, 77, 81, 88, 96, 129, 137, 144, 150, 157, 
]

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024, height: 768, show: false, frame: false, title: "Moana"
  });

  // and load the index.html of the app.
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL( indexPath );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {

    // Tray
    appIcon = new Tray('./icon.ico');
    trayMenu = Menu.buildFromTemplate([
      { label: "Shortcut is : " + shortcutCommand},
      { type: "checkbox", label: "Randomize!", click: randomizeClickHandler },
      { label: "Exit", click: exitClickHandler  },
      
    ])

    appIcon.setContextMenu(trayMenu);

    // Register a Global Shortcut
    const shortcut = globalShortcut.register(shortcutCommand, () => {
      // Instruct Renderer to Play.
      let nextStartTime = randomizeStartTime === true ? getStartTime() : primaryStartTime;
      mainWindow.webContents.send('play', nextStartTime );
      mainWindow.show();
      mainWindow.maximize();
    })

    // mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  ipcMain.on('finished', () => {
    mainWindow.hide();
  })

  ipcMain.on('ready-to-exit', () => {
    app.exit();
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function randomizeClickHandler(menuItem, browserWindow, event) {
  randomizeStartTime = menuItem.checked;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function exitClickHandler() {
  mainWindow.webContents.send("playout");
  mainWindow.show();
  mainWindow.maximize();
}

function getStartTime() {
  let randomNumber = getRandomInt(0, chorusStarts.length - 1);
  return chorusStarts[randomNumber];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}