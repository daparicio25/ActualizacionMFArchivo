export interface meditionsNewModel {
  _id: string;
  effectiveDateTime?:string;
  subject:string;
  code?: Icode;
  valueQuantity?: IvalueQuantity;
  deviceName?: IdeviceName;
}

interface Icode {
  text?:string;
}

interface IvalueQuantity {
  value?: number;
  unit?: string;
}

interface IdeviceName {
  name?: string;
}
