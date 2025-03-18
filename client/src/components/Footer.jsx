import React from "react";
import { FaCopyright } from "react-icons/fa";

export default function Footer() {
  const footerStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    textAlign: "center",
    fontWeight:"bold",
    padding: " 0",
    position: "fixed",
    width: "100%",
    bottom: "0",
    left: "0",

  };

  return (
    <footer style={footerStyle}>
      <p>
        <FaCopyright /> {new Date().getFullYear()} by Ajay Pandey. All Rights Reserved.
      </p>
    </footer>
  );
}
