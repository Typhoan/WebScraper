// Modules to control application life and create native browser window
const electron = require("electron");
const path = require("path");
const url = require("url");
const crawler = require("./crawlers/crawlerEngine");
var validUrl = require('valid-url');

// SET ENV
process.env.NODE_ENV = "production";

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

var TestMode = true;
var Muted = false;
var urlKey = "";

var UrlDictionary = {
  NeweggUrl: "https://www.newegg.com/p/pl?d=amd+ryzen+9&N=601359163%20100007671%208000",
  BestBuyUrl:"https://www.bestbuy.com/site/promo/amd-ryzen-5000"
};

app.on("ready", function () {
  // Create new window
  mainWindow = new BrowserWindow({
    height: 900,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // Load html in window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // Quit app when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow(setting) {
  var title = "Update " + setting + " URL";

  addWindow = new BrowserWindow({
    width: 700,
    height: 200,
    title: title,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  addWindow.setMenu(null);
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "settingWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  addWindow.webContents.once("dom-ready", function(){
      addWindow.webContents.send("URL:Set", UrlDictionary[urlKey]);
  });

  // Handle garbage collection
  addWindow.on("close", function () {
    urlKey = "";
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on("URL:Update", function (e, url) {
  if(validUrl.isUri(url)){
    UrlDictionary[urlKey] = url;
    addWindow.close();
  }

  
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //addWindow = null;
});

ipcMain.on("Product:Update", async function (e) {
  var products = await crawler.GetProducts(UrlDictionary, TestMode);
  e.sender.send("Product:Update", products, Muted);
});

ipcMain.on("Toggle:TestMode", async function (e) {
  TestMode = !TestMode;
  e.sender.send("Toggle:TestMode", TestMode);
});

ipcMain.on("Toggle:Mute", async function (e) {
  Muted = !Muted;
  e.sender.send("Toggle:Mute", Muted);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Create menu template
const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Update Urls",
    submenu: [
      {
        label: "Update Newegg URL",
        click() {
          urlKey = "NeweggUrl";
          createAddWindow("Newegg");
        },
      },
      {
        label: "Update BestBuy URL",
        click() {
          urlKey = "BestBuyUrl";
          createAddWindow("BestBuy");
        },
      }
    ]
  }
  ,
];

// If OSX, add empty object to menu
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        role: "reload",
      },
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
    ],
  });
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
