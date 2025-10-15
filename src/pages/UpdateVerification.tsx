// pages/UpdateVerification.tsx
import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";
import { UpdateUserPayload } from "../interfaces/ServicePayload";
import { useUserStore } from "../stores/user/user.store";
import { updateUser } from "@/services/userService"; // Importa o serviço real de atualização
import { User } from "../interfaces/Models";

// Chave para recuperar os dados temporários
const UPDATE_PROFILE_DATA_KEY = "fertintelligence_update_profile_data";

export default function UpdateVerification() {
    const navigate = useNavigate();
    // REMOVIDO: const toast = useToast();
    const setUser = useUserStore((state) => state.setUser);
    const user = useUserStore((state) => state.user);

    const handleConfirm = async (password: string) => {
        // 1. Recupera os dados salvos
        const profileDataString = sessionStorage.getItem(UPDATE_PROFILE_DATA_KEY);
        sessionStorage.removeItem(UPDATE_PROFILE_DATA_KEY);
        
        if (!profileDataString) {
            // Substituído toast por alert()
            alert("Erro de dados: Dados de perfil não encontrados. Tente novamente.");
            navigate("/fertintelligence/update-profile");
            // Lança um erro para o useMutation
            throw new Error("Dados de perfil não encontrados."); 
        }

        try {
            const newProfileData = JSON.parse(profileDataString);
            
            // 2. Monta o payload completo
            const payload: UpdateUserPayload = {
                // Usamos a senha ATUAL para que o backend a valide.
                novo_nome: newProfileData.novo_login,
                nova_password: password, 
                novo_email: newProfileData.novo_email,
                nova_age: newProfileData.nova_age.toString(),
                id_nova_foto: newProfileData.id_nova_foto
            }
            
            // 3. Chama o serviço de atualização
            await updateUser(payload);

            // 4. Feedback de sucesso
            // Substituído toast por alert()
            alert("Perfil atualizado com sucesso!");

            // 5. Atualiza o estado global do usuário com os novos dados
            if(user) {
                // Tipagem para garantir que 'user' é do tipo User
                const updatedUser: User = { 
                    ...user,
                    login: newProfileData.novo_login,
                    email: newProfileData.novo_email,
                    idade: newProfileData.nova_age,
                    id_foto: newProfileData.id_nova_foto
                };
                setUser(updatedUser);
            }

            // 6. Navega para a home
            navigate("/fertintelligence/home");
        } catch (error: any) {
            console.error("Erro na atualização do perfil:", error);
            // Re-lança o erro para que o useMutation no PasswordVerification possa capturá-lo
            throw error; 
        }
    };

    const handleCancel = () => {
        // Limpa os dados temporários e volta para a página anterior/home
        sessionStorage.removeItem(UPDATE_PROFILE_DATA_KEY);
        navigate("/fertintelligence/home");
    };

    return (
        <PasswordVerification
            subtitle="Confirme as mudanças no perfil"
            cardHeading="Digite sua senha atual para confirmar as mudanças no perfil"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}