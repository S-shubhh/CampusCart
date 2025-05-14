import styles from "./Home.module.scss";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { LoaderIcon, toast } from "react-hot-toast";
import Card from "../components/Card/Card";
import searchIcon from "../assets/search.svg";
import table from "../assets/table.svg";
import cycle from "../assets/bicycle.svg";
import setsquare from "../assets/setsquare.svg";
import book from "../assets/book.svg";
import cloth from "../assets/cloth.svg";
import all from "../assets/all.svg";
import MessagesPopup from "./messagePopup";
import { Oval } from "react-loader-spinner";
const CATEGORY_IMAGES = [table, cycle, setsquare, book, cloth, all];
const CATEGORY_IDS = ["table", "cycle", "drafter", "book", "cloth", "all"];
const CATEGORY_COLORS = ["#e1fff8", "#cefff4", "#d2f8fa", "#cefff4", "#bdfff1", "#d6cfff"];
function Home() {
  const [loading, setLoading] = useState(true);
  const [searchval, setSearchval] = useState("");
  const [allProd, setAllProd] = useState([]);
  const [category, setCategory] = useState("all");
  const [valid, setValid] = useState(false);
  const [showMessagesPopup, setShowMessagesPopup] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = JSON.parse(localStorage.getItem("token"));

      if (token) {
        setValid(true);
      }
      try {
        const prodRes = await axios.post(`${process.env.REACT_APP_BASEURL}/api/allprod`);
        setAllProd(prodRes.data.details || []); // ✅ use `details` instead of `products`
      } catch (err) {
        toast.error(" Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  const filteredProducts = useMemo(() => {
    if (category === "all") return allProd;
    return allProd.filter((prod) => prod.pcat === category);
  }, [category, allProd]);
  const handleSearch = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASEURL}/api/searchproduct`, { searchval });
      setAllProd(res.data.mysearchdata);
    } catch (error) {
      toast.error("Search failed.");
      console.error(error);
    }
  };
  const handleSendMessage = async (buyerId, sellerId, message) => {
    try {
      await axios.post(`${process.env.REACT_APP.BASEURL}/api/sendmessage`, { buyerId, sellerId, message });
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Error sending message");
      console.error(error);
    }
  };

  return (
    <>
      <nav id={styles.navbar}>
        {/* <div id={styles.navLogo} >CampusCart</div> */}
        <Link to="/" className={styles.navLogo}>CampusCart</Link>

        <div id={styles.searchBox}>
          <input
            value={searchval}
            onChange={(e) => setSearchval(e.target.value)}
            placeholder="I am looking for ..."
          />
          <span onClick={handleSearch}>
            <img src={searchIcon} alt="search" />
          </span>
        </div>
        <div id={styles.navLinks}>
          {valid ? (
            <>
            <div className={styles.navButton} onClick={() => setShowMessagesPopup(true)}>Messages</div>
              <div><Link to="/sell">Sell</Link></div>
              <div><Link id={styles.registerNav} to="/profile">Profile</Link></div>
            </>
          ) : (
            <>
              <div><Link to="/login">Login</Link></div>
              <div><Link id={styles.registerNav} to="/register">Register</Link></div>
            </>
          )}
        </div>
      </nav>

      <div className={styles.homePage}>
        <div id={styles.categories}>
          {CATEGORY_IMAGES.map((icon, index) => (
            <div key={index} className={styles.bannerImg} style={{ background: CATEGORY_COLORS[index] }}>
              <img
                id={CATEGORY_IDS[index]}
                src={icon}
                alt={CATEGORY_IDS[index]}
                onClick={() => setCategory(CATEGORY_IDS[index])}
              />
            </div>
          ))}
        </div>
        <div id={styles.productTitle}>
          <span>Products : {category}</span>
        </div>
        <div id={styles.productsContainer}>
          {!loading ? (
            filteredProducts.length > 0 ? (
              filteredProducts.map((prod, idx) => <Card key={idx} ele={prod} />)
            ) : (
              <div className={styles.loadingIc}>
                <p className={styles.loadingText}>No products found.</p>
              </div>
            )
          ) : (
            <div className={styles.loadingIc}>
              <Oval
                height={80}
                width={80}
                color="#4fa94d"
                visible={true}
                ariaLabel="oval-loading"
                secondaryColor="#ccc"
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
            </div>
          )}
        </div>
        {showMessagesPopup && (
          <MessagesPopup onClose={() => setShowMessagesPopup(false)} />
        )}

      </div>
    </>
  );
}
export default Home;