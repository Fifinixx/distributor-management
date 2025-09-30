import ProfitChart from "./components/home/profit-chart";
import LowStockAlert from "./components/home/low-stock-alert";
import { RecentPurchases } from "./components/home/recent-purchase";
import { RecentSales } from "./components/home/recent-sales";
import InventorySnap from "./components/home/inventory.snap";
import Performance from "./performance";
export default function HomePage() {
  return (
    <>
    <h1 className="text-xl  mb-6">Home</h1>
      <div className="container grid grid-cols-1 gap-2 lg:grid-cols-2">
          <InventorySnap />
          <Performance />
        <div className="col-span-1 lg:col-span-2">
          <ProfitChart />
        </div>
        <LowStockAlert />
        <RecentPurchases />
        <RecentSales />
      </div>
    </>
  );
}
