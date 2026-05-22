import { BleManager, Device } from 'react-native-ble-plx';

class BluetoothManager {
  manager: BleManager;

  constructor() {
    this.manager = new BleManager();
  }

  startScan(onDeviceFound: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("SCAN ERROR:", error);
        return;
      }

      if (device) {
        onDeviceFound(device);
      }
    });
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connectToDevice(deviceId: string) {
    return await this.manager.connectToDevice(deviceId);
  }
}

export const bluetooth = new BluetoothManager();
