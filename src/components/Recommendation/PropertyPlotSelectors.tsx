import type { PlotResponse } from "@/interfaces/Plot";
import type { PropertyResponse } from "@/interfaces/Property";

import { NativeSelect } from "./RecommendationSelectControls";

type PropertyPlotSelectorsProps = {
  propertyId: string;
  plotId: string;
  properties: PropertyResponse[];
  plots: PlotResponse[];
  loadingProperties: boolean;
  loadingPlots: boolean;
  onPropertyChange: (propertyId: string) => void;
  onPlotChange: (plotId: string) => void;
};

export default function PropertyPlotSelectors({
  propertyId,
  plotId,
  properties,
  plots,
  loadingProperties,
  loadingPlots,
  onPropertyChange,
  onPlotChange,
}: PropertyPlotSelectorsProps) {
  return (
    <>
      <NativeSelect
        value={propertyId}
        onChange={(event) => onPropertyChange(event.target.value)}
        disabled={loadingProperties}
      >
        {loadingProperties ? (
          <option>Carregando...</option>
        ) : (
          <>
            <option value="">Propriedade</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>{property.nome}</option>
            ))}
          </>
        )}
      </NativeSelect>

      <NativeSelect
        value={plotId}
        onChange={(event) => onPlotChange(event.target.value)}
        disabled={!propertyId || loadingPlots}
      >
        {loadingPlots ? (
          <option>Carregando...</option>
        ) : (
          <>
            <option value="">Talhão</option>
            {plots.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.identificacao ?? `Talhão ${plot.id}`}
              </option>
            ))}
          </>
        )}
      </NativeSelect>
    </>
  );
}

