/* ENOAA – interactions des sections personnalisées */
(function () {
  // Cartes d'offres : sélectionne la valeur correspondante dans le sélecteur de variantes du thème
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.enoaa-bundle__card');
    if (!card) return;
    var wrap = card.closest('[data-enoaa-bundle]');
    var name = wrap.getAttribute('data-option-name');
    var formId = wrap.getAttribute('data-form');
    var scope = document;
    var picker = document.querySelector('variant-picker[form="' + formId + '"]');
    if (picker) scope = picker;
    var fieldset = scope.querySelector('.variant-picker__option[data-option-name="' + CSS.escape(name) + '"]');
    if (!fieldset) return;
    var value = card.getAttribute('data-value');
    var input = Array.prototype.find.call(fieldset.querySelectorAll('input'), function (i) { return i.value === value; });
    wrap.querySelectorAll('.enoaa-bundle__card').forEach(function (c) {
      c.classList.toggle('is-selected', c === card);
      c.setAttribute('aria-pressed', c === card);
    });
    if (input && !input.checked) input.click();
  });
})();
