function Users() {
  return (
    <div>
      <h1>Users</h1>

      <button className="btn">Add User</button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Admin User</td>
            <td>admin@gmail.com</td>
            <td>Admin</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Users;