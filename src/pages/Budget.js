import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../api/axios';
import * as d3 from 'd3';

function Budget() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [data, setData] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await axiosInstance.get(`/monthly-report/?month=${month}`);
        console.log("data>>>>>>>", res);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch budget report', err);
      }
    };

    fetchBudget();
  }, [month]);

  useEffect(() => {
    if (!data) return;

    const chartData = [
      { label: 'Budget', value: data.budget, color: '#4CAF50' },
      { label: 'Expenses', value: data.actual_expenses, color: '#F44336' }
    ];

    const width = 300;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.value)]).nice()
      .range([height - margin.bottom, margin.top]);

    svg.selectAll("rect")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => d.color);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data]);

  return (
    <div>
      <h2>Budget vs. Expenses</h2>
      <label>Select Month: </label>
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
      />
      {data ? (
        <div>
          <p><strong>Budget:</strong> ₹{data.budget}</p>
          <p><strong>Actual Expenses:</strong> ₹{data.actual_expenses}</p>
          <p><strong>Status:</strong> {data.status}</p>
          <svg ref={chartRef}></svg>
        </div>
      ) : (
        <p>Loading budget data...</p>
      )}
    </div>
  );
}

export default Budget;
