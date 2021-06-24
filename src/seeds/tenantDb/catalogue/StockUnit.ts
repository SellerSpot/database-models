import { IStockUnit } from '../../../models/tenantDb/catalogueModels';

export enum EStockUnits {
    'Kilogram(s)',
    'Litre(s)',
    'Piece(s)',
}

export const defaultStockUnits: IStockUnit[] = Object.keys(EStockUnits).map((stockUnit) => ({
    name: stockUnit,
    isDefault: true,
}));
