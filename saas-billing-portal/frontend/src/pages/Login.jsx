import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Login() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  // Login states
  const [loginEmail, setLoginEmail] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  // Register states
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      alert("Database error");
      return;
    }

    const user = data?.find(
      (u) =>
        u.email === loginEmail &&
        u.password === loginPassword
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("loggedIn", "true");

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    alert("✅ Login Successful");

    navigate("/dashboard");
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password,
          role: "user"
        }
      ]);

    if (error) {
      alert("User already exists");
      return;
    }

    alert("✅ Account Created");

    setName("");
    setEmail("");
    setPassword("");

    setIsLogin(true);
  };

  return (
    <div className="login-page">

      <div className="login-box">

        <h1>BillingOS</h1>

        {/* Tabs */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "30px"
          }}
        >

          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: isLogin
                ? "#2563eb"
                : "#13203a",
              color: "white",
              fontWeight: "600"
            }}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: !isLogin
                ? "#2563eb"
                : "#13203a",
              color: "white",
              fontWeight: "600"
            }}
          >
            Register
          </button>

        </div>

        {/* LOGIN FORM */}

        {isLogin ? (

          <form onSubmit={handleLogin}>

            <input
              className="input"
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) =>
                setLoginEmail(e.target.value)
              }
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) =>
                setLoginPassword(e.target.value)
              }
            />

            <button
              className="btn"
              type="submit"
            >
              Login
            </button>

          </form>

        ) : (

          /* REGISTER FORM */

          <form onSubmit={handleRegister}>

            <input
              className="input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              className="btn"
              type="submit"
            >
              Create Account
            </button>

          </form>

        )}

      </div>

    </div>
  );
}

export default Login;
