const bleStatus = $("#connectionStatus");
const button = $(".connect");
const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const charUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
let connected = false;
let playing = false;

button.on("click", function() {
  if(!connected) {
    connect();
  } else {
    disconnect();
    connected = false;
  }
});

let deviceCache = null;
let characteristicCache = null;
let readBuffer = '';

function connect() {
  return(deviceCache ? Promise.resolve(deviceCache) : 
      requestBluetoothDevice()).
      then(device => {
        connectDeviceAndCache(device);
        bleStatus.text("CONNECTED");
        connected = true;
      }).
      then(characteristic => {
        startNotification(characteristic);
      }).
      catch(error => {
        bleStatus.text("FAILED");
        connected = false;
        console.log(error);
      });
}

function requestBluetoothDevice() {
  return navigator.bluetooth.requestDevice({
    filters: [{services: [serviceUUID]}],
    optionalServices: [serviceUUID, charUUID],
  }).
      then(device => {
        console.log('"' + device.name + '" bluetooth device selected');
        deviceCache = device;
        deviceCache.addEventListener("gattserverdisconnected",
          handleDisconnection);
          return deviceCache;
      });
}

function handleDisconnection(event) {
  let device = event.target;

  console.log('"' + device.name +
      '" bluetooth device disconnected, trying to reconnect...');

  connectDeviceAndCache(device).
    then(characteristic => startNotification(characteristic)).
    catch(error => {
      bleStatus.text("FAILED");
      connected = false;
      console.log(error);
    });
}

function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value);

  for (let c of value) {
    if (c === '\n') {
      let data = readBuffer.trim();
      readBuffer = '';

      if (data) {
        receive(data);
      }
    }
    else {
      readBuffer += c;
    }
  }
}

function receive(data) {
  console.log(data);
}

function connectDeviceAndCache(device) {
  if(device.gatt.connected && characteristicCache) {
    return Promise.resolve(characteristicCache);
  }

  console.log('Connecting to GATT server...');

  return device.gatt.connect().
    then(server => {
      console.log('GATT server connected, getting service...');
      return server.getPrimaryService(serviceUUID);
    }).
    then(service => {
      console.log('Service found, getting characteristic...');
      return service.getCharacteristic(charUUID);
    }).
    then(characteristic => {
      console.log('Characteristic found');
      characteristicCache = characteristic;
      return characteristicCache;
    });
}

function startNotification(characteristic) {
  console.log('Starting notifications...');

  if(characteristic != null)
  {
    return characteristic.startNotifications().
      then(() => {
        console.log('Notifications started');
        characteristic.addEventListener('characteristicvaluechanged',
            handleCharacteristicValueChanged);
      }).
      catch(error => {
        console.log(error);
      });
  }
}

function disconnect() {
  if (deviceCache) {
    console.log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
    deviceCache.removeEventListener('gattserverdisconnected',
        handleDisconnection);
    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
      console.log('"' + deviceCache.name + '" bluetooth device disconnected');
    } else {
      console.log('"' + deviceCache.name +
          '" bluetooth device is already disconnected');
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

const keyCodes = ['X', 'Y', 'Z', '[', '\\', ']', '^', '_',
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
      setTimeout(function (){
        send(keyCodes[n])
      }, 100);
  });
}

document.querySelector(".play").addEventListener("click", function() {
  if(!playing) {
    $(this).addClass("play-pressed");
    playing = true;
  } else {
    $(this).removeClass("play-pressed");
    playing = false;
  }
  setTimeout(function (){
    send('9')
  }, 100);
});
