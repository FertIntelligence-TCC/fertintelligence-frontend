import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { PublicRoutes } from "./routes/Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserStore } from "./stores/user/user.store";

function App() {
  const user = useUserStore((state) => state.user);

  const router = createBrowserRouter([
    ...PublicRoutes,
    {
      path: "*",
      element: (
        <Navigate
          to={
            user ? "/fertintelligence/home" : "/fertintelligence"
          }
          replace
        />
      ),
    },
  ]);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15000,
      },
    },
  });

  return (
      <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
      </QueryClientProvider>
  );
}

export default App;