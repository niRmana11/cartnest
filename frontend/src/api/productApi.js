import axiosInstance from "./axiosInstance";

export const getProducts = async (categorySlug = "all") => {
  const params = {};

  if (categorySlug && categorySlug !== "all") {
    params.category = categorySlug;
  }

  const response = await axiosInstance.get("/products", { params });

  return response.data.products || [];
};
