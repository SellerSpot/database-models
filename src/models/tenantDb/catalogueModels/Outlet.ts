import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';

const OutletSchema = new Schema(
    {
        name: Schema.Types.String,
        address: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IOutlet extends Document {
    name: string;
    address: string;
}

export const OutletModel = model<IOutlet>(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET, OutletSchema);
