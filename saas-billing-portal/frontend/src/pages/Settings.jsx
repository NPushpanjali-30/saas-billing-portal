import React from "react";
import { useState } from "react";
import { supabase } from "../supabase";

function Settings() {
  const [company, setCompany] = useState("");
  const [stripe, setStripe] = useState("");
  const [tax, setTax] = useState("");

  const [message, setMessage] = useState("");

  const saveSettings = async () => {
    if (!company || !stripe || !tax) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from("settings")
      .insert([
        {
          company_name: company,
          stripe_key: stripe,
          tax_rate: tax
        }
      ]);

    if (error) {
      alert("Error saving settings");
      return;
    }

    // popup
    alert("✅ Settings Saved Successfully");

    // success card
    setMessage("Settings saved to database");

    // clear inputs
    setCompany("");
    setStripe("");
    setTax("");

    // auto hide message
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div>

      <div className="table-box">

        <div className="table-header">
          <h2>Platform Settings</h2>
        </div>

        <input
          className="input"
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={(e) =>
            setCompany(e.target.value)
          }
        />

        <input
          className="input"
          type="text"
          placeholder="Stripe API Key"
          value={stripe}
          onChange={(e) =>
            setStripe(e.target.value)
          }
        />

        <input
          className="input"
          type="text"
          placeholder="Tax Rate (%)"
          value={tax}
          onChange={(e) =>
            setTax(e.target.value)
          }
        />

        <button
          className="btn"
          onClick={saveSettings}
        >
          Save Settings
        </button>

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
              <td>
                {company || "Not configured"}
              </td>
            </tr>

            <tr>
              <td>Stripe API</td>
              <td>
                {stripe || "Not configured"}
              </td>
            </tr>

            <tr>
              <td>Tax Rate</td>
              <td>
                {tax || "Not configured"}
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Settings;