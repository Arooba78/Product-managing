import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import './uploadForm.css';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile)); // It will Generate preview from selected image
  };

  const handleSubmit = async (values) => {
    const { title, description } = values;

    try {
      // 1. Get pre-signed S3 upload URL
      const { data } = await axios.get("http://localhost:5000/api/s3_upload", {
        params: { filename: file.name, filetype: file.type },
      });

      // 2. Upload file to S3 using the pre-signed URL
      await axios.put(data.url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      // 3. Extract actual file URL (strip query params)
      const imageUrl = data.url.split("?")[0];
      console.log("Presigned URL:", data.url);

      // 4. Save metadata to the backend
      await axios.post("http://localhost:5000/api/save_metadata", {
        title,
        description,
        imageUrl,
      });

      // 5. Reset form and UI states
      alert("Product uploaded successfully!");
      values.title = "";
      values.description = "";
      setFile(null);
      setImagePreview(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("Error uploading product. Please try again.");
    }
  };

  return (
    <Formik
      initialValues={{ title: "", description: "" }}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue }) => (
        <Form className="upload-form">
          {/* Product title field */}
          <div>
            <label htmlFor="title">Title</label>
            <Field
              type="text"
              id="title"
              name="title"
              required
            />
          </div>

          {/* Product description field */}
          <div>
            <label htmlFor="description">Description</label>
            <Field
              type="text"
              id="description"
              name="description"
              required
            />
          </div>

          {/* Image file input */}
          <div>
            <label htmlFor="file">Product Image</label>
            <input
              type="file"
              id="file"
              onChange={(e) => {
                handleFileChange(e);
                setFieldValue("file", e.target.files[0]); // Register file in Formik (optional)
              }}
              required
            />
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </div>
          )}

          {/* Live image preview */}
          {imagePreview && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </div>
          )}

          {/* Submit button */}
          <button type="submit">Upload Product</button>
        </Form>
      )}
    </Formik>
  );
};

export default UploadForm;
