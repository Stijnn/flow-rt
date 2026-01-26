import { useDialogManager } from "./dialog.provider";
import { NormalDialogWrapper } from "./normal-dialog.component";
import { PageDialogWrapper } from "./page-dialog.component";

export const DialogRenderer = () => {
  const { dialogs, closeDialog } = useDialogManager();

  return (
    <>
      {dialogs.map((node, index) =>
        node.props.variant === "page" ? (
          <PageDialogWrapper
            key={index}
            isOpen={node.ctx.isOpen}
            onRequestClose={async () => {
              closeDialog(index);
            }}
          >
            {node.ctx.element}
          </PageDialogWrapper>
        ) : (
          <NormalDialogWrapper
            key={index}
            isOpen={node.ctx.isOpen}
            onRequestClose={async () => {
              closeDialog(index);
            }}
          >
            {node.ctx.element}
          </NormalDialogWrapper>
        )
      )}
    </>
  );
};
