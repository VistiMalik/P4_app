import { act, waitFor } from "@testing-library/react-native";
import { useBleScale } from "@features/ble/hooks/useBleScale";
import { renderHookWithProviders } from "./test-utils";
import { BleManager } from "react-native-ble-plx";

describe("useBleScale", () => {
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  jest.clearAllMocks();
});

  it("retorna dispositivos encontrados após escanear", async () => {
    const { result } = renderHookWithProviders(() => useBleScale());

    await act(async () => {
      await result.current.startScan();
    });

    await waitFor(() => {
      expect(result.current.devices.length).toBeGreaterThan(0);
    });
  });

  it("envia dados quando conectado a um dispositivo", async () => {
    const { result } = renderHookWithProviders(() => useBleScale());

    await act(async () => {
      await result.current.startScan();
    });

    await act(async () => {
      await result.current.connectToDevice("device-1");
    });

    await act(async () => {
      await result.current.sendWeighingData("papel");
    });

    const bleManagerMock = BleManager as unknown as jest.Mock;
    const instance = bleManagerMock.mock.results[0]?.value;

    expect(instance).toBeDefined();
    expect(instance.writeCharacteristicWithResponseForDevice).toHaveBeenCalled();
  });
});
