import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            fontSize: "1rem",
            borderRadius: "8px",
            padding: "1rem",
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
