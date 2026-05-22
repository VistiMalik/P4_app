export class Device {
  constructor(public id: string, public name?: string) {}

  discoverAllServicesAndCharacteristics = jest.fn(async () => this);

  monitorCharacteristicForService = jest.fn(() => ({
    remove: jest.fn()
  }));
}

export const BleManager = jest.fn().mockImplementation(() => ({
  startDeviceScan: jest.fn((_uuids, _options, listener) => {
    listener?.(null, new Device("device-1", "Balança Demo"));
  }),
  stopDeviceScan: jest.fn(),
  connectToDevice: jest.fn(async (id: string) => new Device(id, "Balança Demo")),
  writeCharacteristicWithResponseForDevice: jest.fn(async () => ({})),
  cancelDeviceConnection: jest.fn(async () => ({})),
  destroy: jest.fn()
}));

export type Subscription = {
  remove: () => void;
};

export const Characteristic = jest.fn();
