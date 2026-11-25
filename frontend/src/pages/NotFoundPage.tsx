import { Container } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Container sx={{ py: 10 }}>
      <EmptyState
        icon={<SearchOffIcon fontSize="inherit" />}
        title="Stranica nije pronađena"
        description="Tražena stranica ne postoji ili je premeštena."
        actionLabel="Nazad na početnu"
        onAction={() => navigate("/")}
      />
    </Container>
  );
}
