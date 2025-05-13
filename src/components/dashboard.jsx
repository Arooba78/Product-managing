import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");

  // Fetch all products initially
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = () => {
    axios.get("http://localhost:5000/api/all_products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Failed to fetch products", error));
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchAllProducts(); // If query is empty, show all
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/search", {
        params: { query }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div>
      <h1>Product Dashboard</h1>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by title or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Products Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Description</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.title}</td>
              <td>{prod.description}</td>
              <td>
                <a href={prod.image_url} target="_blank" rel="noreferrer">
                  {prod.image_url.split('/').pop()}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
