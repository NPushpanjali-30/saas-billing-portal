import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Billing() {
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [plan, setPlan] = useState("Starter");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [invoices, setInvoices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentStep, setPaymentStep] = useState("form");

  useEffect(() => { fetchInvoices(); }, []);
  useEffect(() => { applyFilter(); }, [search, statusFilter, invoices]);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("id", { ascending: false });
    if (!error) {
      setInvoices(data);
      setFiltered(data);
    }
  };

  const applyFilter = () => {
    let result = [...invoices];
    if (search) {
      result = result.filter(inv =>
        inv.customer?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(inv =>
        inv.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFiltered(result);
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const generateInvoice = async () => {
    if (!customer || !amount) {
      showMessage("Please fill Customer Name and Amount", "error");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .insert([{ customer, email, amount, plan, due_date: dueDate, payment_method: paymentMethod, status: "Pending" }])
      .select();
    setLoading(false);
    if (error) { showMessage("Error generating invoice", "error"); return; }
    setInvoices([data[0], ...invoices]);
    showMessage(`✅ Invoice generated! Email notification sent to ${email || "customer"}`, "success");
    setCustomer(""); setEmail(""); setAmount(""); setPlan("Starter"); setDueDate(""); setPaymentMethod("Credit Card");
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from("invoices").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
      showMessage("✅ Status updated successfully!");
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (!error) {
      setInvoices(invoices.filter(inv => inv.id !== id));
      showMessage("🗑️ Invoice deleted");
    }
  };

  const clearInvoices = async () => {
    if (!window.confirm("Clear all invoices?")) return;
    const { error } = await supabase.from("invoices").delete().neq("id", 0);
    if (!error) { setInvoices([]); showMessage("🗑️ All invoices cleared"); }
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.setFillColor(8, 17, 33);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BillingOS", 14, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Invoice", 14, 30);
    doc.setFontSize(12);
    doc.text(`#INV-${invoice.id}`, 160, 20);
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), 160, 30);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 14, 55);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Customer: ${invoice.customer}`, 14, 68);
    doc.text(`Email: ${invoice.email || "N/A"}`, 14, 78);
    doc.text(`Plan: ${invoice.plan || "N/A"}`, 14, 88);
    doc.text(`Payment Method: ${invoice.payment_method || "N/A"}`, 14, 98);
    doc.text(`Due Date: ${invoice.due_date || "N/A"}`, 14, 108);
    autoTable(doc, {
      startY: 120,
      head: [["Description", "Plan", "Amount", "Status"]],
      body: [[`Invoice #INV-${invoice.id}`, invoice.plan || "N/A", `$${invoice.amount}`, invoice.status]],
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      bodyStyles: { textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [240, 245, 255] }
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(`Total Amount: $${invoice.amount}`, 14, finalY);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 14, 280);
    doc.text("Generated by BillingOS", 14, 286);
    doc.save(`Invoice_INV-${invoice.id}_${invoice.customer}.pdf`);
    showMessage("📄 PDF downloaded successfully!");
  };

  const openPayment = (invoice) => {
    if (invoice.status?.toLowerCase() === "paid") {
      showMessage("This invoice is already paid!", "error");
      return;
    }
    setSelectedInvoice(invoice);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setPaymentStep("form");
    setShowPayment(true);
  };

  const processPayment = async () => {
    const cleanCard = cardNumber.replace(/\s/g, "");
    if (!cleanCard || !expiry || !cvv) {
      showMessage("Please fill all card details", "error");
      return;
    }
    if (cleanCard.length < 16) {
      showMessage("Enter valid 16 digit card number", "error");
      return;
    }
    if (cvv.length < 3) {
      showMessage("Enter valid CVV", "error");
      return;
    }

    setPaymentStep("processing");

    setTimeout(async () => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "Paid" })
        .eq("id", selectedInvoice.id);

      if (!error) {
        setInvoices(invoices.map(inv =>
          inv.id === selectedInvoice.id ? { ...inv, status: "Paid" } : inv
        ));
      }

      setPaymentStep("success");

      setTimeout(() => {
        setShowPayment(false);
        showMessage(`💳 Payment of $${selectedInvoice.amount} received! Receipt sent to ${selectedInvoice.email || "customer"}`);
      }, 3000);
    }, 2500);
  };

  const formatCard = (value) => {
    return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  };

  const inputStyle = {
    width: "100%",
    background: "#0d1526",
    border: "1px solid #1e2a42",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "white",
    fontSize: "14px",
    marginBottom: "14px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const cardInputStyle = {
    width: "100%",
    background: "#0d1526",
    border: "1px solid #1e2a42",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "white",
    fontSize: "15px",
    outline: "none",
    fontFamily: "monospace",
    boxSizing: "border-box",
  };

  return (
    <div>
      {/* Generate Invoice Form */}
      <div className="table-box">
        <div className="table-header">
          <h2>Generate Invoice</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <input style={inputStyle} type="text" placeholder="Customer Name *" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          <input style={inputStyle} type="email" placeholder="Customer Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={inputStyle} type="number" placeholder="Invoice Amount *" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select style={inputStyle} value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option>Starter</option>
            <option>Pro</option>
            <option>Business</option>
            <option>Enterprise</option>
          </select>
          <input style={inputStyle} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <select style={inputStyle} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option>Credit Card</option>
            <option>Bank Transfer</option>
            <option>Invoice</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "15px", marginTop: "6px" }}>
          <button className="btn" onClick={generateInvoice} disabled={loading}
            style={{ background: "#2563eb", width: "auto", padding: "14px 28px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Generating..." : "⚡ Generate Invoice"}
          </button>
          <button onClick={clearInvoices} style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444", padding: "14px 26px", borderRadius: "14px", cursor: "pointer", fontWeight: "600"
          }}>
            🗑️ Clear All
          </button>
        </div>

        {message && (
          <div style={{
            marginTop: "20px",
            background: messageType === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: messageType === "success" ? "#22c55e" : "#ef4444",
            padding: "14px 18px", borderRadius: "12px", fontWeight: "600",
            border: messageType === "success" ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)",
            fontSize: "14px"
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Invoice Table */}
      <div className="table-box">
        <div className="table-header">
          <h2>Recent Invoices</h2>
          <span style={{ color: "#64748b", fontSize: "14px" }}>{filtered.length} invoices</span>
        </div>

        <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
          <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} type="text"
            placeholder="🔍 Search by customer name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={{ ...inputStyle, marginBottom: 0, width: "160px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Email</th><th>Plan</th>
                <th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((invoice) => (
                <tr key={invoice.id}>
                  <td>#INV-{invoice.id}</td>
                  <td>{invoice.customer}</td>
                  <td style={{ fontSize: "13px", color: "#94a3b8" }}>{invoice.email || "-"}</td>
                  <td>{invoice.plan || "-"}</td>
                  <td style={{ fontWeight: "600", color: "#22c55e" }}>${invoice.amount}</td>
                  <td>{invoice.due_date || "-"}</td>
                  <td>
                    <select
                      value={invoice.status}
                      onChange={(e) => updateStatus(invoice.id, e.target.value)}
                      style={{
                        background: invoice.status?.toLowerCase() === "paid"
                          ? "rgba(34,197,94,0.15)"
                          : invoice.status?.toLowerCase() === "overdue"
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(245,158,11,0.15)",
                        color: invoice.status?.toLowerCase() === "paid"
                          ? "#22c55e"
                          : invoice.status?.toLowerCase() === "overdue"
                          ? "#ef4444" : "#f59e0b",
                        border: "none", borderRadius: "8px", padding: "6px 10px",
                        cursor: "pointer", fontWeight: "600", fontSize: "12px"
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openPayment(invoice)} style={{
                        background: invoice.status?.toLowerCase() === "paid" ? "rgba(100,116,139,0.15)" : "rgba(37,99,235,0.15)",
                        color: invoice.status?.toLowerCase() === "paid" ? "#64748b" : "#3b82f6",
                        border: "none", borderRadius: "8px", padding: "6px 10px",
                        cursor: invoice.status?.toLowerCase() === "paid" ? "not-allowed" : "pointer",
                        fontWeight: "600", fontSize: "12px"
                      }}>💳 Pay</button>
                      <button onClick={() => downloadPDF(invoice)} style={{
                        background: "rgba(139,92,246,0.15)", color: "#8b5cf6",
                        border: "none", borderRadius: "8px", padding: "6px 10px",
                        cursor: "pointer", fontWeight: "600", fontSize: "12px"
                      }}>📄 PDF</button>
                      <button onClick={() => deleteInvoice(invoice.id)} style={{
                        background: "rgba(239,68,68,0.15)", color: "#ef4444",
                        border: "none", borderRadius: "8px", padding: "6px 10px",
                        cursor: "pointer", fontWeight: "600", fontSize: "12px"
                      }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={{
          position: "fixed", top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.7)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#081121", border: "1px solid #1e293b",
            borderRadius: "24px", padding: "40px", width: "420px", position: "relative"
          }}>

            {paymentStep === "form" && (
              <button onClick={() => setShowPayment(false)} style={{
                position: "absolute", top: "16px", right: "20px",
                background: "none", border: "none", color: "#64748b",
                fontSize: "22px", cursor: "pointer"
              }}>✕</button>
            )}

            {/* FORM STEP */}
            {paymentStep === "form" && (
              <>
                {/* Card Visual */}
                <div style={{
                  background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                  borderRadius: "16px", padding: "24px", marginBottom: "28px", position: "relative", overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "120px", height: "120px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)"
                  }} />
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "16px", letterSpacing: "2px" }}>
                    BILLINGOS PAYMENT
                  </div>
                  <div style={{ fontSize: "18px", letterSpacing: "3px", color: "#fff", marginBottom: "20px", fontFamily: "monospace" }}>
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>EXPIRY</div>
                      <div style={{ color: "#fff", fontSize: "14px" }}>{expiry || "MM/YY"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>AMOUNT</div>
                      <div style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}>${selectedInvoice?.amount}</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ marginBottom: "4px" }}>Pay Invoice #{selectedInvoice?.id}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
                  Customer: {selectedInvoice?.customer}
                </p>

                {/* Card Number */}
                <input
                  style={cardInputStyle}
                  type="text"
                  placeholder="Card Number (16 digits)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  maxLength={19}
                />

                {/* Expiry + CVV */}
                <div style={{ display: "flex", gap: "12px", margin: "12px 0" }}>
                  <input
                    style={{ ...cardInputStyle, flex: 1 }}
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                  <input
                    style={{ ...cardInputStyle, flex: 1 }}
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                  />
                </div>

                <button
                  onClick={processPayment}
                  style={{
                    width: "100%", padding: "16px",
                    background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                    color: "#fff", border: "none", borderRadius: "12px",
                    fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "16px"
                  }}
                >
                  💳 Pay ${selectedInvoice?.amount}
                </button>

                <p style={{ textAlign: "center", color: "#475569", fontSize: "12px", marginTop: "12px" }}>
                  🔒 Simulated secure payment — no real charges
                </p>
              </>
            )}
            {/* PROCESSING STEP */}
            {paymentStep === "processing" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: "60px", height: "60px",
                  border: "4px solid #1e293b", borderTop: "4px solid #2563eb",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  margin: "0 auto 28px"
                }} />
                <h3 style={{ marginBottom: "10px" }}>Processing Payment...</h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Please wait while we process your payment</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* SUCCESS STEP */}
            {paymentStep === "success" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: "70px", height: "70px",
                  background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 24px", fontSize: "30px"
                }}>✅</div>
                <h3 style={{ color: "#22c55e", marginBottom: "10px", fontSize: "22px" }}>Payment Successful!</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px" }}>
                  ${selectedInvoice?.amount} received from {selectedInvoice?.customer}
                </p>
                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  📧 Receipt sent to {selectedInvoice?.email || "customer"}
                </p>
                <p style={{ color: "#475569", fontSize: "12px", marginTop: "20px" }}>Closing automatically...</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
export default Billing;

