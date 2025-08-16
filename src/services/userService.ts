import { ENDPOINT } from "../constants/Endpoint";
import axiosInstace from "./axios";
import { SignInResponse } from "../interfaces/ServiceResponse";
import { SignInPayload, SignUpPayload, UpdateUserPayload } from "@/interfaces/ServicePayload";

export const authenticateUser = async (credentials: SignInPayload) => {
    const encodedCredentials: string = btoa(`${credentials.login}:${credentials.senha}`);
    const authorization = `Basic ${encodedCredentials}`
    console.log(authorization)
    const { data } = await axiosInstace.post<string>(
        `/${ENDPOINT.SIGN_IN}`,
        {},
        { headers: { Authorization: authorization }, withCredentials:true }
    )
    sessionStorage.setItem("fertintelligenceToken", data)
}

export const createUser = async (body: SignUpPayload) => {

    const { data } = await axiosInstace.post<string>(
        `/${ENDPOINT.CREATE_NEW_USER}`,
        body
    );

    return data;
}

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

export const deleteUser = async() => {
    const { data } = await axiosInstace.delete<string>(
        `/${ENDPOINT.DELETE_USER}`,
    )

    return data;
}