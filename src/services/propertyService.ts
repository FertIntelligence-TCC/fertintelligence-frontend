// src/services/propertyService.ts
import { api } from "./axios";
import { ENDPOINT } from "@/constants/Endpoint";
import type {
  PropertyCreatePayload,
  PropertyUpdatePayload,
  PropertyResponse,
} from "@/interfaces/Property";

export async function fetchMyProperties(): Promise<PropertyResponse[]> {
  const response = await api.get<PropertyResponse[]>(ENDPOINT.GET_MY_PROPERTIES);
  return response.data;
}

export async function createProperty(payload: PropertyCreatePayload): Promise<PropertyResponse> {
  const response = await api.post<PropertyResponse>(ENDPOINT.CREATE_PROPERTY, payload);
  return response.data;
}

export async function updateProperty(propertyId: number, payload: PropertyUpdatePayload): Promise<PropertyResponse> {
  const response = await api.put<PropertyResponse>(
    ENDPOINT.UPDATE_PROPERTY,
    payload,
    { params: { propertyId } }
  );
  return response.data;
}

export async function deleteProperty(propertyId: number): Promise<void> {
  await api.delete(ENDPOINT.DELETE_PROPERTY, { params: { propertyId } });
}

export async function getPropertyById(propertyId: number): Promise<PropertyResponse> {
  const response = await api.get<PropertyResponse>(ENDPOINT.GET_PROPERTY_BY_ID, { params: { propertyId } });
  return response.data;
}

export async function searchPropertiesByName(nome: string): Promise<PropertyResponse[]> {
  const response = await api.get<PropertyResponse[]>(ENDPOINT.SEARCH_PROPERTIES, { 
    params: { nome } 
  });
  return response.data;
}

export async function fetchManageableProperties(): Promise<PropertyResponse[]> {
  const response = await api.get<PropertyResponse[]>(ENDPOINT.GET_MANAGEABLE_PROPERTIES);
  return response.data;
}