const express = require("express");
const AWS = require("aws-sdk");
const { sequelize, ProductMetadata } = require("../data/productMetaData.cjs"); // Import Sequelize instance and model
const { Client } = require("pg"); // Import the PostgreSQL client

const router = express.Router();

// Configure AWS S3 credentials and region
const s3 = new AWS.S3({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
});

// Test database connection on server start
sequelize.authenticate()
  .then(() => console.log('PostgreSQL connected via Sequelize'))
  .catch(err => console.error('Database connection error:', err));

router.get("/s3_upload", async (req, res) => {
  const { filename, filetype } = req.query;
  const encodedFilename = encodeURIComponent(filename); // It is to ensuree safe URL

  const params = {
    Bucket: 's3practiceproj',
    Key: `products/${encodedFilename}`,
    Expires: 60, // URL valid for 60 seconds
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

module.exports = router;
