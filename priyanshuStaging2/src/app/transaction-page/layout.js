import FAQSection from '../components/home/FAQSection/FAQSection';
import { Geist, Geist_Mono } from 'next/font/google';
 import Accountfooter from '@/app/account/footer/Accountfooter';
import Footer from '../common/navBar/Footer';
import NavBar from '../common/navBar/NavBar';
import styles from './transaction-layout.module.css'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function layout({ children }) {
  return (
    
      
      <div>
          
            <div>
              <NavBar/>
              {children}
             
              <div className={styles.faq}><FAQSection/> </div>
              <Accountfooter/>
              <Footer/>
              
            </div>
        </div>
    
  );
}
