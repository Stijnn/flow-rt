import { MachinesOverview } from "../machines/machines-overview.component";
import { MachinesProvider } from "../machines/machines.provider";

export const MachinesPage = () => {
  return (
    <MachinesProvider>
      <MachinesOverview />
    </MachinesProvider>
  );
};
