import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { Home } from "./views/Home/Home.jsx";
import { Presentation } from "./views/Home/Presentation.jsx";
import { Page404 } from "./views/Home/Page404.jsx";
import { Admin } from "./views/Admin/Admin.jsx";
import { GlobalAdminView } from "./views/Admin/GlobalAdminView.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Presentation />,
  },
  {
    path: "/:seed",
    element: <Home />,
  },
  {
    path: "/:seed/admin",
    element: <Admin />,
  },
  {
    path: "/admin",
    element: <GlobalAdminView />,
  },
  {
    path: "*", // 👈 Captura todas las rutas no definidas
    element: <Page404 />, // 👈 Tu componente 404
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
