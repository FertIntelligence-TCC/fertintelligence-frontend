import { ENDPOINT } from "@/constants/Endpoint";
import { api } from './axios';
import { 
  PropertyAccessRequestCreate, 
  PropertyAccessRequestDecision, 
  PropertyAccessRequestResponse 
} from '../interfaces/PropertyAccessRequest';
import { PropertyResponse } from '../interfaces/Property';


export const propertyAccessRequestService = {
  
  /**
   * Cria um pedido de acesso à propriedade (Utilizado pelo visitante/não-proprietário)
   * Corresponde a: POST /property-access/request
   */
  createRequest: async (data: PropertyAccessRequestCreate): Promise<PropertyAccessRequestResponse> => {
    const response = await api.post<PropertyAccessRequestResponse>(ENDPOINT.CREATE_PROPERTY_ACCESS_REQUEST, data);
    return response.data;
  },

  /**
   * Busca todas as solicitações associadas a uma propriedade específica.
   * Corresponde a: GET /property-access/requests?propertyId={propertyId}
   */
  getRequestsByProperty: async (propertyId: number): Promise<PropertyAccessRequestResponse[]> => {
    const response = await api.get<PropertyAccessRequestResponse[]>(ENDPOINT.GET_REQUESTS_FOR_PROPERTY, {
      params: { propertyId }
    });
    return response.data;
  },

  /**
   * Aceita ou recusa um pedido pendente, ou expulsa um usuário aceito (Utilizado pelo proprietário)
   * Corresponde a: POST /property-access/{requestId}/decision
   */
  decideRequest: async (requestId: number, data: PropertyAccessRequestDecision): Promise<PropertyAccessRequestResponse> => {
    const response = await api.post<PropertyAccessRequestResponse>(ENDPOINT.DECIDE_PROPERTY_ACCESS_REQUEST.replace("{requestId}", String(requestId)), data);
    return response.data;
  },

  /**
   * Busca as propriedades em que o usuário logado (visitante) possui entrada aceita.
   * Corresponde a: GET /property-access/my-approved-properties
   */
  getMyApprovedProperties: async (): Promise<PropertyResponse[]> => {
    const response = await api.get<PropertyResponse[]>(ENDPOINT.GET_APPROVED_REQUESTS_BY_USER);
    return response.data;
  },

  /**
   * Desvincula o usuário logado de uma propriedade.
   * Corresponde a: DELETE /property-access/leave?propertyId={propertyId}
   */
  leaveProperty: async (propertyId: number): Promise<void> => {
    await api.delete(ENDPOINT.LEAVE_PROPERTY_ACCESS_REQUEST, {
      params: { propertyId },
    });
  }

};
