const express = require("express");
const AWS = require("aws-sdk");
const { Client } = require("pg"); // Import the PostgreSQL client

const router = express.Router();

const s3 = new AWS.S3({
  region: process.env.region,
  accessKeyId: process.env.key,
  secretAccessKey: process.env.secretKey, 
});

// PostgreSQL client setup
const client = new Client({
  user: 'products',  // database user
  host: 'localhost',
  database: 'products',  // database name
  password: 'arooba777', // password for the database
  port: 5432,
});

client.connect(); // Connect to PostgreSQL

// S3 upload URL generation
router.get("/s3_upload", async (req, res) => {
  const { filename, filetype } = req.query;
  console.log(filename);
  const encodedFilename = encodeURIComponent(filename);
  const params = {
    Bucket: 's3practiceproj',
    Key: `products/${encodedFilename}`,
    Expires: 60,
    ContentType: filetype,
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    res.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Save metadata into the database
router.post("/save_metadata", async (req, res) => {
  const { title, description, imageUrl } = req.body;

  const filename = imageUrl.split("/").pop();

  const query = `
    INSERT INTO product_metadata (title, description, image_url)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  try {
    const result = await client.query(query, [filename, description, imageUrl]);
    console.log("Metadata saved:", result.rows[0]);

    res.status(200).json({ message: "Metadata saved successfully", product: result.rows[0] });
  } catch (error) {
    console.error("Error saving metadata:", error);
    res.status(500).json({ error: "Failed to save metadata" });
  }
});
router.get("/all_products", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM product_metadata ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching product data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
