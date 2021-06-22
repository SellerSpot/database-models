import { IStockUnit } from '../../../models/tenantDb/catalogueModels';

const stockUnits: string[] = ['Kilogram(s)', 'Litre(s)', 'Piece(s)'];

export const defaultStockUnits: IStockUnit[] = stockUnits.map((stockUnit) => ({
    name: stockUnit,
    isDefault: true,
}));
