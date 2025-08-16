export type SignUpPayload = {
    login: string;
    email: string;
    idade: number;
    senha: string;
    id_foto: string;
};

export type SignInPayload = {
    login: string;
    senha: string;
};

export type UpdateUserPayload = {
    nova_senha: string,
    novo_email: string,
    nova_idade: string,
    id_nova_foto: string
}