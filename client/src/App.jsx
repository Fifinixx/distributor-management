import "./App.css";

import AuthForm from "./components/auth-form";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ThemeProvider } from "./components/theme-provider.jsx";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "./components/ui/shadcn-io/spinner/index.jsx";

import Dashboard from "./components/dashboard/dashboard.jsx";
import Inventory from "./components/dashboard/inventory.jsx";
import Shops from "./components/dashboard/shops.jsx";
import Sales from "./components/dashboard/sales.jsx";
import HomePage from "./components/dashboard/home.jsx";
import Purchase from "./components/dashboard/purchase.jsx";
import Suppliers from "./components/dashboard/suppliers.jsx";
import NewPurchase from "./components/dashboard/components/purchase/new-purchase.jsx";
import History from "./components/dashboard/components/purchase/purchase-history.jsx";
import NewSales from "./components/dashboard/components/sales/new-sales.jsx";
import SaleOrderHistory from "./components/dashboard/components/sales/sale-history.jsx";
import Users from "./components/dashboard/users.jsx";
import Logs from "./components/logs.jsx";
import NotFound from "./404.jsx";

import { AppContext } from "./app-context.jsx";
import { useAppContext } from "./app-context.jsx";
import Reports from "./components/dashboard/reports.jsx";

function App() {
  return (
    <>
      <AppContext>
        <ThemeProvider defaultTheme="dark">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthForm />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="purchase" element={<Purchase />}>
                  <Route index element={<Navigate to="new" replace />} />
                  <Route path="new" element={<NewPurchase />} />
                  <Route path="history" element={<History />} />
                </Route>
                <Route path="sales" element={<Sales />}>
                  <Route index element={<Navigate to="new" replace />} />
                  <Route path="new" element={<NewSales />} />
                  <Route path="history" element={<SaleOrderHistory />} />
                </Route>
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="shops" element={<Shops />} />
                <Route path="reports" element={<Reports />} />
                <Route path="logs" element={<Logs />} />
                <Route path="users" element={<Users />} />
              </Route>
              <Route path="*" element={<NotFound />}></Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
        <Toaster richColors />
      </AppContext>
    </>
  );
}

export default App;
