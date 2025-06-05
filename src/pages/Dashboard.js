import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../api/axios';
import * as d3 from 'd3';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const summaryChartRef = useRef();
  const categoryChartRef = useRef();

  
  useEffect(() => {
    axiosInstance.get('/summary/')
      .then(res => setSummary(res.data))
      .catch(err => console.error('Error loading summary', err));
  }, []);

  
  useEffect(() => {
    if (summary) {
      const data = [
        { label: 'Income', value: summary.total_income },
        { label: 'Expenses', value: summary.total_expenses }
      ];

      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;

      d3.select(summaryChartRef.current).selectAll("*").remove(); // Clear old chart
      const svg = d3.select(summaryChartRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#4CAF50", "#F44336"]);

      const pie = d3.pie().value(d => d.value);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      svg.selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

      svg.selectAll("text")
        .data(pie(data))
        .join("text")
        .text(d => `${d.data.label}: ₹${d.data.value}`)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", 12);
    }
  }, [summary]);

  
  useEffect(() => {
    axiosInstance.get('/transactions/')
      .then(res => {
        const transactions = res.data.results;
        const grouped = {};

        transactions.forEach(tx => {
          
          const categoryName = typeof tx.category === 'string' ? tx.category : tx.category?.name || tx.category;
          if (categoryName && tx.amount && tx.amount > 0) {
            grouped[categoryName] = (grouped[categoryName] || 0) + parseFloat(tx.amount);
          }
        });

        const chartData = Object.entries(grouped).map(([label, value]) => ({
          label,
          value
        }));

        setCategoryData(chartData);
      })
      .catch(err => console.error('Error loading transactions for category chart', err));
  }, []);

  useEffect(() => {
    if (!categoryData.length) return;

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    d3.select(categoryChartRef.current).selectAll("*").remove();
    const svg = d3.select(categoryChartRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeSet3);
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll("path")
      .data(pie(categoryData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.label))
      .attr("stroke", "#fff")
      .style("stroke-width", "2px");

    svg.selectAll("text")
      .data(pie(categoryData))
      .enter()
      .append("text")
      .text(d => `${d.data.label}: ₹${d.data.value.toFixed(0)}`)
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", 10);
  }, [categoryData]);

  return (
    <div>
      <h2>Dashboard</h2>
      {summary ? (
        <>
          <p><strong>Total Income:</strong> ₹{summary.total_income}</p>
          <p><strong>Total Expenses:</strong> ₹{summary.total_expenses}</p>
          <p><strong>Balance:</strong> ₹{summary.balance}</p>

          <h3>Income vs Expenses</h3>
          <svg ref={summaryChartRef}></svg>

          <h3>Category-wise Expenses</h3>
          <svg ref={categoryChartRef}></svg>
        </>
      ) : (
        <p>Loading summary...</p>
      )}
    </div>
  );
}

export default Dashboard;
