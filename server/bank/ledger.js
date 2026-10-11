/**
 * BankSim Mock Core Banking Ledger
 * Provides deterministic state management, realistic mock account balances,
 * transactional atomicity, and ledger audit capabilities.
 */

const INITIAL_STATE = {
  user: {
    name: 'Alex Vance',
    customerId: 'CUST-88390',
    kycStatus: 'VERIFIED',
    riskTier: 'LOW'
  },
  accounts: {
    checking: {
      accountNumber: 'CHK-8921-X9',
      name: 'Premier Checking',
      balance: 8450.00,
      currency: 'USD',
      status: 'ACTIVE',
      dailyLimit: 5000.00,
      dailySpentToday: 150.00
    },
    savings: {
      accountNumber: 'SAV-2241-S4',
      name: 'High-Yield Savings',
      balance: 24120.00,
      currency: 'USD',
      status: 'ACTIVE',
      apy: '4.85%'
    },
    creditCard: {
      accountNumber: 'CC-9153-C8',
      name: 'Titanium Cash Rewards',
      balance: 420.50,
      creditLimit: 10000.00,
      currency: 'USD',
      status: 'ACTIVE'
    }
  },
  cards: [
    {
      id: 'card-1',
      type: 'DEBIT',
      lastFour: '4082',
      status: 'ACTIVE',
      expiry: '09/29',
      brand: 'Visa'
    },
    {
      id: 'card-2',
      type: 'VIRTUAL',
      lastFour: '9153',
      status: 'ACTIVE',
      expiry: '12/28',
      brand: 'Mastercard'
    }
  ],
  verifiedBeneficiaries: [
    { name: 'Alice Smith', id: 'ben-1', email: 'alice@banksim.net', account: 'ACC-1049-A' },
    { name: 'Bob Johnson', id: 'ben-2', email: 'bob@banksim.net', account: 'ACC-2091-B' },
    { name: 'Charlie Brown', id: 'ben-3', email: 'charlie@banksim.net', account: 'ACC-3902-C' },
    { name: 'Sarah Connor', id: 'ben-4', email: 'sarah@skynet-defense.org', account: 'ACC-5512-S' },
    { name: 'Metro Electric Utility', id: 'ben-5', email: 'billing@metroelectric.internal', account: 'ACC-7721-E' }
  ],
  transactions: [
    {
      id: 'TXN-9081',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      type: 'DEBIT',
      from: 'CHK-8921-X9',
      to: 'Metro Electric Utility',
      amount: 112.50,
      memo: 'Monthly power bill - Invoice #8892',
      status: 'COMPLETED',
      securityVerified: true
    },
    {
      id: 'TXN-9082',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      type: 'DEBIT',
      from: 'CHK-8921-X9',
      to: 'Bob Johnson',
      amount: 37.50,
      memo: 'Italian Dinner split',
      status: 'COMPLETED',
      securityVerified: true
    },
    {
      id: 'TXN-9083',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      type: 'CREDIT',
      from: 'TechCorp Payroll',
      to: 'CHK-8921-X9',
      amount: 3200.00,
      memo: 'Bi-weekly Direct Deposit Salary',
      status: 'COMPLETED',
      securityVerified: true
    }
  ]
};

class BankLedger {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  getState() {
    return this.state;
  }

  getBalances() {
    return {
      checking: this.state.accounts.checking.balance,
      savings: this.state.accounts.savings.balance,
      creditCard: this.state.accounts.creditCard.balance
    };
  }

  executeTransfer({ recipient, amount, memo, fromAccount = 'checking' }) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        success: false,
        error: 'Invalid monetary transfer amount.'
      };
    }

    const source = this.state.accounts[fromAccount];
    if (!source) {
      return {
        success: false,
        error: `Source account '${fromAccount}' does not exist.`
      };
    }

    if (source.balance < numAmount) {
      return {
        success: false,
        error: `Insufficient balance ($${source.balance.toFixed(2)}) for transfer of $${numAmount.toFixed(2)}.`
      };
    }

    // Deduct
    source.balance = parseFloat((source.balance - numAmount).toFixed(2));
    source.dailySpentToday = parseFloat(((source.dailySpentToday || 0) + numAmount).toFixed(2));

    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn = {
      id: txnId,
      timestamp: new Date().toISOString(),
      type: 'DEBIT',
      from: source.accountNumber,
      to: recipient,
      amount: numAmount,
      memo: memo || 'Transfer',
      status: 'COMPLETED',
      securityVerified: true
    };

    this.state.transactions.unshift(newTxn);

    return {
      success: true,
      transactionId: txnId,
      newBalance: source.balance,
      details: newTxn
    };
  }

  toggleCardStatus(cardId) {
    const card = this.state.cards.find(c => c.id === cardId || c.lastFour === cardId);
    if (!card) {
      return { success: false, error: 'Card not found' };
    }
    card.status = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    return {
      success: true,
      cardId: card.id,
      lastFour: card.lastFour,
      newStatus: card.status
    };
  }
}

export const bankLedger = new BankLedger();
