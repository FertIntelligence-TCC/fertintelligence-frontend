import { ENDPOINT } from "@/constants/Endpoint";
import { axiosImageManager } from "./axios";

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

type MongoImageResponse = {
  _id?: string;
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
    console.log(img)
    console.log("BASEURL:", axiosImageManager.defaults.baseURL);
    console.log("CALL URL:", `/${ENDPOINT.UPDATE_IMAGE_MONGO}/${id}`);
    const { data } = await axiosImageManager.patch(`/${ENDPOINT.UPDATE_IMAGE_MONGO}/${id}`,
        {image: img},
        {
            headers: {
            "Content-Type": "application/json",
            },
        }
    );
    console.log(data.data)
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