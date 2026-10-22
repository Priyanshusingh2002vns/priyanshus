"use client"
import React, { useEffect, useState } from "react";
import Details_Com from "./details/Detalis_Com";
import Sidenav from "./Sidenav"; // Sidebar component
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 580);
    };

    handleResize(); // run initially
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

 

  return (
    <div>
      {/* Agar mobile screen hai to Sidebar dikhana */}
      {isMobile ? <Sidenav /> : <Details_Com />}
    </div>
  );
}





