import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BleManager,
  Characteristic,
  Device,
  Subscription
} from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";
import { Buffer } from "buffer";
import { useToast } from "@components/ui/ToastProvider";
import { useAuthContext } from "@features/auth/context/AuthContext";
import {
  SERVICE_UUID,
  COMMAND_CHAR_UUID,
  USER_INFO_CHAR_UUID,
  WEIGHT_DATA_CHAR_UUID,
  DEVICE_NAME_PREFIX
} from "../bleConfig";

type ConnectionStatus = "idle" | "scanning" | "connecting" | "connected";

export const useBleScale = () => {
  const toast = useToast();
  const { user } = useAuthContext();

  const managerRef = useRef(new BleManager());
  const monitorSubscriptionRef = useRef<Subscription | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [isWeightStable, setIsWeightStable] = useState(false);
  const [weightVariation, setWeightVariation] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      monitorSubscriptionRef.current?.remove();
      managerRef.current.destroy();
    };
  }, []);

  const handleError = useCallback(
    (message: string) => {
      setErrorMessage(message);
      toast.show(message);
    },
    [toast]
  );

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      const apiLevel = Number(Platform.Version);
      if (apiLevel >= 31) {
        const scanGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Permissão de Bluetooth",
            message: "Precisamos do Bluetooth para encontrar a balança.",
            buttonPositive: "Permitir"
          }
        );
        const connectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: "Conectar à balança",
            message: "Permita conectar para enviar os dados.",
            buttonPositive: "Permitir"
          }
        );

        return (
          scanGranted === PermissionsAndroid.RESULTS.GRANTED &&
          connectGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      }

      const fineLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Localização necessária",
          message: "Precisamos da localização para usar o Bluetooth.",
          buttonPositive: "Permitir"
        }
      );

      return fineLocation === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }, []);

  const startScan = useCallback(async () => {
    setErrorMessage(null);
    const permissionGranted = await requestPermissions();

    if (!permissionGranted) {
      handleError("Permissão de Bluetooth é necessária.");
      return;
    }

    setStatus("scanning");
    setDevices([]);

    managerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        handleError("Falha ao buscar dispositivos.");
        setStatus("idle");
        managerRef.current.stopDeviceScan();
        return;
      }

      if (device && device.name && device.name.includes(DEVICE_NAME_PREFIX)) {
        setDevices((current) => {
          if (current.find((d) => d.id === device.id)) return current;
          return [...current, device];
        });
      }
    });

    setTimeout(() => {
      managerRef.current.stopDeviceScan();
      if (status === "scanning") {
        setStatus("idle");
      }
    }, 10000);
  }, [handleError, requestPermissions, status]);

  const connectToDevice = useCallback(
    async (deviceId: string) => {
      try {
        setStatus("connecting");
        setErrorMessage(null);
        managerRef.current.stopDeviceScan();

        const device = await managerRef.current.connectToDevice(deviceId);
        await device.discoverAllServicesAndCharacteristics();
        setConnectedDevice(device);
        setStatus("connected");
        toast.show("Conectado à balança!");

      } catch (error) {
        console.warn("Erro na conexão BLE:", error);
        handleError("Não foi possível conectar.");
        setStatus("idle");
      }
    },
    [handleError, toast]
  );

  const disconnect = useCallback(async () => {
    if (connectedDevice) {
      monitorSubscriptionRef.current?.remove();
      monitorSubscriptionRef.current = null;
      try {
        await managerRef.current.cancelDeviceConnection(connectedDevice.id);
      } catch (error) {
        console.warn("Erro ao desconectar:", error);
      }
      setConnectedDevice(null);
      setStatus("idle");
      setLastWeight(null);
    }
  }, [connectedDevice]);

  const sendUserInfo = useCallback(async (materialId: string) => {
    if (!connectedDevice) return;
    try {
      const userId = user?.id || "NO_USER";
      // Format: USER:id;MAT:material
      const rawString = `USER:${userId};MAT:${materialId}`;
      // const encoded = Buffer.from(rawString, "utf-8").toString("base64"); 
      // react-native-ble-plx expects base64
      // Wait, does it? Yes.
      const encoded = Buffer.from(rawString).toString("base64");

      await managerRef.current.writeCharacteristicWithResponseForDevice(
        connectedDevice.id,
        SERVICE_UUID,
        USER_INFO_CHAR_UUID,
        encoded
      );
      console.log("User info sent:", rawString);
    } catch (e) {
      console.error("Error sending user info", e);
      handleError("Erro ao enviar dados do usuário.");
      throw e;
    }
  }, [connectedDevice, user, handleError]);

  const startWeighing = useCallback(async () => {
    console.log("[useBleScale] startWeighing called");
    console.log("[useBleScale] connectedDevice:", connectedDevice?.id);
    if (!connectedDevice) {
      console.log("[useBleScale] No connected device, returning");
      return;
    }
    try {
      setIsWeightStable(false);
      setLastWeight(null);
      setWeightVariation(null);
      const encoded = Buffer.from("START").toString("base64");
      console.log("[useBleScale] Sending START command (base64):", encoded);
      await managerRef.current.writeCharacteristicWithResponseForDevice(
        connectedDevice.id,
        SERVICE_UUID,
        COMMAND_CHAR_UUID,
        encoded
      );
      console.log("[useBleScale] START command sent successfully");
      // Start monitoring weight
      monitorSubscriptionRef.current?.remove();
      monitorSubscriptionRef.current = connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        WEIGHT_DATA_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Weight monitor error", error);
            return;
          }
          if (characteristic?.value) {
            const val = Buffer.from(characteristic.value, "base64").toString("utf-8");
            console.log("Weight data received:", val);

            // Handle error messages from ESP32
            if (val.startsWith("ERROR:")) {
              console.error("Scale error:", val);
              return;
            }

            // Parse format: "STABLE:1.234:0.005" or "UNSTABLE:1.234:0.035"
            // Also supports old format: "STABLE:1.234" or "UNSTABLE:1.234"
            let weight: number;
            if (val.includes(":")) {
              const parts = val.split(":");
              setIsWeightStable(parts[0] === "STABLE");
              weight = parseFloat(parts[1]);
              if (parts.length >= 3) {
                const variation = parseFloat(parts[2]);
                if (!isNaN(variation)) {
                  setWeightVariation(variation);
                }
              }
            } else {
              weight = parseFloat(val);
            }

            if (!isNaN(weight)) {
              setLastWeight(weight);
            }
          }
        }
      );

    } catch (e) {
      console.error("Error starting weighing", e);
      handleError("Erro ao iniciar pesagem.");
      throw e;
    }
  }, [connectedDevice, handleError]);

  const confirmResult = useCallback(async () => {
    if (!connectedDevice) return;
    try {
      const encoded = Buffer.from("CONFIRM_RESULT").toString("base64");
      await managerRef.current.writeCharacteristicWithResponseForDevice(
        connectedDevice.id,
        SERVICE_UUID,
        COMMAND_CHAR_UUID,
        encoded
      );
      toast.show("Peso validado! Aguardando confirmação...");

      // Stop monitoring? Or wait for OK?
      // The ESP sends OK via notification on COMMAND char or we just assume success if no error.
      // For now, let's assume success if write works, but ideally we monitor command char too.

    } catch (e) {
      console.error("Error confirming result", e);
      handleError("Erro ao validar peso.");
      throw e;
    }
  }, [connectedDevice, handleError, toast]);

  return {
    devices,
    connectedDevice,
    status,
    lastWeight,
    isWeightStable,
    weightVariation,
    errorMessage,
    startScan,
    connectToDevice,
    disconnect,
    sendUserInfo,
    startWeighing,
    confirmResult
  };
};
