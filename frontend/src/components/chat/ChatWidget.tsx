import {
  Avatar,
  Badge,
  Box,
  Chip,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useSendChatMessage } from "@/api/support";
import { extractApiError } from "@/lib/axios";
import { useT, useFormatPrice } from "@/i18n";
import type { ChatReferencedProduct } from "@/types/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  products?: ChatReferencedProduct[];
}

let nextId = 1;

export default function ChatWidget({ productId }: { productId?: string }) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const { chatOpen, setChatOpen } = useUiStore();
  const sendMessage = useSendChatMessage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    { id: nextId++, role: "assistant", text: t.chat.welcome },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  if (!isAuth) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;
    setInput("");

    const userMsg: Message = { id: nextId++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    sendMessage.mutate(
      { message: text, product_id: productId },
      {
        onSuccess: (data) => {
          const assistantMsg: Message = {
            id: nextId++,
            role: "assistant",
            text: data.reply,
            products:
              data.referenced_products?.length > 0
                ? data.referenced_products
                : undefined,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        },
        onError: (err) => {
          const msg = extractApiError(err, "Servis trenutno nije dostupan. Pokušajte ponovo za trenutak.");
          setMessages((prev) => [
            ...prev,
            { id: nextId++, role: "assistant", text: msg },
          ]);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {}
      {!chatOpen && (
        <Fab
          color="primary"
          onClick={() => setChatOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {}
      {chatOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: { xs: "calc(100% - 32px)", sm: 380 },
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            overflow: "hidden",
            zIndex: 1300,
          }}
        >
          {}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "primary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              sx={{
                "& .MuiBadge-badge": { bgcolor: "#22c55e", border: "2px solid #4f46e5" },
              }}
            >
              <SmartToyIcon />
            </Badge>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">{t.chat.title}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {t.chat.subtitle}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setChatOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              bgcolor: "#f8fafc",
              maxHeight: 360,
            }}
          >
            {messages.map((msg) => (
              <Stack
                key={msg.id}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                {msg.role === "assistant" && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", mt: 0.5 }}>
                    <SmartToyIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2.5,
                      bgcolor: msg.role === "user" ? "primary.main" : "#fff",
                      color: msg.role === "user" ? "#fff" : "text.primary",
                      border: msg.role === "assistant" ? "1px solid" : "none",
                      borderColor: "divider",
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}
                  </Box>
                  {msg.products && msg.products.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t.chat.relatedProducts}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                        {msg.products.map((p) => (
                          <Chip
                            key={p.id}
                            label={`${p.name} · ${formatPrice(p.price)}`}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setChatOpen(false);
                              navigate(`/products/${p.id}`);
                            }}
                            sx={{ cursor: "pointer" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
                {msg.role === "user" && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#64748b", mt: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
              </Stack>
            ))}
            {sendMessage.isPending && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {t.chat.thinking}
                </Typography>
              </Stack>
            )}
            <div ref={bottomRef} />
          </Box>

          {}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#fff",
            }}
          >
            <InputBase
              fullWidth
              multiline
              maxRows={3}
              placeholder={t.chat.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ fontSize: 14 }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
