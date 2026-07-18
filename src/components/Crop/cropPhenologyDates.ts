export type CropPhenologyDates = {
  planting: string;
  emergence: string;
  buttoning: string;
  flowering: string;
  harvest: string;
};

export const calculateHarvestDate = (planting: string, cycle: string | number): string => {
  const days = Number(cycle);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(planting) || !Number.isInteger(days) || days <= 0) return "";
  const [year, month, day] = planting.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear().toString().padStart(4, "0")}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
};

export const clearInvalidLaterDates = (dates: CropPhenologyDates): CropPhenologyDates => {
  const next = { ...dates };
  if (next.emergence && next.planting && next.emergence < next.planting) next.emergence = "";
  const buttoningMinimum = next.emergence || next.planting;
  if (next.buttoning && buttoningMinimum && next.buttoning < buttoningMinimum) next.buttoning = "";
  const floweringMinimum = next.buttoning || next.emergence || next.planting;
  if (next.flowering && floweringMinimum && next.flowering < floweringMinimum) next.flowering = "";
  const harvestMinimum = next.flowering || next.buttoning || next.emergence || next.planting;
  if (next.harvest && harvestMinimum && next.harvest < harvestMinimum) next.harvest = "";
  return next;
};

export const validatePhenologyDates = (dates: CropPhenologyDates): string | null => {
  if (dates.emergence && dates.planting && dates.emergence < dates.planting) return "A data de emergência não pode ser anterior à data de plantio.";
  const buttoningMinimum = dates.emergence || dates.planting;
  if (dates.buttoning && buttoningMinimum && dates.buttoning < buttoningMinimum) return `A data de abotoamento não pode ser anterior à data de ${dates.emergence ? "emergência" : "plantio"}.`;
  const floweringMinimum = dates.buttoning || dates.emergence || dates.planting;
  const floweringMinimumName = dates.buttoning ? "abotoamento" : dates.emergence ? "emergência" : "plantio";
  if (dates.flowering && floweringMinimum && dates.flowering < floweringMinimum) return `A data de florescimento não pode ser anterior à data de ${floweringMinimumName}.`;
  const harvestMinimum = dates.flowering || dates.buttoning || dates.emergence || dates.planting;
  if (dates.harvest && harvestMinimum && dates.harvest < harvestMinimum) return "A data de colheita não pode ser anterior à última fase fenológica informada.";
  return null;
};
