import { ReactNode } from "react";
import { Dialog, DialogContent } from "../ui/dialog";

export const PageDialogWrapper = ({
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
      <DialogContent className="min-w-[calc(100vw-8rem)] min-h-[calc(100vh-8rem)]">
        {children}
      </DialogContent>
    </Dialog>
  );
};
