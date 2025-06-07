import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      style={{
        background: "#343a40",
        padding: "1rem 0",
        textAlign: "center",
        borderTop: "1px solid #23272b",
        marginTop: "2rem",
        marginBottom: "0",
        width: "100%",
        position: "relative",
        left: 0,
        bottom: 0,
      }}
    >
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <Link
          to="/terms_and_conditions"
          style={{
            margin: "0 0.5rem",
            color: "#fff",
            textDecoration: "none",
            fontSize: "1rem",
            whiteSpace: "nowrap",
          }}
        >
          Terms & Conditions
        </Link>
        <Link
          to="/privacy_policy"
          style={{
            margin: "0 0.5rem",
            color: "#fff",
            textDecoration: "none",
            fontSize: "1rem",
            whiteSpace: "nowrap",
          }}
        >
          Privacy Policy
        </Link>
        <Link
          to="/shipping_delivery_policy"
          style={{
            margin: "0 0.5rem",
            color: "#fff",
            textDecoration: "none",
            fontSize: "1rem",
            whiteSpace: "nowrap",
          }}
        >
          Shipping & Delivery Policy
        </Link>
        <Link
          to="/cancellation_refund_policy"
          style={{
            margin: "0 0.5rem",
            color: "#fff",
            textDecoration: "none",
            fontSize: "1rem",
            whiteSpace: "nowrap",
          }}
        >
          Cancellation & Refund Policy
        </Link>
        <Link
          to="/contact_us"
          style={{
            margin: "0 0.5rem",
            color: "#fff",
            textDecoration: "none",
            fontSize: "1rem",
            whiteSpace: "nowrap",
          }}
        >
          Contact Us
        </Link>
      </nav>
      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "0.9rem",
          color: "#bbb",
        }}
      >
        &copy; {new Date().getFullYear()} LK Tool Kit
      </div>
      <style>
        {`
          @media (max-width: 600px) {
            footer nav {
              flex-direction: column;
              gap: 0.25rem;
            }
            footer nav a {
              margin: 0.25rem 0 !important;
              font-size: 0.95rem !important;
            }
          }
        `}
      </style>
    </footer>
  );
}

export default Footer;
