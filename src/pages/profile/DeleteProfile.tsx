import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";
import { deleteUser } from "@/services/userService";
import { useUserStore } from "../../stores/user/user.store";

export default function DeleteVerification() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleConfirm = async (password: string, repeatPassword?: string): Promise<void> => {
    void password;
    void repeatPassword;

    await deleteUser();

    sessionStorage.removeItem("fertintelligenceToken");
    setUser(undefined);
    alert("Sua conta foi deletada com sucesso.");
    navigate("/fertintelligence/");
  };

  const handleCancel = () => {
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
