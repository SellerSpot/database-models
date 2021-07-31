import { IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';

export const defaultStockUnits: Pick<IStockUnitDoc, 'name' | 'unit' | 'isDefault'>[] = [
    { name: 'Kilogram(s)', unit: 'kg(s)', isDefault: true },
    { name: 'Litre(s)', unit: 'ltr(s)', isDefault: true },
    { name: 'Piece(s)', unit: 'pcs(s)', isDefault: true },
];
