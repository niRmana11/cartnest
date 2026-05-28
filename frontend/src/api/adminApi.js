import axiosInstance from "./axiosInstance";

export const getAdminProducts = async () => {
  const response = await axiosInstance.get("/products");
  return response.data.products || [];
};

export const createAdminProduct = async (productData) => {
  const formData = buildProductFormData(productData);

  const response = await axiosInstance.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.product;
};

export const updateAdminProduct = async (productId, productData) => {
  const formData = buildProductFormData(productData);

  const response = await axiosInstance.put(`/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.product;
};

export const deleteAdminProduct = async (productId) => {
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
};

function buildProductFormData(productData) {
  const formData = new FormData();

  formData.append("name", productData.name);
  formData.append("description", productData.description || "");
  formData.append("price", productData.price);
  formData.append("stock", productData.stock);
  formData.append("category", productData.category);

  if (productData.image) {
    formData.append("image", productData.image);
  }

  return formData;
}
