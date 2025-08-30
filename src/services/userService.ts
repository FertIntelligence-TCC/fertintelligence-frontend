import { ENDPOINT } from "../constants/Endpoint";
import axiosInstace from "./axios";
import { SignInResponse } from "../interfaces/ServiceResponse";
import { SignInPayload, SignUpPayload, UpdateUserPayload } from "@/interfaces/ServicePayload";


// 🔹 LOGIN (autenticação)
export const authenticateUser = async (credentials: SignInPayload) => {
    try {
        const encodedCredentials: string = btoa(`${credentials.email}:${credentials.senha}`);
        const authorization = `Basic ${encodedCredentials}`;

        const { data } = await axiosInstace.post<string>(
            `/${ENDPOINT.SIGN_IN}`,
            {},
            { headers: { Authorization: authorization }, withCredentials: true }
        );

        sessionStorage.setItem("fertintelligenceToken", data);

        return data;
    } catch (error: any) {
        console.error("Erro ao autenticar usuário:", error.response?.data || error.message);
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
        console.error("Erro ao criar usuário:", error.response?.data || error.message);
        throw error;
    }
};


export const getUser = async () => {
    const { data } = await axiosInstace.get<SignInResponse>(
        `/${ENDPOINT.GET_USER}`
    );

    return data;
}

export const getUserId = async () => {
    const { data } = await axiosInstace.get<SignInResponse>(
        `/${ENDPOINT.GET_USER}`
    );

    return data.id;
}

export const updateUser = async (body: UpdateUserPayload) => {
    console.log(body)
    const { data } = await axiosInstace.put<string>(
        `/${ENDPOINT.UPDATE_USER}`,
        body
    )

    return data
}

export const deleteUser = async () => {
    const { data } = await axiosInstace.delete<string>(
        `/${ENDPOINT.DELETE_USER}`,
    )

    return data;
}