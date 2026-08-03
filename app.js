/**
 * Keuangan Tim Khidmat & Vendor Management - Frontend Logic v4.2
 * Refined Role-based Landing Screen & PopUp Expense Form
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzDz7rCTHNQy_32Fxgku2sV2toc4FOVGyYogxuVKM39g7M-xpOCycpoGF9LzFY4JD0/exec';

// State Management
const appState = {
  activeUser: null,
  selectedAccount: null,
  enteredPin: '',
  accounts: [],
  masterGroups: [],
  masterActivities: [],
  masterCategories: [],
  orders: [],
  selectedStatusFilter: 'Semua',
  items: [],
  modalItems: []
};

// DOM Elements
const authSection = document.getElementById('authSection');
const appFormWrapper = document.getElementById('appFormWrapper');

const accountSearchInput = document.getElementById('accountSearchInput');
const accountSuggestions = document.getElementById('accountSuggestions');

const activeAccountName = document.getElementById('activeAccountName');
const activeAccountType = document.getElementById('activeAccountType');
const activeBalanceDisplay = document.getElementById('activeBalanceDisplay');

const estimatesBox = document.getElementById('estimatesBox');
const estimatesAmountDisplay = document.getElementById('estimatesAmountDisplay');

const btnOpenExpenseModal = document.getElementById('btnOpenExpenseModal');
const expenseModal = document.getElementById('expenseModal');
const btnCloseExpenseModal = document.getElementById('btnCloseExpenseModal');
const modalExpenseForm = document.getElementById('modalExpenseForm');

const ordersSection = document.getElementById('ordersSection');
const ordersContainer = document.getElementById('ordersContainer');
const expenseFormSection = document.getElementById('expenseFormSection');

// Inline Form Elements (for Tim Users)
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

// PopUp Modal Form Elements (for Vendor Users & PopUp Access)
const modalKategoriLaporan = document.getElementById('modalKategoriLaporan');
const modalGrupWrapper = document.getElementById('modalGrupWrapper');
const modalNamaGrupInput = document.getElementById('modalNamaGrupInput');
const modalGrupSuggestions = document.getElementById('modalGrupSuggestions');
const modalKegiatanInput = document.getElementById('modalKegiatanInput');
const modalKegiatanSuggestions = document.getElementById('modalKegiatanSuggestions');
const modalItemsContainer = document.getElementById('modalItemsContainer');
const modalBtnAddItem = document.getElementById('modalBtnAddItem');
const modalItemCountBadge = document.getElementById('modalItemCountBadge');
const modalGrandTotalDisplay = document.getElementById('modalGrandTotalDisplay');
const modalBtnSubmitForm = document.getElementById('modalBtnSubmitForm');

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
  setupAccountSearchbar();
  setupEventListeners();
  setupKeypad();
  setupFormAutocomplete();
  setupModalAutocomplete();
  setupStatusFilterTabs();
  resetItems();
  resetModalItems();
});

// Setup Account Searchbar Suggestion ("Pilih Akun / Tim")
function setupAccountSearchbar() {
  accountSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    appState.selectedAccount = null;
    appState.enteredPin = '';
    updatePinDots();

    if (!query) {
      accountSuggestions.classList.add('hidden');
      return;
    }

    const filtered = appState.accounts.filter(acc => acc.name.toLowerCase().includes(query));
    renderAccountSuggestions(filtered);
  });

  accountSearchInput.addEventListener('focus', () => {
    renderAccountSuggestions(appState.accounts);
  });

  document.addEventListener('click', (e) => {
    if (!accountSearchInput.contains(e.target) && !accountSuggestions.contains(e.target)) {
      accountSuggestions.classList.add('hidden');
    }
  });
}

function renderAccountSuggestions(accList) {
  if (!accList || accList.length === 0) {
    accountSuggestions.classList.add('hidden');
    return;
  }

  accountSuggestions.innerHTML = '';
  accList.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `
      <i class="fa-solid ${acc.jenisAkun && acc.jenisAkun.toLowerCase() === 'vendor' ? 'fa-store' : 'fa-user-circle'}"></i> 
      <span>${acc.name} <small style="color:#64748b">(${acc.jenisAkun || 'Tim'})</small></span>
    `;
    div.addEventListener('click', () => {
      accountSearchInput.value = acc.name;
      appState.selectedAccount = acc;
      accountSuggestions.classList.add('hidden');
      appState.enteredPin = '';
      updatePinDots();
    });
    accountSuggestions.appendChild(div);
  });
  accountSuggestions.classList.remove('hidden');
}

// 6-Digit Keypad & Auto Login
function setupKeypad() {
  const keypadBtns = document.querySelectorAll('.keypad-btn[data-val]');
  const btnBackspace = document.getElementById('btnKeypadBackspace');

  keypadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (appState.enteredPin.length < 6) {
        appState.enteredPin += btn.dataset.val;
        updatePinDots();

        if (appState.enteredPin.length === 6) {
          setTimeout(verifyAndLoginAuto, 150);
        }
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
}

// Auto Login Verification
function verifyAndLoginAuto() {
  if (!appState.selectedAccount) {
    const match = appState.accounts.find(a => a.name.toLowerCase() === accountSearchInput.value.trim().toLowerCase());
    if (match) {
      appState.selectedAccount = match;
    } else {
      alert('Pilih Akun / Tim yang valid terlebih dahulu.');
      appState.enteredPin = '';
      updatePinDots();
      return;
    }
  }

  if (appState.selectedAccount.pin === appState.enteredPin) {
    appState.activeUser = appState.selectedAccount;
    activeAccountName.textContent = appState.activeUser.name;
    
    const userRole = appState.activeUser.jenisAkun ? appState.activeUser.jenisAkun.toString().trim() : 'Tim';
    activeAccountType.textContent = userRole;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

    authSection.classList.add('hidden');
    appFormWrapper.classList.remove('hidden');

    const isVendor = userRole.toLowerCase() === 'vendor';

    if (isVendor) {
      // FOR VENDOR ACCOUNTS:
      // 1. Initial screen is Pemesanan (Orders View)!
      // 2. Inline expense form is hidden! (Expense form is opened via PopUp Modal only)
      estimatesBox.classList.remove('hidden');
      ordersSection.classList.remove('hidden');
      expenseFormSection.classList.add('hidden');
      calculateVendorEstimates();
      renderOrdersList();
    } else {
      // FOR TIM ACCOUNTS:
      // Initial screen is Expense Form View
      estimatesBox.classList.add('hidden');
      ordersSection.classList.add('hidden');
      expenseFormSection.classList.remove('hidden');
    }
  } else {
    alert('PIN / Password salah! Silakan coba lagi.');
    appState.enteredPin = '';
    updatePinDots();
  }
}

function logoutAccount() {
  appState.activeUser = null;
  appState.selectedAccount = null;
  appState.enteredPin = '';
  accountSearchInput.value = '';
  updatePinDots();
  appFormWrapper.classList.add('hidden');
  authSection.classList.remove('hidden');
}

// Event Listeners
function setupEventListeners() {
  // PopUp Expense Modal Trigger (Receipt Icon Button)
  btnOpenExpenseModal.addEventListener('click', () => {
    resetModalItems();
    const isVendor = appState.activeUser && appState.activeUser.jenisAkun && appState.activeUser.jenisAkun.toLowerCase() === 'vendor';
    modalKategoriLaporan.value = isVendor ? 'Vendor' : 'Grup Keberangkatan';
    modalKategoriLaporan.dispatchEvent(new Event('change'));
    expenseModal.classList.remove('hidden');
  });

  btnCloseExpenseModal.addEventListener('click', () => {
    expenseModal.classList.add('hidden');
  });

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

  // Category Laporan Toggle (Inline)
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

  // Category Laporan Toggle (Modal)
  modalKategoriLaporan.addEventListener('change', (e) => {
    if (e.target.value === 'Grup Keberangkatan') {
      modalGrupWrapper.classList.remove('hidden');
      modalNamaGrupInput.setAttribute('required', 'true');
    } else {
      modalGrupWrapper.classList.add('hidden');
      modalNamaGrupInput.removeAttribute('required');
      modalNamaGrupInput.value = '';
    }
  });

  // Add Item
  btnAddItem.addEventListener('click', () => addItemRow());
  modalBtnAddItem.addEventListener('click', () => addModalItemRow());

  // Logout
  document.getElementById('btnLogout').addEventListener('click', logoutAccount);

  // Form Submit (Inline & Modal)
  expenseForm.addEventListener('submit', handleFormSubmit);
  modalExpenseForm.addEventListener('submit', handleModalFormSubmit);

  // New Transaction Button
  btnNewTransaction.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
    resetForm();
  });

  // Share Receipt Button
  btnShareReceipt.addEventListener('click', handleShareReceipt);
}

// Vendor Pemesanan System
function calculateVendorEstimates() {
  if (!appState.activeUser || !appState.activeUser.jenisAkun || appState.activeUser.jenisAkun.toLowerCase() !== 'vendor') return;

  const vendorOrders = appState.orders.filter(o => o.akun.toLowerCase() === appState.activeUser.name.toLowerCase() && o.status === 'Pesanan Baru');
  const totalEstimate = vendorOrders.reduce((sum, o) => sum + (o.jumlah || 0), 0);
  estimatesAmountDisplay.textContent = formatSAR(totalEstimate);
}

function setupStatusFilterTabs() {
  const tabs = document.querySelectorAll('.status-filter-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      appState.selectedStatusFilter = tab.dataset.status;
      renderOrdersList();
    });
  });
}

function renderOrdersList() {
  if (!appState.activeUser) return;

  ordersContainer.innerHTML = '';
  
  let vendorOrders = appState.orders.filter(o => o.akun.toLowerCase() === appState.activeUser.name.toLowerCase());

  if (appState.selectedStatusFilter !== 'Semua') {
    vendorOrders = vendorOrders.filter(o => o.status === appState.selectedStatusFilter);
  }

  if (vendorOrders.length === 0) {
    ordersContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #64748b; font-size: 13px;">
        <i class="fa-solid fa-box-open" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
        Tidak ada pemesanan untuk status "${appState.selectedStatusFilter}"
      </div>
    `;
    return;
  }

  vendorOrders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';

    let statusClass = 'pesanan-baru';
    if (order.status === 'Proses') statusClass = 'proses';
    if (order.status === 'Selesai') statusClass = 'selesai';

    let actionBtnHtml = '';
    if (order.status === 'Pesanan Baru') {
      actionBtnHtml = `<button type="button" class="btn-navy btn-order-action btn-confirm-order" onclick="handleUpdateOrderStatus('${order.id}', 'Proses')"><i class="fa-solid fa-check-circle"></i> Konfirmasi Pemesanan</button>`;
    } else if (order.status === 'Proses') {
      actionBtnHtml = `<button type="button" class="btn-navy btn-order-action btn-complete-order" onclick="handleUpdateOrderStatus('${order.id}', 'Selesai')"><i class="fa-solid fa-flag-checkered"></i> Selesaikan Pemesanan</button>`;
    } else {
      actionBtnHtml = `<span style="font-size: 12px; font-weight: 700; color: #047857;"><i class="fa-solid fa-circle-check"></i> Transaksi Selesai</span>`;
    }

    card.innerHTML = `
      <div class="order-card-header">
        <!-- Prominent / Larger Title for Tujuan Kegiatan -->
        <h3 class="order-title">${order.tujuan}</h3>
        <span class="order-status-badge ${statusClass}">${order.status}</span>
      </div>

      <div class="order-details-grid">
        <div class="order-detail-item">Grup: <strong>${order.grup || '-'}</strong></div>
        <div class="order-detail-item">Muthowwif: <strong>${order.muthowwif || '-'}</strong></div>
        <div class="order-detail-item">Lokasi: <strong>${order.lokasi || '-'}</strong></div>
        <div class="order-detail-item">Waktu: <strong>${order.tanggal} ${order.jam}</strong></div>
        
        <div class="order-product-box">
          <div>
            <div class="order-product-name">${order.itemProduk}</div>
            <div style="font-size: 11px; color: #64748b;">${order.qty} ${order.satuan} @ ${formatSAR(order.harga)}</div>
          </div>
          <div class="order-product-price">${formatSAR(order.jumlah)}</div>
        </div>

        ${order.catatan ? `<div class="order-note">Catatan: "${order.catatan}"</div>` : ''}
      </div>

      <div class="order-card-actions">
        ${actionBtnHtml}
      </div>
    `;

    ordersContainer.appendChild(card);
  });
}

window.handleUpdateOrderStatus = async function(orderId, newStatus) {
  const confirmMsg = newStatus === 'Selesai' 
    ? 'Menyelesaikan pemesanan akan otomatis mencatat pengeluaran di Sheet Pengeluaran dan memotong saldo akun Anda. Lanjutkan?'
    : 'Konfirmasi pemesanan ini dan ubah status menjadi Proses?';

  if (!confirm(confirmMsg)) return;

  try {
    const payload = {
      action: 'updateOrderStatus',
      orderId: orderId,
      newStatus: newStatus
    };

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const orderIndex = appState.orders.findIndex(o => o.id.toString().trim() === orderId.toString().trim());
    if (orderIndex !== -1) {
      appState.orders[orderIndex].status = newStatus;
      
      if (newStatus === 'Selesai') {
        appState.activeUser.saldo -= appState.orders[orderIndex].jumlah;
        activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);
      }
    }

    calculateVendorEstimates();
    renderOrdersList();
    alert(`Status pemesanan berhasil diubah menjadi "${newStatus}"!`);
    fetchDataFromSpreadsheet(); // Refresh live data

  } catch (err) {
    console.error('Update status error:', err);
    alert('Terjadi kesalahan saat memperbarui status: ' + err.message);
  }
};

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

// Inline Form Dynamic Items
function resetItems() {
  appState.items = [];
  itemsContainer.innerHTML = '';
  addItemRow();
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
      <div class="input-group full-width autocomplete-group">
        <label>Kategori Item <span class="req">*</span></label>
        <div class="input-wrapper input-sm">
          <i class="fa-solid fa-tags input-icon"></i>
          <input type="text" class="item-kategori-input" value="${defaultCategory}" placeholder="Pilih / ketik kategori item" autocomplete="off" required>
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
        </div>
        <div class="suggestions-list hidden item-cat-suggestions"></div>
      </div>

      <div class="input-group">
        <label>Harga Satuan (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="0" step="any" placeholder="0.00" class="item-harga" value="" oninput="updateItemData(${itemIndex}, 'hargaSatuan', this.value)" required>
        </div>
      </div>

      <div class="input-group">
        <label>QTY</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="1" placeholder="1" class="item-qty" value="1" oninput="updateItemData(${itemIndex}, 'qty', this.value)" required>
        </div>
      </div>

      <div class="input-group full-width">
        <label>Jumlah Subtotal (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="text" class="item-jumlah amount-disabled" value="SAR 0.00" disabled readonly>
        </div>
      </div>
    </div>
  `;

  itemsContainer.appendChild(card);
  setupItemCategoryAutocomplete(card, itemIndex, appState.items);
  updateItemCountBadge();
  calculateGrandTotal();
}

// Modal Form Dynamic Items
function resetModalItems() {
  appState.modalItems = [];
  modalItemsContainer.innerHTML = '';
  addModalItemRow();
}

function addModalItemRow() {
  const idx = appState.modalItems.length;
  const defaultCategory = appState.masterCategories[0] || 'Konsumsi';
  const itemData = {
    id: Date.now() + Math.random(),
    kategori: defaultCategory,
    hargaSatuan: 0,
    qty: 1,
    jumlah: 0
  };
  appState.modalItems.push(itemData);

  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.index = idx;

  card.innerHTML = `
    <div class="item-card-header">
      <span class="item-number">Item #${idx + 1}</span>
      ${appState.modalItems.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removeModalItemRow(${idx})"><i class="fa-solid fa-xmark"></i></button>` : ''}
    </div>
    <div class="item-grid">
      <div class="input-group full-width autocomplete-group">
        <label>Kategori Item <span class="req">*</span></label>
        <div class="input-wrapper input-sm">
          <i class="fa-solid fa-tags input-icon"></i>
          <input type="text" class="item-kategori-input" value="${defaultCategory}" placeholder="Pilih / ketik kategori item" autocomplete="off" required>
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
        </div>
        <div class="suggestions-list hidden item-cat-suggestions"></div>
      </div>

      <div class="input-group">
        <label>Harga Satuan (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="0" step="any" placeholder="0.00" class="item-harga" value="" oninput="updateModalItemData(${idx}, 'hargaSatuan', this.value)" required>
        </div>
      </div>

      <div class="input-group">
        <label>QTY</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="1" placeholder="1" class="item-qty" value="1" oninput="updateModalItemData(${idx}, 'qty', this.value)" required>
        </div>
      </div>

      <div class="input-group full-width">
        <label>Jumlah Subtotal (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="text" class="item-jumlah amount-disabled" value="SAR 0.00" disabled readonly>
        </div>
      </div>
    </div>
  `;

  modalItemsContainer.appendChild(card);
  setupItemCategoryAutocomplete(card, idx, appState.modalItems);
  updateModalItemCountBadge();
  calculateModalGrandTotal();
}

function setupItemCategoryAutocomplete(cardElement, index, targetArray) {
  const catInput = cardElement.querySelector('.item-kategori-input');
  const catSuggestions = cardElement.querySelector('.item-cat-suggestions');

  if (!catInput || !catSuggestions) return;

  catInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    targetArray[index].kategori = e.target.value;

    if (!query) {
      catSuggestions.classList.add('hidden');
      return;
    }

    const filtered = appState.masterCategories.filter(c => c.toLowerCase().includes(query));
    renderSuggestions(catSuggestions, filtered, (val) => {
      catInput.value = val;
      targetArray[index].kategori = val;
      catSuggestions.classList.add('hidden');
    });
  });

  catInput.addEventListener('focus', () => {
    const filtered = appState.masterCategories;
    renderSuggestions(catSuggestions, filtered, (val) => {
      catInput.value = val;
      targetArray[index].kategori = val;
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

window.removeModalItemRow = function(index) {
  if (appState.modalItems.length <= 1) return;
  appState.modalItems.splice(index, 1);
  reRenderModalItems();
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
    setupItemCategoryAutocomplete(card, idx, appState.items);
  });

  updateItemCountBadge();
  calculateGrandTotal();
};

function reRenderModalItems() {
  modalItemsContainer.innerHTML = '';
  const currentItems = [...appState.modalItems];
  appState.modalItems = [];

  currentItems.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = idx;

    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-number">Item #${idx + 1}</span>
        ${currentItems.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removeModalItemRow(${idx})"><i class="fa-solid fa-xmark"></i></button>` : ''}
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
            <input type="number" min="0" step="any" placeholder="0.00" class="item-harga" value="${item.hargaSatuan || ''}" oninput="updateModalItemData(${idx}, 'hargaSatuan', this.value)" required>
          </div>
        </div>

        <div class="input-group">
          <label>QTY</label>
          <div class="input-wrapper input-sm">
            <input type="number" min="1" placeholder="1" class="item-qty" value="${item.qty || 1}" oninput="updateModalItemData(${idx}, 'qty', this.value)" required>
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
    modalItemsContainer.appendChild(card);
    appState.modalItems.push(item);
    setupItemCategoryAutocomplete(card, idx, appState.modalItems);
  });

  updateModalItemCountBadge();
  calculateModalGrandTotal();
};

window.updateItemData = function(index, field, value) {
  if (!appState.items[index]) return;

  if (field === 'hargaSatuan') {
    appState.items[index].hargaSatuan = parseFloat(value) || 0;
  } else if (field === 'qty') {
    appState.items[index].qty = parseInt(value) || 1;
  }

  const harga = appState.items[index].hargaSatuan;
  const qty = appState.items[index].qty;
  const subtotal = harga * qty;
  appState.items[index].jumlah = subtotal;

  const card = itemsContainer.querySelector(`.item-card[data-index="${index}"]`);
  if (card) {
    const jumlahInput = card.querySelector('.item-jumlah');
    if (jumlahInput) jumlahInput.value = formatSAR(subtotal);
  }

  calculateGrandTotal();
};

window.updateModalItemData = function(index, field, value) {
  if (!appState.modalItems[index]) return;

  if (field === 'hargaSatuan') {
    appState.modalItems[index].hargaSatuan = parseFloat(value) || 0;
  } else if (field === 'qty') {
    appState.modalItems[index].qty = parseInt(value) || 1;
  }

  const harga = appState.modalItems[index].hargaSatuan;
  const qty = appState.modalItems[index].qty;
  const subtotal = harga * qty;
  appState.modalItems[index].jumlah = subtotal;

  const card = modalItemsContainer.querySelector(`.item-card[data-index="${index}"]`);
  if (card) {
    const jumlahInput = card.querySelector('.item-jumlah');
    if (jumlahInput) jumlahInput.value = formatSAR(subtotal);
  }

  calculateModalGrandTotal();
};

function updateItemCountBadge() {
  itemCountBadge.textContent = `${appState.items.length} Item`;
}

function updateModalItemCountBadge() {
  modalItemCountBadge.textContent = `${appState.modalItems.length} Item`;
}

function calculateGrandTotal() {
  const total = appState.items.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  grandTotalDisplay.textContent = formatSAR(total);
  return total;
}

function calculateModalGrandTotal() {
  const total = appState.modalItems.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  modalGrandTotalDisplay.textContent = formatSAR(total);
  return total;
}

// Autocomplete Setup
function setupFormAutocomplete() {
  namaGrupInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { grupSuggestions.classList.add('hidden'); return; }
    const filtered = appState.masterGroups.filter(g => g.toLowerCase().includes(query));
    renderSuggestions(grupSuggestions, filtered, (val) => { namaGrupInput.value = val; grupSuggestions.classList.add('hidden'); });
  });

  kegiatanInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { kegiatanSuggestions.classList.add('hidden'); return; }
    const filtered = appState.masterActivities.filter(a => a.toLowerCase().includes(query));
    renderSuggestions(kegiatanSuggestions, filtered, (val) => { kegiatanInput.value = val; kegiatanSuggestions.classList.add('hidden'); });
  });
}

function setupModalAutocomplete() {
  modalNamaGrupInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { modalGrupSuggestions.classList.add('hidden'); return; }
    const filtered = appState.masterGroups.filter(g => g.toLowerCase().includes(query));
    renderSuggestions(modalGrupSuggestions, filtered, (val) => { modalNamaGrupInput.value = val; modalGrupSuggestions.classList.add('hidden'); });
  });

  modalKegiatanInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { modalKegiatanSuggestions.classList.add('hidden'); return; }
    const filtered = appState.masterActivities.filter(a => a.toLowerCase().includes(query));
    renderSuggestions(modalKegiatanSuggestions, filtered, (val) => { modalKegiatanInput.value = val; modalKegiatanSuggestions.classList.add('hidden'); });
  });
}

function renderSuggestions(container, items, onSelect) {
  if (!items || items.length === 0) {
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

// Form Submissions
async function handleFormSubmit(e) {
  e.preventDefault();
  await processExpenseSubmit(kategoriLaporan.value, namaGrupInput.value, kegiatanInput.value, appState.items, btnSubmitForm);
}

async function handleModalFormSubmit(e) {
  e.preventDefault();
  await processExpenseSubmit(modalKategoriLaporan.value, modalNamaGrupInput.value, modalKegiatanInput.value, appState.modalItems, modalBtnSubmitForm);
  expenseModal.classList.add('hidden');
}

async function processExpenseSubmit(category, rawGroup, rawKegiatan, itemsArray, buttonEl) {
  const totalExpense = itemsArray.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  if (totalExpense <= 0) {
    alert('Total pengeluaran harus lebih dari SAR 0.00');
    return;
  }

  if (appState.activeUser.saldo < totalExpense) {
    const proceed = confirm(`Peringatan: Total pengeluaran (${formatSAR(totalExpense)}) melebihi saldo kas saat ini (${formatSAR(appState.activeUser.saldo)}). Tetap proses?`);
    if (!proceed) return;
  }

  buttonEl.disabled = true;
  buttonEl.textContent = 'Menyimpan...';

  const groupName = category === 'Grup Keberangkatan' ? rawGroup.trim() : '-';
  const kegiatanName = rawKegiatan.trim();

  const payload = {
    action: 'addExpense',
    accountId: appState.activeUser.id,
    accountName: appState.activeUser.name,
    kategoriLaporan: category,
    namaGrup: groupName,
    namaKegiatan: kegiatanName,
    items: itemsArray,
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

    appState.activeUser.saldo -= totalExpense;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

    document.getElementById('recapAccount').textContent = appState.activeUser.name;
    document.getElementById('recapCategory').textContent = category;
    
    if (category === 'Grup Keberangkatan') {
      document.getElementById('recapGroupRow').classList.remove('hidden');
      document.getElementById('recapGroup').textContent = groupName;
    } else {
      document.getElementById('recapGroupRow').classList.add('hidden');
    }

    document.getElementById('recapKegiatan').textContent = kegiatanName;

    const recapItemsList = document.getElementById('recapItemsList');
    recapItemsList.innerHTML = '';
    itemsArray.forEach((it, i) => {
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

    successOverlay.classList.remove('hidden');

  } catch (error) {
    console.error('Submit error:', error);
    alert('Terjadi kesalahan saat menyimpan transaksi: ' + error.message);
  } finally {
    buttonEl.disabled = false;
    buttonEl.textContent = 'Submit & Catat Pengeluaran';
  }
}

// Share Receipt Feature
function handleShareReceipt() {
  const account = appState.activeUser ? appState.activeUser.name : 'Tim Khidmat';
  const total = grandTotalDisplay.textContent;
  const dateStr = new Date().toLocaleString('id-ID');

  const receiptText = `🧾 *BUKTI PENGELUARAN TIM KHIDMAT*\n\n` +
    `👤 *Akun:* ${account}\n` +
    `📅 *Waktu:* ${dateStr}\n` +
    `💰 *TOTAL PENGELUARAN:* ${total}\n` +
    `💳 *Sisa Saldo:* ${activeBalanceDisplay.textContent}\n\n` +
    `_Dicatat via Keuangan Tim Khidmat_`;

  if (navigator.share) {
    navigator.share({ title: 'Bukti Pengeluaran Tim Khidmat', text: receiptText }).catch(err => console.log('Share notice:', err));
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
  resetModalItems();
}

// Fetch Live Data
async function fetchDataFromSpreadsheet() {
  try {
    const res = await fetch(`${GAS_URL}?action=getData`);
    const data = await res.json();

    if (data.accounts && data.accounts.length > 0) appState.accounts = data.accounts;
    if (data.groups && data.groups.length > 0) appState.masterGroups = data.groups;
    if (data.activities && data.activities.length > 0) appState.masterActivities = data.activities;
    if (data.categories && data.categories.length > 0) appState.masterCategories = data.categories;
    if (data.orders && data.orders.length > 0) appState.orders = data.orders;

    if (appState.activeUser) {
      const refreshedAcc = appState.accounts.find(a => a.id === appState.activeUser.id);
      if (refreshedAcc) {
        appState.activeUser.saldo = refreshedAcc.saldo;
        activeBalanceDisplay.textContent = formatSAR(refreshedAcc.saldo);
      }
      calculateVendorEstimates();
      renderOrdersList();
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
