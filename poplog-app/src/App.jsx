import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          className: "poplog-toast",
          success: {
            iconTheme: {
              primary: "var(--success)",
              secondary: "var(--bg-elevated)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--danger)",
              secondary: "var(--bg-elevated)",
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
