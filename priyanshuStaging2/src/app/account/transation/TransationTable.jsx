'use client'
import { usePathname } from 'next/navigation';
import styles from './page.module.css'
import React, { useEffect } from 'react'

const transactions = [
  {
    name: 'Parth Electricals & Engin...',
    amount: '₹50,000',
    units: 40,
    lotSize: '1 Lot',
    date: '24 Jun 2025, 11:30 AM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"
    
  },
  {
    name: 'Tech Innovations Inc.',
    amount: '₹75,000',
    units: 30,
    lotSize: '1 Lot',
    date: '25 Jun 2025, 10:00 AM',
    status: 'Pending',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Green Energy Solutions',
    amount: '₹60,000',
    units: 25,
    lotSize: '1 Lot',
    date: '26 Jun 2025, 12:00 PM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Smart Home Technologies',
    amount: '₹40,000',
    units: 15,
    lotSize: '1 Lot',
    date: '27 Jun 2025, 2:30 PM',
    status: 'Cancelled',
    img : "/accounttransation_icon/ellipsis.svg"
    
  },
  {
    name: 'AI Robotics Corporation',
    amount: '₹90,000',
    units: 50,
    lotSize: '1 Lot',
    date: '28 Jun 2025, 3:00 PM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Quantum Computing Sol...',
    amount: '₹120,000',
    units: 60,
    lotSize: '1 Lot',
    date: '29 Jun 2025, 4:00 PM',
    status: 'Pending',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'BioTech Innovations',
    amount: '₹55,000',
    units: 35,
    lotSize: '1 Lot',
    date: '30 Jun 2025, 1:00 PM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Cloud Services Enterpris...',
    amount: '₹80,000',
    units: 45,
    lotSize: '1 Lot',
    date: '1 Jul 2025, 9:00 AM',
    status: 'Pending',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Digital Marketing Agency',
    amount: '₹28,000',
    units: 20,
    lotSize: '1 Lot',
    date: '2 Jul 2025, 11:00 AM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"


  },
  {
    name: 'Sustainable Materials Inc.',
    amount: '₹35,000',
    units: 18,
    lotSize: '1 Lot',
    date: '3 Jul 2025, 5:00 PM',
    status: 'Cancelled',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Cybersecurity Solutions',
    amount: '₹95,000',
    units: 55,
    lotSize: '1 Lot',
    date: '4 Jul 2025, 11:45 AM',
    status: 'Pending',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'E-Commerce Ventures',
    amount: '₹50,000',
    units: 30,
    lotSize: '1 Lot',
    date: '5 Jul 2025, 2:00 PM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Automotive Tech Innovat...',
    amount: '₹70,000',
    units: 40,
    lotSize: '1 Lot',
    date: '6 Jul 2025, 10:30 AM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"

  },
  {
    name: 'Healthcare Technologies',
    amount: '₹100,000',
    units: 70,
    lotSize: '1 Lot',
    date: '7 Jul 2025, 3:15 PM',
    status: 'Confirmed',
    img : "/accounttransation_icon/ellipsis.svg"

  },
];

const getStatusClass = (status) => {
  switch (status) {
    case 'Confirmed':
      return styles.confirmed;
    case 'Pending':
      return styles.pending;
    case 'Cancelled':
      return styles.cancelled;
    default:
      return '';
  }
};

export default function TransactionsTable() {
const path= usePathname();


  return (

    
    <div className={styles.container}>
      <h2 className={styles.heading}>Transactions</h2>
      <div className={styles.hr} ></div>
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
    
          <div>Deal Name</div>
          <div>Amount (₹)</div>
          <div>Units Per Lot</div>
          <div>Lot Size</div>
          <div>Updated At</div>
          <div>Status</div>
        
          
          
          
        </div>
        {transactions.map((txn, idx) => (
          <div className={styles.row} key={idx}>
            {/* <div>{response.id}</div> */}
    
            <div>{txn.name}</div>
            <div>{txn.amount}</div>
            <div>{txn.units}</div>
            <div>{txn.lotSize}</div>
            <div>{txn.date}</div>
            <div className={getStatusClass(txn.status)}>{txn.status}</div>
           <div className={styles.img1}> <img src={txn.img} alt="ellipsis" /></div>
          </div>
        ))}
      </div>
    </div>

  );
}
