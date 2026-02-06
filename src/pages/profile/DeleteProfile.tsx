import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";
import { deleteUser } from "@/services/userService"; // Importar o serviço
import { useUserStore } from "../../stores/user/user.store"; // Importar o store

export default function DeleteVerification() {
    const navigate = useNavigate();
    const setUser = useUserStore((state) => state.setUser); // Ação para limpar o estado

    // Deve ser uma função assíncrona que retorna uma Promise para o useMutation
    const handleConfirm = async (password: string): Promise<void> => {
        // Nota: O backend deleta o usuário logado via JWT, mas a senha é usada aqui para verificação.

        try {
            // 1. Chama o serviço de deleção (que foi refatorado para retornar void)
            await deleteUser();

            // 2. Limpa o token do armazenamento
            sessionStorage.removeItem("fertintelligenceToken");

            // 3. Limpa o estado global do usuário
            setUser(undefined);

            // 4. Redireciona para o login
            alert("Sua conta foi deletada com sucesso.");
            navigate("/fertintelligence/"); 
            
        } catch (error: any) {
            console.error("Erro ao deletar usuário:", error);
            // Re-lança o erro para ser tratado pelo onError do useMutation
            throw error; 
        }
    };

    const handleCancel = () => {
        // Redireciona de volta para a página home
        navigate("/fertintelligence/home");
    };

    return (
        <PasswordVerification
            subtitle="Confirme a deleção do seu perfil"
            cardHeading="Digite sua senha para confirmar a deleção do seu perfil"
            onConfirm={handleConfirm as any} // 'as any' é usado para evitar erro de tipagem no password/repeatPassword
            onCancel={handleCancel}
        />
    );
}