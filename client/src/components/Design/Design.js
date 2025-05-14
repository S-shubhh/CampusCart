import React from "react";
import sun from "../../assets/sun.svg";
import styles from "./Design.module.scss";
import hill1 from "../../assets/hill1.svg";
import hill2 from "../../assets/hill2.svg";
import cloud from "../../assets/cloud.svg";

function Design() {
  return (
    <div className={styles.design}>
      <div id={styles.loginLogo}>
        <div id={styles.loginBuyNSell}>
          <div id={styles.loginBuy}>
          CampusCart
          </div>
        </div>
        <div id={styles.loginMotto}>
          <div>connect, buy and sell</div>
        </div>
      </div>
      <div id={styles.scenery}>
        <img id={styles.sun} src={sun} alt="sun" />
        <img id={styles.hill1} src={hill1} alt="hill" />
        <img id={styles.hill2} src={hill2} alt="hill" />
        <img id={styles.cloud} src={cloud} alt="cloud" />
      </div>
    </div>
  );
}

export default Design;
