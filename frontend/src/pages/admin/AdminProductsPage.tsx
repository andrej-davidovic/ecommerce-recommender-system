import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/api/products";
import { useDeleteProduct } from "@/api/admin";
import { useUiStore } from "@/stores/uiStore";
import LoadingState from "@/components/common/LoadingState";
import AdminNav from "@/components/layout/AdminNav";
import { useT, useFormatPrice, useLocalized } from "@/i18n";

export default function AdminProductsPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const l = useLocalized();
  const navigate = useNavigate();
  const { data, isLoading } = useProducts({ page: 1, page_size: 100 });
  const deleteProduct = useDeleteProduct();
  const notify = useUiStore((s) => s.notify);

  const handleDelete = (id: string) => {
    if (!confirm(t.admin.deleteProductConfirm)) return;
    deleteProduct.mutate(id, {
      onSuccess: () => notify(t.admin.productDeleted),
      onError: () => notify(t.common.error, "error"),
    });
  };

  if (isLoading) return <LoadingState />;

  const columns: GridColDef[] = [
    { field: "name", headerName: t.admin.productName, flex: 2, minWidth: 160 },
    {
      field: "price",
      headerName: t.admin.productPrice,
      flex: 1,
      minWidth: 100,
      renderCell: (params) => formatPrice(params.value as number),
    },
    {
      field: "category",
      headerName: t.admin.productCategory,
      flex: 1,
      minWidth: 110,
      valueGetter: (_value, row) => row.category ? l(row.category, "name") : "",
    },
    {
      field: "stock_quantity",
      headerName: t.admin.productStock,
      flex: 1,
      minWidth: 80,
      type: "number",
    },
    {
      field: "average_rating",
      headerName: "Ocena",
      flex: 0.7,
      minWidth: 70,
      renderCell: (params) =>
        params.value != null ? (params.value as number).toFixed(1) : "—",
    },
    {
      field: "actions",
      headerName: "",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t.admin.editProduct}>
            <IconButton
              size="small"
              onClick={() =>
                navigate(`/admin/products/${params.row.id}/edit`)
              }
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t.admin.deleteProduct}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id as string)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <AdminNav />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">{t.admin.products}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/products/new")}
        >
          {t.admin.addProduct}
        </Button>
      </Stack>
      <Box sx={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        />
      </Box>
    </Container>
  );
}
