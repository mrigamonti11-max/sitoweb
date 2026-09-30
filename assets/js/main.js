(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu mobile */
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.visually-hidden').textContent = open ? 'Chiudi il menu' : 'Apri il menu';
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* Decollo: la quota sale insieme allo zoom della mappa */
  const altitude = document.querySelector('[data-altitude]');
  if (altitude && !reduceMotion) {
    const target = 120;
    const duration = 2600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      altitude.textContent = Math.round(target * ease(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    altitude.textContent = '0';
    requestAnimationFrame(tick);
  }

  /* Timer di registrazione */
  const timer = document.querySelector('[data-rec-timer]');
  if (timer) {
    const started = Date.now();
    const pad = (n) => String(n).padStart(2, '0');
    const render = () => {
      const s = Math.floor((Date.now() - started) / 1000);
      timer.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    };
    render();
    if (!reduceMotion) setInterval(render, 1000);
  }

  /* Modulo preventivo: validazione e invio tramite client di posta */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const messages = {
      nome: 'Inserisci nome e cognome.',
      email: "Inserisci un indirizzo email valido, ad esempio nome@azienda.it.",
      servizio: 'Scegli il servizio che ti interessa.',
      luogo: 'Indica dove si svolgerà il volo.',
      privacy: "Per inviare la richiesta devi accettare l'informativa privacy."
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;
      form.querySelectorAll('[required]').forEach((field) => {
        const valid = field.checkValidity();
        field.setAttribute('aria-invalid', String(!valid));
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.textContent = messages[firstInvalid.name] || 'Controlla i campi evidenziati.';
        status.classList.add('is-error');
        firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      const body = [
        `Nome: ${data.get('nome')}`,
        `Email: ${data.get('email')}`,
        `Telefono: ${data.get('telefono') || '-'}`,
        `Servizio: ${data.get('servizio')}`,
        `Luogo del volo: ${data.get('luogo')}`,
        '',
        data.get('messaggio') || ''
      ].join('\n');
      const subject = `Richiesta preventivo: ${data.get('servizio')} a ${data.get('luogo')}`;

      status.classList.remove('is-error');
      status.textContent = 'Richiesta pronta: si sta aprendo il tuo programma di posta per inviarla.';
      window.location.href = `mailto:info@planatadroni.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    form.addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
