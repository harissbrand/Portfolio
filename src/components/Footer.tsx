import './Footer.css';

export default function Footer() {
  return (
    <footer className="ps4-footer" aria-label="Pied de page">
      <span className="ps4-footer__copy">
        © {new Date().getFullYear()} HARISON Maharo Brandon
      </span>
    </footer>
  );
}
