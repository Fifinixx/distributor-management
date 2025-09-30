import { useState } from "react";

import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";
import { Spinner } from "../../../ui/shadcn-io/spinner";

import { toast } from "sonner";

import { CompanyComboBox } from "../companies-combobox";
import ProductsComboBox from "../products-combobox";
import ShopsComboBox from "../shops-combobox";
import SalesOrderList from "./sales-order-list";
import { useAppContext } from "../../../../app-context";

export default function NewSales() {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  const {_id} = useAppContext();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filterBySupplier, setFilterBySupplier] = useState({
    id: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [existingStock, setExistingStock] = useState(0);
  const [shops, setShops] = useState([]);
  const [inputs, setInputs] = useState({
    shopName: "",
    shop_id: "",
    supplier_id: "",
    product_id: "",
    productId: "",
    gst: "",
    gstAmount: "",
    companyName: "",
    productName: "",
    qty: "",
    salePrice: "",
    discount: "",
    discountAmount: "",
    total: "",
  });
  function handleErrors(inputs) {
    let error = 0;
    switch (true) {
      case !inputs.shopName:
        error = 1;
        toast.error("Please select a Shop");
        break;
      case !inputs.companyName:
        error = 1;
        toast.error("Please select a supplier");
        break;
      case !inputs.productName:
        error = 1;
        toast.error("Please select a product");
        break;
      case !inputs.salePrice || inputs.salePrice <= 0:
        error = 1;
        toast.error("Please check price");
        setInputs((prev) => {
          return { ...prev, salePrice: "", qty: "" };
        });
        break;
      case inputs.qty >
        products.find((product) => product._id === inputs.product_id).stock ||
        !inputs.qty ||
        inputs.qty === 0:
        error = 1;
        setInputs((prev) => {
          return { ...prev, qty: "" };
        });
        toast.error("Check stock before adding!");
        break;
      case orders.filter((item) => item.productId === inputs.productId).length >
        0:
        error = 1;
        toast.error("Product already exists!");
        break;
      case !orders.every((item) => item.shopName === inputs.shopName):
        error = 1;
        toast.error("Please select one shop at a time");
        break;
    }
    return error;
  }
  function addToOrder(inputs) {
    const gstAmount = inputs.salePrice * (inputs.gst / 100).toFixed(2);
    const discountAmount = (
     ( inputs.salePrice -
      gstAmount) * (inputs.discount / 100)
    ).toFixed(2);
    if (handleErrors(inputs) === 0) {
      setOrders((prev) => {
        return [
          ...prev,
          {
            ...inputs,
            gstAmount: gstAmount,
            discountAmount: discountAmount,
            total:
              (((inputs.salePrice - discountAmount) -
                inputs.salePrice * (inputs.gst / 100) +
                gstAmount) *
              inputs.qty).toFixed(2),
          },
        ];
      });
    }
  }
  function removeFromOrder(id) {
    if (id) {
      setOrders((prev) => prev.filter((item) => item.productId != id));
    }
  }

  async function createOrder() {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/dashboard/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user:_id,
          shop_id: inputs.shop_id,
          products: [...orders],
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Sale order placed");
        setLoading(false);
        setOrders([]);
        setInputs({
          shopName: "",
          shop_id: "",
          supplier_id: "",
          product_id: "",
          productId: "",
          gst: "",
          companyName: "",
          productName: "",
          qty: "",
          salePrice: "",
          total: "",
          discount: "",
        });
        setFilterBySupplier({ id: "", name: "" });
      } else {
        const error = await res.json();
        toast.error(error.message);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toast.error("Failed to create a sale order");
      console.log(e);
    }
  }
  return (
    <>
      <div className="flex flex-col gap-6 items-center w-full container">
        <h1 className="text-xl ">
          CREATE NEW SALE ORDER
        </h1>
        <div className="flex w-full  flex-col gap-2 container lg:flex-row lg:items-center lg:justify-center">
          <ShopsComboBox
            inputs={inputs}
            shops={shops}
            setShops={setShops}
            setInputs={setInputs}
          />
          <CompanyComboBox
            filterBySupplier={filterBySupplier}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            setFilterBySupplier={setFilterBySupplier}
            text="SELECT A SUPPLIER"
            setInputs={setInputs}
            products={products}
          />
          <ProductsComboBox
            setExistingStock={setExistingStock}
            filterBySupplier={filterBySupplier}
            products={products}
            setProducts={setProducts}
            setInputs={setInputs}
            text={
              filterBySupplier
                ? "Please Select a supplier"
                : "Please select a product"
            }
          />
          <Input
            placeholder="Sale price"
            type="number"
            value={inputs.salePrice}
            onChange={(e) =>
              setInputs((prev) => {
                return { ...prev, salePrice: e.target.value };
              })
            }
            className="w-full lg:w-[100px]"
          />

          <Input
            type="number"
            placeholder="Quantity"
            className="w-full lg:w-[100px]"
            value={inputs.qty}
            onChange={(e) =>
              setInputs((prev) => {
                return { ...prev, qty: e.target.value };
              })
            }
          />
          <Input
            type="number"
            placeholder="Discount"
            className="w-full lg:w-[100px]"
            value={inputs.discount}
            onChange={(e) =>
              setInputs((prev) => {
                return { ...prev, discount: Number(e.target.value) };
              })
            }
          />
          <Button
            onClick={() => addToOrder(inputs)}
            className="w-full lg:w-[100px]"
          >
            ADD
          </Button>
        </div>
        <div className=" flex bg-secondary rounded-md container w-full flex-col items-center justify-center py-6 px-4 gap-4">
          {orders.length !== 0 && (
            <>
              <div className="flex justify-center items-center gap-2">
                <Button disabled={loading} onClick={() => setOrders([])}>RESET</Button>
                <Button disabled={loading} onClick={createOrder}>
                  {loading ? <Spinner /> : "CREATE ORDER"}
                </Button>
              </div>
            </>
          )}
          <SalesOrderList
            orders={orders}
            setOrder={setOrders}
            removeFromOrder={removeFromOrder}
          />
        </div>
      </div>
    </>
  );
}
