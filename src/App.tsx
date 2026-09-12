import { useCallback, useEffect, useRef, useState } from 'react'
import PS4FlowBackground from './components/PS4FlowBackground'
import Header from './components/Header'
import Hero from './components/Hero'
import Boot from './components/Boot'
import {
  SECTION_ORDER,
  ContactSection,
  ProjetsSection,
  type SectionId,
} from './components/Sections'
import Profil from './components/Profil'
import Competences from './components/Competences'
import './App.css'

function App() {
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [section, setSection] = useState<SectionId>('accueil');
  const index = SECTION_ORDER.indexOf(section);

  // Carrousel avec aperçu : panneaux à 88vw centrés (6vw de peek).
  const PANEL_RATIO = 0.88;

  const goTo = useCallback((id: SectionId) => {
    setSection(id);
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    const current = sectionRef.current;
    const next = Math.min(
      Math.max(SECTION_ORDER.indexOf(current) + dir, 0),
      SECTION_ORDER.length - 1,
    );
    setSection(SECTION_ORDER[next]);
  }, []);

  // Clavier global (le header gère déjà ses propres flèches).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest('.ps4-header__nav')) return;
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  // Molette horizontale (trackpads) avec verrou anti-spam.
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - wheelLock.current < 900) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
      wheelLock.current = now;
      step(e.deltaX > 0 ? 1 : -1);
    }
  };

  // Swipe tactile avec suivi de doigt : le deck colle au geste en temps
  // réel (rebond élastique aux bords), puis s'aimante au relâcher avec
  // prise en compte de la vitesse (flick). Vers la droite → suivant.
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef(section);
  const drag = useRef<{
    active: boolean;
    startX: number;
    baseX: number;
    width: number;
    lastX: number;
    lastT: number;
    prevX: number;
    prevT: number;
  } | null>(null);

  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  const deckWidth = () =>
    trackRef.current?.parentElement?.clientWidth ?? window.innerWidth;

  // Le carrousel défile nativement sur mobile : on n'y capte pas le swipe du deck.
  const skipDrag = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest && target.closest('.skills__stage')) {
      skipDrag.current = true;
      return;
    }
    skipDrag.current = false;
    const track = trackRef.current;
    if (!track) return;
    const width = deckWidth();
    const touch = e.touches[0];
    const now = performance.now();
    // Position visuelle réelle, même en pleine transition (clic/molette/touche
    // en cours) : le drag repart d'où l'œil est, aucun saut.
    const live = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
    const baseX = Number.isFinite(live)
      ? live
      : -SECTION_ORDER.indexOf(sectionRef.current) * width;
    track.style.transition = 'none';
    drag.current = {
      active: true,
      startX: touch.clientX,
      baseX,
      width,
      lastX: touch.clientX,
      lastT: now,
      prevX: touch.clientX,
      prevT: now,
    };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (skipDrag.current) return;
    const current = drag.current;
    const track = trackRef.current;
    if (!current || !current.active || !track) return;
    const touch = e.touches[0];
    const now = performance.now();
    current.prevX = current.lastX;
    current.prevT = current.lastT;
    current.lastX = touch.clientX;
    current.lastT = now;
    // Panneaux à 88vw centrés : gouttière de 6vw de chaque côté (peek).
    const panel = PANEL_RATIO * current.width;
    const gutter = (current.width - panel) / 2;
    const min = -(SECTION_ORDER.length - 1) * panel + gutter;
    let pos = current.baseX + (touch.clientX - current.startX);
    // Rebonds élastiques aux extrémités du deck.
    if (pos > gutter) pos = gutter + (pos - gutter) * 0.35;
    else if (pos < min) pos = min + (pos - min) * 0.35;
    track.style.transform = `translateX(${pos}px)`;
  };
  const onTouchEnd = () => {
    if (skipDrag.current) {
      skipDrag.current = false;
      return;
    }
    const current = drag.current;
    const track = trackRef.current;
    drag.current = null;
    if (!current || !current.active || !track) return;
    const dx = current.lastX - current.startX;
    const dt = Math.max(current.lastT - current.prevT, 1);
    const velocity = (current.lastX - current.prevX) / dt; // px/ms
    const panel = PANEL_RATIO * current.width;
    const gutter = (current.width - panel) / 2;
    const raw = (gutter - (current.baseX + dx)) / panel;
    let target = Math.round(raw);
    // Flick rapide : pousse d'un cran dans le sens du geste.
    if (velocity < -0.5) target = Math.max(target, Math.floor(raw) + 1);
    else if (velocity > 0.5) target = Math.min(target, Math.ceil(raw) - 1);
    target = Math.min(Math.max(target, 0), SECTION_ORDER.length - 1);
    // La transition CSS reprend depuis la position du doigt : aimantation douce.
    track.style.transition = '';
    track.style.transform = `translateX(${-target * panel + gutter}px)`;
    setSection(SECTION_ORDER[target]);
  };

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();
    const done = () => {
      if (cancelled) return;
      // Le logo doit respirer un instant : affichage minimal de 1.8s.
      const wait = Math.max(0, 1800 - (Date.now() - startedAt));
      setTimeout(() => {
        if (!cancelled) setReady(true);
      }, wait);
    };
    // Tout est chargé au démarrage : on attend les graisses SST
    // (sécurité : timeout pour ne jamais bloquer l'app).
    const safety = setTimeout(done, 2500);
    Promise.all([
      document.fonts.load('400 16px "SST"'),
      document.fonts.load('500 16px "SST"'),
      document.fonts.load('700 16px "SST"'),
    ])
      .catch(() => {})
      .finally(() => {
        clearTimeout(safety);
        done();
      });
    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, []);

  return (
    <>
      <div className={`app${ready ? ' is-awake' : ''}`}>
        <PS4FlowBackground />
        <Header
          ready={ready}
          active={section}
          onSelect={(id) => goTo(id as SectionId)}
          onPreview={setPreview}
        />
        <div
          className="deck"
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div
            ref={trackRef}
            className="deck__track"
            style={{ transform: `translateX(calc(${-index * 88}vw + 6vw))` }}
          >
            <div className={`deck__panel${index === 0 ? ' is-active' : ''}`}>
              <Hero preview={preview} onNavigate={goTo} />
            </div>
            <div className={`deck__panel${index === 1 ? ' is-active' : ''}`}>
              <Profil active={index === 1} />
            </div>
            <div className={`deck__panel${index === 2 ? ' is-active' : ''}`}>
              <Competences />
            </div>
            <div className={`deck__panel${index === 3 ? ' is-active' : ''}`}>
              <ProjetsSection />
            </div>
            <div className={`deck__panel${index === 4 ? ' is-active' : ''}`}>
              <ContactSection />
            </div>
          </div>
        </div>
      </div>
      <Boot ready={ready} />
    </>
  )
}

export default App
