import { IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';

export const defaultStockUnits: Partial<IStockUnitDoc>[] = [
    { name: 'Kilogram(s)', isDefault: true },
    { name: 'Litre(s)', isDefault: true },
    { name: 'Piece(s)', isDefault: true },
];
