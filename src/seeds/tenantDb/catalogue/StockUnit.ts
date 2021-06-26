import { IStockUnit } from '../../../models/tenantDb/catalogueModels';

export const defaultStockUnits: IStockUnit[] = [
    { name: 'Kilogram(s)', isDefault: true },
    { name: 'Litre(s)', isDefault: true },
    { name: 'Piece(s)', isDefault: true },
];
