"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import styles from './BreadCrumbs.module.css'

// Container wrapper
// export const BreadcrumbsContainer = ({ children }) => (
//   <nav style={{ textDecoration: "none", color:"black" }}>{children}</nav>
// );

// Each breadcrumb item
export const BreadcrumbsItem = ({ href, children }) => (
  <Link href={href} style={{ textDecoration: "none" , color:"rgba(107, 114, 128, 1)"}}>
    {children}
  </Link>
);

const BreadCrumbs = () => {
  const paths = usePathname() || ""; // ✅ fallback for null
  const pathNames = paths.split("/").filter((path) => path);

  const pathItems = pathNames.slice(0,1).map((path, i) => ({
    name: path.charAt(0).toUpperCase() + path.slice(1),
    path: pathNames.slice(0, i+1 ).join("/"),
  }));

  return (

    <div className={styles.bread_crumbs}>
      <BreadcrumbsItem href="/" >Home</BreadcrumbsItem>
      {pathItems.map((item, index) => (
        <span key={item.path}>
          {<img src="/account_sidenav/chevron-right-arrow.svg" alt="arrow-right" />}
          {/* ✅ last item plain text */}
          {index === pathItems.length-1 ? (
            <span>{item.name}</span>
          ) : (
            <BreadcrumbsItem href={`/${item.path}`}>
              {item.name}
            </BreadcrumbsItem>
          )}
        </span>
      ))}
    </div>
  );
};

export default BreadCrumbs;
