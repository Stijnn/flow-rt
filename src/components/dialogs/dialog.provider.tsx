import { createContext, ReactNode, useState, useContext } from "react";
import { PageDialogWrapper } from "./page-dialog.component";

type DialogContent = { element: ReactNode; isOpen: boolean };
type DialogCreationFn = () => Promise<Element> | Element;

const DialogContext = createContext<{
  addDialog: (fn: DialogCreationFn) => Promise<void>;
} | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogStack, setDialogStack] = useState<DialogContent[]>([]);

  const addDialog = async (fn: DialogCreationFn) => {
    const resolvedElement = {
      element: await fn(),
      isOpen: true,
    } as unknown as DialogContent;
    setDialogStack((prev) => [...prev, resolvedElement]);
  };

  const closeDialog = (index: number) => {
    setDialogStack((prev) =>
      prev.map((dialog, i) =>
        i === index ? { ...dialog, isOpen: false } : dialog,
      ),
    );
  };

  return (
    <DialogContext.Provider value={{ addDialog }}>
      {children}
      {dialogStack.map((node, index) => (
        <PageDialogWrapper
          key={index}
          isOpen={node.isOpen}
          onRequestClose={async () => {
            closeDialog(index);
          }}
        >
          {node.element}
        </PageDialogWrapper>
      ))}
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
