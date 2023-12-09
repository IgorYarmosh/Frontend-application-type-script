export type LoginType = {
    email: string,
    password: string,
    tokens?: { accessToken: string, refreshToken: string },
    user?: { name: string, lastName: string, id: number },
}