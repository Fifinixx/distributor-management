import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  formatDate,
  formatCurrency,
  capitalize,
} from "../../../../../lib/utils";
import { ToWords } from "to-words";

import NotoSans from "../../../../../assets/fonts/NotoSans-Regular.ttf";

Font.register({
  family: "NotoSans",
  src: NotoSans,
});

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 30,
    backgroundColor: "#fdfdfd",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#0d47a1",
  },
  address: {
    fontSize: 10,
    maxWidth: 150,
  },
  contact: {
    fontSize: 10,
    maxWidth: 150,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d47a1",
    color: "white",
    padding: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  table: {
    marginTop: 30,
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
  },
  col1: { width: "4%", fontFamily: "NotoSans" },
  col3: { width: "40%", textAlign: "center", fontFamily: "NotoSans" },
  col4: { width: "10%", textAlign: "center", fontFamily: "NotoSans" },
  col5: { width: "12%", textAlign: "center", fontFamily: "NotoSans" },
  col6: { width: "10%", textAlign: "center", fontFamily: "NotoSans" },
  col7: { width: "12%", textAlign: "center", fontFamily: "NotoSans" },
  col8: { width: "12%", textAlign: "center", fontFamily: "NotoSans" },
  col9: { width: "12%", textAlign: "right", fontFamily: "NotoSans" },

  totalBox: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    backgroundColor: "#ffeb3b",
    padding: 8,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    fontWeight: "bold",
    fontSize: 12,
  },
  totalValue: {
    backgroundColor: "#fbc02d",
    padding: 8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: "NotoSans",
  },
  billInWords: {
    fontSize: 10,
    fontWeight: "bold",
  },
  billInWordsAmount: {
    fontSize: 11,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBox: {
    borderTopWidth: 1,
    borderColor: "#000",
    width: 150,
    textAlign: "center",
    paddingTop: 4,
    fontSize: 10,
  },
});

export default function Invoice({ order }) {
  function numberToWords(num) {
    const toWords = new ToWords({
      localeCode: "en-IN",
      converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
      },
    });
    return toWords.convert(num);
  }
  return (
    <Document>
      <Page size="A4" style={styles.page}>
          <View
            style={{
              textAlign: "center",
              fontSize: 15,
              marginBottom: 28,
              color: "#0d47a1",
            }}
          >
            <Text>INVOICE</Text>
          </View>
          <View style={styles.header}>
            <View style={{ flexDirection: "column", gap: 4 }}>
              <Text style={styles.bold}>MAA TARA TRADERS</Text>
              <Text>SINDRI, JHARKHAND, 826001</Text>
              <Text>Contact: +9123446966</Text>
              <Text>Invoice no: {order.id}</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4 }}>
              <Text style={{fontWeight:"bold"}}>Issued to</Text>
              <Text>{(order.shop_id.name).toUpperCase()}</Text>
              <Text style={styles.address}>{order.shop_id.address}</Text>
              <Text style={styles.contact}>+{order.shop_id.contact}</Text>
              <Text>Date: {formatDate(order.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.table}>
          <View>
            <View style={styles.tableHeader} fixed>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col3}>Product</Text>
              <Text style={styles.col4}>MRP</Text>
              <Text style={styles.col5}>Price/unit</Text>
              <Text style={styles.col7}>Discount</Text>
              <Text style={styles.col8}>GST%</Text>
              <Text style={styles.col6}>Qty</Text>
              <Text style={styles.col9}>Total</Text>
            </View>
              {order.products.map((product, index) => (
                <View key={product._id}  style={styles.tableRow}>
                  <Text style={styles.col1}>{index + 1}</Text>
                  <Text style={styles.col3}>
                    {product.supplier_id.name.charAt(0).toUpperCase() +
                      product.supplier_id.name.slice(1) +
                      " "}
                    {product.product_id.name.charAt(0).toUpperCase() +
                      product.product_id.name.slice(1)}
                  </Text>
                  <Text style={styles.col4}>
                    {formatCurrency(product.product_id.mrp.$numberDecimal)}
                  </Text>
                  <Text style={styles.col5}>
                    {formatCurrency(product.salePrice.$numberDecimal)}
                  </Text>
                  <Text style={styles.col7}>
                    {formatCurrency(product.discountAmount.$numberDecimal)} (
                    {product.discount ? product.discount : 0}%)
                  </Text>
                  <Text style={styles.col8}>
                    {formatCurrency(product.gstAmount.$numberDecimal)} (
                    {product.gst}%)
                  </Text>
                  <Text style={styles.col6}>{product.qty}</Text>
                  <Text style={styles.col9}>
                    {formatCurrency(product.total.$numberDecimal)}
                  </Text>
                </View>
              ))}
              
          </View>

          </View>
          <View style={styles.totalBox}>
            <View style={{ flexDirection: "column", width: 280 }}>
              <Text style={styles.billInWords}>Invoice Amount in Words:</Text>
              <Text style={styles.billInWordsAmount}>
                {numberToWords(order.grandTotal.$numberDecimal)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.totalLabel}>
                <Text>Grand Total</Text>
              </View>
              <View style={styles.totalValue}>
                <Text>{formatCurrency(order.grandTotal.$numberDecimal)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.signatureBox}>Authorized Signatory</Text>
          </View>
      </Page>
    </Document>
  );
}
