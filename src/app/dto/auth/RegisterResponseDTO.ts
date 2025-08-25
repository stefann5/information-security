export interface RegisterResponseDto {
    id: number,
    message:string,
    username: string;
    name: string;
    surname: string;
    organization: string;
    accessToken: string,
    refreshToken: string
}