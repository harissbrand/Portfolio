import { useEffect, useState } from 'react'
import PS4FlowBackground from './components/PS4FlowBackground'
import Header from './components/Header'
import Hero from './components/Hero'
import Boot from './components/Boot'
import './App.css'

function App() {
  const [ready, setReady] = useState(false);

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
        <Header ready={ready} />
        <Hero />
      </div>
      <Boot ready={ready} />
    </>
  )
}

export default App
