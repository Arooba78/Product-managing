import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import './uploadForm.css'

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (values) => {
    const { title, description } = values;

    try {
      const { data } = await axios.get("http://localhost:5000/api/s3_upload", {
        params: { filename: file.name, filetype: file.type }
      });

      await axios.put(data.url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      const imageUrl = data.url.split("?")[0];
      console.log("Presigned URL:", data.url);

      await axios.post("http://localhost:5000/api/save_metadata", {
        title,
        description,
        imageUrl,
      });

      alert("Product uploaded successfully!");
      values.title = "";
      values.description = "";
      setFile(null);
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
          <div>
            <label htmlFor="title">Title</label>
            <Field
              type="text"
              id="title"
              name="title"
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <Field
              type="text"
              id="description"
              name="description"
              required
            />
          </div>

          <div>
            <label htmlFor="file">Product Image</label>
            <input
              type="file"
              id="file"
              onChange={(e) => {
                handleFileChange(e);
                setFieldValue("file", e.target.files[0]);
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

          <button type="submit">Upload Product</button>
        </Form>
      )}
    </Formik>
  );
};

export default UploadForm;
