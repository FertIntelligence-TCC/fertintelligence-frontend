import { api } from './axios';
import { ENDPOINT } from '../constants/Endpoint';
import {
    PropertyCreatePayload,
    PropertyUpdatePayload
} from '../interfaces/ServicePayload'; // Ajuste o caminho
import {
    PropertyResponse
} from '../interfaces/ServiceResponse';

export const fetchMyProperties = async (): Promise<PropertyResponse[]> => {
    try {
        const response = await api.get<PropertyResponse[]>(ENDPOINT.GET_MY_PROPERTIES);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao buscar propriedades:", error.response?.data || error.message);
        throw error;
    }
};

export const createProperty = async (payload: PropertyCreatePayload): Promise<PropertyResponse> => {
    try {
        const response = await api.post<PropertyResponse>(ENDPOINT.CREATE_PROPERTY, payload);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao criar propriedade:", error.response?.data || error.message);
        throw error;
    }
};

export const updateProperty = async (id: number, payload: PropertyUpdatePayload): Promise<PropertyResponse> => {
    try {
        const url = `${ENDPOINT.UPDATE_PROPERTY}?propertyId=${id}`;
        const response = await api.put<PropertyResponse>(url, payload);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao atualizar propriedade:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteProperty = async (id: number): Promise<void> => {
    try {
        const url = `${ENDPOINT.DELETE_PROPERTY}?propertyId=${id}`;
        await api.delete(url);
    } catch (error: any) {
        console.error("Erro ao deletar propriedade:", error.response?.data || error.message);
        throw error;
    }
};

export const getPropertyById = async (id: number): Promise<PropertyResponse> => {
    try {
        const url = `${ENDPOINT.GET_PROPERTY_BY_ID}?propertyId=${id}`;
        const response = await api.get<PropertyResponse>(url);
        return response.data;
    } catch (error: any) {
        console.error(`Erro ao buscar propriedade ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const fetchApprovedProperties = async (): Promise<PropertyResponse[]> => {
    try {
        const response = await api.get<PropertyResponse[]>(ENDPOINT.GET_APPROVED_REQUESTS_BY_USER);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao buscar propriedades aprovadas:", error.response?.data || error.message);
        throw error;
    }
};