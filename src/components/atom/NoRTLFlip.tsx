import { Box } from "@mui/material";
import { ReactNode } from "react";

interface NoRTLFlipProps {
  children: ReactNode;
}

export default function NoRTLFlip({ children }: NoRTLFlipProps) {
  return (
    <Box dir="ltr" sx={{ direction: "ltr" }}>
      {children}
    </Box>
  );
}
