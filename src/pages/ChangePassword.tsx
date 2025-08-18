import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";

export default function ChangePassword() {
    const navigate = useNavigate();

    const handleConfirm = (password: string, repeatPassword: string) => {
        // Lógica para verificar as senhas e confirmar a alteração
        console.log("Senha digitada para atualização:", password);
        console.log("Senha repetida para atualização:", repeatPassword);
        navigate("/fertintelligence/home");
    };

    const handleCancel = () => {
        // Redireciona de volta para a página anterior ou home
        navigate("/fertintelligence/home");
    };

    return (
        <PasswordVerification
            subtitle="Mude sua senha"
            cardHeading="Digite sua nova senha nos campos abaixo"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}