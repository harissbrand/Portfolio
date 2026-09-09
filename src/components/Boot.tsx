import './Boot.css';

export default function Boot({ ready }: { ready: boolean }) {
  return (
    <div className={`boot${ready ? ' boot--hidden' : ''}`} aria-hidden={ready}>
      <img className="boot__logo" src="/logo.jpg" alt="" aria-hidden="true" />
    </div>
  );
}
