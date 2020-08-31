import { AxiosRequestConfig } from 'axios';

export interface CRUDConfig<T = any> {
    url?: string;
    data?: Partial<T>;
    params?: Partial<T>;
    config?: AxiosRequestConfig;
}