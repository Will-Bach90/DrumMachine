const bleStatus = $("#connectionStatus");
const button = $(".connect");
const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const charUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
let connected = false;

button.on("click", function() {
  if(!connected)
  {
    connect();
  } else {
    disconnect();
  }
});

let deviceCache = null;
let characteristicCache = null;

function connect() {
  return(deviceCache ? Promise.resolve(deviceCache) : 
      requestBluetoothDevice()).
      then(device => {
        connectDeviceAndCache(device);
        bleStatus.text("CONNECTED");
        connected = true;
      }).
      catch(error => {
        bleStatus.text("IDLE");
        connected = false;
      });
}

function requestBluetoothDevice() {
  return navigator.bluetooth.requestDevice({
    filters: [{services: [serviceUUID]}],
    optionalServices: [serviceUUID, charUUID],
  }).
      then(device => {
        deviceCache = device;
        deviceCache.addEventListener('gattserverdisconnected',
          handleDisconnection);
          return deviceCache;
      });
}

function handleDisconnection(event) {
  let device = event.target;

  connectDeviceAndCache(device).
    catch(error => {
      bleStatus.text("IDLE");
      connected = false;
      log(error);
    });
}

function connectDeviceAndCache(device) {
  if(device.gatt.connected && characteristicCache) {
    return Promise.resolve(characteristicCache);
  }

  return device.gatt.connect().
    then(server => {
      return server.getPrimaryService(serviceUUID);
    }).
    then(service => {
      return service.getCharacteristic(charUUID);
    }).
    then(characteristic => {
      characteristicCache = characteristic;
      alert(characteristicCache);
      return characteristicCache;
    });
}

function disconnect() {
  if (deviceCache) {
    deviceCache.removeEventListener('gattserverdisconnected',
        handleDisconnection);
    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
    }
  }
  if (characteristicCache) {
    characteristicCache.removeEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
    characteristicCache = null;
  }
  connected = false;
  deviceCache = null;
  bleStatus.text("IDLE");
}

function send(data) {
  data = String(data);

  if (!data || !characteristicCache) {
    return;
  }

  data += '\n';

  if (data.length > 20) {
    let chunks = data.match(/(.|[\r\n]){1,20}/g);

    writeToCharacteristic(characteristicCache, chunks[0]);

    for (let i = 1; i < chunks.length; i++) {
      setTimeout(() => {
        writeToCharacteristic(characteristicCache, chunks[i]);
      }, i * 100);
    }
  }
  else {
    writeToCharacteristic(characteristicCache, data);
  }
}

function writeToCharacteristic(characteristic, data) {
  characteristic.writeValue(new TextEncoder().encode(data));
}

const buttons = new Array(32);
for(var i = 0; i < 32; i++) {
    buttons[i] = false;
}

const keyCodes = ["X", 'Y', 'Z', '[', '\\', ']', '^', '_',
                  '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
                  'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
                  'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
for(var i = 0; i < 32; i++){
    document.querySelectorAll(".lines")[i].addEventListener("click", function() {
      var n = parseInt($(this).attr("id")) - 1;
      if(!buttons[n]) {
          $(this).addClass("lines-pressed");
          buttons[n] = true;
      } else {
          $(this).removeClass("lines-pressed");
          buttons[n] = false;
      }
      writeToCharacteristic(characteristicCache, keyCodes[n]);
      console.log(characteristicCache);
  });
}