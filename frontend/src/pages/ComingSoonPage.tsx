import { Container } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";

export default function ComingSoonPage({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <Container sx={{ py: 8 }}>
      <EmptyState
        icon={<ConstructionIcon fontSize="inherit" />}
        title={title}
        description="Ova funkcionalnost stiže u narednoj fazi razvoja."
        actionLabel="Nazad na početnu"
        onAction={() => navigate("/")}
      />
    </Container>
  );
}
