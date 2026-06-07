import { ENDPOINT } from "../constants/Endpoint";
import axiosInstace from "./axios";
import { UserResponse } from "../interfaces/User";
import {
  SignInPayload,
  SignUpPayload,
  UpdateUserPayload,
} from "@/interfaces/User";

// 🔹 LOGIN (autenticação)
export const authenticateUser = async (credentials: SignInPayload) => {
  try {
    const { data } = await axiosInstace.post<string>(
      `/${ENDPOINT.SIGN_IN}`,
      credentials,
      { withCredentials: true }
    );
    sessionStorage.setItem("fertintelligenceToken", data);
    return data;
  } catch (error: any) {
    console.error(
      "Erro ao autenticar usuário:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🔹 CADASTRO
export const createUser = async (body: SignUpPayload) => {
  try {
    const { data } = await axiosInstace.post<string>(
      `/${ENDPOINT.CREATE_NEW_USER}`, // user/register
      body
    );
    return data;
  } catch (error: any) {
    console.error(
      "Erro ao criar usuário:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getUser = async () => {
  // Usa a nova interface UserResponse
  const { data } = await axiosInstace.get<UserResponse>(
    `/${ENDPOINT.GET_USER}`
  );

  return data;
};

export const getUserId = async () => {
  // Usa a nova interface UserResponse
  const { data } = await axiosInstace.get<UserResponse>(
    `/${ENDPOINT.GET_USER}`
  );

  return data.id;
};

export const updateUser = async (body: UpdateUserPayload) => {
  const { data } = await axiosInstace.put<string>(
    `/${ENDPOINT.UPDATE_USER}`,
    body
  );

  return data;
};

export const deleteUser = async () => {
  const { data } = await axiosInstace.delete<string>(
    `/${ENDPOINT.DELETE_USER}`
  );

  return data;
};
