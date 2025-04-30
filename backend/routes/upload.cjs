const express = require("express");
const AWS = require("aws-sdk");
const { sequelize, ProductMetadata } = require("../data/productMetaData.cjs"); // Import Sequelize instance and model
const elasticClient = require("../client/elastiSearchClient.cjs"); // Import Elasticsearch client
const { Client } = require("pg"); // Import the PostgreSQL client


const router = express.Router();

const s3 = new AWS.S3({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
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

  try {
    const product = await ProductMetadata.create({
      title,
      description,
      image_url: imageUrl,
    });

    // 👇 Index it in Elasticsearch
    await elasticClient.index({
      index: 'products',
      id: product.id.toString(),
      document: {
        title: product.title,
        description: product.description,
        image_url: product.image_url,
      }
    });

    res.status(200).json({ message: "Metadata saved successfully", product });
  } catch (error) {
    console.error("Error saving metadata:", error);
    res.status(500).json({ error: "Failed to save metadata" });
  }
});
router.get("/all_products", async (req, res) => {
  try {
    const products = await ProductMetadata.findAll({
      order: [['id', 'DESC']],
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/search", async (req, res) => {
  const { query } = req.query;

  try {
    const result = await elasticClient.search({
      index: 'products',
      query: {
        multi_match: {
          query,
          fields: ['title', 'description']
        }
      }
    });

    const hits = result.hits.hits.map(hit => hit._source);
    res.json(hits);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});


module.exports = router;
