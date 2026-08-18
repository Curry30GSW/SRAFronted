import { AppRoutes } from "./routes";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}