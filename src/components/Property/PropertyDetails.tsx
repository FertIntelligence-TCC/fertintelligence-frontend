import { useState } from "react";
import { Heading, Text, VStack, Separator, Box, useDisclosure } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { LatitudeDirection, LongitudeDirection } from "@/interfaces/ServicePayload";
import { PropertyResponse } from "@/interfaces/ServiceResponse";
import { getPlotsByProperty } from "@/services/plotService";
import PlotList from "@/components/Plot/PlotList";
import PlotDetailsDialog from "@/components/Plot/PlotDetailsDialog";
import { PlotResponse } from "@/interfaces/Plot";

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

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
    const viewPlotDisclosure = useDisclosure();
    const [selectedPlot, setSelectedPlot] = useState<PlotResponse | null>(null);

    // Buscar talhões para visualização
    const { data: plots = [] } = useQuery({
        queryKey: ["plots", property?.id],
        queryFn: () => property ? getPlotsByProperty(property.id) : Promise.resolve([]),
        enabled: !!property
    });

    const handleViewPlot = (plot: PlotResponse) => {
        setSelectedPlot(plot);
        viewPlotDisclosure.onOpen();
    };

    return (
        <>
            <Heading as="h2" size="md" mb={4}>Detalhes da Propriedade:</Heading>
            {property ? (
                <VStack align="start" gap={3} w="full">
                    <Text><Text as="span" fontWeight="bold">Nome:</Text> {property.nome}</Text>
                    <Text><Text as="span" fontWeight="bold">Endereço:</Text> {property.endereco}</Text>
                    <Text><Text as="span" fontWeight="bold">CNPJ:</Text> {property.cnpj}</Text>
                    <Text>
                        <Text as="span" fontWeight="bold">Latitude:</Text>{" "}
                        {formatCoordinate(property.localizacao?.latitude, property.localizacao?.latitudeDirection)}
                    </Text>
                    <Text>
                        <Text as="span" fontWeight="bold">Longitude:</Text>{" "}
                        {formatCoordinate(property.localizacao?.longitude, property.localizacao?.longitudeDirection)}
                    </Text>
                    <Text>
                        <Text as="span" fontWeight="bold">Altitude:</Text> {property.localizacao?.altitude ?? "-"} m
                    </Text>

                    <Separator my={2} />

                    <Box w="full">
                        <Heading as="h4" size="sm" color="gray.600" mb={2}>Talhões</Heading>
                        <PlotList 
                            plots={plots} 
                            mode="view" 
                            onView={handleViewPlot}
                        />
                    </Box>
                </VStack>
            ) : (
                <Text>Selecione uma propriedade para visualizar.</Text>
            )}

            <PlotDetailsDialog 
                isOpen={viewPlotDisclosure.open}
                onClose={viewPlotDisclosure.onClose}
                plot={selectedPlot}
            />
        </>
    );
};

export default PropertyDetails;