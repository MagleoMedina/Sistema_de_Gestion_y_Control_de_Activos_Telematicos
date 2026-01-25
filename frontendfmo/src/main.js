const { app, BrowserWindow } = require('electron');
const path = require('path');

// 1. Iniciar el servidor Express
// Al requerir el archivo, el servidor comienza a escuchar en el puerto 3000
const { PORT, HOST } = require('./server'); 

// 2. Configuración de Hot Reload
// Esto recarga la ventana si cambias un HTML/EJS, 
// y reinicia la app si cambias el código de Electron/Node (main.js o server.js)
if(!app.isPackaged){
try {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        awaitWriteFinish: true
    });
} catch (_) {}
}


function createWindow() {
    // Crear la ventana del navegador
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: 'icon.ico',
        webPreferences: {
            nodeIntegration: false, // Seguridad: False es recomendado al cargar URLs remotas/locales
            contextIsolation: true
        }
    });

    // Cargar la URL de Express usando HOST y PORT exportados
    mainWindow.loadURL(`http://${HOST}:${PORT}`);

    if (app.isPackaged) {
        mainWindow.setMenu(null);
    }
}
//app.disableHardwareAcceleration();
// Inicialización de Electron
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});