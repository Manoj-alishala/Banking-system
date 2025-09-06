// Banking Application JavaScript

// Application Data from the provided JSON
const bankingData = {
  userAccount: {
    accountNumber: "1234567890123456",
    accountHolderName: "Rajesh Kumar Sharma",
    ifscCode: "HDFC0001234",
    branchName: "Delhi Main Branch",
    accountType: "Savings Account",
    balance: 458299.50,
    availableBalance: 458299.50,
    accountStatus: "Active"
  },
  beneficiaries: [
    {
      id: 1,
      name: "Chunnu",
      accountNumber: "9876543210987654",
      ifscCode: "ICICI0005678",
      bankName: "ICICI Bank",
      branch: "Mumbai Branch",
      nickname: "Sister"
    },
    {
      id: 2,
      name: "Manoj",
      accountNumber: "5678901234567890",
      ifscCode: "SBI00009876",
      bankName: "State Bank of India",
      branch: "Ahmedabad Branch", 
      nickname: "Business Partner"
    },
    {
      id: 3,
      name: "Tejaswini",
      accountNumber: "3456789012345678",
      ifscCode: "AXIS0001111",
      bankName: "Axis Bank",
      branch: "Bangalore Branch",
      nickname: "Friend"
    },
    {
      id: 4,
      name: "Sai Suraj",
      accountNumber: "7890123456789012",
      ifscCode: "KOTAK000222",
      bankName: "Kotak Mahindra Bank", 
      branch: "Chennai Branch",
      nickname: "Colleague"
    },
    {
      id: 5,
      name: "Thrushitha",
      accountNumber: "2345678901234567",
      ifscCode: "HDFC0003333",
      bankName: "HDFC Bank",
      branch: "Hyderabad Branch",
      nickname: "Cousin"
    }
  ],
  recentTransactions: [
    {
      id: 1,
      date: "2025-09-05",
      description: "Transfer to Manoj",
      type: "Debit", 
      amount: -5000,
      balance: 458299.50,
      reference: "TXN001234567890"
    },
    {
      id: 2,
      date: "2025-09-04",
      description: "Salary Credit",
      type: "Credit",
      amount: 100000,
      balance: 358299.50,
      reference: "SAL202509040001"
    },
    {
      id: 3,
      date: "2025-09-03",
      description: "UPI Payment - Amazon",
      type: "Debit",
      amount: -1299,
      balance: 358299.50,
      reference: "UPI202509030123"
    },
    {
      id: 4,
      date: "2025-09-02",
      description: "Interest Credit",
      type: "Credit",
      amount: 450.25,
      balance: 359400.25,
      reference: "INT202509020001"
    },
    {
      id: 5,
      date: "2025-09-01", 
      description: "ATM Withdrawal",
      type: "Debit",
      amount: -10000,
      balance: 359750.25,
      reference: "ATM202509010567"
    }
  ],
  quickStats: {
    totalBalance: 125750.50,
    recentTransactions: 25,
    pendingTransactions: 2,
    monthlySpending: 18750.75
  }
};

// Application State
class BankingApp {
  constructor() {
    this.currentView = 'dashboard';
    this.beneficiaries = [...bankingData.beneficiaries];
    this.currentTransfer = null;
    this.init();
  }

  init() {
    this.populateBeneficiaries();
    this.populateTransactions();
    this.populateBeneficiarySelect();
    this.setupEventListeners();
    this.formatBalance();
  }

