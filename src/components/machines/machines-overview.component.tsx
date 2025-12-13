import { MachineOverviewItem } from "./machines-overview-item.component";
import { useMachines } from "./machines.provider";

export const MachinesOverview = () => {
  const { machines } = useMachines();

  return (
    <div className="flex flex-col flex-1 w-full h-full space-y-4 px-4 py-4">
      {machines.map((m) => (
        <MachineOverviewItem machine={m} />
      ))}
    </div>
  );
};
