import { createTheme } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import { Vazirmatn } from "next/font/google";

const vazirmatn = Vazirmatn({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: vazirmatn.style.fontFamily,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 500 },
  },
  palette: {
    primary: {
      main: blue[500],
    },
    tonalOffset: 0.5,
  },
});

export default theme;
