import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/all_products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch products", error);
      });
  }, []);

  return (
    <div>
      <h1>Product Dashboard</h1>
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
