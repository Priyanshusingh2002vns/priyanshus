import React from "react";
import styles from "./DealsDiffPreqt.module.css";

const DealsDiffPreqt = () => {
    return (
        <section className={styles.diffprqtsection}>
            <div className={styles.diffprqt}>
                <div className={`container ${styles.subcontainer}`}>
                    <div className={styles.diffprqtcontent}>
                        <div className={styles.glowContainer}>
                            <div className={styles.glowLine}></div>
                        </div>
                        <h2>How <span>PrEqt</span> does things differently</h2>
                        <img src="/diffprqt.svg" alt="diffprqt" width={1285} height={650}/>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DealsDiffPreqt;
