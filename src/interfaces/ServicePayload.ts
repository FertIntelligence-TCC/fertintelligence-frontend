export type SignUpPayload = {
    name: string;
    email: string;
    age: number;
    password: string;
    id_foto: string;
};

export type SignInPayload = {
    username: string;
    password: string;
};

export type UpdateUserPayload = {
    novo_nome: string,
    nova_password: string,
    novo_email: string,
    nova_age: string,
    id_nova_foto: string
}