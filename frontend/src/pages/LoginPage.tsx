import { Alert, Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { useLogin } from "@/api/auth";
import { extractApiError } from "@/lib/axios";
import { useT } from "@/i18n";

const schema = z.object({
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(1, "Unesite lozinku"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    login.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (user) => {
          const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
          if (user.role === "admin") navigate("/admin");
          else navigate(from ?? "/");
        },
      },
    );
  };

  return (
    <AuthLayout title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {login.isError && (
            <Alert severity="error">
              {extractApiError(login.error, t.auth.invalidCredentials)}
            </Alert>
          )}
          <TextField
            label={t.auth.email}
            type="email"
            fullWidth
            autoFocus
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
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={login.isPending}
          >
            {t.auth.loginButton}
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
        {t.auth.noAccount}{" "}
        <Link component={RouterLink} to="/register" fontWeight={600}>
          {t.auth.registerLink}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
