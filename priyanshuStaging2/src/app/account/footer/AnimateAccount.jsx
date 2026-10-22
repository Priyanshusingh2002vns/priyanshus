import styles from './page.module.css';
import Image from 'next/image';

export default function AnimateAccount() {
  return (
    <div className={styles.container}>

      <div className={styles.main_container}>
        <div className={styles.left}>
          <h2 className={styles.h2}>
          Gain early access to tomorrow’s leaders
          </h2>
          <ul className={styles.ul}>
            <li><img className={styles.check_icon} src="/acconutfooter/tick-icon.svg" alt="tick-icon" /><span> Monitor your investments in real-time.</span></li>
            <li><img className={styles.check_icon} src="/acconutfooter/tick-icon.svg" alt="tick-icon" /><span> Receive tailored deal suggestions.</span></li>
            <li><img className={styles.check_icon} src="/acconutfooter/tick-icon.svg" alt="tick-icon" /><span> Get real-time updates and alerts.</span></li>
          </ul>
        </div>

        <div className={styles.right} >
          <Image
            src="/assets/pictures/animateaccount.svg"
            alt="QR Code on phone"
            width={396}
            height={291}
            className={styles.qrImage} style={{width: '100%'}}
          />
        </div></div>
    </div>
  );
}
