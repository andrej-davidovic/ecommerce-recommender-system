import {
  Box,
  Button,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import CheckIcon from "@mui/icons-material/Check";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { format, parseISO } from "date-fns";
import {
  useActivateUser,
  useAdminUsers,
  useApproveUser,
  useDeactivateUser,
} from "@/api/admin";
import { useUiStore } from "@/stores/uiStore";
import LoadingState from "@/components/common/LoadingState";
import AdminNav from "@/components/layout/AdminNav";
import { useT } from "@/i18n";

export default function AdminUsersPage() {
  const t = useT();
  const { data: users, isLoading } = useAdminUsers();
  const approve = useApproveUser();
  const deactivate = useDeactivateUser();
  const activate = useActivateUser();
  const notify = useUiStore((s) => s.notify);

  const handleApprove = (id: string) =>
    approve.mutate(id, { onSuccess: () => notify(t.admin.approved) });
  const handleDeactivate = (id: string) =>
    deactivate.mutate(id, { onSuccess: () => notify(t.admin.deactivated) });
  const handleActivate = (id: string) =>
    activate.mutate(id, { onSuccess: () => notify(t.admin.activated) });

  if (isLoading) return <LoadingState />;

  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: t.auth.fullName,
      flex: 1,
      minWidth: 150,
    },
    { field: "email", headerName: t.auth.email, flex: 1, minWidth: 200 },
    {
      field: "role",
      headerName: t.admin.role,
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value === "admin" ? "Admin" : "Korisnik"}
          color={params.value === "admin" ? "primary" : "default"}
        />
      ),
    },
    {
      field: "is_approved",
      headerName: t.admin.status,
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={
            !params.row.is_active
              ? t.admin.inactive
              : params.value
                ? t.admin.active
                : t.admin.pendingApprovals
          }
          color={
            !params.row.is_active
              ? "error"
              : params.value
                ? "success"
                : "warning"
          }
        />
      ),
    },
    {
      field: "created_at",
      headerName: t.admin.createdAt,
      width: 130,
      renderCell: (params) =>
        format(parseISO(params.value as string), "dd.MM.yyyy."),
    },
    {
      field: "actions",
      headerName: "",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        if (row.role === "admin") return null;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {!row.is_approved && (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => handleApprove(row.id)}
              >
                {t.admin.approve}
              </Button>
            )}
            {row.is_active ? (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => handleDeactivate(row.id)}
              >
                {t.admin.deactivate}
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<LockOpenIcon />}
                onClick={() => handleActivate(row.id)}
              >
                {t.admin.activate}
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <AdminNav />
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t.admin.users}
      </Typography>
      <Box sx={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={users ?? []}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            "& .MuiDataGrid-cell": { py: 1 },
          }}
        />
      </Box>
    </Container>
  );
}
