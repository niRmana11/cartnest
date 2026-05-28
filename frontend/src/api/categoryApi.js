import axiosInstance from "./axiosInstance";

export const getCategories = async () => {
  const response = await axiosInstance.get("/categories");
  return response.data.categories || [];
};

export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post("/categories", categoryData);
  return response.data.category;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await axiosInstance.put(
    `/categories/${categoryId}`,
    categoryData,
  );

  return response.data.category;
};

export const deleteCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`/categories/${categoryId}`);
  return response.data;
};
