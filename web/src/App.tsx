import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Main } from '@/pages/Main.tsx';
import { ThemeProvider } from "@/components/ThemeProvider"
import { IconProvider } from "@/components/IconProvider"

const router = createBrowserRouter([
  {
    path: "*",
    element: <Main />
  }
])

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <IconProvider>
        <RouterProvider router={router} />
      </IconProvider>
    </ThemeProvider>
  )
}

export default App
