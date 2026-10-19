import { useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
const API = "http://localhost:5000";

function Login() {
    const [page, setPage] = useState("login");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loggedInUser, setLoggedInUser] = useState("");
    const [loading, setLoading] = useState(false);

    // SIGN UP
    async function signup(e) {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${API}/signup`, {
                username,
                password
            });

            setMessage(response.data.message);
            setPassword("");
            setPage("login");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    }

    // LOGIN
    async function login(e) {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${API}/login`, {
                username,
                password
            });

            localStorage.setItem("token", response.data.token);

            setLoggedInUser(response.data.username);
            setPassword("");
            setMessage("");
            setPage("home");

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    }

    // OPEN PROTECTED HOME PAGE
    async function openHome() {
        const token = localStorage.getItem("token");

        if (!token) {
            setPage("login");
            setMessage("Please log in first");
            return;
        }

        try {
            const response = await axios.get(`${API}/home`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setLoggedInUser(response.data.username);
            setPage("home");
            setMessage("");

        } catch (error) {
            localStorage.removeItem("token");
            setPage("login");
            setLoggedInUser("");

            setMessage(
                error.response?.data?.message || "Please log in again"
            );
        }
    }

    // LOGOUT
    function logout() {
        localStorage.removeItem("token");

        setLoggedInUser("");
        setUsername("");
        setPassword("");

        setMessage("You have logged out successfully");
        setPage("login");
    }

    // HOME PAGE
    if (page === "home") {
        return (
            <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

                <div className="card shadow-lg border-0 p-4 text-center"
                    style={{ width: "400px" }}>

                    <div
                        className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center mx-auto mb-3"
                        style={{
                            width: "70px",
                            height: "70px",
                            fontSize: "35px"
                        }}
                    >
                        ✓
                    </div>

                    <h1 className="fw-bold mb-3">
                        Welcome!
                    </h1>

                    <p className="fs-5">
                        Hello, <strong>{loggedInUser}</strong>
                    </p>

                    <p className="text-muted">
                        You have successfully logged in.
                    </p>

                    <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={openHome}
                    >
                        Verify My Login
                    </button>

                    <button
                        className="btn btn-outline-danger w-100"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>
            </div>
        );
    }

    // LOGIN / SIGNUP PAGE
    return (
        <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

            <div
                className="card shadow-lg border-0 p-4"
                style={{ width: "400px" }}
            >

                <h1 className="text-center fw-bold">
                    {page === "signup"
                        ? "Create Account"
                        : "Welcome Back"}
                </h1>

                <p className="text-center text-muted mb-4">
                    {page === "signup"
                        ? "Register to create your account"
                        : "Login to continue to your account"}
                </p>

                {/* TABS */}
                <div className="btn-group w-100 mb-4">

                    <button
                        type="button"
                        className={`btn ${
                            page === "login"
                                ? "btn-primary"
                                : "btn-outline-primary"
                        }`}
                        onClick={() => {
                            setPage("login");
                            setMessage("");
                        }}
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        className={`btn ${
                            page === "signup"
                                ? "btn-primary"
                                : "btn-outline-primary"
                        }`}
                        onClick={() => {
                            setPage("signup");
                            setMessage("");
                        }}
                    >
                        Sign Up
                    </button>

                </div>

                {/* FORM */}
                <form onSubmit={page === "signup" ? signup : login}>

                    {/* USERNAME */}
                    <div className="mb-3">

                        <label className="form-label fw-semibold">
                            Username
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            maxLength={100}
                            autoComplete="username"
                            required
                        />

                    </div>

                    {/* PASSWORD */}
                    <div className="mb-3">

                        <label className="form-label fw-semibold">
                            Password
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            minLength={
                                page === "signup"
                                    ? 8
                                    : undefined
                            }
                            maxLength={72}
                            autoComplete={
                                page === "signup"
                                    ? "new-password"
                                    : "current-password"
                            }
                            required
                        />

                    </div>

                    {/* PASSWORD HINT */}
                    {page === "signup" && (
                        <div className="form-text mb-3">
                            Use a password with at least 8 characters.
                        </div>
                    )}

                    {/* MESSAGE */}
                    {message && (
                        <div
                            className="alert alert-info"
                            role="status"
                        >
                            {message}
                        </div>
                    )}

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : page === "signup"
                                ? "Create Account"
                                : "Login"}
                    </button>

                </form>

                {/* SWITCH LOGIN/SIGNUP */}
                <p className="text-center text-muted mt-4 mb-0">

                    {page === "signup"
                        ? "Already have an account?"
                        : "Don't have an account?"}

                    <button
                        type="button"
                        className="btn btn-link p-0 ms-1"
                        onClick={() => {
                            setPage(
                                page === "signup"
                                    ? "login"
                                    : "signup"
                            );
                            setMessage("");
                        }}
                    >
                        {page === "signup"
                            ? "Login"
                            : "Sign Up"}
                    </button>

                </p>

            </div>
        </div>
    );
}

export default Login;