  setupEventListeners() {
    // Transfer type change handler
    const transferType = document.getElementById('transferType');
    if (transferType) {
      transferType.addEventListener('change', (e) => {
        e.stopPropagation();
        this.handleTransferTypeChange(e.target.value);
      });
    }

    // Beneficiary selection handler
    const beneficiarySelect = document.getElementById('beneficiarySelect');
    if (beneficiarySelect) {
      beneficiarySelect.addEventListener('change', (e) => {
        e.stopPropagation();
        this.showBeneficiaryInfo(e.target.value);
      });
    }

    // Transfer mode change handler
    const transferMode = document.getElementById('transferMode');
    if (transferMode) {
      transferMode.addEventListener('change', (e) => {
        e.stopPropagation();
        this.updateTransferCharges();
      });
    }

    // Amount input validation - fix input handling
    const transferAmount = document.getElementById('transferAmount');
    if (transferAmount) {
      transferAmount.addEventListener('input', (e) => {
        e.stopPropagation();
        this.validateAmount(e.target.value);
      });
      
      // Prevent form submission on enter
      transferAmount.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });
    }

    // Prevent event bubbling on all form inputs
    const formInputs = document.querySelectorAll('#transfer-view input, #transfer-view select, #transfer-view textarea');
    formInputs.forEach(input => {
      input.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      input.addEventListener('focus', (e) => {
        e.stopPropagation();
      });
    });

    // Add bank name click handler
    const bankName = document.querySelector('.bank-name');
    if (bankName) {
      bankName.style.cursor = 'pointer';
      bankName.addEventListener('click', () => {
        this.showDashboard();
      });
    }

    // Modal close on outside click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target.id);
      }
    });
  }

  formatBalance() {
    const currentBalance = document.getElementById('currentBalance');
    const availableBalance = document.getElementById('availableBalance');
    
    if (currentBalance) {
      currentBalance.textContent = this.formatCurrency(bankingData.userAccount.balance);
    }
    if (availableBalance) {
      availableBalance.textContent = this.formatCurrency(bankingData.userAccount.availableBalance);
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  populateBeneficiaries() {
    const beneficiariesGrid = document.getElementById('beneficiariesGrid');
    if (!beneficiariesGrid) return;

    beneficiariesGrid.innerHTML = this.beneficiaries.map(beneficiary => `
      <div class="beneficiary-card">
        <div class="beneficiary-header">
          <div>
            <h4 class="beneficiary-name"><i class="bi bi-person"></i> ${beneficiary.name}</h4>
            <p class="beneficiary-nickname">${beneficiary.nickname}</p>
          </div>
        </div>
        <div class="beneficiary-details">
          <div class="beneficiary-detail">
            <span class="detail-label">Account</span>
            <span class="detail-value">****${beneficiary.accountNumber.slice(-4)}</span>
          </div>
          <div class="beneficiary-detail">
            <span class="detail-label">Bank</span>
            <span class="detail-value">${beneficiary.bankName}</span>
          </div>
          <div class="beneficiary-detail">
            <span class="detail-label">IFSC</span>
            <span class="detail-value">${beneficiary.ifscCode}</span>
          </div>
        </div>
        <div class="beneficiary-actions">
          <button class="btn btn--primary quick-transfer-btn" onclick="quickTransfer(${beneficiary.id})">
            Quick Transfer
          </button>
        </div>
      </div>
    `).join('');
  }

  populateTransactions() {
    const transactionsTable = document.getElementById('transactionsTable');
    if (!transactionsTable) return;

    transactionsTable.innerHTML = bankingData.recentTransactions.map(transaction => `
      <div class="transaction-row">
        <div class="transaction-cell">${this.formatDate(transaction.date)}</div>
        <div class="transaction-cell">${transaction.description}</div>
        <div class="transaction-cell">
          <span class="status status--${transaction.type.toLowerCase() === 'credit' ? 'success' : 'error'}">
            ${transaction.type}
          </span>
        </div>
        <div class="transaction-cell">
          <span class="transaction-amount ${transaction.type.toLowerCase()}">
            ${transaction.amount > 0 ? '+' : ''}₹${this.formatCurrency(transaction.amount)}
          </span>
        </div>
        <div class="transaction-cell">₹${this.formatCurrency(transaction.balance)}</div>
      </div>
    `).join('');
  }

  populateBeneficiarySelect() {
    const beneficiarySelect = document.getElementById('beneficiarySelect');
    if (!beneficiarySelect) return;

    // Clear existing options first
    beneficiarySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choose a beneficiary';
    beneficiarySelect.appendChild(defaultOption);
    
    // Add beneficiary options
    this.beneficiaries.forEach(beneficiary => {
      const option = document.createElement('option');
      option.value = beneficiary.id;
      option.textContent = `${beneficiary.name} - ${beneficiary.nickname}`;
      beneficiarySelect.appendChild(option);
    });
  }

  handleTransferTypeChange(type) {
    const existingSection = document.getElementById('existingBeneficiarySection');
    const newSection = document.getElementById('newRecipientSection');

    if (type === 'existing') {
      existingSection.classList.remove('hidden');
      newSection.classList.add('hidden');
    } else {
      existingSection.classList.add('hidden');
      newSection.classList.remove('hidden');
    }
  }

  showBeneficiaryInfo(beneficiaryId) {
    const infoSection = document.getElementById('selectedBeneficiaryInfo');
    
    if (!beneficiaryId) {
      infoSection.classList.add('hidden');
      return;
    }

    const beneficiary = this.beneficiaries.find(b => b.id == beneficiaryId);
    if (!beneficiary) return;

    infoSection.innerHTML = `
      <h4>${beneficiary.name}</h4>
      <div class="beneficiary-detail">
        <span class="detail-label">Account Number</span>
        <span class="detail-value">${beneficiary.accountNumber}</span>
      </div>
      <div class="beneficiary-detail">
        <span class="detail-label">Bank</span>
        <span class="detail-value">${beneficiary.bankName}</span>
      </div>
      <div class="beneficiary-detail">
        <span class="detail-label">IFSC Code</span>
        <span class="detail-value">${beneficiary.ifscCode}</span>
      </div>
      <div class="beneficiary-detail">
        <span class="detail-label">Branch</span>
        <span class="detail-value">${beneficiary.branch}</span>
      </div>
    `;
    infoSection.classList.remove('hidden');
  }

  validateAmount(amount) {
    const transferAmount = document.getElementById('transferAmount');
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      transferAmount.style.borderColor = 'var(--color-error)';
      return false;
    } else if (numAmount > bankingData.userAccount.availableBalance) {
      transferAmount.style.borderColor = 'var(--color-error)';
      return false;
    } else {
      transferAmount.style.borderColor = 'var(--color-border)';
      return true;
    }
  }

  updateTransferCharges() {
    // This could be expanded to show dynamic charges based on transfer mode
    const mode = document.getElementById('transferMode').value;
    // Implementation for updating charges display
  }

  validateTransferForm() {
    const transferType = document.getElementById('transferType').value;
    const amount = document.getElementById('transferAmount').value;
    const password = document.getElementById('transactionPassword').value;
    
    if (!amount || !password) {
      alert('Please fill all required fields');
      return false;
    }

    if (!this.validateAmount(amount)) {
      alert('Please enter a valid amount within your available balance');
      return false;
    }

    if (transferType === 'existing') {
      const beneficiaryId = document.getElementById('beneficiarySelect').value;
      if (!beneficiaryId) {
        alert('Please select a beneficiary');
        return false;
      }
    } else {
      const name = document.getElementById('recipientName').value;
      const account = document.getElementById('recipientAccount').value;
      const ifsc = document.getElementById('recipientIFSC').value;
      const bank = document.getElementById('recipientBank').value;
      
      if (!name || !account || !ifsc || !bank) {
        alert('Please fill all recipient details');
        return false;
      }
    }

    return true;
  }

  prepareTransferData() {
    const transferType = document.getElementById('transferType').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const mode = document.getElementById('transferMode').value;
    const remarks = document.getElementById('transferRemarks').value;

    let recipient;
    if (transferType === 'existing') {
      const beneficiaryId = document.getElementById('beneficiarySelect').value;
      recipient = this.beneficiaries.find(b => b.id == beneficiaryId);
    } else {
      recipient = {
        name: document.getElementById('recipientName').value,
        accountNumber: document.getElementById('recipientAccount').value,
        ifscCode: document.getElementById('recipientIFSC').value,
        bankName: document.getElementById('recipientBank').value
      };
    }

    // Calculate charges
    let charges = 0;
    switch(mode) {
      case 'imps': charges = 5; break;
      case 'neft': charges = 0; break;
      case 'rtgs': charges = 25; break;
    }

    return {
      recipient,
      amount,
      charges,
      total: amount + charges,
      mode: mode.toUpperCase(),
      remarks
    };
  }

  showTransferSummary(transferData) {
    const summarySection = document.getElementById('transferSummary');
    const summaryDetails = document.getElementById('summaryDetails');
    
    summaryDetails.innerHTML = `
      <div class="summary-item">
        <span class="summary-label">To</span>
        <span class="summary-value">${transferData.recipient.name}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Account Number</span>
        <span class="summary-value">${transferData.recipient.accountNumber}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Bank</span>
        <span class="summary-value">${transferData.recipient.bankName}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Transfer Mode</span>
        <span class="summary-value">${transferData.mode}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Amount</span>
        <span class="summary-value">₹${this.formatCurrency(transferData.amount)}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Charges</span>
        <span class="summary-value">₹${this.formatCurrency(transferData.charges)}</span>
      </div>
      ${transferData.remarks ? `
        <div class="summary-item">
          <span class="summary-label">Remarks</span>
          <span class="summary-value">${transferData.remarks}</span>
        </div>
      ` : ''}
      <div class="summary-item">
        <span class="summary-label">Total Amount</span>
        <span class="summary-value">₹${this.formatCurrency(transferData.total)}</span>
      </div>
    `;

    summarySection.classList.remove('hidden');
    document.querySelector('.transfer-form').classList.add('hidden');
  }

  processTransfer(transferData) {
    // Simulate transfer processing
    const referenceNumber = 'TXN' + Date.now();
    
    // Update account balance
    bankingData.userAccount.balance -= transferData.total;
    bankingData.userAccount.availableBalance -= transferData.total;
    
    // Add to transaction history
    const newTransaction = {
      id: bankingData.recentTransactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      description: `Transfer to ${transferData.recipient.name}`,
      type: 'Debit',
      amount: -transferData.total,
      balance: bankingData.userAccount.balance,
      reference: referenceNumber
    };
    
    bankingData.recentTransactions.unshift(newTransaction);
    
    // Show success result
    this.showTransferResult(true, referenceNumber, transferData);
    
    // Update UI
    this.formatBalance();
    this.populateTransactions();
  }

  showTransferResult(success, referenceNumber, transferData) {
    const resultSection = document.getElementById('transferResult');
    const summarySection = document.getElementById('transferSummary');
    
    summarySection.classList.add('hidden');
    
    if (success) {
      resultSection.innerHTML = `
        <div class="result-success">
          <div class="result-icon"><i class="bi bi-check-circle"></i></div>
          <h3 class="result-title">Transfer Successful!</h3>
          <p class="result-message">
            Your transfer of ₹${this.formatCurrency(transferData.amount)} to ${transferData.recipient.name} has been completed successfully.
          </p>
          <div class="result-reference">
            <strong>Reference Number:</strong> ${referenceNumber}
          </div>
          <div class="result-actions">
            <button class="btn btn--outline" onclick="downloadReceipt('${referenceNumber}')">Download Receipt</button>
            <button class="btn btn--primary" onclick="showDashboard()">Back to Dashboard</button>
          </div>
        </div>
      `;
    } else {
      resultSection.innerHTML = `
        <div class="result-error">
          <div class="result-icon">❌</div>
          <h3 class="result-title">Transfer Failed!</h3>
          <p class="result-message">
            Your transfer could not be processed. Please try again or contact customer support.
          </p>
          <div class="result-actions">
            <button class="btn btn--outline" onclick="editTransfer()">Try Again</button>
            <button class="btn btn--primary" onclick="showDashboard()">Back to Dashboard</button>
          </div>
        </div>
      `;
    }
    
    resultSection.classList.remove('hidden');
  }

  showDashboard() {
    document.getElementById('dashboard-view').classList.add('active');
    document.getElementById('transfer-view').classList.remove('active');
  }

  showTransferPage() {
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('transfer-view').classList.add('active');
    
    // Reset transfer form
    const form = document.querySelector('.transfer-form');
    const summary = document.getElementById('transferSummary');
    const result = document.getElementById('transferResult');
    
    form.classList.remove('hidden');
    summary.classList.add('hidden');
    result.classList.add('hidden');
    
    // Reset form fields
    document.getElementById('transferType').value = 'existing';
    document.getElementById('beneficiarySelect').value = '';
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferRemarks').value = '';
    document.getElementById('transactionPassword').value = '';
    
    // Show existing beneficiary section by default
    this.handleTransferTypeChange('existing');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
  }
}

