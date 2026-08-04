/**
 * Keuangan Tim Khidmat & Vendor Management - Frontend Logic v10.1
 * Critical Fix: Dynamic Form Validation Scoping for Mgmt PDF Modal, Dual Window + Iframe Print Trigger
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
  transactions: [],
  selectedStatusFilter: 'Pesanan Baru', // Default Vendor Status Tab
  selectedDateFilter: '',
  txSearchQuery: '',
  txDateFilterVal: '',
  txTypeFilterVal: 'Semua',
  items: [],
  modalItems: [],

  // Dynamic Management PDF Items State
  doc1Items: [],
  doc3Items: []
};

// DOM Elements
const authSection = document.getElementById('authSection');
const appFormWrapper = document.getElementById('appFormWrapper');

const accountSearchInput = document.getElementById('accountSearchInput');
const accountSuggestions = document.getElementById('accountSuggestions');

const mainBalanceSection = document.getElementById('mainBalanceSection');
const activeAccountName = document.getElementById('activeAccountName');
const activeAccountType = document.getElementById('activeAccountType');
const activeBalanceDisplay = document.getElementById('activeBalanceDisplay');

const estimatesBox = document.getElementById('estimatesBox');
const estimatesAmountDisplay = document.getElementById('estimatesAmountDisplay');

// Management Dashboard Elements
const managementSection = document.getElementById('managementSection');
const totalCombinedBalance = document.getElementById('totalCombinedBalance');
const pendingApprovalsBadge = document.getElementById('pendingApprovalsBadge');
const pendingApprovalsContainer = document.getElementById('pendingApprovalsContainer');
const teamBalancesContainer = document.getElementById('teamBalancesContainer');
const vendorBalancesContainer = document.getElementById('vendorBalancesContainer');

// Floating Action Button (FAB) Elements
const fabContainer = document.getElementById('fabContainer');
const btnToggleFab = document.getElementById('btnToggleFab');
const fabMenu = document.getElementById('fabMenu');

const btnOpenMgmtPdfModal = document.getElementById('btnOpenMgmtPdfModal');
const mgmtPdfModal = document.getElementById('mgmtPdfModal');
const btnCloseMgmtPdfModal = document.getElementById('btnCloseMgmtPdfModal');
const mgmtPdfForm = document.getElementById('mgmtPdfForm');
const mgmtDocTypeSelect = document.getElementById('mgmtDocTypeSelect');

const btnOpenPdfModal = document.getElementById('btnOpenPdfModal');
const pdfModal = document.getElementById('pdfModal');
const btnClosePdfModal = document.getElementById('btnClosePdfModal');
const pdfForm = document.getElementById('pdfForm');
const pdfDocType = document.getElementById('pdfDocType');
const pdfStartDate = document.getElementById('pdfStartDate');
const pdfEndDate = document.getElementById('pdfEndDate');

// Transfer Modal Elements
const btnOpenTransferModal = document.getElementById('btnOpenTransferModal');
const transferModal = document.getElementById('transferModal');
const btnCloseTransferModal = document.getElementById('btnCloseTransferModal');
const transferForm = document.getElementById('transferForm');
const transferTujuanInput = document.getElementById('transferTujuanInput');
const transferReceiverSelect = document.getElementById('transferReceiverSelect');
const transferAmountInput = document.getElementById('transferAmountInput');
const transferCurrentBalanceDisplay = document.getElementById('transferCurrentBalanceDisplay');
const transferNoteInput = document.getElementById('transferNoteInput');
const btnSubmitTransfer = document.getElementById('btnSubmitTransfer');

// Transaction History Full Page Section Elements
const btnOpenTxHistoryModal = document.getElementById('btnOpenTxHistoryModal');
const txHistorySection = document.getElementById('txHistorySection');
const btnBackFromHistory = document.getElementById('btnBackFromHistory');
const txSearchInput = document.getElementById('txSearchInput');
const txDateFilter = document.getElementById('txDateFilter');
const btnClearTxDateFilter = document.getElementById('btnClearTxDateFilter');
const txHistoryContainer = document.getElementById('txHistoryContainer');

const btnOpenExpenseModal = document.getElementById('btnOpenExpenseModal');
const expenseModal = document.getElementById('expenseModal');
const btnCloseExpenseModal = document.getElementById('btnCloseExpenseModal');
const modalExpenseForm = document.getElementById('modalExpenseForm');

const ordersSection = document.getElementById('ordersSection');
const ordersContainer = document.getElementById('ordersContainer');
const orderDateFilter = document.getElementById('orderDateFilter');
const btnClearDateFilter = document.getElementById('btnClearDateFilter');
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

// PopUp Modal Form Elements
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

// Toast Auto Overlay Elements
const toastOverlay = document.getElementById('toastOverlay');
const toastTitle = document.getElementById('toastTitle');
const toastSubtitle = document.getElementById('toastSubtitle');

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
document.addEventListener('DOMContentLoaded', async () => {
  checkAndRestoreSession();

  setupAccountSearchbar();
  setupEventListeners();
  setupResponsiveKeypad();
  setupFormAutocomplete();
  setupModalAutocomplete();
  setupMgmtGroupAutocomplete();
  setupStatusFilterTabs();
  setupDateFilter();
  setupPdfModal();
  setupMgmtPdfModal();
  setupTransferModal();
  setupTxHistorySection();
  setupFabMenu();
  resetItems();
  resetModalItems();

  await fetchDataFromSpreadsheet();
});

// Setup Main App Event Listeners
function setupEventListeners() {
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      logoutAccount();
    });
  }

  if (btnOpenExpenseModal) {
    btnOpenExpenseModal.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      closeFabMenu();
      resetModalItems();
      expenseModal.classList.remove('hidden');
    });
  }

  if (btnCloseExpenseModal) {
    btnCloseExpenseModal.addEventListener('click', () => {
      expenseModal.classList.add('hidden');
    });
  }

  const btnAppReload = document.getElementById('btnAppReload');
  if (btnAppReload) {
    btnAppReload.addEventListener('click', () => {
      const icon = btnAppReload.querySelector('i');
      if (icon) icon.classList.add('spinning');
      showAutoToast("Memperbarui Data...", "Mengambil data transaksi terbaru dari server");
      fetchDataFromSpreadsheet().then(() => {
        setTimeout(() => {
          if (icon) icon.classList.remove('spinning');
        }, 600);
      });
    });
  }

  if (btnOpenTopup) {
    btnOpenTopup.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      closeFabMenu();
      if (!appState.activeUser) return;
      topupAccountName.textContent = appState.activeUser.name;
      topupAmountInput.value = '';
      topupNoteInput.value = '';
      topupModal.classList.remove('hidden');
    });
  }

  if (btnCloseTopup) {
    btnCloseTopup.addEventListener('click', () => {
      topupModal.classList.add('hidden');
    });
  }

  if (topupForm) {
    topupForm.addEventListener('submit', handleTopupSubmit);
  }

  if (btnAddItem) {
    btnAddItem.addEventListener('click', addItemRow);
  }

  if (modalBtnAddItem) {
    modalBtnAddItem.addEventListener('click', addModalItemRow);
  }

  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleFormSubmit);
  }

  if (modalExpenseForm) {
    modalExpenseForm.addEventListener('submit', handleModalFormSubmit);
  }

  if (btnNewTransaction) {
    btnNewTransaction.addEventListener('click', () => {
      successOverlay.classList.add('hidden');
      resetForm();
    });
  }

  if (btnShareReceipt) {
    btnShareReceipt.addEventListener('click', handleShareReceipt);
  }

  if (kategoriLaporan) {
    kategoriLaporan.addEventListener('change', (e) => {
      if (e.target.value === 'Grup Keberangkatan') {
        grupKeberangkatanWrapper.classList.remove('hidden');
        namaGrupInput.setAttribute('required', 'required');
      } else {
        grupKeberangkatanWrapper.classList.add('hidden');
        namaGrupInput.removeAttribute('required');
      }
    });
  }

  if (modalKategoriLaporan) {
    modalKategoriLaporan.addEventListener('change', (e) => {
      if (e.target.value === 'Grup Keberangkatan') {
        modalGrupWrapper.classList.remove('hidden');
        modalNamaGrupInput.setAttribute('required', 'required');
      } else {
        modalGrupWrapper.classList.add('hidden');
        modalNamaGrupInput.removeAttribute('required');
      }
    });
  }
}

// Vendor Date Filter Setup
function setupDateFilter() {
  if (orderDateFilter) {
    orderDateFilter.addEventListener('change', (e) => {
      appState.selectedDateFilter = e.target.value;
      renderOrdersList();
    });
  }

  if (btnClearDateFilter) {
    btnClearDateFilter.addEventListener('click', () => {
      orderDateFilter.value = '';
      appState.selectedDateFilter = '';
      renderOrdersList();
    });
  }
}

// String Normalizer for 100% Reliable Account Name Matching
function normString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/\s+/g, ' ').trim();
}

// Order ID Normalizer
function normId(id) {
  if (id === null || id === undefined) return '';
  return id.toString().replace(/[^0-9a-zA-Z]+/g, '').toLowerCase().trim();
}

// Check & Restore Active Session Synchronously
function checkAndRestoreSession() {
  const savedUser = localStorage.getItem('ACTIVE_KHIDMAT_USER');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      appState.activeUser = parsedUser;
      applyUserSessionUI();
    } catch (err) {
      console.error('Session restore error:', err);
    }
  }
}

function applyUserSessionUI() {
  if (!appState.activeUser) return;

  activeAccountName.textContent = appState.activeUser.name;
  const userRole = appState.activeUser.jenisAkun ? appState.activeUser.jenisAkun.toString().trim() : 'Tim';
  activeAccountType.textContent = userRole;
  activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

  authSection.classList.add('hidden');
  appFormWrapper.classList.remove('hidden');
  fabContainer.classList.remove('hidden');
  txHistorySection.classList.add('hidden');

  const roleLower = userRole.toLowerCase();

  if (roleLower === 'manajemen') {
    // MANAJEMEN ROLE VIEW
    mainBalanceSection.classList.add('hidden');
    estimatesBox.classList.add('hidden');
    ordersSection.classList.add('hidden');
    expenseFormSection.classList.add('hidden');
    managementSection.classList.remove('hidden');

    btnOpenMgmtPdfModal.classList.remove('hidden');
    btnOpenPdfModal.classList.add('hidden');
    btnOpenTransferModal.classList.remove('hidden');
    btnOpenTxHistoryModal.classList.remove('hidden');
    if (btnOpenTopup) btnOpenTopup.classList.remove('hidden');

    renderManagementDashboard();

  } else if (roleLower === 'vendor') {
    // VENDOR ROLE VIEW
    mainBalanceSection.classList.remove('hidden');
    estimatesBox.classList.remove('hidden');
    ordersSection.classList.remove('hidden');
    expenseFormSection.classList.add('hidden');
    managementSection.classList.add('hidden');

    btnOpenMgmtPdfModal.classList.add('hidden');
    btnOpenPdfModal.classList.remove('hidden');
    btnOpenTransferModal.classList.add('hidden');
    btnOpenTxHistoryModal.classList.remove('hidden');
    if (btnOpenTopup) btnOpenTopup.classList.add('hidden');

    calculateVendorEstimates();
    renderOrdersList();

  } else {
    // TIM ROLE VIEW
    mainBalanceSection.classList.remove('hidden');
    estimatesBox.classList.add('hidden');
    ordersSection.classList.add('hidden');
    expenseFormSection.classList.remove('hidden');
    managementSection.classList.add('hidden');

    btnOpenMgmtPdfModal.classList.add('hidden');
    btnOpenPdfModal.classList.add('hidden');
    btnOpenTransferModal.classList.remove('hidden');
    btnOpenTxHistoryModal.classList.remove('hidden');
    if (btnOpenTopup) btnOpenTopup.classList.add('hidden');
  }
}

// MANAGEMENT DASHBOARD RENDERER
function renderManagementDashboard() {
  if (!appState.activeUser || (appState.activeUser.jenisAkun || '').toLowerCase() !== 'manajemen') return;

  // 1. Total Saldo Kas Tergabung (SEMUA AKUN termasuk Akun Manajemen, Tim, & Vendor)
  const combinedTotal = appState.accounts.reduce((sum, acc) => sum + (acc.saldo || 0), 0);
  totalCombinedBalance.textContent = formatSAR(combinedTotal);

  // 2. Display Admin Account Name and Saldo
  const mgmtAdminAccName = document.getElementById('mgmtAdminAccName');
  const mgmtAdminBalanceDisplay = document.getElementById('mgmtAdminBalanceDisplay');
  if (mgmtAdminAccName) mgmtAdminAccName.textContent = appState.activeUser.name;
  if (mgmtAdminBalanceDisplay) mgmtAdminBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo || 0);

  const pendingTx = appState.transactions.filter(t => t.status === 'Menunggu Persetujuan');
  pendingApprovalsBadge.textContent = `${pendingTx.length} Pengeluaran`;

  pendingApprovalsContainer.innerHTML = '';
  if (pendingTx.length === 0) {
    pendingApprovalsContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #64748b; font-size: 13px; background: rgba(255,255,255,0.02); border-radius: 8px;">
        <i class="fa-solid fa-circle-check" style="font-size: 24px; color: #10b981; margin-bottom: 8px; display: block;"></i>
        Tidak ada laporan pengeluaran yang menunggu persetujuan
      </div>
    `;
  } else {
    [...pendingTx].reverse().forEach(tx => {
      const card = document.createElement('div');
      card.className = 'pending-approval-card';

      card.innerHTML = `
        <div class="approval-card-header">
          <div class="approval-user-info">
            <strong>${tx.akun}</strong>
            <small>${tx.waktu}</small>
          </div>
          <div class="approval-amount">${formatSAR(tx.total)}</div>
        </div>
        <div class="approval-details-box">
          <div><strong>Kegiatan:</strong> ${tx.kegiatan} (${tx.kategori})</div>
          ${tx.namaGrup && tx.namaGrup !== '-' ? `<div><strong>Grup:</strong> ${tx.namaGrup}</div>` : ''}
          ${tx.rincian ? `<div><strong>Rincian:</strong> ${tx.rincian}</div>` : ''}
        </div>
        <div class="approval-actions">
          <button type="button" class="btn-approve-action" onclick="handleApproveExpense('${tx.id}')">
            <i class="fa-solid fa-circle-check"></i> Setujui
          </button>
          <button type="button" class="btn-reject-action" onclick="handleRejectExpense('${tx.id}')">
            <i class="fa-solid fa-circle-xmark"></i> Tolak
          </button>
        </div>
      `;
      pendingApprovalsContainer.appendChild(card);
    });
  }

  teamBalancesContainer.innerHTML = '';
  vendorBalancesContainer.innerHTML = '';

  const timAccounts = appState.accounts.filter(a => (a.jenisAkun || '').toLowerCase() !== 'vendor' && (a.jenisAkun || '').toLowerCase() !== 'manajemen');
  const vendorAccounts = appState.accounts.filter(a => (a.jenisAkun || '').toLowerCase() === 'vendor');

  if (timAccounts.length === 0) {
    teamBalancesContainer.innerHTML = '<div style="font-size:12px; color:#94a3b8;">Tidak ada data akun Tim.</div>';
  } else {
    timAccounts.forEach(acc => {
      const card = document.createElement('div');
      card.className = 'account-balance-card';
      card.innerHTML = `
        <div class="acc-card-name">${acc.name}</div>
        <div class="acc-card-type">${acc.jenisAkun || 'Tim'}</div>
        <div class="acc-card-balance">${formatSAR(acc.saldo)}</div>
      `;
      teamBalancesContainer.appendChild(card);
    });
  }

  if (vendorAccounts.length === 0) {
    vendorBalancesContainer.innerHTML = '<div style="font-size:12px; color:#94a3b8;">Tidak ada data akun Vendor.</div>';
  } else {
    vendorAccounts.forEach(acc => {
      const card = document.createElement('div');
      card.className = 'account-balance-card';
      card.innerHTML = `
        <div class="acc-card-name">${acc.name}</div>
        <div class="acc-card-type">${acc.jenisAkun || 'Vendor'}</div>
        <div class="acc-card-balance">${formatSAR(acc.saldo)}</div>
      `;
      vendorBalancesContainer.appendChild(card);
    });
  }
}

// MANAGEMENT ACTION: APPROVE EXPENSE (Opsi B)
window.handleApproveExpense = async function(txId) {
  const tx = appState.transactions.find(t => normId(t.id) === normId(txId));
  if (!tx) return;

  if (!confirm(`Setujui laporan pengeluaran dari ${tx.akun} sebesar ${formatSAR(tx.total)}? Saldo kas ${tx.akun} akan dipotong.`)) return;

  try {
    const payload = {
      action: 'updateExpenseStatus',
      txId: txId,
      newStatus: 'Disetujui'
    };

    tx.status = 'Disetujui';

    const senderAcc = appState.accounts.find(a => normString(a.name) === normString(tx.akun));
    if (senderAcc) {
      senderAcc.saldo -= tx.total;
    }

    renderManagementDashboard();
    showAutoToast("Pengeluaran Disetujui!", `Saldo ${tx.akun} telah dipotong ${formatSAR(tx.total)}`);

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setTimeout(fetchDataFromSpreadsheet, 3000);

  } catch (err) {
    console.error('Approve expense error:', err);
    alert('Terjadi kesalahan saat menyetujui pengeluaran: ' + err.message);
  }
};

// MANAGEMENT ACTION: REJECT EXPENSE
window.handleRejectExpense = async function(txId) {
  const tx = appState.transactions.find(t => normId(t.id) === normId(txId));
  if (!tx) return;

  if (!confirm(`Tolak laporan pengeluaran dari ${tx.akun} sebesar ${formatSAR(tx.total)}?`)) return;

  try {
    const payload = {
      action: 'updateExpenseStatus',
      txId: txId,
      newStatus: 'Ditolak'
    };

    tx.status = 'Ditolak';

    renderManagementDashboard();
    showAutoToast("Pengeluaran Ditolak!", `Laporan pengeluaran dari ${tx.akun} telah ditolak`);

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setTimeout(fetchDataFromSpreadsheet, 3000);

  } catch (err) {
    console.error('Reject expense error:', err);
    alert('Terjadi kesalahan saat menolak pengeluaran: ' + err.message);
  }
};

// Auto-closing Toast with Animated Checkmark (2.5 Seconds)
function showAutoToast(titleText, subtitleText) {
  toastTitle.textContent = titleText;
  toastSubtitle.textContent = subtitleText;
  toastOverlay.classList.remove('hidden');

  setTimeout(() => {
    toastOverlay.classList.add('hidden');
  }, 2500);
}

// Setup Floating Action Button (FAB) Floating Menu
function setupFabMenu() {
  btnToggleFab.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = fabMenu.classList.contains('hidden');
    if (isHidden) {
      fabMenu.classList.remove('hidden');
      btnToggleFab.classList.add('active');
    } else {
      closeFabMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!fabContainer.contains(e.target)) {
      closeFabMenu();
    }
  });
}

function closeFabMenu() {
  fabMenu.classList.add('hidden');
  btnToggleFab.classList.remove('active');
}

// Account Searchbar Autocomplete
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
      <i class="fa-solid ${acc.jenisAkun && acc.jenisAkun.toLowerCase() === 'vendor' ? 'fa-store' : (acc.jenisAkun && acc.jenisAkun.toLowerCase() === 'manajemen' ? 'fa-user-shield' : 'fa-user-circle')}"></i> 
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

// MANAGEMENT MODAL AUTOCOMPLETE SETUP FOR DOC 3 & DOC 4 (Grup Keberangkatan)
function setupMgmtGroupAutocomplete() {
  const doc3Input = document.getElementById('doc3GrupInput');
  const doc3Sugg = document.getElementById('doc3GrupSuggestions');

  if (doc3Input && doc3Sugg) {
    doc3Input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) { doc3Sugg.classList.add('hidden'); return; }
      const filtered = appState.masterGroups.filter(g => g.toLowerCase().includes(query));
      renderSuggestions(doc3Sugg, filtered, (val) => { doc3Input.value = val; doc3Sugg.classList.add('hidden'); });
    });

    doc3Input.addEventListener('focus', () => {
      renderSuggestions(doc3Sugg, appState.masterGroups, (val) => { doc3Input.value = val; doc3Sugg.classList.add('hidden'); });
    });
  }

  const doc4Input = document.getElementById('doc4GrupInput');
  const doc4Sugg = document.getElementById('doc4GrupSuggestions');

  if (doc4Input && doc4Sugg) {
    doc4Input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) { doc4Sugg.classList.add('hidden'); return; }
      const filtered = appState.masterGroups.filter(g => g.toLowerCase().includes(query));
      renderSuggestions(doc4Sugg, filtered, (val) => { doc4Input.value = val; doc4Sugg.classList.add('hidden'); });
    });

    doc4Input.addEventListener('focus', () => {
      renderSuggestions(doc4Sugg, appState.masterGroups, (val) => { doc4Input.value = val; doc4Sugg.classList.add('hidden'); });
    });
  }
}

// Ultra Responsive Keypad
function setupResponsiveKeypad() {
  const keypadBtns = document.querySelectorAll('.keypad-btn[data-val]');
  const btnBackspace = document.getElementById('btnKeypadBackspace');

  keypadBtns.forEach(btn => {
    const handleKeyPress = (e) => {
      e.preventDefault();
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);

      if (appState.enteredPin.length < 6) {
        appState.enteredPin += btn.dataset.val;
        updatePinDots();

        if (appState.enteredPin.length === 6) {
          setTimeout(verifyAndLoginAuto, 50);
        }
      }
    };

    btn.addEventListener('pointerdown', handleKeyPress);
  });

  const handleBackspace = (e) => {
    e.preventDefault();
    btnBackspace.classList.add('pressed');
    setTimeout(() => btnBackspace.classList.remove('pressed'), 120);

    if (appState.enteredPin.length > 0) {
      appState.enteredPin = appState.enteredPin.slice(0, -1);
      updatePinDots();
    }
  };

  btnBackspace.addEventListener('pointerdown', handleBackspace);
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

function verifyAndLoginAuto() {
  if (!appState.selectedAccount) {
    const match = appState.accounts.find(a => normString(a.name) === normString(accountSearchInput.value));
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
    localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));
    applyUserSessionUI();
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
  localStorage.removeItem('ACTIVE_KHIDMAT_USER');
  updatePinDots();
  closeFabMenu();
  fabContainer.classList.add('hidden');
  appFormWrapper.classList.add('hidden');
  authSection.classList.remove('hidden');
}

// MANAGEMENT PDF EXPORT MODAL SETUP (7 DOCUMENT TYPES)
function setupMgmtPdfModal() {
  btnOpenMgmtPdfModal.addEventListener('click', (e) => {
    if (e) e.stopPropagation();
    closeFabMenu();
    
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    document.getElementById('doc1Tanggal').value = today;
    document.getElementById('doc2Tanggal').value = today;
    document.getElementById('doc3Tanggal').value = today;

    document.getElementById('doc5StartDate').value = firstDay;
    document.getElementById('doc5EndDate').value = today;

    document.getElementById('doc6StartDate').value = firstDay;
    document.getElementById('doc6EndDate').value = today;

    const currentYearMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('doc7Bulan').value = currentYearMonth;

    resetDoc1Items();
    resetDoc3Items();

    mgmtDocTypeSelect.value = "1";
    switchMgmtPdfFields("1");

    mgmtPdfModal.classList.remove('hidden');
  });

  btnCloseMgmtPdfModal.addEventListener('click', () => {
    mgmtPdfModal.classList.add('hidden');
  });

  mgmtDocTypeSelect.addEventListener('change', (e) => {
    switchMgmtPdfFields(e.target.value);
  });

  document.getElementById('btnAddDoc1Item').addEventListener('click', () => addDoc1ItemRow());
  document.getElementById('btnAddDoc3Item').addEventListener('click', () => addDoc3ItemRow());

  mgmtPdfForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateManagementPdfDocument();
  });
}

// DYNAMICALLY SCOPE VALIDATION & VISIBILITY FOR ACTIVE DYNAMIC PDF FIELD GROUP
function switchMgmtPdfFields(docTypeVal) {
  for (let i = 1; i <= 7; i++) {
    const groupEl = document.getElementById(`fieldDoc${i}`);
    if (groupEl) {
      const inputs = groupEl.querySelectorAll('input, select, textarea');
      if (i.toString() === docTypeVal) {
        groupEl.classList.remove('hidden');
        inputs.forEach(inp => {
          inp.disabled = false;
          if (inp.dataset.req === 'true') {
            inp.required = true;
          }
        });
      } else {
        groupEl.classList.add('hidden');
        inputs.forEach(inp => {
          inp.disabled = true;
          inp.required = false;
        });
      }
    }
  }
}

// DOC 1 (Approval Pengajuan) DYNAMIC ITEMS (QTY, Subtotal, Grand Total)
function resetDoc1Items() {
  appState.doc1Items = [];
  document.getElementById('doc1ItemsContainer').innerHTML = '';
  addDoc1ItemRow();
}

function addDoc1ItemRow() {
  const idx = appState.doc1Items.length;
  const itemData = {
    id: Date.now() + Math.random(),
    program: '',
    qty: 1,
    hargaSatuan: 0,
    jumlah: 0,
    dueDate: new Date().toISOString().split('T')[0],
    tujuanPenerima: ''
  };
  appState.doc1Items.push(itemData);

  const container = document.getElementById('doc1ItemsContainer');
  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.idx = idx;

  card.innerHTML = `
    <div class="item-card-header">
      <span class="item-number">Item Program #${idx + 1}</span>
      ${appState.doc1Items.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removeDoc1ItemRow(${idx})"><i class="fa-solid fa-xmark"></i></button>` : ''}
    </div>
    <div class="item-grid">
      <div class="input-group full-width">
        <label>Program / Item</label>
        <input type="text" class="navy-input doc1-item-program" placeholder="Misal: Bus Operasional Madinah" oninput="updateDoc1Item(${idx}, 'program', this.value)" required>
      </div>
      <div class="input-group">
        <label>QTY</label>
        <input type="number" min="1" class="navy-input doc1-item-qty" value="1" oninput="updateDoc1Item(${idx}, 'qty', this.value)" required>
      </div>
      <div class="input-group">
        <label>Harga Satuan (SAR)</label>
        <input type="number" step="any" class="navy-input doc1-item-harga" placeholder="0.00" oninput="updateDoc1Item(${idx}, 'hargaSatuan', this.value)" required>
      </div>
      <div class="input-group">
        <label>Due Date</label>
        <input type="date" class="navy-input doc1-item-date" value="${itemData.dueDate}" oninput="updateDoc1Item(${idx}, 'dueDate', this.value)" required>
      </div>
      <div class="input-group">
        <label>Tujuan Penerima</label>
        <input type="text" class="navy-input doc1-item-penerima" placeholder="Nama vendor / pihak ke-3" oninput="updateDoc1Item(${idx}, 'tujuanPenerima', this.value)" required>
      </div>
      <div class="input-group full-width" style="margin-top: 4px;">
        <label style="font-size: 11px; color: var(--text-muted);">Subtotal Item:</label>
        <div class="item-subtotal-badge doc1-item-subtotal">SAR 0.00</div>
      </div>
    </div>
  `;
  container.appendChild(card);
  calculateDoc1GrandTotal();
}

window.removeDoc1ItemRow = function(idx) {
  if (appState.doc1Items.length <= 1) return;
  appState.doc1Items.splice(idx, 1);
  reRenderDoc1Items();
};

function reRenderDoc1Items() {
  const container = document.getElementById('doc1ItemsContainer');
  container.innerHTML = '';
  const current = [...appState.doc1Items];
  appState.doc1Items = [];

  current.forEach((it, i) => {
    addDoc1ItemRow();
    const lastIdx = appState.doc1Items.length - 1;
    appState.doc1Items[lastIdx] = it;
    const card = container.children[lastIdx];
    if (card) {
      card.querySelector('.doc1-item-program').value = it.program || '';
      card.querySelector('.doc1-item-qty').value = it.qty || 1;
      card.querySelector('.doc1-item-harga').value = it.hargaSatuan || '';
      card.querySelector('.doc1-item-date').value = it.dueDate || '';
      card.querySelector('.doc1-item-penerima').value = it.tujuanPenerima || '';
    }
  });

  calculateDoc1GrandTotal();
}

window.updateDoc1Item = function(idx, field, val) {
  if (!appState.doc1Items[idx]) return;
  if (field === 'hargaSatuan') {
    appState.doc1Items[idx].hargaSatuan = parseFloat(val) || 0;
  } else if (field === 'qty') {
    appState.doc1Items[idx].qty = parseInt(val) || 1;
  } else {
    appState.doc1Items[idx][field] = val;
  }

  const qty = appState.doc1Items[idx].qty || 1;
  const harga = appState.doc1Items[idx].hargaSatuan || 0;
  const subtotal = qty * harga;
  appState.doc1Items[idx].jumlah = subtotal;

  const container = document.getElementById('doc1ItemsContainer');
  const card = container.children[idx];
  if (card) {
    const subBadge = card.querySelector('.doc1-item-subtotal');
    if (subBadge) subBadge.textContent = formatSAR(subtotal);
  }

  calculateDoc1GrandTotal();
};

function calculateDoc1GrandTotal() {
  const total = appState.doc1Items.reduce((sum, it) => sum + ((it.qty || 1) * (it.hargaSatuan || 0)), 0);
  const displayEl = document.getElementById('doc1GrandTotalDisplay');
  if (displayEl) displayEl.textContent = formatSAR(total);
  return total;
}

// DOC 3 (Add on Tagihan Jamaah) DYNAMIC ITEMS
function resetDoc3Items() {
  appState.doc3Items = [];
  document.getElementById('doc3ItemsContainer').innerHTML = '';
  addDoc3ItemRow();
}

function addDoc3ItemRow() {
  const idx = appState.doc3Items.length;
  const itemData = {
    id: Date.now() + Math.random(),
    keterangan: '',
    hargaSatuan: 0,
    qty: 1,
    jumlah: 0
  };
  appState.doc3Items.push(itemData);

  const container = document.getElementById('doc3ItemsContainer');
  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.idx = idx;

  card.innerHTML = `
    <div class="item-card-header">
      <span class="item-number">Item Add-On #${idx + 1}</span>
      ${appState.doc3Items.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removeDoc3ItemRow(${idx})"><i class="fa-solid fa-xmark"></i></button>` : ''}
    </div>
    <div class="item-grid">
      <div class="input-group full-width">
        <label>Keterangan Item</label>
        <input type="text" class="navy-input doc3-item-ket" placeholder="Misal: Upgrade Kamar Double" oninput="updateDoc3Item(${idx}, 'keterangan', this.value)" required>
      </div>
      <div class="input-group">
        <label>Harga Satuan (SAR)</label>
        <input type="number" step="any" class="navy-input doc3-item-harga" placeholder="0.00" oninput="updateDoc3Item(${idx}, 'hargaSatuan', this.value)" required>
      </div>
      <div class="input-group">
        <label>QTY</label>
        <input type="number" min="1" class="navy-input doc3-item-qty" value="1" oninput="updateDoc3Item(${idx}, 'qty', this.value)" required>
      </div>
      <div class="input-group full-width" style="margin-top: 4px;">
        <label style="font-size: 11px; color: var(--text-muted);">Subtotal Item:</label>
        <div class="item-subtotal-badge doc3-item-subtotal">SAR 0.00</div>
      </div>
    </div>
  `;
  container.appendChild(card);
  calculateDoc3GrandTotal();
}

window.removeDoc3ItemRow = function(idx) {
  if (appState.doc3Items.length <= 1) return;
  appState.doc3Items.splice(idx, 1);
  reRenderDoc3Items();
};

function reRenderDoc3Items() {
  const container = document.getElementById('doc3ItemsContainer');
  container.innerHTML = '';
  const current = [...appState.doc3Items];
  appState.doc3Items = [];

  current.forEach((it, i) => {
    addDoc3ItemRow();
    const lastIdx = appState.doc3Items.length - 1;
    appState.doc3Items[lastIdx] = it;
    const card = container.children[lastIdx];
    if (card) {
      card.querySelector('.doc3-item-ket').value = it.keterangan || '';
      card.querySelector('.doc3-item-harga').value = it.hargaSatuan || '';
      card.querySelector('.doc3-item-qty').value = it.qty || 1;
    }
  });

  calculateDoc3GrandTotal();
}

window.updateDoc3Item = function(idx, field, val) {
  if (!appState.doc3Items[idx]) return;
  if (field === 'hargaSatuan') {
    appState.doc3Items[idx].hargaSatuan = parseFloat(val) || 0;
  } else if (field === 'qty') {
    appState.doc3Items[idx].qty = parseInt(val) || 1;
  } else {
    appState.doc3Items[idx][field] = val;
  }

  const qty = appState.doc3Items[idx].qty || 1;
  const harga = appState.doc3Items[idx].hargaSatuan || 0;
  const subtotal = qty * harga;
  appState.doc3Items[idx].jumlah = subtotal;

  const container = document.getElementById('doc3ItemsContainer');
  const card = container.children[idx];
  if (card) {
    const subBadge = card.querySelector('.doc3-item-subtotal');
    if (subBadge) subBadge.textContent = formatSAR(subtotal);
  }

  calculateDoc3GrandTotal();
};

function calculateDoc3GrandTotal() {
  const total = appState.doc3Items.reduce((sum, it) => sum + ((it.qty || 1) * (it.hargaSatuan || 0)), 0);
  const displayEl = document.getElementById('doc3GrandTotalDisplay');
  if (displayEl) displayEl.textContent = formatSAR(total);
  return total;
}

// DUAL METHOD PRINT TRIGGER (WINDOW.OPEN + INVISIBLE IFRAME FALLBACK)
function printHtmlContent(htmlContent) {
  let windowPrinted = false;

  // 1. Try Direct Window Open Print
  try {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
      windowPrinted = true;
    }
  } catch (e) {
    console.log('Window open print notice:', e);
  }

  // 2. Fallback to Invisible Iframe Print
  if (!windowPrinted) {
    let printFrame = document.getElementById('printIframe');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'printIframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0px';
      printFrame.style.height = '0px';
      printFrame.style.border = '0';
      printFrame.style.zIndex = '-9999';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (err) {
        console.error('Iframe print notice:', err);
      }
    }, 400);
  }
}

// PRINTABLE PDF GENERATOR FOR MANAGEMENT (7 DOCUMENT TYPES)
function generateManagementPdfDocument() {
  const docTypeVal = mgmtDocTypeSelect.value;

  let docTitleHtml = '';
  let bodyContentHtml = '';
  let docTypeName = '';

  if (docTypeVal === "1") {
    docTypeName = 'Approval Pengajuan';
    const tanggal = document.getElementById('doc1Tanggal').value;
    const divisi = document.getElementById('doc1Divisi').value;
    const program = document.getElementById('doc1Program').value;

    let grandTotal = 0;
    const rowsHtml = appState.doc1Items.map((it, idx) => {
      const qty = it.qty || 1;
      const hargaSatuan = it.hargaSatuan || 0;
      const subtotal = qty * hargaSatuan;
      grandTotal += subtotal;
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${it.program || '-'}</strong></td>
          <td style="text-align:center;">${qty}</td>
          <td style="text-align:right;">${formatSAR(hargaSatuan)}</td>
          <td style="text-align:right;"><strong>${formatSAR(subtotal)}</strong></td>
          <td style="text-align:center;">${it.dueDate || '-'}</td>
          <td>${it.tujuanPenerima || '-'}</td>
        </tr>
      `;
    }).join('');

    docTitleHtml = `APPROVAL PENGAJUAN PROGRAM`;
    bodyContentHtml = `
      <div class="biodata-grid">
        <div class="biodata-item"><span>Tanggal Pengajuan:</span><strong>${tanggal}</strong></div>
        <div class="biodata-item"><span>Divisi:</span><strong>${divisi}</strong></div>
        <div class="biodata-item" style="grid-column: span 2;"><span>Nama Program:</span><strong>${program}</strong></div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Program / Item</th>
            <th style="text-align:center;">QTY</th>
            <th style="text-align:right;">Harga Satuan (SAR)</th>
            <th style="text-align:right;">Jumlah (SAR)</th>
            <th style="text-align:center;">Due Date</th>
            <th>Tujuan Penerima</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:right; font-weight: bold;">TOTAL JUMLAH PENGAJUAN:</td>
            <td style="text-align:right; font-weight: bold; font-size: 14px; color:#d97706;">${formatSAR(grandTotal)}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center;">
        <div>
          <p style="font-size: 11px; color: #64748b;">Diajukan Oleh:</p>
          <div style="height: 50px;"></div>
          <strong>(${divisi})</strong>
        </div>
        <div>
          <p style="font-size: 11px; color: #64748b;">Disetujui Oleh:</p>
          <div style="height: 50px;"></div>
          <strong>(Manajemen Tim Khidmat)</strong>
        </div>
      </div>
    `;

  } else if (docTypeVal === "2") {
    docTypeName = 'Kwitansi';
    const noRef = (document.getElementById('doc2NoRef').value || 'IN0001').trim();
    const tanggal = document.getElementById('doc2Tanggal').value;
    const nominal = parseFloat(document.getElementById('doc2Nominal').value) || 0;
    const keterangan = document.getElementById('doc2Keterangan').value || '-';
    const pengirim = document.getElementById('doc2Pengirim').value || 'Finance Pusat';
    const penerima = document.getElementById('doc2Penerima').value || 'Saudi Operational Officer';

    const formattedTanggal = formatSaudiDateOnly(tanggal);
    const formattedNominal = formatSAR(nominal);

    docTitleHtml = `KWITANSI PEMBAYARAN`;
    bodyContentHtml = `
      <div class="kwitansi-card" style="background:#fff; border: 2.5px solid #0f172a; border-radius: 18px; padding: 32px 38px; box-shadow: 0 10px 25px rgba(15,23,42,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <div>
            <h1 style="font-family:'Martel',serif; font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">KWITANSI</h1>
            <p style="font-size: 14px; color: #1e293b; margin: 0;">Tim Khidmat <strong style="font-family:'Martel',serif; color:#0f172a;">jejak imani</strong> Saudi Arabia</p>
          </div>
          <div style="font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">
            No. Referensi : <span style="font-weight: 700;">${noRef}</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 40px;">
          <tr>
            <td style="width: 120px; font-weight: 600; padding: 6px 0; font-size: 14px; color: #0f172a;">Tanggal</td>
            <td style="width: 24px; font-weight: 700; padding: 6px 0; font-size: 14px; color: #0f172a;">:</td>
            <td style="font-weight: 600; padding: 6px 0; font-size: 14px; color: #0f172a;">${formattedTanggal}</td>
          </tr>
          <tr>
            <td style="width: 120px; font-weight: 600; padding: 6px 0; font-size: 14px; color: #0f172a;">Nominal</td>
            <td style="width: 24px; font-weight: 700; padding: 6px 0; font-size: 14px; color: #0f172a;">:</td>
            <td style="font-family:'Martel',serif; font-weight: 800; font-size: 15px; padding: 6px 0; color: #0f172a;">${formattedNominal}</td>
          </tr>
          <tr>
            <td style="width: 120px; font-weight: 600; padding: 6px 0; font-size: 14px; color: #0f172a;">Terbilang</td>
            <td style="width: 24px; font-weight: 700; padding: 6px 0; font-size: 14px; color: #0f172a;">:</td>
            <td style="font-family:'Martel',serif; font-weight: 800; font-size: 15px; padding: 6px 0; color: #0f172a;">${formattedNominal}</td>
          </tr>
          <tr>
            <td style="width: 120px; font-weight: 600; padding: 6px 0; font-size: 14px; color: #0f172a;">Keterangan</td>
            <td style="width: 24px; font-weight: 700; padding: 6px 0; font-size: 14px; color: #0f172a;">:</td>
            <td style="font-weight: 600; padding: 6px 0; font-size: 14px; color: #0f172a;">${keterangan}</td>
          </tr>
        </table>

        <div style="display: flex; justify-content: space-around; align-items: center; margin-top: 30px;">
          <div style="text-align: center; min-width: 200px;">
            <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 64px;">Diserahkan Oleh</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${pengirim}</div>
          </div>
          <div style="text-align: center; min-width: 200px;">
            <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 64px;">Diterima Oleh</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${penerima}</div>
          </div>
        </div>
      </div>
    `;

  } else if (docTypeVal === "3") {
    docTypeName = 'Add on Tagihan Jamaah';
    const grup = document.getElementById('doc3GrupInput').value;
    const jamaah = document.getElementById('doc3Jamaah').value;
    const tanggal = document.getElementById('doc3Tanggal').value;

    let grandTotal = 0;
    const rowsHtml = appState.doc3Items.map((it, idx) => {
      const qty = it.qty || 1;
      const hargaSatuan = it.hargaSatuan || 0;
      const subtotal = qty * hargaSatuan;
      grandTotal += subtotal;
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${it.keterangan || '-'}</strong></td>
          <td style="text-align:right;">${formatSAR(hargaSatuan)}</td>
          <td style="text-align:center;">${qty}</td>
          <td style="text-align:right;"><strong>${formatSAR(subtotal)}</strong></td>
        </tr>
      `;
    }).join('');

    docTitleHtml = `ADD ON TAGIHAN JAMAAH`;
    bodyContentHtml = `
      <div class="biodata-grid">
        <div class="biodata-item"><span>Nama Jamaah:</span><strong>${jamaah}</strong></div>
        <div class="biodata-item"><span>Nama Grup:</span><strong>${grup}</strong></div>
        <div class="biodata-item" style="grid-column: span 2;"><span>Tanggal Dokumen:</span><strong>${tanggal}</strong></div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Keterangan Item Add-On</th>
            <th style="text-align:right;">Harga Satuan (SAR)</th>
            <th style="text-align:center;">QTY</th>
            <th style="text-align:right;">Jumlah (SAR)</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:right; font-weight: bold;">TOTAL TAGIHAN ADD-ON:</td>
            <td style="text-align:right; font-weight: bold; font-size: 14px; color:#d97706;">${formatSAR(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    `;

  } else if (docTypeVal === "4") {
    docTypeName = 'Laporan Pengeluaran Grup';
    const selectedGroup = document.getElementById('doc4GrupInput').value.trim();
    const groupTxs = appState.transactions.filter(t => normString(t.grup) === normString(selectedGroup));

    const categories = {
      'Operasional Jeddah': [],
      'Operasional Madinah': [],
      'Operasional Makkah': [],
      'Pemesanan Vendor': [],
      'Lainnya': []
    };

    groupTxs.forEach(t => {
      const keg = (t.kegiatan || '').toLowerCase();
      const kat = (t.kategori || '').toLowerCase();
      if (keg.includes('jeddah')) categories['Operasional Jeddah'].push(t);
      else if (keg.includes('madinah')) categories['Operasional Madinah'].push(t);
      else if (keg.includes('makkah') || keg.includes('mecca')) categories['Operasional Makkah'].push(t);
      else if (kat.includes('vendor')) categories['Pemesanan Vendor'].push(t);
      else categories['Lainnya'].push(t);
    });

    let overallGrandTotal = 0;
    let summaryRowsHtml = '';
    let categoryTablesHtml = '';

    Object.keys(categories).forEach((catName, idx) => {
      const txs = categories[catName];
      const catTotal = txs.reduce((sum, t) => sum + t.total, 0);
      overallGrandTotal += catTotal;

      summaryRowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${catName}</strong></td>
          <td style="text-align:center;">${txs.length} Transaksi</td>
          <td style="text-align:right;"><strong>${formatSAR(catTotal)}</strong></td>
        </tr>
      `;

      if (txs.length > 0) {
        const itemRows = txs.map((t, i) => `
          <tr>
            <td style="text-align:center;">${i + 1}</td>
            <td>${t.waktu}</td>
            <td>${t.kegiatan} (${t.akun})</td>
            <td>${t.rincian || '-'}</td>
            <td style="text-align:right;"><strong>${formatSAR(t.total)}</strong></td>
          </tr>
        `).join('');

        categoryTablesHtml += `
          <div style="margin-top: 24px;">
            <h3 style="font-size: 13px; font-weight:700; color:#0f172a; margin-bottom: 6px; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">
              ${idx + 1}. ${catName.toUpperCase()} (Total: ${formatSAR(catTotal)})
            </h3>
            <table class="report-table">
              <thead>
                <tr>
                  <th style="width:30px;">No</th>
                  <th>Waktu</th>
                  <th>Nama Kegiatan</th>
                  <th>Rincian Item</th>
                  <th style="text-align:right;">Jumlah (SAR)</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </div>
        `;
      }
    });

    docTitleHtml = `LAPORAN PENGELUARAN GRUP: ${selectedGroup.toUpperCase()}`;
    bodyContentHtml = `
      <div class="biodata-grid">
        <div class="biodata-item"><span>Nama Grup Keberangkatan:</span><strong>${selectedGroup}</strong></div>
        <div class="biodata-item"><span>Total Pengeluaran Grup:</span><strong style="color:#d97706; font-size:14px;">${formatSAR(overallGrandTotal)}</strong></div>
      </div>

      <h3 style="font-size: 13px; font-weight:700; color:#0f172a; margin-top: 15px; margin-bottom: 6px;">RINGKASAN 5 KATEGORI OPERASIONAL</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width:30px;">No</th>
            <th>Kategori Operasional</th>
            <th style="text-align:center;">Jumlah Transaksi</th>
            <th style="text-align:right;">Subtotal Pengeluaran (SAR)</th>
          </tr>
        </thead>
        <tbody>${summaryRowsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right; font-weight: bold;">TOTAL KESELURUHAN PENGELUARAN GRUP:</td>
            <td style="text-align:right; font-weight: bold; font-size: 14px; color:#d97706;">${formatSAR(overallGrandTotal)}</td>
          </tr>
        </tfoot>
      </table>

      ${categoryTablesHtml}
    `;

  } else if (docTypeVal === "5") {
    docTypeName = 'Rekapitulasi Rincian Transaksi';
    const startDate = document.getElementById('doc5StartDate').value;
    const endDate = document.getElementById('doc5EndDate').value;

    const filteredTxs = appState.transactions.filter(t => {
      const iso = normalizeDateToISO(t.waktu);
      return iso >= startDate && iso <= endDate;
    });

    let totalExpense = 0;

    const txRowsHtml = filteredTxs.map((t, idx) => {
      totalExpense += t.total;
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${t.waktu}</td>
          <td><strong>${t.akun}</strong></td>
          <td>${t.kegiatan}</td>
          <td>${t.grup || '-'}</td>
          <td style="text-align:right;"><strong>${formatSAR(t.total)}</strong></td>
          <td style="text-align:center;"><span style="color:#047857; font-weight:bold;">${t.status}</span></td>
        </tr>
      `;
    }).join('');

    docTitleHtml = `REKAPITULASI RINCIAN TRANSAKSI`;
    bodyContentHtml = `
      <div class="biodata-grid">
        <div class="biodata-item"><span>Periode Mulai:</span><strong>${startDate}</strong></div>
        <div class="biodata-item"><span>Periode Selesai:</span><strong>${endDate}</strong></div>
        <div class="biodata-item" style="grid-column: span 2;"><span>Total Nominal Transaksi:</span><strong style="color:#d97706;">${formatSAR(totalExpense)}</strong></div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Waktu</th>
            <th>Akun Tim</th>
            <th>Kegiatan</th>
            <th>Grup</th>
            <th style="text-align:right;">Total (SAR)</th>
            <th style="text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>${txRowsHtml || '<tr><td colspan="7" style="text-align:center;">Tidak ada transaksi dalam rentang tanggal ini</td></tr>'}</tbody>
      </table>
    `;

  } else if (docTypeVal === "6") {
    docTypeName = 'Rekapitulasi Transaksi Grup';
    const startDate = document.getElementById('doc6StartDate').value;
    const endDate = document.getElementById('doc6EndDate').value;

    const filteredTxs = appState.transactions.filter(t => {
      const iso = normalizeDateToISO(t.waktu);
      return iso >= startDate && iso <= endDate;
    });

    let totalDebit = 0;
    let totalKredit = 0;

    const rowsHtml = filteredTxs.map((t, idx) => {
      const isMasuk = t.kategori === 'Isi Saldo' || t.kategori === 'Kas Masuk';
      if (isMasuk) totalDebit += t.total;
      else totalKredit += t.total;

      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${t.waktu}</td>
          <td>${t.grup || '-'}</td>
          <td>${t.kegiatan} (${t.akun})</td>
          <td style="text-align:right; color:#047857;">${isMasuk ? formatSAR(t.total) : '-'}</td>
          <td style="text-align:right; color:#b91c1c;">${!isMasuk ? formatSAR(t.total) : '-'}</td>
        </tr>
      `;
    }).join('');

    docTitleHtml = `REKAPITULASI TRANSAKSI GRUP (DEBIT / KREDIT)`;
    bodyContentHtml = `
      <div class="biodata-grid">
        <div class="biodata-item"><span>Periode Rentang Tanggal:</span><strong>${startDate} s/d ${endDate}</strong></div>
        <div class="biodata-item"><span>Total Debit (Kas Masuk):</span><strong style="color:#047857;">${formatSAR(totalDebit)}</strong></div>
        <div class="biodata-item"><span>Total Kredit (Pengeluaran):</span><strong style="color:#b91c1c;">${formatSAR(totalKredit)}</strong></div>
        <div class="biodata-item"><span>Selisih (Net):</span><strong>${formatSAR(totalDebit - totalKredit)}</strong></div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Tanggal</th>
            <th>Nama Grup</th>
            <th>Keterangan Operasional</th>
            <th style="text-align:right;">Debit / Masuk (SAR)</th>
            <th style="text-align:right;">Kredit / Keluar (SAR)</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;">Tidak ada transaksi grup pada periode ini</td></tr>'}</tbody>
      </table>
    `;

  } else if (docTypeVal === "7") {
    docTypeName = 'Laporan Biaya Operasional Tim';
    const bulanVal = document.getElementById('doc7Bulan').value;

    const filteredTxs = appState.transactions.filter(t => {
      const iso = normalizeDateToISO(t.waktu);
      return iso.startsWith(bulanVal) && (t.kategori === 'Operasional Tim' || t.kategori === 'Operasional');
    });

    let totalOpTim = 0;
    const rowsHtml = filteredTxs.map((t, idx) => {
      totalOpTim += t.total;
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${t.waktu}</td>
          <td><strong>${t.akun}</strong></td>
          <td>${t.kegiatan}</td>
          <td>${t.rincian || '-'}</td>
          <td style="text-align:right;"><strong>${formatSAR(t.total)}</strong></td>
        </tr>
      `;
    }).join('');

    docTitleHtml = `LAPORAN BIAYA OPERASIONAL TIM - BULAN ${bulanVal}`;
    bodyContentHtml = `
      <div class="biodata-grid">
        <div class="biodata-item"><span>Bulan Operasional:</span><strong>${bulanVal}</strong></div>
        <div class="biodata-item"><span>Total Pengeluaran Operasional:</span><strong style="color:#d97706;">${formatSAR(totalOpTim)}</strong></div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Waktu</th>
            <th>Akun Tim</th>
            <th>Nama Kegiatan</th>
            <th>Rincian Item</th>
            <th style="text-align:right;">Jumlah (SAR)</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;">Tidak ada biaya operasional tim pada bulan ini</td></tr>'}</tbody>
      </table>
    `;
  }

  let printDocumentHtml = '';
  let fileName = `${docTypeName.replace(/\s+/g, '_')}_${Date.now()}`;

  if (docTypeVal === "2") {
    const noRef = (document.getElementById('doc2NoRef').value || 'IN0001').trim();
    fileName = `Kwitansi - ${noRef}`;

    printDocumentHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${fileName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Martel:wght@600;700;800&family=Mulish:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: 'Mulish', sans-serif;
      background-color: #ffffff;
      color: #0f172a;
    }
    .a4-container {
      width: 210mm;
      min-height: 297mm;
      position: relative;
      background-image: url('assets/kwitansi_bg.png');
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;
      padding: 60mm 16mm 20mm 16mm;
      margin: 0 auto;
    }
    .kwitansi-card {
      background: #ffffff;
      border: 2.5px solid #0f172a;
      border-radius: 18px;
      padding: 32px 38px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
      position: relative;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .a4-container { width: 100%; height: 100vh; padding: 58mm 16mm 20mm 16mm; }
    }
  </style>
</head>
<body>
  <div class="a4-container">
    ${bodyContentHtml}
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  } else {
    printDocumentHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${docTitleHtml}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700;800&family=Martel:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Mulish', sans-serif; padding: 30px; color: #0f172a; margin: 0; background: #fff; }
    .doc-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
    .doc-title { font-family: 'Martel', serif; font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px 0; color: #0f172a; }
    .doc-subtitle { font-size: 13px; font-weight: 600; color: #1e3a8a; margin: 0; }
    .doc-subtitle .font-martel { font-family: 'Martel', serif; font-weight: 700; color: #0f172a; }
    .biodata-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 12px; }
    .biodata-item span { color: #64748b; font-weight: 600; display: block; font-size: 10px; text-transform: uppercase; }
    .biodata-item strong { color: #0f172a; }
    .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    .report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    .report-table th { background: #0f172a; color: #ffffff; font-weight: 700; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1 class="doc-title">${docTitleHtml}</h1>
    <p class="doc-subtitle">Tim Khidmat <span class="font-martel">jejak imani</span> Saudi Arabia</p>
  </div>

  ${bodyContentHtml}

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
  }

  printHtmlContent(printDocumentHtml);
  mgmtPdfModal.classList.add('hidden');

  // 2. Automate PDF Upload to Google Drive & Log to Sheet 'Riwayat Dokumen'
  const createdBy = appState.activeUser ? appState.activeUser.name : 'Manajemen';
  let pdfFileName = `${docTypeName.replace(/\s+/g, '_')}_${Date.now()}`;
  if (docTypeVal === "2") {
    const noRef = (document.getElementById('doc2NoRef').value || 'IN0001').trim();
    pdfFileName = `Kwitansi - ${noRef}`;
  }
  
  const formData = new URLSearchParams();
  formData.append('action', 'savePdfToDrive');
  formData.append('docType', docTypeName || docTitleHtml);
  formData.append('fileName', pdfFileName);
  formData.append('htmlContent', printDocumentHtml);
  formData.append('createdBy', createdBy);
  formData.append('keterangan', `PDF ${docTypeName} berhasil dibuat & tersimpan di Drive`);

  showAutoToast("Tersimpan ke Drive & Sheet!", `Dokumen tercatat di Sheet Riwayat Dokumen`);

  fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).catch(err => console.error('Auto save PDF Drive notice:', err));
}

// Transfer Modal Handling with Searchbar Autocomplete & Unregistered Account Warning
function setupTransferModal() {
  const receiverInput = document.getElementById('transferReceiverInput');
  const receiverSugg = document.getElementById('transferReceiverSuggestions');

  const getAvailableAccounts = () => {
    const activeName = appState.activeUser ? normString(appState.activeUser.name) : '';
    return appState.accounts.filter(acc => normString(acc.name) !== activeName);
  };

  const renderReceiverSuggestions = (accList) => {
    if (!receiverSugg) return;

    if (!accList || accList.length === 0) {
      receiverSugg.innerHTML = `
        <div class="suggestion-item" style="color: #ef4444; font-weight: 600; cursor: default;">
          <i class="fa-solid fa-circle-xmark"></i> Akun tidak terdaftar
        </div>
      `;
      receiverSugg.classList.remove('hidden');
      return;
    }

    receiverSugg.innerHTML = '';
    accList.forEach(acc => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `
        <i class="fa-solid ${acc.jenisAkun && acc.jenisAkun.toLowerCase() === 'vendor' ? 'fa-store' : (acc.jenisAkun && acc.jenisAkun.toLowerCase() === 'manajemen' ? 'fa-user-shield' : 'fa-user-circle')}"></i> 
        <span>${acc.name} <small style="color:#64748b">(${acc.jenisAkun || 'Tim'})</small></span>
      `;
      div.addEventListener('click', () => {
        if (receiverInput) receiverInput.value = acc.name;
        receiverSugg.classList.add('hidden');
      });
      receiverSugg.appendChild(div);
    });
    receiverSugg.classList.remove('hidden');
  };

  if (receiverInput && receiverSugg) {
    receiverInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const avail = getAvailableAccounts();

      if (!query) {
        renderReceiverSuggestions(avail);
        return;
      }

      const filtered = avail.filter(acc => acc.name.toLowerCase().includes(query));
      renderReceiverSuggestions(filtered);
    });

    receiverInput.addEventListener('focus', () => {
      const avail = getAvailableAccounts();
      renderReceiverSuggestions(avail);
    });

    document.addEventListener('click', (e) => {
      if (!receiverInput.contains(e.target) && !receiverSugg.contains(e.target)) {
        receiverSugg.classList.add('hidden');
      }
    });
  }

  const openTransferHandler = (e) => {
    if (e) e.stopPropagation();
    closeFabMenu();
    if (!appState.activeUser) return;

    transferTujuanInput.value = '';
    transferAmountInput.value = '';
    transferNoteInput.value = '';
    if (receiverInput) receiverInput.value = '';
    if (receiverSugg) receiverSugg.classList.add('hidden');
    transferCurrentBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

    transferModal.classList.remove('hidden');
  };

  if (btnOpenTransferModal) btnOpenTransferModal.addEventListener('click', openTransferHandler);

  if (btnCloseTransferModal) {
    btnCloseTransferModal.addEventListener('click', () => {
      transferModal.classList.add('hidden');
    });
  }

  if (transferForm) transferForm.addEventListener('submit', handleTransferSubmit);
}

async function handleTransferSubmit(e) {
  e.preventDefault();

  const receiverInput = document.getElementById('transferReceiverInput');
  const typedName = receiverInput ? receiverInput.value.trim() : '';
  const amount = parseFloat(transferAmountInput.value);
  const purpose = transferTujuanInput.value.trim();
  const note = transferNoteInput.value.trim();

  if (!typedName) {
    alert('Ketik atau pilih akun penerima transfer.');
    return;
  }

  // Validate if typed account exists in registered accounts list
  const matchedAcc = appState.accounts.find(a => normString(a.name) === normString(typedName));
  if (!matchedAcc) {
    alert(`Akun "${typedName}" tidak terdaftar! Silakan pilih dari daftar akun yang valid.`);
    return;
  }

  if (normString(matchedAcc.name) === normString(appState.activeUser.name)) {
    alert('Anda tidak dapat melakukan transfer ke akun Anda sendiri.');
    return;
  }

  const receiverName = matchedAcc.name;

  if (isNaN(amount) || amount <= 0) {
    alert('Masukkan nominal transfer yang valid.');
    return;
  }

  if (appState.activeUser.saldo < amount) {
    alert(`Saldo kas Anda (${formatSAR(appState.activeUser.saldo)}) tidak mencukupi untuk transfer sebesar ${formatSAR(amount)}.`);
    return;
  }

  btnSubmitTransfer.disabled = true;
  btnSubmitTransfer.textContent = 'Memproses Transfer...';

  const payload = {
    action: 'transferBalance',
    senderAccount: appState.activeUser.name,
    receiverAccount: receiverName,
    amount: amount,
    tujuan: purpose,
    catatan: note
  };

  try {
    appState.activeUser.saldo -= amount;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);
    localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));

    const receiverAcc = appState.accounts.find(a => normString(a.name) === normString(receiverName));
    if (receiverAcc) receiverAcc.saldo += amount;

    transferModal.classList.add('hidden');
    showAutoToast("Transfer Berhasil!", `Nominal ${formatSAR(amount)} telah dikirim ke ${receiverName}`);

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setTimeout(fetchDataFromSpreadsheet, 4000);

  } catch (err) {
    console.error('Transfer error:', err);
    alert('Terjadi kesalahan saat memproses transfer: ' + err.message);
  } finally {
    btnSubmitTransfer.disabled = false;
    btnSubmitTransfer.textContent = 'Kirim Transfer Sekarang';
  }
}

// RIWAYAT TRANSAKSI KAS WITH STATUS BADGES & REVERSE CHRONOLOGICAL SORTING
function setupTxHistorySection() {
  if (btnOpenTxHistoryModal) {
    btnOpenTxHistoryModal.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      closeFabMenu();
      if (!appState.activeUser) return;

      expenseFormSection.classList.add('hidden');
      ordersSection.classList.add('hidden');
      managementSection.classList.add('hidden');
      txHistorySection.classList.remove('hidden');

      txSearchInput.value = '';
      txDateFilter.value = '';
      appState.txSearchQuery = '';
      appState.txDateFilterVal = '';
      appState.txTypeFilterVal = 'Semua';

      const typeTabs = document.querySelectorAll('#txHistorySection .tx-type-tabs .tx-tab-btn');
      typeTabs.forEach(t => t.classList.remove('active'));
      if (typeTabs[0]) typeTabs[0].classList.add('active');

      renderGroupedTxHistory();
    });
  }

  if (btnBackFromHistory) {
    btnBackFromHistory.addEventListener('click', () => {
      txHistorySection.classList.add('hidden');
      applyUserSessionUI();
    });
  }

  if (txSearchInput) {
    txSearchInput.addEventListener('input', (e) => {
      appState.txSearchQuery = e.target.value.toLowerCase().trim();
      renderGroupedTxHistory();
    });
  }

  if (txDateFilter) {
    txDateFilter.addEventListener('change', (e) => {
      appState.txDateFilterVal = e.target.value;
      renderGroupedTxHistory();
    });
  }

  if (btnClearTxDateFilter) {
    btnClearTxDateFilter.addEventListener('click', () => {
      txDateFilter.value = '';
      appState.txDateFilterVal = '';
      renderGroupedTxHistory();
    });
  }

  const typeTabs = document.querySelectorAll('#txHistorySection .tx-type-tabs .tx-tab-btn');
  typeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      appState.txTypeFilterVal = tab.dataset.txtype;
      renderGroupedTxHistory();
    });
  });
}

function renderGroupedTxHistory() {
  txHistoryContainer.innerHTML = '';

  const activeNorm = appState.activeUser ? normString(appState.activeUser.name) : '';
  const isMgmt = appState.activeUser && (appState.activeUser.jenisAkun || '').toLowerCase() === 'manajemen';

  let myTxs = appState.transactions.filter(t => {
    if (isMgmt) {
      if (appState.txSearchQuery) {
        const q = appState.txSearchQuery;
        const matchText = `${t.kegiatan} ${t.kategori} ${t.rincian} ${t.akun}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      if (appState.txDateFilterVal) {
        const txIsoDate = normalizeDateToISO(t.waktu);
        if (txIsoDate !== appState.txDateFilterVal) return false;
      }
      return true;
    }

    const isSender = normString(t.akun) === activeNorm;
    const isReceiver = (t.kegiatan && normString(t.kegiatan).includes('transfer ke ' + activeNorm)) || 
                       (t.rincian && normString(t.rincian).includes(activeNorm)) ||
                       (t.namaGrup && normString(t.namaGrup) === activeNorm);

    const accMatch = isSender || isReceiver;
    if (!accMatch) return false;

    if (appState.txSearchQuery) {
      const q = appState.txSearchQuery;
      const matchText = `${t.kegiatan} ${t.kategori} ${t.rincian} ${t.akun}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (appState.txDateFilterVal) {
      const txIsoDate = normalizeDateToISO(t.waktu);
      if (txIsoDate !== appState.txDateFilterVal) return false;
    }

    return true;
  });

  const categorizedTxs = myTxs.map(t => {
    let txTypeLabel = 'Uang Keluar';
    let txBadgeClass = 'badge-tx-out';
    let isIncome = false;
    let categoryGroup = 'Uang Keluar';

    if (t.kategori === 'Isi Saldo' || t.kategori === 'Kas Masuk') {
      txTypeLabel = 'Uang Masuk';
      txBadgeClass = 'badge-tx-in';
      isIncome = true;
      categoryGroup = 'Uang Masuk';
    } else if (t.kategori === 'Transfer') {
      if (normString(t.akun) === activeNorm) {
        txTypeLabel = 'Transfer Out';
        txBadgeClass = 'badge-tx-trf';
        isIncome = false;
        categoryGroup = 'Transfer';
      } else {
        txTypeLabel = 'Uang Masuk (Transfer)';
        txBadgeClass = 'badge-tx-in';
        isIncome = true;
        categoryGroup = 'Uang Masuk';
      }
    }

    let approvalBadgeClass = 'badge-status-pending';
    let statusDisplay = t.status || 'Menunggu Persetujuan';
    if (statusDisplay === 'Disetujui') approvalBadgeClass = 'badge-status-approved';
    if (statusDisplay === 'Ditolak') approvalBadgeClass = 'badge-status-rejected';

    return {
      ...t,
      txTypeLabel,
      txBadgeClass,
      isIncome,
      categoryGroup,
      approvalBadgeClass,
      statusDisplay
    };
  });

  let filteredTxs = categorizedTxs;
  if (appState.txTypeFilterVal !== 'Semua') {
    filteredTxs = categorizedTxs.filter(t => t.categoryGroup === appState.txTypeFilterVal);
  }

  if (filteredTxs.length === 0) {
    txHistoryContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #64748b; font-size: 13px;">
        <i class="fa-solid fa-receipt" style="font-size: 32px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
        Tidak ada data riwayat transaksi kas untuk filter ini.
      </div>
    `;
    return;
  }

  filteredTxs.reverse();

  const groupsByDate = {};
  filteredTxs.forEach(t => {
    const isoDate = normalizeDateToISO(t.waktu);
    if (!groupsByDate[isoDate]) {
      groupsByDate[isoDate] = {
        displayDate: formatSaudiDateOnly(t.waktu),
        items: []
      };
    }
    groupsByDate[isoDate].items.push(t);
  });

  const sortedDateKeys = Object.keys(groupsByDate).sort().reverse();

  sortedDateKeys.forEach(dateKey => {
    const group = groupsByDate[dateKey];
    const groupDiv = document.createElement('div');
    groupDiv.className = 'tx-date-group';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'tx-date-group-header';
    groupHeader.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${group.displayDate}`;
    groupDiv.appendChild(groupHeader);

    const itemsWrapper = document.createElement('div');
    itemsWrapper.className = 'tx-group-items';

    const showAccountName = appState.activeUser && (appState.activeUser.jenisAkun || '').toLowerCase() === 'manajemen';

    group.items.forEach(t => {
      const amountSign = t.isIncome ? '+' : '-';
      const amountClass = t.isIncome ? 'income' : 'expense';
      const accountSubHtml = showAccountName ? ` <small style="color:#64748b">(${t.akun})</small>` : '';

      const card = document.createElement('div');
      card.className = 'tx-card';

      card.innerHTML = `
        <div class="tx-card-left">
          <div class="tx-badge-row">
            <span class="badge-tx-type ${t.txBadgeClass}">${t.txTypeLabel}</span>
            <span class="badge-tx-type ${t.approvalBadgeClass}">${t.statusDisplay}</span>
            <span class="tx-meta">${t.waktu}</span>
          </div>
          <div class="tx-title">${t.kegiatan || t.kategori}${accountSubHtml}</div>
          ${t.rincian ? `<div class="tx-keterangan">${t.rincian}</div>` : ''}
        </div>
        <div class="tx-amount ${amountClass}">${amountSign} ${formatSAR(t.total)}</div>
      `;

      itemsWrapper.appendChild(card);
    });

    groupDiv.appendChild(itemsWrapper);
    txHistoryContainer.appendChild(groupDiv);
  });
}

// PDF Export Modal Setup
function setupPdfModal() {
  if (btnOpenPdfModal) {
    btnOpenPdfModal.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      closeFabMenu();
      if (!appState.activeUser) return;

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      pdfStartDate.value = firstDay;
      pdfEndDate.value = today;
      pdfModal.classList.remove('hidden');
    });
  }

  if (btnClosePdfModal) {
    btnClosePdfModal.addEventListener('click', () => {
      pdfModal.classList.add('hidden');
    });
  }

  if (pdfForm) {
    pdfForm.addEventListener('submit', (e) => {
      e.preventDefault();
      generatePdfDocument();
    });
  }
}

// Generate Printable PDF Document Function (With Martel Font for "jejak imani")
function generatePdfDocument() {
  const docType = pdfDocType.value;
  const startDate = pdfStartDate.value;
  const endDate = pdfEndDate.value;
  const vendorName = appState.activeUser ? appState.activeUser.name : 'Vendor';
  const currentSaldo = appState.activeUser ? formatSAR(appState.activeUser.saldo) : 'SAR 0.00';
  const generatedDate = new Date().toLocaleString('id-ID');

  const filteredOrders = appState.orders.filter(o => {
    if (normString(o.akun) !== normString(vendorName)) return false;
    const orderIsoDate = normalizeDateToISO(o.tanggal);
    if (!orderIsoDate) return true;
    return orderIsoDate >= startDate && orderIsoDate <= endDate;
  });

  let tableContentHtml = '';

  if (docType === 'Rekapitulasi Pemesanan') {
    let grandTotalOrders = 0;
    const rowsHtml = filteredOrders.map((o, idx) => {
      grandTotalOrders += o.jumlah || 0;
      const cleanTime = formatSaudiDateTime(o.tanggal, o.jam);
      const productsFormatted = parseMultiItemsText(o.itemProduk, o.qty, o.satuan, o.harga);

      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${o.id}</strong><br><small>${cleanTime}</small></td>
          <td>${o.grup}</td>
          <td><strong>${o.tujuan}</strong><br><small>Muthowwif: ${o.muthowwif}</small></td>
          <td>${o.lokasi}</td>
          <td>${productsFormatted}</td>
          <td style="text-align:right;"><strong>${formatSAR(o.jumlah)}</strong></td>
          <td style="text-align:center;"><span class="badge badge-${o.status.toLowerCase().replace(/\s+/g, '-')}">${o.status}</span></td>
        </tr>
      `;
    }).join('');

    tableContentHtml = `
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>ID / Waktu</th>
            <th>Grup</th>
            <th>Tujuan Kegiatan</th>
            <th>Lokasi</th>
            <th>Item Produk & Qty</th>
            <th style="text-align:right;">Jumlah (SAR)</th>
            <th style="text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="8" style="text-align:center; padding: 20px;">Tidak ada data pemesanan pada periode ini</td></tr>'}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="text-align:right; font-weight: bold;">TOTAL KESELURUHAN PEMESANAN:</td>
            <td style="text-align:right; font-weight: bold; font-size: 14px; color:#d97706;">${formatSAR(grandTotalOrders)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  } else {
    let totalUangKeluar = 0;
    const completedOrders = filteredOrders.filter(o => o.status === 'Selesai');
    
    const rowsHtml = completedOrders.map((o, idx) => {
      totalUangKeluar += o.jumlah || 0;
      const cleanTime = formatSaudiDateTime(o.tanggal, o.jam);
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>${cleanTime}</td>
          <td><strong>${o.id}</strong> - ${o.tujuan} (${o.grup})</td>
          <td>Vendor / Selesai</td>
          <td style="text-align:right;">-</td>
          <td style="text-align:right; color:#dc2626;"><strong>${formatSAR(o.jumlah)}</strong></td>
        </tr>
      `;
    }).join('');

    tableContentHtml = `
      <div class="financial-summary-box">
        <div class="summary-card">
          <span>Total Pengeluaran (Selesai):</span>
          <strong>${formatSAR(totalUangKeluar)}</strong>
        </div>
        <div class="summary-card">
          <span>Sisa Saldo Kas Aktif:</span>
          <strong>${currentSaldo}</strong>
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Tanggal & Waktu</th>
            <th>Keterangan Transaksi</th>
            <th>Kategori</th>
            <th style="text-align:right;">Kas Masuk (SAR)</th>
            <th style="text-align:right;">Kas Keluar (SAR)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="6" style="text-align:center; padding: 20px;">Tidak ada transaksi keuangan selesai pada periode ini</td></tr>'}
        </tbody>
      </table>
    `;
  }

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docType} - ${vendorName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700;800&family=Martel:wght@700;800&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Mulish', sans-serif; padding: 30px; color: #0f172a; margin: 0; background: #fff; }
        .doc-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
        .doc-title { font-family: 'Martel', serif; font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px 0; color: #0f172a; }
        .doc-subtitle { font-size: 14px; font-weight: 600; color: #1e3a8a; margin: 0; }
        .doc-subtitle .font-martel { font-family: 'Martel', serif; font-weight: 700; color: #0f172a; }
        .biodata-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 13px; }
        .biodata-item span { color: #64748b; font-weight: 600; display: block; font-size: 11px; text-transform: uppercase; }
        .biodata-item strong { color: #0f172a; }
        .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        .report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        .report-table th { background: #0f172a; color: #ffffff; font-weight: 700; }
        .badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; }
        .badge-pesanan-baru { background: #fef3c7; color: #b45309; }
        .badge-proses { background: #dbeafe; color: #1d4ed8; }
        .badge-selesai { background: #d1fae5; color: #047857; }
        .financial-summary-box { display: flex; gap: 15px; margin-bottom: 15px; }
        .summary-card { flex: 1; background: #f1f5f9; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; }
        .summary-card span { font-size: 11px; color: #64748b; font-weight: 600; display: block; }
        .summary-card strong { font-family: 'Martel', serif; font-size: 16px; color: #0f172a; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="doc-header">
        <h1 class="doc-title">${docType.toUpperCase()}</h1>
        <p class="doc-subtitle">Tim Khidmat <span class="font-martel">jejak imani</span> Saudi Arabia</p>
      </div>

      <div class="biodata-grid">
        <div class="biodata-item">
          <span>Nama Vendor / Akun:</span>
          <strong>${vendorName}</strong>
        </div>
        <div class="biodata-item">
          <span>Periode Dokumen:</span>
          <strong>${startDate} s/d ${endDate}</strong>
        </div>
        <div class="biodata-item">
          <span>Mata Uang:</span>
          <strong>SAR (Saudi Riyal)</strong>
        </div>
        <div class="biodata-item">
          <span>Tanggal Cetak:</span>
          <strong>${generatedDate}</strong>
        </div>
      </div>

      ${tableContentHtml}

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printHtmlContent(printDocumentHtml);
  pdfModal.classList.add('hidden');

  // Automate PDF Upload to Google Drive & Log to Sheet 'Riwayat Dokumen' for Vendor PDF
  const vendorFileName = `${docType.replace(/\s+/g, '_')}_${vendorName.replace(/\s+/g, '_')}_${Date.now()}`;
  const vendorFormData = new URLSearchParams();
  vendorFormData.append('action', 'savePdfToDrive');
  vendorFormData.append('docType', docType);
  vendorFormData.append('fileName', vendorFileName);
  vendorFormData.append('htmlContent', printDocumentHtml);
  vendorFormData.append('createdBy', vendorName);
  vendorFormData.append('keterangan', `PDF Laporan Vendor ${docType} tersimpan otomatis ke Google Drive`);

  showAutoToast("Tersimpan ke Drive & Sheet!", `Laporan ${docType} tercatat di Sheet Riwayat Dokumen`);

  fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: vendorFormData
  }).catch(err => console.error('Auto save Vendor PDF Drive notice:', err));
}

// Vendor Estimates Calculation (Estimasi Kebutuhan Vendor)
function calculateVendorEstimates() {
  const estimatesBox = document.getElementById('estimatesBox');
  const estimatesAmountDisplay = document.getElementById('estimatesAmountDisplay');
  if (!estimatesAmountDisplay) return;

  if (!appState.activeUser || (appState.activeUser.jenisAkun || '').toLowerCase() !== 'vendor') {
    if (estimatesBox) estimatesBox.classList.add('hidden');
    return;
  }

  const vendorName = normString(appState.activeUser.name);
  const pendingOrders = appState.orders.filter(o => normString(o.akun) === vendorName && o.status !== 'Selesai');
  const totalEstimate = pendingOrders.reduce((sum, o) => sum + (o.jumlah || 0), 0);

  estimatesAmountDisplay.textContent = formatSAR(totalEstimate);
  if (estimatesBox) estimatesBox.classList.remove('hidden');
}

// Vendor Pemesanan System - Strictly Scoped Status Tabs
function setupStatusFilterTabs() {
  const tabs = document.querySelectorAll('#ordersSection .status-filter-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      appState.selectedStatusFilter = tab.dataset.status || 'Pesanan Baru';
      renderOrdersList();
    });
  });
}

function renderOrdersList() {
  if (!appState.activeUser) return;

  ordersContainer.innerHTML = '';
  
  const userNorm = normString(appState.activeUser.name);
  let vendorOrders = appState.orders.filter(o => normString(o.akun) === userNorm);

  if (appState.selectedStatusFilter) {
    vendorOrders = vendorOrders.filter(o => o.status === appState.selectedStatusFilter);
  }

  if (appState.selectedDateFilter) {
    vendorOrders = vendorOrders.filter(o => {
      const orderIsoDate = normalizeDateToISO(o.tanggal);
      return orderIsoDate === appState.selectedDateFilter;
    });
  }

  const todayMs = new Date().setHours(0, 0, 0, 0);

  if (appState.selectedStatusFilter === 'Selesai') {
    vendorOrders.sort((a, b) => {
      const dateAStr = normalizeDateToISO(a.tanggal);
      const dateBStr = normalizeDateToISO(b.tanggal);
      const dateAMs = dateAStr ? new Date(dateAStr).getTime() : 0;
      const dateBMs = dateBStr ? new Date(dateBStr).getTime() : 0;

      if (dateBMs !== dateAMs) {
        return dateBMs - dateAMs;
      }
      return b.id.localeCompare(a.id);
    });
  } else {
    vendorOrders.sort((a, b) => {
      const dateAStr = normalizeDateToISO(a.tanggal);
      const dateBStr = normalizeDateToISO(b.tanggal);

      const dateAMs = dateAStr ? new Date(dateAStr).getTime() : todayMs;
      const dateBMs = dateBStr ? new Date(dateBStr).getTime() : todayMs;

      const diffA = Math.abs(dateAMs - todayMs);
      const diffB = Math.abs(dateBMs - todayMs);

      if (diffA !== diffB) {
        return diffA - diffB;
      }
      return a.id.localeCompare(b.id);
    });
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
      actionBtnHtml = `<button type="button" class="btn-navy btn-order-action btn-confirm-order" onclick="handleUpdateOrderStatus('${order.id}', 'Proses')">Konfirmasi Pemesanan</button>`;
    } else if (order.status === 'Proses') {
      actionBtnHtml = `<button type="button" class="btn-navy btn-order-action btn-complete-order" onclick="handleUpdateOrderStatus('${order.id}', 'Selesai')">Selesaikan Pemesanan</button>`;
    } else {
      actionBtnHtml = `
        <span style="font-size: 12px; font-weight: 700; color: #047857;"><i class="fa-solid fa-circle-check"></i> Selesai</span>
        <button type="button" class="btn-icon-only btn-share-completed" title="Bagikan Ringkasan Transaksi" onclick="handleShareCompletedOrder('${order.id}')">
          <i class="fa-solid fa-share-nodes"></i>
        </button>
      `;
    }

    const saudiFormattedTime = formatSaudiDateTime(order.tanggal, order.jam);
    const multiItemsHtml = renderMultiItemsCard(order.itemProduk, order.qty, order.satuan, order.harga);

    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <h3 class="order-title">${order.tujuan}</h3>
          <div class="order-time-sub">
            <i class="fa-solid fa-clock"></i> ${saudiFormattedTime}
          </div>
        </div>
        <span class="order-status-badge ${statusClass}">${order.status}</span>
      </div>

      <div class="order-details-grid">
        <div class="order-detail-item">
          <span class="order-detail-label">Grup</span>
          <span class="order-detail-value">${order.grup || '-'}</span>
        </div>
        <div class="order-detail-item">
          <span class="order-detail-label">Muthowwif</span>
          <span class="order-detail-value">${order.muthowwif || '-'}</span>
        </div>
        <div class="order-detail-item">
          <span class="order-detail-label">Lokasi</span>
          <span class="order-detail-value">${order.lokasi || '-'}</span>
        </div>
        
        <div class="order-product-box">
          ${multiItemsHtml}
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

function splitMultiLineCell(val) {
  if (val === null || val === undefined) return [];
  return val.toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map(s => s.trim()).filter(s => s !== '');
}

function renderMultiItemsCard(itemStr, qtyStr, unitStr, priceStr) {
  if (!itemStr) return '<div class="order-product-name">-</div>';

  const items = splitMultiLineCell(itemStr);
  const qtys = splitMultiLineCell(qtyStr);
  const units = splitMultiLineCell(unitStr);
  const prices = splitMultiLineCell(priceStr);

  if (items.length <= 1) {
    const rawPrice = prices[0] || priceStr || '0';
    const numPrice = parseFloat(rawPrice.toString().replace(/[^0-9.-]+/g, '')) || 0;
    return `
      <div>
        <div class="order-product-name">${itemStr}</div>
        <div style="font-size: 11px; color: #64748b;">Rincian: ${qtyStr || 1} ${unitStr || 'Porsi'} @ ${formatSAR(numPrice)}</div>
      </div>
    `;
  }

  const rows = items.map((it, idx) => {
    const q = qtys[idx] || qtys[0] || '1';
    const u = units[idx] || units[0] || 'Porsi';
    const rawPrice = prices[idx] || prices[0] || '0';
    const numPrice = parseFloat(rawPrice.toString().replace(/[^0-9.-]+/g, '')) || 0;

    return `<div class="multi-item-row">• <strong>${it}</strong> <small style="color:#64748b">(${q} ${u} @ ${formatSAR(numPrice)})</small></div>`;
  }).join('');

  return `<div class="multi-items-list">${rows}</div>`;
}

function parseMultiItemsText(itemStr, qtyStr, unitStr, priceStr) {
  if (!itemStr) return '-';
  const items = splitMultiLineCell(itemStr);
  const qtys = splitMultiLineCell(qtyStr);
  const units = splitMultiLineCell(unitStr);
  const prices = splitMultiLineCell(priceStr);

  return items.map((it, idx) => {
    const q = qtys[idx] || qtys[0] || '1';
    const u = units[idx] || units[0] || 'Porsi';
    const rawPrice = prices[idx] || prices[0] || '0';
    const numPrice = parseFloat(rawPrice.toString().replace(/[^0-9.-]+/g, '')) || 0;

    return `• ${it} (${q} ${u} @ ${formatSAR(numPrice)})`;
  }).join('<br>');
}

function normalizeDateToISO(rawDateStr) {
  if (!rawDateStr) return '';
  let str = rawDateStr.toString().trim();
  if (!str) return '';

  const indoMonths = {
    'januari': '01', 'jan': '01',
    'februari': '02', 'feb': '02',
    'maret': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05',
    'juni': '06', 'jun': '06',
    'juli': '07', 'jul': '07',
    'agustus': '08', 'agu': '08', 'aug': '08', 'august': '08',
    'september': '09', 'sep': '09',
    'oktober': '10', 'okt': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12', 'dec': '12'
  };

  const matchIndoStr = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (matchIndoStr) {
    const day = matchIndoStr[1].padStart(2, '0');
    const monthKey = matchIndoStr[2].toLowerCase();
    const year = matchIndoStr[3];
    if (indoMonths[monthKey]) {
      return `${year}-${indoMonths[monthKey]}-${day}`;
    }
  }

  const matchSlashDate = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (matchSlashDate) {
    const day = matchSlashDate[1].padStart(2, '0');
    const month = matchSlashDate[2].padStart(2, '0');
    const year = matchSlashDate[3];
    return `${year}-${month}-${day}`;
  }

  const matchIsoDate = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (matchIsoDate) {
    const year = matchIsoDate[1];
    const month = matchIsoDate[2].padStart(2, '0');
    const day = matchIsoDate[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (str.includes('GMT') || str.includes('1899')) {
    const match = str.match(/([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d{1,2}\s+\d{4})/);
    if (match) {
      const d = new Date(match[0]);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return str;
}

function formatSaudiDateOnly(rawDateStr) {
  const isoStr = normalizeDateToISO(rawDateStr);
  if (isoStr && isoStr.includes('-')) {
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthNamesIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const mName = monthNamesIndo[monthIdx] || 'Agustus';
      return `${String(day).padStart(2, '0')} ${mName} ${year}`;
    }
  }
  return rawDateStr || '-';
}

function formatSaudiDateTime(dateStr, timeStr) {
  if (!dateStr) return '-';

  try {
    const isoDateStr = normalizeDateToISO(dateStr);
    
    let cleanTime = '07:00';
    if (timeStr && !timeStr.includes('1899') && !timeStr.includes('GMT')) {
      const tMatch = timeStr.toString().match(/(\d{1,2}:\d{2})/);
      if (tMatch) cleanTime = tMatch[0].padStart(5, '0');
    }

    if (isoDateStr.includes('-')) {
      const parts = isoDateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const monthNamesIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const mName = monthNamesIndo[monthIdx] || 'Agustus';
        const dayPadded = String(day).padStart(2, '0');

        return `${dayPadded} ${mName} ${year} | ${cleanTime}`;
      }
    }

  } catch (e) {
    console.log('Date parse notice:', e);
  }
  return `${dateStr} | ${timeStr || '07:00'}`;
}

window.handleShareCompletedOrder = function(orderId) {
  const order = appState.orders.find(o => normId(o.id) === normId(orderId));
  if (!order) return;

  const saudiTime = formatSaudiDateTime(order.tanggal, order.jam);

  const shareText = `🧾 *PEMESANAN VENDOR SELESAI*\n\n` +
    `📌 *Tujuan Kegiatan:* ${order.tujuan}\n` +
    `🕒 *Waktu:* ${saudiTime}\n` +
    `👤 *Vendor:* ${order.akun}\n` +
    `✈️ *Grup:* ${order.grup}\n` +
    `👳 *Muthowwif:* ${order.muthowwif}\n` +
    `📍 *Lokasi:* ${order.lokasi}\n` +
    `📦 *Item:* ${order.itemProduk} (${order.qty} ${order.satuan} @ ${formatSAR(order.harga)})\n` +
    `💰 *TOTAL JUMLAH:* ${formatSAR(order.jumlah)}\n` +
    `✅ *Status:* SELESAI\n\n` +
    `_Dicatat via Keuangan Tim Khidmat_`;

  if (navigator.share) {
    navigator.share({ title: 'Ringkasan Pemesanan Selesai', text: shareText }).catch(err => console.log('Share notice:', err));
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Ringkasan pemesanan selesai berhasil disalin ke clipboard!');
    }).catch(err => alert('Ringkasan Pemesanan:\n\n' + shareText));
  }
};

window.handleUpdateOrderStatus = async function(orderId, newStatus) {
  const confirmMsg = newStatus === 'Selesai' 
    ? "Mengonfirmasi pesanan ini akan otomatis memotong saldo akun Anda. Lanjutkan?"
    : "Konfirmasi pemesanan ini untuk mengubah status menjadi 'Proses'?";

  if (!confirm(confirmMsg)) return;

  try {
    const payload = {
      action: 'updateOrderStatus',
      orderId: orderId,
      newStatus: newStatus
    };

    const targetNormId = normId(orderId);
    const orderIndex = appState.orders.findIndex(o => normId(o.id) === targetNormId);

    if (orderIndex !== -1) {
      appState.orders[orderIndex].status = newStatus;
      appState.orders[orderIndex]._localOptimistic = true;
      
      if (newStatus === 'Selesai') {
        const orderAmount = appState.orders[orderIndex].jumlah || 0;
        appState.activeUser.saldo -= orderAmount;
        activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);
        localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));
      }
    }

    calculateVendorEstimates();
    renderOrdersList();
    
    showAutoToast("Status Diperbarui!", `Status pemesanan diubah menjadi ${newStatus}`);

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setTimeout(fetchDataFromSpreadsheet, 4000);

  } catch (err) {
    console.error('Update status error:', err);
    alert('Terjadi kesalahan saat memperbarui status: ' + err.message);
  }
};

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
    appState.activeUser.saldo += amount;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);
    localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));

    topupModal.classList.add('hidden');
    showAutoToast("Isi Saldo Berhasil!", `Kas ${appState.activeUser.name} bertambah ${formatSAR(amount)}`);

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setTimeout(fetchDataFromSpreadsheet, 4000);

  } catch (err) {
    console.error('Topup error:', err);
    alert('Terjadi kesalahan saat menambah saldo: ' + err.message);
  } finally {
    btnSubmitTopup.disabled = false;
    btnSubmitTopup.textContent = 'Tambahkan Saldo Sekarang';
  }
}

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
          <input type="number" min="0" step="any" placeholder="0.00" class="item-harga has-no-icon" value="" oninput="updateItemData(${itemIndex}, 'hargaSatuan', this.value)" required>
        </div>
      </div>

      <div class="input-group">
        <label>QTY</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="1" placeholder="1" class="item-qty has-no-icon" value="1" oninput="updateItemData(${itemIndex}, 'qty', this.value)" required>
        </div>
      </div>

      <div class="input-group full-width">
        <label>Jumlah Subtotal (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="text" class="item-jumlah amount-disabled has-no-icon" value="SAR 0.00" disabled readonly>
        </div>
      </div>
    </div>
  `;

  itemsContainer.appendChild(card);
  setupItemCategoryAutocomplete(card, itemIndex, appState.items);
  updateItemCountBadge();
  calculateGrandTotal();
}

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
          <input type="number" min="0" step="any" placeholder="0.00" class="item-harga has-no-icon" value="" oninput="updateModalItemData(${idx}, 'hargaSatuan', this.value)" required>
        </div>
      </div>

      <div class="input-group">
        <label>QTY</label>
        <div class="input-wrapper input-sm">
          <input type="number" min="1" placeholder="1" class="item-qty has-no-icon" value="1" oninput="updateModalItemData(${idx}, 'qty', this.value)" required>
        </div>
      </div>

      <div class="input-group full-width">
        <label>Jumlah Subtotal (SAR)</label>
        <div class="input-wrapper input-sm">
          <input type="text" class="item-jumlah amount-disabled has-no-icon" value="SAR 0.00" disabled readonly>
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
            <input type="number" min="0" step="any" placeholder="0.00" class="item-harga has-no-icon" value="${item.hargaSatuan || ''}" oninput="updateItemData(${idx}, 'hargaSatuan', this.value)" required>
          </div>
        </div>

        <div class="input-group">
          <label>QTY</label>
          <div class="input-wrapper input-sm">
            <input type="number" min="1" placeholder="1" class="item-qty has-no-icon" value="${item.qty || 1}" oninput="updateItemData(${idx}, 'qty', this.value)" required>
          </div>
        </div>

        <div class="input-group full-width">
          <label>Jumlah Subtotal (SAR)</label>
          <div class="input-wrapper input-sm">
            <input type="text" class="item-jumlah amount-disabled has-no-icon" value="${formatSAR(item.jumlah)}" disabled readonly>
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
            <input type="number" min="0" step="any" placeholder="0.00" class="item-harga has-no-icon" value="${item.hargaSatuan || ''}" oninput="updateModalItemData(${idx}, 'hargaSatuan', this.value)" required>
          </div>
        </div>

        <div class="input-group">
          <label>QTY</label>
          <div class="input-wrapper input-sm">
            <input type="number" min="1" placeholder="1" class="item-qty has-no-icon" value="${item.qty || 1}" oninput="updateModalItemData(${idx}, 'qty', this.value)" required>
          </div>
        </div>

        <div class="input-group full-width">
          <label>Jumlah Subtotal (SAR)</label>
          <div class="input-wrapper input-sm">
            <input type="text" class="item-jumlah amount-disabled has-no-icon" value="${formatSAR(item.jumlah)}" disabled readonly>
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
    saldoSesudah: appState.activeUser.saldo,
    timestamp: new Date().toISOString()
  };

  try {
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

    successOverlay.classList.remove('hidden');

    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setTimeout(fetchDataFromSpreadsheet, 3000);

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
    `⏳ *Status:* Menunggu Persetujuan Manajemen\n\n` +
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

// Fetch Live Data from Spreadsheet with Optimistic Merge Protection
async function fetchDataFromSpreadsheet() {
  try {
    const res = await fetch(`${GAS_URL}?action=getData`);
    const data = await res.json();

    if (data.orders && data.orders.length > 0) {
      data.orders.forEach(remoteOrder => {
        const localOrder = appState.orders.find(o => normId(o.id) === normId(remoteOrder.id));
        if (localOrder && localOrder._localOptimistic) {
          if (localOrder.status === 'Selesai' || (localOrder.status === 'Proses' && remoteOrder.status === 'Pesanan Baru')) {
            remoteOrder.status = localOrder.status;
            remoteOrder._localOptimistic = true;
          }
        }
      });
      appState.orders = data.orders;
    }

    if (data.accounts && data.accounts.length > 0) appState.accounts = data.accounts;
    if (data.groups && data.groups.length > 0) appState.masterGroups = data.groups;
    if (data.activities && data.activities.length > 0) appState.masterActivities = data.activities;
    if (data.categories && data.categories.length > 0) appState.masterCategories = data.categories;
    if (data.transactions && data.transactions.length > 0) appState.transactions = data.transactions;

    if (appState.activeUser) {
      const activeNorm = normString(appState.activeUser.name);
      const activeIdNorm = normString(appState.activeUser.id);

      const refreshedAcc = appState.accounts.find(a => 
        normString(a.name) === activeNorm ||
        (a.id && normString(a.id) === activeIdNorm)
      );

      if (refreshedAcc && typeof refreshedAcc.saldo === 'number' && !isNaN(refreshedAcc.saldo)) {
        appState.activeUser.saldo = refreshedAcc.saldo;
        activeBalanceDisplay.textContent = formatSAR(refreshedAcc.saldo);
        localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));
      }

      const roleLower = (appState.activeUser.jenisAkun || '').toLowerCase();
      if (roleLower === 'manajemen') {
        renderManagementDashboard();
      } else if (roleLower === 'vendor') {
        calculateVendorEstimates();
        renderOrdersList();
      }
    }
  } catch (e) {
    console.log('Fetch notice:', e);
  }
}

// Helper: Format SAR Currency (Handles Negative Numbers -SAR X,XXX.XX & Accounting Format)
function formatSAR(num) {
  const n = parseFloat(num) || 0;
  if (n < 0) {
    const absVal = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `-SAR ${absVal}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n).replace('SAR', 'SAR ');
}

// Register PWA Service Worker for "Kas JI"
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered for Kas JI:', reg.scope))
      .catch(err => console.error('ServiceWorker registration notice:', err));
  });
}
