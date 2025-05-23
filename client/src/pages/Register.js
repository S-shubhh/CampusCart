import React, { useEffect, useState } from "react";
import styles from "./Login.module.scss";
import { Link, useNavigate } from "react-router-dom";
import Design from "../components/Design/Design";
import { toast } from "react-hot-toast";
import axios from "axios";

function Register() {
  const navigate = useNavigate(); // ✅ Moved inside component

  const [course, setCourse] = useState("B.Tech");
  const [Btech, setBtech] = useState(true);
  const [Mtech, setMtech] = useState(false);
  const [PhD, setPhD] = useState(false);
  const [idCardImage, setIdCardImage] = useState(null);


  const [data, setData] = useState({
    name: "",
    mail: "",
    year: "",
    address: "",
    phone: "",
    password: "",
    course: "B.Tech",
  });

  useEffect(() => {
    setData((prev) => ({ ...prev, course }));
  }, [course]);

  const handleSubmit = (e) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (data.name.trim() === "") {
    toast.error("Name field required!");
    return;
  }

  if (!emailRegex.test(data.mail)) {
    toast.error("Please enter a valid email address!");
    return;
  }

  if (data.year === "") {
    toast.error("Please enter which year you're from!");
    return;
  }

  if (data.address === "") {
    toast.error("Address field required!");
    return;
  }

  if (data.phone === "") {
    toast.error("Phone no. field is required!");
    return;
  }

  if (data.phone <= 1000000000 || data.phone >= 9999999999) {
    toast.error("Please enter valid phone no.!");
    return;
  }

  if (data.password.length < 8) {
    toast.error("Password should be 8 character long!");
    return;
  }

  if (!idCardImage) {
    toast.error("Please upload your ID card image!");
    return;
  }

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("mail", data.mail);
  formData.append("year", data.year);
  formData.append("address", data.address);
  formData.append("phone", data.phone);
  formData.append("password", data.password);
  formData.append("course", data.course);
  formData.append("idCard", idCardImage);

  toast.promise(
    axios.post(`${process.env.REACT_APP_BASEURL}/api/register`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
    {
      loading: "Processing...",
      success: (res) => {
        if (res.data.info === "userExist") {
          throw new Error("User already exist with this mail-id!");
        }
        return "Signup successful!";
      },
      error: (err) => err.message || "Something went wrong. Try again.",
    }
  )
    .then((response) => {
      if (response.data.info === "registered") {
        setData({
          name: "",
          mail: "",
          year: "",
          address: "",
          phone: "",
          password: "",
          course: "B.Tech",
        });
        setIdCardImage(null); // ✅ reset image
        setBtech(true);
        setMtech(false);
        setPhD(false);
        setCourse("B.Tech");
        navigate("/login");
      }
    })
    .catch((err) => {
      console.log("Signup error:", err);
    });
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div id="login" className={styles.login}>
      <Design />
      <div id={styles.loginFormContainer}>
        <p>SignUp</p>
        <form id={styles.loginForm} onSubmit={handleSubmit}>
          <input
            required
            type="text"
            name="name"
            value={data.name}
            placeholder="name"
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            required
            type="email"
            name="mail"
            value={data.mail}
            placeholder="student mail ID"
            onChange={handleChange}
            autoComplete="off"
          />

          <div id={styles.checkboxes}>
            <label>
              <input
                type="radio"
                name="course"
                onChange={() => {
                  setCourse("B.Tech");
                  setBtech(true);
                  setMtech(false);
                  setPhD(false);
                }}
                checked={Btech}
              />
              B.Tech
            </label>

            <label>
              <input
                type="radio"
                name="course"
                onChange={() => {
                  setCourse("M.Tech");
                  setMtech(true);
                  setBtech(false);
                  setPhD(false);
                }}
                checked={Mtech}
              />
              M.Tech
            </label>

            <label>
              <input
                type="radio"
                name="course"
                onChange={() => {
                  setCourse("PhD");
                  setPhD(true);
                  setBtech(false);
                  setMtech(false);
                }}
                checked={PhD}
              />
              Ph.D
            </label>
          </div>

          <input
            required
            type="number"
            name="year"
            value={data.year}
            placeholder="year"
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            required
            type="text"
            name="address"
            value={data.address}
            placeholder="address"
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            required
            type="number"
            name="phone"
            placeholder="phone no."
            value={data.phone}
            onChange={handleChange}
            autoComplete="off"
          />
          <input
            required
            type="password"
            name="password"
            placeholder="password"
            minLength={8}
            maxLength={16}
            value={data.password}
            onChange={handleChange}
            autoComplete="off"
          />
         <div className={styles.uploadWrapper}>
  <label htmlFor="idCardUpload" className={styles.uploadLabel}>
    📎 Upload ID Card
  </label>
  <input
    type="file"
    id="idCardUpload"
    name="idCard"
    accept="image/*"
    required
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > 2) {
          toast.error("File size exceeds 2 MB!");
          e.target.value = "";
          setIdCardImage(null);
        } else {
          setIdCardImage(file);
        }
      }
    }}
    className={styles.hiddenFileInput}
  />

  {idCardImage && (
    <div className={styles.previewContainer}>
      <p className={styles.fileName}>✅ {idCardImage.name}</p>
      <img
        src={URL.createObjectURL(idCardImage)}
        alt="ID Card Preview"
        className={styles.imagePreview}
      />
    </div>
  )}
</div>



          <span id={styles.registerHere}>
            already a user?{" "}
            <Link to="/login" style={{ color: "blue" }}>
              sign in
            </Link>
          </span>

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
