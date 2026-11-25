import { Box } from "@mui/material";
import { Outlet, useMatch } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Layout() {
  
  const productMatch = useMatch("/products/:id");
  const productId = productMatch?.params.id;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ChatWidget productId={productId} />
    </Box>
  );
}
