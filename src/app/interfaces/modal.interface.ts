import { IButtonInterface } from "./_interfaces"

export interface IModalInterface {
    modalHeader?: IModalHeaderInterface,
    modalBody?: IModalBodyInterface,
    modalFooter?: IModalFooterInterface,
}

export  interface IModalHeaderInterface {
    title?: string,
    hasBtnClose?: boolean,
}

export interface IModalBodyInterface {
    template?: string,
}

export interface IModalFooterInterface {
    buttons?: [IButtonInterface]
}



