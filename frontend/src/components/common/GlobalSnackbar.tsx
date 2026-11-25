import { Alert, Snackbar } from "@mui/material";
import { useUiStore } from "@/stores/uiStore";

export default function GlobalSnackbar() {
  const { snackbar, closeSnackbar } = useUiStore();
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={closeSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{ borderRadius: 2 }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
