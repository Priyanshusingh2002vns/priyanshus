import styles from './page.module.css';
import Image from 'next/image';

export default function Home() {
  return (
    <div className={styles.container}>

      <div className={styles.main_container}>
        <div className={styles.left}>
          <h3 className={styles.h2}>
            Get the <span>Preqt</span> App and keep in touch around the clock!
          </h3>
          <ul className={styles.ul}>
            <li><img className={styles.check_icon} src="/acconutfooter/tick-icon.svg" alt="tick-icon" /><span> Monitor your investments in real-time.</span></li>
            <li><img className={styles.check_icon} src="/acconutfooter/tick-icon.svg" alt="tick-icon" /><span> Receive tailored deal suggestions.</span></li>
            <li><img className={styles.check_icon} src="/acconutfooter/tick-icon.svg" alt="tick-icon" /><span> Get real-time updates and alerts.</span></li>
          </ul>
        </div>

        <div className={styles.right}>
          <Image
            src="/acconutfooter/footer-phone-img.png"
            alt="QR Code on phone"
            width={396}
            height={291}
            className={styles.qrImage}
          />
        </div></div>
    </div>
  );
}
