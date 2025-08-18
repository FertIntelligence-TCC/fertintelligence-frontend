import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";

export default function UpdatePassword() {
    const navigate = useNavigate();

    const handleConfirm = (password: string, repeatPassword: string) => {
        // Lógica para verificar as senhas e confirmar a alteração
        console.log("Senha digitada para atualização:", password);
        console.log("Senha repetida para atualização:", repeatPassword);
        navigate("/fertintelligence/change-password");
    };

    const handleCancel = () => {
        // Redireciona de volta para a página anterior ou home
        navigate("/fertintelligence/home");
    };

    return (
        <PasswordVerification
            subtitle="Confirme sua senha atual"
            cardHeading="Digite sua senha para confirmar sua senha atual"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}