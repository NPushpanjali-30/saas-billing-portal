import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [mrr, setMrr] = useState(0);
  const [subscriptions, setSubscriptions] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartData = [
    { month: "Jan", revenue: 3000 },
    { month: "Feb", revenue: 4000 },
    { month: "Mar", revenue: 5500 },
    { month: "Apr", revenue: 7200 },
    { month: "May", revenue: 9800 },
    { month: "Jun", revenue: 12000 }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch all invoices
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .order("id", { ascending: false });

    // Fetch all users
    const { data: userData } = await supabase
      .from("users")
      .select("*");

    if (invoiceData) {
      // MRR = sum of all Paid invoice amounts
      const totalMrr = invoiceData
        .filter(inv => inv.status === "Paid")
        .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

      // Subscriptions = total invoices
      const totalSubs = invoiceData.length;

      // Churn = overdue invoices percentage
      const overdueCount = invoiceData.filter(inv => inv.status === "Overdue").length;
      const churn = totalSubs > 0
        ? ((overdueCount / totalSubs) * 100).toFixed(1)
        : 0;

      setMrr(totalMrr);
      setSubscriptions(totalSubs);
      setChurnRate(churn);
      setRecentInvoices(invoiceData.slice(0, 5));
    }

    if (userData) {
      setCustomers(userData.length);
    }

    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontSize: "18px" }}>
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="cards">
            <div className="card">
              <h3>Monthly Revenue</h3>
              <h1>${mrr.toLocaleString()}</h1>
              <p className="green">↑ Live from database</p>
            </div>

            <div className="card">
              <h3>Subscriptions</h3>
              <h1>{subscriptions}</h1>
              <p className="green">↑ Total invoices</p>
            </div>

            <div className="card">
              <h3>Customers</h3>
              <h1>{customers}</h1>
              <p className="green">↑ Registered users</p>
            </div>

            <div className="card">
              <h3>Churn Rate</h3>
              <h1>{churnRate}%</h1>
              <p className="orange">▲ Overdue invoices</p>
            </div>
          </div>

          <div className="chart-box">
            <div className="chart-header">
              <h2>Revenue Trend</h2>
              <div className="chart-buttons">
                <button>6M</button>
                <button>YTD</button>
                <button>1Y</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="table-box">
            <div className="table-header">
              <h2>Recent Invoices</h2>
              <button
                className="view-btn"
                onClick={() => window.location.href = "/billing"}
              >
                View All
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>#INV-{inv.id}</td>
                      <td>{inv.customer}</td>
                      <td>${inv.amount}</td>
                      <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${inv.status?.toLowerCase()}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No invoices yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;