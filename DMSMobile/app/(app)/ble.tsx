import React, { useState } from "react";
import { Screen } from "@components/ui/Screen";
import { ScaleConnectionWizard } from "@features/ble/components/ScaleConnectionWizard";
import { WeighingModal } from "@features/ble/components/WeighingModal";
import { useCreateWeighing } from "@features/weighings/hooks/useCreateWeighing";
import { BleScaleProvider } from "@features/ble/context/BleScaleContext";

export default function BleScreen() {
  const [showWeighingModal, setShowWeighingModal] = useState(false);
  const createWeighing = useCreateWeighing();

  const handleConnectionComplete = () => {
    setShowWeighingModal(true);
  };

  const handleWeighingComplete = (weight: number, materialId: string) => {
    createWeighing.mutate({
      materialId,
      weightGrams: weight * 1000,
    });
  };

  return (
    <BleScaleProvider>
      <Screen appearance="dark">
        <ScaleConnectionWizard onConnectionComplete={handleConnectionComplete} />
        <WeighingModal
          visible={showWeighingModal}
          onClose={() => setShowWeighingModal(false)}
          onWeighingComplete={handleWeighingComplete}
        />
      </Screen>
    </BleScaleProvider>
  );
}
