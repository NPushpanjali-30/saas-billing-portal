import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setCustomers(data);
    setLoading(false);
  };

  const fetchInvoices = async () => {
    const { data, error } = await supabase.from("invoices").select("*");
    if (!error) setInvoices(data);
  };

  const deleteCustomer = async (id) => {
    const confirm = window.confirm("Delete this customer?");
    if (!confirm) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) setCustomers(customers.filter((c) => c.id !== id));
  };

  const getCustomerInvoices = (customerEmail) =>
    invoices.filter((inv) => inv.email === customerEmail);

  const getTotalSpent = (customerEmail) =>
    getCustomerInvoices(customerEmail)
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  const getCustomerPlan = (customerEmail) => {
    const customerInvs = getCustomerInvoices(customerEmail);
    if (customerInvs.length === 0) return "None";
    return customerInvs[customerInvs.length - 1].plan || "Starter";
  };

  const getCustomerStatus = (customerEmail) => {
    const customerInvs = getCustomerInvoices(customerEmail);
    if (customerInvs.length === 0) return "inactive";
    const hasPaid = customerInvs.some((inv) => inv.status === "paid");
    const hasPending = customerInvs.some((inv) => inv.status === "pending");
    if (hasPaid || hasPending) return "active";
    return "inactive";
  };

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => getCustomerStatus(c.email) === "active"
  ).length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  // Filter
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || getCustomerStatus(c.email) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalOpen(false);
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "20px 24px",
    flex: 1,
    minWidth: "150px",
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>Total Customers</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#fff" }}>{totalCustomers}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>Active Customers</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#22c55e" }}>{activeCustomers}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>Total Revenue</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#3b82f6" }}>${totalRevenue.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>Inactive</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#ef4444" }}>{totalCustomers - activeCustomers}</div>
        </div>
      </div>

      <div className="table-box">
        <div className="table-header">
          <h2>All Customers</h2>
          <span style={{ color: "#64748b", fontSize: "14px" }}>{filtered.length} total</span>
        </div>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "#1e293b",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading customers...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c) => {
                  const status = getCustomerStatus(c.email);
                  const plan = getCustomerPlan(c.email);
                  const spent = getTotalSpent(c.email);
                  return (
                    <tr
                      key={c.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => openModal(c)}
                    >
                      <td>#{c.id}</td>
                      <td style={{ fontWeight: "600" }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td>
                        <span style={{
                          background: "rgba(59,130,246,0.15)",
                          color: "#3b82f6",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}>
                          {plan}
                        </span>
                      </td>
                      <td style={{ color: "#22c55e", fontWeight: "600" }}>
                        ${spent.toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          background: status === "active"
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(100,116,139,0.15)",
                          color: status === "active" ? "#22c55e" : "#64748b",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: c.role === "admin"
                            ? "rgba(139,92,246,0.15)"
                            : "rgba(59,130,246,0.15)",
                          color: c.role === "admin" ? "#8b5cf6" : "#3b82f6",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}>
                          {c.role}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          style={{
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "12px",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Details Modal */}
      {modalOpen && selectedCustomer && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px" }}>{selectedCustomer.name}</h3>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>{selectedCustomer.email}</p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none", color: "#fff",
                  borderRadius: "8px", padding: "6px 12px",
                  cursor: "pointer", fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Customer Stats */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "12px" }}>Plan</div>
                <div style={{ fontWeight: "700", color: "#3b82f6" }}>{getCustomerPlan(selectedCustomer.email)}</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "12px" }}>Total Spent</div>
                <div style={{ fontWeight: "700", color: "#22c55e" }}>${getTotalSpent(selectedCustomer.email).toLocaleString()}</div>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "12px" }}>Invoices</div>
                <div style={{ fontWeight: "700", color: "#fff" }}>{getCustomerInvoices(selectedCustomer.email).length}</div>
              </div>
            </div>

            {/* Invoice History */}
            <h4 style={{ marginBottom: "12px", color: "#94a3b8" }}>Invoice History</h4>
            {getCustomerInvoices(selectedCustomer.email).length > 0 ? (
              getCustomerInvoices(selectedCustomer.email).map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", marginBottom: "8px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>INV-{inv.id}</div>
                    <div style={{ color: "#64748b", fontSize: "12px" }}>
                      {inv.due_date || inv.created_at?.split("T")[0] || "No date"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "12px" }}>{inv.plan}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#22c55e", fontWeight: "700" }}>
                      ${parseFloat(inv.amount).toLocaleString()}
                    </div>
                    <span style={{
                      background: inv.status === "paid"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(234,179,8,0.15)",
                      color: inv.status === "paid" ? "#22c55e" : "#eab308",
                      padding: "2px 8px", borderRadius: "6px",
                      fontSize: "11px", fontWeight: "600",
                    }}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
                No invoices found for this customer
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
