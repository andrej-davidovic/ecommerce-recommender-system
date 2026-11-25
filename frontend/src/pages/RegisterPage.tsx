import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { useRegister } from "@/api/auth";
import { useCategories } from "@/api/categories";
import { extractApiError } from "@/lib/axios";
import { useT, useLocalized } from "@/i18n";

const schema = z.object({
  full_name: z.string().min(2, "Unesite ime i prezime"),
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(6, "Lozinka mora imati bar 6 karaktera"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useT();
  const l = useLocalized();
  const register_ = useRegister();
  const { data: categories } = useCategories();
  const [selected, setSelected] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const toggleCategory = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const onSubmit = (values: FormValues) => {
    register_.mutate(
      { ...values, category_ids: selected },
      { onSuccess: () => setDone(true) },
    );
  };

  if (done) {
    return (
      <AuthLayout title={t.auth.registerTitle} subtitle="">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
          <Alert severity="info">{t.auth.pendingApproval}</Alert>
          <Button component={RouterLink} to="/login" variant="contained" fullWidth>
            {t.auth.loginLink}
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {register_.isError && (
            <Alert severity="error">
              {extractApiError(register_.error, t.common.error)}
            </Alert>
          )}
          <TextField
            label={t.auth.fullName}
            fullWidth
            autoFocus
            error={!!errors.full_name}
            helperText={errors.full_name?.message}
            {...register("full_name")}
          />
          <TextField
            label={t.auth.email}
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label={t.auth.password}
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {t.auth.selectInterests}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t.auth.selectInterestsHint}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              {categories?.map((c) => (
                <Chip
                  key={c.id}
                  label={l(c, "name")}
                  onClick={() => toggleCategory(c.id)}
                  color={selected.includes(c.id) ? "primary" : "default"}
                  variant={selected.includes(c.id) ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={register_.isPending}
          >
            {t.auth.registerButton}
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
        {t.auth.haveAccount}{" "}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          {t.auth.loginLink}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
