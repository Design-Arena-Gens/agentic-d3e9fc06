'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, Upload } from 'lucide-react';

interface ForecastData {
  [key: string]: number;
}

interface Account {
  id: string;
  name: string;
  category: string;
  data: ForecastData;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const CATEGORIES = ['Revenue', 'Cost of Goods Sold', 'Operating Expenses', 'Capital Expenditure'];

export default function RollingForecast() {
  const currentYear = new Date().getFullYear();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const savedData = localStorage.getItem('rollingForecast');
    if (savedData) {
      setAccounts(JSON.parse(savedData));
    } else {
      // Initialize with sample accounts
      setAccounts([
        {
          id: '1',
          name: 'Product Sales',
          category: 'Revenue',
          data: {}
        },
        {
          id: '2',
          name: 'Service Revenue',
          category: 'Revenue',
          data: {}
        }
      ]);
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('rollingForecast', JSON.stringify(accounts));
    alert('Data saved successfully!');
  };

  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name: 'New Account',
      category: 'Revenue',
      data: {}
    };
    setAccounts([...accounts, newAccount]);
  };

  const deleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const updateAccountName = (id: string, name: string) => {
    setAccounts(accounts.map(acc =>
      acc.id === id ? { ...acc, name } : acc
    ));
  };

  const updateAccountCategory = (id: string, category: string) => {
    setAccounts(accounts.map(acc =>
      acc.id === id ? { ...acc, category } : acc
    ));
  };

  const updateAccountData = (id: string, month: string, value: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === id) {
        const numValue = parseFloat(value) || 0;
        return {
          ...acc,
          data: { ...acc.data, [month]: numValue }
        };
      }
      return acc;
    }));
  };

  const getMonthTotal = (month: string) => {
    return accounts.reduce((sum, acc) => {
      const value = acc.data[month] || 0;
      return sum + value;
    }, 0);
  };

  const getCategoryTotal = (category: string, month: string) => {
    return accounts
      .filter(acc => acc.category === category)
      .reduce((sum, acc) => sum + (acc.data[month] || 0), 0);
  };

  const getAccountTotal = (account: Account) => {
    return Object.values(account.data).reduce((sum, val) => sum + val, 0);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast-${selectedYear}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setAccounts(imported);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const groupedAccounts = CATEGORIES.map(category => ({
    category,
    accounts: accounts.filter(acc => acc.category === category)
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Annual Rolling Forecast</h1>
              <p className="text-gray-600 mt-1">Editable forecast with multiple accounts</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={addAccount}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Add Account
              </button>
              <button
                onClick={saveData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save size={20} />
                Save
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Download size={20} />
                Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                <Upload size={20} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r w-64">
                  Account Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r w-48">
                  Category
                </th>
                {MONTHS.map(month => (
                  <th key={month} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r w-32">
                    {month} {selectedYear}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r w-32 bg-blue-50">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedAccounts.map(({ category, accounts: categoryAccounts }) => (
                <>
                  {categoryAccounts.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={15} className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
                          {category}
                        </td>
                      </tr>
                      {categoryAccounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50 border-b">
                          <td className="px-4 py-2 border-r">
                            <input
                              type="text"
                              value={account.name}
                              onChange={(e) => updateAccountName(account.id, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 border-r">
                            <select
                              value={account.category}
                              onChange={(e) => updateAccountCategory(account.id, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          {MONTHS.map((month) => {
                            const key = `${month}-${selectedYear}`;
                            return (
                              <td key={month} className="px-2 py-2 border-r">
                                <input
                                  type="number"
                                  value={account.data[key] || ''}
                                  onChange={(e) => updateAccountData(account.id, key, e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                />
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-right font-semibold border-r bg-blue-50">
                            ${getAccountTotal(account).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => deleteAccount(account.id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-semibold border-b-2">
                        <td className="px-4 py-2 border-r" colSpan={2}>
                          {category} Subtotal
                        </td>
                        {MONTHS.map((month) => {
                          const key = `${month}-${selectedYear}`;
                          return (
                            <td key={month} className="px-4 py-2 text-right border-r">
                              ${getCategoryTotal(category, key).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-right border-r bg-blue-100">
                          ${categoryAccounts.reduce((sum, acc) => sum + getAccountTotal(acc), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td></td>
                      </tr>
                    </>
                  )}
                </>
              ))}
              <tr className="bg-blue-600 text-white font-bold">
                <td className="px-4 py-3 border-r" colSpan={2}>
                  GRAND TOTAL
                </td>
                {MONTHS.map((month) => {
                  const key = `${month}-${selectedYear}`;
                  return (
                    <td key={month} className="px-4 py-3 text-right border-r">
                      ${getMonthTotal(key).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right border-r">
                  ${accounts.reduce((sum, acc) => sum + getAccountTotal(acc), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>All data is stored locally in your browser. Use Export/Import to backup your forecast.</p>
        </div>
      </div>
    </div>
  );
}
