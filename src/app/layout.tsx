"use client";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalStyles } from "@mui/material";
import theme from "../theme";
import StoreProvider from "@/providers/StoreProvider";

const clientSideEmotionCache = createEmotionCache();

const globalStyles = (
  <GlobalStyles
    styles={{
      "*": {
        boxSizing: "border-box",
      },
      html: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      body: {
        margin: 0,
        padding: 0,
        height: "100vh",
        overflow: "hidden",
      },
      "#__next": {
        height: "100vh",
      },
    }}
  />
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={theme.typography.fontFamily}>
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {globalStyles}
            <StoreProvider>{children}</StoreProvider>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
