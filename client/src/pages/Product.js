import { useState, useEffect } from "react";
import styles from "./Product.module.scss";
import axios from "axios";
import { Link } from "react-router-dom";
import search from "../assets/search.svg";
import ChatboxPopup from "../pages/FloatingChatBox";
import { Oval } from "react-loader-spinner";
function Product() {
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [isMyProd, setIsMyProd] = useState(false);
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [prodExist, setProdExist] = useState(false);
  const [sname, setSname] = useState("");
  const [smail, setSmail] = useState("");
  const [sphone, setPhone] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const href = window.location.href.split("/");
      const ppid = href[href.length - 1];
      const tokenString = localStorage.getItem("token");
      if (!tokenString) {
        setValid(false);
        setLoading(false);
        return;
      }

      const token = JSON.parse(tokenString);
      try {
        const verifyRes = await axios.post(`${process.env.REACT_APP_BASEURL}/api/verifyToken`, { token })
        const myid = verifyRes.data.userid;
        setId(myid);
        setValid(true);
        const prodRes = await axios.post(`${process.env.REACT_APP_BASEURL}/api/prodData`, { id: ppid })
        const prodData = prodRes.data.details.data;
        console.log(prodData)
        setIsMyProd(prodData.id.toString() === myid);
        setData(prodData);
        setSname(prodRes.data.details.name);
        setSmail(prodRes.data.details.mail);
        setPhone(prodRes.data.details.phone);
        setProdExist(true);
        setLoading(false);
      }
      catch (err) {
        console.log(err.response?.data || err.message);
        setProdExist(false);
        setValid(false);
      }
      finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <nav id={styles.navbar}>
        <Link to="/" className={styles.navLogo}>CampusCart</Link>
        <div id={styles.searchBox}>
          <input placeholder="I am looking for ..." />
          <span>
            <img src={search} alt="search" />
          </span>
        </div>
        <div id={styles.navLinks}>
          {valid ? (
            <>
              <div>
                <Link to="/sell">Sell</Link>
              </div>
              <div>
                <Link id={styles.registerNav} to="/profile">
                  Profile
                </Link>
              </div>
            </>
          ) : (
            <>
              <div>
                <Link to="/login">Login</Link>
              </div>
              <div>
                <Link id={styles.registerNav} to="/register">
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>

      {loading ? (
        <div className={styles.loadingIcon}>
          <Oval
            height={80}
            width={80}
            color="#4fa94d"
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#ccc"
            strokeWidth={3}
            strokeWidthSecondary={3} />
          <p className={styles.loadingText}>Loading...</p>
        </div>
      ) : !prodExist ? (
        <div className={styles.loadingIcon}>
          404 Error | Product Doesn&apos;t exist
        </div>
      ) : (
        <div id={styles.productInformation}>
          <div id={styles.imageContainer}>
            <img src={data.pimage} id={styles.pimage} alt={data.pname} />
          </div>
          <div id={styles.productInfocon}>
            <div>
              <p id={styles.pname}>{data.pname}</p>
              <p id={styles.pcat}>{data.pcat}</p>
              <p id={styles.pdetail}>{data.pdetail}</p>
              <p className={styles.pbought}>
                bought on : {data.pdate.slice(0, 10)}
              </p>
              <p className={styles.pbought}>
                sold by : {sname} {valid ? smail : ""}
              </p>
              {valid && (
                <p className={styles.pbought}>phone : {sphone}</p>
              )}
            </div>
            <div className={styles.pricecon}>
              <div id={styles.pprice}>Rs.{data.pprice}/-</div>
            </div>
            {valid && !isMyProd && (
              <div>
                <button onClick={() => setShowChat(true)} className={styles.messageBtn}>
                  💬 Message Seller
                </button>
                {showChat && (
                  <ChatboxPopup
                    receiverId={data.id}
                    onClose={() => setShowChat(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Product;
