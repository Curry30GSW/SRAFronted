import { AppRoutes } from "./routes";
import { ThemeProvider } from "@/hooks/useTheme";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}