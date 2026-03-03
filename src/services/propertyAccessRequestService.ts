import { api } from './axios';
import { 
  PropertyAccessRequestCreate, 
  PropertyAccessRequestDecision, 
  PropertyAccessRequestResponse 
} from '../interfaces/PropertyAccessRequest';
import { PropertyResponse } from '../interfaces/Property';

const BASE_URL = '/property-access';

export const propertyAccessRequestService = {
  
  /**
   * Cria um pedido de acesso à propriedade (Utilizado pelo visitante/não-proprietário)
   * Corresponde a: POST /property-access/request
   */
  createRequest: async (data: PropertyAccessRequestCreate): Promise<PropertyAccessRequestResponse> => {
    const response = await api.post<PropertyAccessRequestResponse>(`${BASE_URL}/request`, data);
    return response.data;
  },

  /**
   * Busca todas as solicitações associadas a uma propriedade específica.
   * Corresponde a: GET /property-access/requests?propertyId={propertyId}
   */
  getRequestsByProperty: async (propertyId: number): Promise<PropertyAccessRequestResponse[]> => {
    const response = await api.get<PropertyAccessRequestResponse[]>(`${BASE_URL}/requests`, {
      params: { propertyId }
    });
    return response.data;
  },

  /**
   * Aceita ou recusa um pedido pendente, ou expulsa um usuário aceito (Utilizado pelo proprietário)
   * Corresponde a: POST /property-access/{requestId}/decision
   */
  decideRequest: async (requestId: number, data: PropertyAccessRequestDecision): Promise<PropertyAccessRequestResponse> => {
    const response = await api.post<PropertyAccessRequestResponse>(`${BASE_URL}/${requestId}/decision`, data);
    return response.data;
  },

  /**
   * Busca as propriedades em que o usuário logado (visitante) possui entrada aceita.
   * Corresponde a: GET /property-access/my-approved-properties
   */
  getMyApprovedProperties: async (): Promise<PropertyResponse[]> => {
    const response = await api.get<PropertyResponse[]>(`${BASE_URL}/my-approved-properties`);
    return response.data;
  }
};