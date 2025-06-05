import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    date_from: '',
    date_to: '',
    min_amount: '',
    max_amount: '',
  });
  const [pagination, setPagination] = useState({ next: null, previous: null });

  const fetchTransactions = async () => {
    const params = new URLSearchParams({
      page: page,
      ...filters
    });
    try {
      const res = await axiosInstance.get(`/transactions/?${params.toString()}`);
      setTransactions(res.data.results);
      setPagination({ next: res.data.next, previous: res.data.previous });
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setPage(1);
    fetchTransactions();
  };

  return (
    <div>
      <h2>Transactions</h2>

      <div style={{ marginTop:'20px'}}>
        <h4>Filter</h4>
        <input name="category" placeholder="Category ID" onChange={handleFilterChange} />
        <input name="date_from" type="date" onChange={handleFilterChange} />
        <input name="date_to" type="date" onChange={handleFilterChange} />
        <input name="min_amount" type="number" placeholder="Min Amount" onChange={handleFilterChange} />
        <input name="max_amount" type="number" placeholder="Max Amount" onChange={handleFilterChange} />
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      <table border="1" cellPadding="10" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.category}</td>
              <td>₹{tx.amount}</td>
              <td>{tx.date}</td>
              <td>{tx.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button disabled={!pagination.previous} onClick={() => setPage(prev => prev - 1)}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {page}</span>
        <button disabled={!pagination.next} onClick={() => setPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
}

export default Transactions;

