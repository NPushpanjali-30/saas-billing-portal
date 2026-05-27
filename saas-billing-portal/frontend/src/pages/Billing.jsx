import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function Billing() {
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");

  const [message, setMessage] = useState("");

  const [invoices, setInvoices] = useState([]);

  // Load invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setInvoices(data);
    }
  };

  // Generate invoice
  const generateInvoice = async () => {
    if (!customer || !amount) {
      alert("Please fill all fields");
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          customer,
          amount,
          status: "Paid"
        }
      ])
      .select();

    if (error) {
      alert("Error generating invoice");
      return;
    }

    alert("✅ Invoice Generated Successfully");

    setInvoices([data[0], ...invoices]);

    setMessage("Invoice saved to database");

    setCustomer("");
    setAmount("");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Clear invoices
  const clearInvoices = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all invoices?"
    );

    if (!confirmClear) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .neq("id", 0);

    if (error) {
      alert("Error clearing invoices");
      return;
    }

    setInvoices([]);

    alert("🗑️ All invoices cleared");
  };

  return (
    <div>

      {/* Generate Invoice */}

      <div className="table-box">

        <div className="table-header">
          <h2>Generate Invoice</h2>
        </div>

        <input
          className="input"
          type="text"
          placeholder="Customer Name"
          value={customer}
          onChange={(e) =>
            setCustomer(e.target.value)
          }
        />

        <input
          className="input"
          type="number"
          placeholder="Invoice Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <div
          style={{
            display: "flex",
            gap: "15px"
          }}
        >

          <button
            className="btn"
            onClick={generateInvoice}
          >
            Generate Invoice
          </button>

          <button
            onClick={clearInvoices}
            style={{
              background: "#dc2626",
              border: "none",
              color: "white",
              padding: "14px 26px",
              borderRadius: "14px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Clear All
          </button>

        </div>

        {message && (
          <div
            style={{
              marginTop: "20px",
              background:
                "rgba(34,197,94,0.15)",
              color: "#22c55e",
              padding: "14px",
              borderRadius: "12px",
              fontWeight: "600",
              border:
                "1px solid rgba(34,197,94,0.3)"
            }}
          >
            {message}
          </div>
        )}

      </div>

      {/* Invoice Table */}

      <div className="table-box">

        <div className="table-header">
          <h2>Recent Invoices</h2>
        </div>

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id}>

                  <td>
                    #INV-{invoice.id}
                  </td>

                  <td>
                    {invoice.customer}
                  </td>

                  <td>
                    ${invoice.amount}
                  </td>

                  <td>
                    <span className="badge paid">
                      {invoice.status}
                    </span>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b"
                  }}
                >
                  No invoices available
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Billing;