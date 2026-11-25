/* Golden Properties NSW Pty Ltd - site scripts (no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Current year in the footer */
  var yearNodes = document.querySelectorAll('[data-year]');
  for (var y = 0; y < yearNodes.length; y++) {
    yearNodes[y].textContent = String(new Date().getFullYear());
  }

  /* Mobile menu */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    var iconOpen = toggle.querySelector('[data-icon="open"]');
    var iconClose = toggle.querySelector('[data-icon="close"]');
    if (iconOpen) iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setMenu(false);
    });
  }

  /* Smooth scroll for in-page links, moving focus to the target */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;
    var target = document.getElementById(hash.slice(1));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });

    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    if (history.replaceState) history.replaceState(null, '', hash);
  });

  /* Enquiry form: validation only. The form is not connected, so nothing is ever sent. */
  var form = document.getElementById('enquiry-form');
  var statusBox = document.getElementById('form-status');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phonePattern = /^[0-9+()\s-]{8,20}$/;

  function setError(field, message) {
    var errorNode = document.getElementById(field.id + '-error');
    if (errorNode) {
      errorNode.textContent = message || '';
      errorNode.hidden = !message;
    }
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function checkField(field) {
    var value = field.value.trim();
    var message = '';

    if (field.id === 'name' && value.length < 2) {
      message = 'Please enter your name.';
    } else if (field.id === 'email') {
      if (!value) message = 'Please enter your email address.';
      else if (!emailPattern.test(value)) message = 'Please enter a valid email address, for example name@domain.com.au.';
    } else if (field.id === 'phone' && value && !phonePattern.test(value)) {
      message = 'Please enter a valid phone number, or leave this field blank.';
    } else if (field.id === 'message' && value.length < 10) {
      message = 'Please tell us a little about your enquiry (at least 10 characters).';
    }

    setError(field, message);
    return !message;
  }

  if (form && statusBox) {
    var fields = ['name', 'email', 'phone', 'message']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var attempted = false;

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (attempted) checkField(field);
      });
      field.addEventListener('input', function () {
        if (attempted && field.getAttribute('aria-invalid') === 'true') checkField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;

      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!checkField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        statusBox.className = 'rounded-xl border border-[#B42318]/40 bg-[#B42318]/5 p-4 text-sm leading-relaxed text-[#8A1B12]';
        statusBox.textContent = 'Please correct the highlighted fields and try again.';
        firstInvalid.focus();
        return;
      }

      statusBox.className = 'rounded-xl border border-gold/60 bg-gold-soft/40 p-4 text-sm leading-relaxed text-dark';
      statusBox.textContent = 'Not sent: this form is not yet connected, so your enquiry has not reached us and nothing has been stored. ' +
        'Your text is still in the form if you want to keep a copy. Our direct phone and email details will be added to this page.';
    });
  }

  /* Privacy Policy and Terms of Service dialogs (Esc closes them natively) */
  var lastTrigger = null;

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('modal-open');
    var closeBtn = dialog.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      dialog.dispatchEvent(new Event('close'));
    }
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-modal]');
    if (opener) {
      lastTrigger = opener;
      openDialog(document.getElementById(opener.getAttribute('data-open-modal')));
      return;
    }
    var closer = e.target.closest('[data-close-modal]');
    if (closer) closeDialog(closer.closest('dialog'));
  });

  var dialogs = document.querySelectorAll('dialog.legal-dialog');
  for (var d = 0; d < dialogs.length; d++) {
    (function (dialog) {
      /* Clicking the dark backdrop closes the dialog */
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog) closeDialog(dialog);
      });
      dialog.addEventListener('close', function () {
        document.body.classList.remove('modal-open');
        if (lastTrigger) lastTrigger.focus();
      });
    })(dialogs[d]);
  }
})();
