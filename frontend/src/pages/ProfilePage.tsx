import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfile } from "@/api/users";
import { useUpdatePreferences } from "@/api/users";
import { useCategories } from "@/api/categories";
import { useUiStore } from "@/stores/uiStore";
import { extractApiError } from "@/lib/axios";
import { useT, useLocalized } from "@/i18n";

const schema = z.object({
  full_name: z.string().min(2, "Unesite ime i prezime"),
  email: z.string().email("Unesite ispravnu email adresu"),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const t = useT();
  const l = useLocalized();
  const user = useAuthStore((s) => s.user);
  const notify = useUiStore((s) => s.notify);
  const updateProfile = useUpdateProfile();
  const updatePrefs = useUpdatePreferences();
  const { data: categories } = useCategories();
  const savedCategoryIds = user?.category_ids ?? [];
  const [selected, setSelected] = useState<number[]>(savedCategoryIds);

  const hasPrefsChanged =
    selected.length !== savedCategoryIds.length ||
    selected.some((id) => !savedCategoryIds.includes(id));

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
    },
  });

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const onSubmitProfile = (values: FormValues) => {
    updateProfile.mutate(values, {
      onSuccess: () => notify(t.profile.saved),
      onError: (err) => notify(extractApiError(err, t.common.error), "error"),
    });
  };

  const savePreferences = () => {
    updatePrefs.mutate(selected, {
      onSuccess: (updatedUser) => {
        setSelected(updatedUser.category_ids);
        notify(t.profile.interestsSaved);
      },
      onError: () => notify(t.common.error, "error"),
    });
  };

  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <PersonIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h4">{t.profile.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t.profile.subtitle}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t.profile.personalInfo}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmitProfile)}
              noValidate
            >
              <Stack spacing={2.5}>
                {updateProfile.isError && (
                  <Alert severity="error">
                    {extractApiError(updateProfile.error, t.common.error)}
                  </Alert>
                )}
                <TextField
                  label={t.auth.fullName}
                  fullWidth
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
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isDirty || updateProfile.isPending}
                  >
                    {t.common.save}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {t.profile.interests}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t.profile.interestsHint}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mb: 3 }}>
              {categories?.map((c) => (
                <Chip
                  key={c.id}
                  label={l(c, "name")}
                  onClick={() => toggle(c.id)}
                  color={selected.includes(c.id) ? "primary" : "default"}
                  variant={selected.includes(c.id) ? "filled" : "outlined"}
                  sx={{ px: 1, py: 2.25, fontSize: 15 }}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              disabled={!hasPrefsChanged || updatePrefs.isPending}
              onClick={savePreferences}
            >
              {t.common.save}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
