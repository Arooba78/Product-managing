const express = require("express");
const AWS = require("aws-sdk");

const router = express.Router();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
});

router.get("/upload-url", async (req, res) => {
  const { filename, filetype } = req.query;
  console.log(filename)
  const encodedFilename = encodeURIComponent(filename);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
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

router.post("/save-metadata", (req, res) => {
  const { title, description, imageUrl } = req.body;

  console.log("Metadata saved:", { title, description, imageUrl });

  res.status(200).json({ message: "Metadata saved successfully" });
});

module.exports = router;
