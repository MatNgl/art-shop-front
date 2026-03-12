import { useState } from "react";

interface ConfirmInput {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  type?: "text" | "number";
  min?: number;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  input?: ConfirmInput;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: string | boolean) => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    resolve: null,
  });

  function confirm(options: ConfirmOptions): Promise<string | boolean> {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        resolve,
      });
    });
  }

  function handleConfirm(value?: string) {
    state.resolve?.(value ?? true);
    setState({ open: false, title: "", resolve: null });
  }

  function handleCancel() {
    state.resolve?.(false);
    setState({ open: false, title: "", resolve: null });
  }

  return {
    modalProps: {
      open: state.open,
      title: state.title,
      description: state.description,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      variant: state.variant,
      input: state.input,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    confirm,
  };
}
