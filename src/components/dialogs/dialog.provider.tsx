import { createContext, ReactNode, useState, useContext } from "react";

type DialogContent = { element: ReactNode; isOpen: boolean };
type DialogCreationFn = () => Promise<ReactNode> | ReactNode;

export type DialogVariant = "normal" | "page";
export type DialogProps = {
  variant?: DialogVariant;
};

const DialogContext = createContext<{
  addDialog: (fn: DialogCreationFn, props?: DialogProps) => Promise<void> | void;
  closeDialog: (index: number) => Promise<void> | void;
  dialogs: { ctx: DialogContent; props: DialogProps }[];
} | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogStack, setDialogStack] = useState<
    { ctx: DialogContent; props: DialogProps }[]
  >([]);

  const addDialog = async (fn: DialogCreationFn, props?: DialogProps) => {
    const resolvedElement = {
      element: await fn(),
      isOpen: true,
    } as unknown as DialogContent;
    setDialogStack((prev) => [
      ...prev,
      { ctx: resolvedElement, props: props ?? { variant: "page" } },
    ]);
  };

  const closeDialog = (index: number) => {
    setDialogStack((prev) =>
      prev.map((dialog, i) =>
        i === index
          ? { ...dialog, ctx: { ...dialog.ctx, isOpen: false } }
          : dialog
      )
    );
  };

  return (
    <DialogContext.Provider value={{ addDialog, closeDialog, dialogs: dialogStack }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialogManager = () => {
  const ctx = useContext(DialogContext);

  if (!ctx) {
    throw Error("useDialogManager can only be used withing a DialogProvider");
  }

  return ctx;
};
