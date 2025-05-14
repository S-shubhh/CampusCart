import styles from "./Sell.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

function Sell() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("table");
  const [id, setId] = useState("");
  const [cycle, setCycle] = useState(false);
  const [table, setTable] = useState(true);
  const [drafter, setDrafter] = useState(false);
  const [cloth, setCloth] = useState(false);
  const [book, setBook] = useState(false);
  const [other, setOther] = useState(false);
  const [image, setImage] = useState("");
  const [data, setData] = useState({
    pname: "",
    pdate: "",
    pprice: "",
    pdetail: "",
    pcat: "",
    pimage: "",
    id: "",
  });
 useEffect(() => {
  const token = JSON.parse(localStorage.getItem("token"));
  if (!token) {
    navigate("/");
    return;
  }

  axios({
    method: "post",
    baseURL: `${process.env.REACT_APP_BASEURL}`,
    url: "/api/verifyToken",
    data: { token: token },
  })
   .then(function (response) {
      const userId = response.data.userid;  // Extract userId from response
      setId(userId);
      setData((prev) => {
        return { ...prev, id: userId };
      });
    })
    .catch(function (error) {
      console.log("Error fetching profile:", error);
      navigate("/"); // optional: redirect or logout on error
    });
}, []);

  useEffect(() => {
    setData((prev) => {
      return { ...prev, pcat: cat, pimage: image };
    });
  }, [cat, image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const convertToBase64 = (e) => {
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.onerror = (error) => {
      console.log(error);
    };
  };
  const handleSubmit = () => {
    toast.loading("Processing", { duration: 2000 });
    axios({
      method: "post",
      baseURL: `${process.env.REACT_APP_BASEURL}`,
      url: "/api/sell",
      data: { pdata: data, id: id },
      headers: {
        "Content-Type" : "application/json"
      }
    })
      .then(function (response) {
        toast.success("Product details updated successfully!");
        navigate("/");
      })
      .catch(function (error) {
        toast.error("Failed to update the details!");
        console.log("error caught in frontend from backend");
      });
  };
  return (
    <div id={styles.sellPage}>
      <div id={styles.sellBox}>
        <p className={styles.sellTitle}>Sell</p>
        <div className={styles.sellinput}>
          <span>Product name : </span>
          <input
            name="pname"
            type="text"
            placeholder="Product name"
            value={data.pname}
            onChange={handleChange}
          />
        </div>

        <div className={styles.sellinput}>
          <span>Product price : </span>

          <input
            name="pprice"
            type="number"
            placeholder="Rs. XYZ"
            value={data.pprice}
            onChange={handleChange}
          ></input>
        </div>
        <div className={styles.sellinput}>
          <span>Product info : </span>
          <input
            name="pdetail"
            type="text"
            placeholder="Product Description"
            onChange={handleChange}
          ></input>
        </div>
        <div className={styles.sellinput}>
          <span>Date bought : </span>
          <input
            name="pdate"
            type="date"
            placeholder="Date purchased"
            value={data.pdate}
            onChange={handleChange}
          ></input>
        </div>
        <div className={styles.checkboxes}>
          <label htmlFor="table">
            <input
              type="radio"
              name="table"
              onChange={(e) => {
                setTable(true);
                setCat("table");
                setOther(false);
                setBook(false);
                setCycle(false);
                setDrafter(false);
                setCloth(false);
              }}
              checked={table}
            />
            Table
          </label>

          <label htmlFor="cycle">
            <input
              type="radio"
              name="cycle"
              onChange={(e) => {
                setCycle(true);
                setCat("cycle");
                setOther(false);
                setBook(false);
                setTable(false);
                setDrafter(false);
                setCloth(false);
              }}
              checked={cycle}
            />
            Cycle
          </label>
          <label htmlFor="drafter">
            <input
              type="radio"
              name="drafter"
              onChange={(e) => {
                setDrafter(true);
                setCat("drafter");
                setOther(false);
                setBook(false);
                setCycle(false);
                setTable(false);
                setCloth(false);
              }}
              checked={drafter}
            />
            Drafter
          </label>
          <label htmlFor="book">
            <input
              type="radio"
              name="book"
              onChange={(e) => {
                setDrafter(false);
                setCat("book");
                setOther(false);
                setBook(true);
                setCycle(false);
                setTable(false);
                setCloth(false);
              }}
              checked={book}
            />
           Book
          </label>
          <label htmlFor="cloth">
            <input
              type="radio"
              name="cloth"
              onChange={(e) => {
                setDrafter(false);
                setCat("Cloth");
                setOther(false);
                setBook(false);
                setCycle(false);
                setTable(false);
                setCloth(true);
              }}
              checked={cloth}
            />
            Cloth
          </label>
          <label htmlFor="other">
            <input
              type="radio"
              name="other"
              onChange={(e) => {
                setDrafter(false);
                setCat("other");
                setOther(true);
                setBook(false);
                setCycle(false);
                setTable(false);
                setCloth(false);
              }}
              checked={other}
            />
            Other
          </label>
        </div>

        <div className={styles.sellinput}>
          <span>Product image</span>
          <input
            type="file"
            name="pimage"
            accept="image/*"
            onChange={convertToBase64}
            style={{ border: "none" }}
          ></input>
        </div>

        {image === "" || image === null ? (
          ""
        ) : (
          <img src={image} alt="uploadedImage" />
        )}
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default Sell;
