export const formatNpkValue = (value?: number | string | null): string => {
    const numericValue = typeof value === "string" ? Number(value) : value;

    if (numericValue === null || numericValue === undefined || Number.isNaN(numericValue)) {
        return "0";
    }

    return String(Number(numericValue.toFixed(2)));
};
