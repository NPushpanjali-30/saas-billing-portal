import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
  const data = [
    { month: "Jan", revenue: 3000 },
    { month: "Feb", revenue: 4000 },
    { month: "Mar", revenue: 5500 },
    { month: "Apr", revenue: 7200 },
    { month: "May", revenue: 9800 },
    { month: "Jun", revenue: 12000 }
  ];

  return (
    <div>
      <div className="cards">

        <div className="card">
          <h3>Monthly Revenue</h3>
          <h1>$12,000</h1>
          <p className="green">
            ↑ 18.4% vs last month
          </p>
        </div>

        <div className="card">
          <h3>Subscriptions</h3>
          <h1>320</h1>
          <p className="green">
            ↑ 12 new this month
          </p>
        </div>

        <div className="card">
          <h3>Customers</h3>
          <h1>150</h1>
          <p className="green">
            ↑ 5 new this week
          </p>
        </div>

        <div className="card">
          <h3>Churn Rate</h3>
          <h1>4%</h1>
          <p className="orange">
            ▲ 0.5% vs target
          </p>
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
          <LineChart data={data}>
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
  onClick={() => {
    window.location.href = "/billing";
  }}
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

            <tr>
              <td>#INV-0041</td>
              <td>Acme Corp</td>
              <td>$1200</td>
              <td>May 24, 2026</td>
              <td>
                <span className="badge paid">
                  Paid
                </span>
              </td>
            </tr>

            <tr>
              <td>#INV-0040</td>
              <td>Globex Inc</td>
              <td>$850</td>
              <td>May 22, 2026</td>
              <td>
                <span className="badge pending">
                  Pending
                </span>
              </td>
            </tr>

            <tr>
              <td>#INV-0039</td>
              <td>Initech LLC</td>
              <td>$2400</td>
              <td>May 19, 2026</td>
              <td>
                <span className="badge paid">
                  Paid
                </span>
              </td>
            </tr>

          </tbody>

        </table>

      </div>
    </div>
  );
}

export default Dashboard;