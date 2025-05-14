import { useEffect, useState } from "react";
import styles from "./Profile.module.scss";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import dust from "../assets/dustbin.png";

function Profile() {
  const navigate = useNavigate();
 const [myProds, setMyProds] = useState([]);
const [loading, setLoading] = useState(true);
  const [logout, setLogout] = useState(false);
  const [del, setDelete] = useState(false);
  const [id, setId] = useState("");
  const [data, setData] = useState({
    name: "",
    mail: "",
    year: "",
    course: "",
    address: "",
    phone: "",
  });
  const handleUpdate = () => {
    toast.loading("Processing", {
      duration: 5000,
    });
    axios({
      method: "post",
      baseURL: `${process.env.REACT_APP_BASEURL}`,
      url: "/api/update",
      data: { newData: data, id: id },
    })
      .then(function (response) {
        toast.success("Updated Successfully");
setData(prev => ({ ...prev })); // Just refresh the component state
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleLogout = () => {
    setLogout(true);
  };
useEffect(() => {
  const token = JSON.parse(localStorage.getItem("token"));
  if (!token) {
    navigate("/");
    return;
  }

  const fetchData = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASEURL}/api/profile`, { token });
      
      const user = res.data.data;
      const products = res.data.myproducts || [];

      setData(user);
      setId(user._id);
      setMyProds(products);
    } catch (err) {
      console.error("Error fetching profile or products:", err);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false); // Always hide loading spinner
    }
  };

  fetchData();
}, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleCancel = () => {
    setLogout(false);
    setDelete(false);
  };

  const handleDelete = () => {
    setDelete(true);
  };

  const handleLogoutAcc = () => {
    localStorage.setItem("token", JSON.stringify(""));
    navigate("/");
  };

  const handleDeleteAcc = () => {
    axios({
      method: "post",
      baseURL: `${process.env.REACT_APP_BASEURL}`,
      url: "/api/deleteAccount",
      data: { id: id },
    })
      .then(function (response) {
        localStorage.setItem("token", JSON.stringify(""));
        navigate("/");
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  if (loading) {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}>Loading...</div>
    </div>
  );
}


  return (
    <div id={styles.profilePage}>
      <div id={styles.profileContainer}>
        <div
          id={styles.logoutblur}
          onClick={() => {
            setLogout(false);
            setDelete(false);
          }}
          style={logout || del ? { display: "block" } : { display: "none" }}
        />
        <div
          id={styles.logout}
          style={logout || del ? { display: "block" } : { display: "none" }}
        >
          <div id={styles.logoutTitle}>
            {del ? "Delete " : "Log out from "}your Account
          </div>
          <div id={styles.logoutContext}>
            Are you sure you want to{" "}
            {del ? "delete your account permanently?" : "logout?"}
          </div>
          <div id={styles.logoutBTNS}>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={logout ? handleLogoutAcc : handleDeleteAcc}>
              {del ? "Delete" : "Logout"}
            </button>
          </div>
        </div>

        <span id={styles.profileTitle}>
          <span>Profile</span>
          <Link to="/">{"<-"} back</Link>
        </span>
        <div className={styles.profileAttribute}>
          <span>Name</span>
          <span>:</span>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.profileAttribute}>
          <span>Mail</span>
          <span>:</span>
          <input
            style={{ cursor: "default" }}
            name="mail"
            value={data.mail}
            defaultValue={data.mail}
          />
        </div>
        <div className={styles.profileAttribute}>
          <span>Year</span>
          <span>:</span>
          <input
            type="number"
            name="year"
            value={data.year}
            onChange={handleChange}
          />
        </div>
        <div className={styles.profileAttribute}>
          <span>Course</span>
          <span>:</span>
          <input
            type="text"
            name="course"
            value={data.course}
            onChange={handleChange}
          />
        </div>
        <div className={styles.profileAttribute}>
          <span>Address</span>
          <span>:</span>
          <input name="address" value={data.address} onChange={handleChange} />
        </div>
        <div className={styles.profileAttribute}>
          <span>Phone</span>
          <span>:</span>
          <input
            name="phone"
            type="number"
            value={data.phone}
            onChange={handleChange}
          />
        </div>
        <div id={styles.profileBtns}>
          <button type="button" onClick={handleUpdate}>
            Update
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        </div>
        <div>
    
        </div>
        <div className={styles.myProductsTitle}>My Products</div>
<div className={styles.myProductsContainer}>
  {myProds.length !== 0 ? (
    myProds.map((ele) => {
      return (
        <div key={ele.id} className={styles.myProductItem}>
          <Link to={`/product/${ele.id}`} className={styles.productLink}>
            <img src={ele.pimage} alt={ele.pname} className={styles.productImage} />
            <div className={styles.myProductInfo}>
              <p className={styles.myProductName}>{ele.pname}</p>
              <p>Registered on: {ele.preg?.slice(0, 10)}</p>
              <p>Price: Rs. {ele.pprice}</p>
            </div>
          </Link>
          <div
            className={styles.myProductDelete}
            onClick={() => {
              axios.post(`${process.env.REACT_APP_BASEURL}/api/deletemyprod`, { pid: ele.id })
                .then(() => {
                  toast.success("Product deleted successfully!");
                  window.location.reload();
                })
                .catch((err) => console.log(err));
            }}
          >
            <img src={dust} alt="delete" />
          </div>
        </div>
      );
    })
  ) : (
    <p className={styles.noProducts}>You have not listed any products yet.</p>
  )}
</div>
      </div>
    </div>
  );
}
export default Profile;
