import { useState } from "react";

import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Separator } from "../../../ui/separator";
import { Spinner } from "../../../ui/shadcn-io/spinner";

import { toast } from "sonner";

import { CompanyComboBox } from "../companies-combobox";
import ProductsComboBox from "../products-combobox";
import PurchaseOrderList from "./components/purchase-order-list";
import { useAppContext } from "../../../../app-context";

export default function NewPurchase() {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
  const {_id} = useAppContext()
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filterBySupplier, setFilterBySupplier] = useState({
    id: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    supplier_id: "",
    product_id: "",
    productId: "",
    companyName: "",
    productName: "",
    qty: "",
    price: "",
    amount: "",
    misc: "",
    total: 0,
    totalAmount: "",
    discount: "",
    discountAmount: "",
  });
  function handleErrors(inputs) {
    let error = 0;
    switch (true) {
      case !inputs.companyName:
        error = 1;
        toast.error("Please select a supplier");
        break;
      case !inputs.productName:
        error = 1;
        toast.error("Please select a product");
        break;
      case !inputs.amount || inputs.amount < 0:
        error = 1;
        toast.error("Please set amount");
        break;
      case inputs.qty === 0 || !inputs.qty || inputs.qty < 0:
        error = 1;
        toast.error("Please set qty");
        break;
      case orders.filter((item) => item.productId === inputs.productId).length >
        0:
        error = 1;
        toast.error("Product already exists!");
        break;
      case !orders.every((item) => item.supplier_id === filterBySupplier.id):
        error = 1;
        toast.error("Please select one supplier at a time");
        break;
    }
    return error;
  }
  function addExpenses() {
    if (inputs.misc) {
      setOrders((prev) =>
        prev.map((item) => ({
          ...item,
          price:
            Number(item.amount) +
            Number(
              (
                ((item.totalAmount /
                  prev.reduce((sum, item) => sum + item.totalAmount, 0)) *
                  inputs.misc) /
                item.qty
              ).toFixed(6)
            ),
          misc: Number(
            ((item.totalAmount /
              prev.reduce((sum, item) => sum + item.totalAmount, 0)) *
              inputs.misc) /
              item.qty
          ).toFixed(6),
          total:
            (Number(item.amount) +
              Number(
                (
                  ((item.totalAmount /
                    prev.reduce((sum, item) => sum + item.totalAmount, 0)) *
                    inputs.misc) /
                  item.qty
                ).toFixed(6)
              )) *
            Number(item.qty),
        }))
      );
    }
  }
  function addDamageDiscount() {
    let discountAmount;
    setOrders((prev) => {
      discountAmount = (
        (inputs.discount / 100) *
        Number(prev.reduce((sum, item) => sum + item.total, 0))
      ).toFixed(2);
      return [...prev];
    });


    setInputs((prev) => ({
      ...prev,
      discountAmount: Number(discountAmount),
    }));
  }
  function addToOrder(inputs) {
    if (handleErrors(inputs) === 0) {
      setOrders((prev) => [
        ...prev,
        {
          ...inputs,
          total:
            (Number(inputs.amount) + (inputs.misc ? Number(inputs.misc) : 0)) *
            inputs.qty,
          totalAmount: Number(inputs.amount) * Number(inputs.qty),
          price:
            Number(inputs.amount) + (inputs.misc ? Number(inputs.misc) : 0),
        },
      ]);
    }
    addExpenses();
    addDamageDiscount();
  }

  function resetInputs() {
    setFilterBySupplier({ id: "", name: "" });
    setInputs((prev) => {
      return { ...prev, qty: "", price: "", misc: "", amount: "", discount:"" };
    });
  }
  function removeFromOrder(id) {
    if (id) {
      setOrders((prev) => prev.filter((item) => item.productId != id));
    }
    addExpenses();
    addDamageDiscount();
  }

  async function createOrder() {
    resetInputs();
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/dashboard/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user:_id,
          supplier_id: filterBySupplier.id,
          paymentDone: 0,
          products: [...orders],
          discount:inputs.discount
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Purchase order placed");
        setLoading(false);
        setOrders([]);
        resetInputs();
      } else {
        const error = await res.json();
        toast.error(error.message);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }
  return (
    <>
      <div className="flex flex-col gap-6 items-center w-full container">
        <h1 className="text-xl">
          CREATE NEW PURCHASE ORDER
        </h1>
        <div className="flex w-full flex-col gap-2 container lg:flex-row lg:items-center lg:justify-center">
          <CompanyComboBox
            filterBySupplier={filterBySupplier}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            setFilterBySupplier={setFilterBySupplier}
            text="Please select a supplier"
            setInputs={setInputs}
            products={products}
          />
          <ProductsComboBox
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
            placeholder="Amount per item"
            type="number"
            value={inputs.amount}
            onChange={(e) =>
              setInputs((prev) => {
                return { ...prev, amount: e.target.value };
              })
            }
            className="w-full lg:w-[100px]"
          />

          <Input
            type="number"
            value={inputs.qty}
            placeholder="Quantity"
            className="w-full lg:w-[100px]"
            onChange={(e) =>
              setInputs((prev) => {
                return { ...prev, qty: e.target.value };
              })
            }
          />

          <Button
            onClick={() => addToOrder(inputs)}
            className="w-full lg:w-[100px]"
          >
            ADD
          </Button>
          <Button onClick={() => resetInputs()} className="w-full lg:w-[100px]">
            RESET
          </Button>
        </div>
        <div className=" flex bg-secondary rounded-md container w-full flex-col items-center justify-center py-6 gap-6 sm:px-2">
          {orders.length !== 0 && (
            <>
              <div className="flex flex-col justify-center items-center gap-4 lg:flex-row w-full lg:w-auto p-2">
                <div className="flex flex-col justify-center items-center gap-4  lg:flex-row w-full ">
                  <div className="flex justify-center items-center w-full lg:w-auto">
                    <Input
                      type="number"
                      value={inputs.misc}
                      placeholder="Expenses"
                      className="rounded-br-none rounded-tr-none w-[80%]"
                      onChange={(e) =>
                        setInputs((prev) => {
                          return { ...prev, misc: e.target.value };
                        })
                      }
                    />
                    <Button
                      onClick={addExpenses}
                      className="rounded-tl-none rounded-bl-none w-[20%]"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex justify-center items-center  w-full lg:w-auto">
                    <Input
                      type="number"
                      value={inputs.discount}
                      placeholder="Damage discount %"
                      className="rounded-br-none rounded-tr-none w-[80%]"
                      onChange={(e) =>
                        setInputs((prev) => {
                          return { ...prev, discount: e.target.value };
                        })
                      }
                    />
                    <Button
                      onClick={addDamageDiscount}
                      className="rounded-tl-none rounded-bl-none w-[20%]"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <Button
                  disabled={loading}
                  onClick={() => {
                    setOrders([]);
                    setInputs((prev) => ({ ...prev, misc: "", discount: "" }));
                  }}
                  className="w-full lg:w-auto"
                >
                  RESET
                </Button>
                <Button
                  disabled={loading}
                  className="w-full lg:w-auto"
                  onClick={createOrder}
                >
                  {loading ? <Spinner /> : "CREATE ORDER"}
                </Button>
              </div>
            </>
          )}
          <PurchaseOrderList
            grandTotal={inputs.grandTotal}
            inputs={inputs}
            orders={orders}
            setOrder={setOrders}
            removeFromOrder={removeFromOrder}
          />
        </div>
      </div>
    </>
  );
}
