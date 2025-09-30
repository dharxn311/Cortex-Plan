import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { MainLayout } from "./components/MainLayout";
import { ExamsPage } from "./pages/ExamsPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { Toaster } from "./components/ui/sonner";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "exams", element: <ExamsPage /> },
      { path: "subjects", element: <SubjectsPage /> },
      { path: "calendar", element: <CalendarPage /> },
    ]
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors closeButton />
    </ErrorBoundary>
  </StrictMode>,
)