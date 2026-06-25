/* === MIRUTA — app.js === */

const $ = id => document.getElementById(id);

// ── Estado ──────────────────────────────────────────────
let registros = cargarRegistros();
let gananciaActual = 0;
let fechaActual = '';

// ── Init ────────────────────────────────────────────────
(function init() {
  // Fecha de hoy por defecto
  const hoy = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fechaHoy = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  $('fecha').value = fechaHoy;

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  bindEvents();
  renderHistorial();
})();

// ── Eventos ─────────────────────────────────────────────
function bindEvents() {
  // Tabs
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Preview total en vivo
  ['efectivo', 'transferencia'].forEach(id => {
    $(id).addEventListener('input', actualizarPreview);
  });

  // Calcular
  $('btn-calcular').addEventListener('click', calcular);

  // Guardar
  $('btn-guardar').addEventListener('click', guardarRegistro);

  // Limpiar historial
  $('btn-limpiar').addEventListener('click', limpiarHistorial);
}

// ── Tabs ────────────────────────────────────────────────
function switchTab(nombre) {
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === nombre));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${nombre}`));
}

// ── Preview ─────────────────────────────────────────────
function actualizarPreview() {
  const ef = parseFloat($('efectivo').value) || 0;
  const tr = parseFloat($('transferencia').value) || 0;
  $('preview-total').textContent = formatCOP(ef + tr);
}

// ── Calcular ─────────────────────────────────────────────
function calcular() {
  const base       = parseFloat($('base').value)        || 0;
  const efectivo   = parseFloat($('efectivo').value)    || 0;
  const transfer   = parseFloat($('transferencia').value) || 0;
  const totalFinal = efectivo + transfer;
  const ganancia   = totalFinal - base;
  const fecha      = $('fecha').value;

  if (!fecha) {
    alert('Por favor selecciona una fecha.');
    return;
  }

  if (base === 0 && totalFinal === 0) {
    alert('Ingresa al menos la base inicial o el dinero final.');
    return;
  }

  // Guardar en estado temporal
  gananciaActual = ganancia;
  fechaActual    = fecha;

  // Mostrar resultado
  $('res-base').textContent  = formatCOP(base);
  $('res-total').textContent = formatCOP(totalFinal);
  $('res-ganancia').textContent = formatCOP(ganancia);
  $('result-date').textContent  = formatFechaLarga(fecha);

  // Color ganancia
  const ganEl = $('res-ganancia');
  ganEl.className = 'result-value ' + signo(ganancia);

  // Mostrar sección resultado
  $('resultado').classList.remove('hidden');
  $('save-msg').classList.add('hidden');
  $('btn-guardar').style.display = '';

  // Scroll suave al resultado
  $('resultado').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Guardar ──────────────────────────────────────────────
function guardarRegistro() {
  const base     = parseFloat($('base').value)         || 0;
  const efectivo = parseFloat($('efectivo').value)     || 0;
  const transfer = parseFloat($('transferencia').value) || 0;

  const registro = {
    fecha:      fechaActual,
    base,
    efectivo,
    transferencia: transfer,
    totalFinal:    efectivo + transfer,
    ganancia:      gananciaActual,
    ts:            Date.now(),
  };

  // Si ya existe registro del mismo día, reemplazar
  const idx = registros.findIndex(r => r.fecha === fechaActual);
  if (idx >= 0) {
    if (!confirm('Ya existe un registro para esta fecha. ¿Deseas reemplazarlo?')) return;
    registros.splice(idx, 1);
  }

  registros.unshift(registro);
  guardarRegistros();
  renderHistorial();

  // Feedback
  $('save-msg').classList.remove('hidden');
  $('btn-guardar').style.display = 'none';
  switchTab('historial');
}

// ── Historial ────────────────────────────────────────────
function renderHistorial() {
  const lista = $('historial-lista');
  const empty = $('empty-state');
  const btnLimpiar = $('btn-limpiar');

  // Ordenar por fecha desc
  const sorted = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Limpiar
  lista.innerHTML = '';

  if (sorted.length === 0) {
    lista.appendChild(empty || crearEmpty());
    $('empty-state') && ($('empty-state').style.display = '');
    btnLimpiar.classList.add('hidden');

    $('stat-total').textContent   = '$0';
    $('stat-dias').textContent    = '0';
    $('stat-promedio').textContent = '$0';
    return;
  }

  empty && (empty.style.display = 'none');
  btnLimpiar.classList.remove('hidden');

  // Stats
  const totalAcum  = sorted.reduce((s, r) => s + r.ganancia, 0);
  const promedio   = totalAcum / sorted.length;

  $('stat-total').textContent    = formatCOP(totalAcum);
  $('stat-dias').textContent     = sorted.length;
  $('stat-promedio').textContent = formatCOP(promedio);

  // Items
  sorted.forEach(r => {
    const el = document.createElement('div');
    el.className = 'historial-item';

    const partes = r.fecha.split('-');
    const dia   = partes[2];
    const mes   = nombreMes(parseInt(partes[1]));

    el.innerHTML = `
      <div class="item-date-block">
        <div class="item-day">${dia}</div>
        <div class="item-month">${mes}</div>
      </div>
      <div class="item-info">
        <div class="item-label">Ganancia neta</div>
        <div class="item-ganancia ${signo(r.ganancia)}">${formatCOP(r.ganancia)}</div>
        <div class="item-detail">
          Base: ${formatCOP(r.base)} · Efec: ${formatCOP(r.efectivo)} · Trans: ${formatCOP(r.transferencia)}
        </div>
      </div>
      <button class="item-delete" title="Eliminar registro" data-fecha="${r.fecha}">✕</button>
    `;

    el.querySelector('.item-delete').addEventListener('click', e => {
      const f = e.currentTarget.dataset.fecha;
      eliminarRegistro(f);
    });

    lista.appendChild(el);
  });
}

function crearEmpty() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.id = 'empty-state';
  div.innerHTML = '<div class="empty-icon">📋</div><p>Aún no hay registros guardados.<br>Calcula tu primera ganancia.</p>';
  return div;
}

function eliminarRegistro(fecha) {
  if (!confirm('¿Eliminar el registro de este día?')) return;
  registros = registros.filter(r => r.fecha !== fecha);
  guardarRegistros();
  renderHistorial();
}

function limpiarHistorial() {
  if (!confirm('¿Seguro que deseas borrar TODOS los registros? Esta acción no se puede deshacer.')) return;
  registros = [];
  guardarRegistros();
  renderHistorial();
}

// ── Storage ──────────────────────────────────────────────
function cargarRegistros() {
  try {
    return JSON.parse(localStorage.getItem('miruta_registros') || '[]');
  } catch { return []; }
}

function guardarRegistros() {
  localStorage.setItem('miruta_registros', JSON.stringify(registros));
}

// ── Helpers ──────────────────────────────────────────────
function formatCOP(n) {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? '−' : '') + '$' + formatted;
}

function signo(n) {
  if (n > 0) return 'positive';
  if (n < 0) return 'negative';
  return 'zero';
}

function nombreMes(m) {
  return ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][m - 1] || '';
}

function formatFechaLarga(iso) {
  const [y, m, d] = iso.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
}
