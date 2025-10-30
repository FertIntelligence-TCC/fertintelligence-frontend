import { Heading, Text, VStack } from "@chakra-ui/react";
import { LatitudeDirection, LongitudeDirection } from "@/interfaces/ServicePayload";
import { PropertyResponse } from "@/interfaces/ServiceResponse";

const DIRECTION_LABEL: Record<LatitudeDirection | LongitudeDirection, string> = {
    [LatitudeDirection.NORTE]: "Norte",
    [LatitudeDirection.SUL]: "Sul",
    [LongitudeDirection.LESTE]: "Leste",
    [LongitudeDirection.OESTE]: "Oeste",
};

const formatCoordinate = (
    value?: number | null,
    direction?: LatitudeDirection | LongitudeDirection,
) => {
    if (value === undefined || value === null || direction === undefined) {
        return "-";
    }

    const directionLabel = DIRECTION_LABEL[direction] ?? direction;
    return `${value}° ${directionLabel}`;
};

type PropertyDetailsProps = {
    property: PropertyResponse | null;
};

const PropertyDetails = ({ property }: PropertyDetailsProps) => (
    <>
        <Heading as="h2" size="md" mb={4}>
            Detalhes da Propriedade:
        </Heading>
        {property ? (
            <VStack align="start" gap={3}>
                <Text>
                    <Text as="span" fontWeight="bold">
                        Nome:
                    </Text>{" "}
                    {property.nome}
                </Text>
                <Text>
                    <Text as="span" fontWeight="bold">
                        Endereço:
                    </Text>{" "}
                    {property.endereco}
                </Text>
                <Text>
                    <Text as="span" fontWeight="bold">
                        CNPJ:
                    </Text>{" "}
                    {property.cnpj}
                </Text>
                <Text>
                    <Text as="span" fontWeight="bold">
                        Latitude:
                    </Text>{" "}
                    {formatCoordinate(
                        property.localizacao?.latitude,
                        property.localizacao?.latitudeDirection,
                    )}
                </Text>
                <Text>
                    <Text as="span" fontWeight="bold">
                        Longitude:
                    </Text>{" "}
                    {formatCoordinate(
                        property.localizacao?.longitude,
                        property.localizacao?.longitudeDirection,
                    )}
                </Text>
                <Text>
                    <Text as="span" fontWeight="bold">
                        Altitude, em metros:
                    </Text>{" "}
                    {property.localizacao?.altitude ?? "-"}
                </Text>
            </VStack>
        ) : (
            <Text>Selecione uma propriedade para visualizar.</Text>
        )}
    </>
);

export default PropertyDetails;