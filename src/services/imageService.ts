import { ENDPOINT } from "@/constants/Endpoint";
import { axiosImageManager } from "./axios";
import type { MongoImageResponse } from "@/interfaces/Image";

export const getImageFromMongoDB = async (id: string) => {
  try {
    const { data } = await axiosImageManager.get(`/${ENDPOINT.GET_IMAGE_MONGO}/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data.image;
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
  }
};


export const uploadImageMongoDB = async (img: string): Promise<MongoImageResponse> => {
  try {
    const { data } = await axiosImageManager.post(
      `/${ENDPOINT.UPLOAD_IMAGE_MONGO}`,
      { img },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data.data;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
};

export const updateImageMongoDB = async (img: string, id: string) => {
  try {
    const { data } = await axiosImageManager.patch(`/${ENDPOINT.UPDATE_IMAGE_MONGO}/${id}`,
        {image: img},
        {
            headers: {
            "Content-Type": "application/json",
            },
        }
    );
    return data.data;
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
  }
}

export const deleteImageMongoDB = async (id: string) => {
    try {
        const { data } = await axiosImageManager.delete(`/${ENDPOINT.DELETE_IMAGE_MONGO}/${id}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return data.image;
  } catch (error) {
        console.error("Erro ao buscar imagem:", error);
  }
}
