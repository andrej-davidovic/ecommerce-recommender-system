import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "@/api/products";
import { useCategories } from "@/api/categories";
import { useCreateProduct, useUpdateProduct } from "@/api/admin";
import { useUiStore } from "@/stores/uiStore";
import { extractApiError } from "@/lib/axios";
import LoadingState from "@/components/common/LoadingState";
import { useT, useLocalized } from "@/i18n";

const schema = z.object({
  name: z.string().min(1, "Naziv je obavezan"),
  name_sr: z.string().optional(),
  description: z.string().min(1, "Opis je obavezan"),
  description_sr: z.string().optional(),
  price: z.coerce.number().positive("Cena mora biti veća od 0"),
  image_url: z.string().optional(),
  category_id: z.coerce.number().int().positive("Izaberite kategoriju"),
  stock_quantity: z.coerce.number().int().min(0, "Količina ne može biti negativna"),
  tag_names_str: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminProductFormPage() {
  const t = useT();
  const l = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useUiStore((s) => s.notify);
  const isEdit = !!id;
  const { data: product, isLoading: loadingProduct } = useProduct(
    isEdit ? id : undefined,
  );
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: isEdit && product
      ? {
          name: product.name,
          name_sr: product.name_sr ?? "",
          description: product.description,
          description_sr: product.description_sr ?? "",
          price: product.price,
          image_url: product.image_url ?? "",
          category_id: product.category.id,
          stock_quantity: product.stock_quantity,
          tag_names_str: product.tags.map((t) => t.name).join(", "),
        }
      : undefined,
  });

  if (isEdit && loadingProduct) return <LoadingState />;

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      name_sr: values.name_sr || undefined,
      description: values.description,
      description_sr: values.description_sr || undefined,
      price: values.price,
      image_url: values.image_url || undefined,
      category_id: values.category_id,
      stock_quantity: values.stock_quantity,
      tag_names: (values.tag_names_str ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const mutate = isEdit
      ? () => updateProduct.mutateAsync({ id: id!, payload })
      : () => createProduct.mutateAsync(payload);

    mutate()
      .then(() => {
        notify(t.admin.productSaved);
        navigate("/admin/products");
      })
      .catch((err) => notify(extractApiError(err, t.common.error), "error"));
  };

  const isPending = createProduct.isPending || updateProduct.isPending;
  const mutError = createProduct.error ?? updateProduct.error;

  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin/products")}
        color="inherit"
        sx={{ mb: 2 }}
      >
        {t.admin.products}
      </Button>

      <Paper
        elevation={0}
        sx={{ p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          {isEdit ? t.admin.editProduct : t.admin.addProduct}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            {mutError && (
              <Alert severity="error">
                {extractApiError(mutError, t.common.error)}
              </Alert>
            )}
            <TextField
              label={`${t.admin.productName} (EN)`}
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label={`${t.admin.productName} (SR)`}
              fullWidth
              {...register("name_sr")}
            />
            <TextField
              label={`${t.admin.productDescription} (EN)`}
              fullWidth
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description")}
            />
            <TextField
              label={`${t.admin.productDescription} (SR)`}
              fullWidth
              multiline
              rows={4}
              {...register("description_sr")}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t.admin.productPrice}
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
                {...register("price")}
              />
              <TextField
                label={t.admin.productStock}
                type="number"
                fullWidth
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity?.message}
                {...register("stock_quantity")}
              />
            </Stack>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.category_id}>
                  <InputLabel>{t.admin.productCategory}</InputLabel>
                  <Select label={t.admin.productCategory} {...field}>
                    {categories?.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {l(c, "name")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <TextField
              label={t.admin.productImage}
              fullWidth
              placeholder="https://..."
              {...register("image_url")}
            />
            <TextField
              label={t.admin.productTags}
              fullWidth
              placeholder="wireless, premium, bestseller"
              error={!!errors.tag_names_str}
              helperText={errors.tag_names_str?.message}
              {...register("tag_names_str")}
            />

            <Stack direction="row" spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isPending}
              >
                {t.common.save}
              </Button>
              <Button
                onClick={() => navigate("/admin/products")}
                color="inherit"
                size="large"
              >
                {t.common.cancel}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
