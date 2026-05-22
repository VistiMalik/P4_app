import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useScaleBle } from './useScaleBle';

export default function App() {
  type Screen = 'welcome' | 'connect' | 'weight';
  type Material = 'ALU' | 'STAAL' | 'PLAST';

  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [material, setMaterial] = useState<Material | null>(null);

  const {
    scanning,
    connectedDeviceId,
    currentWeight,
    isWeightStable,
    startScanForWeight,
    sendStartCommand,
    sendConfirmResult,
    resetAndMeasureAgain,
    stopScan,
  } = useScaleBle();

  const handleScan = () => {
    if (!selectedWeight) {
      console.log('Vaelg en vaegt foer scan');
      return;
    }
    if (!userId.trim()) {
      console.log('Indtast bruger-ID foer scan');
      return;
    }
    if (!material) {
      console.log('Vaelg materiale foer scan');
      return;
    }
    startScanForWeight(selectedWeight as 1 | 2 | 3, userId.trim(), material);
  };

  const handleConfirmResult = async () => {
    await sendConfirmResult();
    // Navigate back to connect screen after confirmation
    setScreen('connect');
  };

  const handleMeasureAgain = () => {
    resetAndMeasureAgain();
  };

  const isFormComplete = selectedWeight !== null && userId.trim() !== '' && material !== null;

  const handleStartWeight = () => {
    if (!connectedDeviceId) {
      console.log('Kan ikke starte – ingen vægt forbundet');
      return;
    }
    // Send START-kommando til ESP32 via BLE
    sendStartCommand();
    // Skift til vægt-skærmen
    setScreen('weight');
  };

  const renderStatusText = () => {
    if (scanning) return 'Scanner efter vægt...';
    if (connectedDeviceId) return `Forbundet til vægt\n(id: ${connectedDeviceId})`;
    if (selectedWeight) return `Klar til at forbinde til vægt ${selectedWeight}`;
    return 'Vælg en vægt for at forbinde';
  };

  const isStartEnabled = !!connectedDeviceId;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>AAU Vægt-system</Text>
        <View
          style={[
            styles.statusBadge,
            scanning
              ? styles.statusScanning
              : connectedDeviceId
              ? styles.statusConnected
              : styles.statusIdle,
          ]}
        >
          <Text style={styles.statusText}>
            {scanning
              ? 'Scanner'
              : connectedDeviceId
              ? 'Forbundet'
              : 'Ikke forbundet'}
          </Text>
        </View>
      </View>

      {/* MAIN CONTENT */}
      {screen === 'welcome' && (
        <View style={styles.card}>
          <Text style={styles.heading}>Velkommen 👋</Text>
          <Text style={styles.bodyText}>
            Forbind til en vægt for at starte en måling.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setScreen('connect')}
          >
            <Text style={styles.primaryButtonText}>Forbind til vægt</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === 'connect' && (
        <View style={styles.card}>
          <Text style={styles.heading}>Opsaetning</Text>
          <Text style={styles.bodyText}>{renderStatusText()}</Text>

          {/* Bruger-ID input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bruger-ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Indtast bruger-ID"
              placeholderTextColor="#666"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Materialevalg */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Materiale</Text>
            <View style={styles.weightRow}>
              {(['ALU', 'STAAL', 'PLAST'] as const).map((mat) => {
                const isSelected = material === mat;
                return (
                  <TouchableOpacity
                    key={mat}
                    style={[
                      styles.weightButton,
                      isSelected && styles.weightButtonSelected,
                    ]}
                    onPress={() => setMaterial(mat)}
                  >
                    <Text
                      style={[
                        styles.weightButtonText,
                        isSelected && styles.weightButtonTextSelected,
                      ]}
                    >
                      {mat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Vægtvalg */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Vaegt</Text>
            <View style={styles.weightRow}>
              {[1, 2, 3].map((num) => {
                const isSelected = selectedWeight === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.weightButton,
                      isSelected && styles.weightButtonSelected,
                    ]}
                    onPress={() => setSelectedWeight(num)}
                  >
                    <Text
                      style={[
                        styles.weightButtonText,
                        isSelected && styles.weightButtonTextSelected,
                      ]}
                    >
                      Vaegt {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Scan / forbind-knap */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isFormComplete && styles.primaryButtonDisabled,
            ]}
            onPress={handleScan}
            disabled={!isFormComplete || scanning}
          >
            <Text style={styles.primaryButtonText}>
              {scanning ? 'Scanner...' : 'Scan & forbind'}
            </Text>
          </TouchableOpacity>

          {/* Stop scanning knap - kun synlig under scanning */}
          {scanning && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={stopScan}
            >
              <Text style={styles.cancelButtonText}>Stop scanning</Text>
            </TouchableOpacity>
          )}

          {/* START vægt knap – kun når der er forbindelse */}
          <TouchableOpacity
            style={[
              styles.startButton,
              !isStartEnabled && styles.startButtonDisabled,
            ]}
            onPress={handleStartWeight}
            disabled={!isStartEnabled}
          >
            <Text style={styles.startButtonText}>
              {isStartEnabled ? 'START vægt' : 'Forbind først til en vægt'}
            </Text>
          </TouchableOpacity>

          {/* Tilbage */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setScreen('welcome');
              setSelectedWeight(null);
            }}
          >
            <Text style={styles.secondaryButtonText}>Tilbage</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === 'weight' && (
        <View style={styles.card}>
          <Text style={styles.heading}>Aktiv måling</Text>
          <Text style={styles.bodyText}>
            Live vægt-data fra den tilsluttede vægt (demo).
          </Text>

          <View style={styles.weightDisplayBox}>
            <Text style={styles.weightValue}>
              {currentWeight !== null ? currentWeight.toFixed(1) : '---'}
            </Text>
            <Text style={styles.weightUnit}>g</Text>
          </View>

          <Text style={styles.metaText}>
            Bruger: {userId || 'Ikke angivet'} {'\n'}
            Materiale: {material || 'Ikke angivet'}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isWeightStable && styles.primaryButtonDisabled,
            ]}
            onPress={handleConfirmResult}
            disabled={!isWeightStable}
          >
            <Text style={styles.primaryButtonText}>
              {isWeightStable ? 'Bekraeft maaling' : 'Venter paa stabil vaegt...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleMeasureAgain}
          >
            <Text style={styles.secondaryButtonText}>Maal igen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setScreen('connect')}
          >
            <Text style={styles.secondaryButtonText}>
              Tilbage til vægtvalg
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusIdle: {
    backgroundColor: '#444',
  },
  statusScanning: {
    backgroundColor: '#d97706', // orange-ish
  },
  statusConnected: {
    backgroundColor: '#16a34a', // green-ish
  },

  card: {
    flex: 1,
    backgroundColor: '#15151b',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  bodyText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },

  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1e1e26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: '#06b6d4', // cyan
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 16,
  },

  startButton: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#16a34a',
    opacity: 0.4,
  },
  startButtonText: {
    color: '#022c22',
    fontWeight: '700',
    fontSize: 16,
  },

  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '500',
    fontSize: 14,
  },

  cancelButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },

  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  weightButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 12,
    alignItems: 'center',
  },
  weightButtonSelected: {
    backgroundColor: '#0f172a',
    borderColor: '#06b6d4',
  },
  weightButtonText: {
    color: '#e5e7eb',
    fontWeight: '500',
  },
  weightButtonTextSelected: {
    color: '#a5f3fc',
    fontWeight: '700',
  },

  weightDisplayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  weightValue: {
    color: '#f9fafb',
    fontSize: 56,
    fontWeight: '800',
  },
  weightUnit: {
    color: '#9ca3af',
    fontSize: 20,
    marginTop: 4,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
});