// Global Functions
function showDashboard() {
  if (window.app) {
    window.app.showDashboard();
  }
}

function showTransferPage() {
  if (window.app) {
    window.app.showTransferPage();
  }
}

function quickTransfer(beneficiaryId) {
  if (window.app) {
    window.app.showTransferPage();
    
    // Small delay to ensure page is shown before setting values
    setTimeout(() => {
      const transferType = document.getElementById('transferType');
      const beneficiarySelect = document.getElementById('beneficiarySelect');
      
      if (transferType && beneficiarySelect) {
        transferType.value = 'existing';
        beneficiarySelect.value = beneficiaryId;
        
        // Trigger change events
        window.app.handleTransferTypeChange('existing');
        window.app.showBeneficiaryInfo(beneficiaryId);
      }
    }, 100);
  }
}

function reviewTransfer() {
  if (window.app && window.app.validateTransferForm()) {
    const transferData = window.app.prepareTransferData();
    window.app.currentTransfer = transferData;
    window.app.showTransferSummary(transferData);
  }
}

function editTransfer() {
  const form = document.querySelector('.transfer-form');
  const summary = document.getElementById('transferSummary');
  const result = document.getElementById('transferResult');
  
  if (form) form.classList.remove('hidden');
  if (summary) summary.classList.add('hidden');
  if (result) result.classList.add('hidden');
}

