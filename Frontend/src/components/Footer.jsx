import { Link } from "react-router-dom";

function Footer() {
  // Ensure the footer always sticks to the bottom if content is short
  // (requires parent layout to use minHeight: "100vh" and flex column)
  return (
    <footer style={{
      background: "#343a40",
      padding: "1rem 0",
      textAlign: "center",
      borderTop: "1px solid #23272b",
      marginTop: "2rem",
      marginBottom: "0",
      width: "100%",
      position: "relative",
      left: 0,
      bottom: 0
    }}>
      <nav>
        <Link to="/terms_and_conditions" style={{ margin: "0 1rem", color: "#fff", textDecoration: "none" }}>Terms & Conditions</Link>
        <Link to="/privacy_policy" style={{ margin: "0 1rem", color: "#fff", textDecoration: "none" }}>Privacy Policy</Link>
        <Link to="/shipping_delivery_policy" style={{ margin: "0 1rem", color: "#fff", textDecoration: "none" }}>Shipping & Delivery Policy</Link>
        <Link to="/cancellation_refund_policy" style={{ margin: "0 1rem", color: "#fff", textDecoration: "none" }}>Cancellation & Refund Policy</Link>
        <Link to="/contact_us" style={{ margin: "0 1rem", color: "#fff", textDecoration: "none" }}>Contact Us</Link>
      </nav>
      <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#bbb" }}>
        &copy; {new Date().getFullYear()} LK Tool Kit
      </div>
    </footer>
  );
}

export default Footer;
