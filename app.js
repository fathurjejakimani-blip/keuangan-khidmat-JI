/**
 * Keuangan Tim Khidmat & Vendor Management - Frontend Logic v5.1
 * Sheet 'Transaksi', Role-Based FAB Actions, Robust ISO Date Filtering for Orders & PDF
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
  selectedStatusFilter: 'Semua',
  selectedDateFilter: '',
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

// Floating Action Button (FAB) Elements
const fabContainer = document.getElementById('fabContainer');
const btnToggleFab = document.getElementById('btnToggleFab');
const fabMenu = document.getElementById('fabMenu');

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

// Transaction History Modal Elements
const btnOpenTxHistoryModal = document.getElementById('btnOpenTxHistoryModal');
const txHistoryModal = document.getElementById('txHistoryModal');
const btnCloseTxHistoryModal = document.getElementById('btnCloseTxHistoryModal');
const txHistoryList = document.getElementById('txHistoryList');

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

// PopUp Modal Form Elements (for Vendor Users)
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
document.addEventListener('DOMContentLoaded', async () => {
  setupAccountSearchbar();
  setupEventListeners();
  setupResponsiveKeypad();
  setupFormAutocomplete();
  setupModalAutocomplete();
  setupStatusFilterTabs();
  setupDateFilter();
  setupPdfModal();
  setupTransferModal();
  setupTxHistoryModal();
  setupFabMenu();
  resetItems();
  resetModalItems();

  await fetchDataFromSpreadsheet();
  checkAndRestoreSession();
});

// Check & Restore Active Session across Page Refresh
function checkAndRestoreSession() {
  const savedUser = localStorage.getItem('ACTIVE_KHIDMAT_USER');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      const matchedAcc = appState.accounts.find(a => a.id.toString().trim() === parsedUser.id.toString().trim() || a.name.toLowerCase() === parsedUser.name.toLowerCase());
      
      if (matchedAcc) {
        appState.activeUser = matchedAcc;
      } else {
        appState.activeUser = parsedUser;
      }

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

  const isVendor = userRole.toLowerCase() === 'vendor';

  if (isVendor) {
    // VENDOR ROLE:
    // 1. Show Pemesanan Orders View
    // 2. FAB Menu: Show 'Cetak PDF', Hide 'Transfer' & 'Riwayat Transaksi'
    estimatesBox.classList.remove('hidden');
    ordersSection.classList.remove('hidden');
    expenseFormSection.classList.add('hidden');

    btnOpenPdfModal.classList.remove('hidden');
    btnOpenTransferModal.classList.add('hidden');
    btnOpenTxHistoryModal.classList.add('hidden');

    calculateVendorEstimates();
    renderOrdersList();
  } else {
    // TIM ROLE:
    // 1. Show Form Pengeluaran View
    // 2. FAB Menu: Show 'Transfer' & 'Riwayat Transaksi', Hide 'Cetak PDF'
    estimatesBox.classList.add('hidden');
    ordersSection.classList.add('hidden');
    expenseFormSection.classList.remove('hidden');

    btnOpenPdfModal.classList.add('hidden');
    btnOpenTransferModal.classList.remove('hidden');
    btnOpenTxHistoryModal.classList.remove('hidden');
  }
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

// Ultra Responsive 6-Digit Keypad with Instant Pointer Event Handling
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

// Auto Login Verification & Persist Session
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

// Transfer Modal Handling
function setupTransferModal() {
  const openTransferHandler = (e) => {
    if (e) e.stopPropagation();
    closeFabMenu();
    if (!appState.activeUser) return;

    transferTujuanInput.value = '';
    transferAmountInput.value = '';
    transferNoteInput.value = '';
    transferCurrentBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);

    // Populate Receiver Select Dropdown
    transferReceiverSelect.innerHTML = '<option value="">-- Pilih Akun Penerima --</option>';
    appState.accounts.forEach(acc => {
      if (acc.name.toLowerCase() !== appState.activeUser.name.toLowerCase()) {
        const opt = document.createElement('option');
        opt.value = acc.name;
        opt.textContent = `${acc.name} (${acc.jenisAkun || 'Tim'})`;
        transferReceiverSelect.appendChild(opt);
      }
    });

    transferModal.classList.remove('hidden');
  };

  btnOpenTransferModal.addEventListener('click', openTransferHandler);

  btnCloseTransferModal.addEventListener('click', () => {
    transferModal.classList.add('hidden');
  });

  transferForm.addEventListener('submit', handleTransferSubmit);
}

async function handleTransferSubmit(e) {
  e.preventDefault();

  const receiverName = transferReceiverSelect.value;
  const amount = parseFloat(transferAmountInput.value);
  const purpose = transferTujuanInput.value.trim();
  const note = transferNoteInput.value.trim();

  if (!receiverName) {
    alert('Pilih akun penerima transfer.');
    return;
  }

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
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    appState.activeUser.saldo -= amount;
    activeBalanceDisplay.textContent = formatSAR(appState.activeUser.saldo);
    localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));

    // Update receiver balance locally
    const receiverAcc = appState.accounts.find(a => a.name.toLowerCase() === receiverName.toLowerCase());
    if (receiverAcc) receiverAcc.saldo += amount;

    transferModal.classList.add('hidden');
    alert(`Transfer Berhasil!\n\nNominal ${formatSAR(amount)} telah dikirim ke ${receiverName}. Saldo Anda sekarang: ${formatSAR(appState.activeUser.saldo)}.`);

    fetchDataFromSpreadsheet(); // Refresh live data

  } catch (err) {
    console.error('Transfer error:', err);
    alert('Terjadi kesalahan saat memproses transfer: ' + err.message);
  } finally {
    btnSubmitTransfer.disabled = false;
    btnSubmitTransfer.textContent = 'Kirim Transfer Sekarang';
  }
}

// Transaction History Modal Setup
function setupTxHistoryModal() {
  const openHistoryHandler = (e) => {
    if (e) e.stopPropagation();
    closeFabMenu();
    if (!appState.activeUser) return;
    renderTxHistoryList();
    txHistoryModal.classList.remove('hidden');
  };

  btnOpenTxHistoryModal.addEventListener('click', openHistoryHandler);

  btnCloseTxHistoryModal.addEventListener('click', () => {
    txHistoryModal.classList.add('hidden');
  });
}

function renderTxHistoryList() {
  txHistoryList.innerHTML = '';

  const activeName = appState.activeUser ? appState.activeUser.name.toLowerCase() : '';
  const myTxs = appState.transactions.filter(t => t.akun.toLowerCase() === activeName);

  if (myTxs.length === 0) {
    txHistoryList.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #64748b; font-size: 13px;">
        <i class="fa-solid fa-receipt" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
        Belum ada riwayat transaksi kas untuk akun ini.
      </div>
    `;
    return;
  }

  // Render reverse chronological
  myTxs.reverse().forEach(tx => {
    const isIncome = tx.kategori === 'Isi Saldo' || tx.kategori === 'Kas Masuk';
    const amountSign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';

    const div = document.createElement('div');
    div.className = 'tx-card';
    div.innerHTML = `
      <div class="tx-card-info">
        <div class="tx-title">${tx.kegiatan || tx.kategori}</div>
        <div class="tx-meta">${tx.waktu} • <small style="color:#1e3a8a; font-weight:700;">${tx.kategori}</small></div>
        ${tx.rincian ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">"${tx.rincian}"</div>` : ''}
      </div>
      <div class="tx-amount ${amountClass}">${amountSign} ${formatSAR(tx.total)}</div>
    `;
    txHistoryList.appendChild(div);
  });
}

// PDF Export Modal Setup
function setupPdfModal() {
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

  btnClosePdfModal.addEventListener('click', () => {
    pdfModal.classList.add('hidden');
  });

  pdfForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generatePdfDocument();
  });
}

// Generate Printable PDF Document Function (Connected to ISO Normalizer)
function generatePdfDocument() {
  const docType = pdfDocType.value;
  const startDate = pdfStartDate.value; // YYYY-MM-DD
  const endDate = pdfEndDate.value;     // YYYY-MM-DD
  const vendorName = appState.activeUser ? appState.activeUser.name : 'Vendor';
  const currentSaldo = appState.activeUser ? formatSAR(appState.activeUser.saldo) : 'SAR 0.00';
  const generatedDate = new Date().toLocaleString('id-ID');

  // Filter vendor orders by normalized ISO date range!
  const filteredOrders = appState.orders.filter(o => {
    if (o.akun.toLowerCase() !== vendorName.toLowerCase()) return false;
    const orderIsoDate = normalizeDateToISO(o.tanggal);
    if (!orderIsoDate) return true;
    return orderIsoDate >= startDate && orderIsoDate <= endDate;
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir oleh browser. Izinkan pop-up untuk mencetak PDF.');
    return;
  }

  let tableContentHtml = '';

  if (docType === 'Rekapitulasi Pemesanan') {
    let grandTotalOrders = 0;
    const rowsHtml = filteredOrders.map((o, idx) => {
      grandTotalOrders += o.jumlah || 0;
      const cleanTime = formatSaudiDateTime(o.tanggal, o.jam);
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${o.id}</strong><br><small>${cleanTime}</small></td>
          <td>${o.grup}</td>
          <td><strong>${o.tujuan}</strong><br><small>Muthowwif: ${o.muthowwif}</small></td>
          <td>${o.lokasi}</td>
          <td>${o.itemProduk}<br><small>${o.qty} ${o.satuan} @ ${formatSAR(o.harga)}</small></td>
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
            <td style="text-align:right; font-weight: bold; font-size: 14px;">${formatSAR(grandTotalOrders)}</td>
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
        body { font-family: 'Mulish', sans-serif; padding: 30px; color: #0f172a; margin: 0; }
        .doc-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
        .doc-title { font-family: 'Martel', serif; font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px 0; color: #0f172a; }
        .doc-subtitle { font-size: 13px; font-weight: 600; color: #475569; margin: 0; }
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
        .footer-sign { margin-top: 40px; text-align: right; font-size: 12px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="doc-header">
        <h1 class="doc-title">${docType.toUpperCase()}</h1>
        <p class="doc-subtitle">KEUANGAN KHIDMAT JEJAK IMANI</p>
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

      <div class="footer-sign">
        <p>Makkah / Madinah, ${new Date().toLocaleDateString('id-ID')}</p>
        <br><br><br>
        <p><strong>(${vendorName})</strong></p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printDocumentHtml);
  printWindow.document.close();
  pdfModal.classList.add('hidden');
}

// Date Filter Setup
function setupDateFilter() {
  orderDateFilter.addEventListener('change', (e) => {
    appState.selectedDateFilter = e.target.value; // YYYY-MM-DD
    renderOrdersList();
  });

  btnClearDateFilter.addEventListener('click', () => {
    orderDateFilter.value = '';
    appState.selectedDateFilter = '';
    renderOrdersList();
  });
}

// Event Listeners
function setupEventListeners() {
  btnOpenExpenseModal.addEventListener('click', (e) => {
    if (e) e.stopPropagation();
    closeFabMenu();
    resetModalItems();
    const isVendor = appState.activeUser && appState.activeUser.jenisAkun && appState.activeUser.jenisAkun.toLowerCase() === 'vendor';
    modalKategoriLaporan.value = isVendor ? 'Vendor' : 'Grup Keberangkatan';
    modalKategoriLaporan.dispatchEvent(new Event('change'));
    expenseModal.classList.remove('hidden');
  });

  btnCloseExpenseModal.addEventListener('click', () => {
    expenseModal.classList.add('hidden');
  });

  btnOpenTopup.addEventListener('click', (e) => {
    if (e) e.stopPropagation();
    closeFabMenu();
    if (!appState.activeUser) return;
    topupAccountName.value = appState.activeUser.name;
    topupAmountInput.value = '';
    topupNoteInput.value = '';
    topupModal.classList.remove('hidden');
  });
  btnCloseTopup.addEventListener('click', () => topupModal.classList.add('hidden'));

  topupForm.addEventListener('submit', handleTopupSubmit);

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

  btnAddItem.addEventListener('click', () => addItemRow());
  modalBtnAddItem.addEventListener('click', () => addModalItemRow());

  document.getElementById('btnLogout').addEventListener('click', (e) => {
    if (e) e.stopPropagation();
    logoutAccount();
  });

  expenseForm.addEventListener('submit', handleFormSubmit);
  modalExpenseForm.addEventListener('submit', handleModalFormSubmit);

  btnNewTransaction.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
    resetForm();
  });

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

  // Filter orders by normalized ISO Date!
  if (appState.selectedDateFilter) {
    vendorOrders = vendorOrders.filter(o => {
      const orderIsoDate = normalizeDateToISO(o.tanggal);
      return orderIsoDate === appState.selectedDateFilter;
    });
  }

  if (vendorOrders.length === 0) {
    ordersContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #64748b; font-size: 13px;">
        <i class="fa-solid fa-box-open" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
        Tidak ada pemesanan untuk filter ini
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
      actionBtnHtml = `
        <span style="font-size: 12px; font-weight: 700; color: #047857;"><i class="fa-solid fa-circle-check"></i> Selesai</span>
        <button type="button" class="btn-icon-only btn-share-completed" title="Bagikan Ringkasan Transaksi" onclick="handleShareCompletedOrder('${order.id}')">
          <i class="fa-solid fa-share-nodes"></i>
        </button>
      `;
    }

    const saudiFormattedTime = formatSaudiDateTime(order.tanggal, order.jam);

    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <!-- Judul Kegiatan -->
          <h3 class="order-title">${order.tujuan}</h3>
          <!-- Format Waktu Saudi Langsung di Bawah Judul Kegiatan -->
          <div class="order-time-sub">
            <i class="fa-solid fa-clock"></i> ${saudiFormattedTime}
          </div>
        </div>
        <span class="order-status-badge ${statusClass}">${order.status}</span>
      </div>

      <!-- Stacked 2-Line Format for Details -->
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
        <div class="order-detail-item">
          <span class="order-detail-label">Item Produk</span>
          <span class="order-detail-value">${order.itemProduk || '-'}</span>
        </div>
        
        <div class="order-product-box">
          <div>
            <div style="font-size: 11px; color: #64748b;">Rincian: ${order.qty} ${order.satuan} @ ${formatSAR(order.harga)}</div>
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

// Robust ISO Date Normalizer for Standardized YYYY-MM-DD Comparison
function normalizeDateToISO(rawDateStr) {
  if (!rawDateStr) return '';
  let str = rawDateStr.toString().trim();
  if (!str) return '';

  // If raw GAS Date object string (e.g. "Tue Aug 04 2026 00:00:00 GMT+0300... Sat Dec 30 1899...")
  if (str.includes('GMT') || str.includes('1899')) {
    const match = str.match(/([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d{1,2}\s+\d{4})/);
    if (match) {
      const d = new Date(match[0]);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }

  // YYYY-MM-DD or YYYY/MM/DD
  if (str.match(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/)) {
    const parts = str.split('T')[0].split(/[-/]/);
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  if (str.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/)) {
    const parts = str.split(/[-/]/);
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return str;
}

// Robust Helper to Parse Raw GAS Date Strings to Clean "04 Agustus 2026 | 07:00"
function formatSaudiDateTime(dateStr, timeStr) {
  if (!dateStr) return '-';

  try {
    const isoDateStr = normalizeDateToISO(dateStr);
    
    // Clean timeStr if it contains 1899 or GMT
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
  const order = appState.orders.find(o => o.id.toString().trim() === orderId.toString().trim());
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
    ? 'Menyelesaikan pemesanan akan otomatis mencatat pengeluaran di Sheet Transaksi dan memotong saldo akun Anda. Lanjutkan?'
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
        localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));
      }
    }

    calculateVendorEstimates();
    renderOrdersList();
    alert(`Status pemesanan berhasil diubah menjadi "${newStatus}"!`);
    fetchDataFromSpreadsheet();

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
    localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));

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
    localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));

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
    fetchDataFromSpreadsheet();

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
    if (data.transactions && data.transactions.length > 0) appState.transactions = data.transactions;

    if (appState.activeUser) {
      const refreshedAcc = appState.accounts.find(a => a.id.toString().trim() === appState.activeUser.id.toString().trim());
      if (refreshedAcc) {
        appState.activeUser.saldo = refreshedAcc.saldo;
        activeBalanceDisplay.textContent = formatSAR(refreshedAcc.saldo);
        localStorage.setItem('ACTIVE_KHIDMAT_USER', JSON.stringify(appState.activeUser));
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
