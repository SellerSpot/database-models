import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';

export const defaultOutlet: Pick<IOutletDoc, 'name' | 'address' | 'default'> = {
    name: 'Main Outlet',
    address: '12 A, New Raja Colony, Bheemanagar, Balajinagar, Trichy 1',
    default: true,
};
