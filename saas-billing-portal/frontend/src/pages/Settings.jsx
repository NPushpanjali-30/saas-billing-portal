import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function Settings() {
  const [company, setCompany] = useState("");
  const [stripe, setStripe] = useState("");
  const [tax, setTax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [message, setMessage] = useState("");
  const [savedConfig, setSavedConfig] = useState(null);

  useEffect(() => {
    fetchLatestSettings();
  }, []);

  const fetchLatestSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setSavedConfig(data);
      setCompany(data.company_name || "");
      setStripe(data.stripe_key || "");
      setTax(data.tax_rate || "");
      setCurrency(data.currency || "USD");
      setInvoicePrefix(data.invoice_prefix || "INV");
    }
  };

  const saveSettings = async () => {
    if (!company || !stripe || !tax) {
      alert("Please fill all fields");
      return;
    }

    const { data, error } = await supabase
      .from("settings")
      .insert([{
        company_name: company,
        stripe_key: stripe,
        tax_rate: tax,
        currency: currency,
        invoice_prefix: invoicePrefix,
      }])
      .select()
      .single();

    if (error) {
      alert("Error saving settings");
      return;
    }

    setSavedConfig(data);
    setMessage("Settings saved to database");
    setTimeout(() => setMessage(""), 3000);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    marginBottom: "14px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "6px",
    display: "block",
  };

  const sectionStyle = { marginBottom: "20px" };

  return (
    <div>
      <div className="table-box">
        <div className="table-header">
          <h2>Platform Settings</h2>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Company Name</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. BillingOS Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Stripe API Key</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="sk_test_..."
            value={stripe}
            onChange={(e) => setStripe(e.target.value)}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Tax Rate (%)</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="e.g. 18"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ ...inputStyle, background: "#1e293b", cursor: "pointer" }}
          >
            <option value="USD">🇺🇸 USD — US Dollar</option>
            <option value="EUR">🇪🇺 EUR — Euro</option>
            <option value="GBP">🇬🇧 GBP — British Pound</option>
            <option value="INR">🇮🇳 INR — Indian Rupee</option>
            <option value="AUD">🇦🇺 AUD — Australian Dollar</option>
            <option value="CAD">🇨🇦 CAD — Canadian Dollar</option>
          </select>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Invoice Prefix</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. INV, BILL, ORD"
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value)}
          />
          <span style={{ color: "#64748b", fontSize: "12px" }}>
            Invoices will appear as: {invoicePrefix || "INV"}-001, {invoicePrefix || "INV"}-002...
          </span>
        </div>

        <button className="btn" onClick={saveSettings} style={{ width: "100%", marginTop: "8px" }}>
          Save Settings
        </button>

        {message && (
          <div style={{
            marginTop: "16px",
            background: "rgba(34,197,94,0.15)",
            color: "#22c55e",
            padding: "14px",
            borderRadius: "12px",
            fontWeight: "600",
            border: "1px solid rgba(34,197,94,0.3)",
          }}>
            ✅ {message}
          </div>
        )}
      </div>

      {/* Saved Configuration */}
      <div className="table-box">
        <div className="table-header">
          <h2>Saved Configuration</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Setting</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Company Name</td>
              <td>{savedConfig?.company_name || "Not configured"}</td>
            </tr>
            <tr>
              <td>Stripe API</td>
              <td>
                {savedConfig?.stripe_key
                  ? "••••••••" + savedConfig.stripe_key.slice(-4)
                  : "Not configured"}
              </td>
            </tr>
            <tr>
              <td>Tax Rate</td>
              <td>{savedConfig?.tax_rate ? `${savedConfig.tax_rate}%` : "Not configured"}</td>
            </tr>
            <tr>
              <td>Currency</td>
              <td>{savedConfig?.currency || "Not configured"}</td>
            </tr>
            <tr>
              <td>Invoice Prefix</td>
              <td>{savedConfig?.invoice_prefix || "Not configured"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Settings;
