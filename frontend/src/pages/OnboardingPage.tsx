import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/api/categories";
import { useUpdatePreferences } from "@/api/users";
import { useUiStore } from "@/stores/uiStore";
import { useT, useLocalized } from "@/i18n";

export default function OnboardingPage() {
  const t = useT();
  const l = useLocalized();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const updatePrefs = useUpdatePreferences();
  const notify = useUiStore((s) => s.notify);
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const save = () => {
    updatePrefs.mutate(selected, {
      onSuccess: () => {
        notify("Interesovanja sačuvana");
        navigate("/");
      },
      onError: () => notify(t.common.error, "error"),
    });
  };

  return (
    <Container sx={{ py: 8 }} maxWidth="sm">
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: "1px solid", borderColor: "divider" }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 3, textAlign: "center" }}>
          <AutoAwesomeIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4">{t.onboarding.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t.onboarding.subtitle}
          </Typography>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1.25} justifyContent="center">
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

        <Box sx={{ mt: 4, display: "flex", gap: 1.5 }}>
          <Button fullWidth variant="text" onClick={() => navigate("/")}>
            {t.onboarding.skip}
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={selected.length === 0 || updatePrefs.isPending}
            onClick={save}
          >
            {t.onboarding.save}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
