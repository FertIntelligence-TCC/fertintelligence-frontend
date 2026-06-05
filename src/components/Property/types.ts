import { LatitudeDirection, LongitudeDirection } from "@/interfaces/Property";
import { PropertyResponse } from "@/interfaces/Property";

export type PropertyFormState = {
    nome: string;
    endereco: string;
    cnpj: string;
    latitudeDegrees: string;
    latitudeMinutes: string;
    latitudeSeconds: string;
    latitudeDirection: LatitudeDirection;
    longitudeDegrees: string;
    longitudeMinutes: string;
    longitudeSeconds: string;
    longitudeDirection: LongitudeDirection;
    altitude: string;
    idfoto: string;
};

export const DEFAULT_FORM_STATE: PropertyFormState = {
    nome: "",
    endereco: "",
    cnpj: "",
    latitudeDegrees: "",
    latitudeMinutes: "",
    latitudeSeconds: "",
    latitudeDirection: LatitudeDirection.NORTE,
    longitudeDegrees: "",
    longitudeMinutes: "",
    longitudeSeconds: "",
    longitudeDirection: LongitudeDirection.LESTE,
    altitude: "",
    idfoto: "",
};

export const decimalToDms = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return { degrees: "", minutes: "", seconds: "" };
    }

    const absoluteValue = Math.abs(value);
    const degrees = Math.floor(absoluteValue);
    const minutesFloat = (absoluteValue - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Number(((minutesFloat - minutes) * 60).toFixed(2));

    return {
        degrees: String(degrees),
        minutes: String(minutes),
        seconds: String(seconds),
    };
};

export const dmsToDecimal = (
    degrees: string,
    minutes: string,
    seconds: string,
) => {
    const parsedDegrees = parseFloat(degrees);
    const parsedMinutes = parseFloat(minutes);
    const parsedSeconds = parseFloat(seconds);

    if (
        Number.isNaN(parsedDegrees) ||
        Number.isNaN(parsedMinutes) ||
        Number.isNaN(parsedSeconds)
    ) {
        return 0;
    }

    return parsedDegrees + parsedMinutes / 60 + parsedSeconds / 3600;
};

export const propertyToFormState = (
    property: PropertyResponse,
): PropertyFormState => {
    const latitude = decimalToDms(property.localizacao?.latitude);
    const longitude = decimalToDms(property.localizacao?.longitude);

    return {
        nome: property.nome ?? "",
        endereco: property.endereco ?? "",
        cnpj: (property.cnpj ?? "").replace(/\D/g, ""),
        latitudeDegrees: latitude.degrees,
        latitudeMinutes: latitude.minutes,
        latitudeSeconds: latitude.seconds,
        latitudeDirection:
            property.localizacao?.latitudeDirection ?? LatitudeDirection.NORTE,
        longitudeDegrees: longitude.degrees,
        longitudeMinutes: longitude.minutes,
        longitudeSeconds: longitude.seconds,
        longitudeDirection:
            property.localizacao?.longitudeDirection ?? LongitudeDirection.LESTE,
        altitude:
            property.localizacao?.altitude !== undefined &&
            property.localizacao?.altitude !== null
                ? String(property.localizacao.altitude)
                : "",
        idfoto: property.idfoto ?? "",
    };
};
