"use client";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalStyles } from "@mui/material";
import theme from "../theme";
import StoreProvider from "@/providers/StoreProvider";
import NavigationSidebar from "@/components/Navigation/NavigationSidebar";
import { Box } from "@mui/material";

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
            <StoreProvider>
              <Box
                sx={{
                  display: "flex",
                  height: "100vh",
                  bgcolor: "background.default",
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                }}
              >
                <NavigationSidebar />
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {children}
                </Box>
              </Box>
            </StoreProvider>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
