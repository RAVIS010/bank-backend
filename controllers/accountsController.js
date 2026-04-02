const Account = require('../models/Account');

exports.createAccount = async (req, res) => {
  try {
    const { name, email, password, depositAmount } = req.body;

    if (!name || !email || !password || depositAmount == null) {
      return res.status(400).json({ error: 'name, email, password, depositAmount are required' });
    }

    if (depositAmount < 0) {
      return res.status(400).json({ error: 'depositAmount must be >= 0' });
    }

    const existing = await Account.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Account with this email already exists' });
    }

    const account = new Account({
      name,
      email: email.toLowerCase(),
      password,
      balance: depositAmount,
      transactions: depositAmount > 0 ? [{ type: 'deposit', amount: depositAmount, description: 'Initial deposit' }] : [],
    });

    await account.save();

    return res.status(201).json({
      message: 'Account created',
      account: {
        id: account._id,
        name: account.name,
        email: account.email,
        balance: account.balance,
      },
    });
  } catch (err) {
    console.error('createAccount error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || amount == null) {
      return res.status(400).json({ error: 'email and amount are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be > 0' });
    }

    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.balance += amount;
    account.transactions.push({ type: 'deposit', amount, description: 'Deposit' });
    await account.save();

    return res.status(200).json({ message: 'Deposit successful', balance: account.balance });
  } catch (err) {
    console.error('deposit error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || amount == null) {
      return res.status(400).json({ error: 'email and amount are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Withdraw amount must be > 0' });
    }

    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    account.balance -= amount;
    account.transactions.push({ type: 'withdraw', amount, description: 'Withdraw' });
    await account.save();

    return res.status(200).json({ message: 'Withdraw successful', balance: account.balance });
  } catch (err) {
    console.error('withdraw error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.findAllTransactions = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email query parameter is required' });
    }

    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.status(200).json(account.transactions);
  } catch (err) {
    console.error('findAllTransactions error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({}, '-password');
    return res.status(200).json(accounts);
  } catch (err) {
    console.error('getAllAccounts error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Account id is required' });
    }

    const account = await Account.findById(id, '-password');
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.status(200).json(account);
  } catch (err) {
    console.error('getAccountById error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Account id is required' });
    }

    const account = await Account.findByIdAndDelete(id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.status(200).json({ message: 'Account deleted', id });
  } catch (err) {
    console.error('deleteAccount error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, balance } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Account id is required' });
    }

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email.toLowerCase();
    if (balance != null) {
      if (balance < 0) {
        return res.status(400).json({ error: 'Balance must be >= 0' });
      }
      update.balance = balance;
    }

    const account = await Account.findByIdAndUpdate(id, update, { new: true, runValidators: true, context: 'query' });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.status(200).json({ message: 'Account updated', account: { id: account._id, name: account.name, email: account.email, balance: account.balance } });
  } catch (err) {
    console.error('updateAccount error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
