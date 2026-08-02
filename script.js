'use strict';

// TODO: Crea un formulario en Formspree y sustituye este placeholder por el endpoint real.
// Configura Formspree para reenviar los mensajes a pjfautoimport@gmail.com.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzeezqe';

const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
const navLinks = mainNav.querySelectorAll('a');
const form = document.querySelector('#contact-form');
const submitButton = form.querySelector('.submit-button');
const formStatus = document.querySelector('#form-status');

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación');
  mainNav.classList.toggle('open', !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
    mainNav.classList.remove('open');
  });
});

document.addEventListener('click', (event) => {
  if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const fields = {
  nombre: {
    element: document.querySelector('#nombre'),
    error: document.querySelector('#error-nombre'),
    validate: (value) => value.trim().length >= 2 ? '' : 'Escribe tu nombre.'
  },
  email: {
    element: document.querySelector('#email'),
    error: document.querySelector('#error-email'),
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Introduce un correo electrónico válido.'
  },
  telefono: {
    element: document.querySelector('#telefono'),
    error: document.querySelector('#error-telefono'),
    validate: (value) => !value.trim() || /^[+\d\s()-]{7,20}$/.test(value.trim()) ? '' : 'Revisa el formato del teléfono.'
  },
  mensaje: {
    element: document.querySelector('#mensaje'),
    error: document.querySelector('#error-mensaje'),
    validate: (value) => value.trim().length >= 15 ? '' : 'Escribe un mensaje de al menos 15 caracteres.'
  },
  privacidad: {
    element: document.querySelector('#privacidad'),
    error: document.querySelector('#error-privacidad'),
    validate: (_, element) => element.checked ? '' : 'Debes aceptar la política de privacidad.'
  }
};

function validateField(config) {
  const message = config.validate(config.element.value, config.element);
  config.error.textContent = message;
  config.element.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

Object.values(fields).forEach((config) => {
  const eventName = config.element.type === 'checkbox' ? 'change' : 'blur';
  config.element.addEventListener(eventName, () => validateField(config));
  if (config.element.type !== 'checkbox') {
    config.element.addEventListener('input', () => {
      if (config.element.getAttribute('aria-invalid') === 'true') validateField(config);
    });
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  if (form.elements.empresa_web.value) return;

  const isValid = Object.values(fields).every(validateField);
  if (!isValid) {
    formStatus.textContent = 'Revisa los campos señalados antes de enviar.';
    formStatus.classList.add('error');
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  if (FORMSPREE_ENDPOINT.includes('ID_DEL_FORMULARIO')) {
    formStatus.textContent = 'El formulario todavía no está conectado. Escribe a pjfautoimport@gmail.com o configura el endpoint de Formspree en script.js.';
    formStatus.classList.add('error');
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add('loading');
  submitButton.querySelector('.button-label').textContent = 'Enviando…';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error('Formspree devolvió un error.');

    form.reset();
    Object.values(fields).forEach(({ element, error }) => {
      error.textContent = '';
      element.removeAttribute('aria-invalid');
    });
    formStatus.textContent = 'Solicitud enviada correctamente. Nos pondremos en contacto contigo.';
    formStatus.classList.add('success');
  } catch (error) {
    console.error(error);
    formStatus.textContent = 'No se ha podido enviar el formulario. Inténtalo de nuevo o escribe a pjfautoimport@gmail.com.';
    formStatus.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    submitButton.querySelector('.button-label').textContent = 'Enviar solicitud';
  }
});

document.querySelector('#current-year').textContent = new Date().getFullYear();

document.querySelectorAll('[data-dialog]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector(`#${button.dataset.dialog}`)?.showModal());
});

document.querySelectorAll('.legal-dialog').forEach((dialog) => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
});
