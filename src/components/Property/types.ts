import { LatitudeDirection, LongitudeDirection } from "@/interfaces/Property";
import { PropertyResponse } from "@/interfaces/Property";

export type PropertyFormState = {
    nome: string;
    endereco: string;
    cnpj: string;
    latitude: string;
    latitudeDirection: LatitudeDirection;
    longitude: string;
    longitudeDirection: LongitudeDirection;
    altitude: string;
};

export const DEFAULT_FORM_STATE: PropertyFormState = {
    nome: "",
    endereco: "",
    cnpj: "",
    latitude: "",
    latitudeDirection: LatitudeDirection.NORTE,
    longitude: "",
    longitudeDirection: LongitudeDirection.LESTE,
    altitude: "",
};

export const propertyToFormState = (
    property: PropertyResponse,
): PropertyFormState => ({
    nome: property.nome ?? "",
    endereco: property.endereco ?? "",
    cnpj: property.cnpj ?? "",
    latitude:
        property.localizacao?.latitude !== undefined
            ? String(property.localizacao.latitude)
            : "",
    latitudeDirection:
        property.localizacao?.latitudeDirection ?? LatitudeDirection.NORTE,
    longitude:
        property.localizacao?.longitude !== undefined
            ? String(property.localizacao.longitude)
            : "",
    longitudeDirection:
        property.localizacao?.longitudeDirection ?? LongitudeDirection.LESTE,
    altitude:
        property.localizacao?.altitude !== undefined &&
        property.localizacao?.altitude !== null
            ? String(property.localizacao.altitude)
            : "",
});