function confirmTransfer() {
  if (window.app && window.app.currentTransfer) {
    // Simulate processing delay
    setTimeout(() => {
      window.app.processTransfer(window.app.currentTransfer);
    }, 1000);
  }
}

function addBeneficiary() {
  const modal = document.getElementById('addBeneficiaryModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function saveBeneficiary() {
  const name = document.getElementById('newBeneficiaryName').value;
  const account = document.getElementById('newBeneficiaryAccount').value;
  const ifsc = document.getElementById('newBeneficiaryIFSC').value;
  const bank = document.getElementById('newBeneficiaryBank').value;
  const nickname = document.getElementById('newBeneficiaryNickname').value;
  
  if (!name || !account || !ifsc || !bank) {
    alert('Please fill all required fields');
    return;
  }
  
  if (window.app) {
    const newBeneficiary = {
      id: window.app.beneficiaries.length + 1,
      name,
      accountNumber: account,
      ifscCode: ifsc,
      bankName: bank,
      branch: 'N/A',
      nickname: nickname || 'Friend'
    };
    
    window.app.beneficiaries.push(newBeneficiary);
    window.app.populateBeneficiaries();
    window.app.populateBeneficiarySelect();
  }
  
  // Clear form
  document.getElementById('newBeneficiaryName').value = '';
  document.getElementById('newBeneficiaryAccount').value = '';
  document.getElementById('newBeneficiaryIFSC').value = '';
  document.getElementById('newBeneficiaryBank').value = '';
  document.getElementById('newBeneficiaryNickname').value = '';
  
  closeModal('addBeneficiaryModal');
  alert('Beneficiary added successfully!');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function downloadReceipt(referenceNumber) {
  // Simulate receipt download
  alert(`Receipt for transaction ${referenceNumber} downloaded successfully!`);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new BankingApp();
});