import { ReactNode } from "react";
import { Dialog, DialogContent } from "../ui/dialog";

export const NormalDialogWrapper = ({
  isOpen,
  onRequestClose,
  children,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  children: ReactNode;
}) => {
  return (
    <Dialog
      modal={true}
      open={isOpen}
      onOpenChange={(s) => !s && onRequestClose()}
    >
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  );
};
