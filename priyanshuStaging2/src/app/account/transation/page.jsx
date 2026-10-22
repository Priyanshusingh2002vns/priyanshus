import styles from './page.module.css';

import React from 'react'
// import TransactionsTable from './TransationTable';
import TransactionComponent from '@/app/transaction-page/transaction-Component/TransactionComponent';

export default function page() {
  return (

    <div className={styles.TransactionComponent}>
      <TransactionComponent/>
      </div>
  )
}
