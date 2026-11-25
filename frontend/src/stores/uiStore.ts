import { create } from "zustand";
import type { AlertColor } from "@mui/material";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface UiState {
  snackbar: SnackbarState;
  chatOpen: boolean;
  notify: (message: string, severity?: AlertColor) => void;
  closeSnackbar: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  snackbar: { open: false, message: "", severity: "success" },
  chatOpen: false,
  notify: (message, severity = "success") =>
    set({ snackbar: { open: true, message, severity } }),
  closeSnackbar: () =>
    set((s) => ({ snackbar: { ...s.snackbar, open: false } })),
  setChatOpen: (open) => set({ chatOpen: open }),
}));
