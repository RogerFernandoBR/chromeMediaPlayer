export interface IInputInterface {
    label: string,
    type: string,
    id?: string,
    action: () => void,
    disabled?: boolean,
}