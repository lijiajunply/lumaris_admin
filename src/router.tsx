import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import MapBrowsePage from "@/pages/public/map-browse";
import MapDetailPage from "@/pages/public/map-detail";
import SchoolListPage from "@/pages/public/school-list";
import LoginPage from "@/pages/admin/login";
import DashboardPage from "@/pages/admin/dashboard";
import MapManagementPage from "@/pages/admin/map-management";
import SchoolManagementPage from "@/pages/admin/school-management";
import NotFoundPage from "@/pages/not-found";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Navigate to="/map" replace /> },
      { path: "map", element: <MapBrowsePage /> },
      { path: "map/:id", element: <MapDetailPage /> },
      { path: "schools", element: <SchoolListPage /> },
    ],
  },
  {
    path: "admin/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "admin", element: <DashboardPage /> },
          { path: "admin/map", element: <MapManagementPage /> },
          { path: "admin/schools", element: <SchoolManagementPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <PublicLayout>
        <NotFoundPage />
      </PublicLayout>
    ),
  },
]);
