/**
 * Keuangan Tim Khidmat - Frontend Logic
 * Theme: White & Subtle Navy Blue
 * Hardcoded API URL: Direct Spreadsheet Connection
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzDz7rCTHNQy_32Fxgku2sV2toc4FOVGyYogxuVKM39g7M-xpOCycpoGF9LzFY4JD0/exec';

// State Management
const appState = {
  activeUser: null,
  enteredPin: '',
  accounts: [
    { id: 'acc1', name: 'Tim Khidmat 1', pin: '123456', saldo: 15000 },
    { id: 'acc2', name: 'Tim Operasional', pin: '654321', saldo: 25000 },
    { id: 'acc3', name: 'Bendahara Utama', pin: '888888', saldo: 100000 }
  ],
  masterGroups: [
    "Umrah Syawal 1446H - Khidmat 01",
    "Umrah Syawal 1446H - Khidmat 02",
    "Umrah Ramadan Last 10 Days",
    "Haji Plus Furoda 2025",
    "Umrah Executive VVIP"
  ],
  masterActivities: [
    "Handling & Porter Bandara Soekarno Hatta",
    "Snack & Konsumsi Bus Jamaah",
    "Handling Baggage Hotel Makkah",
    "Sewa Shuttle Bus Extra",
    "Biaya Medical Emergency Jamaah",
    "Transportasi Ziarah Madinah"
  ],
  masterCategories: [
    "Konsumsi",
    "Transportasi",
    "Logistik & Perlengkapan",
    "Akomodasi & Hotel",
    "Lain-lain"
  ],
  items: []
};

// DOM Elements
const authSection = document.getElementById('authSection');
const appFormWrapper = document.getElementById('appFormWrapper');
const accountSelect = document.getElementById('accountSelect');
const accountPassword = document.getElementById('accountPassword');
const activeAccountName = document.getElementById('activeAccountName');
const activeBalanceDisplay = document.getElementById('activeBalanceDisplay');

const kategoriLaporan = document.getElementById('kategoriLaporan');
const grupKeberangkatanWrapper = document.getElementById('grupKeberangkatanWrapper');
const namaGrupInput = document.getElementById('namaGrupInput');
const grupSuggestions = document.getElementById('grupSuggestions');

const kegiatanInput = document.getElementById('kegiatanInput');
const kegiatanSuggestions = document.getElementById('kegiatanSuggestions');

const itemsContainer = document.getElementById('itemsContainer');
const btnAddItem = document.getElementById('btnAddItem');
const itemCountBadge = document.getElementById('itemCountBadge');
const grandTotalDisplay = document.getElementById('grandTotalDisplay');
const btnSubmitForm = document.getElementById('btnSubmitForm');

const successOverlay = document.getElementById('successOverlay');
const btnNewTransaction = document.getElementById('btnNewTransaction');
const btnShareReceipt = document.getElementById('btnShareReceipt');

// Topup Modal
const topupModal = document.getElementById('topupModal');
const btnOpenTopup = document.getElementById('btnOpenTopup');
const btnCloseTopup = document.getElementById('btnCloseTopup');
const topupForm = document.getElementById('topupForm');
const topupAccountName = document.getElementById('topupAccountName');
const topupAmountInput = document.getElementById('topupAmountInput');
const topupNoteInput = document.getElementById('topupNoteInput');
const btnSubmitTopup = document.getElementById('btnSubmitTopup');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  fetchDataFromSpreadsheet();
  populateAccountsDropdown();
  setupEventListeners();
  setupKeypad();
  setupAutocomplete();
  resetItems();
});

// Populate Accounts Dropdown
function populateAccountsDropdown() {
  accountSelect.innerHTML = '<option value="" disabled selected>-- Pilih Akun Anda --</option>';
  appState.accounts.forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc.id;
    opt.textContent = acc.name;
    accountSelect.appendChild(opt);
  });
}

// Event Listeners
function setupEventListeners() {
  // Top-up Modal
  btnOpenTopup.addEventListener('click', () => {
    if (!appState.activeUser) return;
    topupAccountName.value = appState.activeUser.name;
    topupAmountInput.value = '';
    topupNoteInput.value = '';
    topupModal.classList.remove('hidden');
  });
  btnCloseTopup.addEventListener('click', () => topupModal.classList.add('hidden'));

  topupForm.addEventListener('submit', handleTopupSubmit);

  // Category Laporan Toggle
  kategoriLaporan.addEventListener('change', (e) => {
    if (e.target.value === 'Grup Keberangkatan') {
      grupKeberangkatanWrapper.classList.remove('hidden');
      namaGrupInput.setAttribute('required', 'true');
    } else {
      grupKeberangkatanWrapper.classList.add('hidden');
      namaGrupInput.removeAttribute('required');
      namaGrupInput.value = '';
    }
  });

  // Add Item
  btnAddItem.addEventListener('click', () => {
    addItemRow();
  });

  // Logout / Switch Account
  document.getElementById('btnLogout').addEventListener('click', logoutAccount);

  // Form Submit
  document.getElementById('expenseForm').addEventListener('submit', handleFormSubmit);

  // New Transaction Button
  btnNewTransaction.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
    resetForm();
  });

  // Share Receipt Button
  btnShareReceipt.addEventListener('click', handleShareReceipt);
}

// 6-Digit Keypad Handler
function setupKeypad() {
  const keypadBtns = document.querySelectorAll('.keypad-btn[data-val]');
  const btnBackspace = document.getElementById('btnKeypadBackspace');

  keypadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (appState.enteredPin.length < 6) {
        appState.enteredPin += btn.dataset.val;
        updatePinDots();
      }
    });
  });

  btnBackspace.addEventListener('click', () => {
    if (appState.enteredPin.length > 0) {
      appState.enteredPin = appState.enteredPin.slice(0, -1);
      updatePinDots();
    }
  });
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, idx) => {
    if (idx < appState.enteredPin.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
  accountPassword.value = appState.enteredPin;
}

// Authentication Handlers
function switchUserAccount() {
  const selectedId = accountSelect.value;
  const pinInput = appState.enteredPin.trim();

  const account = appState.accounts.find(a => a.id === selectedId);
  if (!account) {
    alert('Pilih akun terlebih dahulu.');
    return;
  }

  if (account.pin !== pinInput) {
    alert('PIN / Password salah! Silakan coba lagi.');
    appState.enteredPin = '';
    updatePinDots();
    return;
  }

  // Success Auth
  appState.activeUser = account;
  activeAccountName.textContent = account.name;
  activeBalanceDisplay.textContent = formatSAR(account.saldo);

  authSection.classList.add('hidden');
  appFormWrapper.classList.remove('hidden');
}

function logoutAccount() {
  appState.activeUser = null;
  appState.enteredPin = '';
  updatePinDots();
  appFormWrapper.classList.add('hidden');
  authSection.classList.remove('hidden');
}

// Top-up Balance Handler
async function handleTopupSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(topupAmountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert('Masukkan jumlah saldo top-up yang valid.');
    return;
  }

  const note = topupNoteInput.value.trim() || 'Isi Saldo Kas Tim';

  btnSubmitTopup.disabled = true;
  btnSubmitTopup.textContent = 'Memproses...';

  const payload = {
    action: 'topupBalance',
    accountName: appState.activeUser.name,
    amount: amount,
    keterangan: note
  };

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Local state update
    appState.activeUser.saldo += amount;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

    topupModal.classList.add('hidden');
    alert(`Berhasil! Saldo kas ${appState.activeUser.name} bertambah ${formatSAR(amount)}.`);

  } catch (err) {
    console.error('Topup error:', err);
    alert('Terjadi kesalahan saat menambah saldo: ' + err.message);
  } finally {
    btnSubmitTopup.disabled = false;
    btnSubmitTopup.textContent = 'Tambahkan Saldo Sekarang';
  }
}

// Dynamic Items Handling & Autocomplete Category
function resetItems() {
  appState.items = [];
  itemsContainer.innerHTML = '';
  addItemRow(); // default 1 row
}

function addItemRow() {
  const itemIndex = appState.items.length;
  const defaultCategory = appState.masterCategories[0] || 'Konsumsi';
  const itemData = {
    id: Date.now() + Math.random(),
    kategori: defaultCategory,
    hargaSatuan: 0,
    qty: 1,
    jumlah: 0
  };
  appState.items.push(itemData);

  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.index = itemIndex;

  card.innerHTML = `
    <div class="item-card-header">
      <span class="item-number">Item #${itemIndex + 1}</span>
      ${appState.items.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removeItemRow(${itemIndex})"><i class="fa-solid fa-xmark"></i></button>` : ''}
    </div>
    <div class="item-grid">
      <!-- Searchbar Suggestion for Kategori Item (Connected to Sheet Master Kolom C) -->
      <div class="input-group full-width autocomplete-group">
        <label>Kategori Item <span class="req">*</span></label>
        <div class="input-wrapper input-sm">
          <i class="fa-solid fa-tags input-icon"></i>
          <input type="text" class="item-kategori-input" value="${defaultCategory}" placeholder="Pilih / ketik kategori item" autocomplete="off" required>
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
        </div>
        <div class="suggestions-list hidden item-cat-suggestions"></div>
      </div>

      <!-- Harga Satuan SAR -->
      <div class="input-group">
        <label>Harga Satuan (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="0" step="any" placeholder="0.00" class="item-harga" value="" oninput="updateItemData(${itemIndex}, 'hargaSatuan', this.value)" required>
        </div>
      </div>

      <!-- QTY -->
      <div class="input-group">
        <label>QTY</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="1" placeholder="1" class="item-qty" value="1" oninput="updateItemData(${itemIndex}, 'qty', this.value)" required>
        </div>
      </div>

      <!-- Subtotal Jumlah -->
      <div class="input-group full-width">
        <label>Jumlah Subtotal (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="text" class="item-jumlah amount-disabled" value="SAR 0.00" disabled readonly>
        </div>
      </div>
    </div>
  `;

  itemsContainer.appendChild(card);
  setupItemCategoryAutocomplete(card, itemIndex);
  updateItemCountBadge();
  calculateGrandTotal();
}

function setupItemCategoryAutocomplete(cardElement, index) {
  const catInput = cardElement.querySelector('.item-kategori-input');
  const catSuggestions = cardElement.querySelector('.item-cat-suggestions');

  if (!catInput || !catSuggestions) return;

  catInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    appState.items[index].kategori = e.target.value;

    if (!query) {
      catSuggestions.classList.add('hidden');
      return;
    }

    const filtered = appState.masterCategories.filter(c => c.toLowerCase().includes(query));
    renderSuggestions(catSuggestions, filtered, (val) => {
      catInput.value = val;
      appState.items[index].kategori = val;
      catSuggestions.classList.add('hidden');
    });
  });

  catInput.addEventListener('focus', () => {
    const filtered = appState.masterCategories;
    renderSuggestions(catSuggestions, filtered, (val) => {
      catInput.value = val;
      appState.items[index].kategori = val;
      catSuggestions.classList.add('hidden');
    });
  });

  document.addEventListener('click', (e) => {
    if (!catInput.contains(e.target) && !catSuggestions.contains(e.target)) {
      catSuggestions.classList.add('hidden');
    }
  });
}

window.removeItemRow = function(index) {
  if (appState.items.length <= 1) return;
  appState.items.splice(index, 1);
  reRenderItems();
};

function reRenderItems() {
  itemsContainer.innerHTML = '';
  const currentItems = [...appState.items];
  appState.items = [];

  currentItems.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = idx;

    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-number">Item #${idx + 1}</span>
        ${currentItems.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removeItemRow(${idx})"><i class="fa-solid fa-xmark"></i></button>` : ''}
      </div>
      <div class="item-grid">
        <div class="input-group full-width autocomplete-group">
          <label>Kategori Item <span class="req">*</span></label>
          <div class="input-wrapper input-sm">
            <i class="fa-solid fa-tags input-icon"></i>
            <input type="text" class="item-kategori-input" value="${item.kategori || ''}" placeholder="Pilih / ketik kategori item" autocomplete="off" required>
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
          </div>
          <div class="suggestions-list hidden item-cat-suggestions"></div>
        </div>

        <div class="input-group">
          <label>Harga Satuan (SAR)</label>
          <div class="input-wrapper input-sm">
            <input type="number" min="0" step="any" placeholder="0.00" class="item-harga" value="${item.hargaSatuan || ''}" oninput="updateItemData(${idx}, 'hargaSatuan', this.value)" required>
          </div>
        </div>

        <div class="input-group">
          <label>QTY</label>
          <div class="input-wrapper input-sm">
            <input type="number" min="1" placeholder="1" class="item-qty" value="${item.qty || 1}" oninput="updateItemData(${idx}, 'qty', this.value)" required>
          </div>
        </div>

        <div class="input-group full-width">
          <label>Jumlah Subtotal (SAR)</label>
          <div class="input-wrapper input-sm">
            <input type="text" class="item-jumlah amount-disabled" value="${formatSAR(item.jumlah)}" disabled readonly>
          </div>
        </div>
      </div>
    `;
    itemsContainer.appendChild(card);
    appState.items.push(item);
    setupItemCategoryAutocomplete(card, idx);
  });

  updateItemCountBadge();
  calculateGrandTotal();
};

window.updateItemData = function(index, field, value) {
  if (!appState.items[index]) return;

  if (field === 'hargaSatuan') {
    appState.items[index].hargaSatuan = parseFloat(value) || 0;
  } else if (field === 'qty') {
    appState.items[index].qty = parseInt(value) || 1;
  }

  // Calculate Subtotal (Harga Satuan * QTY)
  const harga = appState.items[index].hargaSatuan;
  const qty = appState.items[index].qty;
  const subtotal = harga * qty;
  appState.items[index].jumlah = subtotal;

  // Update DOM subtotal
  const card = itemsContainer.querySelector(`.item-card[data-index="${index}"]`);
  if (card) {
    const jumlahInput = card.querySelector('.item-jumlah');
    if (jumlahInput) jumlahInput.value = formatSAR(subtotal);
  }

  calculateGrandTotal();
};

function updateItemCountBadge() {
  itemCountBadge.textContent = `${appState.items.length} Item`;
}

function calculateGrandTotal() {
  const total = appState.items.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  grandTotalDisplay.textContent = formatSAR(total);
  return total;
}

// Autocomplete Logic for Group & Activity
function setupAutocomplete() {
  // Group Autocomplete
  namaGrupInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      grupSuggestions.classList.add('hidden');
      return;
    }

    const filtered = appState.masterGroups.filter(g => g.toLowerCase().includes(query));
    renderSuggestions(grupSuggestions, filtered, (val) => {
      namaGrupInput.value = val;
      grupSuggestions.classList.add('hidden');
    });
  });

  namaGrupInput.addEventListener('focus', () => {
    if (namaGrupInput.value.trim()) {
      namaGrupInput.dispatchEvent(new Event('input'));
    }
  });

  // Activity Autocomplete
  kegiatanInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      kegiatanSuggestions.classList.add('hidden');
      return;
    }

    const filtered = appState.masterActivities.filter(a => a.toLowerCase().includes(query));
    renderSuggestions(kegiatanSuggestions, filtered, (val) => {
      kegiatanInput.value = val;
      kegiatanSuggestions.classList.add('hidden');
    });
  });

  kegiatanInput.addEventListener('focus', () => {
    if (kegiatanInput.value.trim()) {
      kegiatanInput.dispatchEvent(new Event('input'));
    }
  });

  document.addEventListener('click', (e) => {
    if (!namaGrupInput.contains(e.target) && !grupSuggestions.contains(e.target)) {
      grupSuggestions.classList.add('hidden');
    }
    if (!kegiatanInput.contains(e.target) && !kegiatanSuggestions.contains(e.target)) {
      kegiatanSuggestions.classList.add('hidden');
    }
  });
}

function renderSuggestions(container, items, onSelect) {
  if (items.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.innerHTML = '';
  items.forEach(itemText => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `<i class="fa-solid fa-tag"></i> <span>${itemText}</span>`;
    div.addEventListener('click', () => onSelect(itemText));
    container.appendChild(div);
  });
  container.classList.remove('hidden');
}

// Form Submission & Success Overlay
async function handleFormSubmit(e) {
  e.preventDefault();

  const totalExpense = calculateGrandTotal();
  if (totalExpense <= 0) {
    alert('Total pengeluaran harus lebih dari SAR 0.00');
    return;
  }

  if (appState.activeUser.saldo < totalExpense) {
    const proceed = confirm(`Peringatan: Total pengeluaran (${formatSAR(totalExpense)}) melebihi saldo kas saat ini (${formatSAR(appState.activeUser.saldo)}). Tetap proses?`);
    if (!proceed) return;
  }

  btnSubmitForm.disabled = true;
  btnSubmitForm.textContent = 'Menyimpan...';

  const category = kategoriLaporan.value;
  const groupName = category === 'Grup Keberangkatan' ? namaGrupInput.value.trim() : '-';
  const kegiatanName = kegiatanInput.value.trim();

  const payload = {
    action: 'addExpense',
    accountId: appState.activeUser.id,
    accountName: appState.activeUser.name,
    kategoriLaporan: category,
    namaGrup: groupName,
    namaKegiatan: kegiatanName,
    items: appState.items,
    total: totalExpense,
    saldoSebelum: appState.activeUser.saldo,
    saldoSesudah: appState.activeUser.saldo - totalExpense,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Local state update
    appState.activeUser.saldo -= totalExpense;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

    // Populate Recap Modal
    document.getElementById('recapAccount').textContent = appState.activeUser.name;
    document.getElementById('recapCategory').textContent = category;
    
    if (category === 'Grup Keberangkatan') {
      document.getElementById('recapGroupRow').classList.remove('hidden');
      document.getElementById('recapGroup').textContent = groupName;
    } else {
      document.getElementById('recapGroupRow').classList.add('hidden');
    }

    document.getElementById('recapKegiatan').textContent = kegiatanName;

    // Populate Detailed Item Breakdown
    const recapItemsList = document.getElementById('recapItemsList');
    recapItemsList.innerHTML = '';
    appState.items.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'breakdown-item-row';
      row.innerHTML = `
        <span>${i + 1}. ${it.kategori}</span>
        <span class="qty-price">${it.qty}x ${formatSAR(it.hargaSatuan)} = <strong>${formatSAR(it.jumlah)}</strong></span>
      `;
      recapItemsList.appendChild(row);
    });

    document.getElementById('recapTotal').textContent = `- ${formatSAR(totalExpense)}`;
    document.getElementById('recapRemainingBalance').textContent = formatSAR(appState.activeUser.saldo);

    // Show Success Full Overlay
    successOverlay.classList.remove('hidden');

  } catch (error) {
    console.error('Submit error:', error);
    alert('Terjadi kesalahan saat menyimpan transaksi: ' + error.message);
  } finally {
    btnSubmitForm.disabled = false;
    btnSubmitForm.textContent = 'Submit & Catat Pengeluaran';
  }
}

// Share Receipt Feature
function handleShareReceipt() {
  const account = appState.activeUser ? appState.activeUser.name : 'Tim Khidmat';
  const category = kategoriLaporan.value;
  const group = category === 'Grup Keberangkatan' ? namaGrupInput.value.trim() : '-';
  const kegiatan = kegiatanInput.value.trim();
  const total = grandTotalDisplay.textContent;
  const dateStr = new Date().toLocaleString('id-ID');

  let itemsSummary = '';
  appState.items.forEach((it, idx) => {
    itemsSummary += `${idx + 1}. ${it.kategori}: ${it.qty}x @ ${formatSAR(it.hargaSatuan)} = ${formatSAR(it.jumlah)}\n`;
  });

  const receiptText = `🧾 *BUKTI PENGELUARAN TIM KHIDMAT*\n\n` +
    `👤 *Akun:* ${account}\n` +
    `📅 *Waktu:* ${dateStr}\n` +
    `📂 *Kategori:* ${category}\n` +
    (category === 'Grup Keberangkatan' ? `✈️ *Grup:* ${group}\n` : '') +
    `📌 *Kegiatan:* ${kegiatan}\n\n` +
    `📝 *Rincian Item:*\n${itemsSummary}\n` +
    `💰 *TOTAL PENGELUARAN:* ${total}\n` +
    `💳 *Sisa Saldo:* ${activeBalanceDisplay.textContent}\n\n` +
    `_Dicatat via Keuangan Tim Khidmat_`;

  if (navigator.share) {
    navigator.share({
      title: 'Bukti Pengeluaran Tim Khidmat',
      text: receiptText
    }).catch(err => console.log('Share error:', err));
  } else {
    navigator.clipboard.writeText(receiptText).then(() => {
      alert('Teks ringkasan bukti transaksi telah disalin ke clipboard! Anda bisa membagikannya via WhatsApp.');
    }).catch(err => alert('Detail Transaksi:\n\n' + receiptText));
  }
}

function resetForm() {
  kategoriLaporan.value = 'Grup Keberangkatan';
  kategoriLaporan.dispatchEvent(new Event('change'));
  namaGrupInput.value = '';
  kegiatanInput.value = '';
  resetItems();
}

// Fetch live data from Google Apps Script Web App
async function fetchDataFromSpreadsheet() {
  try {
    const res = await fetch(`${GAS_URL}?action=getData`);
    const data = await res.json();

    if (data.accounts && data.accounts.length > 0) {
      appState.accounts = data.accounts;
      populateAccountsDropdown();
    }
    if (data.groups && data.groups.length > 0) {
      appState.masterGroups = data.groups;
    }
    if (data.activities && data.activities.length > 0) {
      appState.masterActivities = data.activities;
    }
    if (data.categories && data.categories.length > 0) {
      appState.masterCategories = data.categories;
    }

    if (appState.activeUser) {
      const refreshedAcc = appState.accounts.find(a => a.id === appState.activeUser.id);
      if (refreshedAcc) {
        appState.activeUser.saldo = refreshedAcc.saldo;
        activeBalanceDisplay.textContent = formatSAR(refreshedAcc.saldo);
      }
    }
  } catch (e) {
    console.log('Fetch notice:', e);
  }
}

// Helper: Format SAR Currency
function formatSAR(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0).replace('SAR', 'SAR ');
}
