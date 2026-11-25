import { Box } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { useState } from "react";

interface Props {
  src: string | null;
  alt: string;
  
  ratio?: string;
  rounded?: boolean;
}

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 92%), hsl(${(h + 40) % 360} 70% 85%))`;
}

export default function ProductImage({ src, alt, ratio = "1 / 1", rounded }: Props) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
        borderRadius: rounded ? 3 : 0,
        background: gradientFor(alt),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <ImageOutlinedIcon sx={{ fontSize: 48, color: "rgba(15,23,42,0.25)" }} />
      )}
    </Box>
  );
}
