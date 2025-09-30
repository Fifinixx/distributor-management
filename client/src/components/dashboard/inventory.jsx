import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

import { toast } from "sonner";
import { Spinner } from "../ui/shadcn-io/spinner";

import Search from "./components/inventory/search";
import { CompanyComboBox } from "./components/companies-combobox";
import { ProductList } from "./services/products";
import { AddProductDialog } from "./components/inventory/add-product-dialog";
import DeleteConfirmModal from "./components/delete-confirm-modal";
import PaginationComponent from "./components/inventory/pagination";
import DamageGoodsDialog from "./components/inventory/damage-products";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/Label";

import { formatCurrency, capitalize } from "../../lib/utils";

import { Trash2 } from "lucide-react";
import { RiFileDamageFill } from "react-icons/ri";
import { useAppContext } from "../../app-context";

export default function Inventory() {
  const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [addProductModal, setAddProductModal] = useState(false);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [addSupplierInput, setAddSupplierInput] = useState({
    name: "",
    stock: "",
    gst: "",
    mrp: "",
  });
  const [loadingTable, setLoadingTable] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterBySupplier, setFilterBySupplier] = useState({
    id: searchParams.get("filterBySupplierId") || "",
    name: searchParams.get("filterBySupplierName") || "",
  });
  const [page, setPage] = useState(searchParams.get("page") || "1");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stockFilter, setStockFilter] = useState({
    inStock: false,
    outOfStock: false,
  });
  const [error, setError] = useState("");
  const { _id } = useAppContext();

  async function handleAddProduct(e, filterBySupplier) {
    e.preventDefault();
    const supplier = filterBySupplier.id;
    const name = addSupplierInput.name;
    const gst = addSupplierInput.gst;
    const mrp = addSupplierInput.mrp;
    if (!supplier || !name || !gst || !mrp) {
      toast.error("Fields cannot be empty.");
      return;
    }
    setAddProductLoading(true);
    try {
      const res = await fetch(`${baseUrl}/dashboard/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: _id,
          supplier: supplier,
          name: name,
          gst: gst,
          mrp: mrp,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setAddProductLoading(false);
        toast.success(
          `${filterBySupplier.name} ${name} has been added succesfully to your inventory.`
        );
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.message);
        setAddProductLoading(false);
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to add product");
    }
  }
  async function deleteProducts(ids) {
    try {
      const res = await fetch(`${baseUrl}/dashboard/product`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids, user: _id }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setSelectedProducts((prev) =>
          prev.filter((item) => !ids.includes(item))
        );
      }else{
        toast.error("Failed to delete product(s)");
      }
      fetchProducts();
    } catch (e) {
      toast.error("Failed to delete product(s)");
      console.log(e);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    setLoadingTable(true);
    try {
      const res = await ProductList(
        page,
        search,
        filterBySupplier,
        true,
        stockFilter
      );
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data.products);
      } else {
        const data = await res.json();
        console.log(data.message);
        toast.error("Error while fetching products");
      }
      setLoading(false);
      setLoadingTable(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
      setLoadingTable(false);
      toast.error("Error while fetching products");
    }
  }
  useEffect(() => {
    fetchProducts();
  }, [
    page,
    filterBySupplier,
    search,
    searchParams,
    stockFilter.inStock,
    stockFilter.outOfStock,
  ]);
  return (
    <>
      <div className="container flex flex-col gap-6">
        <h1 className="text-center text-xl ">INVENTORY</h1>
        <div className="flex flex-col container w-full gap-2  lg:flex-row items-center justify-center">
          <Search setSearch={setSearch} search={search} />
          <CompanyComboBox
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            filterBySupplier={filterBySupplier}
            setFilterBySupplier={setFilterBySupplier}
            setPage={setPage}
            text="FILTER BY SUPPLIER..."
          />
          <div className="flex justify-center items-center gap-2">
            <div className="flex justify-center items-center gap-2">
              <Checkbox
                checked={stockFilter.inStock}
                id="instock"
                onCheckedChange={(checked) =>
                  setStockFilter((prev) => ({ ...prev, inStock: checked }))
                }
              />
              <Label htmlFor="instock">In stock</Label>
            </div>
            <div className="flex justify-center items-center gap-2">
              <Checkbox
                checked={stockFilter.outOfStock}
                id="outofstock"
                onCheckedChange={(checked) =>
                  setStockFilter((prev) => ({ ...prev, outOfStock: checked }))
                }
              />
              <Label htmlFor="outofstock">Out of stock</Label>
            </div>
          </div>
          <AddProductDialog
            addProductModal={addProductModal}
            setAddProductModal={setAddProductModal}
            companies={filteredProducts.map((item) => {
              return {
                id: item.id,
                company: item.company,
                label: item.company?.company?.toUpperCase(),
              };
            })}
            setAddSupplierInput={setAddSupplierInput}
            addProduct={handleAddProduct}
            error={error}
            setError={setError}
            addProductLoading={addProductLoading}
          />
          <DeleteConfirmModal
            deleteOrders={deleteProducts}
            ids={selectedProducts}
            text="This action cannot be undone. This will permanently delete your
            stock from the database."
            icon="DELETE SELECTED"
          />
        </div>

        <div className="container mx-auto p-2 border-[0.1px] rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
                  <Checkbox
                    checked={
                      selectedProducts.length === filteredProducts.length &&
                      filteredProducts.length !== 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProducts(
                          filteredProducts.map((item) => item._id)
                        );
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  PRODUCT ID
                </TableHead>
                <TableHead className="text-center ">SUPPLIER</TableHead>
                <TableHead className="text-center">PRODUCT</TableHead>
                <TableHead className="text-center">STOCK</TableHead>
                <TableHead className="text-center">MRP</TableHead>
                <TableHead className="text-center">BUY AVG</TableHead>
                <TableHead className="text-center">DELETE</TableHead>
                <TableHead className="text-center">DAMAGE</TableHead>
              </TableRow>
            </TableHeader>

            {loadingTable ? (
              <TableBody>
                <TableRow className="text-center">
                  <TableCell className="text-center" colSpan={8}>
                    <div className="flex justify-center items-center">
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : filteredProducts.length === 0 ? (
              <TableBody>
                <TableRow className="text-center">
                  <TableCell colSpan={8}>No Products found</TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow className="text-center" key={product._id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts((prev) => [
                              ...prev,
                              product._id,
                            ]);
                          } else {
                            setSelectedProducts((prev) =>
                              prev.filter((id) => id !== product._id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium hidden sm:table-cell">
                      {product.id}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                      {capitalize(product.supplier.name)}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[100px] sm:max-w-[250px]">
                      {capitalize(product.name)}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {formatCurrency(product.mrp.$numberDecimal)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(product.avgPrice.$numberDecimal)}
                    </TableCell>
                    <TableCell>
                      <DeleteConfirmModal
                        icon={<Trash2 />}
                        text="This action cannot be undone. This will permanently delete your
            stock from the database."
                        deleteOrders={deleteProducts}
                        ids={[product._id]}
                      />
                    </TableCell>
                    <TableCell>
                      <DamageGoodsDialog
                        fetchProducts={fetchProducts}
                        _id={product._id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
        <PaginationComponent
          page={page}
          totalPages={products.totalPages}
          setPage={setPage}
          setFilteredProducts={setFilteredProducts}
        />
      </div>
    </>
  );
}
