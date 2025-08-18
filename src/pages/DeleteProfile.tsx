import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";

export default function DeleteVerification() {
    const navigate = useNavigate();

    const handleConfirm = (password: string, repeatPassword: string) => {
        // Lógica para verificar as senhas e confirmar a deleção
        console.log("Senha digitada para deleção:", password);
        console.log("Senha repetida para deleção:", repeatPassword);
        // Aqui você adicionaria a lógica para deletar a conta
        // Após a deleção, redireciona para a tela de login
        navigate("/fertintelligence/login");
    };

    const handleCancel = () => {
        // Redireciona de volta para a página home
        navigate("/fertintelligence/home");
    };

    return (
        <PasswordVerification
            subtitle="Confirme a deleção do seu perfil"
            cardHeading="Digite sua senha para confirmar a deleção do seu perfil"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}