import { IButtonInterface } from "./_interfaces"

export interface IModalInterface {
    modalHeader?: IModalHeaderInterface,
    modalFooter?: IModalFooterInterface,
}

export  interface IModalHeaderInterface {
    title?: string,
    hasBtnClose?: boolean,
}

export interface IModalFooterInterface {
    buttons?: [IButtonInterface]
}



