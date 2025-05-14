import Design from "../components/Design/Design";
import styles from "./Login.module.scss";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    mail: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios({
      method: "post",
      baseURL: `${process.env.REACT_APP_BASEURL}`,
      url: "/api/login",
      data: data,
    })
      .then(function (response) {
        toast.success("Signed in successfully!");
        console.log(response);
        localStorage.setItem(
          "token",
          JSON.stringify(response.data.refreshToken)
        );
        navigate("/");
      })
      .catch(function (error) {
        toast.error("Sign in failed!");
        console.log("error caught in frontend from backend");
      });
  };

  return (
    <div id="login" className={styles.login}>
      <Design />
      <div id={styles.loginFormContainer}>
        <p>Sign In</p>
        <form id={styles.loginForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="email"
            name="mail"
            value={data.mail}
            autoComplete="off"
            onChange={handleChange}
            required={true}
          />
          <input
            type="password"
            placeholder="password"
            minLength={8}
            maxLength={16}
            value={data.password}
            name="password"
            onChange={handleChange}
            required={true}
          />
          <span id={styles.registerHere}>
            not a user?{" "}
            <Link to="/register" style={{ color: "blue" }}>
              sign up
            </Link>
          </span>
          <button type="submit" onClick={handleSubmit}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
