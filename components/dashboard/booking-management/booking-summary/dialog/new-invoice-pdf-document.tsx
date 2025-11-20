import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 15,
  },
});

// Format currency for PDF
const formatCurrency = (amount: number, currency: string = "IDR"): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// New Invoice Data Type
export interface NewInvoiceData {
  invoiceNumber: string;
  companyName: string;
  agentName: string;
  agentEmail: string;
  hotelName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  invoiceDate: string;
  subBookingId: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    total_before_promo: number;
  }>;
  totalPrice: number;
  totalBeforePromo: number;
  promo: {
    promo_code?: string;
    [key: string]: any;
  };
}

// Main PDF Document Component for New Invoice Format
export const NewInvoicePDFDocument: React.FC<{
  invoice: NewInvoiceData;
}> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Company Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>
            PT. World Travel Marketing Bali
          </Text>
          <Text style={{ fontSize: 10, color: "#666", lineHeight: 1.4 }}>
            Ikat Plaza Building - Jl. Bypass Ngurah Rai No. 505{"\n"}
            Pemogan - Denpasar Selatan{"\n"}
            80221 Denpasar - Bali - Indonesia
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 5 }}>
            Invoice
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            #{invoice.invoiceNumber}
          </Text>
        </View>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Bill To Section */}
      <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 10 }}>
        Bill To:
      </Text>

      {/* Billing and Invoice Details Grid */}
      <View style={{ flexDirection: "row", marginBottom: 30 }}>
        {/* Bill To */}
        <View style={{ flex: 1, marginRight: 20 }}>
          <Text style={{ fontSize: 11, marginBottom: 2 }}>
            {invoice.companyName}
          </Text>
          <Text style={{ fontSize: 11, marginBottom: 2 }}>
            {invoice.agentName}
          </Text>
          <Text style={{ fontSize: 11 }}>{invoice.agentEmail}</Text>
        </View>

        {/* Booking Details */}
        <View style={{ flex: 1, marginRight: 20 }}>
          <View style={{ marginBottom: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>Villa</Text>
              <Text style={{ fontSize: 10 }}>{invoice.hotelName}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>Guest Name</Text>
              <Text style={{ fontSize: 10 }}>{invoice.guestName}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>Check-In</Text>
              <Text style={{ fontSize: 10 }}>{invoice.checkInDate}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>Invoice Date</Text>
              <Text style={{ fontSize: 10 }}>{invoice.invoiceDate}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>
                Sub Booking ID
              </Text>
              <Text style={{ fontSize: 10 }}>{invoice.subBookingId}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>Check-Out</Text>
              <Text style={{ fontSize: 10 }}>{invoice.checkOutDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Items Table */}
      <View
        style={{
          width: "auto",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#e5e7eb",
          marginBottom: 20,
        }}
      >
        {/* Table Header */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#f9fafb",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
          }}
        >
          <View
            style={{
              width: "8%",
              padding: 8,
              borderRightWidth: 1,
              borderRightColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>No.</Text>
          </View>
          <View
            style={{
              width: "36%",
              padding: 8,
              borderRightWidth: 1,
              borderRightColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              Description
            </Text>
          </View>
          <View
            style={{
              width: "12%",
              padding: 8,
              borderRightWidth: 1,
              borderRightColor: "#e5e7eb",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>Qty</Text>
          </View>
          <View
            style={{
              width: "12%",
              padding: 8,
              borderRightWidth: 1,
              borderRightColor: "#e5e7eb",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>Unit</Text>
          </View>
          <View
            style={{
              width: "16%",
              padding: 8,
              borderRightWidth: 1,
              borderRightColor: "#e5e7eb",
              alignItems: "flex-end",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>Unit Price</Text>
          </View>
          <View style={{ width: "16%", padding: 8, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              Total Price
            </Text>
          </View>
        </View>

        {/* Table Rows */}
        {invoice.items.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              borderBottomWidth: index < invoice.items.length - 1 ? 1 : 0,
              borderBottomColor: "#e5e7eb",
            }}
          >
            <View
              style={{
                width: "8%",
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 10 }}>{index + 1}.</Text>
            </View>
            <View
              style={{
                width: "36%",
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 10 }}>{item.description}</Text>
            </View>
            <View
              style={{
                width: "12%",
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: "#e5e7eb",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 10 }}>{item.quantity}</Text>
            </View>
            <View
              style={{
                width: "12%",
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: "#e5e7eb",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 10 }}>{item.unit}</Text>
            </View>
            <View
              style={{
                width: "16%",
                padding: 8,
                borderRightWidth: 1,
                borderRightColor: "#e5e7eb",
                alignItems: "flex-end",
              }}
            >
              <Text style={{ fontSize: 10 }}>
                {formatCurrency(item.price, "IDR")}
              </Text>
            </View>
            <View style={{ width: "16%", padding: 8, alignItems: "flex-end" }}>
              {/* Conditionally show strikethrough price when promo is applied to this item */}
              {invoice.promo?.promo_code &&
              item.total_before_promo > item.total ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 8,
                      color: "#666",
                      textDecoration: "line-through",
                      marginBottom: 2,
                    }}
                  >
                    {formatCurrency(item.total_before_promo, "IDR")}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                    {formatCurrency(item.total, "IDR")}
                  </Text>
                </View>
              ) : (
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                  {formatCurrency(item.total, "IDR")}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Total Section */}
      <View style={{ alignItems: "flex-end", marginBottom: 40 }}>
        <View style={{ width: 300 }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}
                >
                  Total Room Price
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                {invoice.promo?.promo_code &&
                  invoice.totalBeforePromo > invoice.totalPrice && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#333",
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          marginRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 8,
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Promo: {invoice.promo.promo_code}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#666",
                          textDecoration: "line-through",
                        }}
                      >
                        {formatCurrency(invoice.totalBeforePromo, "IDR")}
                      </Text>
                    </View>
                  )}
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {formatCurrency(invoice.totalPrice, "IDR")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Note */}
      <View
        style={{
          marginBottom: 20,
          paddingTop: 15,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontSize: 10, color: "#666" }}>
          Payment and cancellation policy as per contract.
        </Text>
      </View>

      {/* Footer Information */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* Payment Info */}
        <View style={{ flex: 1, marginRight: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 8 }}>
            Payments
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#666" }}>
            Make checks payable to:{"\n"}
            Aina (Indira){"\n"}
            CIMB Niaga 704 904 511 700{"\n"}
            KCP Teuku Umar - Denpasar
          </Text>
        </View>

        {/* Questions */}
        <View style={{ flex: 1, marginRight: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 8 }}>
            Questions
          </Text>
          <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#666" }}>
            0361 4756583{"\n"}
            info.wtmbali@gmail.com{"\n"}
            www.wtmbali.com
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />
      </View>
    </Page>
  </Document>
);

export default NewInvoicePDFDocument;
