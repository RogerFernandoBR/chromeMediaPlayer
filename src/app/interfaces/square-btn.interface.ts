import { IIconInterface } from "./_interfaces";

export interface ISquareBtnInterface {
    label: string,
    action: () => void,
    icon: IIconInterface,
}