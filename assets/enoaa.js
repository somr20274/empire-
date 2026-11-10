/* ENOAA – interactions des sections personnalisées */
(function () {
  function selectCard(card) {
    var wrap = card.closest('[data-enoaa-bundle]');
    wrap.querySelectorAll('[data-card]').forEach(function (c) {
      c.classList.toggle('is-selected', c === card);
      c.setAttribute('aria-checked', c === card ? 'true' : 'false');
    });
  }

  // Sélection d'une carte d'offre
  document.addEventListener('click', function (e) {
    if (e.target.closest('select, label')) return;
    var card = e.target.closest('.enoaa-bundle [data-card]');
    if (card) selectCard(card);
  });
  document.addEventListener('keydown', function (e) {
    var card = e.target.closest && e.target.closest('.enoaa-bundle [data-card]');
    if (card && (e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); selectCard(card); }
  });

  // Ajout au panier : on ajoute un pack par menu de taille de la carte sélectionnée
  document.addEventListener('submit', async function (e) {
    var form = e.target;
    if (!form.id) return;
    var wrap = document.querySelector('[data-enoaa-bundle][data-form="' + form.getAttribute('id') + '"]');
    if (!wrap) return;
    var card = wrap.querySelector('[data-card].is-selected') || wrap.querySelector('[data-card]');
    var selects = card.querySelectorAll('[data-pack-select]');
    if (!selects.length) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var counts = {};
    selects.forEach(function (s) { counts[s.value] = (counts[s.value] || 0) + 1; });
    var items = Object.keys(counts).map(function (id) { return { id: Number(id), quantity: counts[id] }; });

    var buttons = Array.prototype.slice.call(document.querySelectorAll('button[type="submit"][form="' + form.getAttribute('id') + '"], #' + CSS.escape(form.getAttribute('id')) + ' button[type="submit"]'));
    buttons.forEach(function (b) { b.setAttribute('disabled', 'disabled'); b.setAttribute('aria-busy', 'true'); });

    var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    var sections = ['variant-added'];
    document.documentElement.dispatchEvent(new CustomEvent('cart:prepare-bundled-sections', { bubbles: true, detail: { sections: sections } }));

    try {
      var res = await fetch(root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ items: items, sections: sections.join(','), sections_url: root + 'variants/' + items[0].id })
      });
      var json = await res.json();
      if (!res.ok) {
        form.dispatchEvent(new CustomEvent('cart:error', { bubbles: true, detail: { error: json.description } }));
        document.dispatchEvent(new CustomEvent('cart:refresh'));
        return;
      }
      var tv = window.themeVariables && window.themeVariables.settings;
      if (tv && (tv.cartType === 'page' || tv.pageType === 'cart')) { window.location.href = root + 'cart'; return; }
      var cart = await (await fetch(root + 'cart.js')).json();
      cart.sections = json.sections;
      form.dispatchEvent(new CustomEvent('variant:add', { bubbles: true, detail: { items: json.items || [json], cart: cart } }));
      document.documentElement.dispatchEvent(new CustomEvent('cart:change', { bubbles: true, detail: { baseEvent: 'variant:add', cart: cart } }));
    } finally {
      buttons.forEach(function (b) { b.removeAttribute('disabled'); b.removeAttribute('aria-busy'); });
    }
  }, true);
})();
