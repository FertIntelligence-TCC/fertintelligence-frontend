type NpkValues = {
    n?: number;
    p?: number;
    k?: number;
};

export const formatNpkRelationValue = (value: number): string => {
    if (!Number.isFinite(value)) return "0";
    return Number(value.toFixed(2)).toString();
};

export const calculateNpkRelation = ({ n = 0, p = 0, k = 0 }: NpkValues): Required<NpkValues> => {
    const values = [n, p, k].filter((value) => value > 0);
    const minValue = values.length > 0 ? Math.min(...values) : 1;

    return {
        n: n > 0 ? Number(formatNpkRelationValue(n / minValue)) : 0,
        p: p > 0 ? Number(formatNpkRelationValue(p / minValue)) : 0,
        k: k > 0 ? Number(formatNpkRelationValue(k / minValue)) : 0,
    };
};

export const formatNpkRelation = ({ n = 0, p = 0, k = 0 }: NpkValues): Required<Record<keyof NpkValues, string>> => ({
    n: formatNpkRelationValue(n),
    p: formatNpkRelationValue(p),
    k: formatNpkRelationValue(k),
});
