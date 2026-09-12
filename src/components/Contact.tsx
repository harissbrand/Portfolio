import { User, Mail, Tag, MessageSquareText, Phone, Send } from 'lucide-react';
import './Contact.css';

interface Social {
  label: string;
  href: string;
  logo: string;
  color?: string;
}

const SOCIALS: Social[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/ShinShirooo44?locale=fr_FR',
    logo: '/logos/facebook-original-devicon.svg',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/261387857056',
    logo: '/logos/whatsapp.svg',
    color: '#2fe07a',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/harissbrand',
    logo: '/logos/github.svg',
    color: '#f0f6fc',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/brandon-harison-93224827b/',
    logo: '/logos/linkedin-original-devicon.svg',
  },
];

export default function Contact() {
  return (
    <div className="contact">
      <div className="contact__info">
        <h2 className="contact__title">Travaillons ensemble</h2>
        <p className="contact__intro">
          Une idée, un projet, une collaboration ? N&apos;hésite pas à me
          contacter, je serai ravi d&apos;en discuter avec toi.
        </p>
        <div className="contact__direct">
          <a className="contact__direct-item" href="mailto:harisbrandon44@gmail.com">
            <span className="contact__direct-icon" aria-hidden="true">
              <Mail size={17} strokeWidth={1.8} />
            </span>
            <span className="contact__direct-value">harisbrandon44@gmail.com</span>
          </a>
          <a className="contact__direct-item" href="tel:+261387857056">
            <span className="contact__direct-icon" aria-hidden="true">
              <Phone size={17} strokeWidth={1.8} />
            </span>
            <span>
              <span className="contact__direct-label">Téléphone</span>
              <span className="contact__direct-value">+261 387 857 056</span>
            </span>
          </a>
        </div>
        <ul className="contact__socials">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="contact__social"
              >
                <span
                  className="contact__social-icon"
                  style={social.color ? { color: social.color } : undefined}
                  aria-hidden="true"
                >
                  <img src={social.logo} alt="" draggable={false} />
                </span>
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <form
        className="contact__form"
        aria-label="Formulaire de contact"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="contact__form-head">
          <span className="contact__form-icon" aria-hidden="true">
            <Send size={18} strokeWidth={1.8} />
          </span>
          <span>
            <span className="contact__form-title">Formulaire de contact</span>
            <span className="contact__form-sub">
              Pour un projet ou des recommandations
            </span>
          </span>
        </div>
        <div className="contact__row">
          <label className="contact__field">
            <span className="contact__field-icon" aria-hidden="true">
              <User size={16} strokeWidth={1.8} />
            </span>
            <input type="text" name="name" placeholder="Nom" autoComplete="name" />
          </label>
          <label className="contact__field">
            <span className="contact__field-icon" aria-hidden="true">
              <Mail size={16} strokeWidth={1.8} />
            </span>
            <input type="email" name="email" placeholder="Email" autoComplete="email" />
          </label>
        </div>
        <label className="contact__field">
          <span className="contact__field-icon" aria-hidden="true">
            <Tag size={16} strokeWidth={1.8} />
          </span>
          <input type="text" name="subject" placeholder="Objet" />
        </label>
        <label className="contact__field contact__field--area">
          <span className="contact__field-icon" aria-hidden="true">
            <MessageSquareText size={16} strokeWidth={1.8} />
          </span>
          <textarea name="message" rows={5} placeholder="Votre message..." />
        </label>
        <button type="submit" className="contact__submit">
          <Send size={16} strokeWidth={2} aria-hidden="true" />
          Envoyer
        </button>
      </form>
    </div>
  );
}
