// main.js

const { app, BrowserWindow } = require('electron')
const path = require('path')
const HID = require("node-hid");
let mainWindow = null;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    })
    mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
        mainWindow.webContents.session.on('serial-port-added', (event, port) => {
            console.log('serial-port-added FIRED WITH', port)
        })

        mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
            console.log('serial-port-removed FIRED WITH', port)
        })

        event.preventDefault()
        if (portList && portList.length > 0) {
            callback(portList[0].portId)
        } else {
            callback('')
        }
    })
    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        if (permission === 'serial' && details.securityOrigin === 'file:///') {
            return true
        }
        return false
    })
    mainWindow.webContents.session.setDevicePermissionHandler((details) => {
        if (details.deviceType === 'serial' && details.origin === 'file://') {
            return true
        }

        return false
    })
    // Use react
    mainWindow.loadURL("http://localhost:3000")
    //Use the test.html page
    // mainWindow.loadURL(`file://${path.join(__dirname, "./test.html")}`)

    mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()
    openUsb()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    windowOpen = false;
    usbDetect.stopMonitoring();
    close_USB_Communication();
    device && device.close();
    app.quit();
})

/**
 * Check the insertion and removal of USB
 * 检测usb的插拔
 * {
        locationId: 0,
        vendorId: 5824,
        productId: 1155,
        deviceName: 'Teensy USB Serial (COM3)',
        manufacturer: 'PJRC.COM, LLC.',
        serialNumber: '',
        deviceAddress: 11
    }
    Compare the vid with the pid to confirm whether the unplugged device is the base device
    对比vid与pid来确认拔的是不是底座设备
 */
const usbDetect = require("usb-detection");
usbDetect.startMonitoring();
usbDetect.on("add", function (device) {
    console.log("add", device);
    mainWindow.webContents.send("usbDetect", true);
});
usbDetect.on("remove", function (device) {
    console.log("remove", device);
    mainWindow.webContents.send("usbDetect", false);

    if (
        device.vendorId === deviceUSB.vendorId &&
        device.productId === deviceUSB.productId
    ) {
        openUsb();
    }
});


/**
 * openUsb  
 * @dec Search whether the sled exists(搜索底座是否存在)
 */

let device = null, //usb所在的设备
    deviceUSB = { productId: -1, vendorId: -1 };
let windowOpen = true;
function openUsb() {
    //Search whether the base exists or not, and show it if it  does not exist
    let flog = false,
        path = "";
    let devices = HID.devices();
    device = null; //This must be cleaned up, or there will be exceptions if you exit(这里一定要清理一下，不然退出的话会有异常)
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].manufacturer === "wch.cn") {
            flog = true;
            path = devices[i].path;
            deviceUSB.vendorId = devices[i].vendorId;
            deviceUSB.productId = devices[i].productId;
            break;
        }
    }
    if (windowOpen) {
        //If you do not click Exit(如果没有点击退出)
        if (!flog) {
            deviceUSB = { productId: -1, vendorId: -1 };
            const timer = setTimeout(() => {
                openUsb();
                clearTimeout(timer);
            }, 2000);
            mainWindow.webContents.send("noUSB", true);
        } else {
            device = new HID.HID(path);
            device.on("data", (data) => {
                //Data sent from the monitoring base(监听底座发送过来的数据)
                let hex = data.toString("hex");
                let str = "",
                    dataArr = [];
                for (let i = 0; i < hex.length; i = i + 2) {
                    str += `${hex[i]}${hex[i + 1]} `;
                    dataArr.push(`${hex[i]}${hex[i + 1]}`);
                }
                let processedData = processed_data(dataArr);
                for (let i = 0; i < processedData.length; i++) {
                    const element = processedData[i];
                    //Send qualified data to the rendering end
                    mainWindow.webContents.send("sned", element);
                }

            });
            device.on("error", function (err) {
                console.log(err);
            });
            open_USB_Communication();

            mainWindow.webContents.send("noUSB", false);
        }
    }
}

/**
 * Open the Bluetooth communication of the base USB(打开底座usb的蓝牙通信)
 */
function open_USB_Communication() {
    device.write([0x00, 0xaa, 0x04, 0x36, 0x11, 0x23, 0x55]);
}
/**
 * Turn off the Bluetooth communication of the base USB(关闭底座usb的蓝牙通信)
 */
function close_USB_Communication() {
    device && device.write([0x00, 0xaa, 0x04, 0x36, 0x00, 0x32, 0x55]);
}
/**
 * Process the received data(对接收的数据进行处理)
 */

function processed_data(arr) {
    let j,
        newArr = [],
        trueArr = [],
        length = arr.length;


    for (let i = 0; i < length; i++) {
        if (arr[i] === "aa") {
            j = i;
            let dataLength = parseInt(arr[j + 1], 16);
            if (arr[dataLength + 1] === "55" || arr[dataLength + 1] === "00") {
                for (; j <= dataLength + 1 + i; j++) {
                    newArr.push(parseInt(arr[j], 16));
                }

                if (check(newArr) === newArr[newArr.length - 2]) {
                    trueArr.push(newArr);
                    newArr = [];
                    break;
                } else {
                    newArr = [];
                }
            }
        }
    }
    return trueArr;
}
//校验数据是否有误
function check(arr) {
    if (arr.length < 3) {
        return;
    }
    let i;
    let checkFloag = arr[1];

    for (i = 2; i < arr.length - 2; i++) {
        checkFloag = checkFloag ^ arr[i];
    }
    return checkFloag;
}